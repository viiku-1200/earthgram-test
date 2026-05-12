import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Wrench, Sparkles, Users, GraduationCap, PartyPopper, 
  Briefcase, Leaf, ShoppingBag, Tractor, Truck, Mountain, 
  ChevronRight, Search, Bell, MapPin, Menu, Star, Play
} from 'lucide-react';
import { CATEGORIES, PROVIDERS, NATIONAL_PROVIDERS, GLOBAL_PROVIDERS, TOP_EXPERTS, HERO_BANNERS, COUNTRIES, SCOPES } from '../../data/constants';
import ScopeMap from '../maps/ScopeMap';

const LucideIcon = ({ name, className, size = 24 }) => {
  const IconMap = {
    Zap, Wrench, Sparkles, Users, GraduationCap, PartyPopper, 
    Briefcase, Leaf, ShoppingBag, Tractor, Truck, Mountain, Star
  };
  const Icon = IconMap[name] || Zap;
  return <Icon className={className} size={size} strokeWidth={2.5} />;
};

const HomeScreen = ({ isDarkMode, setIsDarkMode, activeScope, setActiveScope, selectedCountry, setSelectedCountry }) => {
  const navigate = useNavigate();
  const [activeBanner, setActiveBanner] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [locationMode, setLocationMode] = useState('default'); 
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [hasUnreadActivity, setHasUnreadActivity] = useState(true);
  const [activeEmpowerBanner, setActiveEmpowerBanner] = useState(0);
  const empowerScrollRef = React.useRef(null);

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
    const timer = setInterval(() => setActiveBanner(b => (b + 1) % filteredBanners.length), 4000);
    return () => clearInterval(timer);
  }, [filteredBanners.length]);

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
    const providers = currentCategory.providers || [];
    if (!selectedSubCategory || selectedSubCategory === '__ALL__') return providers;
    return providers.filter(p => p.sub === selectedSubCategory);
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
  if (selectedCategory && selectedSubCategory) {
    const cat = currentCategory;
    const filteredProviders = getFilteredProviders();
    return (
      <div className={`h-full flex flex-col pt-8 pb-20 overflow-y-auto hide-scrollbar transition-all duration-500 ${
        isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        {/* Header */}
        <div className={`px-5 pt-2 pb-4 flex items-center space-x-4 transition-all duration-300 ${
          isDarkMode ? 'bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800' : 'glass'
        }`}>
          <button onClick={() => setSelectedSubCategory(null)}
            className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform text-sm font-bold ${
              isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'
            }`}>←</button>
          <div className="flex items-center space-x-2">
            <h1 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {selectedSubCategory === '__ALL__' ? 'All Providers' : selectedSubCategory}
            </h1>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
              isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
            }`}>{cat.name}</span>
          </div>
        </div>

        {/* Results count */}
        <div className="px-5 mt-4 mb-2">
          <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            {filteredProviders.length} Virtual {filteredProviders.length === 1 ? 'Company' : 'Companies'} found
          </p>
        </div>

        {/* Provider Cards */}
        <div className="px-5 space-y-3">
          {/* NEW: Instant Match Banner for Sub-category */}
          <div className={`mb-5 p-5 rounded-[2rem] border-2 relative overflow-hidden group active:scale-[0.98] transition-all ${
            isDarkMode ? 'bg-slate-900 border-indigo-500/30 shadow-indigo-500/10 shadow-lg' : 'bg-white border-indigo-100 shadow-premium'
          }`}
          onClick={() => navigate('/book', { state: { category: cat, subCategory: selectedSubCategory, mode: 'instant' } })}>
            <div className="absolute top-0 right-0 p-4 opacity-10 scale-150">⚡</div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white text-xl shadow-glow-indigo">⚡</div>
              <div>
                <h3 className="font-black text-sm">Instant Match</h3>
                <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Find best {selectedSubCategory} expert</p>
              </div>
            </div>
            <p className={`text-[10px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Too many options? We'll match you with the highest-rated <span className="font-bold text-indigo-500">{selectedSubCategory}</span> company instantly.
            </p>
          </div>

          <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 px-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Browse {selectedSubCategory} companies</h2>

          {filteredProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 animate-fade-in">
              <span className="text-5xl mb-4">🔍</span>
              <p className="text-base font-bold">No providers yet</p>
              <p className="text-xs mt-1">Be the first to register in this category!</p>
              <button onClick={() => navigate('/register')}
                className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-transform shadow-glow-indigo">
                Start Your Virtual Company
              </button>
            </div>
          ) : (
            filteredProviders.map((provider, i) => (
              <div key={provider.id}
                onClick={() => navigate('/provider', { state: { profile: provider } })}
                className={`p-4 rounded-2xl shadow-premium border cursor-pointer card-lift animate-fade-in gradient-border ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-100/50'
                }`}
                style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                <div className="flex justify-between items-start mb-2 pl-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-11 h-11 bg-gradient-to-br ${cat.color} rounded-xl flex items-center justify-center text-xl shadow-sm`}>
                      {cat.icon}
                    </div>
                    <div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mb-0.5 ${
                        isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                      }`}>{provider.tag}</span>
                      <h3 className={`text-sm font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>{provider.name}</h3>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-600'
                    }`}>📍 {provider.distance}</span>
                    {provider.available && <span className="flex items-center space-x-1 mt-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full online-dot"></span><span className="text-[8px] font-bold text-green-600">Online</span></span>}
                  </div>
                </div>
                <div className="flex items-center text-sm mb-3 pl-2">
                  <span className="text-yellow-500 mr-1">⭐</span>
                  <span className={`font-bold mr-1 ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>{provider.rating}</span>
                  <span className="text-slate-500">({provider.reviews})</span>
                  <span className={`mx-2 ${isDarkMode ? 'text-slate-800' : 'text-gray-200'}`}>•</span>
                  <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Used by neighbors recently</span>
                </div>
                <div className={`flex justify-between items-center border-t pt-3 pl-2 ${
                  isDarkMode ? 'border-slate-800' : 'border-gray-50'
                }`}>
                  <span className={`font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{provider.price}</span>
                  <button onClick={(e) => { e.stopPropagation(); navigate('/provider', { state: { profile: provider } }); }}
                    className={`px-5 py-2 rounded-xl font-bold text-xs active:scale-95 transition-transform shadow-sm ${
                      isDarkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-gradient-to-r from-gray-900 to-gray-700 text-white'
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
  if (selectedCategory) {
    const cat = currentCategory;
    return (
      <div className={`h-full flex flex-col pt-8 pb-20 overflow-y-auto hide-scrollbar transition-all duration-500 ${
        isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        {/* Header */}
        <div className={`px-5 pt-2 pb-4 flex items-center space-x-4 transition-all duration-300 ${
          isDarkMode ? 'bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800' : 'glass'
        }`}>
          <button onClick={() => { setSelectedCategory(null); setSelectedSubCategory(null); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform text-sm font-bold ${
              isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'
            }`}>←</button>
          <h1 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cat.name}</h1>
          {cat.badge && <span className="text-[9px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{cat.badge}</span>}
          {cat.comingSoon && <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Coming Soon</span>}
        </div>

        {/* ItzRunner Special View */}
        {cat.label === 'Chotu' && cat.services ? (
          <div className="px-5 mt-6 space-y-4 animate-fade-in">
            <div className="text-center mb-4">
              <span className="text-5xl block mb-2">🏃</span>
              <h2 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>ItzRunner <span className="text-orange-500">(Chotu)</span></h2>
              <p className="text-xs text-gray-500">Your local delivery & task buddy</p>
            </div>
            {cat.services.map((service, i) => (
              <div key={service.id} className={`p-5 rounded-2xl shadow-premium border flex items-center space-x-4 card-lift animate-fade-in ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100/50'
              }`}
                style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-50 rounded-2xl flex items-center justify-center text-3xl">{service.icon}</div>
                <div className="flex-1">
                  <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{service.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{service.desc}</p>
                  <span className="text-xs font-bold text-orange-600 mt-1 inline-block">{service.price}</span>
                </div>
                <button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform shadow-sm">Go</button>
              </div>
            ))}
          </div>
        ) : cat.comingSoon ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-fade-in">
            <span className="text-5xl mb-4">🔒</span>
            <p className="text-lg font-bold">Coming Soon</p>
            <p className="text-xs">Business services launching next update</p>
          </div>
        ) : (
          /* Sub-Category Icon Grid — 3 columns like ItzQuk */
          <div className="px-5 mt-6 animate-fade-in">
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Choose a service type</h2>
            <div className="grid grid-cols-3 gap-4">
              {cat.subTabs && cat.subTabs.length > 0 ? (
                cat.subTabs.filter(tab => tab.name !== 'All').map((tab, i) => {
                  const providerCount = (cat.providers || []).filter(p => p.sub === tab.name).length;
                  return (
                    <button key={tab.name}
                      onClick={() => setSelectedSubCategory(tab.name)}
                      className="flex flex-col items-center active:scale-90 transition-all duration-200 group animate-fade-in"
                      style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                      <div className={`w-[72px] h-[72px] ${tab.bg || 'bg-indigo-50'} rounded-2xl flex items-center justify-center text-3xl shadow-premium border border-white/80 group-hover:shadow-premium-lg transition-shadow`}>
                        {tab.icon}
                      </div>
                      <span className={`text-[11px] font-bold mt-2 text-center leading-tight ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>{tab.name}</span>
                      {providerCount > 0 && (
                        <span className="text-[9px] font-medium text-gray-400 mt-0.5">{providerCount} {providerCount === 1 ? 'company' : 'companies'}</span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="col-span-3 py-10 text-center text-gray-400">
                  <p className="text-xs font-bold">No sub-categories available</p>
                </div>
              )}
            </div>

            {/* "View All" button at the bottom */}
            <button
              onClick={() => setSelectedSubCategory(null) || setSelectedSubCategory('__ALL__')}
              className={`w-full mt-6 py-3 rounded-2xl text-sm font-bold active:scale-[0.98] transition-transform flex items-center justify-center space-x-2 shadow-premium border ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-gray-700'
              }`}>
              <span>📋</span>
              <span>View All {cat.name} Providers</span>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ============== MAIN HOMEPAGE ==============
  const currentScopeId = getScopeId();
  const scopeProviders = getScopeProviders();

  return (
    <div className={`h-full flex flex-col pb-20 overflow-y-auto hide-scrollbar transition-all duration-500 ${
      isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gradient-to-b from-white to-gray-50/80 text-gray-900'
    }`}>
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
          <button onClick={() => navigate('/wallet')}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg relative active:scale-90 transition-all ${
            isDarkMode ? 'bg-slate-800 text-slate-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-gray-100/80 text-gray-900'
          }`}>
            <span className="relative z-10">💎</span>
            <div className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600 border border-white shadow-sm"></span>
            </div>
          </button>
          
          <button onClick={() => navigate('/search')} className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg active:scale-90 transition-all ${
            isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100/80 text-gray-900'
          }`}>
            🔍
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
        // Extract the first part of the address (e.g., "Gaur City" from "Gaur City, Noida")
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
                  { icon: isGC ? '🏥' : '🌾', label: isGC ? 'Health' : 'Mandi', text: isGC ? 'Dr. Rajesh: Same-day KFT/CBC tests available in GC-2' : 'Wheat ₹2,125 (+1.2%)', color: isDarkMode ? 'text-emerald-400' : 'text-emerald-700' },
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
      <div className="px-5 mt-6 relative">
        <div className={`flex rounded-2xl p-1.5 relative z-40 shadow-inner-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100/80'}`}>
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
              <div className={`absolute top-[120%] left-0 mt-2 w-48 rounded-3xl shadow-premium-2xl border overflow-hidden animate-slide-up z-50 ${
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


      {/* Hero Banner Carousel */}
      <div className="px-5 mt-5">
        <div className="relative overflow-hidden rounded-2xl">
          {filteredBanners.map((banner, i) => (
            <div key={banner.id}
              className={`bg-gradient-to-r ${banner.gradient} rounded-2xl p-5 text-white relative overflow-hidden ${i === activeBanner ? 'block animate-crossfade' : 'hidden'}`}>
              <span className="text-[9px] font-bold bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider">{banner.badge}</span>
              <h3 className="text-lg font-extrabold mt-2 leading-tight">{banner.title}</h3>
              <h3 className="text-2xl font-black leading-tight text-yellow-300">{banner.highlight}</h3>
              <p className="text-[11px] opacity-90 mt-1">{banner.desc}</p>
              <button onClick={banner.id === 'virtual' ? () => navigate('/register') : undefined}
                className="text-xs font-bold bg-white text-gray-900 px-4 py-2 rounded-xl mt-3 inline-block active:scale-95 transition-transform shadow-md hover:shadow-lg">
                {banner.cta}
              </button>
              <div className="absolute top-4 right-4 text-5xl opacity-10 animate-float">{banner.icon}</div>
            </div>
          ))}
          {/* Dots */}
          <div className="flex justify-center space-x-1.5 mt-3">
            {filteredBanners.map((_, i) => (
              <button key={i} onClick={() => setActiveBanner(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeBanner ? 'w-6 bg-indigo-600' : 'w-1.5 bg-gray-300'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Home & Personal Services - Premium Grid Style */}
      <div className="mt-8">
        <h2 className={`px-5 text-lg font-extrabold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {isDarkMode ? 'Lifestyle & Professional Services' : 'Home & Personal Services'}
        </h2>
        
        {/* NEW: Premium Match Showcase Row */}
        <div className="px-5 mb-6">
          <div className={`p-4 rounded-[2rem] border-2 flex items-center justify-between relative overflow-hidden ${
            isDarkMode ? 'bg-slate-900 border-indigo-500/20 shadow-indigo-500/10' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-white shadow-premium'
          }`}>
             <div className="relative z-10">
               <h3 className="text-sm font-black tracking-tight">Elite Instant Match ⚡</h3>
               <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">Premium Technology</p>
               <p className={`text-[10px] mt-1 max-w-[180px] ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Skip the browsing. Match with the top 1% experts in seconds.</p>
             </div>
             <div className="w-16 h-16 bg-white rounded-2xl shadow-premium flex flex-col items-center justify-center animate-bounce-slow">
               <span className="text-2xl">🤝</span>
               <span className="text-[8px] font-black text-indigo-600">MATCHED</span>
             </div>
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* GAUR CITY TRUSTED EXPERT SECTION — DYNAMIC VISIBILITY */}
        {(() => {
          const savedAddr = localStorage.getItem('earthgram_user_address') || '';
          const isGC = savedAddr.toLowerCase().includes('gaur city') || savedAddr.toLowerCase().includes('gc');
          
          if (!isGC) return null;

          return (
            <div className="px-5 mb-8 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>GC-2 Trusted Experts</h2>
                <span className="text-[8px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded-full">SOCIETY FAVORITES</span>
              </div>
              <div className={`p-4 rounded-[2.5rem] border-2 relative overflow-hidden flex items-center space-x-4 ${
                isDarkMode ? 'bg-slate-900/80 border-indigo-500/20' : 'bg-white border-indigo-100 shadow-premium'
              }`}>
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">👨‍⚕️</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-1.5">
                    <h3 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dr. Rajesh Kumar</h3>
                    <span className="text-[8px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-black">TOP BOSS</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold">KFT, CBC & General Physician</p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-[9px] text-yellow-500 font-black">⭐ 4.9</span>
                    <span className="text-[9px] text-gray-400 font-bold">• 128 Reviews in GC</span>
                  </div>
                </div>
                <button onClick={() => navigate('/provider')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-glow-indigo active:scale-95 transition-transform">BOOK</button>
              </div>
            </div>
          );
        })()}

        <div className="px-5 grid grid-cols-4 gap-3">
          {CATEGORIES.filter(c => {
            if (selectedCountry !== 'in' && c.id === '1') return false;
            return !['7', '10', '11', '12', '13', '14', '15', '19', '20'].includes(c.id) && 
                   (!c.visibility || c.visibility.includes(locationMode)) && 
                   (!c.countries || c.countries.includes(selectedCountry));
          }).map((cat, i) => (
            <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory(null); }}
              className={`relative overflow-hidden aspect-square rounded-[1.5rem] flex flex-col items-center justify-center text-center active:scale-95 transition-all duration-300 shadow-premium-sm group animate-fade-in border border-white/20 bg-gradient-to-br ${cat.color}`}
              style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
              
              <div className="w-8 h-8 bg-white/25 backdrop-blur-md rounded-xl flex items-center justify-center mb-1.5 shadow-inner border border-white/30 group-hover:scale-110 transition-transform">
                <span className="text-base">{cat.icon}</span>
              </div>
              
              <span className="text-[8px] font-black text-white leading-tight uppercase tracking-widest px-1">{cat.name}</span>
              
              {/* Subtle Overlay Shine */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Community Tool Rental - ONLY for India Village */}
      {selectedCountry === 'in' && locationMode === 'village' && (
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
                style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
                
                <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-2 shadow-inner border border-white/10">
                  <span className="text-xl">{tab.icon}</span>
                </div>
                
                <span className="text-[10px] font-black text-white leading-tight uppercase tracking-widest">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empower Banners Automatic Motion Slider (No Manual Scrolling) */}
      {selectedCountry === 'in' && (
        <div className="mt-8 px-5 relative">
          <div className="relative h-44 w-full overflow-hidden rounded-[2.5rem] shadow-premium-lg border border-white/5">
            {/* Card 1: Start (Active when index is 0) */}
            <div className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
              activeEmpowerBanner === 0 ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
            }`}>
              <div className="h-full w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-6 flex items-center justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                
                {/* Left Side: Content */}
                <div className="flex-1 pr-4 relative z-10">
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1 block">Empower Your Skill</span>
                  <h2 className="text-xl font-black text-white leading-tight">Start Your Own<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">Virtual Company</span></h2>
                  <p className="text-[10px] text-gray-300 mt-2 leading-relaxed opacity-90">Turn your skills into a global startup. Zero setup cost.</p>
                  <button onClick={() => navigate('/register')} className="mt-4 bg-white text-indigo-900 px-5 py-2.5 rounded-xl text-[10px] font-black active:scale-95 transition-transform shadow-lg flex items-center space-x-2">
                    <span>Start Now</span>
                    <span>→</span>
                  </button>
                </div>
                
                {/* Right Side: Icon */}
                <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center relative z-10">
                  <div className="absolute inset-0 bg-white/5 rounded-full blur-xl"></div>
                  <span className="text-7xl drop-shadow-2xl animate-float">🚀</span>
                </div>
              </div>
            </div>

            {/* Card 2: Grow (Active when index is 1) */}
            <div className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
              activeEmpowerBanner === 1 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
              <div className="h-full w-full bg-gradient-to-br from-emerald-900 via-teal-900 to-black p-6 flex items-center justify-between">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
                
                {/* Left Side: Content */}
                <div className="flex-1 pr-4 relative z-10">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Growth & Scale</span>
                  </div>
                  <h2 className="text-xl font-black text-white leading-tight">Go Global.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-400">Scale High.</span></h2>
                  <p className="text-[10px] text-gray-300 mt-2 leading-relaxed opacity-90">We help grow and internationalize your virtual company.</p>
                  <button onClick={() => navigate('/register')} className="mt-4 bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black active:scale-95 transition-transform shadow-lg flex items-center space-x-2">
                    <span>Growth Hub</span>
                    <span>✨</span>
                  </button>
                </div>
                
                {/* Right Side: Icon */}
                <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center relative z-10">
                  <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl"></div>
                  <span className="text-7xl drop-shadow-2xl animate-pulse" style={{ animationDuration: '5s' }}>🌎</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Indicators (Dots) */}
          <div className="flex justify-center space-x-1.5 mt-3">
            <div className={`transition-all duration-500 rounded-full h-1 ${activeEmpowerBanner === 0 ? 'w-6 bg-indigo-500' : 'w-2 bg-gray-300'}`}></div>
            <div className={`transition-all duration-500 rounded-full h-1 ${activeEmpowerBanner === 1 ? 'w-6 bg-emerald-500' : 'w-2 bg-gray-300'}`}></div>
          </div>
        </div>
      )}

      {/* Scope-based Providers (Services Around You) */}
      <div className="mt-8 pb-4">
        <div className="px-5 flex justify-between items-center mb-4">
          <h2 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {currentScopeId === 'local' ? 'Services Around You' : currentScopeId === 'national' ? 'Top National Services' : 'Global Services'}
          </h2>
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full online-dot"></span>
            <span>{currentScopeId === 'local' ? 'AVAILABLE NOW' : currentScopeId === 'national' ? 'PAN INDIA' : 'WORLDWIDE'}</span>
          </span>
        </div>

        {/* Provider Cards (Horizontal Scroll) — Luxury Digital Style */}
        <div className="flex overflow-x-auto px-5 space-x-5 hide-scrollbar pb-6">
          {scopeProviders.map((provider, i) => (
            <div key={provider.id} onClick={() => navigate('/provider', { state: { profile: provider } })}
              className="flex-shrink-0 w-80 bg-white p-5 rounded-[32px] shadow-premium-lg border border-gray-100/30 cursor-pointer card-lift animate-fade-in flex flex-col group relative overflow-hidden"
              style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
              
              {/* Top Section: Avatar & Info */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner border transition-all duration-500 group-hover:rotate-6 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-indigo-50 border-indigo-100'
                  }`}>
                    {provider.avatar}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{provider.tag}</span>
                    </div>
                    <h3 className="text-base font-black text-gray-900 leading-none">{provider.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">{provider.category}</p>
                  </div>
                </div>
                <div className="bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-600 whitespace-nowrap">📍 {provider.distance}</span>
                </div>
              </div>

              {/* Middle Section: Stats */}
              <div className="flex items-center justify-between mb-5 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                <div className="flex items-center space-x-1">
                  <span className="text-amber-500 text-xs">★</span>
                  <span className="text-xs font-black text-gray-900">{provider.rating}</span>
                  <span className="text-[10px] font-bold text-gray-400">({provider.reviews})</span>
                </div>
                <div className="h-4 w-[1px] bg-gray-200"></div>
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">
                    {currentScopeId === 'local' ? 'Neighbor Rec.' : provider.city}
                  </span>
                </div>
              </div>

              {/* Bottom Section: Price & CTA */}
              <div className="flex justify-between items-center mt-auto">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Starting from</span>
                  <span className="text-lg font-black text-gray-900">{provider.price.replace('₹', currency).replace('₨', currency)}</span>
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
            <div className="w-14 h-14 bg-white rounded-full shadow-premium flex items-center justify-center border border-gray-100 group-hover:bg-black group-hover:text-white transition-all">
              <span className="text-xl">→</span>
            </div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">More</span>
          </div>
        </div>
      </div>

      {/* ====== SCOPE MAP ====== */}
      <div className="px-5 mt-6">
        <ScopeMap scope={currentScopeId} isDarkMode={isDarkMode} />
      </div>

      {/* ====== VIRTUAL COMPANY SECTION - PREMIUM GRID ====== */}
      {selectedCountry === 'in' && (
        <div className="mt-10">
          <div className="px-5 mb-5 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Direct from Farmers & Pros</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Certified Virtual Companies</p>
            </div>
            <button className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest hover:bg-emerald-100 transition-colors">See All</button>
          </div>

          <div className="px-5 grid grid-cols-3 gap-4 mb-10">
            {CATEGORIES.filter(c => ['11', '12', '13', '15', '19', '20'].includes(c.id) && (!c.countries || c.countries.includes(selectedCountry))).map((cat, i) => {
              let bgGradient = 'from-green-600 to-emerald-900';
              if (cat.id === '12') bgGradient = 'from-amber-500 to-orange-800';
              if (cat.id === '13') bgGradient = 'from-blue-600 to-indigo-900';
              if (cat.id === '15') bgGradient = 'from-slate-800 to-black';
              if (cat.id === '19') bgGradient = 'from-amber-800 to-orange-950';
              if (cat.id === '20') bgGradient = 'from-indigo-800 to-blue-950';

            return (
              <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory(null); }}
                className={`relative overflow-hidden aspect-square rounded-2xl flex flex-col items-center justify-center text-center active:scale-95 transition-all duration-300 shadow-sm group animate-fade-in bg-gradient-to-br ${bgGradient}`}
                style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                
                <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-1.5 shadow-inner border border-white/20">
                  <span className="text-lg">{cat.icon}</span>
                </div>
                
                <span className="text-[9px] font-black text-white leading-tight uppercase tracking-wide">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    )}

      {/* ====== LIVE REELS PREVIEW ====== */}
      <div className="mt-6 mb-4">
        <div className="px-5 flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Live Work Reels</h2>
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

      {/* Professional Expertise - Premium Grid */}
      <div className="mt-8">
        <div className="px-5 flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">Professional Expertise</h2>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">Top-tier consultants & specialists</p>
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
                className={`relative overflow-hidden aspect-[2.4] rounded-2xl p-3 flex items-center space-x-3 text-left active:scale-95 transition-all duration-300 shadow-sm group animate-fade-in bg-gradient-to-br ${bgGradient}`}
                style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                
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

      {/* Local Produce & Crafts - Premium Grid */}
      <div className="mt-8 pb-2">
        <div className="px-5 flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-emerald-600">Local Produce & Crafts</h2>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">Fresh from farms & local artisans</p>
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
                  className={`relative overflow-hidden aspect-square rounded-2xl flex flex-col items-center justify-center text-center active:scale-95 transition-all duration-300 shadow-sm group animate-fade-in bg-gradient-to-br ${bgGradient}`}
                  style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                  
                  <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-1.5 shadow-inner border border-white/20">
                    <span className="text-lg">{tab.icon}</span>
                  </div>
                  
                  <span className="text-[9px] font-black text-white leading-tight uppercase tracking-wide">{tab.name}</span>
                </button>
              );
          })}
        </div>
      </div>



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
                  className={`relative overflow-hidden aspect-square rounded-2xl flex flex-col items-center justify-center text-center active:scale-95 transition-all duration-300 shadow-sm group animate-fade-in bg-gradient-to-br ${bgGradient}`}
                  style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                  
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

      {/* Top Experts */}
      <div className="mt-2 pb-6">
        <h2 className="px-5 text-lg font-extrabold text-gray-900 mb-4">Top Experts</h2>
        <div className="flex overflow-x-auto px-5 space-x-4 hide-scrollbar">
          {TOP_EXPERTS.map((expert, i) => (
            <div key={expert.id} className="flex-shrink-0 w-56 bg-white rounded-2xl shadow-premium border border-gray-100/50 overflow-hidden card-lift animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
              <div className={`h-28 bg-gradient-to-r ${expert.gradient} flex items-center justify-center text-5xl`}>{expert.image}</div>
              <div className="p-3">
                <h3 className="text-sm font-bold text-gray-900">{expert.name}</h3>
                <p className="text-[10px] text-gray-500 mb-2">{expert.service}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-gray-900">{expert.price}</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500 text-xs">⭐</span>
                    <span className="text-[10px] font-bold text-gray-700">{expert.rating} ({expert.reviews})</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
