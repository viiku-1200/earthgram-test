import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { REELS_DATA, COUNTRIES } from '../../data/constants';

const SCOPES = ['local', 'national', 'global'];
const LANGUAGES = ['All', 'Hindi', 'English', 'Tamil', 'Italian'];

const ADS_DATA = [
  { id: 'ad1', brand: 'Green Harvest', tagline: 'Fresh organic produce delivered daily to your door', gradient: 'from-emerald-700 via-teal-800 to-emerald-900', icon: '🌾', cta: 'Shop Now', accent: '#10b981', videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  { id: 'ad2', brand: 'City Craft Studios', tagline: 'Handmade premium furniture for your dream home', gradient: 'from-amber-700 via-orange-800 to-red-900', icon: '🪑', cta: 'Explore', accent: '#f59e0b', videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4' },
  { id: 'ad3', brand: 'Dr. Rajesh Clinic', tagline: 'Book your personal health checkup today', gradient: 'from-blue-700 via-indigo-800 to-blue-900', icon: '🩺', cta: 'Book Now', accent: '#6366f1', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 'ad4', brand: 'Iron Core Gym', tagline: 'Transform your body — results guaranteed in 90 days', gradient: 'from-rose-700 via-red-800 to-rose-900', icon: '💪', cta: 'Join Now', accent: '#f43f5e', videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4' },
];

// Build feed: 8 reels first, then inject ads at safe intervals
function buildFeed(reels) {
  // Take first 8 (or all if less)
  const base = reels.slice(0, Math.max(reels.length, 8));
  const result = [...base];
  
  // Safe number of ads: no more than 4, and no more than available slots
  const numAds = Math.min(4, Math.max(0, base.length - 1));
  
  // Pick random unique positions to insert ads (after index 1, so never first)
  const positions = [];
  let attempts = 0;
  while (positions.length < numAds && attempts < 100) {
    const p = Math.floor(Math.random() * (base.length - 1)) + 2;
    if (!positions.includes(p)) positions.push(p);
    attempts++;
  }
  
  positions.sort((a, b) => b - a); // insert from end so indexes don't shift
  
  positions.forEach((pos, i) => {
    const ad = ADS_DATA[i % ADS_DATA.length];
    result.splice(pos, 0, { type: 'ad', data: ad, feedId: `ad-slot-${i}` });
  });
  
  return result.map((item) =>
    item.type === 'ad' ? item : { type: 'reel', data: item, feedId: `reel-${item.id}` }
  );
}

// Floating coin burst component
const CoinBurst = ({ onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="absolute inset-0 z-[80] pointer-events-none flex items-end justify-center pb-40">
      <div className="flex flex-col items-center animate-coin-burst">
        <div className="relative">
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-full bg-amber-400 blur-xl opacity-60 scale-150 animate-ping" />
          <div className="relative bg-gradient-to-br from-amber-300 to-yellow-600 rounded-full px-6 py-3 shadow-2xl border-2 border-amber-200 flex items-center space-x-2">
            <span className="text-2xl">🪙</span>
            <span className="text-2xl font-black text-white drop-shadow-lg">+0.03</span>
          </div>
        </div>
        <p className="text-amber-300 text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-80">Added to Wallet</p>
      </div>
      <style>{`
        @keyframes coinBurst {
          0%   { opacity: 0; transform: translateY(0) scale(0.5); }
          20%  { opacity: 1; transform: translateY(-20px) scale(1.15); }
          60%  { opacity: 1; transform: translateY(-80px) scale(1); }
          100% { opacity: 0; transform: translateY(-160px) scale(0.8); }
        }
        .animate-coin-burst { animation: coinBurst 1.8s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>
    </div>
  );
};

// Video component that handles dynamic play/pause based on scroll position
const ReelVideo = ({ src, isActive }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(e => console.warn('Autoplay prevented:', e));
    } else if (!isActive && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive, src]);

  return (
    <video
      ref={videoRef}
      src={src}
      className="absolute inset-0 w-full h-full object-cover"
      loop
      muted
      playsInline
    />
  );
};

const ReelsScreen = ({ isDarkMode, adCoins = 0, setAdCoins, userReels = [], activeScope = 'local', setActiveScope, selectedCountry = 'in', setIsScrolling }) => {
  const [activeLang, setActiveLang] = useState('All');
  const [liked, setLiked] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [adTimer, setAdTimer] = useState(0);
  const [completedAds, setCompletedAds] = useState(new Set());
  const [adsWatched, setAdsWatched] = useState(0);
  const [showBurst, setShowBurst] = useState(false);
  const [showBonus, setShowBonus] = useState(false);
  const scrollRef = useRef(null);
  const timerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Dynamic country data for filtering
  const selectedCountryData = COUNTRIES.find(c => c.id === selectedCountry);
  const selectedCountryName = selectedCountryData?.name || 'India';
  const selectedCapitalName = selectedCountryData?.capital || 'Ghaziabad';

  // Geospatial filtering for user reels
  const filteredUserReels = useMemo(() => userReels.filter(r => {
    if (r.isUserPost) return true;
    if (!r.location) return true;
    if (typeof r.location === 'string') return true;
    if (activeScope === 'global') return true;
    if (activeScope === 'national') return r.location.country === selectedCountryName;
    if (activeScope === 'city') return r.location.city === selectedCapitalName;
    if (activeScope === 'local') return r.location.neighborhood === 'Sector 4';
    return true;
  }), [userReels, activeScope, selectedCountryName, selectedCapitalName]);

  // User-posted reels formatted for feed
  const userFeedItems = useMemo(() => filteredUserReels.map(r => ({
    type: 'reel',
    data: { ...r, isUserPost: true },
    feedId: r.id,
  })), [filteredUserReels]);

  const filtered = useMemo(() => REELS_DATA.filter(r => {
    // Geospatial scope match matching ExploreScreen
    let scopeMatch = false;
    if (activeScope === 'global') {
      scopeMatch = true;
    } else if (activeScope === 'national') {
      if (r.scope) {
        scopeMatch = r.scope === 'national' || r.scope === 'local';
      } else if (r.location) {
        scopeMatch = r.location.country === 'India';
      } else {
        scopeMatch = true;
      }
    } else if (activeScope === 'city') {
      if (r.scope) {
        scopeMatch = r.scope === 'local';
      } else if (r.location) {
        scopeMatch = r.location.city === 'Ghaziabad';
      } else {
        scopeMatch = true;
      }
    } else if (activeScope === 'local') {
      if (r.scope) {
        scopeMatch = r.scope === 'local';
      } else if (r.location) {
        scopeMatch = r.location.neighborhood === 'Sector 4';
      } else {
        scopeMatch = true;
      }
    }

    const l = activeLang === 'All' || r.language === activeLang;
    return scopeMatch && l;
  }), [activeScope, activeLang]);

  // Stable feed — rebuilt only when filter changes, user reels always prepended
  const feed = useMemo(() => {
    return [...userFeedItems, ...buildFeed(filtered.length > 0 ? filtered : REELS_DATA)];
  }, [userFeedItems, filtered]);

  // Reset scroll and currentIndex when filters or userReels change
  useEffect(() => {
    setTimeout(() => {
      setCurrentIndex(0);
    }, 0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [activeScope, activeLang, userReels]);

  // Ad Completion callback — declared before useEffects to satisfy React-Hooks rules
  const onAdComplete = useCallback(() => {
    const item = feed[currentIndex];
    if (!item || item.type !== 'ad' || completedAds.has(item.feedId)) return;
    setCompletedAds(prev => {
      const next = new Set(prev);
      next.add(item.feedId);
      return next;
    });
    // Show coin burst
    setShowBurst(true);
    // Credit 0.03 coins
    if (setAdCoins) setAdCoins(prev => parseFloat((prev + 0.03).toFixed(2)));
    setAdsWatched(prev => {
      const next = prev + 1;
      if (next >= 4) {
        // Bonus 0.03 on completing 4 ads
        setTimeout(() => {
          if (setAdCoins) setAdCoins(c => parseFloat((c + 0.03).toFixed(2)));
          setShowBonus(true);
        }, 2000);
        return 0;
      }
      return next;
    });
  }, [feed, currentIndex, completedAds, setAdCoins]);

  const currentItem = feed[currentIndex];

  // Ad watch timer logic — starts a 5s countdown when an uncompleted ad is shown
  useEffect(() => {
    clearInterval(timerRef.current);
    
    if (currentItem?.type === 'ad' && !completedAds.has(currentItem.feedId)) {
      let timeLeft = 5;
      setAdTimer(timeLeft);
      
      timerRef.current = setInterval(() => {
        timeLeft -= 1;
        setAdTimer(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timerRef.current);
          onAdComplete();
        }
      }, 1000);
    } else {
      setAdTimer(0);
    }
    
    return () => clearInterval(timerRef.current);
  }, [currentIndex, currentItem, completedAds, onAdComplete]);

  const handleScroll = () => {
    if (setIsScrolling) {
      setIsScrolling(true);
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 300); // Wait 300ms after scrolling stops to show nav again
    }

    if (!scrollRef.current) return;
    const idx = Math.round(scrollRef.current.scrollTop / scrollRef.current.clientHeight);
    if (idx !== currentIndex) setCurrentIndex(idx);
  };

  const progress = (adsWatched / 4) * 100;

  return (
    <div className="h-full bg-black text-white relative overflow-hidden">

      {/* LIQUID GOLD PROGRESS BAR */}
      <div className="absolute top-0 left-0 right-0 z-50 h-[3px] bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-600 shadow-[0_0_12px_rgba(251,191,36,0.9)] transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* COIN BURST ANIMATION */}
      {showBurst && <CoinBurst onDone={() => setShowBurst(false)} />}

      {/* TOP BAR */}
      <div className="absolute top-0 left-0 right-0 z-40 pt-10 px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-extrabold tracking-wide drop-shadow-lg">EarthGram</h1>
          {/* Live diamond counter */}
          <div className="bg-black/50 backdrop-blur-md border border-amber-500/40 px-3 py-1.5 rounded-2xl flex items-center space-x-1.5">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Mining</span>
            <span className="text-sm font-black text-white">{adCoins.toFixed(2)}</span>
            <span className="text-base">💎</span>
          </div>
        </div>

        {/* Scope tabs */}
        <div className="flex justify-center space-x-6 mt-3">
          {SCOPES.map(s => (
            <button key={s} onClick={() => setActiveScope(s)}
              className={`text-sm font-bold capitalize transition-all ${activeScope === s ? 'text-white border-b-2 border-white pb-0.5' : 'text-white/50'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Language filter */}
        <div className="flex justify-center mt-2 space-x-2 overflow-x-auto hide-scrollbar pb-1">
          {LANGUAGES.map(l => (
            <button key={l} onClick={() => setActiveLang(l)}
              className={`text-[10px] font-black px-3 py-1 rounded-full transition-all flex-shrink-0 ${activeLang === l ? 'bg-white text-black' : 'bg-white/10 text-white/70'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* FEED */}
      <div ref={scrollRef} onScroll={handleScroll}
        className="h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
        {feed.map((item, idx) => (
          <div key={item.feedId} className="h-full w-full snap-start snap-always relative flex-shrink-0">

            {item.type === 'reel' ? (
              /* ── NORMAL REEL ── */
              <div className="h-full w-full relative">
                {/* Real uploaded media (video or image) vs demo reel */}
                {item.data.mediaUrl ? (
                  item.data.mediaType === 'video' ? (
                    <ReelVideo src={item.data.mediaUrl} isActive={currentIndex === idx} />
                  ) : (
                    <img src={item.data.mediaUrl} alt="Reel" className="absolute inset-0 w-full h-full object-cover" />
                  )
                ) : (
                  <ReelVideo src={item.data.videoUrl} isActive={currentIndex === idx} />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />

                {/* YOUR POST badge for user-published reels */}
                {item.data.isUserPost && (
                  <div className="absolute top-40 left-4 z-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg animate-pulse">
                    ✨ Your Post
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-40 left-4 flex flex-col space-y-1.5 z-20">
                  {item.data.isHyped && (
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-[10px] font-black px-3 py-1 rounded-full flex items-center space-x-1 animate-pulse">
                      <span>🔥</span><span>HYPED</span>
                    </div>
                  )}
                  <div className="bg-black/40 backdrop-blur-md border border-white/20 text-[10px] font-bold px-2.5 py-1 rounded-full w-max flex items-center space-x-1">
                    <span>🗣️</span><span>{item.data.language}</span>
                  </div>
                </div>

                {/* Side actions */}
                <div className="absolute right-3 bottom-48 flex flex-col items-center space-y-4 z-20">
                  <button onClick={() => setLiked(p => ({ ...p, [item.data.id]: !p[item.data.id] }))} className="flex flex-col items-center">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-1 transition-all ${liked[item.data.id] ? 'bg-red-500 scale-110' : 'bg-white/15 backdrop-blur-sm'}`}>
                      <svg className="w-5 h-5 text-white" fill={liked[item.data.id] ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold">{item.data.likes}</span>
                  </button>
                  <button className="flex flex-col items-center">
                    <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center mb-1">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold">{item.data.comments}</span>
                  </button>
                  <button className="flex flex-col items-center">
                    <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center mb-1">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold">Share</span>
                  </button>
                </div>

                {/* Bottom creator info */}
                <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-20">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-black border-2 border-white shadow-lg">
                      {(() => {
                        const creatorName = item.data.creator || '@you';
                        return creatorName.startsWith('@') 
                          ? creatorName.slice(1, 3).toUpperCase() 
                          : creatorName.slice(0, 2).toUpperCase();
                      })()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-sm flex items-center space-x-1.5">
                        <span>{item.data.creator || '@you'}</span>
                        <span className="text-[8px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full">✓</span>
                      </h3>
                      <p className="text-[10px] text-white/50 font-medium">
                        📍 {typeof item.data.location === 'object' 
                          ? `${item.data.location.neighborhood || ''}, ${item.data.location.city || ''}` 
                          : item.data.location} · {item.data.role}
                      </p>
                    </div>
                    <button className="border border-white/40 px-3 py-1.5 rounded-full text-[11px] font-bold backdrop-blur-sm">Follow</button>
                  </div>
                  <p className="text-sm mb-4 w-4/5 leading-snug text-white/90">{item.data.desc}</p>
                  <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform">
                    {item.data.cta || 'Book Now'} →
                  </button>
                </div>
              </div>
            ) : (
              /* ── SPONSORED AD ── */
              <div className={`h-full w-full relative bg-gradient-to-br ${item.data.gradient} flex items-center justify-center overflow-hidden`}>
                
                {/* AD VIDEO BACKGROUND */}
                {item.data.videoUrl && (
                  <>
                    <ReelVideo src={item.data.videoUrl} isActive={currentIndex === idx} />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                  </>
                )}

                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                {/* Animated background glow */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 rounded-full opacity-20 blur-3xl animate-pulse" style={{ background: item.data.accent }} />
                </div>

                {/* Mining badge */}
                <div className="absolute top-40 left-4 z-20">
                  <div className="bg-amber-500/20 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center space-x-1.5">
                    <span className="animate-spin" style={{ animationDuration: '3s' }}>💎</span>
                    <span>MINING SIGNATURE VALUE</span>
                  </div>
                </div>

                {/* Ad content */}
                <div className="relative z-10 text-center px-8 flex flex-col items-center">
                  {/* Brand icon */}
                  <div className="w-28 h-28 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-6 border border-white/20 shadow-2xl">
                    <span className="text-6xl">{item.data.icon}</span>
                  </div>

                  <h2 className="text-3xl font-black text-white mb-2 drop-shadow-xl">{item.data.brand}</h2>
                  <p className="text-white/70 text-sm mb-8 max-w-[240px] leading-relaxed">{item.data.tagline}</p>

                  {/* Timer / Completed state */}
                  {completedAds.has(item.feedId) ? (
                    <div className="flex flex-col items-center space-y-3 mb-6">
                      <div className="bg-green-500/20 border border-green-400/50 px-6 py-3 rounded-2xl flex items-center space-x-2">
                        <span className="text-xl">✅</span>
                        <span className="text-green-300 font-black text-base">Value Extracted</span>
                      </div>
                      <div className="bg-amber-500/20 border border-amber-400/30 px-4 py-1.5 rounded-full">
                        <span className="text-amber-300 font-black text-sm">+0.03 🪙 Added to Wallet</span>
                      </div>
                    </div>
                  ) : currentIndex === idx && adTimer > 0 ? (
                    <div className="flex flex-col items-center space-y-3 mb-6">
                      {/* Circular countdown */}
                      <div className="relative w-20 h-20">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                          <circle cx="40" cy="40" r="34" fill="none" stroke="#fbbf24" strokeWidth="6"
                            strokeDasharray={`${2 * Math.PI * 34}`}
                            strokeDashoffset={`${2 * Math.PI * 34 * (adTimer / 5)}`}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 0 8px #fbbf24)' }} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-black text-amber-400">{adTimer}</span>
                        </div>
                      </div>
                      <p className="text-amber-300/80 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Extracting Value...</p>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Scroll here to start mining</p>
                    </div>
                  )}

                  <button className="bg-white text-black px-10 py-3.5 rounded-2xl font-black text-sm active:scale-95 transition-transform shadow-xl">
                    {item.data.cta} →
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* SOVEREIGN BONUS MODAL */}
      {showBonus && (
        <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6">
          <div className="bg-gradient-to-b from-[#1a1200] to-black border border-amber-500/60 rounded-[3rem] p-10 w-full max-w-xs text-center shadow-[0_0_100px_rgba(245,158,11,0.4)]">
            <div className="w-28 h-28 mx-auto bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(245,158,11,0.6)]">
              <span className="text-5xl">💎</span>
            </div>
            <h2 className="text-3xl font-black text-amber-400 mb-3 tracking-tight">SOVEREIGN BONUS!</h2>
            <p className="text-white/70 text-sm mb-6 leading-relaxed">
              You unlocked the<br />
              <span className="text-white font-black text-xl">Signature Tier Bonus</span>
            </p>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl py-5 mb-8">
              <p className="text-5xl font-black text-amber-400">+0.15</p>
              <p className="text-[10px] text-amber-400/70 font-black uppercase tracking-[0.3em] mt-2">Total Added to Portfolio</p>
            </div>
            <p className="text-white/30 text-xs mb-6">Wallet Balance: <span className="text-amber-400 font-black">{adCoins.toFixed(2)} 🪙</span></p>
            <button onClick={() => setShowBonus(false)}
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-600 text-black py-4 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-transform shadow-lg">
              Secure My Wealth
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReelsScreen;
