import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { COMMUNITY_GROUPS, REELS_DATA, LOCAL_SPOTS, EXPLORE_CATEGORIES } from '../../data/constants';

// Fix Leaflet marker icon issue in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const BUDDY_DATA = [
  { name: 'Amit', initials: 'AS', gradient: 'from-blue-500 to-indigo-600', online: true },
  { name: 'Priya', initials: 'PV', gradient: 'from-pink-500 to-rose-600', online: false },
  { name: 'Rahul', initials: 'RG', gradient: 'from-emerald-500 to-teal-600', online: false },
  { name: 'Neha', initials: 'NS', gradient: 'from-purple-500 to-violet-600', online: true },
  { name: 'Kabir', initials: 'KP', gradient: 'from-amber-500 to-orange-600', online: false },
];

const SPOT_IMAGES = { 'Dance Studio': '🎶', 'Empty Room': '🏡', 'Local Food': '🍱', 'Gym': '💪' };
const SPOT_GRADIENTS = { 'Dance Studio': 'from-pink-500 to-purple-600', 'Empty Room': 'from-teal-500 to-cyan-600', 'Local Food': 'from-orange-500 to-red-500', 'Gym': 'from-gray-700 to-gray-900' };

const FEED_DATA = [
  { type: 'alert', data: COMMUNITY_GROUPS[0] },
  { type: 'reel', data: REELS_DATA[0] },
  { type: 'vendor', data: COMMUNITY_GROUPS[1] },
  { type: 'reel', data: REELS_DATA[1] },
  { type: 'spot', data: LOCAL_SPOTS[2] },
];

// LIVE MAP DATA
const INITIAL_CENTER = [28.6692, 77.4538]; // Sector 4, Ghaziabad
const LIVE_DRIVERS = [
  { id: 1, name: 'Tractor (Ravi)', pos: [28.6710, 77.4550], type: 'transport', status: 'moving' },
  { id: 2, name: 'Mandi Express', pos: [28.6650, 77.4500], type: 'mandi', status: 'stationary' },
];

