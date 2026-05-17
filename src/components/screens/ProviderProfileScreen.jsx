import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PROVIDER_PROFILES, generateFallbackProfile } from '../../data/constants';

const ProviderProfileScreen = ({ isDarkMode, onBack, qualityPosts = [] }) => {
  const [activeTab, setActiveTab] = useState('services');
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [callType, setCallType] = useState('video'); // 'video' or 'audio'
  const [callConnected, setCallConnected] = useState(false);
  const [callStatus, setCallStatus] = useState('Initiating secure peer-to-peer line...');
  const [callTimer, setCallTimer] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenShared, setScreenShared] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const summaryProfile = location.state?.profile;
  const profile = summaryProfile ? (PROVIDER_PROFILES[summaryProfile.id] || generateFallbackProfile(summaryProfile)) : null;

  // Find if this provider has any active/past quality check cases
  const juryCase = profile ? qualityPosts.find(p => p.provider.toLowerCase() === profile.name.toLowerCase()) : null;
  
  // Calculate verdict based on jury case
  let verdict = { label: 'Vouched', color: 'bg-rose-50 text-rose-600', sub: 'Passed neighborhood check' };
  if (juryCase) {
    const forgivePct = juryCase.votes.forgive;
    if (forgivePct < 25) verdict = { label: 'Terminated', color: 'bg-red-600 text-white', sub: 'Extreme community violations' };
    else if (forgivePct < 50) verdict = { label: 'Suspended', color: 'bg-amber-600 text-white', sub: '1-Day quality suspension' };
    else if (forgivePct < 75) verdict = { label: 'Guilty', color: 'bg-rose-500 text-white', sub: 'Quality warning issued' };
    else verdict = { label: 'Secured', color: 'bg-emerald-600 text-white', sub: 'Verified by neighborhood' };
  }

  // Determine if this is a Digital/Global Consultant (Doctor, Software, CA, Legal, Tutor, etc.)
  const isDigital = profile ? (
    ['software', 'doctor', 'ca', 'legal', 'math', 'science', 'music', 'tutors', 'consultancy', 'wellness', 'pets'].some(kw => 
      profile.category?.toLowerCase().includes(kw) || 
      (profile.sub && profile.sub.toLowerCase().includes(kw)) ||
      profile.distance?.toLowerCase().includes('remote')
    )
  ) : false;

  // Connection timer effect
  useEffect(() => {
    let statusTimer;
    let progressTimer;
    
    if (showCallScreen) {
      setCallTimer(0);
      setCallConnected(false);
      setCallStatus('Establishing secure peer-to-peer line...');
      
      // Step 1: Connecting
      statusTimer = setTimeout(() => {
        setCallStatus('🔒 Securing line via Aadhaar verification...');
      }, 1500);

      // Step 2: KYC Matched & Connected
      progressTimer = setTimeout(() => {
        setCallConnected(true);
        setCallStatus('📡 Connected. Aadhaar KYC Match: SUCCESS');
      }, 3500);
    }

    return () => {
      clearTimeout(statusTimer);
      clearTimeout(progressTimer);
    };
  }, [showCallScreen]);

  // Call timer counter
  useEffect(() => {
    let interval;
    if (showCallScreen && callConnected) {
      interval = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showCallScreen, callConnected]);

  if (!profile) return null;
  
  const BADGE_MAP = {
    'verified': { label: 'Verified', color: 'bg-indigo-50 text-indigo-600', icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
    'vaccinated': { label: 'Vaccinated', color: 'bg-emerald-50 text-emerald-600', icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> },
    'top-rated': { label: 'Top Rated', color: 'bg-amber-50 text-amber-600', icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
    'vouched': { label: verdict.label, color: verdict.color, icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    return (
      <div className="flex items-center space-x-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`text-sm ${i < full ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
        ))}
      </div>
    );
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const GALLERY_GRADIENTS = ['from-pink-400 to-rose-500', 'from-indigo-400 to-purple-500', 'from-amber-400 to-orange-500', 'from-emerald-400 to-teal-500', 'from-blue-400 to-cyan-500', 'from-red-400 to-pink-500'];

  return (
    <div className={`absolute inset-0 z-50 flex flex-col overflow-y-auto hide-scrollbar ${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gradient-to-b from-white to-gray-50 text-gray-900'}`}>
      
      {/* Hero Header */}
      <div className={`relative pt-10 pb-20 px-5 overflow-hidden transition-colors ${juryCase && juryCase.votes.forgive < 50 ? 'bg-gradient-to-br from-rose-700 via-rose-800 to-black' : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700'}`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/4"></div>
        </div>
        <button onClick={onBack} className="relative z-10 w-9 h-9 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center text-white active:scale-90 transition-transform">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        
        {/* JURY ALERT RIBBON */}
        {juryCase && (
          <div className="absolute top-12 left-20 right-5 h-9 bg-black/30 backdrop-blur-md rounded-full border border-white/20 flex items-center px-4 space-x-2 animate-pulse">
            <span className="text-[9px] font-black text-white uppercase tracking-tighter">Live Verdict:</span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${juryCase.votes.forgive < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {juryCase.votes.forgive}% Forgive
            </span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
               <div className={`h-full transition-all duration-500 ${juryCase.votes.forgive < 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${juryCase.votes.forgive}%` }}></div>
            </div>
          </div>
        )}

        <button onClick={() => navigate('/community')} className="absolute top-12 right-5 w-9 h-9 bg-rose-500 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform z-10 shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </button>

        {/* Floating profile card */}
        <div className={`absolute -bottom-16 left-5 right-5 rounded-2xl shadow-premium-lg p-4 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100/50'}`}>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h1 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{profile.name}</h1>
                {juryCase && <span className="text-[8px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full font-black">JURY CHECKED</span>}
              </div>
              <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>{profile.category} · {profile.location}</p>
              <div className="flex items-center space-x-2 mt-1">
                {renderStars(profile.rating)}
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>{profile.rating}</span>
                <span className="text-[10px] text-gray-400">({profile.reviews})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-20"></div>

      {/* Badges */}
      <div className="px-5 mt-4 flex flex-wrap gap-2">
        {profile.badges.map(badge => {
          const b = BADGE_MAP[badge];
          return b ? (
            <span key={badge} className={`text-[9px] font-bold ${b.color} px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-sm`}>
              {b.icon}<span>{b.label}</span>
            </span>
          ) : null;
        })}
        {isDigital ? (
          <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full flex items-center space-x-1.5 shadow-sm animate-pulse">
            <span>🌍</span> <span>Remote Consultation</span>
          </span>
        ) : (
          <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>📍 {profile.distance}</span>
        )}
      </div>

      {/* Community Standing / Verdict */}
      <div className="px-5 mt-4">
        <div className={`${juryCase && juryCase.votes.forgive < 50 ? 'bg-rose-50/10 border-rose-500/20 text-rose-500' : 'bg-emerald-50/10 border-emerald-500/20 text-emerald-500'} border rounded-2xl p-4 flex items-center space-x-4`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${juryCase && juryCase.votes.forgive < 50 ? 'bg-rose-500 text-white shadow-glow-rose' : 'bg-emerald-500 text-white shadow-glow-emerald'}`}>
            {juryCase && juryCase.votes.forgive < 50 ? '⚖️' : '🛡️'}
          </div>
          <div className="flex-1">
            <p className={`text-xs font-black uppercase tracking-widest ${juryCase && juryCase.votes.forgive < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
              Community Standing: {verdict.label}
            </p>
            <p className={`text-[10px] font-bold mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {verdict.sub}
            </p>
          </div>
          <button onClick={() => navigate('/community')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${juryCase && juryCase.votes.forgive < 50 ? 'bg-rose-600 text-white shadow-lg' : 'bg-indigo-500/20 text-indigo-400'}`}>
            Details
          </button>
        </div>
      </div>

      {/* Neighborhood Trust */}
      <div className="px-5 mt-4">
        <div className={`border rounded-2xl p-3 flex items-center space-x-3 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className="flex -space-x-2">
            {['RS', 'AK', 'PV'].map((init, i) => (
              <div key={i} className={`w-7 h-7 bg-gradient-to-br ${['from-blue-500 to-indigo-600', 'from-pink-500 to-rose-600', 'from-emerald-500 to-teal-600'][i]} rounded-full border-2 flex items-center justify-center text-white text-[8px] font-bold ${isDarkMode ? 'border-slate-900' : 'border-emerald-50'}`}>{init}</div>
            ))}
          </div>
          <div>
            <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-emerald-800'}`}>Used by <span className="text-emerald-500 font-extrabold">{profile.neighborhoodTrust.count} neighbors</span> in {profile.neighborhoodTrust.area} recently</p>
            <p className="text-[9px] text-emerald-500 flex items-center space-x-1 mt-0.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              <span>Trusted by your community</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-5 mt-4 flex space-x-3">
        {[
          { icon: <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>, value: profile.jobsDone, label: 'Jobs Done' },
          { icon: <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, value: `${profile.yearsExp} yrs`, label: 'Experience' },
          { icon: <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>, value: profile.rating, label: 'Rating' },
        ].map((stat, i) => (
          <div key={i} className={`flex-1 p-3 rounded-2xl text-center border shadow-premium ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100/50'}`}>
            <div className="flex justify-center">{stat.icon}</div>
            <p className={`text-sm font-extrabold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
            <p className="text-[9px] text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Watch Intro Video */}
      <div className="px-5 mt-4">
        <button className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-2xl p-4 flex items-center justify-center space-x-3 active:scale-[0.98] transition-transform shadow-lg">
          <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold">Watch Intro</p>
            <p className="text-[10px] text-gray-400">See my work demo · 30 sec</p>
          </div>
        </button>
      </div>

      {/* About */}
      <div className="px-5 mt-5">
        <h2 className={`text-sm font-extrabold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}>About</h2>
        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>{profile.about}</p>
      </div>

      {/* Tab Navigation */}
      <div className={`mt-5 flex space-x-1 rounded-xl p-1 mx-5 ${isDarkMode ? 'bg-slate-800/60' : 'bg-gray-100'}`}>
        {['services', 'gallery', 'reviews'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold capitalize transition-all ${
              activeTab === tab 
                ? (isDarkMode ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm') 
                : 'text-gray-500'
            }`}>
            {tab === 'services' ? `Services (${profile.services.length})` :
             tab === 'gallery' ? `Gallery (${profile.gallery.length})` :
             `Reviews (${profile.reviewsList.length})`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-5 mt-4 pb-28">
        {activeTab === 'services' && (
          <div className="space-y-3">
            {profile.services.map((service, i) => (
              <div key={service.id} className={`p-4 rounded-2xl border shadow-premium card-lift animate-fade-in ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100/50'}`}
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{service.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{service.desc}</p>
                  </div>
                  <div className="text-right ml-3">
                    <span className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{service.price}</span>
                    <p className="text-[9px] text-gray-400 mt-0.5">⏱️ {service.time}</p>
                  </div>
                </div>
                <button onClick={() => navigate('/book', { state: { provider: profile, service: service } })}
                  className={`mt-3 w-full py-2 rounded-xl border text-[11px] font-bold active:scale-[0.98] transition-transform ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                  Add to Booking
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="grid grid-cols-3 gap-2">
            {profile.gallery.map((item, i) => (
              <div key={i} className={`aspect-square bg-gradient-to-br ${GALLERY_GRADIENTS[i % GALLERY_GRADIENTS.length]} rounded-2xl flex items-center justify-center text-3xl shadow-premium cursor-pointer active:scale-95 transition-transform`}>
                {item}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-3">
            <div className={`p-4 rounded-2xl border shadow-premium flex items-center space-x-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100/50'}`}>
              <div className="text-center">
                <p className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{profile.rating}</p>
                {renderStars(profile.rating)}
                <p className="text-[9px] text-gray-400 mt-1">{profile.reviews} reviews</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = profile.reviewsList.filter(r => r.rating === star).length;
                  const pct = profile.reviewsList.length > 0 ? (count / profile.reviewsList.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center space-x-2">
                      <span className="text-[10px] text-gray-400 w-3">{star}</span>
                      <div className={`flex-1 rounded-full h-1.5 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                        <div className="bg-yellow-400 rounded-full h-1.5 transition-all" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {profile.reviewsList.map((review, i) => (
              <div key={review.id} className={`p-4 rounded-2xl border shadow-premium animate-fade-in ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100/50'}`}
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                      {review.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{review.name}</h4>
                      <p className="text-[9px] text-gray-400">{review.date}</p>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>{review.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA */}
      <div className={`fixed bottom-0 left-0 right-0 glass border-t px-5 py-3 pb-6 flex items-center space-x-3 z-30`} style={{ maxWidth: '480px', margin: '0 auto' }}>
        {isDigital ? (
          <>
            <button 
              onClick={() => { setCallType('video'); setShowCallScreen(true); }}
              className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 dark:bg-slate-900 dark:border-indigo-500 dark:text-indigo-400 py-3 rounded-xl font-black text-xs flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform shadow-premium"
            >
              <span>🎥</span>
              <span>Video Call</span>
            </button>
            <button 
              onClick={() => navigate('/book', { state: { provider: profile, service: profile.services?.[0] } })}
              className="flex-[1.5] bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-black text-xs flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform shadow-glow-indigo"
            >
              <span>📅</span>
              <span>Book Appointment</span>
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => { setCallType('audio'); setShowCallScreen(true); }}
              className="flex-1 bg-white border-2 border-gray-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <span>Call Provider</span>
            </button>
            <button 
              onClick={() => navigate('/book', { state: { provider: profile, service: profile.services?.[0] } })}
              className="flex-[1.5] bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform shadow-glow-indigo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span>Book Appointment</span>
            </button>
          </>
        )}
      </div>

      {/* FULL SCREEN SECURE VIDEO/AUDIO CALL OVERLAY */}
      {showCallScreen && (
        <div className="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col justify-between p-6 animate-fade-in" style={{ maxWidth: '480px', margin: '0 auto' }}>
          
          {/* Header Status Bar */}
          <div className="flex flex-col items-center pt-8">
            <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-4 py-1.5 rounded-full backdrop-blur-md animate-pulse">
              <span className="text-indigo-400 text-xs">🛡️</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">EarthGram Secure High-Trust Call</span>
            </div>
            
            <p className="text-[11px] text-slate-400 font-bold tracking-tight text-center mt-3 leading-snug px-8">
              {callStatus}
            </p>
          </div>

          {/* Core Stream View Area */}
          <div className="flex-1 flex flex-col justify-center items-center relative my-6">
            
            {/* Visualizer and Pulsar circles */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              {callConnected && (
                <>
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute inset-4 bg-indigo-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                  <div className="absolute inset-8 bg-indigo-500/30 rounded-full animate-ping" style={{ animationDuration: '1.5s' }}></div>
                </>
              )}
              
              {/* Central Specialist Profile Photo Avatar */}
              <div className="relative z-10 w-32 h-32 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-full flex flex-col items-center justify-center shadow-2xl border-4 border-slate-800">
                <span className="text-4xl font-extrabold tracking-tight">
                  {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
                
                {/* Micro green indicator */}
                {callConnected && (
                  <span className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-950 flex items-center justify-center">
                    <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span>
                  </span>
                )}
              </div>
            </div>

            {/* Simulated Live Audio Soundwaves */}
            {callConnected && !micMuted && (
              <div className="flex items-center space-x-1 mt-6 h-8">
                {[1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1].map((val, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ 
                      height: `${val * (3 + Math.sin(callTimer + i) * 2)}px`,
                      animation: `wave 1s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.08}s`
                    }}
                  ></div>
                ))}
              </div>
            )}

            {/* Specialist Meta Data */}
            <div className="text-center mt-6 z-10">
              <h2 className="text-2xl font-black">{profile.name}</h2>
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mt-1">{profile.category} Specialist</p>
              {callConnected && (
                <p className="text-lg font-black tracking-widest text-indigo-300 mt-2 font-mono bg-indigo-500/10 px-4 py-1 rounded-xl inline-block border border-indigo-500/20">
                  {formatTime(callTimer)}
                </p>
              )}
            </div>

            {/* Mock User Camera Preview in corner (PIP) for Video Calls */}
            {callType === 'video' && (
              <div className="absolute bottom-4 right-4 w-28 h-40 bg-slate-900 rounded-2xl border-2 border-slate-700/80 shadow-2xl overflow-hidden flex flex-col justify-between p-2">
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-full self-start">You</span>
                
                {cameraOn ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <span className="text-3xl animate-bounce">🧑‍💻</span>
                    <span className="text-[8px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Camera Active</span>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <span className="text-xl text-slate-600">❌</span>
                    <span className="text-[8px] font-bold text-slate-600 mt-1 uppercase tracking-wider">Camera Off</span>
                  </div>
                )}
                
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full self-end border border-emerald-500/20">KYC Verified</span>
              </div>
            )}
          </div>

          {/* Bottom Interactive Controls Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-[2.5rem] p-6 flex flex-col space-y-5 backdrop-blur-md mb-4 shadow-2xl">
            {screenShared && (
              <div className="bg-indigo-600/20 border border-indigo-500/30 py-2 px-4 rounded-2xl flex items-center justify-between text-xs animate-slide-up">
                <span className="font-bold text-indigo-300 flex items-center space-x-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                  <span>🖥️ Sharing screen mock view</span>
                </span>
                <button onClick={() => setScreenShared(false)} className="text-[10px] font-black uppercase tracking-widest bg-slate-800 text-indigo-400 px-3 py-1 rounded-xl">Stop</button>
              </div>
            )}

            <div className="flex justify-around items-center">
              {/* Mic Control */}
              <button 
                onClick={() => setMicMuted(!micMuted)}
                className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all ${
                  micMuted 
                    ? 'bg-rose-600/20 text-rose-500 border-2 border-rose-500/40 shadow-lg' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span className="text-lg">{micMuted ? '🔇' : '🎙️'}</span>
                <span className="text-[7px] font-black uppercase tracking-widest mt-0.5">{micMuted ? 'Unmute' : 'Mute'}</span>
              </button>

              {/* Camera Control (For Video Calls) */}
              {callType === 'video' && (
                <button 
                  onClick={() => setCameraOn(!cameraOn)}
                  className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all ${
                    !cameraOn 
                      ? 'bg-rose-600/20 text-rose-500 border-2 border-rose-500/40 shadow-lg' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-lg">{cameraOn ? '📹' : '📵'}</span>
                  <span className="text-[7px] font-black uppercase tracking-widest mt-0.5">{cameraOn ? 'Cam Off' : 'Cam On'}</span>
                </button>
              )}

              {/* Screen Share Control */}
              {callConnected && (
                <button 
                  onClick={() => setScreenShared(!screenShared)}
                  className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all ${
                    screenShared 
                      ? 'bg-indigo-600 text-white shadow-glow-indigo' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-lg">🖥️</span>
                  <span className="text-[7px] font-black uppercase tracking-widest mt-0.5">Share</span>
                </button>
              )}

              {/* Hangup Control */}
              <button 
                onClick={() => setShowCallScreen(false)}
                className="w-14 h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-glow-rose active:scale-90 transition-transform"
              >
                <span className="text-2xl transform rotate-135 inline-block">📞</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderProfileScreen;
