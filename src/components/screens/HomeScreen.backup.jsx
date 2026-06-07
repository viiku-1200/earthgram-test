import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Wrench, Sparkles, Users, GraduationCap, PartyPopper, 
  Briefcase, Leaf, ShoppingBag, Tractor, Truck, Mountain, 
  ChevronRight, Search, Bell, MapPin, Menu, Star, Play
} from 'lucide-react';
import { CATEGORIES, PROVIDERS, NATIONAL_PROVIDERS, GLOBAL_PROVIDERS, TOP_EXPERTS, HERO_BANNERS, COUNTRIES, SCOPES, FAMOUS_LOCAL_FOOD, LOCAL_RESTAURANTS } from '../../data/constants';
import ScopeMap from '../maps/ScopeMap';

const LucideIcon = ({ name, className, size = 24 }) => {
  const IconMap = {
    Zap, Wrench, Sparkles, Users, GraduationCap, PartyPopper, 
    Briefcase, Leaf, ShoppingBag, Tractor, Truck, Mountain, Star
  };
  const Icon = IconMap[name] || Zap;
  return <Icon className={className} size={size} strokeWidth={2.5} />;
};

const HomeScreen = ({ isDarkMode, setIsDarkMode, activeScope, setActiveScope, selectedCountry, setSelectedCountry, qualityPosts = [], customProviders = [], adCoins = 0, setAdCoins }) => {
  const navigate = useNavigate();
  const [activeBanner, setActiveBanner] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [splitPaneCategory, setSplitPaneCategory] = useState(null);
  const [splitPaneSubCategory, setSplitPaneSubCategory] = useState(null);
  const [locationMode, setLocationMode] = useState('default');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [hasUnreadActivity, setHasUnreadActivity] = useState(true);
  const [activeEmpowerBanner, setActiveEmpowerBanner] = useState(0);
  const [homeUIVersion, setHomeUIVersion] = useState('v3'); // 'v2' or 'v3' for live A/B testing
  const empowerScrollRef = React.useRef(null);
  const foodRef = useRef(null);

  // Interactive Food Dine-In & Ordering States
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showOrderingModal, setShowOrderingModal] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);
  const [orderingSuccessData, setOrderingSuccessData] = useState(null);
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);
  const [isProcessingOrdering, setIsProcessingOrdering] = useState(false);

  // Unified Restaurant Bottom Sheet States
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showRestaurantSheet, setShowRestaurantSheet] = useState(false);
  const [restaurantTab, setRestaurantTab] = useState('reserve'); // 'reserve' or 'menu'
  const [selectedTable, setSelectedTable] = useState('Table 3');
  const [restBookingDate, setRestBookingDate] = useState('Today');
  const [restBookingTime, setRestBookingTime] = useState('7:00 PM');
  const [restBookingGuests, setRestBookingGuests] = useState('2 Guests');
  const [restaurantCart, setRestaurantCart] = useState({}); // { itemName: qty }
  const [isProcessingRestBooking, setIsProcessingRestBooking] = useState(false);
  const [restBookingSuccess, setRestBookingSuccess] = useState(null);
  const [isProcessingRestOrder, setIsProcessingRestOrder] = useState(false);
  const [restOrderSuccess, setRestOrderSuccess] = useState(null);

  // Custom States for Unified Service Radar UI
  const [searchPlaceholderIdx, setSearchPlaceholderIdx] = useState(0);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return { categories: [], subCategories: [], providers: [] };
    const query = searchQuery.toLowerCase();
    
    // 1. Categories
    const categories = CATEGORIES.filter(c => c.name.toLowerCase().includes(query)).slice(0, 2);
    
    // 2. Sub-categories
    let subCategories = [];
    CATEGORIES.forEach(cat => {
      if (cat.subTabs) {
        cat.subTabs.forEach(sub => {
          if (sub.name !== 'All' && sub.name.toLowerCase().includes(query)) {
            subCategories.push({ ...sub, parentId: cat.id, parentName: cat.name, color: cat.color });
          }
        });
      }
    });
    subCategories = subCategories.slice(0, 3);
    
    // 3. Providers (from all lists + customProviders)
    const allProviders = [...customProviders, ...PROVIDERS, ...NATIONAL_PROVIDERS, ...GLOBAL_PROVIDERS];
    // Deduplicate by ID
    const uniqueProviders = Array.from(new Map(allProviders.map(p => [p.id, p])).values());
    const providers = uniqueProviders.filter(p => 
      p.name.toLowerCase().includes(query) || 
      (p.sub && p.sub.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query))
    ).slice(0, 4);

    return { categories, subCategories, providers };
  }, [searchQuery]);
  const [activeZone, setActiveZone] = useState('daily');

  const searchPlaceholders = [
    'Search "Tractor rental"...',
    'Search "AC Servicing"...',
    'Search "Fresh Honey"...',
    'Search "Math Tutor"...',
    'Search "Bridal Makeup"...',
    'Search "Doctor Consultation"...'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSearchPlaceholderIdx(prev => (prev + 1) % searchPlaceholders.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (locationMode === 'village') {
      setActiveZone('rural');
    } else if (locationMode === 'city') {
      setActiveZone('daily');
    } else {
      setActiveZone('daily');
    }
  }, [locationMode]);

  const country = COUNTRIES.find(c => c.id === selectedCountry);
  const CURRENCY_MAP = {
    in: '₹', np: '₨', bd: '৳', lk: '₨', pk: '₨', bt: 'Nu', mv: 'Rf',
    sg: 'S$', th: '฿', vn: '₫', my: 'RM', id: 'Rp', ph: '₱', mm: 'K', kh: '៛',
    jp: '¥', kr: '₩', cn: '¥', tw: 'NT$', hk: 'HK$',
    ae: 'د.إ', sa: '﷼', qa: 'QR', kw: 'KD', om: 'OMR', bh: 'BD', il: '₪', tr: '₺',
    uk: '£', de: '€', fr: '€', it: '€', es: '€', nl: '€', ch: 'CHF', se: 'kr', pt: '€', ie: '€', pl: 'zł',
    us: '$', ca: 'C$', mx: 'MX$', br: 'R$', ar: 'AR$', co: 'COL$',
    ng: '₦', za: 'R', ke: 'KSh', eg: 'E£', gh: 'GH₵', et: 'Br',
    au: 'A$', nz: 'NZ$', fj: 'FJ$',
  };
  const currency = CURRENCY_MAP[selectedCountry] || '₹';

  const filteredBanners = HERO_BANNERS.filter(b => b.country === 'all' || b.country === selectedCountry);

  useEffect(() => {
    const timer = setInterval(() => setActiveBanner(b => (b + 1) % 4), 4000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll for Empower Banners (DSA Logic for smooth UI)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveEmpowerBanner(prev => {
        const next = (prev + 1) % 2;
        if (empowerScrollRef.current) {
          const cardWidth = empowerScrollRef.current.offsetWidth * 0.85 + 20; // 85vw + gap
          empowerScrollRef.current.scrollTo({
            left: next === 0 ? 0 : cardWidth,
            behavior: 'smooth'
          });
        }
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentCategory = CATEGORIES.find(c => String(c.id) === String(selectedCategory));

  // Safety check to prevent blank screen if category is not found
  if (selectedCategory && !currentCategory) {
    return (
      <div className={`h-full flex flex-col items-center justify-center p-10 ${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gray-50'}`}>
        <span className="text-5xl mb-4">⚠️</span>
        <h2 className="text-xl font-bold">Category Not Found</h2>
        <button onClick={() => setSelectedCategory(null)} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-xl">Go Back</button>
      </div>
    );
  }

  const getFilteredProviders = () => {
    if (!currentCategory) return [];
    
    // Add custom providers matching this category
    const matchingCustom = customProviders.filter(p => p.category === currentCategory.name);
    
    const providers = [...matchingCustom, ...(currentCategory.providers || [])];
    if (!selectedSubCategory || selectedSubCategory === '__ALL__') return providers;
    return providers.filter(p => p.sub === selectedSubCategory || p.subCategory === selectedSubCategory);
  };

  // Get providers based on active scope
  const getScopeProviders = () => {
    const scopeId = typeof activeScope === 'string' ? activeScope : activeScope;
    if (scopeId === 'national') return NATIONAL_PROVIDERS;
    if (scopeId === 'global') return GLOBAL_PROVIDERS;
    return PROVIDERS;
  };

  const getScopeId = () => {
    const scope = SCOPES.find(s => s.id === activeScope || s.label === activeScope);
    return scope ? scope.id : 'local';
  };

  // ============== LEVEL 3: PROVIDER LIST (after sub-category click) ==============
  let level3Content = null;
  if (selectedCategory && selectedSubCategory) {
    const cat = currentCategory;
    const filteredProviders = getFilteredProviders();
    level3Content = (
      <div className="h-full flex flex-col pt-8 pb-4 animate-fade-in relative">
        {/* Header */}
        <div className="px-5 pt-2 pb-4 flex justify-between items-center mb-2">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSelectedSubCategory(null)}
              className={`w-9 h-9 rounded-2xl flex items-center justify-center active:scale-90 transition-all text-sm font-black shadow-sm border ${
                isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}>←</button>
            <div className="flex flex-col">
              <h1 className={`text-xl font-black tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedSubCategory === '__ALL__' ? 'All Providers' : selectedSubCategory}
              </h1>
              <span className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${
                isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
              }`}>{cat.name}</span>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-xl border ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-100'} shadow-sm text-center`}>
            <span className={`block text-[12px] font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{filteredProviders.length}</span>
            <span className={`block text-[8px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Pros</span>
          </div>
        </div>

        {/* Provider Cards */}
        <div className="px-5 space-y-4 pb-10">
          {/* NEW: Instant Match Banner for Sub-category */}
          <div className={`mb-4 p-5 rounded-[2rem] border relative overflow-hidden group active:scale-[0.98] transition-all cursor-pointer ${
            isDarkMode ? 'bg-slate-900 border-indigo-500/30 shadow-indigo-500/10' : 'bg-indigo-600 border-indigo-500 shadow-indigo-200 shadow-xl'
          }`}
          onClick={() => navigate('/book', { state: { category: cat, subCategory: selectedSubCategory, mode: 'instant' } })}>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white/10 to-transparent skew-x-12 transform translate-x-8"></div>
            <div className="flex items-center space-x-3 mb-2 relative z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/20 text-white backdrop-blur-md'}`}>⚡</div>
              <div>
                <h3 className={`font-black text-sm tracking-tight ${isDarkMode ? 'text-white' : 'text-white'}`}>Instant Match</h3>
                <p className={`text-[8px] font-black uppercase tracking-widest ${isDarkMode ? 'text-indigo-400' : 'text-indigo-200'}`}>Find best {selectedSubCategory} expert</p>
              </div>
            </div>
            <p className={`text-[10px] leading-relaxed font-medium relative z-10 pr-4 ${isDarkMode ? 'text-slate-400' : 'text-indigo-100'}`}>
              Too many options? We'll match you with the highest-rated <span className={`font-black ${isDarkMode ? 'text-indigo-400' : 'text-white'}`}>{selectedSubCategory}</span> company instantly.
            </p>
          </div>

          <div className="flex items-center space-x-2 mb-2 px-1">
            <div className={`w-1 h-3 rounded-full bg-gradient-to-b ${cat.color}`}></div>
            <h2 className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>Browse {selectedSubCategory} companies</h2>
          </div>

          {filteredProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 animate-fade-in">
              <span className="text-5xl mb-4 grayscale opacity-50">🔍</span>
              <p className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No providers yet</p>
              <p className="text-xs mt-1 font-medium">Be the first to register in this category!</p>
              <button onClick={() => navigate('/register')}
                className={`mt-6 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform shadow-premium ${isDarkMode ? 'bg-indigo-500 text-white' : 'bg-gray-900 text-white'}`}>
                Start Virtual Company
              </button>
            </div>
          ) : (
            filteredProviders.map((provider, i) => (
              <div key={provider.id}
                onClick={() => navigate('/provider', { state: { profile: provider } })}
                className={`relative p-5 rounded-3xl shadow-premium border cursor-pointer group active:scale-[0.98] transition-all duration-300 overflow-hidden ${
                  isDarkMode ? 'bg-slate-900/80 border-slate-700/50 hover:bg-slate-800' : 'bg-white border-gray-100 hover:bg-gray-50/50'
                }`}
                style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                {/* Background Glow */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity bg-gradient-to-br ${cat.color}`}></div>
                
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${cat.color} rounded-[1.2rem] flex items-center justify-center text-2xl shadow-lg border border-white/20 transform group-hover:rotate-6 transition-transform duration-300`}>
                      {cat.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                          isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>{provider.tag || 'Verified'}</span>
                        {provider.available && <span className="flex items-center space-x-1 animate-pulse"><span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span><span className="text-[8px] font-black text-green-600 uppercase tracking-widest">Online</span></span>}
                      </div>
                      <h3 className={`text-base font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{provider.name}</h3>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-xl flex items-center space-x-1 shadow-sm border ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-100'}`}>
                    <span className="text-yellow-500 text-[10px]">★</span>
                    <span className={`font-black text-[11px] ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{provider.rating}</span>
                  </div>
                </div>

                <div className="flex items-center text-[10px] font-bold mb-4 relative z-10 pl-1">
                  <span className={`px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>📍 {provider.distance}</span>
                  <span className={`mx-2 ${isDarkMode ? 'text-slate-700' : 'text-gray-300'}`}>•</span>
                  <span className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{provider.reviews} neighbors booked recently</span>
                </div>

                <div className={`flex justify-between items-center pt-3 border-t relative z-10 ${
                  isDarkMode ? 'border-slate-800/80' : 'border-gray-100'
                }`}>
                  <div>
                    <span className={`text-[9px] font-black uppercase tracking-widest block mb-0.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Starting at</span>
                    <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{provider.price}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); navigate('/provider', { state: { profile: provider } }); }}
                    className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-sm ${
                      isDarkMode ? 'bg-white text-gray-900 hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}>
                    View Profile
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ============== LEVEL 2: SUB-CATEGORY ICON GRID (after category click) ==============
  let level2Content = null;
  if (selectedCategory) {
    const cat = currentCategory;
    level2Content = (
      <div className="h-full flex flex-col pt-8 pb-4 animate-fade-in relative overflow-hidden">
        {/* Decorative Background Blur */}
        <div className={`absolute top-0 left-0 right-0 h-64 blur-[100px] opacity-20 pointer-events-none bg-gradient-to-br ${cat.color}`}></div>
        
        {/* Header */}
        <div className="px-5 pt-2 pb-6 flex justify-between items-center relative z-10">
          <div className="flex items-center space-x-4">
            <button onClick={() => { setSelectedCategory(null); setSelectedSubCategory(null); }}
              className={`w-9 h-9 rounded-2xl flex items-center justify-center active:scale-90 transition-all text-sm font-black shadow-sm border ${
                isDarkMode ? 'bg-slate-800/80 text-slate-300 border-slate-700/50 hover:bg-slate-700' : 'bg-white/80 backdrop-blur-md text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}>←</button>
            <div className="flex flex-col">
              <h1 className={`text-2xl font-black tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cat.name}</h1>
              {cat.badge ? (
                <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{cat.badge}</span>
              ) : (
                <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Select a service</span>
              )}
            </div>
          </div>
          <div className={`w-12 h-12 bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center text-2xl shadow-premium border border-white/20 transform rotate-3`}>
            {cat.icon}
          </div>
        </div>

        {/* ItzRunner Special View */}
        {cat.label === 'Chotu' && cat.services ? (
          <div className="px-5 mt-4 space-y-4 animate-fade-in relative z-10">
            <div className="text-center mb-6">
              <span className="text-6xl block mb-2 animate-bounce" style={{animationDuration: '2s'}}>🏃</span>
              <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>ItzRunner <span className="text-orange-500">(Chotu)</span></h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Your local delivery & task buddy</p>
            </div>
            {cat.services.map((service, i) => (
              <div key={service.id} className={`p-5 rounded-3xl shadow-premium-lg border flex items-center space-x-4 cursor-pointer active:scale-[0.98] transition-all group ${
                isDarkMode ? 'bg-slate-900/80 border-slate-700/50 hover:bg-slate-800' : 'bg-white border-gray-100 hover:bg-gray-50/50'
              }`}
                style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center text-3xl shadow-md border border-white/20 group-hover:scale-110 transition-transform">{service.icon}</div>
                <div className="flex-1">
                  <h3 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{service.name}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-medium leading-tight">{service.desc}</p>
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-2 inline-block">{service.price}</span>
                </div>
                <button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">Go</button>
              </div>
            ))}
          </div>
        ) : cat.comingSoon ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-fade-in relative z-10">
            <span className="text-6xl mb-4 grayscale opacity-40">🔒</span>
            <p className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Coming Soon</p>
            <p className="text-xs font-bold uppercase tracking-widest mt-1">Business services launching next update</p>
          </div>
        ) : (
          /* Sub-Category Icon Grid */
          <div className="px-5 mt-2 animate-fade-in relative z-10">
            <div className="grid grid-cols-3 gap-4">
              {cat.subTabs && cat.subTabs.length > 0 ? (
                cat.subTabs.filter(tab => tab.name !== 'All').map((tab, i) => {
                  const customCount = customProviders.filter(p => p.category === cat.name && (p.sub === tab.name || p.subCategory === tab.name)).length;
                  const providerCount = (cat.providers || []).filter(p => p.sub === tab.name).length + customCount;
                  return (
                    <button key={tab.name}
                      onClick={() => setSelectedSubCategory(tab.name)}
                      className="flex flex-col items-center active:scale-95 transition-all duration-300 group animate-fade-in"
                      style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                      <div className={`w-20 h-20 ${tab.bg || 'bg-indigo-50 dark:bg-slate-800'} rounded-[1.5rem] flex items-center justify-center text-4xl shadow-sm border border-gray-100 dark:border-slate-700 group-hover:shadow-premium-lg group-hover:scale-105 transition-all duration-300 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/40 dark:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="relative z-10 transform group-hover:-translate-y-1 transition-transform">{tab.icon}</span>
                      </div>
                      <span className={`text-[11px] font-black mt-3 text-center leading-tight tracking-tight ${isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>{tab.name}</span>
                      {providerCount > 0 && (
                        <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{providerCount} Pros</span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="col-span-3 py-10 text-center text-gray-400">
                  <p className="text-xs font-bold uppercase tracking-widest">No sub-categories available</p>
                </div>
              )}
            </div>

            {/* "View All" button at the bottom */}
            <button
              onClick={() => setSelectedSubCategory(null) || setSelectedSubCategory('__ALL__')}
              className={`w-full mt-8 py-4 rounded-2xl text-[11px] uppercase tracking-widest font-black active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-premium border group ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
              }`}>
              <span className="text-sm">📋</span>
              <span>View All {cat.name}</span>
              <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ============== MAIN HOMEPAGE ==============
  const currentScopeId = getScopeId();
  const scopeProviders = getScopeProviders();

  // Helper render blocks to avoid markup repetition and maintain extreme performance
  const renderRadarMap = (badgeText, badgeBg) => (
    <div className="px-5 mt-6 animate-fade-in">
      <div className="flex justify-between items-center mb-3">
        <h2 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-gray-900'}`}>
          📍 Active Radar Widget
        </h2>
        <span className={`text-[8px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse ${badgeBg}`}>
          {badgeText}
        </span>
      </div>
      <div className="relative h-64 w-full rounded-[2.5rem] overflow-hidden shadow-premium-lg border border-gray-100/50 dark:border-slate-800/50">
        <ScopeMap scope={currentScopeId} isDarkMode={isDarkMode} selectedCountry={selectedCountry} customProviders={customProviders} />
      </div>
    </div>
  );

  const renderFamousLocalFood = () => (
    <div ref={foodRef} className="px-5 mt-8 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className={`text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? 'from-orange-400 to-amber-300' : 'from-orange-600 to-amber-500'}`}>
            🍲 Famous Local Tastes
          </h2>
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
            Dine In • Sponsor Coin Rewards 🪙
          </p>
        </div>
        <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full animate-pulse uppercase tracking-wider">
          Dine & Earn
        </span>
      </div>

      <div className="flex overflow-x-auto space-x-4 hide-scrollbar pb-4 -mx-5 px-5">
        {FAMOUS_LOCAL_FOOD.map((item) => (
          <div key={item.id}
            className={`flex-shrink-0 w-80 p-5 rounded-[2.5rem] shadow-premium-lg border flex flex-col relative overflow-hidden group ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100/50 text-gray-900'
            }`}>
            
            {/* Top Row: Dish Name & Emoji */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3.5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border transition-transform duration-500 group-hover:rotate-6 ${
                  isDarkMode ? 'bg-slate-800 border-slate-705 text-white' : 'bg-orange-50 border-orange-100 text-gray-900'
                }`}>
                  {item.dishName.split(' ').pop()}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest leading-none">{item.tag}</span>
                  </div>
                  <h3 className={`text-base font-black leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.dishName.split(' ').slice(0, -1).join(' ')}
                  </h3>
                  <p 
                    onClick={(e) => {
                      e.stopPropagation();
                      const rest = LOCAL_RESTAURANTS.find(r => r.name === item.restaurantName);
                      if (rest) {
                        setSelectedRestaurant(rest);
                        setRestaurantTab('reserve');
                        setRestBookingSuccess(null);
                        setRestOrderSuccess(null);
                        setRestaurantCart({});
                        setShowRestaurantSheet(true);
                      }
                    }}
                    className="text-[10px] text-indigo-500 font-black mt-0.5 hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <span>🏛️ {item.restaurantName}</span>
                  </p>
                </div>
              </div>
              
              <div className={`px-2.5 py-1 rounded-xl border flex items-center space-x-1 shadow-sm ${
                isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-gray-50 border-gray-100'
              }`}>
                <span className="text-yellow-500 text-[10px]">★</span>
                <span className={`text-[11px] font-black ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{item.rating}</span>
              </div>
            </div>

            {/* Middle Row: Distance, Seats & Coins Sponsoring */}
            <div className={`flex items-center justify-between mb-4 p-3 rounded-2xl border text-[10px] font-bold ${
              isDarkMode ? 'bg-slate-950/40 border-slate-800/80 text-slate-300' : 'bg-gray-50/50 border-gray-100/50 text-gray-600'
            }`}>
              <div className="flex items-center space-x-1">
                <span>📍 {item.distance}</span>
              </div>
              <div className={`h-3 w-[1px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
              <div className="flex items-center space-x-1">
                <span>🪑 {item.availableSeats} tables left</span>
              </div>
              <div className={`h-3 w-[1px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
              <div className="flex items-center space-x-1.5 font-black text-yellow-500">
                <span>🪙 +{item.coinReward} Coins</span>
              </div>
            </div>

            {/* Bottom Row: Price & Dine-In/Order Actions */}
            <div className="flex justify-between items-center mt-auto">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Starting from</span>
                <span className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.price}</span>
              </div>
              <div className="flex space-x-2">
                <button onClick={(e) => { e.stopPropagation(); setSelectedFoodItem(item); setShowBookingModal(true); }}
                  className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-sm ${
                    isDarkMode ? 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                  🪑 Book Table
                </button>
                <button onClick={(e) => { e.stopPropagation(); setSelectedFoodItem(item); setShowOrderingModal(true); }}
                  className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-premium bg-gradient-to-r from-orange-500 to-amber-500 text-white`}>
                  🍽️ Order
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTopRestaurants = () => (
    <div className="px-5 mt-8 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className={`text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? 'from-amber-400 to-orange-400' : 'from-indigo-600 to-indigo-850'}`}>
            🏛️ Top Local Restaurants
          </h2>
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
            Dine In • Table Reserves & Menus 🪙
          </p>
        </div>
        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full animate-pulse uppercase tracking-wider">
          Premium Lounges
        </span>
      </div>

      <div className="flex overflow-x-auto space-x-4 hide-scrollbar pb-4 -mx-5 px-5">
        {LOCAL_RESTAURANTS.map((restaurant) => (
          <div key={restaurant.id}
            onClick={() => {
              setSelectedRestaurant(restaurant);
              setRestaurantTab('reserve');
              setRestBookingSuccess(null);
              setRestOrderSuccess(null);
              setRestaurantCart({});
              setShowRestaurantSheet(true);
            }}
            className={`flex-shrink-0 w-72 p-5 rounded-[2.5rem] shadow-premium-lg border flex flex-col relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all duration-300 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-850' : 'bg-white border-gray-100 text-gray-900 hover:bg-gray-50'
            }`}>
            
            {/* Top row: Emoji & rating */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border transition-transform duration-500 group-hover:scale-110 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-indigo-50 border-indigo-100 text-gray-900'
                }`}>
                  {restaurant.emoji}
                </div>
                <div>
                  <h3 className={`text-sm font-black leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {restaurant.name}
                  </h3>
                  <p className="text-[9px] text-gray-450 font-bold mt-0.5">{restaurant.cuisine}</p>
                </div>
              </div>

              <div className={`px-2 py-0.5 rounded-lg border flex items-center space-x-1 shadow-sm ${
                isDarkMode ? 'bg-slate-800/85 border-slate-700' : 'bg-gray-50 border-gray-100'
              }`}>
                <span className="text-yellow-500 text-[9px]">★</span>
                <span className={`text-[10px] font-black ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>{restaurant.rating}</span>
              </div>
            </div>

            {/* Quick stats: Distance, Available seats, and Reward */}
            <div className={`flex items-center justify-between mb-4 p-2.5 rounded-xl border text-[9px] font-bold ${
              isDarkMode ? 'bg-slate-950/40 border-slate-800/80 text-slate-350' : 'bg-gray-50/50 border-gray-100/50 text-gray-600'
            }`}>
              <span>📍 {restaurant.distance}</span>
              <div className={`h-2.5 w-[1px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
              <span>🪑 {restaurant.availableSeats} tables left</span>
              <div className={`h-2.5 w-[1px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
              <span className="font-black text-yellow-500">🪙 Up to +{restaurant.coinReward} Coins</span>
            </div>

            {/* Bottom Row */}
            <div className="flex justify-between items-center mt-auto pt-2">
              <span className={`text-[9px] font-black uppercase tracking-widest text-indigo-500 group-hover:translate-x-1 transition-transform`}>
                View Details & Book →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderServicesAroundYou = () => (
    <div className="mt-8 pb-4 animate-fade-in">
      <div className="px-5 flex justify-between items-center mb-4">
        <h2 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {currentScopeId === 'local' ? 'Services Around You' : currentScopeId === 'national' ? 'Top National Services' : 'Global Services'}
        </h2>
        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center space-x-1">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full online-dot"></span>
          <span>{currentScopeId === 'local' ? 'AVAILABLE NOW' : currentScopeId === 'national' ? 'PAN INDIA' : 'WORLDWIDE'}</span>
        </span>
      </div>

      <div className="flex overflow-x-auto px-5 space-x-5 hide-scrollbar pb-6">
        {scopeProviders.map((provider, i) => (
          <div key={provider.id} onClick={() => navigate('/provider', { state: { profile: provider } })}
            className={`flex-shrink-0 w-80 p-5 rounded-[32px] shadow-premium-lg border cursor-pointer card-lift flex flex-col group relative overflow-hidden ${
              isDarkMode ? 'bg-slate-900 border-slate-800/80 text-white' : 'bg-white border-gray-100/30 text-gray-900'
            }`}
            style={{ animationDelay: `${i * 0.1}s` }}>
            
            {/* Top Section: Avatar & Info */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner border transition-all duration-500 group-hover:rotate-6 ${
                  isDarkMode ? 'bg-slate-800 border-slate-750 text-white' : 'bg-indigo-50 border-indigo-100 text-gray-900'
                }`}>
                  {provider.avatar}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{provider.tag}</span>
                  </div>
                  <h3 className={`text-base font-black leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{provider.name}</h3>
                  <p className={`text-[10px] font-bold mt-1 uppercase tracking-tight ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>{provider.category}</p>
                </div>
              </div>
              <div className={`px-2.5 py-1 rounded-xl border ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                <span className={`text-[10px] font-black whitespace-nowrap ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>📍 {provider.distance}</span>
              </div>
            </div>

            {/* Middle Section: Stats */}
            <div className={`flex items-center justify-between mb-5 p-3 rounded-2xl border ${
              isDarkMode ? 'bg-slate-950/40 border-slate-800/80' : 'bg-gray-50/50 border-gray-100/50'
            }`}>
              <div className="flex items-center space-x-1">
                <span className="text-amber-500 text-xs">★</span>
                <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{provider.rating}</span>
                <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>({provider.reviews})</span>
              </div>
              <div className={`h-4 w-[1px] ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
              <div className="flex items-center space-x-1">
                <span className={`text-[10px] font-bold uppercase tracking-tighter ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {currentScopeId === 'local' ? 'Neighbor Rec.' : provider.city}
                </span>
              </div>
            </div>

            {/* Bottom Section: Price & CTA */}
            <div className="flex justify-between items-center mt-auto">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Starting from</span>
                <span className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{provider.price.replace('₹', currency).replace('₨', currency)}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); navigate('/provider', { state: { profile: provider } }); }}
                className={`px-8 py-3.5 rounded-2xl font-black text-xs active:scale-95 transition-all shadow-premium hover:shadow-indigo-500/20 flex items-center space-x-2 ${
                  isDarkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-black text-white'
                }`}>
                <span>{currentScopeId === 'local' ? 'Book Now' : 'Connect'}</span>
                <span className="opacity-50 text-[10px]">→</span>
              </button>
            </div>

            {/* Decorative accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
          </div>
        ))}
        
        {/* "View More" Card */}
        <div className="flex-shrink-0 w-20 flex flex-col items-center justify-center space-y-3 cursor-pointer group">
          <div className={`w-14 h-14 rounded-full shadow-premium flex items-center justify-center border transition-all ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white group-hover:bg-white group-hover:text-black' : 'bg-white border-gray-100 text-gray-500 group-hover:bg-black group-hover:text-white'
          }`}>
            <span className="text-xl">→</span>
          </div>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">More</span>
        </div>
      </div>
    </div>
  );

  const renderFarmersAndPros = () => (
    <div className="mt-10 animate-fade-in">
      <div className="px-5 mb-5 flex justify-between items-center">
        <div>
          <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Direct from Farmers & Pros</h2>
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>Certified Virtual Companies</p>
        </div>
        <button className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest hover:bg-emerald-100 transition-colors">See All</button>
      </div>

      <div className="px-5 grid grid-cols-3 gap-4 mb-10">
        {CATEGORIES.filter(c => ['11', '12', '13', '15', '19', '20'].includes(c.id) && (!c.countries || c.countries.includes(selectedCountry))).map((cat, i) => {
          let bgGradient = 'from-green-600 to-emerald-950';
          if (cat.id === '12') bgGradient = 'from-amber-500 to-orange-800';
          if (cat.id === '13') bgGradient = 'from-blue-600 to-indigo-900';
          if (cat.id === '15') bgGradient = 'from-slate-800 to-black';
          if (cat.id === '19') bgGradient = 'from-amber-800 to-orange-950';
          if (cat.id === '20') bgGradient = 'from-indigo-800 to-blue-950';

          return (
            <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory(null); }}
              className={`relative overflow-hidden aspect-square rounded-2xl flex flex-col items-center justify-center text-center active:scale-95 transition-all duration-300 shadow-sm group bg-gradient-to-br ${bgGradient}`}
              style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-1.5 shadow-inner border border-white/20">
                <span className="text-lg">{cat.icon}</span>
              </div>
              <span className="text-[9px] font-black text-white leading-tight uppercase tracking-wide">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderLiveReels = () => (
    <div className="mt-6 mb-4 animate-fade-in">
      <div className="px-5 flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <h2 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Live Work Reels</h2>
        </div>
        <button onClick={() => navigate('/reels')} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Watch More</button>
      </div>
      
      <div className="flex space-x-3 overflow-x-auto px-5 no-scrollbar">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} onClick={() => navigate('/reels')} className="flex-shrink-0 w-28 h-44 rounded-2xl bg-gray-200 relative overflow-hidden active:scale-95 transition-transform shadow-md border border-white">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md flex items-center space-x-1">
              <span className="w-1 h-1 bg-white rounded-full animate-ping"></span>
              <span>LIVE</span>
            </div>
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-white text-[9px] font-bold truncate">Artisan at work...</p>
              <p className="text-white/70 text-[7px]">Kathmandu, NP</p>
            </div>
            {/* Mock Video Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                <span className="text-white text-xs ml-0.5">▶</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfessionalExpertise = () => (
    <div className="mt-8 animate-fade-in">
      <div className="px-5 flex justify-between items-end mb-4">
        <div>
          <h2 className={`text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? 'from-white to-slate-400' : 'from-gray-900 to-gray-600'}`}>Professional Expertise</h2>
          <p className={`text-[10px] font-medium mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>Top-tier consultants & specialists</p>
        </div>
        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Premium</span>
      </div>
      
      <div className="px-5 grid grid-cols-2 gap-3">
        {CATEGORIES.find(c => c.id === '7')?.subTabs?.filter(t => t.name !== 'All').map((tab, i) => {
          let bgGradient = 'from-gray-800 to-black';
          if (tab.name === 'Software') bgGradient = 'from-blue-600 to-indigo-700';
          if (tab.name === 'Doctor') bgGradient = 'from-emerald-500 to-teal-700';
          if (tab.name === 'CA') bgGradient = 'from-amber-500 to-orange-600';
          if (tab.name === 'Legal') bgGradient = 'from-slate-700 to-gray-900';

          return (
            <button key={tab.name} onClick={() => { setSelectedCategory('7'); setSelectedSubCategory(tab.name); }}
              className={`relative overflow-hidden aspect-[2.4] rounded-2xl p-3 flex items-center space-x-3 text-left active:scale-95 transition-all duration-300 shadow-sm group bg-gradient-to-br ${bgGradient}`}
              style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="w-10 h-10 flex-shrink-0 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner border border-white/20">
                <span className="text-xl">{tab.icon}</span>
              </div>
              <div className="flex flex-col">
                <h3 className="text-xs font-black text-white leading-tight">{tab.name === 'CA' ? 'Chartered Acc.' : tab.name}</h3>
                <p className="text-[8px] font-bold text-white/70 uppercase tracking-wider">Expertise</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderLocalProduceAndCrafts = () => (
    <div className="mt-8 pb-2 animate-fade-in">
      <div className="px-5 flex justify-between items-end mb-4">
        <div>
          <h2 className={`text-lg font-black text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? 'from-emerald-400 to-teal-350' : 'from-green-800 to-emerald-600'}`}>Local Produce & Crafts</h2>
          <p className={`text-[10px] font-medium mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>Fresh from farms & local artisans</p>
        </div>
        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Organic</span>
      </div>
      
      <div className="px-5 grid grid-cols-3 gap-3">
        {CATEGORIES.find(c => c.id === '10')?.subTabs?.filter(t => t.name !== 'All' && (!t.countries || t.countries.includes(selectedCountry))).map((tab, i) => {
          let bgGradient = 'from-green-500 to-emerald-700';
          if (tab.name === 'Artisans') bgGradient = 'from-amber-600 to-orange-800';
          if (tab.name === 'Home Chefs') bgGradient = 'from-rose-500 to-red-700';

          return (
            <button key={tab.name} onClick={() => { setSelectedCategory('10'); setSelectedSubCategory(tab.name); }}
              className={`relative overflow-hidden aspect-square rounded-2xl flex flex-col items-center justify-center text-center active:scale-95 transition-all duration-300 shadow-sm group bg-gradient-to-br ${bgGradient}`}
              style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-1.5 shadow-inner border border-white/20">
                <span className="text-lg">{tab.icon}</span>
              </div>
              <span className="text-[9px] font-black text-white leading-tight uppercase tracking-wide">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderTopExperts = () => (
    <div className="mt-8 pb-6 animate-fade-in">
      <h2 className={`px-5 text-lg font-extrabold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Top Experts</h2>
      <div className="flex overflow-x-auto px-5 space-x-4 hide-scrollbar">
        {TOP_EXPERTS.map((expert, i) => (
          <div key={expert.id} className={`flex-shrink-0 w-56 rounded-2xl shadow-premium border overflow-hidden card-lift ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100/50 text-gray-900'
          }`}
            style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={`h-28 bg-gradient-to-r ${expert.gradient} flex items-center justify-center text-5xl`}>{expert.image}</div>
            <div className="p-3">
              <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{expert.name}</h3>
              <p className={`text-[10px] mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{expert.service}</p>
              <div className="flex justify-between items-center">
                <span className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{expert.price}</span>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500 text-xs">⭐</span>
                  <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{expert.rating} ({expert.reviews})</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`h-full w-full overflow-hidden relative ${
      isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gradient-to-b from-white to-gray-50/80 text-gray-900'
    }`}>
      {/* Dynamic Slide Deck Viewport */}
      <div 
        className="flex w-[300%] h-full transition-transform duration-500 ease-out-expo"
        style={{
          transform: selectedCategory && selectedSubCategory 
            ? 'translateX(-66.666%)' 
            : selectedCategory 
              ? 'translateX(-33.333%)' 
              : 'translateX(0%)'
        }}
      >
        {/* PANEL 1: MAIN HOMEPAGE DASHBOARD */}
        <div className="w-[33.333%] h-full flex flex-col overflow-y-auto hide-scrollbar pb-20">
          {/* Header — Single Row Industry Professional Style */}
      <div className={`z-50 px-5 pt-14 pb-4 flex justify-between items-center transition-all duration-300 border-b ${
        isDarkMode ? 'bg-[#0f172a]/95 backdrop-blur-md border-slate-800' : 'bg-white border-gray-100/50'
      }`}>
        {/* Left: Brand & Country Pill */}
        <div className="flex items-center space-x-3">
          <div className="flex flex-col items-center">
            <div className={`p-1.5 rounded-xl shadow-sm border flex items-center justify-center overflow-hidden h-9 w-9 mb-1 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
            }`}>
              <img src="/logo.png" alt="Logo" className="h-full w-full object-cover scale-150" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">
              <span className={isDarkMode ? 'text-white' : 'text-[#1E59B3]'}>earth</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00BF72] to-[#00E5FF]">gram</span>
            </span>
          </div>

          {/* Country Pill */}
          <div className="relative">
            <button 
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
                isDarkMode ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-900 shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <img src={`https://flagcdn.com/24x18/${selectedCountry === 'uk' ? 'gb' : selectedCountry}.png`} alt="" className="w-5 h-3.5 rounded-[2px] object-cover shadow-sm" />
                <span className="text-[10px] font-black uppercase tracking-tight">{COUNTRIES.find(c => c.id === selectedCountry)?.name}</span>
              </div>
              <span className={`text-[8px] font-black ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>▼</span>
            </button>
            
            {showCountryDropdown && (
              <div className={`absolute top-full left-0 mt-2 w-56 rounded-3xl shadow-premium-2xl border z-[70] animate-slide-up overflow-hidden ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
              }`}>
                {/* Search */}
                <div className={`px-3 py-2.5 border-b ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-gray-50 bg-gray-50/50'}`}>
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-[11px] ${
                    isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'
                  }`}>
                    <span className="text-xs opacity-50">🔍</span>
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={e => setCountrySearch(e.target.value)}
                      placeholder="Search country..."
                      className={`bg-transparent outline-none w-full text-[11px] font-bold placeholder-gray-400 ${
                        isDarkMode ? 'text-white placeholder-slate-500' : 'text-gray-900'
                      }`}
                      autoFocus
                    />
                  </div>
                </div>
                {/* Country list grouped by region */}
                <div className="max-h-80 overflow-y-auto hide-scrollbar">
                  {(() => {
                    const filtered = COUNTRIES.filter(c => 
                      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                      c.region.toLowerCase().includes(countrySearch.toLowerCase())
                    );
                    const regions = [...new Set(filtered.map(c => c.region))];
                    return regions.map(region => (
                      <div key={region}>
                        <div className={`px-4 py-1.5 sticky top-0 z-10 ${isDarkMode ? 'bg-slate-800/90 backdrop-blur-sm' : 'bg-gray-50/90 backdrop-blur-sm'}`}>
                          <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{region}</span>
                        </div>
                        {filtered.filter(c => c.region === region).map(ctry => (
                          <button
                            key={ctry.id}
                            onClick={() => {
                              setSelectedCountry(ctry.id);
                              setShowCountryDropdown(false);
                              setCountrySearch('');
                            }}
                            className={`w-full text-left px-4 py-2.5 text-[11px] font-bold flex items-center space-x-3 transition-all ${
                              selectedCountry === ctry.id 
                                ? (isDarkMode ? 'text-indigo-400 bg-indigo-500/10' : 'text-indigo-600 bg-indigo-50') 
                                : (isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-gray-700 hover:bg-indigo-50/30')
                            }`}
                          >
                            <img src={`https://flagcdn.com/24x18/${ctry.id === 'uk' ? 'gb' : ctry.id}.png`} alt={ctry.name} className="w-6 h-4 rounded-[3px] object-cover shadow-sm border border-gray-200/30" />
                            <span className="flex-1">{ctry.name}</span>
                            {selectedCountry === ctry.id && <span className="text-indigo-500 text-xs">✓</span>}
                          </button>
                        ))}
                      </div>
                    ));
                  })()}
                  {COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.region.toLowerCase().includes(countrySearch.toLowerCase())).length === 0 && (
                    <div className="px-4 py-6 text-center">
                      <span className="text-2xl block mb-1">🌍</span>
                      <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>No country found</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Essential Grouped Discovery Actions */}
        <div className="flex items-center space-x-2">
          {/* Layout Version Switcher (A/B Testing Mode) */}
          <button 
            onClick={() => setHomeUIVersion(prev => prev === 'v3' ? 'v2' : 'v3')}
            className={`w-10 h-10 rounded-2xl flex flex-col items-center justify-center text-[10px] font-black uppercase tracking-tighter border active:scale-90 transition-all duration-300 ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-indigo-400 hover:text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]' 
                : 'bg-white border-gray-200 text-indigo-600 shadow-sm hover:bg-gray-50'
            }`}
            title="Switch UI Design (V2 / V3)"
          >
            <span className="text-xs leading-none mb-0.5">🔀</span>
            <span className="text-[7px] leading-none">{homeUIVersion}</span>
          </button>
          
          {/* Dark Mode Toggle */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg active:scale-90 transition-all duration-300 relative overflow-hidden ${
              isDarkMode ? 'bg-indigo-600/20 text-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.15)]' : 'bg-gray-100/80 text-gray-600'
            }`}
          >
            <span className={`absolute transition-all duration-500 ${isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}>☀️</span>
            <span className={`absolute transition-all duration-500 ${isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}>🌙</span>
          </button>


          <button onClick={() => { setHasUnreadActivity(false); navigate('/activity'); }}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg relative active:scale-90 transition-all ${
            isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100/80 text-gray-900'
          }`}>
            <span>❤️</span>
            {hasUnreadActivity && (
              <div className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 border border-white shadow-sm"></span>
              </div>
            )}
          </button>
        </div>
      </div>
      
      {/* ====== LIVE PULSE TICKER (Proper Premium Integration) ====== */}
      {(() => {
        const savedAddr = localStorage.getItem('earthgram_user_address') || '';
        const areaName = savedAddr ? savedAddr.split(',')[0].trim() : 'Live';
        const isGC = areaName.toLowerCase().includes('gaur city') || areaName.toLowerCase().includes('gc');
        const pulseTitle = areaName !== 'Live' ? `${areaName} Live` : 'Live Pulse';
        

        return (
          <div className={`flex items-center border-b overflow-hidden h-10 z-40 flex-shrink-0 ${
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


      
      {/* ====== PREMIUM SCOPE TABS WITH COUNTRY SELECTOR INTEGRATED ====== */}
      <div className="px-5 mt-6 relative z-[80]">
        <div className={`flex rounded-2xl p-1.5 relative z-[70] shadow-inner-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100/80'}`}>
          {/* Animated Background Slider */}
          <div 
            className={`absolute top-1.5 bottom-1.5 rounded-xl transition-all duration-500 ease-out shadow-premium ${
              isDarkMode ? 'bg-slate-700' : 'bg-gradient-to-r from-indigo-600 to-purple-600'
            }`}
            style={{ 
              width: 'calc(33.33% - 8px)',
              left: currentScopeId === 'local' ? '6px' : currentScopeId === 'national' ? 'calc(33.33% + 2px)' : 'calc(66.66% - 2px)'
            }}
          />

          {/* LOCAL TAB */}
          <div className="flex-1 relative">
            <button 
              onClick={() => {
                setActiveScope('local');
                setShowLocationDropdown(!showLocationDropdown);
              }}
              className={`w-full relative z-10 flex items-center justify-center space-x-2 py-3 rounded-xl text-[11px] font-black transition-colors duration-300 ${
                currentScopeId === 'local' ? 'text-white' : 'text-gray-500'
              }`}>
              <span>
                {locationMode === 'default' ? '🏘️' : locationMode === 'city' ? '🏙️' : '🌾'}
              </span>
              <span className="uppercase tracking-wider">
                {locationMode === 'default' ? 'Local' : locationMode === 'city' ? 'City' : 'Village'}
              </span>
            </button>

            {/* Dropdown Menu for Local Modes */}
            {showLocationDropdown && currentScopeId === 'local' && (
              <div className={`absolute top-[120%] left-0 mt-2 w-48 rounded-3xl shadow-premium-2xl border overflow-hidden animate-slide-up z-[100] ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
              }`}>
                {[
                  { id: 'default', label: 'Default View', icon: '🌍', desc: 'All nearby services' },
                  { id: 'city', label: 'City Mode', icon: '🏙️', desc: 'Premium urban services' },
                  { id: 'village', label: 'Village Mode', icon: '🌾', desc: 'Agri & local marketplace' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setLocationMode(mode.id);
                      setShowLocationDropdown(false);
                    }}
                    className={`w-full text-left px-5 py-4 transition-all border-b last:border-0 ${
                      locationMode === mode.id 
                        ? (isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50/50') 
                        : (isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-indigo-50')
                    } ${isDarkMode ? 'border-slate-800' : 'border-gray-50'}`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-xl">{mode.icon}</span>
                      <div className="flex flex-col">
                        <span className={`text-[11px] font-black ${
                          locationMode === mode.id 
                            ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600') 
                            : (isDarkMode ? 'text-slate-200' : 'text-gray-800')
                        }`}>{mode.label}</span>
                        <span className={`text-[8px] font-bold uppercase tracking-widest ${
                          isDarkMode ? 'text-slate-500' : 'text-gray-400'
                        }`}>{mode.desc}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* NATIONAL & GLOBAL TABS */}
          {SCOPES.filter(s => s.id !== 'local').map((scope) => (
            <button key={scope.id}
              onClick={() => {
                setActiveScope(scope.id);
                setShowLocationDropdown(false);
              }}
              className={`flex-1 relative z-10 flex items-center justify-center space-x-2 py-3 rounded-xl text-[11px] font-black transition-colors duration-300 ${
                currentScopeId === scope.id ? 'text-white' : 'text-gray-500'
              }`}>
              <span>{scope.id === 'national' ? country?.flag : scope.icon}</span>
              <span className="uppercase tracking-wider">{scope.label}</span>
            </button>
          ))}
        </div>



        {/* Scope Radius Indicator */}
        <div className="flex justify-center mt-4">
          <div className={`px-4 py-1.5 rounded-full border shadow-sm flex items-center space-x-2 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-100'
          }`}>
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
            <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
              {SCOPES.find(s => s.id === currentScopeId)?.desc} • {SCOPES.find(s => s.id === currentScopeId)?.radius}
            </span>
          </div>
        </div>
      </div>

      {/* ====== SECTION 2: UNIVERSAL SERVICE SEARCH ====== */}
      <div className="px-5 mt-5 relative z-50" ref={searchContainerRef}>
        <div className={`flex items-center space-x-3 px-5 py-1 rounded-[2rem] border-2 shadow-premium transition-all relative overflow-hidden group ${
          isDarkMode ? 'bg-slate-900 border-indigo-500/20 shadow-indigo-500/10' : 'bg-white border-indigo-100 shadow-premium'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-50"></div>
          
          <span className="text-lg text-indigo-500 relative z-10">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/search', { state: { query: searchQuery } });
            }}
            placeholder={searchPlaceholders[searchPlaceholderIdx]}
            className={`flex-1 py-3 bg-transparent outline-none text-xs font-bold relative z-10 transition-all ${
              isDarkMode ? 'text-white placeholder-slate-400' : 'text-gray-900 placeholder-gray-400'
            }`}
          />
          
          {/* New Microphone Button on Homepage Search Bar! */}
          <button 
            onClick={() => navigate('/search', { state: { autoStartVoice: true } })}
            className={`relative z-10 w-8 h-8 mr-1 flex items-center justify-center rounded-full active:scale-95 transition-all shadow-sm ${
              isDarkMode ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            }`}
            title="Search with voice"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
          </button>

          {searchQuery ? (
            <button 
              onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
              className="relative z-10 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 text-[10px] hover:bg-gray-200 dark:hover:bg-slate-700"
            >
              ✕
            </button>
          ) : (
            <button onClick={() => navigate('/search')} className="relative z-10 bg-indigo-50 dark:bg-indigo-500/20 px-3 py-1.5 rounded-xl text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider shadow-inner active:scale-95 transition-transform">
              ASK AI
            </button>
          )}
        </div>

        {/* Dynamic Suggestions Dropdown */}
        {showSuggestions && searchQuery.trim() && (
          <div className={`absolute top-[calc(100%+8px)] left-5 right-5 rounded-3xl shadow-premium-2xl border overflow-hidden animate-slide-up z-50 max-h-[60vh] overflow-y-auto hide-scrollbar ${
            isDarkMode ? 'bg-slate-900/95 backdrop-blur-xl border-slate-800' : 'bg-white/95 backdrop-blur-xl border-gray-100'
          }`}>
            
            {/* 1. Categories Match */}
            {searchSuggestions.categories.length > 0 && (
              <div className="p-3">
                <h4 className={`text-[9px] font-black uppercase tracking-widest px-2 mb-2 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Categories</h4>
                <div className="grid grid-cols-2 gap-2">
                  {searchSuggestions.categories.map(cat => (
                    <button key={cat.id} 
                      onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory(null); setShowSuggestions(false); setSearchQuery(''); }}
                      className={`flex items-center space-x-2 p-2 rounded-2xl border active:scale-95 transition-all ${
                        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'
                      }`}>
                      <div className="w-8 h-8 rounded-xl bg-white/50 dark:bg-black/20 flex items-center justify-center text-lg shadow-sm border border-black/5 dark:border-white/5">{cat.icon}</div>
                      <span className={`text-[10px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Sub-categories Match */}
            {searchSuggestions.subCategories.length > 0 && (
              <div className={`p-3 ${searchSuggestions.categories.length > 0 ? (isDarkMode ? 'border-t border-slate-800' : 'border-t border-gray-50') : ''}`}>
                <h4 className={`text-[9px] font-black uppercase tracking-widest px-2 mb-2 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Specific Services</h4>
                <div className="flex flex-col space-y-1.5">
                  {searchSuggestions.subCategories.map((sub, i) => (
                    <button key={i}
                      onClick={() => { setSelectedCategory(sub.parentId); setSelectedSubCategory(sub.name); setShowSuggestions(false); setSearchQuery(''); }}
                      className={`flex items-center justify-between p-3 rounded-2xl active:scale-[0.98] transition-all group ${
                        isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
                      }`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-lg">{sub.icon}</div>
                        <div className="flex flex-col items-start">
                          <span className={`text-[11px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{sub.name}</span>
                          <span className={`text-[9px] font-medium ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>in {sub.parentName}</span>
                        </div>
                      </div>
                      <span className={`text-xs opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>↗</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Providers Match */}
            {searchSuggestions.providers.length > 0 && (
              <div className={`p-3 ${searchSuggestions.categories.length > 0 || searchSuggestions.subCategories.length > 0 ? (isDarkMode ? 'border-t border-slate-800' : 'border-t border-gray-50') : ''}`}>
                <h4 className={`text-[9px] font-black uppercase tracking-widest px-2 mb-2 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Virtual Companies</h4>
                <div className="flex flex-col space-y-2">
                  {searchSuggestions.providers.map((provider) => (
                    <button key={provider.id}
                      onClick={() => { navigate('/provider', { state: { profile: provider } }); setShowSuggestions(false); }}
                      className={`flex items-center justify-between p-3 rounded-2xl border active:scale-[0.98] transition-all hover:shadow-premium-sm ${
                        isDarkMode ? 'bg-slate-950/50 border-slate-800 hover:bg-slate-800' : 'bg-white border-gray-100 hover:bg-gray-50'
                      }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-inner border ${
                          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-indigo-50 border-indigo-100'
                        }`}>{provider.avatar}</div>
                        <div className="flex flex-col items-start">
                          <div className="flex items-center space-x-1">
                            <span className={`text-[11px] font-black leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{provider.name}</span>
                            {provider.available && <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>}
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{provider.sub || provider.category}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-[10px] font-black ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>📍 {provider.distance}</span>
                        <div className="flex items-center space-x-0.5">
                          <span className="text-yellow-500 text-[9px]">★</span>
                          <span className={`text-[9px] font-black ${isDarkMode ? 'text-yellow-500' : 'text-yellow-600'}`}>{provider.rating}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No matches */}
            {searchSuggestions.categories.length === 0 && searchSuggestions.subCategories.length === 0 && searchSuggestions.providers.length === 0 && (
              <div className="p-8 text-center flex flex-col items-center">
                <span className="text-3xl mb-2 opacity-50 grayscale">🔭</span>
                <p className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No direct matches</p>
                <p className={`text-[10px] mt-1 mb-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Press Enter to ask AI or search globally.</p>
                <button 
                  onClick={() => navigate('/search', { state: { query: searchQuery } })}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform shadow-md shadow-indigo-500/20"
                >
                  Global Search
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ====== SECTION 3: PREMIUM BILLBOARD CAROUSEL ====== */}
      <div className="px-5 mt-5">
        <div className="relative overflow-hidden rounded-[2.5rem] shadow-premium-lg border border-white/5 h-28 bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-5 flex items-center justify-between">
          {/* Slide 1: 20-Min Emergency */}
          {activeBanner % 4 === 0 && (
            <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-red-900 to-black p-5 flex items-center justify-between animate-fade-in">
              <div className="flex-1 pr-2 relative z-10">
                <span className="text-[8px] font-black text-red-300 uppercase tracking-widest mb-1 block">⚡ FASTEST RESPONSE</span>
                <h2 className="text-base font-black text-white leading-tight font-outfit">Emergency Help<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-red-400">In 20 Minutes</span></h2>
                <p className="text-[8px] text-gray-300 mt-1 opacity-90">Plumber, Electrician & Medical supplies.</p>
              </div>
              <div className="flex-shrink-0 w-16 h-16 bg-white/5 rounded-full flex items-center justify-center relative animate-pulse">
                <span className="text-4xl animate-float">⚡</span>
              </div>
            </div>
          )}

          {/* Slide 2: Start Virtual Company */}
          {activeBanner % 4 === 1 && (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-black p-5 flex items-center justify-between animate-fade-in">
              <div className="flex-1 pr-2 relative z-10">
                <span className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mb-1 block">🚀 EMPOWER YOUR SKILL</span>
                <h2 className="text-base font-black text-white leading-tight font-outfit">Start Your Own<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">Virtual Company</span></h2>
                <p className="text-[8px] text-gray-300 mt-1 opacity-90">Setup your digital shop on EarthGram with zero cost.</p>
              </div>
              <div className="flex-shrink-0 w-16 h-16 bg-white/5 rounded-full flex items-center justify-center relative animate-pulse">
                <span className="text-4xl animate-float">🚀</span>
              </div>
            </div>
          )}

          {/* Slide 3: Mandi Direct */}
          {activeBanner % 4 === 2 && (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-teal-950 to-black p-5 flex items-center justify-between animate-fade-in">
              <div className="flex-1 pr-2 relative z-10">
                <span className="text-[8px] font-black text-emerald-300 uppercase tracking-widest mb-1 block">🌾 DIRECT FROM FARMERS</span>
                <h2 className="text-base font-black text-white leading-tight font-outfit">Mandi Connect<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-yellow-400">Buy Direct</span></h2>
                <p className="text-[8px] text-gray-300 mt-1 opacity-90">Organic crops, fresh seeds, and local artisans.</p>
              </div>
              <div className="flex-shrink-0 w-16 h-16 bg-white/5 rounded-full flex items-center justify-center relative animate-pulse">
                <span className="text-4xl animate-float">🌾</span>
              </div>
            </div>
          )}

          {/* Slide 4: Dine-In & Earn Coins (NEW) */}
          {activeBanner % 4 === 3 && (
            <div 
              onClick={() => foodRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="absolute inset-0 bg-gradient-to-br from-rose-950 via-orange-900 to-black p-5 flex items-center justify-between animate-fade-in cursor-pointer"
            >
              <div className="flex-1 pr-2 relative z-10">
                <span className="text-[8px] font-black text-amber-300 uppercase tracking-widest mb-1 block">🍽️ DINE-IN & EARN</span>
                <h2 className="text-base font-black text-white leading-tight font-outfit">Book Tables & Dine<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">Claim Mega Coins 🪙</span></h2>
                <p className="text-[8px] text-gray-200 mt-1 opacity-90">Reserve seats or order at your table to earn coins from restaurants!</p>
              </div>
              <div className="flex-shrink-0 w-16 h-16 bg-white/5 rounded-full flex items-center justify-center relative animate-pulse">
                <span className="text-4xl animate-float">🍕</span>
              </div>
            </div>
          )}

          {/* Indicator dots inside the card bottom-right */}
          <div className="absolute bottom-3 right-4 flex space-x-1 z-20">
            {[0, 1, 2, 3].map((i) => (
              <button 
                key={i} 
                onClick={() => setActiveBanner(i)}
                className={`h-1 rounded-full transition-all duration-300 ${i === (activeBanner % 4) ? 'w-4 bg-white' : 'w-1 bg-white/30'}`} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* ====== A/B DESIGN TESTING WRAPPER ====== */}
      {homeUIVersion === 'v3' ? (
        <>
          {/* ====== SECTION TITLE: Services Around Me (V3) ====== */}
          <div className="mt-8 px-5 animate-fade-in">
            <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Services Around Me</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Select a category to find premium local experts</p>
          </div>

          {/* ====== SECTION 4: SPLIT-PANE VERTICAL CATEGORY RAIL (V3) ====== */}
          <div className="mt-4 px-5 animate-fade-in">
            <div className="flex space-x-4 h-[28rem]">
              
              {/* Left Rail (Categories) */}
              <div className="w-[4.5rem] flex-shrink-0 flex flex-col space-y-3 overflow-y-auto hide-scrollbar pb-6">
                {CATEGORIES.filter(c => !c.visibility || c.visibility.includes(locationMode)).map((cat) => {
                  const isActive = splitPaneCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setSplitPaneCategory(cat.id); setSplitPaneSubCategory(null); }}
                      className={`relative flex flex-col items-center justify-center p-2 rounded-[1.5rem] transition-all duration-300 active:scale-95 border ${
                        isActive 
                          ? (isDarkMode ? 'bg-indigo-600 border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-200')
                          : (isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-sm')
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-[1.1rem] flex items-center justify-center text-[22px] mb-1.5 ${isActive ? 'text-white' : (isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-50 text-gray-600')}`}>
                        {cat.icon}
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-wider text-center leading-[1.1] ${isActive ? 'text-indigo-50' : (isDarkMode ? 'text-slate-500' : 'text-gray-400')}`}>
                        {cat.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Panel (Dynamic Content) */}
              <div className={`flex-1 rounded-[2rem] p-4 flex flex-col overflow-y-auto hide-scrollbar border shadow-premium-lg relative ${
                isDarkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-gray-50/50 border-gray-100'
              }`}>
                {(() => {
                  const activeCat = CATEGORIES.find(c => c.id === (splitPaneCategory || CATEGORIES.filter(cat => !cat.visibility || cat.visibility.includes(locationMode))[0]?.id));
                  if (!activeCat) return null;

                  // Filter providers based on splitPaneSubCategory state
                  const getFilteredSplitPaneProviders = () => {
                    const providers = activeCat.providers || [];
                    if (!splitPaneSubCategory || splitPaneSubCategory === 'All') return providers;
                    return providers.filter(p => p.sub.toLowerCase() === splitPaneSubCategory.toLowerCase() || p.sub.toLowerCase().includes(splitPaneSubCategory.toLowerCase()));
                  };
                  const filteredProviders = getFilteredSplitPaneProviders();

                  return (
                    <div className="animate-fade-in flex flex-col min-h-full">
                      {/* Right Panel Header */}
                      <div className={`flex items-center justify-between mb-4 sticky top-0 z-10 pt-1 pb-2 backdrop-blur-md transition-all ${
                        isDarkMode ? 'bg-slate-900/90' : 'bg-gray-50/90'
                      }`}>
                        <h3 className={`text-base font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activeCat.name}</h3>
                        <span className={`text-[8px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                          {filteredProviders.length} PROS
                        </span>
                      </div>

                      {/* Sub-categories row */}
                      {activeCat.subTabs && (
                        <div className="flex space-x-2 overflow-x-auto hide-scrollbar mb-4 pb-1 shrink-0">
                          {activeCat.subTabs.map((tab) => {
                            const isChipActive = splitPaneSubCategory === tab.name || (!splitPaneSubCategory && tab.name === 'All');
                            return (
                              <button 
                                key={tab.name}
                                onClick={() => setSplitPaneSubCategory(tab.name === 'All' ? null : tab.name)}
                                className={`flex-shrink-0 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center space-x-1.5 transition-all active:scale-95 border ${
                                  isChipActive
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                                    : (isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-gray-600 border-gray-200 shadow-sm hover:bg-gray-50')
                                }`}
                              >
                                <span className="text-sm">{tab.icon}</span>
                                <span>{tab.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Instant Match Banner */}
                      <div 
                        onClick={() => navigate('/book', { state: { category: activeCat, subCategory: splitPaneSubCategory || 'All', mode: 'instant' } })}
                        className={`mb-4 p-4 rounded-[1.5rem] border-2 flex items-center justify-between cursor-pointer active:scale-95 transition-all duration-300 relative overflow-hidden shrink-0 group ${
                          isDarkMode ? 'bg-indigo-950/20 border-indigo-500/30 hover:border-indigo-500/50' : 'bg-indigo-50/50 border-indigo-100 hover:border-indigo-200'
                        }`}
                      >
                        <div className="absolute -right-2 -bottom-2 opacity-5 text-4xl group-hover:scale-110 transition-transform">⚡</div>
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-base shadow-glow-indigo animate-bounce-subtle">⚡</div>
                          <div className="flex flex-col">
                            <h4 className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Instant Match</h4>
                            <p className={`text-[8px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                              Best {splitPaneSubCategory || activeCat.name.split(' ')[0]} expert instantly
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest group-hover:translate-x-0.5 transition-transform">Match →</span>
                      </div>

                      {/* Providers / Staff list */}
                      <div className="flex flex-col space-y-3 pb-4">
                        {filteredProviders.slice(0, 5).map((provider) => (
                          <div 
                            key={provider.id} 
                            onClick={() => navigate('/provider', { state: { profile: provider } })}
                            className={`flex items-center justify-between p-3.5 rounded-[1.5rem] border cursor-pointer transition-all active:scale-[0.98] hover:shadow-premium-sm ${
                              isDarkMode ? 'bg-slate-950/80 border-slate-800/80 hover:bg-slate-950' : 'bg-white border-gray-100 shadow-sm hover:bg-gray-50/50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-inner border ${
                                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-indigo-50 border-indigo-100'
                              }`}>
                                {provider.avatar || activeCat.icon}
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center space-x-1.5">
                                  <h4 className={`text-[11px] font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{provider.name}</h4>
                                  {provider.available && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>}
                                </div>
                                <p className={`text-[9px] font-bold mt-0.5 uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                  {provider.sub} • {provider.distance}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end justify-center space-y-1.5">
                              <div className="text-right">
                                <span className={`text-[11px] font-black ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{provider.price.split(' ')[0]}</span>
                                <div className="flex items-center justify-end space-x-0.5 mt-0.5 bg-yellow-50 dark:bg-yellow-500/10 px-1.5 py-0.5 rounded-md">
                                  <span className="text-yellow-500 text-[8px]">★</span>
                                  <span className={`text-[9px] font-black ${isDarkMode ? 'text-yellow-500' : 'text-yellow-700'}`}>{provider.rating}</span>
                                </div>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/book', { state: { provider: provider, service: { name: provider.sub || activeCat.name, price: provider.price } } });
                                }}
                                className="px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white bg-indigo-600 dark:bg-indigo-500 rounded-[0.5rem] active:scale-90 hover:scale-105 transition-all shadow-sm shadow-indigo-600/30"
                              >
                                BOOK
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        {filteredProviders.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
                            <span className="text-4xl mb-3 grayscale opacity-50">🔭</span>
                            <h4 className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>No Pros Found</h4>
                            <p className={`text-[9px] font-bold mt-1 max-w-[80%] ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>We are currently onboarding partners in this category.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* ====== SECTION TITLE: Explore Categories (V2) ====== */}
          <div className="mt-8 px-5 animate-fade-in">
            <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Explore Categories</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Select a category to find premium local experts</p>
          </div>

          {/* ====== SECTION 4: COMPACT FOUR-ZONE SERVICE HUB (V2) ====== */}
          <div className="mt-4 px-5 animate-fade-in">
            {/* Dynamic Zone Selector Tabs */}
            <div className="flex overflow-x-auto no-scrollbar space-x-2 mb-4 pb-1">
              {[
                { id: 'daily', label: 'Daily Services', icon: '🧹', activeClass: isDarkMode ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm' },
                { id: 'emergency', label: 'Emergency', icon: '🚨', activeClass: isDarkMode ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-600 border-red-100 shadow-sm' },
                { id: 'rural', label: 'Rural & Farm', icon: '🚜', activeClass: isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' },
                { id: 'pro', label: 'Pro & Travel', icon: '💼', activeClass: isDarkMode ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-purple-50 text-purple-600 border-purple-100 shadow-sm' }
              ].filter(zone => {
                if (locationMode === 'city') return zone.id !== 'rural';
                if (locationMode === 'village') return zone.id === 'rural' || zone.id === 'emergency';
                return true;
              }).map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setActiveZone(zone.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 flex items-center space-x-2 ${
                    activeZone === zone.id
                      ? `${zone.activeClass} border-2`
                      : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-gray-100 text-gray-500')
                  }`}
                >
                  <span>{zone.icon}</span>
                  <span className="font-outfit">{zone.label}</span>
                </button>
              ))}
            </div>

            {/* Compact Grid of Active Zone Categories */}
            <div className="grid grid-cols-4 gap-3 bg-gray-50/30 dark:bg-slate-900/20 p-3 rounded-[2.5rem] border border-gray-100/50 dark:border-slate-800/50">
              {CATEGORIES.filter(c => {
                const emergencyIds = ['1', '2', '8'];
                const dailyIds = ['3', '4', '5', '6', '9', '16', '17', '18', '22', '24', '25'];
                const ruralIds = ['11', '12', '13', '15', '19', '20', '27', '28'];
                const proIds = ['7', '10', '14'];

                // Visibility filter per mode
                if (c.visibility && !c.visibility.includes(locationMode)) return false;

                if (activeZone === 'emergency') return emergencyIds.includes(String(c.id));
                if (activeZone === 'daily') return dailyIds.includes(String(c.id));
                if (activeZone === 'rural') return ruralIds.includes(String(c.id));
                if (activeZone === 'pro') return proIds.includes(String(c.id));
                return false;
              }).map((cat, i) => {
                let bgGlow = 'from-red-500/10 to-red-600/10 hover:shadow-red-500/5';
                let glowBorder = 'border-red-500/30 shadow-red-500/5 text-red-400';
                
                if (activeZone === 'daily') {
                   bgGlow = 'from-indigo-500/10 to-indigo-600/10 hover:shadow-indigo-500/5';
                   glowBorder = 'border-indigo-500/30 shadow-indigo-500/5 text-indigo-400';
                } else if (activeZone === 'rural') {
                   bgGlow = 'from-emerald-500/10 to-emerald-600/10 hover:shadow-emerald-500/5';
                   glowBorder = 'border-emerald-500/30 shadow-emerald-500/5 text-emerald-400';
                } else if (activeZone === 'pro') {
                   bgGlow = 'from-purple-500/10 to-purple-600/10 hover:shadow-purple-500/5';
                   glowBorder = 'border-purple-500/30 shadow-purple-500/5 text-purple-400';
                }

                return (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory(null); }}
                    className={`relative aspect-square rounded-[2rem] flex flex-col items-center justify-center p-2 text-center active:scale-95 transition-all duration-300 shadow-sm border border-gray-100/10 bg-gradient-to-br ${bgGlow} group`}
                  >
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl mb-1.5 transition-all duration-300 group-hover:scale-110 shadow-md ${
                      isDarkMode 
                        ? `bg-slate-900/90 border ${glowBorder}` 
                        : `bg-gradient-to-br ${cat.color || 'from-indigo-500 to-indigo-600'} text-white`
                    }`}>
                      {cat.icon}
                    </div>
                    <span className={`text-[9px] font-black leading-tight uppercase tracking-tight truncate max-w-full ${
                      isDarkMode ? 'text-slate-300' : 'text-gray-800'
                    }`}>
                      {cat.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ====== THREE MODE-SPECIFIC LAYOUTS ====== */}
      {locationMode === 'city' && (
        <div className="animate-fade-in">
          {renderRadarMap('City Radar', 'bg-indigo-505')}
          {renderServicesAroundYou()}
          {renderFamousLocalFood()}
          {renderTopRestaurants()}
          {renderLiveReels()}
          {renderProfessionalExpertise()}
          {renderTopExperts()}
        </div>
      )}

      {locationMode === 'village' && (
        <div className="animate-fade-in">
          {renderRadarMap('Village Radar', 'bg-emerald-500')}
          
          {/* Village Tool Rental - ONLY for India Village */}
          {selectedCountry === 'in' && (
            <div className="mt-8 animate-fade-in">
              <div className="px-5 mb-5 flex justify-between items-center">
                <div>
                  <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Village Tool Rental</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Neighbor-to-Neighbor</p>
                </div>
                <button className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest transition-colors ${
                  isDarkMode ? 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                }`}>See All</button>
              </div>
              
              <div className="px-5 grid grid-cols-3 gap-4">
                {CATEGORIES.find(c => c.id === '15')?.subTabs?.filter(t => t.name !== 'All').map((tab, i) => (
                  <button key={tab.name} onClick={() => { setSelectedCategory('15'); setSelectedSubCategory(tab.name); }}
                    className="relative overflow-hidden aspect-square rounded-3xl flex flex-col items-center justify-center text-center active:scale-95 transition-all duration-300 shadow-premium border border-white/10 group animate-fade-in bg-gradient-to-br from-slate-800 to-black"
                    style={{ animationDelay: `${i * 0.08}s` }}>
                    
                    <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-2 shadow-inner border border-white/10">
                      <span className="text-xl">{tab.icon}</span>
                    </div>
                    
                    <span className="text-[10px] font-black text-white leading-tight uppercase tracking-widest">{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {renderLocalProduceAndCrafts()}
          {selectedCountry === 'in' && renderFarmersAndPros()}
          {renderServicesAroundYou()}
          {renderFamousLocalFood()}
          {renderTopRestaurants()}
        </div>
      )}

      {locationMode === 'default' && (
        <div className="animate-fade-in">
          {renderRadarMap('Live Radar', 'bg-emerald-500')}
          {renderServicesAroundYou()}
          {renderFamousLocalFood()}
          {renderTopRestaurants()}
          {selectedCountry === 'in' && renderFarmersAndPros()}
          {renderLiveReels()}
          {renderProfessionalExpertise()}
          {renderLocalProduceAndCrafts()}
          
          {/* ====== TOURISM SECTION (ASIA ONLY) ====== */}
          {country?.region !== 'west' && (
            <div className="mt-10 mb-8">
              <div className="px-5 flex justify-between items-end mb-4">
                <div>
                  <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Experience {country?.name}</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Tourism & Local Adventures</p>
                </div>
                <button className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest transition-colors ${
                  isDarkMode ? 'text-indigo-400 bg-indigo-500/10' : 'text-indigo-600 bg-indigo-50'
                }`}>See All</button>
              </div>

              {/* Tour Sub-categories - Premium Grid Style */}
              <div className="px-5 grid grid-cols-3 gap-3 mb-6">
                {CATEGORIES.find(c => c.id === '14')?.subTabs?.filter(t => t.name !== 'All').map((tab, i) => {
                  let bgGradient = 'from-cyan-500 to-blue-700';
                  if (tab.name === 'Trek Guides') bgGradient = 'from-emerald-600 to-green-800';
                  if (tab.name === 'Cultural') bgGradient = 'from-amber-600 to-orange-800';
                  if (tab.name === 'Adventure') bgGradient = 'from-blue-600 to-indigo-800';
                  if (tab.name === 'Homestays') bgGradient = 'from-rose-500 to-pink-700';

                  return (
                    <button key={tab.name} onClick={() => { setSelectedCategory('14'); setSelectedSubCategory(tab.name); }}
                      className={`relative overflow-hidden aspect-square rounded-2xl flex flex-col items-center justify-center text-center active:scale-95 transition-all duration-300 shadow-sm group bg-gradient-to-br ${bgGradient}`}
                      style={{ animationDelay: `${i * 0.06}s` }}>
                      
                      <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-1.5 shadow-inner border border-white/20">
                        <span className="text-lg">{tab.icon}</span>
                      </div>
                      
                      <span className="text-[9px] font-black text-white leading-tight uppercase tracking-wide">{tab.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Featured Tours */}
              <div className="flex space-x-4 overflow-x-auto px-5 pb-4 no-scrollbar snap-x">
                {CATEGORIES.find(c => c.id === '14')?.providers?.filter(p => p.country === selectedCountry).map((tour) => (
                  <div key={tour.id} className={`flex-shrink-0 w-64 rounded-3xl overflow-hidden shadow-premium-lg border snap-center ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
                  }`}>
                    <div className="h-32 bg-gradient-to-br from-indigo-500 to-blue-700 relative flex items-center justify-center">
                       <span className="text-6xl animate-float">{tour.sub === 'Trek Guides' ? '🏔️' : tour.sub === 'Adventure' ? '🪂' : '🏯'}</span>
                       <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded-full text-[9px] font-bold text-white uppercase tracking-widest">
                         {tour.tag}
                       </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h4 className={`font-black text-sm leading-tight w-2/3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tour.name}</h4>
                        <div className="flex items-center space-x-0.5 bg-yellow-50 px-1.5 py-0.5 rounded-lg">
                          <span className="text-yellow-500 text-[10px]">★</span>
                          <span className="text-[10px] font-black text-yellow-700">{tour.rating}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wider">{tour.distance}</p>
                      <div className={`flex justify-between items-center mt-4 pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-50'}`}>
                        <span className={`text-sm font-black ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{tour.price.replace('₨', currency).replace('₹', currency)}</span>
                        <button className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform shadow-md shadow-indigo-100">
                          Book Trip
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {renderTopExperts()}
        </div>
      )}
        </div>

        {/* PANEL 2: SUB-CATEGORY ICON GRID */}
        <div className={`w-[33.333%] h-full flex flex-col overflow-y-auto hide-scrollbar pb-20 border-l ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-gray-50 border-gray-100'
        }`}>
          {level2Content}
        </div>

        {/* PANEL 3: PROVIDER LISTINGS */}
        <div className={`w-[33.333%] h-full flex flex-col overflow-y-auto hide-scrollbar pb-20 border-l ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-gray-50 border-gray-100'
        }`}>
          {level3Content}
        </div>


      </div>
      {/* ====== TABLE BOOKING MODAL ====== */}
      {showBookingModal && selectedFoodItem && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-[500px] max-h-[85vh] rounded-t-[3rem] p-6 pb-10 flex flex-col overflow-y-auto hide-scrollbar shadow-premium-2xl animate-slide-up border-t ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'
          }`}>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black tracking-tight font-outfit">🪑 Reserve Table</h3>
              <button 
                onClick={() => { setShowBookingModal(false); setBookingSuccessData(null); }}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-bold"
              >✕</button>
            </div>

            {!bookingSuccessData ? (
              <div className="space-y-5">
                {/* Dish Info Card */}
                <div className={`p-4 rounded-3xl border flex items-center space-x-3.5 ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800/80' : 'bg-orange-50/30 border-orange-100/50'
                }`}>
                  <span className="text-3xl">{selectedFoodItem.dishName.split(' ').pop()}</span>
                  <div>
                    <h4 className="font-black text-sm">{selectedFoodItem.dishName.split(' ').slice(0, -1).join(' ')}</h4>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">{selectedFoodItem.restaurantName}</p>
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Select Date</label>
                  <div className="flex space-x-3">
                    {['Today', 'Tomorrow', 'Day After'].map((d, idx) => (
                      <button key={d} className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider border transition-all ${
                        idx === 0 
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent' 
                          : isDarkMode ? 'bg-slate-800 border-slate-707 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-600'
                      }`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Select Time Slot</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['12:30 PM', '1:30 PM', '7:00 PM', '8:00 PM', '9:30 PM'].map((t, idx) => (
                      <button key={t} className={`py-3 rounded-2xl text-xs font-black uppercase tracking-wider border transition-all ${
                        idx === 2 
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent' 
                          : isDarkMode ? 'bg-slate-800 border-slate-707 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-600'
                      }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guests Selection */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Number of Guests</label>
                  <div className="flex space-x-2">
                    {['1 Guest', '2 Guests', '4 Guests', '6+ Guests'].map((g, idx) => (
                      <button key={g} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                        idx === 1 
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent' 
                          : isDarkMode ? 'bg-slate-800 border-slate-707 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-600'
                      }`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info Note */}
                <div className={`p-4 rounded-2xl border flex items-start space-x-2.5 text-[10px] font-medium leading-relaxed ${
                  isDarkMode ? 'bg-slate-850 border-slate-800 text-slate-400' : 'bg-gray-50 border-gray-100 text-gray-500'
                }`}>
                  <span className="text-xs">💡</span>
                  <span>
                    Table reservations are held for 15 minutes. To prevent coin fraud, your booking coins will be active once you scan the table QR code at the restaurant!
                  </span>
                </div>

                {/* Action button */}
                <button 
                  disabled={isProcessingBooking}
                  onClick={() => {
                    setIsProcessingBooking(true);
                    setTimeout(() => {
                      const code = `EB-${Math.floor(1000 + Math.random() * 9000)}`;
                      setBookingSuccessData({ code });
                      setIsProcessingBooking(false);
                    }, 1500);
                  }}
                  className={`w-full py-4 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-premium active:scale-95 transition-all mt-4 flex justify-center items-center space-x-2 ${
                    isProcessingBooking ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-amber-500'
                  }`}
                >
                  {isProcessingBooking ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Confirm Table Reservation</span>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center py-6 space-y-5 animate-fade-in">
                <span className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>🎉</span>
                <div>
                  <h4 className="text-xl font-black font-outfit">Table Reserved!</h4>
                  <p className="text-xs text-gray-500 mt-1">Confirmed at {selectedFoodItem.restaurantName}</p>
                </div>

                {/* Ticket Details */}
                <div className={`w-full p-5 rounded-3xl border border-dashed relative ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50 border-gray-250'
                }`}>
                  <div className="flex justify-between items-center text-left border-b pb-3 mb-3 border-dashed border-gray-700">
                    <div>
                      <span className="text-[8px] font-black text-gray-505 uppercase tracking-widest block leading-none mb-1">Booking Code</span>
                      <span className="text-base font-black text-orange-500 tracking-wider font-outfit">{bookingSuccessData.code}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-black text-gray-505 uppercase tracking-widest block leading-none mb-1">Table Type</span>
                      <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>2 Guests</span>
                    </div>
                  </div>

                  <div className="text-left space-y-2">
                    <p className={`text-[10px] leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      Show this ticket to the restaurant host on arrival. Once seated, scan the table QR code to claim your coin reward.
                    </p>
                    <div className="flex justify-between items-center bg-yellow-500/10 border border-yellow-500/20 px-3 py-2.5 rounded-xl mt-2">
                      <span className="text-[9px] font-black text-yellow-600 uppercase tracking-widest">Sponsor coins</span>
                      <span className="text-xs font-black text-yellow-500">🪙 +{selectedFoodItem.coinReward} Coins</span>
                    </div>
                  </div>
                </div>

                {/* Direct QR Simulation check-in */}
                <div className="w-full pt-4 space-y-3">
                  <div className="flex items-center space-x-2 justify-center mb-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Simulate GPS Arrival</span>
                  </div>
                  <button 
                    onClick={() => {
                      if (setAdCoins) {
                        setAdCoins(prev => prev + selectedFoodItem.coinReward);
                      }
                      alert(`🎉 Success! You arrived at ${selectedFoodItem.restaurantName} & scanned the table QR. +${selectedFoodItem.coinReward} Coins added to your Wallet!`);
                      setShowBookingModal(false);
                      setBookingSuccessData(null);
                    }}
                    className="w-full py-4 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-premium active:scale-95 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>📱 Scan Table QR (Claim Coins)</span>
                  </button>
                  <button 
                    onClick={() => { setShowBookingModal(false); setBookingSuccessData(null); }}
                    className={`w-full py-3.5 text-xs font-black uppercase tracking-widest rounded-2xl border transition-all ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Close & Go to Restaurant Later
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====== IN-RESTAURANT ORDER AT TABLE MODAL ====== */}
      {showOrderingModal && selectedFoodItem && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-[500px] max-h-[85vh] rounded-t-[3rem] p-6 pb-10 flex flex-col overflow-y-auto hide-scrollbar shadow-premium-2xl animate-slide-up border-t ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'
          }`}>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black tracking-tight font-outfit">🍽️ Order at Table</h3>
              <button 
                onClick={() => { setShowOrderingModal(false); setOrderingSuccessData(null); }}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-bold"
              >✕</button>
            </div>

            {!orderingSuccessData ? (
              <div className="space-y-5">
                {/* Intro Card */}
                <div className={`p-4 rounded-3xl border ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800/80' : 'bg-gray-50/50 border-gray-100/50'
                }`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1`}>Dine-In Digital Menu</p>
                  <h4 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedFoodItem.restaurantName}</h4>
                  <p className="text-[9px] text-gray-500 mt-0.5">Place an order directly from your table using Earthgram to unlock coins!</p>
                </div>

                {/* Table Number Selector */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Select Your Table Number</label>
                  <div className="flex space-x-2.5">
                    {[1, 2, 3, 5, 8].map((tbl) => (
                      <button key={tbl} className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase border transition-all ${
                        tbl === 3 
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-sm' 
                          : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-350' : 'bg-gray-50 border-gray-100 text-gray-655'
                      }`}>
                        Table {tbl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Digital Menu Items */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">Famous Dishes & Menu</label>
                  <div className="space-y-3">
                    {selectedFoodItem.menu.map((menuItem, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                        isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-gray-100 shadow-sm'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{menuItem.name.split(' ').pop()}</span>
                          <div>
                            <span className={`text-[11px] font-black block ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {menuItem.name.split(' ').slice(0, -1).join(' ')}
                            </span>
                            <span className="text-[10px] text-gray-450 font-bold block mt-0.5">{menuItem.price}</span>
                          </div>
                        </div>

                        {/* Add to order simulator check */}
                        <div className="flex items-center space-x-2">
                          <span className="text-[8px] font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Famous</span>
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pay-Per-Sale Coin Badge */}
                <div className="flex justify-between items-center bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 rounded-2xl mt-4">
                  <div>
                    <span className="text-[8px] font-black text-yellow-600 uppercase tracking-widest block mb-0.5">Fulfillment coins</span>
                    <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-350' : 'text-gray-655'}`}>Issued by restaurant upon placing order</span>
                  </div>
                  <span className="text-xs font-black text-yellow-500 whitespace-nowrap">🪙 +{selectedFoodItem.coinReward} Coins</span>
                </div>

                {/* Order placement button */}
                <button 
                  disabled={isProcessingOrdering}
                  onClick={() => {
                    setIsProcessingOrdering(true);
                    setTimeout(() => {
                      if (setAdCoins) {
                        setAdCoins(prev => prev + selectedFoodItem.coinReward);
                      }
                      setOrderingSuccessData({ orderId: `FD-${Math.floor(1000 + Math.random() * 9000)}` });
                      setIsProcessingOrdering(false);
                    }, 2000);
                  }}
                  className={`w-full py-4 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-premium active:scale-95 transition-all mt-4 flex justify-center items-center space-x-2 ${
                    isProcessingOrdering ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-amber-500'
                  }`}
                >
                  {isProcessingOrdering ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span>Sending to Kitchen...</span>
                    </>
                  ) : (
                    <span>Place Table Order & Claim Coins</span>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center py-8 space-y-6 animate-fade-in">
                <span className="text-6xl animate-bounce" style={{ animationDuration: '1.8s' }}>🍲</span>
                <div>
                  <h4 className="text-xl font-black font-outfit">Order Sent to Kitchen!</h4>
                  <p className="text-xs text-gray-500 mt-1">Confirmed at {selectedFoodItem.restaurantName} • Table #3</p>
                </div>

                {/* Coin payout notification card */}
                <div className="w-full p-5 bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-transparent border border-yellow-500/30 rounded-3xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl pointer-events-none"></div>
                  <span className="text-3xl block mb-2">🪙</span>
                  <h5 className="text-sm font-black text-yellow-500 font-outfit">+{selectedFoodItem.coinReward} Coins Deposited!</h5>
                  <p className={`text-[10px] leading-relaxed font-medium mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    Thank you for using Earthgram! The restaurant has successfully verified your dine-in table presence. Your reward has been credited to your active wallet balance.
                  </p>
                </div>

                {/* Action button */}
                <button 
                  onClick={() => { setShowOrderingModal(false); setOrderingSuccessData(null); }}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-premium active:scale-95 transition-all"
                >
                  Awesome, Thank You!
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====== UNIFIED DINE-IN RESTAURANT DETAIL MODAL ====== */}
      {showRestaurantSheet && selectedRestaurant && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-[500px] max-h-[85vh] rounded-t-[3rem] flex flex-col overflow-hidden shadow-premium-2xl animate-slide-up border-t ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'
          }`}>
            
            {/* Header Area */}
            <div className="p-6 pb-2 flex justify-between items-start shrink-0">
              <div className="flex items-center space-x-3.5 pr-2">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border shrink-0 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-indigo-50 border-indigo-100'
                }`}>
                  {selectedRestaurant.emoji}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{selectedRestaurant.cuisine}</span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight leading-tight font-outfit">{selectedRestaurant.name}</h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-[10px] text-gray-400 font-medium">📍 {selectedRestaurant.distance} away</span>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center space-x-0.5">
                      <span className="text-yellow-500 text-[10px]">★</span>
                      <span className="text-[10px] font-black">{selectedRestaurant.rating}</span>
                      <span className="text-[9px] text-gray-450 font-bold">({selectedRestaurant.reviews})</span>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => { setShowRestaurantSheet(false); setRestBookingSuccess(null); setRestOrderSuccess(null); }}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-bold hover:scale-105 active:scale-95 transition-all shrink-0"
              >✕</button>
            </div>

            {/* Restaurant Bio Section */}
            <div className="px-6 pb-4 shrink-0">
              <p className={`text-[10px] leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                {selectedRestaurant.bio}
              </p>
            </div>

            {/* Navigation Tabs (Only if not in success screens) */}
            {!restBookingSuccess && !restOrderSuccess && (
              <div className="px-6 pb-2 flex space-x-2 border-b dark:border-slate-800 shrink-0">
                <button
                  onClick={() => setRestaurantTab('reserve')}
                  className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 border ${
                    restaurantTab === 'reserve'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-sm'
                      : isDarkMode ? 'bg-slate-850 border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-gray-50 border-gray-150 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <span>🪑</span>
                  <span>Reserve Table</span>
                </button>
                <button
                  onClick={() => setRestaurantTab('menu')}
                  className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 border ${
                    restaurantTab === 'menu'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-sm'
                      : isDarkMode ? 'bg-slate-850 border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-gray-50 border-gray-150 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <span>🍽️</span>
                  <span>Dine-In Menu</span>
                </button>
              </div>
            )}

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
              
              {/* SUCCESS STATE A: TABLE BOOKED */}
              {restBookingSuccess ? (
                <div className="flex flex-col items-center text-center py-4 space-y-5 animate-fade-in">
                  <span className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>🎉</span>
                  <div>
                    <h4 className="text-xl font-black font-outfit">Table Reserved Successfully!</h4>
                    <p className="text-xs text-gray-505 mt-1">Confirmed at {selectedRestaurant.name} • {selectedTable}</p>
                  </div>

                  <div className={`w-full p-5 rounded-3xl border border-dashed relative ${
                    isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex justify-between items-center text-left border-b pb-3 mb-3 border-dashed border-gray-700">
                      <div>
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block leading-none mb-1">Reservation Code</span>
                        <span className="text-base font-black text-orange-500 tracking-wider font-outfit">{restBookingSuccess.code}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block leading-none mb-1">Reserved Table</span>
                        <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedTable}</span>
                      </div>
                    </div>

                    <div className="text-left space-y-2 text-[10px] leading-relaxed font-medium">
                      <p className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>
                        Show this digital ticket to the restaurant host on arrival. Once seated, simply scan the table QR code to claim your coin rewards!
                      </p>
                      <div className="flex justify-between items-center bg-yellow-500/10 border border-yellow-500/20 px-3 py-2.5 rounded-xl mt-2">
                        <span className="text-[9px] font-black text-yellow-600 uppercase tracking-widest">Dine-In Coin Reward</span>
                        <span className="text-xs font-black text-yellow-500">🪙 +{selectedRestaurant.coinReward} Coins</span>
                      </div>
                    </div>
                  </div>

                  {/* Simulate Table QR Scanning */}
                  <div className="w-full pt-4 space-y-3">
                    <div className="flex items-center space-x-2 justify-center mb-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Simulating Dining Room Arrival</span>
                    </div>
                    <button 
                      onClick={() => {
                        if (setAdCoins) {
                          setAdCoins(prev => prev + selectedRestaurant.coinReward);
                        }
                        alert(`🎉 Table Check-in Verified! You arrived at ${selectedRestaurant.name} and scanned the QR on ${selectedTable}. +${selectedRestaurant.coinReward} Coins added to your Wallet balance!`);
                        setShowRestaurantSheet(false);
                        setRestBookingSuccess(null);
                      }}
                      className="w-full py-4 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-premium active:scale-95 transition-all flex items-center justify-center space-x-2"
                    >
                      <span>📱 Arrive & Scan QR at Table</span>
                    </button>
                    <button 
                      onClick={() => { setShowRestaurantSheet(false); setRestBookingSuccess(null); }}
                      className={`w-full py-3 text-xs font-black uppercase tracking-widest rounded-2xl border transition-all ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-700' : 'bg-gray-150 border-gray-200 text-gray-650 hover:bg-gray-205'
                      }`}
                    >
                      Go to Restaurant Later
                    </button>
                  </div>
                </div>
              ) : restOrderSuccess ? (
                /* SUCCESS STATE B: FOOD ORDERED AT TABLE */
                <div className="flex flex-col items-center text-center py-4 space-y-6 animate-fade-in">
                  <span className="text-6xl animate-bounce" style={{ animationDuration: '1.8s' }}>🍲</span>
                  <div>
                    <h4 className="text-xl font-black font-outfit">Order Placed Successfully!</h4>
                    <p className="text-xs text-gray-500 mt-1">Confirmed at {selectedRestaurant.name} • {selectedTable}</p>
                  </div>

                  <div className="w-full p-5 bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-transparent border border-yellow-500/30 rounded-3xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl pointer-events-none"></div>
                    <span className="text-3xl block mb-2">🪙</span>
                    <h5 className="text-sm font-black text-yellow-500 font-outfit">+{selectedRestaurant.coinReward} Coins Deposited!</h5>
                    <p className={`text-[10px] leading-relaxed font-medium mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      Excellent! The kitchen is preparing your dine-in table order. Your golden +{selectedRestaurant.coinReward} coins have been successfully authorized by the merchant and deposited into your active Earthgram Wallet!
                    </p>
                  </div>

                  <button 
                    onClick={() => { setShowRestaurantSheet(false); setRestOrderSuccess(null); setRestaurantCart({}); }}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-premium active:scale-95 transition-all"
                  >
                    Awesome, Thank You!
                  </button>
                </div>
              ) : restaurantTab === 'reserve' ? (
                /* TAB 1 CONTENT: RESERVE TABLE */
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Visual Table Layout Map */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">Select a Table Layout</label>
                    <div className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800/80' : 'bg-gray-50/50 border-gray-150'}`}>
                      
                      {/* Visual Grid representing Dining Room */}
                      <div className="grid grid-cols-3 gap-4 justify-items-center py-2 relative">
                        
                        {/* Interactive Table Pins */}
                        {[
                          { id: 'Table 1', type: '2 Seats', booked: false, position: 'Standard' },
                          { id: 'Table 2', type: '4 Seats', booked: true, position: 'Booth' },
                          { id: 'Table 3', type: '2 Seats', booked: false, position: 'Window' },
                          { id: 'Table 5', type: '6 Seats', booked: false, position: 'Family' },
                          { id: 'Table 8', type: '2 Seats', booked: false, position: 'VIP Lounge' }
                        ].map((tbl) => {
                          const isSelected = selectedTable === tbl.id;
                          return (
                            <button
                              key={tbl.id}
                              disabled={tbl.booked}
                              onClick={() => setSelectedTable(tbl.id)}
                              className={`w-20 h-20 rounded-2xl border flex flex-col items-center justify-center p-2 transition-all relative ${
                                tbl.booked
                                  ? 'bg-gray-100 dark:bg-slate-850 border-transparent text-gray-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                                  : isSelected
                                    ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white border-transparent ring-4 ring-orange-500/20 scale-105 shadow-md shadow-orange-500/20'
                                    : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <span className="text-xl mb-0.5">{tbl.booked ? '🔒' : isSelected ? '👑' : '🪑'}</span>
                              <span className="text-[9px] font-black leading-none">{tbl.id}</span>
                              <span className={`text-[7px] font-bold mt-1 opacity-70`}>{tbl.booked ? 'Occupied' : tbl.position}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Map Legends */}
                      <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest mt-4 pt-3 border-t dark:border-slate-800 text-gray-400">
                        <div className="flex items-center space-x-1">
                          <span className="w-2.5 h-2.5 rounded-md bg-orange-500"></span>
                          <span>Selected</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="w-2.5 h-2.5 rounded-md bg-gray-200 dark:bg-slate-800"></span>
                          <span>Occupied</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="w-2.5 h-2.5 rounded-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"></span>
                          <span>Available</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date & Time Selectors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Select Date</label>
                      <div className="flex space-x-1.5">
                        {['Today', 'Tomorrow'].map((d) => (
                          <button
                            key={d}
                            onClick={() => setRestBookingDate(d)}
                            className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                              restBookingDate === d
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                                : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-350' : 'bg-gray-50 border-gray-150 text-gray-605'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Select Time</label>
                      <div className="flex space-x-1.5">
                        {['7:00 PM', '8:30 PM'].map((t) => (
                          <button
                            key={t}
                            onClick={() => setRestBookingTime(t)}
                            className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                              restBookingTime === t
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                                : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-350' : 'bg-gray-50 border-gray-150 text-gray-605'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Number of Guests */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Number of Guests</label>
                    <div className="flex space-x-2">
                      {['1 Guest', '2 Guests', '4 Guests', '6+ Guests'].map((g) => (
                        <button 
                          key={g}
                          onClick={() => setRestBookingGuests(g)}
                          className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${
                            restBookingGuests === g
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent'
                              : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-600'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Info Tip */}
                  <div className={`p-4 rounded-2xl border flex items-start space-x-2.5 text-[9px] font-medium leading-relaxed ${
                    isDarkMode ? 'bg-slate-850 border-slate-800 text-slate-400' : 'bg-gray-50/50 border-gray-100 text-gray-500'
                  }`}>
                    <span className="text-xs">💡</span>
                    <span>
                      Table reservations are held for 15 minutes max. Scan the QR code located directly on {selectedTable} at {selectedRestaurant.name} to release your coin reward.
                    </span>
                  </div>

                  {/* Booking CTA Button */}
                  <button
                    disabled={isProcessingRestBooking}
                    onClick={() => {
                      setIsProcessingRestBooking(true);
                      setTimeout(() => {
                        setIsProcessingRestBooking(false);
                        setRestBookingSuccess({ code: `RES-${Math.floor(1000 + Math.random() * 9000)}` });
                      }, 1200);
                    }}
                    className={`w-full py-4 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-premium active:scale-95 transition-all flex justify-center items-center space-x-2 ${
                      isProcessingRestBooking ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-amber-500'
                    }`}
                  >
                    {isProcessingRestBooking ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>Processing Reservation...</span>
                      </>
                    ) : (
                      <span>Reserve {selectedTable} Instantly</span>
                    )}
                  </button>
                </div>
              ) : (
                /* TAB 2 CONTENT: DINE-IN MENU & DIGITAL CART ORDERING */
                <div className="space-y-5 animate-fade-in">
                  
                  <div className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800/80' : 'bg-gray-50/50 border-gray-150'}`}>
                    <span className="text-[8px] font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Active Table Check-In</span>
                    <p className={`text-[10px] font-medium leading-relaxed mt-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      Dining at restaurant? Place an order directly from your smartphone to Table 3 using Earthgram to unlock immediate coin payouts.
                    </p>
                  </div>

                  {/* Digital Menu Dishes List */}
                  <div className="space-y-3.5">
                    {selectedRestaurant.menu.map((dish, idx) => {
                      const cartQty = restaurantCart[dish.name] || 0;
                      return (
                        <div key={idx} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                          isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-gray-100 shadow-sm'
                        }`}>
                          <div className="flex items-center space-x-3.5 pr-2 flex-1">
                            <div className="text-2xl w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-900 border flex items-center justify-center shrink-0">
                              {dish.name.split(' ').pop()}
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-[11px] font-black leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {dish.name.split(' ').slice(0, -1).join(' ')}
                              </span>
                              <span className={`text-[8px] leading-relaxed mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                                {dish.description || 'Special signature neighborhood recipe.'}
                              </span>
                              <span className="text-[10px] font-black text-indigo-500 mt-1">{dish.price}</span>
                            </div>
                          </div>

                          {/* Circular Counter Widget */}
                          <div className="flex items-center space-x-3 border dark:border-slate-700 rounded-xl p-1 shrink-0">
                            <button
                              onClick={() => {
                                if (cartQty > 0) {
                                  setRestaurantCart(prev => ({ ...prev, [dish.name]: cartQty - 1 }));
                                }
                              }}
                              className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center active:scale-90 transition-all ${
                                cartQty > 0 
                                  ? 'bg-indigo-600 text-white border-transparent' 
                                  : isDarkMode ? 'bg-slate-800 text-slate-500 border-transparent' : 'bg-gray-100 text-gray-400 border-transparent'
                              }`}
                            >
                              -
                            </button>
                            <span className="text-[11px] font-black w-3 text-center">{cartQty}</span>
                            <button
                              onClick={() => {
                                setRestaurantCart(prev => ({ ...prev, [dish.name]: cartQty + 1 }));
                              }}
                              className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center active:scale-95 transition-all"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Coin Sponsor Bonus Note */}
                  <div className="flex justify-between items-center bg-yellow-500/10 border border-yellow-500/20 px-4 py-3.5 rounded-2xl mt-4">
                    <div>
                      <span className="text-[8px] font-black text-yellow-600 uppercase tracking-widest block mb-0.5">Sponsor Coins Payout</span>
                      <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-350' : 'text-gray-600'}`}>Credited instantly to your Earthgram Wallet</span>
                    </div>
                    <span className="text-xs font-black text-yellow-500 whitespace-nowrap">🪙 +{selectedRestaurant.coinReward} Coins</span>
                  </div>

                  {/* Cart Active Checkout Bar */}
                  {(() => {
                    const totalQty = Object.values(restaurantCart).reduce((a, b) => a + b, 0);
                    if (totalQty === 0) return null;

                    const totalCost = selectedRestaurant.menu.reduce((sum, dish) => {
                      const qty = restaurantCart[dish.name] || 0;
                      const numericPrice = parseInt(dish.price.replace(/[^\d]/g, '')) || 0;
                      return sum + (numericPrice * qty);
                    }, 0);

                    return (
                      <div className={`p-4 rounded-3xl border flex flex-col space-y-3 animate-fade-in ${
                        isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-gray-50 border-gray-150 shadow-inner'
                      }`}>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                          <span className="text-gray-400">{totalQty} items selected</span>
                          <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Subtotal: ₹{totalCost}</span>
                        </div>
                        <button
                          disabled={isProcessingRestOrder}
                          onClick={() => {
                            setIsProcessingRestOrder(true);
                            setTimeout(() => {
                              setIsProcessingRestOrder(false);
                              if (setAdCoins) {
                                setAdCoins(prev => prev + selectedRestaurant.coinReward);
                              }
                              setRestOrderSuccess(true);
                            }, 1800);
                          }}
                          className="w-full py-4 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-premium bg-gradient-to-r from-orange-500 to-amber-500 active:scale-95 transition-all flex justify-center items-center space-x-2"
                        >
                          {isProcessingRestOrder ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                              <span>Placing Table Order...</span>
                            </>
                          ) : (
                            <span>Place Table Order & Claim 🪙 +{selectedRestaurant.coinReward} Coins</span>
                          )}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
