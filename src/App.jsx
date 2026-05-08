import React, { useState } from 'react';
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
  const [selectedCountry, setSelectedCountry] = useState('in');
  const [isBossMode, setIsBossMode] = useState(false);
  const [botMood, setBotMood] = useState('idle');
  const [isRegistered, setIsRegistered] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Boss Mode AI State
  const [bizBio, setBizBio] = useState('');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

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
          <Route path="/explore" element={<ExploreScreen />} />
          <Route path="/reels" element={<ReelsScreen />} />
          <Route path="/community" element={<CommunityScreen />} />
          <Route path="/profile" element={
            <ProfileScreen
              isBossMode={isBossMode}
              setIsBossMode={setIsBossMode}
              bizBio={bizBio}
              setBizBio={setBizBio}
              isGeneratingBio={isGeneratingBio}
              setIsGeneratingBio={setIsGeneratingBio}
              isRegistered={isRegistered}
              companyData={companyData}
            />
          } />

          {/* Overlays / Full screens */}
          <Route path="/chat" element={<ChatScreen onClose={() => navigate(-1)} />} />
          <Route path="/register" element={<RegisterScreen onClose={() => navigate(-1)} onRegisterSuccess={(data) => { setCompanyData(data); setIsRegistered(true); setIsBossMode(true); navigate('/profile'); }} />} />
          <Route path="/provider" element={<ProviderProfileScreen onBack={() => navigate(-1)} />} />
          <Route path="/book" element={<BookingScreen onClose={() => navigate(-1)} />} />
          <Route path="/activity" element={<ActivityScreen isDarkMode={isDarkMode} />} />
          <Route path="/search" element={<SearchScreen onClose={() => navigate(-1)} />} />
          <Route path="/explore-search" element={<ExploreSearchScreen onClose={() => navigate(-1)} />} />
          <Route path="/messages" element={<MessagingScreen onClose={() => navigate(-1)} />} />
          <Route path="/wallet" element={<WalletScreen onClose={() => navigate(-1)} />} />
          <Route path="/itzpass" element={<ItzPassScreen onClose={() => navigate(-1)} />} />
          <Route path="/catalog" element={<ServiceCatalogScreen onClose={() => navigate(-1)} />} />
          <Route path="/upload-reel" element={<UploadReelScreen onClose={() => navigate(-1)} />} />
        </Routes>
      </div>

      {!hideOverlays && <BottomNav />}

      {!hideOverlays && (
        <button
          onClick={() => navigate('/chat')}
          className={`absolute bottom-20 right-5 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-[0_8px_15px_rgba(0,0,0,0.12)] border border-gray-100 z-40 active:scale-90 transition-all duration-300 ${botMood === 'idle' ? 'animate-bounce' : ''} hover:animate-none`}
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
