import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, PROVIDERS, TOP_EXPERTS, HERO_BANNERS, SCOPES, NATIONAL_PROVIDERS, GLOBAL_PROVIDERS } from '../../data/constants';
import ScopeMap from '../maps/ScopeMap';

const HomeScreen = ({ activeScope, setActiveScope }) => {
  const navigate = useNavigate();
  const [activeBanner, setActiveBanner] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  // Auto-rotate banners
  useEffect(() => {
    const timer = setInterval(() => setActiveBanner(b => (b + 1) % HERO_BANNERS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const currentCategory = CATEGORIES.find(c => c.id === selectedCategory);

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
      <div className="h-full flex flex-col bg-gray-50 pt-8 pb-20 overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="glass px-5 pt-2 pb-4 flex items-center space-x-4">
          <button onClick={() => setSelectedSubCategory(null)}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition-transform text-sm font-bold">←</button>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-extrabold text-gray-900">{selectedSubCategory === '__ALL__' ? 'All Providers' : selectedSubCategory}</h1>
            <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{cat.name}</span>
          </div>
        </div>

        {/* Results count */}
        <div className="px-5 mt-4 mb-2">
          <p className="text-xs text-gray-500 font-medium">
            {filteredProviders.length} Virtual {filteredProviders.length === 1 ? 'Company' : 'Companies'} found
          </p>
        </div>

        {/* Provider Cards */}
        <div className="px-5 space-y-3">
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
                className="bg-white p-4 rounded-2xl shadow-premium border border-gray-100/50 cursor-pointer card-lift animate-fade-in gradient-border"
                style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                <div className="flex justify-between items-start mb-2 pl-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-11 h-11 bg-gradient-to-br ${cat.color} rounded-xl flex items-center justify-center text-xl shadow-sm`}>
                      {cat.icon}
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-0.5">{provider.tag}</span>
                      <h3 className="text-sm font-bold text-gray-900">{provider.name}</h3>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">📍 {provider.distance}</span>
                    {provider.available && <span className="flex items-center space-x-1 mt-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full online-dot"></span><span className="text-[8px] font-bold text-green-600">Online</span></span>}
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-3 pl-2">
                  <span className="text-yellow-500 mr-1">⭐</span>
                  <span className="font-bold text-gray-700 mr-1">{provider.rating}</span>
                  <span>({provider.reviews})</span>
                  <span className="mx-2 text-gray-200">•</span>
                  <span className="text-[10px] text-gray-400">Used by neighbors recently</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-50 pt-3 pl-2">
                  <span className="font-extrabold text-gray-900">{provider.price}</span>
                  <button onClick={(e) => { e.stopPropagation(); navigate('/provider', { state: { profile: provider } }); }}
                    className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-5 py-2 rounded-xl font-bold text-xs active:scale-95 transition-transform shadow-sm">
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
      <div className="h-full flex flex-col bg-gray-50 pt-8 pb-20 overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="glass px-5 pt-2 pb-4 flex items-center space-x-4">
          <button onClick={() => { setSelectedCategory(null); setSelectedSubCategory(null); }}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition-transform text-sm font-bold">←</button>
          <h1 className="text-lg font-extrabold text-gray-900">{cat.name}</h1>
          {cat.badge && <span className="text-[9px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{cat.badge}</span>}
          {cat.comingSoon && <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Coming Soon</span>}
        </div>

        {/* ItzRunner Special View */}
        {cat.label === 'Chotu' && cat.services ? (
          <div className="px-5 mt-6 space-y-4 animate-fade-in">
            <div className="text-center mb-4">
              <span className="text-5xl block mb-2">🏃</span>
              <h2 className="text-lg font-black text-gray-900">ItzRunner <span className="text-orange-500">(Chotu)</span></h2>
              <p className="text-xs text-gray-500">Your local delivery & task buddy</p>
            </div>
            {cat.services.map((service, i) => (
              <div key={service.id} className="bg-white p-5 rounded-2xl shadow-premium border border-gray-100/50 flex items-center space-x-4 card-lift animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-50 rounded-2xl flex items-center justify-center text-3xl">{service.icon}</div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">{service.name}</h3>
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
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Choose a service type</h2>
            <div className="grid grid-cols-3 gap-4">
              {cat.subTabs && cat.subTabs.filter(tab => tab.name !== 'All').map((tab, i) => {
                const providerCount = (cat.providers || []).filter(p => p.sub === tab.name).length;
                return (
                  <button key={tab.name}
                    onClick={() => setSelectedSubCategory(tab.name)}
                    className="flex flex-col items-center active:scale-90 transition-all duration-200 group animate-fade-in"
                    style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                    <div className={`w-[72px] h-[72px] ${tab.bg} rounded-2xl flex items-center justify-center text-3xl shadow-premium border border-white/80 group-hover:shadow-premium-lg transition-shadow`}>
                      {tab.icon}
                    </div>
                    <span className="text-[11px] font-bold text-gray-700 mt-2 text-center leading-tight">{tab.name}</span>
                    {providerCount > 0 && (
                      <span className="text-[9px] font-medium text-gray-400 mt-0.5">{providerCount} {providerCount === 1 ? 'company' : 'companies'}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* "View All" button at the bottom */}
            <button
              onClick={() => setSelectedSubCategory(null) || setSelectedSubCategory('__ALL__')}
              className="w-full mt-6 bg-white border border-gray-200 text-gray-700 py-3 rounded-2xl text-sm font-bold active:scale-[0.98] transition-transform flex items-center justify-center space-x-2 shadow-premium">
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
    <div className="h-full flex flex-col bg-gradient-to-b from-white to-gray-50/80 pt-8 pb-20 overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="px-5 pt-2 pb-3 flex justify-between items-center bg-white/80 border-b border-gray-100/50">
        <div>
          <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest">Location</p>
          <div className="flex items-center mt-0.5">
            <span className="text-lg mr-1.5">📍</span>
            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">Ghaziabad</h1>
            <span className="ml-1 text-gray-400 text-xs">▼</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => navigate('/search')} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm active:scale-90 transition-transform">
            🔍
          </button>
          <button className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm relative active:scale-90 transition-transform">
            🔔
            <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
          </button>
        </div>
      </div>

      {/* ====== SCOPE TABS ====== */}
      <div className="px-5 mt-4">
        <div className="flex bg-gray-100 rounded-2xl p-1 relative">
          {SCOPES.map((scope) => (
            <button key={scope.id}
              onClick={() => setActiveScope(scope.id)}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-300 ${
                currentScopeId === scope.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow-indigo'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              <span className="text-sm">{scope.icon}</span>
              <span>{scope.label}</span>
            </button>
          ))}
        </div>
        {/* Scope description */}
        <div className="flex justify-center mt-2">
          <span className="text-[9px] text-gray-400 font-medium">
            {SCOPES.find(s => s.id === currentScopeId)?.desc} — {SCOPES.find(s => s.id === currentScopeId)?.radius}
          </span>
        </div>
      </div>

      {/* ====== SCOPE MAP ====== */}
      <div className="px-5 mt-4">
        <ScopeMap scope={currentScopeId} />
      </div>

      {/* Hero Banner Carousel */}
      <div className="px-5 mt-5">
        <div className="relative overflow-hidden rounded-2xl">
          {HERO_BANNERS.map((banner, i) => (
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
            {HERO_BANNERS.map((_, i) => (
              <button key={i} onClick={() => setActiveBanner(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeBanner ? 'w-6 bg-indigo-600' : 'w-1.5 bg-gray-300'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mt-6">
        <h2 className="px-5 text-lg font-extrabold text-gray-900 mb-4">Home & Personal Services</h2>
        <div className="px-5 grid grid-cols-4 gap-3">
          {CATEGORIES.filter(c => c.id !== '7' && c.id !== '10').map((cat, i) => (
            <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory(null); }}
              className="flex flex-col items-center active:scale-90 transition-all duration-200 relative animate-fade-in"
              style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
              <div className={`w-14 h-14 bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center text-2xl shadow-premium`}>
                {cat.icon}
              </div>
              {cat.badge && (
                <span className="absolute -top-1 -right-0 text-[7px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded-full shadow">{cat.badge}</span>
              )}
              <span className="text-[10px] font-bold text-gray-700 mt-1.5 text-center leading-tight">{cat.name}</span>
            </button>
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
                className={`relative overflow-hidden p-4 rounded-2xl flex flex-col items-start text-left active:scale-[0.98] transition-transform shadow-premium card-lift animate-fade-in bg-gradient-to-br ${bgGradient}`}
                style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                
                {/* Decorative background glow */}
                <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/10 blur-xl"></div>
                
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl mb-3 border border-white/20 shadow-inner">
                  {tab.icon}
                </div>
                
                <span className="text-xs font-bold text-white leading-tight">{tab.name === 'CA' ? 'Chartered Acc.' : tab.name}</span>
                <span className="text-[9px] text-white/70 font-medium mt-0.5">Consultants</span>
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
          {CATEGORIES.find(c => c.id === '10')?.subTabs?.filter(t => t.name !== 'All').map((tab, i) => {
            let bgGradient = 'from-green-500 to-emerald-700';
            if (tab.name === 'Artisans') bgGradient = 'from-amber-600 to-orange-800';
            if (tab.name === 'Home Chefs') bgGradient = 'from-rose-500 to-red-700';

            return (
              <button key={tab.name} onClick={() => { setSelectedCategory('10'); setSelectedSubCategory(tab.name); }}
                className={`relative overflow-hidden p-3 rounded-2xl flex flex-col items-center justify-center text-center active:scale-[0.98] transition-transform shadow-premium card-lift animate-fade-in bg-gradient-to-br ${bgGradient}`}
                style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                
                {/* Decorative background glow */}
                <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/20 blur-xl"></div>
                
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl mb-2 border border-white/30 shadow-inner">
                  {tab.icon}
                </div>
                
                <span className="text-[11px] font-bold text-white leading-tight">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scope-based Providers */}
      <div className="mt-6 pb-4">
        <div className="px-5 flex justify-between items-center mb-4">
          <h2 className="text-lg font-extrabold text-gray-900">
            {currentScopeId === 'local' ? 'Services Near You' : currentScopeId === 'national' ? 'Top National Services' : 'Global Services'}
          </h2>
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full online-dot"></span>
            <span>{currentScopeId === 'local' ? 'AVAILABLE NOW' : currentScopeId === 'national' ? 'PAN INDIA' : 'WORLDWIDE'}</span>
          </span>
        </div>

        {/* Provider Cards */}
        <div className="px-5 space-y-3">
          {scopeProviders.map((provider, i) => (
            <div key={provider.id} onClick={() => navigate('/provider', { state: { profile: provider } })}
              className="bg-white p-4 rounded-2xl shadow-premium border border-gray-100/50 cursor-pointer card-lift animate-fade-in gradient-border"
              style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}>
              <div className="flex justify-between items-start mb-2 pl-2">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-indigo-100 to-purple-50 rounded-xl flex items-center justify-center text-xl shadow-sm border border-indigo-100/50">{provider.avatar}</div>
                  <div>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-0.5">{provider.tag}</span>
                    <h3 className="text-sm font-bold text-gray-900">{provider.name}</h3>
                  </div>
                </div>
                <span className="text-[9px] font-bold bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">📍 {provider.distance}</span>
              </div>
              <div className="flex items-center justify-between mb-2 pl-2">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="text-yellow-500 mr-1">⭐</span>
                  <span className="font-bold text-gray-700 mr-1">{provider.rating}</span>
                  <span>({provider.reviews})</span>
                </div>
                {currentScopeId === 'local' && <p className="text-[10px] text-gray-400">Used by 12 neighbors recently</p>}
                {currentScopeId === 'national' && <p className="text-[10px] text-indigo-400">{provider.city}</p>}
                {currentScopeId === 'global' && <p className="text-[10px] text-purple-400">{provider.city}</p>}
              </div>
              <div className="flex justify-between items-center border-t border-gray-50 pt-3 pl-2">
                <span className="font-extrabold text-gray-900">{provider.price}</span>
                <button onClick={(e) => { e.stopPropagation(); navigate('/provider', { state: { profile: provider } }); }}
                  className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-5 py-2 rounded-xl font-bold text-xs active:scale-95 transition-transform shadow-sm">
                  {currentScopeId === 'local' ? 'Book' : 'View'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

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
