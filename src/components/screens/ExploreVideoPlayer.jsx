import React, { useState, useEffect, useRef, useCallback } from 'react';

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

const ExploreVideoPlayer = ({ feed, initialIndex = 0, onClose, isDarkMode, adCoins, setAdCoins }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [liked, setLiked] = useState({});
  const [showBurst, setShowBurst] = useState(false);
  const [activeLang, setActiveLang] = useState('All');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const scrollRef = useRef(null);

  const filteredFeed = feed.filter(item => {
    if (activeLang === 'All') return true;
    if (item.type !== 'reel' && item.type !== 'userReel') return true;
    return item.data.language === activeLang;
  });

  useEffect(() => {
    if (scrollRef.current) {
      // scroll to the exact video index initially
      scrollRef.current.scrollTop = scrollRef.current.clientHeight * initialIndex;
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const currentScrollTop = scrollRef.current.scrollTop;
    const idx = Math.round(currentScrollTop / scrollRef.current.clientHeight);
    if (idx !== currentIndex && idx >= 0 && idx < filteredFeed.length) {
      setCurrentIndex(idx);
    }
  };

  const handleLike = (id) => {
    setLiked(p => ({ ...p, [id]: !p[id] }));
  };

  const LANGUAGES = ['All', 'Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Gujarati', 'Bengali', 'Punjabi', 'Odia', 'Urdu'];

  return (
    <div className="absolute inset-0 z-[100] h-full w-full bg-black text-white flex flex-col overflow-hidden animate-slide-up">
      {/* COIN BURST ANIMATION */}
      {showBurst && <CoinBurst onDone={() => setShowBurst(false)} />}

      {/* TOP BAR */}
      <div className="absolute top-0 left-0 right-0 z-40 pt-10 px-4">
        <div className="flex justify-between items-center">
          <button onClick={onClose} className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 active:scale-90 transition-transform">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          {/* Live diamond counter */}
          <div className="bg-black/50 backdrop-blur-md border border-amber-500/40 px-3 py-1.5 rounded-2xl flex items-center space-x-1.5">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Mining</span>
            <span className="text-sm font-black text-white">{adCoins?.toFixed(2) || '0.00'}</span>
            <span className="text-base">💎</span>
          </div>
        </div>
      </div>

      {/* FEED */}
      <div ref={scrollRef} onScroll={handleScroll} className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
        {filteredFeed.length === 0 && (
          <div className="h-full w-full flex flex-col items-center justify-center px-8 text-center">
            <div className="text-6xl mb-4 opacity-50">📭</div>
            <h2 className="text-xl font-bold mb-2">No Videos Found</h2>
            <p className="text-white/60 text-sm mb-6">There are no videos matching your selected language in this area.</p>
            <button onClick={() => setActiveLang('All')} className="bg-indigo-600 px-6 py-2 rounded-full font-bold active:scale-95 transition-transform">
              Clear Filters
            </button>
          </div>
        )}
        
        {filteredFeed.map((item, idx) => (
          <div key={idx} className="h-full w-full snap-start snap-always relative flex-shrink-0">
            {(item.type === 'reel' || item.type === 'userReel') && (
              <div className="h-full w-full relative">
                {/* Media */}
                {item.data.mediaUrl ? (
                  item.data.mediaType === 'video' ? (
                    <ReelVideo src={item.data.mediaUrl} isActive={currentIndex === idx} />
                  ) : (
                    <img src={item.data.mediaUrl} alt="Video" className="absolute inset-0 w-full h-full object-cover" />
                  )
                ) : (
                  <ReelVideo src={item.data.videoUrl} isActive={currentIndex === idx} />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />

                {/* Badges */}
                {item.type === 'userReel' && (
                  <div className="absolute top-24 left-4 z-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg animate-pulse pointer-events-none">
                    ✨ Your Post
                  </div>
                )}
                {item.data.isHyped && (
                  <div className="absolute top-24 left-4 z-20 bg-gradient-to-r from-orange-500 to-red-600 text-[10px] font-black px-3 py-1 rounded-full flex items-center space-x-1 animate-pulse pointer-events-none">
                    <span>🔥</span><span>HYPED</span>
                  </div>
                )}

                {/* Side actions */}
                <div className="absolute right-3 bottom-[220px] flex flex-col items-center space-y-4 z-20">
                  <button onClick={() => setShowLangMenu(true)} className="flex flex-col items-center">
                    <div className="w-11 h-11 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center mb-1 shadow-lg active:scale-95 transition-transform">
                      <span className="text-[10px] font-black tracking-wider">{item.data.language?.substring(0, 3).toUpperCase() || 'ALL'}</span>
                    </div>
                  </button>
                  <button onClick={() => handleLike(item.data.id || idx)} className="flex flex-col items-center">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-1 transition-all ${liked[item.data.id || idx] ? 'bg-red-500 scale-110' : 'bg-white/15 backdrop-blur-sm'}`}>
                      <svg className="w-5 h-5 text-white" fill={liked[item.data.id || idx] ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold">{item.data.likes || 'Like'}</span>
                  </button>
                  <button className="flex flex-col items-center">
                    <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center mb-1">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold">{item.data.comments || '0'}</span>
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
                <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-20 pointer-events-none">
                  <div className="flex items-center space-x-3 mb-2 pointer-events-auto">
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
                          : item.data.location || 'Local Area'} · {item.data.role || 'Creator'}
                      </p>
                    </div>
                    <button className="border border-white/40 px-3 py-1.5 rounded-full text-[11px] font-bold backdrop-blur-sm pointer-events-auto">Follow</button>
                  </div>
                  <p className="text-sm mb-4 w-4/5 leading-snug text-white/90">{item.data.desc || item.data.caption}</p>
                  <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform pointer-events-auto">
                    {item.data.cta || 'Book Now'} →
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* LANGUAGE FILTER MODAL */}
      {showLangMenu && (
        <div className="absolute inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-end justify-center animate-fade-in">
          <div className="bg-slate-900 w-full max-w-md rounded-t-[2rem] border-t border-slate-700 p-6 animate-slide-up pb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white">Select Language</h2>
              <button onClick={() => setShowLangMenu(false)} className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar">
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  onClick={() => { setActiveLang(lang); setShowLangMenu(false); }}
                  className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                    activeLang === lang 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/30' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 active:scale-95'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreVideoPlayer;