const MapTabView = ({ isDarkMode }) => {
  const [driverPos, setDriverPos] = useState(LIVE_DRIVERS[0].pos);
  
  // Real-Time Movement Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverPos(prev => [
        prev[0] + (Math.random() - 0.5) * 0.0005,
        prev[1] + (Math.random() - 0.5) * 0.0005
      ]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full relative overflow-hidden animate-fade-in">
      <MapContainer center={INITIAL_CENTER} zoom={15} className="h-full w-full z-0">
        <TileLayer
          url={isDarkMode 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution='&copy; OpenStreetMap'
        />
        
        {/* User Location */}
        <Marker position={INITIAL_CENTER}>
          <Popup>You are here 📍</Popup>
        </Marker>

        {/* Live Driver (Simulated Movement) */}
        <Marker position={driverPos}>
          <Popup>
            <div className="p-1">
              <p className="font-bold">🚜 Ravi (Tractor)</p>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Live • Moving Now</p>
              <button className="mt-2 w-full bg-slate-900 text-white text-[10px] py-1 rounded-lg">Call Operator</button>
            </div>
          </Popup>
        </Marker>

        {/* Mandi Point */}
        <Marker position={LIVE_DRIVERS[1].pos}>
          <Popup>
            <div className="p-1">
              <p className="font-bold">🏢 Sector 4 Mandi</p>
              <p className="text-[10px] text-slate-500">Wheat Price: ₹2100/qtl</p>
              <button className="mt-2 w-full bg-slate-900 text-white text-[10px] py-1 rounded-lg">Check Prices</button>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Floating Info Overlay */}
      <div className="absolute bottom-6 left-6 right-6 z-10">
        <div className={`p-4 rounded-[2rem] shadow-2xl backdrop-blur-xl border ${isDarkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-gray-100'}`}>
           <div className="flex items-center justify-between">
              <div>
                 <h3 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Real-Time Radar</h3>
                 <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>2 Services active nearby</p>
              </div>
              <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-black border-2 border-white">🚜</div>
                 <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-black border-2 border-white">🏢</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const ExploreScreen = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pulse');
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = (e) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      setShowHeader(false); // Hide on scroll down
    } else {
      setShowHeader(true); // Show on scroll up
    }
    setLastScrollY(currentScrollY);
  };

  return (
  <div 
    onScroll={handleScroll}
    className={`h-full flex flex-col pt-0 pb-20 overflow-y-auto hide-scrollbar transition-all duration-500 ${
    isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900'
  }`}>
    {/* Smooth Animated Header & Tabs */}
    <div className={`sticky top-0 z-20 px-5 pt-10 pb-3 backdrop-blur-xl transition-all duration-300 ease-in-out ${
      isDarkMode ? 'bg-[#0f172a]/80 border-b border-slate-800' : 'bg-white/80 border-b border-gray-100 shadow-sm'
    } ${showHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Explore</h1>
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>📍 Sector 4, Ghaziabad</p>
        </div>
        <button onClick={() => navigate('/search')} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>
      </div>

      <div className="flex space-x-2">
        {['pulse', 'map', 'deals'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              activeTab === tab 
                ? (isDarkMode ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-black text-white shadow-lg') 
                : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500')
            }`}>
            {tab === 'pulse' ? '🔥 Pulse' : tab === 'map' ? '🗺️ Map' : '🏷️ Deals'}
          </button>
        ))}
      </div>
    </div>

    {/* ====== DYNAMIC LIVE TICKER FOR EXPLORE ====== */}
    {(() => {
      const savedAddr = localStorage.getItem('earthgram_user_address') || '';
      const areaName = savedAddr ? savedAddr.split(',')[0].trim() : 'Live';
      const isGC = areaName.toLowerCase().includes('gaur city') || areaName.toLowerCase().includes('gc');
      const pulseTitle = areaName !== 'Live' ? `${areaName} Live` : 'Live Pulse';
      
      return (
        <div className={`flex items-center border-b overflow-hidden h-10 z-10 flex-shrink-0 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 shadow-inner' : 'bg-gray-50 border-gray-100 shadow-sm'
        }`}>
          {/* Fixed Area Badge */}
          <div className={`flex-shrink-0 z-20 px-3 h-full flex items-center space-x-1.5 border-r ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
          }`}>
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.4)]"></div>
            <span className={`text-[10px] font-black tracking-widest uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pulseTitle}</span>
          </div>

          {/* Scrolling News Container */}
          <div className="flex-1 relative overflow-hidden h-full flex items-center">
            <div className="flex animate-marquee items-center">
              {[
                { icon: isGC ? '🏥' : '🌾', label: isGC ? 'Health' : 'Mandi', text: isGC ? 'Dr. Rajesh: Same-day KFT/CBC tests available in GC-2' : 'Wheat ₹2,125 (+1.2%)', color: isDarkMode ? 'text-emerald-400' : 'text-emerald-700' },
                { icon: '🚜', label: 'Service', text: isGC ? `AC Servicing slots open in ${areaName} for tomorrow` : 'Tractor Rental live in Sector 4', color: isDarkMode ? 'text-indigo-400' : 'text-indigo-800' },
                { icon: '🌩️', label: 'Weather', text: `Clear skies over ${areaName} today`, color: isDarkMode ? 'text-amber-400' : 'text-amber-700' },
                { icon: '🌎', label: isGC ? 'Society' : 'Global', text: isGC ? 'Community Meeting at 7 PM in Club House' : 'New Agency in Dubai', color: isDarkMode ? 'text-purple-400' : 'text-purple-800' },
                { icon: isGC ? '🏥' : '🌾', label: isGC ? 'Health' : 'Mandi', text: isGC ? 'Dr. Rajesh: Same-day KFT/CBC tests available in GC-2' : 'Wheat ₹2,125 (+1.2%)', color: isDarkMode ? 'text-emerald-400' : 'text-emerald-700' },
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-2 px-8 whitespace-nowrap">
                  <span className="text-xs">{item.icon}</span>
                  <span className={`text-[9px] font-black uppercase tracking-tighter opacity-50 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.label}:</span>
                  <span className={`text-[10px] font-extrabold ${item.color}`}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    })()}

    {activeTab === 'map' ? (
      <MapTabView isDarkMode={isDarkMode} />
    ) : activeTab === 'deals' ? (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center animate-fade-in">
        <div className="text-6xl mb-4">🏷️</div>
        <h2 className="text-xl font-black mb-2">Village Deals Coming Soon</h2>
        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>We are connecting with local shop owners to bring you the best prices.</p>
        <button onClick={() => setActiveTab('pulse')} className="mt-6 px-6 py-3 bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/30">Go Back to Pulse</button>
      </div>
    ) : (
      <>
        {/* Search (Previous) */}
        <div className="px-5 mt-4 mb-4">
          <div 
            onClick={() => navigate('/explore-search')}
            className={`flex items-center rounded-2xl px-4 py-3 cursor-pointer active:scale-[0.98] transition-transform ${
              isDarkMode ? 'bg-slate-800' : 'bg-white shadow-sm border border-gray-100'
            }`}>
            <svg className={`w-4 h-4 mr-3 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Search places, people, interests...</span>
          </div>
        </div>

        {/* Explore Categories (Interests) - Restored and moved up */}
        <div className="px-5 mt-2 mb-2">
          <h2 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Discover Interests</h2>
        </div>
        <div className="px-5 grid grid-cols-3 gap-3 pb-6">
          {EXPLORE_CATEGORIES.map((cat, i) => (
            <div key={cat.id} className={`flex flex-col items-center justify-center p-4 rounded-[2rem] shadow-premium-sm border card-lift animate-fade-in ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-100/50'
            }`} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-2 bg-gradient-to-br ${cat.gradient} shadow-lg text-white`}>
                {cat.icon}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-tighter text-center leading-none ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                {cat.name}
              </span>
            </div>
          ))}
        </div>

        {/* Buddies Nearby (Previous) */}
        <div className="px-5 mb-6">
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
              <div key={i} className="flex flex-col items-center animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
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

        {/* Live Stories / Reels Bar */}
        <div className="mt-4 px-5">
          <div className="flex space-x-3 overflow-x-auto hide-scrollbar pb-2 pt-1">
            {/* Create Story */}
            <div className="flex flex-col items-center flex-shrink-0" onClick={() => navigate('/upload-reel')}>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-sm active:scale-95 transition-transform">
                <div className={`w-full h-full rounded-full border-2 border-transparent flex items-center justify-center text-white text-2xl font-bold ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-600">+</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Go Live</span>
            </div>

            {/* Active Providers */}
            {REELS_DATA.slice(0, 5).map((reel, i) => (
              <div key={i} className="flex flex-col items-center flex-shrink-0 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => navigate('/reels')}>
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-[2px] shadow-sm cursor-pointer active:scale-95 transition-transform">
                    <div className={`w-full h-full rounded-full border-2 flex items-center justify-center overflow-hidden ${isDarkMode ? 'border-slate-900 bg-slate-800' : 'border-white bg-gray-100'}`}>
                      <span className="text-xl">{['🔧', '🍳', '💃', '📸', '🧹'][i]}</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded border border-white uppercase animate-pulse">Live</div>
                </div>
                <span className={`text-[10px] font-bold mt-1.5 w-16 truncate text-center ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{reel.creator.replace('@', '')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Spots (What's happening near you) */}
        <div className="px-5 mt-6 mb-3 flex items-center justify-between">
          <h2 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Happening Near You</h2>
          <button className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">See All</button>
        </div>
        <div className="px-5 space-y-3">
          {LOCAL_SPOTS.slice(0, 3).map((spot, i) => (
            <div key={spot.id} className={`rounded-2xl border overflow-hidden shadow-premium flex animate-slide-up ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-100/50'
            }`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`w-20 bg-gradient-to-br ${SPOT_GRADIENTS[spot.type] || 'from-gray-400 to-gray-600'} flex items-center justify-center text-2xl flex-shrink-0`}>
                {SPOT_IMAGES[spot.type] || '📍'}
              </div>
              <div className="flex-1 p-3">
                <div className="flex justify-between items-start">
                  <span className="text-[7px] font-black uppercase tracking-widest text-gray-400">{spot.type}</span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>{spot.distance}</span>
                </div>
                <h3 className={`font-bold text-xs mt-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{spot.title}</h3>
                <p className={`text-[9px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{spot.status} • {spot.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* The Feed (New) */}
        <div className="px-5 flex items-center justify-between mt-8 mb-2">
          <h2 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Neighborhood Pulse</h2>
          <span className="text-[10px] font-bold text-indigo-500 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
            <span>LIVE</span>
          </span>
        </div>
        <div className="px-3 space-y-4">
          {FEED_DATA.map((item, index) => (
            <div key={index} className={`rounded-3xl border overflow-hidden shadow-sm animate-slide-up ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`} style={{ animationDelay: `${index * 0.1}s` }}>
              {/* Pulse Feed Content (Same as before) */}
              {item.type === 'alert' && (
                <div className="p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full"></div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl shadow-inner">⚖️</div>
                    <div>
                      <h3 className="text-xs font-black text-red-500 uppercase tracking-wider">Community Vote</h3>
                      <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{item.data.name} • 3.2k members</p>
                    </div>
                  </div>
                  <h4 className={`text-sm font-black mb-2 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.data.title}</h4>
                  <p className={`text-xs leading-relaxed mb-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>{item.data.desc}</p>
                  
                  {/* Poll UI */}
                  <div className="space-y-2 mb-3">
                    <div className="relative h-10 rounded-xl overflow-hidden border border-red-200 bg-red-50 cursor-pointer active:scale-[0.98] transition-transform">
                      <div className="absolute top-0 left-0 bottom-0 bg-red-200 w-[78%] transition-all"></div>
                      <div className="absolute inset-0 flex items-center justify-between px-4 text-xs font-black text-red-900">
                        <span>Yes, Suspend</span>
                        <span>78%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {item.type === 'vendor' && (
                <div className="p-4 relative">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl shadow-inner">{item.data.icon}</div>
                    <div>
                      <h3 className="text-xs font-black text-indigo-500 uppercase tracking-wider">Vendor Broadcast</h3>
                      <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{item.data.name} • {item.data.members}</p>
                    </div>
                  </div>
                  <h4 className={`text-sm font-black mb-2 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.data.title}</h4>
                  <p className={`text-xs leading-relaxed mb-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>{item.data.desc}</p>
                  <button className="w-full bg-indigo-600 text-white text-[10px] font-black py-2.5 rounded-xl uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-transform">
                    Claim Deal Now
                  </button>
                </div>
              )}

              {item.type === 'spot' && (
                <div className="flex">
                  <div className={`w-24 bg-gradient-to-br ${SPOT_GRADIENTS[item.data.type] || 'from-gray-400 to-gray-600'} flex items-center justify-center text-3xl flex-shrink-0`}>
                    {SPOT_IMAGES[item.data.type] || '📍'}
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400">{item.data.type}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>{item.data.distance}</span>
                    </div>
                    <h3 className={`font-bold text-sm mt-0.5 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.data.title}</h3>
                    <p className={`text-[10px] mt-1 mb-3 leading-snug ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{item.data.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.data.status === 'Open Now' || item.data.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                        {item.data.status}
                      </span>
                      <button className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Visit →</button>
                    </div>
                  </div>
                </div>
              )}
              {item.type === 'reel' && (
                <div className="relative h-72 w-full group cursor-pointer" onClick={() => navigate('/reels')}>
                  <video src={item.data.videoUrl} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white text-sm font-black">{item.data.creator}</h3>
                    <p className="text-white/80 text-xs mt-1">{item.data.desc}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    )}
  </div>
  );
};

export default ExploreScreen;
