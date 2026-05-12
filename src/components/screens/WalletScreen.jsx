import React, { useState } from 'react';
import { WALLET_TRANSACTIONS, TOPUP_AMOUNTS } from '../../data/constants';

const QUICK_ACTIONS = [
  { label: 'Send', bg: 'bg-emerald-50', color: 'text-emerald-600', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
  )},
  { label: 'Request', bg: 'bg-indigo-50', color: 'text-indigo-600', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
  )},
  { label: 'Rewards', bg: 'bg-purple-50', color: 'text-purple-600', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
  )},
  { label: 'History', bg: 'bg-amber-50', color: 'text-amber-600', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  )},
];

const TXN_ICONS = {
  '💳': (<svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>),
  '🧹': (<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>),
  '🎁': (<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>),
  '🤝': (<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
  '🔧': (<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
  '👑': (<svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3l3.057 7.528L12 7l3.943 3.528L19 3M5 3v18h14V3" /></svg>),
};

const LOCAL_COINS = [
  { id: 1, name: 'Rajesh Coins', provider: 'Dr. Rajesh Clinic', balance: 50, color: 'from-indigo-500 to-purple-600', icon: '🩺' },
  { id: 2, name: 'Harvest Coins', provider: 'Green Harvest', balance: 120, color: 'from-emerald-500 to-teal-600', icon: '🌾' },
  { id: 3, name: 'Tech Tokens', provider: 'Digital Sol.', balance: 15, color: 'from-blue-500 to-cyan-600', icon: '💻' },
  { id: 4, name: 'Fitness Coins', provider: 'Iron Gym', balance: 45, color: 'from-orange-500 to-red-600', icon: '💪' },
];

const WalletScreen = ({ isDarkMode, onClose }) => {
  const [showTopup, setShowTopup] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [topupSuccess, setTopupSuccess] = useState(false);

  const handleTopup = () => {
    setTopupSuccess(true);
    setTimeout(() => { setTopupSuccess(false); setShowTopup(false); setSelectedAmount(null); setCustomAmount(''); }, 2000);
  };

  if (topupSuccess) {
    return (
      <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-8 animate-slide-up">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mb-6 shadow-glow-green">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Money Added!</h2>
        <p className="text-sm text-gray-500">₹{selectedAmount || customAmount} added to ItzWallet</p>
      </div>
    );
  }

  if (showTopup) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 z-50 flex flex-col animate-slide-up">
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowTopup(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition-transform text-sm font-bold">←</button>
            <h1 className="text-lg font-extrabold text-gray-900">Add Money</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6 hide-scrollbar pb-28">
          <div className="text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Current Balance</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">₹450.00</p>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-3">Quick Add</h3>
            <div className="grid grid-cols-3 gap-3">
              {TOPUP_AMOUNTS.map(amt => (
                <button key={amt} onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                  className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 ${selectedAmount === amt ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow-indigo scale-105' : 'bg-white border border-gray-200 text-gray-700 shadow-premium active:scale-95'}`}>
                  ₹{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-3">Custom Amount</h3>
            <div className="flex items-center bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-premium focus-within:border-indigo-300 transition-colors">
              <span className="text-lg font-bold text-gray-300 mr-2">₹</span>
              <input type="number" value={customAmount}
                onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                placeholder="Enter amount" className="flex-1 outline-none text-lg font-bold text-gray-900 bg-transparent" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-3">Payment Method</h3>
            <div className="space-y-2">
              {[
                { label: 'UPI', checked: true, icon: (<svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>), bg: 'bg-indigo-50 border-indigo-200' },
                { label: 'Debit / Credit Card', checked: false, icon: (<svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>), bg: 'bg-gray-50 border-gray-200' },
                { label: 'Net Banking', checked: false, icon: (<svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>), bg: 'bg-gray-50 border-gray-200' },
              ].map(m => (
                <label key={m.label} className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer ${m.bg} transition-colors`}>
                  <input type="radio" name="topup" defaultChecked={m.checked} className="accent-indigo-600" />
                  {m.icon}
                  <span className="text-sm font-bold text-gray-900">{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 glass border-t border-gray-100/50 px-5 py-3 pb-6">
          <button onClick={handleTopup} disabled={!selectedAmount && !customAmount}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all ${selectedAmount || customAmount ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white active:scale-[0.98] shadow-glow-indigo' : 'bg-gray-200 text-gray-400'}`}>
            Add ₹{selectedAmount || customAmount || '0'} to Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 z-50 flex flex-col animate-slide-up transition-all duration-500 ${
      isDarkMode ? 'bg-[#0f172a]' : 'bg-gradient-to-b from-white to-gray-50'
    }`}>
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/4"></div>
        </div>
        <div className="flex items-center justify-between mb-6 relative z-10">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform text-sm font-bold">←</button>
          <h1 className="text-lg font-extrabold text-white">ItzWallet</h1>
          <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </div>
        <div className="text-center relative z-10">
          <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">Available Balance</p>
          <p className="text-4xl font-extrabold text-white mt-2">₹450.00</p>
          <button onClick={() => setShowTopup(true)}
            className="mt-4 bg-white text-indigo-700 px-6 py-2.5 rounded-full text-sm font-bold shadow-lg active:scale-95 transition-transform">
            + Add Money
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 hide-scrollbar pb-8 -mt-6">
        {/* WORLD-CLASS SOVEREIGN CARD PREVIEW */}
        <div className="mb-10 perspective-2000 group">
           <div className={`relative h-56 w-full rounded-[3rem] p-8 overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] animate-float-slow transition-all duration-1000 border-[3px] ${
             isDarkMode ? 'bg-[#0a0a0a] border-amber-500/50' : 'bg-[#0a0a0a] border-amber-400'
           }`}>
              {/* Carbon Fiber Background Pattern */}
              <div className="absolute inset-0 opacity-40 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
              
              {/* Animated Liquid Gold Border Glow */}
              <div className="absolute inset-0 rounded-[3rem] border border-amber-400/20 shadow-[inset_0_0_20px_rgba(245,158,11,0.2)]"></div>
              <div className="absolute inset-0 rounded-[3rem] border border-amber-500/10 animate-pulse"></div>

              {/* Holographic Light Sweep Animation */}
              <div className="absolute -inset-[100%] bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-45 animate-light-sweep pointer-events-none"></div>
              
              {/* Card Content */}
              <div className="relative z-10 h-full flex flex-col justify-between">
                {/* Header: Logo and Chip */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <img src="/logo.png" alt="Official Logo" className="w-12 h-12 object-contain drop-shadow-md" />
                    <div className="h-8 w-[1px] bg-amber-500/30"></div>
                    <div>
                      <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em]">Sovereign</h3>
                      <p className="text-white text-[9px] font-bold uppercase tracking-widest opacity-60">Elite Member</p>
                    </div>
                  </div>
                  
                  {/* Premium Gold Chip */}
                  <div className="w-12 h-9 bg-gradient-to-br from-amber-200 via-amber-500 to-amber-200 rounded-lg shadow-2xl relative overflow-hidden border border-amber-400/50">
                    <div className="absolute inset-0 grid grid-cols-3 gap-0.5 opacity-30">
                      {[...Array(9)].map((_, i) => <div key={i} className="border-[0.5px] border-black/20"></div>)}
                    </div>
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/10"></div>
                  </div>
                </div>

                {/* Center: Brand Name (Stylized) */}
                <div className="text-center py-2">
                   <p className="text-white text-3xl font-black tracking-[0.2em] italic bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent drop-shadow-2xl">EARTHGRAM</p>
                </div>

                {/* Footer: Name and Status */}
                <div className="flex justify-between items-end">
                   <div className="space-y-1">
                      <p className="text-neutral-500 text-[8px] font-black uppercase tracking-[0.3em]">Authorized Sovereign</p>
                      <div className="flex items-center space-x-2">
                         <p className="text-white text-base font-black tracking-widest drop-shadow-2xl uppercase">AMAN SHARMA</p>
                         <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center scale-90 shadow-glow-blue border border-white/20">
                           <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                         </div>
                      </div>
                   </div>
                   <div className="flex flex-col items-end space-y-2">
                      <div className="flex -space-x-3">
                         <div className="w-8 h-8 rounded-full bg-red-500/80 backdrop-blur-sm border border-white/20 shadow-lg"></div>
                         <div className="w-8 h-8 rounded-full bg-amber-500/80 backdrop-blur-sm border border-white/20 shadow-lg"></div>
                      </div>
                      <div className="bg-amber-500/10 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/20">
                        <p className="text-amber-500 text-[7px] font-black uppercase tracking-[0.3em]">Signature Class</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Internal Holographic Reflectors */}
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none"></div>
           </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-4 shadow-premium border border-gray-100/50 flex justify-around mb-4">
          {QUICK_ACTIONS.map((action, i) => (
            <button key={i} className="flex flex-col items-center active:scale-90 transition-transform">
              <div className={`w-11 h-11 ${action.bg} ${action.color} rounded-xl flex items-center justify-center mb-1`}>{action.icon}</div>
              <span className="text-[9px] font-bold text-gray-600">{action.label}</span>
            </button>
          ))}
        </div>

        {/* NEW: Local Coin Collection Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-extrabold text-gray-900">Alliance Coins</h3>
            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">VC Specific</span>
          </div>
          <div className="flex space-x-3 overflow-x-auto hide-scrollbar pb-2">
             {LOCAL_COINS.map(coin => (
               <div key={coin.id} className="min-w-[130px] bg-white rounded-2xl p-3 border border-gray-100 shadow-premium flex flex-col items-center card-lift">
                 <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${coin.color} flex items-center justify-center text-lg shadow-lg mb-2`}>
                   {coin.icon}
                 </div>
                 <p className="text-[10px] font-black text-gray-900 text-center leading-none">{coin.name}</p>
                 <p className="text-[8px] text-gray-400 mt-1 uppercase font-bold tracking-tighter truncate w-full text-center">{coin.provider}</p>
                 <div className="mt-3 w-full bg-gray-50 rounded-lg py-1 flex items-center justify-center space-x-1">
                   <span className="text-xs font-black text-indigo-600">{coin.balance}</span>
                   <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Coins</span>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Transactions */}
        <h3 className="text-sm font-extrabold text-gray-900 mb-3">Recent Transactions</h3>
        <div className="space-y-2">
          {WALLET_TRANSACTIONS.map((txn, i) => (
            <div key={txn.id} className="bg-white p-3.5 rounded-xl border border-gray-100/50 shadow-premium flex items-center space-x-3 card-lift animate-fade-in"
              style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.type === 'credit' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                {TXN_ICONS[txn.icon] || <span className="text-lg">{txn.icon}</span>}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900">{txn.title}</h4>
                <p className="text-[9px] text-gray-400">{txn.date} · {txn.method}</p>
              </div>
              <span className={`text-sm font-extrabold ${txn.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>{txn.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletScreen;
