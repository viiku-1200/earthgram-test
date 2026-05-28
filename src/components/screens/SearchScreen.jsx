import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ALL_SEARCHABLE_PROVIDERS } from '../../data/constants';
import { SearchTrie, MinHeap } from '../../utils/dsa';

const AVATAR_GRADIENTS = ['from-indigo-500 to-purple-600', 'from-pink-500 to-rose-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-blue-500 to-cyan-600'];

// Keyword synonym map — maps common voice search words to matching categories/subs
const KEYWORD_SYNONYMS = {
  'staff': ['maid', 'cook', 'driver', 'clean', 'home cleaning', 'helper'],
  'helper': ['maid', 'cook', 'plumber', 'electrician', 'driver', 'clean'],
  'servant': ['maid', 'cook', 'driver', 'clean'],
  'worker': ['maid', 'plumber', 'electrician', 'clean', 'cook'],
  'repair': ['ac repair', 'fridge repair', 'electrician', 'plumber'],
  'fix': ['ac repair', 'fridge repair', 'electrician', 'plumber'],
  'teacher': ['tutor', 'music tutor', 'math'],
  'doctor': ['healthcare', 'doctor'],
  'lawyer': ['legal'],
  'beauty': ['makeup artist', 'beautician', 'facial'],
  'party': ['event planner', 'dj', 'birthday', 'wedding planner'],
  'wedding': ['wedding planner', 'event planner', 'makeup artist'],
  'food': ['cook', 'tiffin'],
  'home': ['maid', 'home cleaning', 'clean', 'cook'],
  'music': ['music tutor', 'dj'],
  'tech': ['consultancy', 'software'],
  'tax': ['consultancy', 'ca'],
  'account': ['consultancy', 'ca'],
  'car': ['driver'],
  'transport': ['driver'],
  'cold': ['ac repair', 'fridge repair'],
  'salon': ['beautician', 'makeup artist', 'facial'],
  'need': [],
  'want': [],
  'find': [],
  'get': [],
  'i': [],
  'a': [],
  'the': [],
  'me': [],
  'please': [],
  'can': [],
  'you': [],
};

// Initialize Global Search Trie (DSA Integration)
const searchTrie = new SearchTrie();
ALL_SEARCHABLE_PROVIDERS.forEach(p => {
  searchTrie.insert(p.name, p);
  searchTrie.insert(p.category, p);
  searchTrie.insert(p.sub, p);
});

