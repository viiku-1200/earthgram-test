import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { QUALITY_CHECK_POSTS, CONVERSATIONS, WALLET_TRANSACTIONS } from './data/constants';
import { socket } from './utils/socket';

// Screen Components
// ... (rest remains the same)

// Screen Components
import HomeScreen from './components/screens/HomeScreen';
import ExploreScreen from './components/screens/ExploreScreen';
import ReelsScreen from './components/screens/ReelsScreen';
import CommunityScreen from './components/screens/CommunityScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import ChatScreen from './components/screens/ChatScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import ShopRegisterScreen from './components/screens/ShopRegisterScreen';
import ProviderProfileScreen from './components/screens/ProviderProfileScreen';
import BookingScreen from './components/screens/BookingScreen';
import ProductCatalogScreen from './components/screens/ProductCatalogScreen';
import SearchScreen from './components/screens/SearchScreen';
import ExploreSearchScreen from './components/screens/ExploreSearchScreen';
import MessagingScreen from './components/screens/MessagingScreen';
import WalletScreen from './components/screens/WalletScreen';
import ItzPassScreen from './components/screens/ItzPassScreen';
import ServiceCatalogScreen from './components/screens/ServiceCatalogScreen';
import UploadReelScreen from './components/screens/UploadReelScreen';
import SplashScreen from './components/screens/SplashScreen';
import ActivityScreen from './components/screens/ActivityScreen';
import AuthScreen from './components/screens/AuthScreen';
// botAvatar moved to public folder for direct access

// Layout Components
import PhoneFrame from './components/layout/PhoneFrame';
import BottomNav from './components/layout/BottomNav';
import QuickAccessBar from './components/layout/QuickAccessBar';

