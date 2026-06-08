import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateMockBio } from '../../utils/gemini';
import BusinessCard from '../common/BusinessCard';

const MENU_ITEMS = [
  { icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ), label: 'My Bookings', desc: '1 Active, 1 Upcoming, 2 Past', bg: 'bg-indigo-50', color: 'text-indigo-600', key: 'bookings' },
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

const ProfileScreen = ({ isDarkMode, setIsDarkMode, isBossMode, setIsBossMode, bizBio, setBizBio, isGeneratingBio, setIsGeneratingBio, isRegistered, companyData, addQualityPost, userCoins, setUserCoins, allianceCoins, setAllianceCoins, userTransactions, setUserTransactions, userPassType, onLogout }) => {
  const navigate = useNavigate();
  const [gpsData, setGpsData] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [showBusinessCard, setShowBusinessCard] = useState(false);
  const [showQCForm, setShowQCForm] = useState(false);
  const [qcForm, setQcForm] = useState({ provider: '', category: '', desc: '', beforeImage: null, afterImage: null });
  const beforeInputRef = useRef(null);
  const afterInputRef = useRef(null);

  // States for Send Loyalty Coins Modal
  const [showSendCoinsModal, setShowSendCoinsModal] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [selectedCoinId, setSelectedCoinId] = useState(1);

  const handlePhotoSelect = (file, type) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setQcForm(p => ({ ...p, [type]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const savedGps = localStorage.getItem('earthgram_user_gps');
    const savedAddr = localStorage.getItem('earthgram_user_address');
    if (savedGps) setGpsData(JSON.parse(savedGps));
    if (savedAddr) setUserAddress(savedAddr);
  }, []);

  const handleGenerateBio = async () => {
    if (!bizBio.trim()) return;
    setIsGeneratingBio(true);
    const polishedBio = await generateMockBio(bizBio);
    setBizBio(polishedBio.trim());
    setIsGeneratingBio(false);
  };

  const handleMenuClick = (key) => {
    if (key === 'bookings') navigate('/book', { state: { step: 'history' } });
    if (key === 'messages') navigate('/messages');
    if (key === 'settings') navigate('/settings');
  };

  // Dynamic menu items to include the real address
  const dynamicMenuItems = MENU_ITEMS.map(item => {
    if (item.key === 'addresses' && userAddress) {
      return { ...item, desc: userAddress };
    }
    return item;
  });

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
            <h1 className="text-xl font-extrabold tracking-tight">
              {isRegistered && companyData?.brandName ? companyData.brandName : (companyData?.fullName || 'Aryan Singh')}
            </h1>
            {isRegistered && companyData?.brandName && (
              <p className="text-xs opacity-90 font-medium">Owner: {companyData.fullName}</p>
            )}
            <p className="text-xs opacity-70 font-medium">{companyData?.phone || '+91 98765 43210'}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {isRegistered ? '✓ Verified Pro' : 'Free Member'}
              </span>
              {isRegistered && companyData?.category && (
                <span className="inline-block bg-emerald-500/30 backdrop-blur-sm text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  💼 {companyData.category === 'Other' ? companyData.customCategory : (companyData.subCategory || companyData.category)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LIVE GPS DATA CARD */}
      <div className="px-5 -mt-4 relative z-20">
         <div className={`glass rounded-[2rem] p-4 shadow-2xl border-2 ${isDarkMode ? 'border-white/10' : 'border-white'} flex items-center justify-between`}>
            <div className="flex items-center space-x-3">
               <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-inner ${gpsData ? 'bg-emerald-500/10' : 'bg-gray-100'}`}>
                  {gpsData ? '📍' : '🛰️'}
               </div>
               <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Location</p>
                  <p className={`text-xs font-extrabold mt-0.5 ${userAddress ? 'text-indigo-500' : 'text-gray-400'}`}>
                     {userAddress || (gpsData ? `${gpsData.lat.toFixed(2)}, ${gpsData.lng.toFixed(2)}` : 'GPS Not Detected')}
                  </p>
               </div>
            </div>
            {gpsData && (
               <div className="flex items-center space-x-1 bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">Live</span>
               </div>
            )}
         </div>
      </div>

      {/* Dashboard Section */}
      <div className="px-5 mt-6 mb-6">
        <h2 className={`text-sm font-extrabold mb-3 px-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{isBossMode ? 'Business Tools' : 'Personal Tools'}</h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/wallet')} className={`p-4 rounded-2xl shadow-premium border flex flex-col items-start active:scale-[0.98] transition-transform text-left ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
            <span className="text-2xl mb-2">💳</span>
            <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Wallet & Payments</span>
            <span className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Manage your money</span>
          </button>
          
          <button onClick={() => navigate('/book', { state: { step: 'history' } })} className={`p-4 rounded-2xl shadow-premium border flex flex-col items-start active:scale-[0.98] transition-transform text-left ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
            <span className="text-2xl mb-2">📅</span>
            <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bookings</span>
            <span className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>View active jobs</span>
          </button>

          {isBossMode && (
            <>
              <button onClick={() => navigate('/catalog')} className={`p-4 rounded-2xl shadow-premium border flex flex-col items-start active:scale-[0.98] transition-transform text-left relative overflow-hidden ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-indigo-100 text-gray-900'
              }`}>
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">CORE</div>
                <span className="text-2xl mb-2">📋</span>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Service Catalog</span>
                <span className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Manage pricing & items</span>
              </button>
              
              <button onClick={() => setShowSendCoinsModal(true)} className={`p-4 rounded-2xl shadow-premium border flex flex-col items-start active:scale-[0.98] transition-transform text-left relative overflow-hidden ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-emerald-100 text-gray-900'
              }`}>
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">LOYALTY</div>
                <span className="text-2xl mb-2">🪙</span>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Send Coins</span>
                <span className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Reward loyal clients</span>
              </button>
            </>
          )}

          <button onClick={() => navigate('/upload-reel')} className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-4 rounded-2xl shadow-premium-lg flex flex-col items-start active:scale-[0.98] transition-transform text-left relative overflow-hidden text-white border-2 border-white/20">
            <div className="absolute top-0 right-0 bg-white text-indigo-700 text-[8px] font-black px-2 py-0.5 rounded-bl-lg shadow-sm">NEW</div>
            <span className="text-2xl mb-2">📹</span>
            <span className="text-sm font-bold text-white">Upload Video</span>
            <span className="text-[10px] text-white/80 mt-0.5">Share with customers</span>
          </button>

          <button onClick={() => navigate('/itzpass')} className={`p-4 rounded-2xl shadow-premium border flex flex-col items-start active:scale-[0.98] transition-transform text-left relative overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[8px] font-bold px-2 py-0.5 rounded-bl-lg shadow-sm">VIP</div>
            <span className="text-2xl mb-2">🎫</span>
            <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>ItzPass / Prime</span>
            <span className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Subscriptions</span>
          </button>

          <button onClick={() => navigate('/messages')} className={`p-4 rounded-2xl shadow-premium border flex flex-col items-start active:scale-[0.98] transition-transform text-left relative ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
            <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-2xl mb-2">💬</span>
            <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Messages</span>
            <span className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Customer chats</span>
          </button>

          <button onClick={() => setShowQCForm(true)} className="bg-gradient-to-br from-rose-600 to-red-500 p-4 rounded-2xl shadow-premium-lg flex flex-col items-start active:scale-[0.98] transition-transform text-left relative overflow-hidden text-white border-2 border-white/20">
            <div className="absolute top-0 right-0 bg-white text-red-600 text-[8px] font-black px-2 py-0.5 rounded-bl-lg shadow-sm">JURY</div>
            <span className="text-2xl mb-2">📸</span>
            <span className="text-sm font-bold text-white">Quality Check</span>
            <span className="text-[10px] text-white/80 mt-0.5">Post evidence</span>
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
          
          {isBossMode && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowBusinessCard(true);
              }}
              className="absolute top-3 right-5 bg-white/20 hover:bg-white/30 text-white text-[9px] font-black px-3 py-1.5 rounded-lg backdrop-blur-md shadow-lg active:scale-95 transition-all flex items-center space-x-1 border border-white/20 z-20">
              <span>📇</span>
              <span>GET CARD</span>
            </button>
          )}
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

      {/* Appearance Toggle */}
      <div className="px-5 mt-6">
        <h3 className={`text-sm font-extrabold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Appearance</h3>
        <div className={`p-4 rounded-2xl shadow-premium border flex justify-between items-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center space-x-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
              {isDarkMode ? '🌙' : '☀️'}
            </div>
            <div className="text-left">
              <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</h3>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>Switch app appearance</p>
            </div>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-14 h-7 rounded-full p-1 transition-all duration-300 ${isDarkMode ? 'bg-indigo-500 shadow-glow-indigo' : 'bg-gray-200'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      {/* My Activity */}
      <div className="px-5 mt-6 space-y-2.5 pb-4">
        <h3 className={`text-sm font-extrabold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>My Activity</h3>

        {dynamicMenuItems.map((item, i) => (
          <button key={item.key} onClick={() => handleMenuClick(item.key)}
            className={`w-full p-3.5 rounded-2xl shadow-premium border flex justify-between items-center card-lift animate-fade-in ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100/50'}`}
            style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
            <div className="flex items-center space-x-3.5">
              <div className={`w-10 h-10 ${isDarkMode ? 'bg-slate-700' : item.bg} ${item.color} rounded-xl flex items-center justify-center`}>
                {item.icon}
              </div>
              <div className="text-left">
                <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.label}</h3>
                <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>{item.desc}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {item.badge && (
                <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">{item.badge}</span>
              )}
              <svg className={`w-4 h-4 ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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

        {/* Log Out Button */}
        {onLogout && (
          <button onClick={onLogout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 p-3.5 rounded-2xl border border-red-500/20 flex justify-center items-center font-bold active:scale-[0.98] mt-2 transition-all">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        )}
      </div>

      <p className="text-center text-[9px] text-gray-300 font-medium mt-2 mb-4">EarthGram v1.0.0 Beta</p>

      {showBusinessCard && (
        <BusinessCard 
          isDarkMode={isDarkMode} 
          companyData={companyData} 
          bizBio={bizBio} 
          onClose={() => setShowBusinessCard(false)} 
        />
      )}

      {/* Quality Check Post Form */}
      {showQCForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowQCForm(false)}>
          <div className={`w-full max-w-[480px] rounded-t-[2.5rem] p-6 pb-10 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            <h2 className={`text-lg font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>📸 Post Quality Check</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Provider Name</label>
                <input value={qcForm.provider} onChange={e => setQcForm(p => ({ ...p, provider: e.target.value }))} placeholder="e.g., Ravi Electric" className={`w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 border border-slate-100'}`} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Service Category</label>
                <input value={qcForm.category} onChange={e => setQcForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g., AC Repair, Cleaning" className={`w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 border border-slate-100'}`} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">What Happened?</label>
                <textarea value={qcForm.desc} onChange={e => setQcForm(p => ({ ...p, desc: e.target.value }))} placeholder="Describe the service quality..." rows="3" className={`w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 border border-slate-100'}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* BEFORE PHOTO */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Before Photo</label>
                  <input ref={beforeInputRef} type="file" accept="image/*" className="hidden" onChange={e => handlePhotoSelect(e.target.files[0], 'beforeImage')} />
                  <div
                    onClick={() => beforeInputRef.current.click()}
                    className={`h-24 rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed cursor-pointer active:scale-95 transition-transform ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}
                  >
                    {qcForm.beforeImage
                      ? <img src={qcForm.beforeImage} alt="Before" className="w-full h-full object-cover" />
                      : <div className="flex flex-col items-center space-y-1">
                          <span className="text-2xl">📷</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Tap to Upload</span>
                        </div>
                    }
                  </div>
                </div>
                {/* AFTER PHOTO */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">After Photo</label>
                  <input ref={afterInputRef} type="file" accept="image/*" className="hidden" onChange={e => handlePhotoSelect(e.target.files[0], 'afterImage')} />
                  <div
                    onClick={() => afterInputRef.current.click()}
                    className={`h-24 rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed cursor-pointer active:scale-95 transition-transform ${isDarkMode ? 'border-emerald-900/30 bg-slate-800' : 'border-emerald-200 bg-emerald-50'}`}
                  >
                    {qcForm.afterImage
                      ? <img src={qcForm.afterImage} alt="After" className="w-full h-full object-cover" />
                      : <div className="flex flex-col items-center space-y-1">
                          <span className="text-2xl">🌟</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-emerald-400'}`}>Tap to Upload</span>
                        </div>
                    }
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!qcForm.provider.trim() || !qcForm.desc.trim()) return;
                const newPost = {
                  id: 'qc_' + Date.now(),
                  isUserPost: true,
                  author: companyData?.fullName || 'Aryan Singh',
                  authorAvatar: '👤',
                  location: 'My Location',
                  provider: qcForm.provider,
                  providerCategory: qcForm.category || 'Service',
                  title: `Quality Check: ${qcForm.provider}`,
                  desc: qcForm.desc,
                  beforeImage: qcForm.beforeImage || '📸',
                  afterImage: qcForm.afterImage || '📸',
                  images: [],
                  reactions: { helpful: 0, notHelpful: 0 },
                  comments: 0,
                  timeAgo: 'Just now',
                  verdict: 'pending',
                  votes: { suspend: 50, forgive: 50 },
                  userComments: [],
                  userRatings: [],
                };
                addQualityPost(newPost);
                setQcForm({ provider: '', category: '', desc: '', beforeImage: null, afterImage: null });
                setShowQCForm(false);
                navigate('/community');
              }}
              className="w-full mt-6 bg-gradient-to-r from-rose-600 to-red-500 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl"
            >
              Submit Quality Check
            </button>
          </div>
        </div>
      )}

      {/* Send Coins Modal */}
      {showSendCoinsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowSendCoinsModal(false)}>
          <div className={`w-full max-w-[480px] rounded-t-[2.5rem] p-6 pb-10 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`} onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            <h2 className="text-lg font-black mb-6 flex items-center space-x-2">
              <span>🪙</span>
              <span>Send Loyalty Coins</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Customer Phone / Name</label>
                <input 
                  type="text"
                  value={customerPhone} 
                  onChange={e => setCustomerPhone(e.target.value)} 
                  placeholder="e.g., +91 98765 43210 or Aman Sharma" 
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 border border-slate-100'}`} 
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Select Token Type</label>
                <select 
                  value={selectedCoinId} 
                  onChange={e => setSelectedCoinId(parseInt(e.target.value))}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 border border-slate-100'}`}
                >
                  {allianceCoins.map(coin => (
                    <option key={coin.id} value={coin.id}>
                      {coin.icon} {coin.name} ({coin.provider})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Amount of Coins</label>
                <input 
                  type="number"
                  value={sendAmount} 
                  onChange={e => setSendAmount(e.target.value)} 
                  placeholder="e.g., 20" 
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 border border-slate-100'}`} 
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!customerPhone.trim() || !sendAmount || isNaN(sendAmount)) return;
                const coinsToTransfer = parseInt(sendAmount);
                const targetCoin = allianceCoins.find(c => c.id === selectedCoinId);
                
                if (!targetCoin) return;

                // Update alliance balance
                setAllianceCoins(prev => prev.map(c => 
                  c.id === selectedCoinId ? { ...c, balance: c.balance + coinsToTransfer } : c
                ));

                // Add to transactions history
                const newTxn = {
                  id: 'w_' + Date.now(),
                  type: 'credit',
                  title: `Received ${targetCoin.name}`,
                  amount: `+${coinsToTransfer} Coins`,
                  date: 'Just now',
                  method: companyData?.brandName || 'Business Transfer',
                  icon: targetCoin.icon
                };
                setUserTransactions(prev => [newTxn, ...prev]);

                // Reset and close
                setCustomerPhone('');
                setSendAmount('');
                setShowSendCoinsModal(false);
                alert(`Successfully transferred ${coinsToTransfer} ${targetCoin.name} to ${customerPhone}!`);
              }}
              className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-emerald-500/10"
            >
              Transfer Coins
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;