// Smart search function — used by both text and voice search in real time
const smartSearch = (rawQuery, customProviders = [], filterAvailable = false, sortBy = 'relevance') => {
  if (!rawQuery || !rawQuery.trim()) return [];
  const q = rawQuery.trim().toLowerCase();

  // 1. Trie prefix match (fastest)
  let filtered = searchTrie.search(q);

  // 2. If Trie found nothing, try substring match across ALL providers
  if (filtered.length === 0) {
    const allProviders = [...customProviders, ...ALL_SEARCHABLE_PROVIDERS];
    filtered = allProviders.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.sub && p.sub.toLowerCase().includes(q))
    );
  }

  // 3. If still nothing, try each word individually (for multi-word voice queries like "I need a plumber")
  if (filtered.length === 0) {
    const words = q.split(/\s+/).filter(w => w.length > 1);
    const allProviders = [...customProviders, ...ALL_SEARCHABLE_PROVIDERS];

    // Try each word as a prefix in the Trie
    for (const word of words) {
      if (KEYWORD_SYNONYMS[word] && KEYWORD_SYNONYMS[word].length === 0) continue; // skip stop words
      const trieResults = searchTrie.search(word);
      if (trieResults.length > 0) {
        const seenIds = new Set(filtered.map(p => p.id));
        trieResults.forEach(p => { if (!seenIds.has(p.id)) { filtered.push(p); seenIds.add(p.id); } });
      }
    }

    // Also try substring for each word
    if (filtered.length === 0) {
      for (const word of words) {
        if (KEYWORD_SYNONYMS[word] && KEYWORD_SYNONYMS[word].length === 0) continue;
        const subResults = allProviders.filter(p =>
          p.name.toLowerCase().includes(word) ||
          p.category.toLowerCase().includes(word) ||
          (p.sub && p.sub.toLowerCase().includes(word))
        );
        const seenIds = new Set(filtered.map(p => p.id));
        subResults.forEach(p => { if (!seenIds.has(p.id)) { filtered.push(p); seenIds.add(p.id); } });
      }
    }
  }

  // 4. Synonym matching as last resort
  if (filtered.length === 0) {
    const words = q.split(/\s+/);
    const synonymTargets = new Set();
    words.forEach(word => {
      const syns = KEYWORD_SYNONYMS[word];
      if (syns && syns.length > 0) syns.forEach(s => synonymTargets.add(s));
    });

    if (synonymTargets.size > 0) {
      const allProviders = [...customProviders, ...ALL_SEARCHABLE_PROVIDERS];
      filtered = allProviders.filter(p => {
        const name = p.name.toLowerCase();
        const cat = p.category.toLowerCase();
        const sub = (p.sub || '').toLowerCase();
        for (const target of synonymTargets) {
          if (name.includes(target) || cat.includes(target) || sub.includes(target)) return true;
        }
        return false;
      });
    }
  }

  // 5. Merge in custom provider matches (dedup)
  const customMatches = customProviders.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    (p.sub && p.sub.toLowerCase().includes(q))
  );
  const seenIds = new Set(filtered.map(p => p.id));
  customMatches.forEach(cp => {
    if (!seenIds.has(cp.id)) filtered.unshift(cp);
  });

  // 6. Apply filters
  if (filterAvailable) filtered = filtered.filter(p => p.available);

  // 7. Apply sorting via MinHeap
  if (sortBy !== 'relevance') {
    const heap = new MinHeap((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance);
      if (sortBy === 'reviews') return b.reviews - a.reviews;
      return 0;
    });
    filtered.forEach(p => heap.push(p));
    return heap.getSorted();
  }

  return filtered;
};

// Generate autocomplete suggestions from provider data
const getAutocompleteSuggestions = (q) => {
  if (!q || q.length < 1) return [];
  const lower = q.toLowerCase();
  const suggestions = new Set();

  ALL_SEARCHABLE_PROVIDERS.forEach(p => {
    if (p.name.toLowerCase().startsWith(lower)) suggestions.add(p.name);
    if (p.category.toLowerCase().startsWith(lower)) suggestions.add(p.category);
    if (p.sub && p.sub.toLowerCase().startsWith(lower)) suggestions.add(p.sub);
  });

  // Also add synonym keys that match
  Object.keys(KEYWORD_SYNONYMS).forEach(key => {
    if (key.startsWith(lower) && KEYWORD_SYNONYMS[key].length > 0) {
      suggestions.add(key.charAt(0).toUpperCase() + key.slice(1));
    }
  });

  return Array.from(suggestions).slice(0, 5);
};

