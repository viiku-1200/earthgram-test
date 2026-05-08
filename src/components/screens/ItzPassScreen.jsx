import React, { useState } from 'react';
import { ITZPASS_PLANS } from '../../data/constants';

const ItzPassScreen = ({ isDarkMode, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState('plans');

  if (step === 'success') {
    const plan = ITZPASS_PLANS.find(p => p.id === selectedPlan);
    return (
      <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-8 animate-slide-up">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg animate-bounce" style={{ animationDuration: '2s' }}>
          {plan?.icon}
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Welcome to {plan?.name}!</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Your membership is now active. Enjoy exclusive benefits!</p>
        <div className="w-full bg-gray-50 rounded-2xl p-5 space-y-2.5 border border-gray-100">
          {plan?.features.map((f, i) => (
            <div key={i} className="flex items-center space-x-2.5">
              <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-sm text-gray-700">{f}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose}
          className="w-full mt-6 bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform shadow-lg">
          Start Exploring
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 z-50 flex flex-col animate-slide-up">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 px-5 pt-12 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/4"></div>
        </div>
        <div className="flex items-center justify-between mb-6 relative z-10">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform text-sm font-bold">←</button>
          <h1 className="text-lg font-extrabold text-white">ItzPass</h1>
          <div className="w-8"></div>
        </div>
        <div className="text-center relative z-10">
          <span className="text-5xl block mb-3">👑</span>
          <h2 className="text-2xl font-extrabold text-white">Membership Plans</h2>
          <p className="text-sm text-amber-100 mt-2">Save more on every service. Priority access. Exclusive perks.</p>
        </div>
      </div>

      {/* Plans */}
      <div className="flex-1 overflow-y-auto p-5 -mt-6 hide-scrollbar pb-28">
        <div className="space-y-4">
          {ITZPASS_PLANS.map((plan, idx) => (
            <div key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`bg-white rounded-2xl border-2 shadow-premium overflow-hidden cursor-pointer card-lift animate-fade-in transition-all ${
                selectedPlan === plan.id ? 'border-amber-500 shadow-premium-lg' : 'border-gray-100/50'
              }`}
              style={{ animationDelay: `${idx * 0.08}s`, opacity: 0 }}>
              {plan.popular && (
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-center py-1.5">
                  <span className="text-[9px] font-black text-white uppercase tracking-wider">⭐ Most Popular</span>
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{plan.icon}</span>
                    <div>
                      <h3 className="text-base font-extrabold text-gray-900">{plan.name}</h3>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-extrabold text-gray-900">{plan.price}</span>
                        <span className="text-xs text-gray-400 font-bold">{plan.period}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedPlan === plan.id ? 'border-amber-500 bg-amber-500' : 'border-gray-300'
                  }`}>
                    {selectedPlan === plan.id && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    )}
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span className="text-xs text-gray-600">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="mt-6 bg-white p-4 rounded-2xl border border-gray-100/50 shadow-premium">
          <h3 className="text-sm font-extrabold text-gray-900 mb-3">Why ItzPass?</h3>
          <div className="space-y-3">
            {[
              { label: 'Save Money', desc: 'Up to 15% cashback on every service', bg: 'bg-emerald-50', color: 'text-emerald-600',
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
              { label: 'Priority Access', desc: 'Book first, even during peak hours', bg: 'bg-indigo-50', color: 'text-indigo-600',
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
              { label: 'Premium Support', desc: 'Dedicated support for Gold & Platinum', bg: 'bg-purple-50', color: 'text-purple-600',
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center`}>{item.icon}</div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.label}</p>
                  <p className="text-[10px] text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="absolute bottom-0 left-0 right-0 glass border-t border-gray-100/50 px-5 py-3 pb-6">
        <button onClick={() => selectedPlan && setStep('success')} disabled={!selectedPlan}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${
            selectedPlan ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white active:scale-[0.98] shadow-lg' : 'bg-gray-200 text-gray-400'
          }`}>
          <span>Subscribe Now</span>
          {selectedPlan && <span>→</span>}
        </button>
      </div>
    </div>
  );
};

export default ItzPassScreen;
