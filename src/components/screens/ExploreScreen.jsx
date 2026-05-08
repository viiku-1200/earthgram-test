import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EXPLORE_CATEGORIES, LOCAL_SPOTS } from '../../data/constants';

const BUDDY_DATA = [
  { name: 'Amit', initials: 'AS', gradient: 'from-blue-500 to-indigo-600', online: true },
  { name: 'Priya', initials: 'PV', gradient: 'from-pink-500 to-rose-600', online: false },
  { name: 'Rahul', initials: 'RG', gradient: 'from-emerald-500 to-teal-600', online: false },
  { name: 'Neha', initials: 'NS', gradient: 'from-purple-500 to-violet-600', online: true },
  { name: 'Kabir', initials: 'KP', gradient: 'from-amber-500 to-orange-600', online: false },
];

const SPOT_IMAGES = { 'Dance Studio': '🎶', 'Empty Room': '🏡', 'Local Food': '🍱', 'Gym': '💪' };
const SPOT_GRADIENTS = { 'Dance Studio': 'from-pink-500 to-purple-600', 'Empty Room': 'from-teal-500 to-cyan-600', 'Local Food': 'from-orange-500 to-red-500', 'Gym': 'from-gray-700 to-gray-900' };

const ExploreScreen = ({ isDarkMode }) => {
  const navigate = useNavigate();
  return (
  <div className={`h-full flex flex-col pt-8 pb-20 overflow-y-auto hide-scrollbar transition-all duration-500 ${
    isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gradient-to-b from-white to-gray-50/80 text-gray-900'
  }`}>
    {/* Header */}
    <div className="px-5 pt-2 pb-4">
      <h1 className={`text-2xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Explore</h1>
      <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Discover your neighborhood</p>
    </div>

    {/* Search */}
    <div className="px-5 mb-4">
      <div 
        onClick={() => navigate('/explore-search')}
        className={`flex items-center rounded-2xl px-4 py-3 cursor-pointer active:scale-[0.98] transition-transform ${
          isDarkMode ? 'bg-slate-800' : 'bg-gray-100'
        }`}>
        <svg className={`w-4 h-4 mr-3 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Search places, people, interests...</span>
      </div>
    </div>

    {/* Buddies Nearby */}
    <div className="px-5">
      <div className="flex justify-between items-center mb-3">
        <h2 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Buddies Nearby</h2>
        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 ${
          isDarkMode ? 'text-indigo-400 bg-indigo-500/10' : 'text-indigo-600 bg-indigo-50'
        }`}>
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full online-dot"></span>
          <span>Radar Active</span>
        </span>
      </div>
      <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2">
        {BUDDY_DATA.map((buddy, i) => (
          <div key={i} className="flex flex-col items-center animate-fade-in" style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
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

    {/* Interests & Places Grid */}
    <div className="mt-6 px-5">
      <h2 className={`text-sm font-extrabold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Interests & Places</h2>
      <div className="grid grid-cols-3 gap-3">
        {EXPLORE_CATEGORIES.map((cat, i) => (
          <button key={cat.id}
            className={`p-4 rounded-2xl flex flex-col items-center justify-center shadow-premium border card-lift animate-fade-in ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-100/50'
            }`}
            style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
            <span className="text-2xl mb-1.5">{cat.icon}</span>
            <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>

    {/* Happening Now */}
    <div className="mt-6 px-5 pb-4">
      <h2 className={`text-sm font-extrabold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Happening Now</h2>
      <div className="space-y-3">
        {LOCAL_SPOTS.map((spot, i) => (
          <div key={spot.id} className={`rounded-2xl shadow-premium border overflow-hidden card-lift animate-fade-in ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-100/50'
          }`}
            style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}>
            <div className="flex">
              {/* Image area */}
              <div className={`w-24 bg-gradient-to-br ${SPOT_GRADIENTS[spot.type] || 'from-gray-400 to-gray-600'} flex items-center justify-center text-3xl flex-shrink-0`}>
                {SPOT_IMAGES[spot.type] || '📍'}
              </div>
              {/* Content */}
              <div className="flex-1 p-3.5">
                <div className="flex justify-between items-start">
                  <span className={`text-[8px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{spot.type}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>{spot.distance}</span>
                </div>
                <h3 className={`font-bold text-sm mt-0.5 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{spot.title}</h3>
                <p className={`text-[11px] mt-1 leading-snug ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{spot.desc}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${spot.status === 'Open Now' || spot.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : spot.status === 'Hot' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                    {spot.status}
                  </span>
                  <button className={`text-[11px] font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>View →</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

export default ExploreScreen;
