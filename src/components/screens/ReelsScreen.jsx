import React, { useState } from 'react';
import { REELS_DATA } from '../../data/constants';

const LANGUAGES = ['All', 'English', 'Hindi', 'Tamil', 'Italian'];
const SCOPES = ['local', 'national', 'global'];

const ReelsScreen = () => {
  const [activeScope, setActiveScope] = useState('national');
  const [activeLanguage, setActiveLanguage] = useState('All');
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  // Filter reels based on selected scope and language
  const filteredReels = REELS_DATA.filter(r => {
    const matchScope = activeScope === 'global' || r.scope === activeScope;
    const matchLang = activeLanguage === 'All' || r.language === activeLanguage;
    return matchScope && matchLang;
  });

  // Fallback to first reel if filtered list is empty, or keep index within bounds
  const currentReel = filteredReels.length > 0 ? filteredReels[Math.min(activeReelIndex, filteredReels.length - 1)] : REELS_DATA[0];

  const handleScopeChange = (scope) => {
    setActiveScope(scope);
    setActiveReelIndex(0);
  };

  return (
    <div className="h-full bg-black text-white relative overflow-hidden flex flex-col">
      {/* Video Background */}
      <div className="absolute inset-0 bg-black">
        <video 
          key={currentReel.id} // Forces re-mount when reel changes
          src={currentReel.videoUrl}
          className="w-full h-full object-cover opacity-90"
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60"></div>
      </div>

      {/* Top Bar - Scope & Language */}
      <div className="relative z-20 pt-10 px-5 flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-extrabold tracking-wide">EarthGram</h1>
          <select 
            value={activeLanguage}
            onChange={(e) => { setActiveLanguage(e.target.value); setActiveReelIndex(0); }}
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold rounded-full px-3 py-1.5 outline-none appearance-none"
          >
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang} className="text-black">{lang === 'All' ? '🗣️ All Languages' : `🗣️ ${lang}`}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-center space-x-6">
          {SCOPES.map(scope => (
            <button 
              key={scope} 
              onClick={() => handleScopeChange(scope)}
              className={`text-sm font-bold capitalize transition-all ${activeScope === scope ? 'text-white border-b-2 border-white pb-0.5' : 'text-white/50'}`}
            >
              {scope}
            </button>
          ))}
        </div>
      </div>

      {/* Reel navigation dots */}
      <div className="relative z-20 flex justify-center mt-3 space-x-1.5">
        {filteredReels.map((_, i) => (
          <button key={i} onClick={() => setActiveReelIndex(i)}
            className={`h-1 rounded-full transition-all duration-300 ${i === activeReelIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`} />
        ))}
      </div>
      
      {/* Hype & Language Badges */}
      <div className="absolute top-32 left-5 z-20 flex flex-col space-y-2">
        {currentReel.isHyped && (
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-glow-orange animate-pulse flex items-center space-x-1">
            <span>🔥</span>
            <span>HYPED ON EARTHGRAM</span>
          </div>
        )}
        <div className="bg-black/40 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center space-x-1 w-max">
          <span>🗣️</span>
          <span>{currentReel.language}</span>
        </div>
        <div className="bg-black/40 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center space-x-1 w-max">
          <span>👁️</span>
          <span>{currentReel.views} views</span>
        </div>
      </div>

      {/* Side Action Buttons */}
      <div className="absolute right-4 bottom-44 flex flex-col items-center space-y-5 z-20">
        <button onClick={() => setLiked(!liked)} className="flex flex-col items-center group">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl mb-1 transition-all duration-300 ${liked ? 'bg-red-500 shadow-glow-indigo scale-110' : 'bg-white/15 backdrop-blur-sm'}`}>
            <svg className={`w-5 h-5 transition-colors ${liked ? 'text-white' : 'text-white/90'}`} fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-[11px] font-bold">{currentReel.likes}</span>
        </button>
        <button className="flex flex-col items-center">
          <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center mb-1">
            <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-[11px] font-bold">{currentReel.comments}</span>
        </button>
        <button className="flex flex-col items-center">
          <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center mb-1">
            <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <span className="text-[11px] font-bold">Share</span>
        </button>
        <button className="flex flex-col items-center">
          <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center mb-1">
            <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <span className="text-[11px] font-bold">Save</span>
        </button>
      </div>

      {/* Bottom Creator Info & CTA */}
      <div className="mt-auto relative z-20 px-5 pb-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-16">
        <div className="flex items-center space-x-3 mb-3">
          <div className={`w-11 h-11 bg-gradient-to-br ${currentReel.videoBg === 'bg-orange-600' ? 'from-orange-400 to-red-500' : 'from-purple-400 to-indigo-500'} rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-lg`}>
            {currentReel.creator.charAt(1).toUpperCase()}{currentReel.creator.charAt(2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm flex items-center">
              {currentReel.creator}
              <span className="ml-1.5 text-[8px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full font-bold">✓ Verified</span>
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">
              📍 {currentReel.location} · {currentReel.role}
            </p>
          </div>
          <button className="border border-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-[11px] font-bold hover:bg-white/10 transition-colors">Follow</button>
        </div>
        <p className="text-sm mb-4 w-4/5 leading-snug text-white/90">{currentReel.desc}</p>
        <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform shadow-glow-indigo">
          <span>{currentReel.cta}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default ReelsScreen;
