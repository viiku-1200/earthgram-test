import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { COMMUNITY_GROUPS, REELS_DATA, LOCAL_SPOTS, EXPLORE_CATEGORIES, COUNTRIES } from '../../data/constants';
import { createUserIcon } from '../maps/ScopeMap';
import ExploreVideoPlayer from './ExploreVideoPlayer';

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
  { name: 'Amit', initials: 'AS', gradient: 'from-blue-500 to-indigo-600', online: true, hobby: 'Tech' },
  { name: 'Priya', initials: 'PV', gradient: 'from-pink-500 to-rose-600', online: false, hobby: 'Music' },
  { name: 'Rahul', initials: 'RG', gradient: 'from-emerald-500 to-teal-600', online: false, hobby: 'Sports' },
  { name: 'Neha', initials: 'NS', gradient: 'from-purple-500 to-violet-600', online: true, hobby: 'Fitness' },
  { name: 'Kabir', initials: 'KP', gradient: 'from-amber-500 to-orange-600', online: false, hobby: 'Sports' },
];

const SPOT_IMAGES = { 'Dance Studio': '🎶', 'Empty Room': '🏡', 'Local Food': '🍱', 'Gym': '💪' };
const SPOT_GRADIENTS = { 'Dance Studio': 'from-pink-500 to-purple-600', 'Empty Room': 'from-teal-500 to-cyan-600', 'Local Food': 'from-orange-500 to-red-500', 'Gym': 'from-gray-700 to-gray-900' };

const EXPLORE_ADS = [
  { id: 'ex-ad-1', brand: 'Signature Realty', tagline: 'Unlock your dream luxury villa in Ghaziabad', icon: '🏰', gradient: 'from-slate-800 to-slate-900', reward: 0.15 },
  { id: 'ex-ad-2', brand: 'Elite Tech', tagline: 'Premium accessories for your lifestyle', icon: '⌚', gradient: 'from-indigo-800 to-slate-900', reward: 0.15 },
];

// LIVE MAP DATA
const DEFAULT_CENTER = [28.6692, 77.4538]; // Sector 4, Ghaziabad (fallback)
const LIVE_DRIVERS = [
  { id: 1, name: 'Tractor (Ravi)', pos: [28.6710, 77.4550], type: 'transport', status: 'moving' },
  { id: 2, name: 'Mandi Express', pos: [28.6650, 77.4500], type: 'mandi', status: 'stationary' },
];

// Helper: get center position for a country
const getCountryCenter = (countryId) => {
  const country = COUNTRIES.find(c => c.id === countryId);
  return country?.gps || DEFAULT_CENTER;
};

// Map Controller to handle zoom/center changes based on scope + country
const MapController = ({ activeScope, countryCenter, selectedCountry, userPos }) => {
  const map = useMap();
  useEffect(() => {
    const activeCenter = (selectedCountry === 'in' && userPos) ? userPos : countryCenter;

    if (activeScope === 'local') {
      // Local: zoom into user's live GPS or country capital at street level
      map.flyTo(activeCenter, 14, { duration: 1.5 });
    } else if (activeScope === 'city') {
      // City: show the city area
      map.flyTo(activeCenter, 12, { duration: 1.5 });
    } else if (activeScope === 'national') {
      // National: show the whole country
      map.flyTo(countryCenter, 5, { duration: 1.5 });
    } else if (activeScope === 'global') {
      // Global: show the whole world
      map.flyTo([20, 0], 2, { duration: 1.5 });
    }
  }, [activeScope, countryCenter, selectedCountry, userPos, map]);
  return null;
};

