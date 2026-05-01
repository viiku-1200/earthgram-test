import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_SEARCHABLE_PROVIDERS } from '../../data/constants';

const AVATAR_GRADIENTS = ['from-indigo-500 to-purple-600', 'from-pink-500 to-rose-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-blue-500 to-cyan-600'];

const SearchScreen = ({ onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [filterAvailable, setFilterAvailable] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    let filtered = ALL_SEARCHABLE_PROVIDERS.filter(p =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q)
    );
    if (filterAvailable) filtered = filtered.filter(p => p.available);
    if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'distance') filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    else if (sortBy === 'reviews') filtered.sort((a, b) => b.reviews - a.reviews);
    return filtered;
  }, [query, sortBy, filterAvailable]);

  const popular = ['AC Repair', 'Plumber', 'Electrician', 'Tutor', 'Makeup', 'Cleaning', 'Cook', 'Driver'];

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 z-50 flex flex-col animate-slide-up">
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition-transform text-sm font-bold">←</button>
          <div className="flex-1 flex items-center bg-gray-100 rounded-2xl px-4 py-3">
            <svg className="w-4 h-4 text-gray-400 mr-2.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search 'AC Repair', 'Tutor'..." autoFocus
              className="flex-1 outline-none text-sm font-medium text-gray-700 bg-transparent placeholder-gray-400" />
            {query && <button onClick={() => setQuery('')} className="text-gray-400 text-sm ml-2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-[10px]">✕</button>}
          </div>
        </div>
        {query.trim() && results.length > 0 && (
          <div className="flex space-x-2 mt-3 overflow-x-auto hide-scrollbar">
            <button onClick={() => setFilterAvailable(!filterAvailable)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${filterAvailable ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {filterAvailable ? '● Available' : '○ Available'}
            </button>
            {['relevance', 'rating', 'distance', 'reviews'].map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold capitalize transition-all ${sortBy === s ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 hide-scrollbar pb-8">
        {!query.trim() && (
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-3">🔥 Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {popular.map((s, i) => (
                <button key={s} onClick={() => setQuery(s)}
                  className="bg-white px-4 py-2 rounded-full text-xs font-bold text-gray-700 border border-gray-100 shadow-premium active:scale-95 transition-transform animate-fade-in"
                  style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
                  {s}
                </button>
              ))}
            </div>
            <h3 className="text-sm font-extrabold text-gray-900 mt-6 mb-3">⭐ Top Rated Near You</h3>
            <div className="space-y-3">
              {ALL_SEARCHABLE_PROVIDERS.filter(p => p.rating >= 4.8).slice(0, 3).map((p, i) => (
                <ProviderCard key={p.id} provider={p} navigate={navigate} index={i} />
              ))}
            </div>
          </div>
        )}
        {query.trim() && results.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-3 font-medium">{results.length} results for "{query}"</p>
            <div className="space-y-3">{results.map((p, i) => <ProviderCard key={p.id} provider={p} navigate={navigate} index={i} />)}</div>
          </div>
        )}
        {query.trim() && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm font-bold">No results for "{query}"</p>
            <p className="text-xs mt-1">Try 'Plumber' or 'AC Repair'</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProviderCard = ({ provider, navigate, index = 0 }) => {
  const grad = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  return (
    <div onClick={() => navigate('/provider', { state: { profile: provider } })}
      className="bg-white p-4 rounded-2xl shadow-premium border border-gray-100/50 cursor-pointer card-lift animate-fade-in"
      style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}>
      <div className="flex items-center space-x-3 mb-2">
        <div className={`w-12 h-12 bg-gradient-to-br ${grad} rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
          {provider.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">{provider.name}</h3>
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
          <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">📍 {provider.distance}</span>
          <div className="flex items-center text-xs">
            <span className="text-yellow-500 mr-0.5">★</span>
            <span className="font-bold text-gray-700">{provider.rating}</span>
            <span className="text-gray-400 ml-0.5">({provider.reviews})</span>
          </div>
        </div>
        <span className="text-sm font-extrabold text-gray-900">{provider.price}</span>
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
