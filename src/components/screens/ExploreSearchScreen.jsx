import React, { useState, useMemo } from 'react';
import { EXPLORE_CATEGORIES, LOCAL_SPOTS } from '../../data/constants';

const BUDDY_DATA = [
  { id: 'b1', name: 'Amit', initials: 'AS', gradient: 'from-blue-500 to-indigo-600', online: true },
  { id: 'b2', name: 'Priya', initials: 'PV', gradient: 'from-pink-500 to-rose-600', online: false },
  { id: 'b3', name: 'Rahul', initials: 'RG', gradient: 'from-emerald-500 to-teal-600', online: false },
  { id: 'b4', name: 'Neha', initials: 'NS', gradient: 'from-purple-500 to-violet-600', online: true },
  { id: 'b5', name: 'Kabir', initials: 'KP', gradient: 'from-amber-500 to-orange-600', online: false },
];

const SPOT_IMAGES = { 'Dance Studio': '🎶', 'Empty Room': '🏡', 'Local Food': '🍱', 'Gym': '💪' };
const SPOT_GRADIENTS = { 'Dance Studio': 'from-pink-500 to-purple-600', 'Empty Room': 'from-teal-500 to-cyan-600', 'Local Food': 'from-orange-500 to-red-500', 'Gym': 'from-gray-700 to-gray-900' };

const ExploreSearchScreen = ({ isDarkMode, onClose }) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return { spots: [], buddies: [], categories: [] };
    const q = query.toLowerCase();
    
    const spots = LOCAL_SPOTS.filter(s => 
      s.title.toLowerCase().includes(q) || s.type.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)
    );
    
    const buddies = BUDDY_DATA.filter(b => b.name.toLowerCase().includes(q));
    
    const categories = EXPLORE_CATEGORIES.filter(c => c.name.toLowerCase().includes(q));

    return { spots, buddies, categories };
  }, [query]);

  const popular = ['Dance Studio', 'Gym', 'Local Food', 'Amit', 'Music'];

  return (
    <div className={`absolute inset-0 z-50 flex flex-col animate-slide-up transition-all duration-500 ${
      isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gradient-to-b from-white to-gray-50 text-gray-900'
    }`}>
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform text-sm font-bold ${
            isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'
          }`}>←</button>
          <div className={`flex-1 flex items-center rounded-2xl px-4 py-3 ${
            isDarkMode ? 'bg-slate-800' : 'bg-gray-100'
          }`}>
            <svg className="w-4 h-4 text-gray-400 mr-2.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search places, people, interests..." autoFocus
              className={`flex-1 outline-none text-sm font-medium bg-transparent placeholder-gray-400 ${
                isDarkMode ? 'text-white' : 'text-gray-700'
              }`} />
            {query && <button onClick={() => setQuery('')} className={`text-[10px] ml-2 w-5 h-5 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-gray-200 text-gray-400'
            }`}>✕</button>}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 hide-scrollbar pb-8">
        {!query.trim() && (
          <div>
            <h3 className={`text-sm font-extrabold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🔥 Trending in Explore</h3>
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
          </div>
        )}
        
        {query.trim() && (results.spots.length > 0 || results.buddies.length > 0 || results.categories.length > 0) && (
          <div className="space-y-6">
            <p className="text-xs text-gray-400 font-medium">Results for "{query}"</p>
            
            {/* Buddies Results */}
            {results.buddies.length > 0 && (
              <div>
                <h3 className={`text-sm font-extrabold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>People</h3>
                <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2">
                  {results.buddies.map((buddy, i) => (
                    <div key={buddy.id} className="flex flex-col items-center">
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${buddy.gradient} flex items-center justify-center text-white text-sm font-bold shadow-premium ${buddy.online ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}>
                          {buddy.initials}
                        </div>
                        {buddy.online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full online-dot"></div>}
                      </div>
                      <span className={`text-[10px] font-bold mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>{buddy.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Places Results */}
            {results.spots.length > 0 && (
              <div>
                <h3 className={`text-sm font-extrabold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Places</h3>
                <div className="space-y-3">
                  {results.spots.map((spot) => (
                    <div key={spot.id} className={`rounded-2xl shadow-premium border overflow-hidden card-lift ${
                      isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-100/50'
                    }`}>
                      <div className="flex">
                        <div className={`w-24 bg-gradient-to-br ${SPOT_GRADIENTS[spot.type] || 'from-gray-400 to-gray-600'} flex items-center justify-center text-3xl flex-shrink-0`}>
                          {SPOT_IMAGES[spot.type] || '📍'}
                        </div>
                        <div className="flex-1 p-3.5">
                          <div className="flex justify-between items-start">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400">{spot.type}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>{spot.distance}</span>
                          </div>
                          <h3 className={`font-bold text-sm mt-0.5 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{spot.title}</h3>
                          <p className={`text-[11px] mt-1 leading-snug ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{spot.desc}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${spot.status === 'Open Now' || spot.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : spot.status === 'Hot' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                              {spot.status}
                            </span>
                            <button className="text-indigo-600 text-[11px] font-bold">View →</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Results */}
            {results.categories.length > 0 && (
              <div>
                <h3 className={`text-sm font-extrabold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Interests</h3>
                <div className="grid grid-cols-3 gap-3">
                  {results.categories.map((cat) => (
                    <button key={cat.id} className={`p-4 rounded-2xl flex flex-col items-center justify-center shadow-premium border card-lift ${
                      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100/50'
                    }`}>
                      <span className="text-2xl mb-1.5">{cat.icon}</span>
                      <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {query.trim() && results.spots.length === 0 && results.buddies.length === 0 && results.categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm font-bold">No results for "{query}"</p>
            <p className="text-xs mt-1">Try 'Gym' or 'Dance Studio'</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreSearchScreen;