const MapTabView = ({ isDarkMode, qualityPosts = [], activeScope, userPos, countryCenter, selectedCountry }) => {
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

  // Get selected country's name for dynamic filtering
  const selectedCountryData = COUNTRIES.find(c => c.id === selectedCountry);
  const selectedCountryName = selectedCountryData?.name || 'India';
  const selectedCapitalName = selectedCountryData?.capital || 'Ghaziabad';

  // Filter Pins based on Scope
  const filteredQualityPosts = qualityPosts.filter(p => {
    if (!p.location) return true;
    if (typeof p.location === 'string') return true; // Legacy strings show everywhere
    if (activeScope === 'global') return true;
    if (activeScope === 'national') return p.location.country === selectedCountryName;
    if (activeScope === 'city') return p.location.city === selectedCapitalName;
    if (activeScope === 'local') return p.location.neighborhood === 'Sector 4';
    return true;
  });

  const activeCenter = (selectedCountry === 'in' && userPos) ? userPos : countryCenter;

  return (
    <div className="h-full relative overflow-hidden animate-fade-in">
      <MapContainer center={activeCenter} zoom={14} className="h-full w-full z-0">
        <MapController activeScope={activeScope} countryCenter={countryCenter} selectedCountry={selectedCountry} userPos={userPos} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className={isDarkMode ? "dark-map-tiles" : ""}
          attribution='&copy; OpenStreetMap'
        />

        {/* Real User Location or Country Capital */}
        <Marker position={activeCenter} icon={createUserIcon()}>
          <Popup>{(selectedCountry === 'in' && userPos) ? '📍 You are here' : '🏛️ Capital Center'}</Popup>
        </Marker>

        {/* Capital City Marker — visible in National/Global scope */}
        {(activeScope === 'national' || activeScope === 'global') && countryCenter && (
          <Marker position={countryCenter} icon={createUserIcon()}>
            <Popup>
              <div className="p-1 text-center">
                <p className="font-bold text-sm">{COUNTRIES.find(c => c.id === selectedCountry)?.flag} {COUNTRIES.find(c => c.id === selectedCountry)?.capital}</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Capital · {COUNTRIES.find(c => c.id === selectedCountry)?.name}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Live Driver (Simulated Movement) - Only visible in Local/City */}
        {(activeScope === 'local' || activeScope === 'city') && (
          <>
            <Marker position={driverPos}>
              <Popup>
                <div className="p-1">
                  <p className="font-bold">🚜 Ravi (Tractor)</p>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Live • Moving Now</p>
                </div>
              </Popup>
            </Marker>
            <Marker position={LIVE_DRIVERS[1].pos}>
              <Popup>
                <div className="p-1">
                  <p className="font-bold">🌾 Sector 4 Mandi</p>
                  <button className="mt-2 w-full bg-slate-900 text-white text-[10px] py-1 rounded-lg">Check Prices</button>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Live Quality Check Jury Pins - Filtered */}
        {filteredQualityPosts.map((post, i) => {
          const offset = (i + 1) * 0.0015;
          const pinPos = [userPos[0] + offset, userPos[1] + offset * 0.5];
          return (
            <Marker key={post.id} position={pinPos}>
              <Popup>
                <div className="p-1">
                  <p className="font-bold text-rose-600">⚖️ {post.provider}</p>
                  <p className="text-[10px] text-slate-500">{post.providerCategory}</p>
                  <p className="text-[10px] font-bold mt-1">
                    Forgive: {post.votes.forgive}% | Suspend: {post.votes.suspend}%
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Info Overlay */}
      <div className="absolute bottom-6 left-6 right-6 z-10">
        <div className={`p-4 rounded-[2rem] shadow-2xl backdrop-blur-xl border ${isDarkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activeScope} Radar</h3>
              <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                {filteredQualityPosts.length} jury cases in scope
              </p>
            </div>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-black border-2 border-white animate-pulse">⚖️</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExploreScreen = ({ isDarkMode, adCoins, setAdCoins, qualityPosts = [], userReels = [], localEvents = [], setLocalEvents, activeScope: propActiveScope = 'local', selectedCountry = 'in' }) => {
  const activeScope = propActiveScope === 'global' ? 'national' : propActiveScope;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pulse');
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeExploreVideoIndex, setActiveExploreVideoIndex] = useState(null);
  const [exploreVideoFeed, setExploreVideoFeed] = useState([]);
  
  // Real-Time Location State
  const [userPos, setUserPos] = useState(() => {
    const saved = localStorage.getItem('earthgram_user_gps');
    return saved ? [JSON.parse(saved).lat, JSON.parse(saved).lng] : null;
  });

  useEffect(() => {
    const updateLocation = () => {
      const saved = localStorage.getItem('earthgram_user_gps');
      if (saved) setUserPos([JSON.parse(saved).lat, JSON.parse(saved).lng]);
    };
    window.addEventListener('earthgram_location_updated', updateLocation);
    return () => window.removeEventListener('earthgram_location_updated', updateLocation);
  }, []);

  // AD STATE
  const [activeMiningAd, setActiveMiningAd] = useState(null);
  const [miningTimer, setMiningTimer] = useState(0);
  const [showBurst, setShowBurst] = useState(false);

  // --- NEIGHBORHOOD FEATURES STATES ---
  const [selectedHobby, setSelectedHobby] = useState('All');

  const [buddies, setBuddies] = useState(BUDDY_DATA);
  const [joinedChallenges, setJoinedChallenges] = useState({});

  const trendingChallenges = useMemo(() => {
    const tagCounts = {}; // { tag: { count: number, users: Set<string> } }
    
    userReels.forEach(reel => {
      if (reel.tags && Array.isArray(reel.tags)) {
        reel.tags.forEach(tag => {
          if (!tagCounts[tag]) {
            tagCounts[tag] = { count: 0, users: new Set() };
          }
          tagCounts[tag].count += 1;
          // Collect the creator's avatar or username if avatar is missing
          if (reel.avatar) {
             tagCounts[tag].users.add(reel.avatar);
          } else if (reel.creator) {
             tagCounts[tag].users.add(reel.creator[0].toUpperCase());
          }
        });
      }
    });

    const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b].count - tagCounts[a].count);
    
    const computedChallenges = sortedTags.map((tag, idx) => {
      const gradients = [
        'from-orange-500 to-red-500',
        'from-emerald-400 to-teal-600',
        'from-indigo-500 to-purple-600',
        'from-pink-500 to-rose-500',
      ];
      const icons = ['🔥', '✨', '🚀', '🌟', '💥'];
      
      return {
        id: `computed_${tag}`,
        tag: tag,
        videos: tagCounts[tag].count,
        gradient: gradients[idx % gradients.length],
        icon: icons[idx % icons.length],
        // If we don't have enough users, pad with generic color circles just for UI consistency
        users: Array.from(tagCounts[tag].users),
        joined: !!joinedChallenges[`computed_${tag}`]
      };
    });

    // Default fallback challenges
    const fallbackChallenges = [
      { id: 'c1', tag: '#Sector4StreetFood', videos: 1200, gradient: 'from-orange-500 to-red-500', icon: '🍜', users: ['bg-blue-400', 'bg-emerald-400', 'bg-purple-400'], joined: !!joinedChallenges['c1'] },
      { id: 'c2', tag: '#MorningRunGC', videos: 850, gradient: 'from-emerald-400 to-teal-600', icon: '🏃‍♂️', users: ['bg-pink-400', 'bg-orange-400', 'bg-yellow-400'], joined: !!joinedChallenges['c2'] },
      { id: 'c3', tag: '#LocalTalent', videos: 3400, gradient: 'from-indigo-500 to-purple-600', icon: '🎸', users: ['bg-red-400', 'bg-blue-400', 'bg-green-400'], joined: !!joinedChallenges['c3'] }
    ];

    // Combine computed and fallbacks to ensure we have at least 3
    const finalChallenges = [...computedChallenges];
    let fallbackIndex = 0;
    while (finalChallenges.length < 3 && fallbackIndex < fallbackChallenges.length) {
      const fb = fallbackChallenges[fallbackIndex];
      if (!finalChallenges.find(c => c.tag === fb.tag)) {
        finalChallenges.push(fb);
      }
      fallbackIndex++;
    }

    return finalChallenges.slice(0, 3);
  }, [userReels, joinedChallenges]);
  const [tickerItems, setTickerItems] = useState([]);

  // Setup initial ticker items based on location
  useEffect(() => {
    const savedAddr = localStorage.getItem('earthgram_user_address') || '';
    const areaName = savedAddr ? savedAddr.split(',')[0].trim() : 'Live';
    const isGC = areaName.toLowerCase().includes('gaur city') || areaName.toLowerCase().includes('gc');
    
    setTickerItems([
      { id: 't1', icon: isGC ? '🏥' : '🌾', label: isGC ? 'Health' : 'Mandi', text: isGC ? 'Dr. Rajesh: Same-day KFT/CBC tests available in GC-2' : 'Wheat ₹2,125 (+1.2%)', color: 'text-emerald-500' },
      { id: 't2', icon: '🚜', label: 'Service', text: isGC ? `AC Servicing slots open in ${areaName} for tomorrow` : 'Tractor Rental live in Sector 4', color: 'text-indigo-500' },
      { id: 't3', icon: '🌤️', label: 'Weather', text: `Clear skies over ${areaName} today`, color: 'text-amber-500' },
      { id: 't4', icon: '🌍', label: isGC ? 'Society' : 'Global', text: isGC ? 'Community Meeting at 7 PM in Club House' : 'New Agency in Dubai', color: 'text-purple-500' }
    ]);
  }, []);

  // Simulated Real-Time Engine
  useEffect(() => {
    const realTimeEngine = setInterval(() => {
      // 1. Randomly toggle buddy online status
      setBuddies(prev => {
        const next = [...prev];
        const randomIdx = Math.floor(Math.random() * next.length);
        next[randomIdx] = { ...next[randomIdx], online: !next[randomIdx].online };
        return next;
      });

      // (Trending challenge calculation is now fully real-time based on userReels)
    }, 3500); // Fire every 3.5 seconds

    const tickerEngine = setInterval(() => {
      // 3. Occasionally add a new ticker item
      setTickerItems(prev => {
        if (prev.length === 0) return prev;
        const newEvents = [
          { id: Date.now().toString(), icon: '🚨', label: 'Alert', text: 'Traffic jam at Sector 4 crossing', color: 'text-red-500' },
          { id: Date.now().toString(), icon: '🏷️', label: 'Deal', text: '50% off at Sharma Cafe for 1hr', color: 'text-orange-500' },
          { id: Date.now().toString(), icon: '🎉', label: 'Event', text: 'Yoga starting in 10 mins', color: 'text-pink-500' }
        ];
        const randomEvent = newEvents[Math.floor(Math.random() * newEvents.length)];
        return [randomEvent, ...prev.slice(0, 4)];
      });
    }, 15000); // Fire every 15 seconds

    return () => {
      clearInterval(realTimeEngine);
      clearInterval(tickerEngine);
    };
  }, []);

  const handleJoinChallenge = (e, id) => {
    e.stopPropagation();
    setJoinedChallenges(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const [localPolls, setLocalPolls] = useState(() => {
    const saved = localStorage.getItem('earthgram_local_polls');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'poll-1',
        question: 'Should we install solar street lights in the local park? 💡',
        options: [
          { label: 'Yes, definitely', votes: 142 },
          { label: 'No, too expensive', votes: 38 }
        ],
        userVoted: null,
        totalVotes: 180
      },
      {
        id: 'poll-2',
        question: 'Are you facing water pressure issues this morning? 🚰',
        options: [
          { label: 'Yes, very low pressure', votes: 76 },
          { label: 'No, it is normal', votes: 121 }
        ],
        userVoted: null,
        totalVotes: 197
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('earthgram_local_polls', JSON.stringify(localPolls));
  }, [localPolls]);

  // Handle Poll Voting
  const handleVotePoll = (pollId, optionIndex) => {
    setLocalPolls(prev => prev.map(p => {
      if (p.id !== pollId) return p;
      if (p.userVoted !== null) return p; // prevent double voting
      const updatedOptions = p.options.map((opt, idx) => {
        if (idx === optionIndex) {
          return { ...opt, votes: opt.votes + 1 };
        }
        return opt;
      });
      return {
        ...p,
        options: updatedOptions,
        userVoted: optionIndex,
        totalVotes: p.totalVotes + 1
      };
    }));
  };

  // Handle Event RSVP
  const handleToggleRSVP = (eventId) => {
    if (setLocalEvents) {
      setLocalEvents(prev => prev.map(ev => {
        if (ev.id !== eventId) return ev;
        const userJoined = !ev.userJoined;
        return {
          ...ev,
          userJoined,
          attendees: userJoined ? ev.attendees + 1 : ev.attendees - 1
        };
      }));
    }
  };

  // Get selected country's name for dynamic filtering
  const selectedCountryData = COUNTRIES.find(c => c.id === selectedCountry);
  const selectedCountryName = selectedCountryData?.name || 'India';
  const selectedCapitalName = selectedCountryData?.capital || 'Ghaziabad';

  // Filtering logic for the feed based on activeScope
  const filteredQualityPosts = qualityPosts.filter(p => {
    // No location data = show everywhere
    if (!p.location) return true;
    // Old format: location is a string like "Sector 4, Gaur City"
    if (typeof p.location === 'string') {
      if (activeScope === 'global' || activeScope === 'national') return true;
      if (activeScope === 'city') return true;
      if (activeScope === 'local') return true;
      return true;
    }
    // New format: location is an object { neighborhood, city, country }
    if (activeScope === 'global') return true;
    if (activeScope === 'national') return p.location.country === selectedCountryName;
    if (activeScope === 'city') return p.location.city === selectedCapitalName;
    if (activeScope === 'local') return p.location.neighborhood === 'Sector 4';
    return true;
  });

  const filteredUserReels = userReels.filter(r => {
    if (!r.location) return true;
    if (typeof r.location === 'string') return true;
    if (activeScope === 'global') return true;
    if (activeScope === 'national') return r.location.country === selectedCountryName;
    if (activeScope === 'city') return r.location.city === selectedCapitalName;
    if (activeScope === 'local') return r.location.neighborhood === 'Sector 4';
    return true;
  });

  // Dynamic real-time feed: user reels + static base content
  const BASE_FEED_DATA = [
    // User-uploaded reels (Filtered)
    ...filteredUserReels.map(reel => ({ type: 'userReel', data: reel })),
    // Static base content
    { type: 'ad', data: EXPLORE_ADS[0] },
    { type: 'reel', data: REELS_DATA[0] },
    { type: 'vendor', data: COMMUNITY_GROUPS[1] },
    { type: 'ad', data: EXPLORE_ADS[1] },
    { type: 'reel', data: REELS_DATA[1] },
    { type: 'spot', data: LOCAL_SPOTS[2] },
  ];

  const FEED_DATA = [];
  let widgetIndex = 0;
  const WIDGETS = ['widget_challenges', 'widget_happening_near_you'];

  BASE_FEED_DATA.forEach((item) => {
    FEED_DATA.push(item);
    // Inject a widget after every video/ad if we have widgets left
    if (item.type === 'reel' || item.type === 'userReel' || item.type === 'ad') {
       if (widgetIndex < WIDGETS.length) {
          FEED_DATA.push({ type: WIDGETS[widgetIndex] });
          widgetIndex++;
       }
    }
  });
  // If no videos triggered the widgets, push remaining widgets at the end
  while (widgetIndex < WIDGETS.length) {
     FEED_DATA.push({ type: WIDGETS[widgetIndex] });
     widgetIndex++;
  }

  const openExploreVideo = (clickedItem) => {
    const videoItems = FEED_DATA.filter(item => item.type === 'reel' || item.type === 'userReel');
    const index = videoItems.findIndex(item => item.data === clickedItem.data);
    setExploreVideoFeed(videoItems);
    setActiveExploreVideoIndex(index >= 0 ? index : 0);
  };

  const handleScroll = (e) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      setShowHeader(false); // Hide on scroll down
    } else {
      setShowHeader(true); // Show on scroll up
    }
    setLastScrollY(currentScrollY);
  };

  const startMining = (ad) => {
    setActiveMiningAd(ad);
    setMiningTimer(5);
  };

  useEffect(() => {
    let interval;
    if (miningTimer > 0) {
      interval = setInterval(() => {
        setMiningTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            completeMining();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [miningTimer]);

  const completeMining = () => {
    setShowBurst(true);
    if (setAdCoins) setAdCoins(prev => parseFloat((prev + 0.15).toFixed(2)));
    setTimeout(() => {
      setShowBurst(false);
      setActiveMiningAd(null);
    }, 1500);
  };

  return (
  <div className="h-full relative overflow-hidden">
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
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            📍 {activeScope === 'local' ? 'Sector 4, Ghaziabad' : activeScope === 'city' ? 'Ghaziabad City' : activeScope === 'national' ? 'India' : 'Worldwide'}
          </p>
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
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <div key={`${item.id}-${i}`} className="flex items-center space-x-2 px-8 whitespace-nowrap">
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
      <MapTabView 
        isDarkMode={isDarkMode} 
        qualityPosts={qualityPosts} 
        activeScope={activeScope}
        selectedCountry={selectedCountry}
        countryCenter={getCountryCenter(selectedCountry)}
        userPos={userPos || getCountryCenter(selectedCountry)} 
      />
    ) : activeTab === 'deals' ? (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center animate-fade-in">
        <div className="text-6xl mb-4">🏷️</div>
        <h2 className="text-xl font-black mb-2">Village Deals Coming Soon</h2>
        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>We are connecting with local shop owners to bring you the best prices.</p>
        <button onClick={() => setActiveTab('pulse')} className="mt-6 px-6 py-3 bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/30">Go Back to Pulse</button>
      </div>
    ) : (
      <>
        {/* Top Sticky Bar: Search + Live Stories */}
        <div className="px-5 pt-4 pb-2 z-10 sticky top-0 bg-inherit">
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

        {/* Discover Interests (Moved right below Search) */}
        <div className="px-5 mt-2 mb-2">
          <h2 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Discover Interests</h2>
        </div>
        <div className="px-5 grid grid-cols-3 gap-3 pb-6">
          {EXPLORE_CATEGORIES.map((cat, i) => (
            <div key={cat.id} className={`flex flex-col items-center justify-center p-4 rounded-[2rem] shadow-premium-sm border card-lift animate-fade-in ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-100/50'
            }`} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-2 bg-gradient-to-br ${cat.gradient} shadow-lg text-white`}>{cat.icon}</div>
              <span className={`text-[9px] font-black uppercase tracking-tighter text-center leading-none ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{cat.name}</span>
            </div>
          ))}
        </div>

        {/* Buddies Nearby (Moved right below Discover Interests) */}
        <div className="px-5 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Buddies Nearby</h2>
            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 ${
              isDarkMode ? 'text-indigo-400 bg-indigo-500/10' : 'text-indigo-600 bg-indigo-50'
            }`}>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full online-dot"></span>
              <span>Radar Active</span>
            </span>
          </div>
          <div className="flex space-x-2 overflow-x-auto hide-scrollbar mb-3">
            {['All', 'Sports', 'Music', 'Fitness', 'Tech'].map(hobby => (
              <button
                key={hobby}
                onClick={() => setSelectedHobby(hobby)}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all flex-shrink-0 ${
                  selectedHobby === hobby
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isDarkMode 
                      ? 'bg-slate-800 text-slate-400 hover:text-slate-200' 
                      : 'bg-white border border-gray-100 text-gray-500 shadow-sm hover:text-gray-700'
                }`}
              >
                {hobby === 'All' ? '🌐 All' : hobby === 'Sports' ? '⚽ Sports' : hobby === 'Music' ? '🎵 Music' : hobby === 'Fitness' ? '💪 Fitness' : '💻 Tech'}
              </button>
            ))}
          </div>
          <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2">
            {buddies.filter(b => selectedHobby === 'All' || b.hobby === selectedHobby).map((buddy, i) => (
              <div key={i} className="flex flex-col items-center animate-fade-in cursor-pointer active:scale-95 transition-transform flex-shrink-0" onClick={() => { alert(`Opening Direct Message with ${buddy.name}...`); navigate('/messages'); }}>
                <div className="relative">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${buddy.gradient} flex items-center justify-center text-white text-sm font-bold shadow-premium ${buddy.online ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}>
                    {buddy.initials}
                  </div>
                  {buddy.online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full online-dot"></div>}
                </div>
                <span className={`text-[10px] font-bold mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>{buddy.name}</span>
                <span className="text-[7px] font-black uppercase tracking-widest text-indigo-500 mt-0.5">{buddy.hobby}</span>
              </div>
            ))}
            {BUDDY_DATA.filter(b => selectedHobby === 'All' || b.hobby === selectedHobby).length === 0 && (
              <div className="text-[10px] font-bold text-gray-400 py-4 w-full text-center">No buddies found with this interest nearby.</div>
            )}
          </div>
        </div>

        {/* Live Stories / Reels Bar */}
        <div className="mt-2 px-5 mb-4">
          <div className="flex space-x-3 overflow-x-auto hide-scrollbar pb-2 pt-1">
            <div className="flex flex-col items-center flex-shrink-0" onClick={() => navigate('/upload-reel')}>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-sm active:scale-95 transition-transform">
                <div className={`w-full h-full rounded-full border-2 border-transparent flex items-center justify-center text-white text-2xl font-bold ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-600">+</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Go Live</span>
            </div>

            {REELS_DATA.slice(0, 5).map((reel, i) => (
              <div key={i} className="flex flex-col items-center flex-shrink-0 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => {
                const videoItems = REELS_DATA.slice(0, 5).map(r => ({ type: 'reel', data: r }));
                setExploreVideoFeed(videoItems);
                setActiveExploreVideoIndex(i);
              }}>
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

        {/* The Feed (Integrated with Widgets) */}
        <div className="px-5 flex items-center justify-between mb-3">
          <h2 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Neighborhood Pulse</h2>
          <span className="text-[10px] font-bold text-indigo-500 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
            <span>LIVE</span>
          </span>
        </div>
        <div className="px-3 space-y-4">
          {FEED_DATA.map((item, index) => {
            // Widget: Happening Near You
            if (item.type === 'widget_happening_near_you') {
              return (
                <div key={`widget-near-${index}`} className="my-4 pt-2 pb-2">
                  <div className="px-2 mb-3 flex items-center justify-between">
                    <h2 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Happening Near You</h2>
                    <button className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">See All</button>
                  </div>
                  <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-4 px-2">
                    {/* Active Local Meetups listed first */}
                    {localEvents.map(ev => {
                      const eventIcon = ev.id === 'event-1' ? '⚽' : ev.id === 'event-2' ? '🧘‍♀️' : '💻';
                      const eventGradient = ev.id === 'event-1' ? 'from-orange-500 to-rose-500' : ev.id === 'event-2' ? 'from-teal-400 to-emerald-600' : 'from-indigo-500 to-purple-600';
                      
                      return (
                        <div key={ev.id} className={`h-[240px] w-[200px] rounded-[2rem] border overflow-hidden shadow-premium flex flex-col flex-shrink-0 transition-all duration-300 hover:shadow-premium-md ${
                          isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-gray-100'
                        }`}>
                          {/* Top Graphic Panel */}
                          <div className={`h-24 bg-gradient-to-br ${eventGradient} flex items-center justify-center text-4xl relative text-white shadow-inner flex-shrink-0`}>
                            {eventIcon}
                            <span className="absolute top-3 left-3 bg-rose-500 text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-md">Live Event</span>
                            <div className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full animate-ping"></div>
                            <div className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full"></div>
                          </div>

                          {/* Bottom Details Panel */}
                          <div className="p-3 flex flex-col justify-between flex-1">
                            <div>
                              <h3 className={`font-black text-[11px] leading-snug line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{ev.title}</h3>
                              <p className={`text-[8px] font-black uppercase tracking-wider mt-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                📅 {ev.time}
                              </p>
                              <p className={`text-[9px] mt-1.5 line-clamp-2 leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{ev.desc}</p>
                            </div>

                            <div className="mt-2 pt-2 border-t border-slate-100/50 flex items-center justify-between">
                              <span className={`text-[8px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                +{ev.attendees} going
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleRSVP(ev.id);
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                                  ev.userJoined
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                    : isDarkMode
                                      ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20'
                                }`}
                              >
                                {ev.userJoined ? 'Joined' : 'RSVP'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Bookable Spots / Spaces listed second */}
                    {LOCAL_SPOTS.slice(0, 3).map((spot) => (
                      <div key={spot.id} className={`h-[240px] w-[200px] rounded-[2rem] border overflow-hidden shadow-premium flex flex-col flex-shrink-0 transition-all duration-300 hover:shadow-premium-md ${
                        isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-gray-100'
                      }`}>
                        {/* Top Graphic Panel */}
                        <div className={`h-24 bg-gradient-to-br ${SPOT_GRADIENTS[spot.type] || 'from-gray-400 to-gray-600'} flex items-center justify-center text-4xl relative text-white shadow-inner flex-shrink-0`}>
                          {SPOT_IMAGES[spot.type] || '📍'}
                          <span className="absolute top-3 left-3 bg-slate-700 text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">Space</span>
                          <span className="absolute top-3 right-3 bg-black/40 text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">{spot.distance}</span>
                        </div>

                        {/* Bottom Details Panel */}
                        <div className="p-3 flex flex-col justify-between flex-1">
                          <div>
                            <h3 className={`font-black text-[11px] leading-snug line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{spot.title}</h3>
                            <p className={`text-[8px] font-black uppercase tracking-wider mt-1 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                              🟢 {spot.status}
                            </p>
                            <p className={`text-[9px] mt-1.5 line-clamp-2 leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{spot.desc}</p>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-100/50 flex items-center justify-between">
                            <span className={`text-[8px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                              {spot.type}
                            </span>
                            <button 
                              onClick={() => navigate('/book')}
                              className="px-2.5 py-1.5 rounded-lg text-[8px] font-black bg-slate-900 hover:bg-slate-850 text-white uppercase tracking-widest active:scale-95 transition-all shadow-md"
                            >
                              Book
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // Widget: Trending Challenges
            if (item.type === 'widget_challenges') {
              return (
                <div key={`widget-challenges-${index}`} className="my-6 pt-2 pb-4">
                  <div className="px-5 flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center shadow-lg animate-bounce-slow">
                        <span className="text-white text-xs">🔥</span>
                      </div>
                      <h2 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Trending Nearby</h2>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-pink-500">View All</span>
                  </div>
                  
                  <div className="flex space-x-4 overflow-x-auto hide-scrollbar px-5 pb-4">
                    {trendingChallenges.map((challenge) => (
                      <div key={challenge.id} className={`relative w-36 h-48 rounded-[1.5rem] flex-shrink-0 overflow-hidden shadow-premium group cursor-pointer transition-transform active:scale-95 ${
                        isDarkMode ? 'border border-slate-700/50' : ''
                      }`} onClick={() => openExploreVideo({ type: 'reel', data: REELS_DATA[0] })}>
                        <div className={`absolute inset-0 bg-gradient-to-b ${challenge.gradient} opacity-90`}></div>
                        
                        <div className="absolute top-3 left-3 w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner border border-white/20">
                          {challenge.icon}
                        </div>
                        
                        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md rounded-full px-2 py-1 flex items-center space-x-1 border border-white/10">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                          <span className="text-white text-[7px] font-black uppercase tracking-widest">
                            {challenge.videos >= 1000 ? (challenge.videos / 1000).toFixed(1) + 'k' : challenge.videos}
                          </span>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-8">
                          <h3 className="text-white font-black text-xs mb-1 line-clamp-1">{challenge.tag}</h3>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex -space-x-1.5">
                              {challenge.users.slice(0, 3).map((userOrBg, i) => (
                                <div key={i} className={`w-5 h-5 rounded-full border-2 border-black flex items-center justify-center overflow-hidden shadow-sm ${
                                  userOrBg.startsWith('bg-') ? userOrBg : 'bg-gray-800'
                                }`}>
                                  {!userOrBg.startsWith('bg-') && (
                                    <span className="text-[10px] leading-none text-white">{userOrBg}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                            <button 
                              onClick={(e) => handleJoinChallenge(e, challenge.id)}
                              className={`backdrop-blur-md border px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                                challenge.joined 
                                  ? 'bg-white text-indigo-600 border-white shadow-md' 
                                  : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                              }`}>
                              {challenge.joined ? 'Joined' : 'Join'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // Standard Feed Item
            return (
              <div key={`feed-${index}`} className={`rounded-3xl border overflow-hidden shadow-sm animate-slide-up ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`} style={{ animationDelay: `${index * 0.1}s` }}>
                {item.type === 'userReel' && (
                  <div className="relative overflow-hidden cursor-pointer" onClick={() => openExploreVideo(item)}>
                    <div className="relative h-52 w-full">
                      {item.data.mediaType === 'video'
                        ? <video src={item.data.mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                        : <img src={item.data.mediaUrl} alt="reel" className="w-full h-full object-cover" />
                      }
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">✨ Your Post</div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white text-[10px] font-black uppercase tracking-widest">{item.data.category}</p>
                        <p className="text-white/80 text-xs mt-0.5 line-clamp-2">{item.data.caption}</p>
                      </div>
                    </div>
                  </div>
                )}

                {item.type === 'ad' && (
                  <div onClick={() => startMining(item.data)} className={`p-4 relative cursor-pointer active:scale-[0.98] transition-transform ${isDarkMode ? 'bg-slate-800/50' : 'bg-indigo-50/50'}`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner bg-gradient-to-br ${item.data.gradient}`}>{item.data.icon}</div>
                      <div>
                        <h3 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Sponsored Ad</h3>
                        <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{item.data.brand}</p>
                      </div>
                    </div>
                    <h4 className={`text-sm font-black mb-2 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.data.tagline}</h4>
                    <button className="w-full bg-black text-white text-[10px] font-black py-2.5 rounded-xl uppercase tracking-widest shadow-lg active:scale-[0.98] transition-transform">
                      Watch & Earn +0.15 Coins
                    </button>
                  </div>
                )}

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
                  <div className="relative h-72 w-full group cursor-pointer" onClick={() => openExploreVideo(item)}>
                    <video src={item.data.videoUrl} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-white text-sm font-black">{item.data.creator}</h3>
                      <p className="text-white/80 text-xs mt-1">{item.data.desc}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </>
    )}
    </div> {/* End of scrollable container */}

    {/* AD MODAL */}
    {activeMiningAd && (
      <div className="absolute inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 animate-fade-in">
         <div className={`relative w-full max-w-sm rounded-[2rem] p-8 text-center overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
            <div className={`w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center text-5xl mb-8 shadow-lg bg-gradient-to-br ${activeMiningAd.gradient}`}>{activeMiningAd.icon}</div>
            <h2 className={`text-2xl font-black mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activeMiningAd.brand}</h2>
            <p className={`text-sm mb-8 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{activeMiningAd.tagline}</p>
            {miningTimer > 0 ? (
               <div className="flex flex-col items-center space-y-4">
                  <div className={`text-5xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{miningTimer}s</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 animate-pulse">Ad is playing...</p>
               </div>
            ) : (
               <div className="flex flex-col items-center space-y-4">
                  <div className="text-3xl font-black text-emerald-500 animate-bounce tracking-tight">Reward Unlocked</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full">+0.15 COINS ADDED</p>
               </div>
            )}
            {!showBurst && miningTimer === 0 && (
               <button onClick={() => setActiveMiningAd(null)} className="mt-8 w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-transform">Close Ad</button>
            )}
         </div>
      </div>
    )}

    {/* EXPLORE VIDEO PLAYER OVERLAY */}
    {activeExploreVideoIndex !== null && (
      <ExploreVideoPlayer
        feed={exploreVideoFeed}
        initialIndex={activeExploreVideoIndex}
        onClose={() => setActiveExploreVideoIndex(null)}
        isDarkMode={isDarkMode}
        adCoins={adCoins}
        setAdCoins={setAdCoins}
      />
    )}
  </div>
  );
};

export default ExploreScreen;
