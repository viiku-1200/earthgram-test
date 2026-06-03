import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const QUICK_TABS = [
  { id: 'food', label: 'Food', icon: '🍲', scrollTo: 'section-local-food' },
  { id: 'medical', label: 'Medical', icon: '🏥', scrollTo: 'section-hospitals' },
  { id: 'other', label: 'Other', icon: '🔍', navigateTo: '/explore' },
];

const QuickAccessBar = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = 0;

    const handleScroll = (e) => {
      // We need to get the scroll target element
      const target = e.target === document ? window : e.target;
      
      // Check if it's a DOM element with scrollTop
      if (target && typeof target.scrollTop === 'number') {
        const currentScrollY = target.scrollTop;
        
        // Ignore small scroll fluctuations
        if (currentScrollY > lastScrollY + 5) {
          // Scrolling down -> hide
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY - 5) {
          // Scrolling up -> show
          setIsVisible(true);
        }
        
        // Always show if at the very top
        if (currentScrollY <= 10) {
          setIsVisible(true);
        }

        lastScrollY = currentScrollY;
      }
    };

    // Use capture phase because scroll events don't bubble up by default
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, []);

  const handleTabClick = (tab) => {
    if (tab.navigateTo) {
      navigate(tab.navigateTo);
      return;
    }

    if (location.pathname === '/') {
      const el = document.getElementById(tab.scrollTo);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(tab.scrollTo);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  };

  return (
    <div className={`absolute bottom-[68px] left-0 right-0 z-30 flex justify-center pointer-events-none transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'
    }`}>
      <div className={`flex items-center rounded-full border shadow-lg backdrop-blur-2xl pointer-events-auto transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-900/90 border-slate-700/60' 
          : 'bg-white/90 border-gray-200/60'
      }`}>
        <div className="flex items-center space-x-0.5 px-1.5 py-1.5">
          {QUICK_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full active:scale-95 transition-all duration-200 ${
                isDarkMode
                  ? 'hover:bg-slate-800 text-slate-200'
                  : 'hover:bg-gray-100 text-gray-800'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickAccessBar;
