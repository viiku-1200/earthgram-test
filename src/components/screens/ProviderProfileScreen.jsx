import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PROVIDER_PROFILES, generateFallbackProfile } from '../../data/constants';

const ProviderProfileScreen = ({ isDarkMode, onBack, qualityPosts = [] }) => {
  const [activeTab, setActiveTab] = useState('services');
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

  const GALLERY_GRADIENTS = ['from-pink-400 to-rose-500', 'from-indigo-400 to-purple-500', 'from-amber-400 to-orange-500', 'from-emerald-400 to-teal-500', 'from-blue-400 to-cyan-500', 'from-red-400 to-pink-500'];

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 z-50 flex flex-col overflow-y-auto hide-scrollbar">
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
        <div className="absolute -bottom-16 left-5 right-5 bg-white rounded-2xl shadow-premium-lg p-4 border border-gray-100/50">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-extrabold text-gray-900">{profile.name}</h1>
                {juryCase && <span className="text-[8px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full font-black">JURY CHECKED</span>}
              </div>
              <p className="text-[10px] text-gray-400">{profile.category} · {profile.location}</p>
              <div className="flex items-center space-x-2 mt-1">
                {renderStars(profile.rating)}
                <span className="text-xs font-bold text-gray-700">{profile.rating}</span>
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
        <span className="text-[9px] font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">📍 {profile.distance}</span>
      </div>

      {/* Community Standing / Verdict */}
      <div className="px-5 mt-4">
        <div className={`${juryCase && juryCase.votes.forgive < 50 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'} border rounded-2xl p-4 flex items-center space-x-4`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${juryCase && juryCase.votes.forgive < 50 ? 'bg-rose-500 text-white shadow-glow-rose' : 'bg-emerald-500 text-white shadow-glow-emerald'}`}>
            {juryCase && juryCase.votes.forgive < 50 ? '⚖️' : '🛡️'}
          </div>
          <div className="flex-1">
            <p className={`text-xs font-black uppercase tracking-widest ${juryCase && juryCase.votes.forgive < 50 ? 'text-rose-600' : 'text-emerald-700'}`}>
              Community Standing: {verdict.label}
            </p>
            <p className={`text-[10px] font-bold mt-0.5 ${juryCase && juryCase.votes.forgive < 50 ? 'text-rose-400' : 'text-emerald-500'}`}>
              {verdict.sub}
            </p>
          </div>
          <button onClick={() => navigate('/community')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${juryCase && juryCase.votes.forgive < 50 ? 'bg-rose-600 text-white shadow-lg' : 'bg-emerald-100 text-emerald-700'}`}>
            Details
          </button>
        </div>
      </div>

      {/* Neighborhood Trust */}
      <div className="px-5 mt-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-center space-x-3">
          <div className="flex -space-x-2">
            {['RS', 'AK', 'PV'].map((init, i) => (
              <div key={i} className={`w-7 h-7 bg-gradient-to-br ${['from-blue-500 to-indigo-600', 'from-pink-500 to-rose-600', 'from-emerald-500 to-teal-600'][i]} rounded-full border-2 border-emerald-50 flex items-center justify-center text-white text-[8px] font-bold`}>{init}</div>
            ))}
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-800">Used by <span className="text-emerald-600">{profile.neighborhoodTrust.count} neighbors</span> in {profile.neighborhoodTrust.area} recently</p>
            <p className="text-[9px] text-emerald-600 flex items-center space-x-1 mt-0.5">
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
          <div key={i} className="flex-1 bg-white p-3 rounded-2xl text-center border border-gray-100/50 shadow-premium">
            <div className="flex justify-center">{stat.icon}</div>
            <p className="text-sm font-extrabold text-gray-900 mt-1">{stat.value}</p>
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
        <h2 className="text-sm font-extrabold text-gray-900 mb-2">About</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{profile.about}</p>
      </div>

      {/* Tab Navigation */}
      <div className="mt-5 flex space-x-1 bg-gray-100 rounded-xl p-1 mx-5">
        {['services', 'gallery', 'reviews'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold capitalize transition-all ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
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
              <div key={service.id} className="bg-white p-4 rounded-2xl border border-gray-100/50 shadow-premium card-lift animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900">{service.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{service.desc}</p>
                  </div>
                  <div className="text-right ml-3">
                    <span className="text-sm font-extrabold text-gray-900">{service.price}</span>
                    <p className="text-[9px] text-gray-400 mt-0.5">⏱️ {service.time}</p>
                  </div>
                </div>
                <button onClick={() => navigate('/book', { state: { provider: profile, service: service } })}
                  className="mt-3 w-full py-2 rounded-xl bg-gray-50 border border-gray-200 text-[11px] font-bold text-gray-600 active:scale-[0.98] transition-transform hover:bg-gray-100">
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
            <div className="bg-white p-4 rounded-2xl border border-gray-100/50 shadow-premium flex items-center space-x-4">
              <div className="text-center">
                <p className="text-3xl font-extrabold text-gray-900">{profile.rating}</p>
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
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-yellow-400 rounded-full h-1.5 transition-all" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {profile.reviewsList.map((review, i) => (
              <div key={review.id} className="bg-white p-4 rounded-2xl border border-gray-100/50 shadow-premium animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                      {review.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{review.name}</h4>
                      <p className="text-[9px] text-gray-400">{review.date}</p>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-gray-100/50 px-5 py-3 pb-6 flex items-center space-x-3 z-30" style={{ maxWidth: '480px', margin: '0 auto' }}>
        <button className="flex-1 bg-white border-2 border-gray-200 text-gray-800 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          <span>Call</span>
        </button>
        <button onClick={() => navigate('/book', { state: { provider: profile, service: profile.services?.[0] } })}
          className="flex-[2] bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform shadow-glow-indigo">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span>Book Now</span>
        </button>
      </div>
    </div>
  );
};

export default ProviderProfileScreen;
