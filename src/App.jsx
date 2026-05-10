import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';

// Screen Components
import HomeScreen from './components/screens/HomeScreen';
import ExploreScreen from './components/screens/ExploreScreen';
import ReelsScreen from './components/screens/ReelsScreen';
import CommunityScreen from './components/screens/CommunityScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import ChatScreen from './components/screens/ChatScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import ProviderProfileScreen from './components/screens/ProviderProfileScreen';
import BookingScreen from './components/screens/BookingScreen';
import SearchScreen from './components/screens/SearchScreen';
import ExploreSearchScreen from './components/screens/ExploreSearchScreen';
import MessagingScreen from './components/screens/MessagingScreen';
import WalletScreen from './components/screens/WalletScreen';
import ItzPassScreen from './components/screens/ItzPassScreen';
import ServiceCatalogScreen from './components/screens/ServiceCatalogScreen';
import UploadReelScreen from './components/screens/UploadReelScreen';
import SplashScreen from './components/screens/SplashScreen';
import ActivityScreen from './components/screens/ActivityScreen';
// botAvatar moved to public folder for direct access

// Layout Components
import PhoneFrame from './components/layout/PhoneFrame';
import BottomNav from './components/layout/BottomNav';

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

  const navigate = useNavigate();
  const location = useLocation();

  const getBotIcon = () => {
    return (
      <div className={`w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md transition-all duration-500 ${botMood === 'thinking' ? 'scale-110' : ''}`}>
        <img src="/bot-avatar.png" alt="Bot" className="w-full h-full object-cover" />
      </div>
    );
  };

  const hideOverlays = ['/chat', '/register', '/search', '/explore-search', '/messages', '/wallet', '/itzpass', '/catalog', '/book', '/provider', '/upload-reel'].some(p => location.pathname.startsWith(p));

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} isDarkMode={isDarkMode} />}
      <PhoneFrame>
      <div className="h-full w-full">
        <Routes>
          <Route path="/" element={<HomeScreen isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} activeScope={activeScope} setActiveScope={setActiveScope} selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} />} />
          <Route path="/explore" element={<ExploreScreen isDarkMode={isDarkMode} />} />
          <Route path="/reels" element={<ReelsScreen isDarkMode={isDarkMode} />} />
          <Route path="/community" element={<CommunityScreen isDarkMode={isDarkMode} />} />
          <Route path="/profile" element={
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
            />
          } />

          {/* Overlays / Full screens */}
          <Route path="/chat" element={<ChatScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} />} />
          <Route path="/register" element={<RegisterScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} onRegisterSuccess={(data) => { setCompanyData(data); setIsRegistered(true); setIsBossMode(true); navigate('/profile'); }} />} />
          <Route path="/provider" element={<ProviderProfileScreen isDarkMode={isDarkMode} onBack={() => navigate(-1)} />} />
          <Route path="/book" element={<BookingScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} userBookings={userBookings} addBooking={addBooking} cancelBooking={cancelBooking} />} />
          <Route path="/activity" element={<ActivityScreen isDarkMode={isDarkMode} />} />
          <Route path="/search" element={<SearchScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} />} />
          <Route path="/explore-search" element={<ExploreSearchScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} />} />
          <Route path="/messages" element={<MessagingScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} />} />
          <Route path="/wallet" element={<WalletScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} />} />
          <Route path="/itzpass" element={<ItzPassScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} />} />
          <Route path="/catalog" element={<ServiceCatalogScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} />} />
          <Route path="/upload-reel" element={<UploadReelScreen isDarkMode={isDarkMode} onClose={() => navigate(-1)} />} />
        </Routes>
      </div>

      {!hideOverlays && <BottomNav isDarkMode={isDarkMode} />}

      {!hideOverlays && (
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
