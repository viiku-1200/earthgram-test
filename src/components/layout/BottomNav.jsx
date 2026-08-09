import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNav = ({ isDarkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  let activeTab = 'home';
  if (path.startsWith('/explore')) activeTab = 'explore';
  else if (path.startsWith('/reels')) activeTab = 'reels';
  else if (path.startsWith('/community')) activeTab = 'community';
  else if (path.startsWith('/profile') || path.startsWith('/dashboard') || path.startsWith('/wallet') || path.startsWith('/itzpass') || path.startsWith('/messages') || path.startsWith('/catalog')) activeTab = 'profile';

  const activeColor = isDarkMode ? 'text-indigo-400' : 'text-indigo-600';
  const inactiveColor = isDarkMode ? 'text-slate-500' : 'text-gray-400';

  return (
  <div className={`absolute bottom-0 w-full border-t flex justify-between items-center h-16 pb-2 z-30 px-4 safe-area-bottom backdrop-blur-xl transition-all duration-500 ${
    isDarkMode ? 'bg-[#0f172a]/95 border-slate-800' : 'glass border-white/30'
  }`}>
    {/* Home */}
    <button onClick={() => navigate('/')} className={`flex flex-col items-center justify-center w-12 h-full transition-all duration-200 ${activeTab === 'home' ? `${activeColor} scale-105` : inactiveColor}`}>
      <svg className="w-6 h-6 mb-0.5" fill={activeTab === 'home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
      </svg>
      <span className="text-[9px] font-bold">Home</span>
    </button>

    {/* Explore */}
    <button onClick={() => navigate('/explore')} className={`flex flex-col items-center justify-center w-12 h-full transition-all duration-200 ${activeTab === 'explore' ? `${activeColor} scale-105` : inactiveColor}`}>
      <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span className="text-[9px] font-bold">Explore</span>
    </button>

    {/* Watch (center action) */}
    <button onClick={() => navigate('/reels')} className="flex flex-col items-center justify-center -mt-5 z-40">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 transition-all duration-300 ${
        isDarkMode ? 'border-slate-900' : 'border-white'
      } ${
        activeTab === 'reels' 
          ? 'bg-indigo-600 text-white shadow-indigo-500/40 scale-105' 
          : isDarkMode 
            ? 'bg-slate-800 text-slate-400 border-slate-900' 
            : 'bg-slate-100 text-slate-600 border-white'
      }`}>
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      <span className={`text-[9px] font-black mt-1.5 transition-colors duration-200 ${
        activeTab === 'reels' 
          ? 'text-indigo-500' 
          : isDarkMode ? 'text-slate-500' : 'text-gray-500'
      }`}>Watch</span>
    </button>

    {/* Groups */}
    <button onClick={() => navigate('/community')} className={`flex flex-col items-center justify-center w-12 h-full transition-all duration-200 ${activeTab === 'community' ? `${activeColor} scale-105` : inactiveColor}`}>
      <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.221-1.15-2.108-2.362-2.193a48.729 48.729 0 0 0-7.296 0c-1.212.085-2.362.972-2.362 2.193v1.874m0 0a5.07 5.07 0 0 0-2.362.242A2.12 2.12 0 0 0 4.5 10.608v4.286c0 1.136.847 2.1 1.98 2.193.34.027.68.052 1.02.072v3.091l3-3c1.354 0 2.694.055 4.02.163a2.115 2.115 0 0 0 .825.242" />
      </svg>
      <span className="text-[9px] font-bold">Chats</span>
    </button>

    {/* Profile */}
    <button onClick={() => navigate('/profile')} className={`flex flex-col items-center justify-center w-12 h-full transition-all duration-200 ${activeTab === 'profile' ? `${activeColor} scale-105` : inactiveColor}`}>
      <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span className="text-[9px] font-bold">Profile</span>
    </button>
  </div>
  );
};

export default BottomNav;
