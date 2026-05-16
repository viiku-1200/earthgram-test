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

    {/* Reels (center action) */}
    <button onClick={() => navigate('/reels')} className="flex flex-col items-center justify-center -mt-5 z-40">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 transition-all duration-300 ${
        isDarkMode ? 'border-slate-800' : 'border-white'
      } ${activeTab === 'reels' ? 'bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 shadow-glow-indigo' : 'bg-gradient-to-tr from-gray-800 to-gray-900'}`}>
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      <span className={`text-[9px] font-bold mt-1 ${activeTab === 'reels' ? activeColor : isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>Reels</span>
    </button>

    {/* Groups */}
    <button onClick={() => navigate('/community')} className={`flex flex-col items-center justify-center w-12 h-full transition-all duration-200 ${activeTab === 'community' ? `${activeColor} scale-105` : inactiveColor}`}>
      <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <span className="text-[9px] font-bold">Community</span>
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