const SearchScreen = ({ isDarkMode, onClose, customProviders = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  // Real-time search results — updates instantly on every keystroke or voice transcript change
  const results = useMemo(() => {
    return smartSearch(query, customProviders, filterAvailable, sortBy);
  }, [query, sortBy, filterAvailable, customProviders]);

  // Autocomplete suggestions — updates as you type
  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 1) return [];
    return getAutocompleteSuggestions(query);
  }, [query]);

  // Handle text input change — real-time
  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    setQuery(val);
    setShowSuggestions(val.length > 0);
  }, []);

  // Select a suggestion
  const selectSuggestion = useCallback((s) => {
    setQuery(s);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, []);

  // ========== VOICE SEARCH (Real-Time) ==========
  const handleVoiceSearch = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;   // CRITICAL: enables real-time transcription
    recognition.continuous = true;       // CRITICAL: keeps listening until manually stopped
    recognition.maxAlternatives = 3;     // More alternatives = better accuracy

    recognition.onstart = () => {
      setVoiceText('');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = 0; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Show what user is saying in real time
      const liveText = finalTranscript || interimTranscript;
      const cleaned = liveText.replace(/[.?!,]/g, '').trim();

      if (cleaned) {
        setVoiceText(cleaned);
        // UPDATE SEARCH QUERY IN REAL TIME — results will auto-update via useMemo
        setQuery(cleaned);
      }
    };

    recognition.onerror = (event) => {
      console.error('Voice search error:', event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // If still supposed to be listening (continuous mode ended unexpectedly), restart
      if (recognitionRef.current && isListening) {
        try {
          recognition.start();
          return;
        } catch (e) {}
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening]);

  const stopVoiceSearch = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const cancelVoiceSearch = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setVoiceText('');
    setQuery('');
  }, []);

  // Auto-start voice if navigated from homepage mic button
  useEffect(() => {
    if (location.state?.autoStartVoice && !isListening) {
      handleVoiceSearch();
      navigate('/search', { replace: true, state: {} });
    }
  }, [location.state?.autoStartVoice]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  const popular = ['AC Repair', 'Plumber', 'Electrician', 'Tutor', 'Makeup', 'Cleaning', 'Cook', 'Driver', 'Staff', 'Doctor', 'DJ'];

  return (
    <div className={`absolute inset-0 z-50 flex flex-col transition-all duration-500 ${
      isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gradient-to-b from-white to-gray-50 text-gray-900'
    }`}>
      {/* ===== SEARCH BAR HEADER ===== */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform text-sm font-bold ${
            isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'
          }`}>←</button>
          <div className={`flex-1 flex items-center rounded-2xl px-4 py-3 relative ${
            isDarkMode ? 'bg-slate-800' : 'bg-gray-100'
          } ${isListening ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}>
            <svg className="w-4 h-4 text-gray-400 mr-2.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => setShowSuggestions(query.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={isListening ? "Listening... speak now" : "Search 'AC Repair', 'Staff', 'Plumber'..."}
              autoFocus
              className={`flex-1 outline-none text-sm font-medium bg-transparent placeholder-gray-400 ${
                isDarkMode ? 'text-white' : 'text-gray-700'
              }`}
            />
            {/* Live Listening Indicator */}
            {isListening && (
              <div className="flex items-center space-x-1 mr-2">
                <div className="w-1.5 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-4 bg-red-500 rounded-full animate-pulse" style={{animationDelay: '0.15s'}}></div>
                <div className="w-1.5 h-2.5 bg-red-500 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
              </div>
            )}
            {/* Voice Search Button */}
            <button
              onClick={isListening ? stopVoiceSearch : handleVoiceSearch}
              className={`p-1.5 ml-1 rounded-xl active:scale-90 transition-all ${
                isListening
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : isDarkMode ? 'text-indigo-400 hover:bg-slate-700' : 'text-indigo-600 hover:bg-indigo-50'
              }`}
              title={isListening ? "Stop listening" : "Search with voice"}
            >
              {isListening ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              )}
            </button>
            {/* Clear Button */}
            {query && !isListening && (
              <button onClick={() => { setQuery(''); setShowSuggestions(false); inputRef.current?.focus(); }}
                className={`text-[10px] ml-2 w-5 h-5 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-gray-200 text-gray-400'
                }`}>✕</button>
            )}
          </div>
        </div>

        {/* Autocomplete Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && !isListening && (
          <div className={`mx-11 mt-1 rounded-xl overflow-hidden shadow-lg border ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
          }`}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => selectSuggestion(s)}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center space-x-3 transition-colors ${
                  isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-50 text-gray-700'
                }`}>
                <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="font-medium">{s}</span>
              </button>
            ))}
          </div>
        )}

        {/* Filter & Sort Bar */}
        <div className="flex space-x-2 mt-3 overflow-x-auto hide-scrollbar">
          <button onClick={() => setFilterAvailable(!filterAvailable)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
              filterAvailable ? 'bg-emerald-600 text-white' : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-600')
            }`}>
            {filterAvailable ? '● Available' : '○ Available'}
          </button>
          {['relevance', 'rating', 'distance', 'reviews'].map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold capitalize transition-all ${
                sortBy === s ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-600')
              }`}>
              {s}
            </button>
          ))}
        </div>

        {/* Voice Listening Banner */}
        {isListening && (
          <div className="mt-3 flex items-center space-x-3 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl px-4 py-3">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-8 h-8 bg-red-500/30 rounded-full animate-ping"></div>
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">🎙️ Live Listening</p>
              <p className={`text-sm font-bold truncate mt-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {voiceText || 'Speak now...'}
              </p>
            </div>
            <button onClick={stopVoiceSearch}
              className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full active:scale-95 transition-transform">
              Done
            </button>
          </div>
        )}
      </div>

      {/* ===== RESULTS AREA ===== */}
      <div className="flex-1 overflow-y-auto p-5 hide-scrollbar pb-8">
        {/* No query — show popular + top rated */}
        {!query.trim() && (
          <div>
            <h3 className={`text-sm font-extrabold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🔥 Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {popular.map((s, i) => (
                <button key={s} onClick={() => setQuery(s)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border shadow-premium active:scale-95 transition-transform animate-fade-in ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-gray-100 text-gray-700'
                  }`}
                  style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
                  {s}
                </button>
              ))}
            </div>
            <h3 className={`text-sm font-extrabold mt-6 mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>⭐ Top Rated Near You</h3>
            <div className="space-y-3">
              {[...customProviders, ...ALL_SEARCHABLE_PROVIDERS].filter(p => p.rating >= 4.8).slice(0, 3).map((p, i) => (
                <ProviderCard key={p.id} provider={p} navigate={navigate} index={i} isDarkMode={isDarkMode} />
              ))}
            </div>
          </div>
        )}

        {/* Has query + results found */}
        {query.trim() && results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400 font-medium">
                {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </p>
              {isListening && (
                <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full animate-pulse">
                  Live updating...
                </span>
              )}
            </div>
            <div className="space-y-3">
              {results.map((p, i) => (
                <ProviderCard key={p.id} provider={p} navigate={navigate} index={i} isDarkMode={isDarkMode} />
              ))}
            </div>
          </div>
        )}

        {/* Has query but NO results */}
        {query.trim() && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className={`w-16 h-16 mb-4 ${isDarkMode ? 'text-slate-700' : 'text-gray-200'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>No results for "{query}"</p>
            <p className="text-xs mt-1">Try 'Plumber', 'AC Repair', 'Staff', or 'Doctor'</p>
            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {['Plumber', 'Staff', 'Cook', 'AC Repair'].map(s => (
                <button key={s} onClick={() => setQuery(s)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border active:scale-95 transition-transform ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-gray-600'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProviderCard = ({ provider, navigate, index = 0, isDarkMode }) => {
  const grad = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  return (
    <div onClick={() => navigate('/provider', { state: { profile: provider } })}
      className={`p-4 rounded-2xl shadow-premium border cursor-pointer card-lift animate-fade-in ${
        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-100/50'
      }`}
      style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}>
      <div className="flex items-center space-x-3 mb-2">
        <div className={`w-12 h-12 bg-gradient-to-br ${grad} rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
          {provider.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{provider.name}</h3>
            {provider.available && (
              <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center space-x-0.5">
                <span className="w-1 h-1 bg-emerald-500 rounded-full online-dot"></span>
                <span>Online</span>
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 font-medium">{provider.category}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>📍 {provider.distance}</span>
          <div className="flex items-center text-xs">
            <span className="text-yellow-500 mr-0.5">★</span>
            <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>{provider.rating}</span>
            <span className="text-gray-400 ml-0.5">({provider.reviews})</span>
          </div>
        </div>
        <span className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{provider.price}</span>
      </div>
      <div className="flex items-center justify-between mt-3 border-t border-gray-50 pt-3">
        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{provider.tag}</span>
        <button onClick={e => { e.stopPropagation(); navigate('/provider', { state: { profile: provider } }); }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-1.5 rounded-xl text-xs font-bold active:scale-95 transition-transform shadow-sm">Book</button>
      </div>
    </div>
  );
};

export default SearchScreen;