const AppContent = () => {
  const [activeScope, setActiveScope] = useState('local');
  const [selectedCountry, setSelectedCountry] = useState(() => localStorage.getItem('earthgram_country') || 'in');
  const [isBossMode, setIsBossMode] = useState(() => localStorage.getItem('earthgram_boss_mode') === 'true');
  const [botMood, setBotMood] = useState('idle');
  const [isRegistered, setIsRegistered] = useState(() => localStorage.getItem('earthgram_registered') === 'true');
  const [companyData, setCompanyData] = useState(() => {
    const saved = localStorage.getItem('earthgram_company_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [showSplash, setShowSplash] = useState(true);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isReelsScrolling, setIsReelsScrolling] = useState(false);
  const [globalCartItems, setGlobalCartItems] = useState([]); // Global cart shared across pages
  const navigate = useNavigate();

  // AUTH STATE
  const [userToken, setUserToken] = useState(() => localStorage.getItem('earthgram_token'));
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('earthgram_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const location = useLocation();
  const [pendingRedirect, setPendingRedirect] = useState(null);

  const handleLoginSuccess = (token, user) => {
    localStorage.setItem('earthgram_token', token);
    localStorage.setItem('earthgram_current_user', JSON.stringify(user));
    setUserToken(token);
    setCurrentUser(user);
    const origin = location.state?.from?.pathname || '/';
    setPendingRedirect(origin);
  };

  // Navigate AFTER state has updated
  useEffect(() => {
    if (pendingRedirect && userToken) {
      navigate(pendingRedirect, { replace: true });
      setPendingRedirect(null);
    }
  }, [pendingRedirect, userToken, navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('earthgram_token');
    localStorage.removeItem('earthgram_current_user');
    localStorage.removeItem('earthgram_registered');
    setUserToken(null);
    setCurrentUser(null);
    setIsRegistered(false);
    setCompanyData(null);
    navigate('/');
  };

  const ProtectedRoute = ({ children }) => {
    if (!userToken && !localStorage.getItem('earthgram_token')) {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    return children;
  };

  useEffect(() => {
    socket.connect();
    // Register as the company brand name if registered, else a default user ID
    const userId = isRegistered && companyData ? companyData.brandName : 'user_default';
    socket.emit('register_user', userId);

    const handleIncomingCall = (data) => {
      setIncomingCall(data);
    };

    socket.on('incoming_call', handleIncomingCall);

    return () => {
      socket.off('incoming_call', handleIncomingCall);
    };
  }, [isRegistered, companyData]);

  // Quality Check Posts — shared real-time state with location tagging
  const [qualityPosts, setQualityPosts] = useState(() => {
    const saved = localStorage.getItem('earthgram_quality_posts');
    if (saved) return JSON.parse(saved);
    
    // Add default location tags to initial data
    return QUALITY_CHECK_POSTS.map((p, i) => ({
      ...p,
      userComments: [],
      userRatings: [],
      location: {
        neighborhood: i % 2 === 0 ? 'Sector 4' : 'Gaur City',
        city: 'Ghaziabad',
        country: 'India'
      }
    }));
  });

  useEffect(() => {
    try {
      localStorage.setItem('earthgram_quality_posts', JSON.stringify(qualityPosts));
    } catch (err) {
      console.warn('Failed to save quality posts to localStorage', err);
    }
  }, [qualityPosts]);

  const addQualityPost = useCallback((newPost) => {
    // Stamp the new post with the user's current location
    const savedAddr = localStorage.getItem('earthgram_user_address') || 'Sector 4, Ghaziabad, India';
    const parts = savedAddr.split(',').map(s => s.trim());
    const stampedPost = {
      ...newPost,
      location: {
        neighborhood: parts[0] || 'Sector 4',
        city: parts[1] || 'Ghaziabad',
        country: parts[2] || 'India'
      }
    };
    setQualityPosts(prev => [stampedPost, ...prev]);
  }, []);

  // User Reels — shared real-time state with location tagging
  const [userReels, setUserReels] = useState(() => {
    const saved = localStorage.getItem('earthgram_user_reels');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('earthgram_user_reels', JSON.stringify(userReels));
    } catch (err) {
      console.warn('Failed to save user reels to localStorage', err);
    }
  }, [userReels]);

  const addUserReel = useCallback((newReel) => {
    // Stamp the reel with the user's current location
    const savedAddr = localStorage.getItem('earthgram_user_address') || 'Sector 4, Ghaziabad, India';
    const parts = savedAddr.split(',').map(s => s.trim());
    const stampedReel = {
      ...newReel,
      location: {
        neighborhood: parts[0] || 'Sector 4',
        city: parts[1] || 'Ghaziabad',
        country: parts[2] || 'India'
      }
    };
    setUserReels(prev => [stampedReel, ...prev]);
  }, []);

  // Local Events - shared real-time state for Explore & Profile
  const [localEvents, setLocalEvents] = useState(() => {
    const saved = localStorage.getItem('earthgram_local_events');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'event-1',
        title: 'Sector 4 Football Match ⚽',
        time: 'Today, 5:30 PM',
        location: { neighborhood: 'Sector 4', city: 'Ghaziabad', country: 'India' },
        attendees: 14,
        userJoined: false,
        desc: 'Casual 7v7 friendly match. All skill levels welcome!'
      },
      {
        id: 'event-2',
        title: 'Yoga in Gaur City Park 🧘‍♀️',
        time: 'Tomorrow, 6:00 AM',
        location: { neighborhood: 'GC-2', city: 'Ghaziabad', country: 'India' },
        attendees: 32,
        userJoined: false,
        desc: 'Bring your own mat. Morning meditation & flow.'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('earthgram_local_events', JSON.stringify(localEvents));
    } catch (err) {
      console.warn('Failed to save local events', err);
    }
  }, [localEvents]);

  const addLocalEvent = useCallback((newEvent) => {
    const savedAddr = localStorage.getItem('earthgram_user_address') || 'Sector 4, Ghaziabad, India';
    const parts = savedAddr.split(',').map(s => s.trim());
    const stampedEvent = {
      ...newEvent,
      location: {
        neighborhood: parts[0] || 'Sector 4',
        city: parts[1] || 'Ghaziabad',
        country: parts[2] || 'India'
      }
    };
    setLocalEvents(prev => [stampedEvent, ...prev]);
  }, []);

  // AD REWARD COINS — shared across Reels, Wallet, Activity
  const [adCoins, setAdCoins] = useState(() => {
    const saved = localStorage.getItem('earthgram_ad_coins');
    return saved ? parseFloat(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('earthgram_ad_coins', adCoins.toString());
  }, [adCoins]);

  // WALLET COINS - CENTRAL & ALLIANCE
  const [userCoins, setUserCoins] = useState(() => {
    const saved = localStorage.getItem('earthgram_user_coins');
    return saved !== null ? parseFloat(saved) : 450;
  });

  const [allianceCoins, setAllianceCoins] = useState(() => {
    const saved = localStorage.getItem('earthgram_alliance_coins');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, name: 'Rajesh Coins', provider: 'Dr. Rajesh Clinic', balance: 50, color: 'from-indigo-500 to-purple-600', icon: '🩺' },
      { id: 2, name: 'Harvest Coins', provider: 'Green Harvest', balance: 120, color: 'from-emerald-500 to-teal-600', icon: '🌾' },
      { id: 3, name: 'Tech Tokens', provider: 'Digital Sol.', balance: 15, color: 'from-blue-500 to-cyan-600', icon: '💻' },
      { id: 4, name: 'Fitness Coins', provider: 'Iron Gym', balance: 45, color: 'from-orange-500 to-red-600', icon: '💪' },
    ];
  });

  const [userTransactions, setUserTransactions] = useState(() => {
    const saved = localStorage.getItem('earthgram_user_transactions');
    return saved ? JSON.parse(saved) : WALLET_TRANSACTIONS;
  });

  const [userPassType, setUserPassType] = useState(() => {
    return localStorage.getItem('earthgram_user_pass_type') || null;
  });

  useEffect(() => {
    localStorage.setItem('earthgram_user_coins', userCoins.toString());
  }, [userCoins]);

  const [communityGroups, setCommunityGroups] = useState(() => {
    const saved = localStorage.getItem('earthgram_community_groups');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem('earthgram_community_groups', JSON.stringify(communityGroups));
  }, [communityGroups]);

  useEffect(() => {
    localStorage.setItem('earthgram_alliance_coins', JSON.stringify(allianceCoins));
  }, [allianceCoins]);

  useEffect(() => {
    localStorage.setItem('earthgram_user_transactions', JSON.stringify(userTransactions));
  }, [userTransactions]);

  useEffect(() => {
    if (userPassType) {
      localStorage.setItem('earthgram_user_pass_type', userPassType);
    } else {
      localStorage.removeItem('earthgram_user_pass_type');
    }
  }, [userPassType]);

  // Shared Booking State — persists across all sessions
  const [userBookings, setUserBookings] = useState(() => {
    const saved = localStorage.getItem('earthgram_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const addBooking = useCallback((newBooking) => {
    setUserBookings(prev => {
      const updated = [newBooking, ...prev];
      localStorage.setItem('earthgram_bookings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Shared Chat/Messaging State — persists across all sessions
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('earthgram_conversations');
    return saved ? JSON.parse(saved) : CONVERSATIONS;
  });

  useEffect(() => {
    localStorage.setItem('earthgram_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Virtual Shop Providers
  const [customProviders, setCustomProviders] = useState(() => {
    const saved = localStorage.getItem('earthgram_custom_providers');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('earthgram_custom_providers', JSON.stringify(customProviders));
  }, [customProviders]);

  const cancelBooking = useCallback((bookingId) => {
    setUserBookings(prev => {
      const updated = prev.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled', date: b.date + ' (Cancelled)' } : b
      );
      localStorage.setItem('earthgram_bookings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('earthgram_dark_mode');
    if (saved !== null) return saved === 'true';
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Persist settings changes
  useEffect(() => {
    localStorage.setItem('earthgram_dark_mode', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('earthgram_boss_mode', isBossMode);
  }, [isBossMode]);

  useEffect(() => {
    localStorage.setItem('earthgram_registered', isRegistered);
  }, [isRegistered]);

  useEffect(() => {
    if (companyData) {
      localStorage.setItem('earthgram_company_data', JSON.stringify(companyData));
    }
  }, [companyData]);

  useEffect(() => {
    localStorage.setItem('earthgram_country', selectedCountry);
  }, [selectedCountry]);

  // Boss Mode AI State
  const [bizBio, setBizBio] = useState(() => localStorage.getItem('earthgram_biz_bio') || '');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  useEffect(() => {
    localStorage.setItem('earthgram_biz_bio', bizBio);
  }, [bizBio]);

  // Automatic Real-Time Location Request on App Load
  useEffect(() => {
    if (navigator.geolocation && !localStorage.getItem('earthgram_user_gps')) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Save GPS to LocalStorage
          localStorage.setItem('earthgram_user_gps', JSON.stringify({
            lat: latitude,
            lng: longitude,
            timestamp: new Date().toISOString()
          }));

          // Reverse Geocoding
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
            const data = await response.json();
            if (data && data.address) {
              const addr = data.address;
              const shortAddress = `${addr.suburb || addr.neighbourhood || addr.road || ''}, ${addr.city || addr.town || addr.state || ''}`.trim().replace(/^, |, $/, '');
              localStorage.setItem('earthgram_user_address', shortAddress || data.display_name);
              // Trigger a state update event so maps know to refresh
              window.dispatchEvent(new Event('earthgram_location_updated'));
            }
          } catch (err) {
            console.error("Geocoding failed on load:", err);
          }
        },
        (error) => console.error("Auto-location failed:", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const renderProtected = (element) => {
    if (!userToken && !localStorage.getItem('earthgram_token')) {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    return element;
  };

  useEffect(() => {
    socket.connect();
    // Register as the company brand name if registered, else a default user ID
    const userId = isRegistered && companyData ? companyData.brandName : 'user_default';
    socket.emit('register_user', userId);

    const handleIncomingCall = (data) => {
      setIncomingCall(data);
    };

    const onNewGroup = (groupData) => {
      setCommunityGroups(prev => {
        if (prev.find(g => g.id === groupData.id)) return prev;
        return [groupData, ...prev];
      });
    };
    
    const onGroupMemberJoined = ({ groupId, userId }) => {
      setCommunityGroups(prev => prev.map(g => {
        if (g.id !== groupId) return g;
        const members = g.members || [];
        if (members.includes(userId)) return g;
        return { ...g, members: [...members, userId] };
      }));
    };

    const onGroupMemberRemoved = ({ groupId, targetUserId }) => {
      setCommunityGroups(prev => prev.map(g => {
        if (g.id !== groupId) return g;
        return { ...g, members: (g.members || []).filter(u => u !== targetUserId) };
      }));
    };

    socket.on('incoming_call', handleIncomingCall);
    socket.on('new_group_created', onNewGroup);
    socket.on('group_member_joined', onGroupMemberJoined);
    socket.on('group_member_removed', onGroupMemberRemoved);

    return () => {
      socket.off('incoming_call', handleIncomingCall);
      socket.off('new_group_created', onNewGroup);
      socket.off('group_member_joined', onGroupMemberJoined);
      socket.off('group_member_removed', onGroupMemberRemoved);
    };
  }, [isRegistered, companyData]);

  // Handle GPS location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newGps = { lat: position.coords.latitude, lng: position.coords.longitude };
          localStorage.setItem('earthgram_user_gps', JSON.stringify(newGps));
        },
        (error) => console.log("GPS Error:", error.message),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const getBotIcon = () => {
    return (
      <div className={`w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md transition-all duration-500 ${botMood === 'thinking' ? 'scale-110' : ''}`}>
        <img src="/bot-avatar.png" alt="Bot" className="w-full h-full object-cover" />
      </div>
    );
  };

  const hideOverlays = ['/chat', '/register', '/register-shop', '/search', '/explore-search', '/messages', '/wallet', '/itzpass', '/catalog', '/book', '/provider', '/upload-reel', '/auth', '/product-catalog'].some(p => location.pathname.startsWith(p));
  const hideBotButton = hideOverlays || location.pathname.startsWith('/explore') || location.pathname.startsWith('/community') || location.pathname.startsWith('/chat');

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} isDarkMode={isDarkMode} />}
      <PhoneFrame>
      <div className="h-full w-full">
        <Routes>
          <Route path="/" element={<HomeScreen isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} activeScope={activeScope} setActiveScope={setActiveScope} selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} qualityPosts={qualityPosts} customProviders={customProviders} adCoins={adCoins} setAdCoins={setAdCoins} cartItems={globalCartItems} setCartItems={setGlobalCartItems} />} />
          <Route path="/explore" element={<ExploreScreen isDarkMode={isDarkMode} adCoins={adCoins} setAdCoins={setAdCoins} qualityPosts={qualityPosts} userReels={userReels} localEvents={localEvents} setLocalEvents={setLocalEvents} activeScope={activeScope} selectedCountry={selectedCountry} customProviders={customProviders} />} />
          <Route path="/reels" element={<ReelsScreen isDarkMode={isDarkMode} adCoins={adCoins} setAdCoins={setAdCoins} userReels={userReels} activeScope={activeScope} setActiveScope={setActiveScope} selectedCountry={selectedCountry} setIsScrolling={setIsReelsScrolling} />} />
          <Route path="/community" element={<CommunityScreen isDarkMode={isDarkMode} qualityPosts={qualityPosts} setQualityPosts={setQualityPosts} activeScope={activeScope} selectedCountry={selectedCountry} conversations={conversations} setConversations={setConversations} communityGroups={communityGroups} setCommunityGroups={setCommunityGroups} companyData={companyData} />} />

          <Route path="/auth" element={<AuthScreen isDarkMode={isDarkMode} onLoginSuccess={handleLoginSuccess} />} />

          <Route path="/profile" element={
            renderProtected(
              <ProfileScreen
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                isBossMode={isBossMode}
                setIsBossMode={setIsBossMode}
                bizBio={bizBio}
                setBizBio={setBizBio}
                isGeneratingBio={isGeneratingBio}
                setIsGeneratingBio={setIsGeneratingBio}
                isRegistered={isRegistered}
                companyData={companyData}
                userBookings={userBookings}
                addQualityPost={addQualityPost}
                addUserReel={addUserReel}
                addLocalEvent={addLocalEvent}
                activeScope={activeScope}
                selectedCountry={selectedCountry}
                userCoins={userCoins}
                setUserCoins={setUserCoins}
                allianceCoins={allianceCoins}
                setAllianceCoins={setAllianceCoins}
                userTransactions={userTransactions}
                setUserTransactions={setUserTransactions}
                userPassType={userPassType}
                onLogout={handleLogout}
              />
            )
          } />

          {/* Overlays / Full screens */}
          <Route path="/chat" element={renderProtected(<ChatScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} />)} />
          <Route path="/register" element={<RegisterScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} onRegisterSuccess={async (data) => { 
            // Save to MongoDB backend
            try {
              const actualCategory = data.category === 'Other' ? data.customCategory : (data.subCategory || data.category);
              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
              await fetch(`${API_URL}/api/user/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: 'user_' + Date.now(),
                  name: data.fullName,
                  phone: data.phone,
                  role: 'provider',
                  brand_name: data.brandName,
                  category: actualCategory,
                  description: data.description
                })
              });
              console.log('Successfully registered to backend');
            } catch (err) {
              console.error('Failed to register to backend', err);
            }

            setCompanyData(data); 
            setIsRegistered(true); 
            setIsBossMode(true);
            if (data.providerObj) {
              setCustomProviders(prev => [data.providerObj, ...prev]);
            }
            navigate('/profile'); 
          }} />} />
          <Route path="/register-shop" element={<ShopRegisterScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} onRegisterSuccess={(data) => {
            setCompanyData(data); 
            setIsRegistered(true); 
            setIsBossMode(true);
            if (data.providerObj) {
              setCustomProviders(prev => [data.providerObj, ...prev]);
            }
            navigate('/profile'); 
          }} />} />
          <Route path="/provider" element={<ProviderProfileScreen isDarkMode={isDarkMode} onBack={() => navigate(-1)} qualityPosts={qualityPosts} globalCartItems={globalCartItems} setGlobalCartItems={setGlobalCartItems} />} />
          <Route path="/book" element={renderProtected(<BookingScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} userBookings={userBookings} addBooking={addBooking} cancelBooking={cancelBooking} userCoins={userCoins} setUserCoins={setUserCoins} allianceCoins={allianceCoins} setAllianceCoins={setAllianceCoins} userTransactions={userTransactions} setUserTransactions={setUserTransactions} />)} />
          <Route path="/activity" element={<ActivityScreen isDarkMode={isDarkMode} adCoins={adCoins} />} />
          <Route path="/search" element={<SearchScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} customProviders={customProviders} />} />
          <Route path="/explore-search" element={<ExploreSearchScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} />} />
          <Route path="/messages" element={renderProtected(<MessagingScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} conversations={conversations} setConversations={setConversations} />)} />
          <Route path="/wallet" element={renderProtected(<WalletScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} adCoins={adCoins} userCoins={userCoins} setUserCoins={setUserCoins} allianceCoins={allianceCoins} setAllianceCoins={setAllianceCoins} userTransactions={userTransactions} setUserTransactions={setUserTransactions} userPassType={userPassType} companyData={companyData} />)} />
          <Route path="/itzpass" element={renderProtected(<ItzPassScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} userPassType={userPassType} setUserPassType={setUserPassType} userCoins={userCoins} setUserCoins={setUserCoins} userTransactions={userTransactions} setUserTransactions={setUserTransactions} />)} />
          <Route path="/catalog" element={<ServiceCatalogScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} />} />
          <Route path="/product-catalog" element={renderProtected(<ProductCatalogScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} />)} />
          <Route path="/upload-reel" element={renderProtected(<UploadReelScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} addUserReel={addUserReel} />)} />
        </Routes>
      </div>

      {!hideOverlays && <QuickAccessBar isDarkMode={isDarkMode} />}
      <div className={`absolute bottom-0 w-full z-50 transition-transform duration-300 ease-in-out ${isReelsScrolling ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        {!hideOverlays && <BottomNav isDarkMode={isDarkMode} />}
      </div>

      {/* Global Incoming Call Overlay */}
      {incomingCall && (
        <div className="absolute top-10 left-5 right-5 bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-700 z-[100] animate-slide-up flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg">
            {incomingCall.from.substring(0, 2).toUpperCase()}
          </div>
          <h3 className="text-white font-black text-lg text-center leading-tight">{incomingCall.from}</h3>
          <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mt-1 mb-5 animate-pulse">Incoming Video Call...</p>
          
          <div className="flex w-full justify-around px-4">
            <button 
              onClick={() => setIncomingCall(null)}
              className="w-14 h-14 bg-rose-600 rounded-full flex flex-col items-center justify-center text-white shadow-glow-rose active:scale-90 transition-transform"
            >
              <span className="text-xl transform rotate-135 inline-block">📞</span>
            </button>
            <button 
              onClick={() => {
                const callData = incomingCall;
                setIncomingCall(null);
                // Navigate to ProviderProfileScreen with incomingCall state
                navigate('/provider', { state: { incomingCall: callData, provider: { name: incomingCall.from, category: 'Caller' } } });
              }}
              className="w-14 h-14 bg-emerald-500 rounded-full flex flex-col items-center justify-center text-white shadow-glow-emerald active:scale-90 transition-transform animate-bounce"
            >
              <span className="text-xl">📹</span>
            </button>
          </div>
        </div>
      )}

      {!hideBotButton && (
        <button
          onClick={() => navigate('/chat')}
          className={`absolute bottom-20 right-5 w-16 h-16 rounded-full flex items-center justify-center shadow-[0_8px_15px_rgba(0,0,0,0.12)] border z-40 active:scale-90 transition-all duration-300 ${botMood === 'idle' ? 'animate-bounce' : ''} hover:animate-none ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
          }`}
          style={{ animationDuration: '2.5s' }}
        >
          <span className="transition-transform duration-300">
            {getBotIcon()}
          </span>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white shadow-sm"></span>
          </span>
        </button>
      )}
      </PhoneFrame>
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
