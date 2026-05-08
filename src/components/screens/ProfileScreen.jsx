import React from 'react';
import { useNavigate } from 'react-router-dom';
import { generateMockBio } from '../../utils/gemini';

const MENU_ITEMS = [
  { icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ), label: 'My Bookings', desc: '1 Upcoming, 4 Past', bg: 'bg-indigo-50', color: 'text-indigo-600', key: 'bookings' },
  { icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ), label: 'Messages', desc: '2 new messages', bg: 'bg-emerald-50', color: 'text-emerald-600', key: 'messages', badge: 2 },
  { icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ), label: 'Saved Addresses', desc: 'Home, Office', bg: 'bg-purple-50', color: 'text-purple-600', key: 'addresses' },
  { icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ), label: 'My Ratings', desc: "Reviews you've given", bg: 'bg-amber-50', color: 'text-amber-600', key: 'ratings' },
  { icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ), label: 'Settings', desc: 'Account, notifications', bg: 'bg-gray-100', color: 'text-gray-600', key: 'settings' },
];

const ProfileScreen = ({ isDarkMode, isBossMode, setIsBossMode, bizBio, setBizBio, isGeneratingBio, setIsGeneratingBio, isRegistered, companyData }) => {
  const navigate = useNavigate();
  
  const handleGenerateBio = async () => {
    if (!bizBio.trim()) return;
    setIsGeneratingBio(true);
    const polishedBio = await generateMockBio(bizBio);
    setBizBio(polishedBio.trim());
    setIsGeneratingBio(false);
  };

  const handleMenuClick = (key) => {
    if (key === 'bookings') navigate('/book');
    if (key === 'messages') navigate('/messages');
    if (key === 'settings') navigate('/settings');
  };

  return (
    <div className={`h-full flex flex-col pt-8 pb-20 overflow-y-auto hide-scrollbar transition-all duration-500 ${
      isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gradient-to-b from-white to-gray-50/80 text-gray-900'
    }`}>
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 px-5 pt-4 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/4"></div>
        </div>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-18 h-18 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl flex items-center justify-center text-3xl border-2 border-white/20 shadow-lg backdrop-blur-sm p-3">
            <span className="text-white font-black text-xl">
              {(companyData?.fullName || 'Aryan Singh').split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="text-white">
            <h1 className="text-xl font-extrabold tracking-tight">{companyData?.fullName || 'Aryan Singh'}</h1>
            <p className="text-sm opacity-70 font-medium">{companyData?.phone || '+91 98765 43210'}</p>
            <span className="inline-block mt-1.5 bg-white/20 backdrop-blur-sm text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {isRegistered ? '✓ Verified Pro' : 'Free Member'}
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="px-5 mt-6 mb-6">
        <h2 className="text-sm font-extrabold text-gray-900 mb-3 px-1">{isBossMode ? 'Business Tools' : 'Personal Tools'}</h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/wallet')} className="bg-white p-4 rounded-2xl shadow-premium border border-gray-100 flex flex-col items-start active:scale-[0.98] transition-transform text-left">
            <span className="text-2xl mb-2">💳</span>
            <span className="text-sm font-bold text-gray-900">Wallet & Payments</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Manage your money</span>
          </button>
          
          <button onClick={() => navigate('/book')} className="bg-white p-4 rounded-2xl shadow-premium border border-gray-100 flex flex-col items-start active:scale-[0.98] transition-transform text-left">
            <span className="text-2xl mb-2">📅</span>
            <span className="text-sm font-bold text-gray-900">Bookings</span>
            <span className="text-[10px] text-gray-500 mt-0.5">View active jobs</span>
          </button>

          {isBossMode && (
            <button onClick={() => navigate('/catalog')} className="bg-white p-4 rounded-2xl shadow-premium border border-indigo-100 flex flex-col items-start active:scale-[0.98] transition-transform text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">CORE</div>
              <span className="text-2xl mb-2">📋</span>
              <span className="text-sm font-bold text-gray-900">Service Catalog</span>
              <span className="text-[10px] text-gray-500 mt-0.5">Manage pricing & items</span>
            </button>
          )}

          <button onClick={() => navigate('/upload-reel')} className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-4 rounded-2xl shadow-premium-lg flex flex-col items-start active:scale-[0.98] transition-transform text-left relative overflow-hidden text-white border-2 border-white/20">
            <div className="absolute top-0 right-0 bg-white text-indigo-700 text-[8px] font-black px-2 py-0.5 rounded-bl-lg shadow-sm">NEW</div>
            <span className="text-2xl mb-2">📹</span>
            <span className="text-sm font-bold text-white">Upload Reel</span>
            <span className="text-[10px] text-white/80 mt-0.5">Share with customers</span>
          </button>

          <button onClick={() => navigate('/itzpass')} className="bg-white p-4 rounded-2xl shadow-premium border border-gray-100 flex flex-col items-start active:scale-[0.98] transition-transform text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[8px] font-bold px-2 py-0.5 rounded-bl-lg shadow-sm">VIP</div>
            <span className="text-2xl mb-2">🎫</span>
            <span className="text-sm font-bold text-gray-900">ItzPass / Prime</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Subscriptions</span>
          </button>

          <button onClick={() => navigate('/messages')} className="bg-white p-4 rounded-2xl shadow-premium border border-gray-100 flex flex-col items-start active:scale-[0.98] transition-transform text-left relative">
            <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-2xl mb-2">💬</span>
            <span className="text-sm font-bold text-gray-900">Messages</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Customer chats</span>
          </button>
        </div>
      </div>

      {/* Boss Dashboard */}
      <div className="px-5 mt-4">
        <div className={`p-5 rounded-2xl shadow-premium-lg transition-all duration-500 relative overflow-hidden ${isBossMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white' : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white'}`}>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/4"></div>
          </div>
          <div className="flex justify-between items-center mb-3 relative z-10">
            <div>
              <span className="bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                {isBossMode ? 'Virtual Company' : 'Earn Money'}
              </span>
              <h2 className="text-lg font-extrabold mt-1.5">Boss Dashboard</h2>
            </div>
            <button onClick={() => setIsBossMode(!isBossMode)}
              className={`w-14 h-7 rounded-full p-1 transition-all duration-300 ${isBossMode ? 'bg-emerald-500 shadow-glow-green' : 'bg-white/25'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isBossMode ? 'translate-x-7' : 'translate-x-0'}`}></div>
            </button>
          </div>
          <p className="text-sm opacity-80 mb-4 leading-snug relative z-10">
            {isBossMode
              ? 'Your profile is live. You are visible to customers in Ghaziabad.'
              : 'Turn on Boss Mode to start receiving local bookings and sell your skills.'}
          </p>

          {/* AI Boss Bio Generator */}
          {isBossMode && (
            <div className="mb-4 bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/15 relative z-10">
              <h3 className="text-[10px] font-bold text-gray-300 mb-2 uppercase tracking-wider">Your Pitch</h3>
              <textarea
                value={bizBio}
                onChange={(e) => setBizBio(e.target.value)}
                placeholder="E.g., I fix ACs and fridges fast..."
                className="w-full bg-white/15 text-white placeholder-gray-400 rounded-xl p-3 text-sm outline-none resize-none mb-2 focus:bg-white/25 transition-colors border border-white/10"
                rows="2"
              ></textarea>
              <button onClick={handleGenerateBio} disabled={isGeneratingBio}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-70">
                <span>{isGeneratingBio ? '✨ Polishing Pitch...' : '✨ Polish Pitch with AI'}</span>
              </button>
            </div>
          )}

          {/* Stats */}
          {isBossMode && (
            <div className="flex space-x-2 border-t border-white/15 pt-4 relative z-10">
              <div className="flex-1 bg-white/10 backdrop-blur-sm p-3 rounded-xl text-center">
                <span className="block text-[10px] text-gray-400 font-medium">Today</span>
                <span className="block text-lg font-extrabold">₹1,200</span>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-sm p-3 rounded-xl text-center">
                <span className="block text-[10px] text-gray-400 font-medium">Leads</span>
                <span className="block text-lg font-extrabold">4</span>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-sm p-3 rounded-xl text-center">
                <span className="block text-[10px] text-gray-400 font-medium">Rating</span>
                <span className="block text-lg font-extrabold">4.9</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* My Activity */}
      <div className="px-5 mt-6 space-y-2.5 pb-4">
        <h3 className="text-sm font-extrabold text-gray-900 mb-2">My Activity</h3>

        {MENU_ITEMS.map((item, i) => (
          <button key={item.key} onClick={() => handleMenuClick(item.key)}
            className="w-full bg-white p-3.5 rounded-2xl shadow-premium border border-gray-100/50 flex justify-between items-center card-lift animate-fade-in"
            style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
            <div className="flex items-center space-x-3.5">
              <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center`}>
                {item.icon}
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 text-sm">{item.label}</h3>
                <p className="text-[10px] text-gray-400">{item.desc}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {item.badge && (
                <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">{item.badge}</span>
              )}
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}

        {/* Register as Professional */}
        {!isRegistered && (
          <button onClick={() => navigate('/register')}
            className="w-full bg-gradient-to-r from-gray-900 to-gray-700 p-3.5 rounded-2xl shadow-premium border border-gray-900 flex justify-between items-center card-lift">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-white text-sm">Register as Professional</h3>
                <p className="text-[10px] text-gray-400">Start your Virtual Company</p>
              </div>
            </div>
            <span className="text-[8px] font-black text-red-600 bg-white px-2 py-1 rounded-full border border-red-100 animate-pulse">HOT</span>
          </button>
        )}
      </div>

      <p className="text-center text-[9px] text-gray-300 font-medium mt-2 mb-4">EarthGram v1.0.0 Beta</p>
    </div>
  );
};

export default ProfileScreen;
