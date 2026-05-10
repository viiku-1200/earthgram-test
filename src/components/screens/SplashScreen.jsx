import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onComplete, isDarkMode }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade-out animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-700 ${
      isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
    } ${isDarkMode ? 'bg-[#0f172a]' : 'bg-white'}`}>
      
      {/* Background Glows (Premium Ambient Light) */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 blur-[100px] rounded-full animate-pulse transition-colors duration-700 ${
        isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-100/50'
      }`}></div>
      
      {/* Logo Container - Ultra Premium Glassmorphism */}
      <div className="relative animate-float">
        <div className={`w-56 h-56 rounded-[3.5rem] flex items-center justify-center p-10 shadow-premium-2xl border backdrop-blur-2xl transition-all duration-700 ${
          isDarkMode ? 'bg-slate-900/60 border-slate-700/50' : 'glass border-white/60'
        }`}>
          <img src="/logo.png" alt="EarthGram" className="w-full h-auto object-contain animate-scale-in scale-110 drop-shadow-[0_0_15px_rgba(0,191,114,0.3)]" />
        </div>
        
        {/* Animated Loading Ring */}
        <div className={`absolute -inset-4 border-2 rounded-[4rem] animate-spin-slow transition-colors duration-700 ${
          isDarkMode ? 'border-indigo-500/20 border-t-emerald-400/60' : 'border-indigo-100/40 border-t-indigo-600/40'
        }`}></div>
      </div>

      {/* Brand Text */}
      <div className="mt-8 text-center animate-fade-in-up">
        <h1 className="text-3xl font-black tracking-tighter mb-1">
          <span className={`transition-colors duration-700 ${isDarkMode ? 'text-white' : 'text-[#1E59B3]'}`}>earth</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00BF72] to-[#00E5FF]">gram</span>
        </h1>
        <p className={`text-[10px] font-bold uppercase tracking-[0.25em] mt-2 transition-colors duration-700 ${
          isDarkMode ? 'text-slate-500' : 'text-gray-400'
        }`}>
          Village to Global Ecosystem
        </p>
      </div>

      {/* Footer Version */}
      <div className="absolute bottom-12 flex flex-col items-center opacity-40">
        <div className={`w-1 h-1 rounded-full mb-2 transition-colors duration-700 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
        <span className={`text-[8px] font-black tracking-widest transition-colors duration-700 ${
          isDarkMode ? 'text-slate-600' : 'text-gray-400'
        }`}>v1.0.0 BETA</span>
      </div>
    </div>
  );
};

export default SplashScreen;
