import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ActivityScreen = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [selectedReward, setSelectedReward] = useState(null);

  const ACTIVITIES = [
    { id: 1, type: 'chat', user: 'Dr. Rajesh Kumar', target: 'Booking Inquiry', time: '1m', icon: '💬', avatar: '👨‍⚕️', color: 'bg-indigo-100 text-indigo-600', message: "Hello! Are you coming for the checkup today?", reward: 10 },
    { id: 2, type: 'like', user: 'Aman Sharma', target: 'Your Virtual Company', time: '5m', icon: '❤️', avatar: '👨‍💼', color: 'bg-rose-100 text-rose-600' },
    { id: 3, type: 'order', user: 'Sita Devi', target: 'Fresh Milk Delivery', time: '15m', icon: '📦', avatar: '👩‍🌾', color: 'bg-emerald-100 text-emerald-600', reward: 25 },
    { id: 4, type: 'chat', user: 'Green Harvest', target: 'Order #4592', time: '1h', icon: '💬', avatar: '🚜', color: 'bg-indigo-100 text-indigo-600', message: "Your tractor rental has been confirmed.", reward: 5 },
    { id: 5, type: 'system', user: 'EarthGram Team', target: 'System Update', time: '3h', icon: '🚀', avatar: '🌍', color: 'bg-indigo-100 text-indigo-600' },
  ];

  return (
    <div className={`h-full flex flex-col pt-8 transition-all duration-500 ${
      isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* REWARD DETAIL MODAL */}
      {selectedReward && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedReward(null)}></div>
          <div className={`relative w-full max-w-xs p-8 rounded-[3rem] shadow-premium-2xl animate-scale-in border ${
            isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-5 animate-bounce-subtle shadow-inner border-2 ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-amber-50 border-amber-100'
              }`}>
                🪙
              </div>
              <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reward Detail</h2>
              <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] mt-2">Verified Hub Asset</p>
              
              <div className="w-full mt-8 space-y-5">
                <div className={`flex justify-between items-center py-3.5 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-50'}`}>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Provider</span>
                  <span className={`text-[13px] font-black ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{selectedReward.user || selectedReward.name}</span>
                </div>
                <div className={`flex justify-between items-center py-3.5 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-50'}`}>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Amount</span>
                  <span className="text-lg font-black text-amber-500">+{selectedReward.reward || selectedReward.balance} Coins</span>
                </div>
                {selectedReward.time && (
                  <div className={`flex justify-between items-center py-3.5 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-50'}`}>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Recorded</span>
                    <span className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{selectedReward.time} ago</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3.5">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Auth Hub</span>
                  <div className="flex items-center space-x-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Secured</span>
                  </div>
                </div>
              </div>

              <button onClick={() => setSelectedReward(null)} className="mt-8 w-full py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] active:scale-95 transition-transform shadow-glow-indigo">
                Close Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`px-5 pt-2 pb-4 flex items-center justify-between border-b ${
        isDarkMode ? 'bg-[#0f172a]/95 border-slate-800' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)}
            className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform text-sm font-bold ${
              isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'
            }`}>←</button>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-black tracking-tight text-gray-900">Hub</h1>
            <span className="text-xl animate-spin-slow">❤️</span>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-2xl flex items-center space-x-2 shadow-premium-sm">
          <span className="text-sm font-black text-amber-600">230</span>
          <span className="text-sm">🪙</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-20">
        {/* NEW: Coin Portfolio Summary */}
        <div className="px-5 pt-6 mb-6">
          <div className={`p-5 rounded-[2rem] border overflow-hidden relative ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-premium'
          }`}>
             <div className="absolute top-0 right-0 p-4 opacity-5 scale-150">🪙</div>
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Local Wealth Portfolio</h3>
             <div className="flex space-x-4 overflow-x-auto hide-scrollbar py-1">
                {[
                  { name: 'Dr. Rajesh', balance: 50, color: 'from-indigo-500 to-purple-600', icon: '🩺' },
                  { name: 'Green Harvest', balance: 120, color: 'from-emerald-500 to-teal-600', icon: '🌾' },
                  { name: 'Digital Sol.', balance: 15, color: 'from-blue-500 to-cyan-600', icon: '💻' },
                  { name: 'Iron Gym', balance: 45, color: 'from-orange-500 to-red-600', icon: '💪' },
                ].map((coin, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedReward(coin)}
                    className="flex flex-col items-center space-y-1.5 min-w-[60px] active:scale-90 transition-transform">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${coin.color} flex items-center justify-center text-sm shadow-md`}>
                      {coin.icon}
                    </div>
                    <span className={`text-[10px] font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{coin.balance}</span>
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className="px-5 space-y-4">
          {/* Date Section */}
          <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${
            isDarkMode ? 'text-slate-500' : 'text-gray-400'
          }`}>Recent Feed</h2>

        {ACTIVITIES.map((activity, i) => (
          <div key={activity.id} className={`flex items-center space-x-4 p-4 rounded-3xl border transition-all animate-fade-in ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-100 shadow-premium-sm'
          }`} style={{ animationDelay: `${i * 0.1}s` }}>
            
            {/* Avatar with Icon Badge */}
            <div className="relative">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'
              }`}>
                {activity.avatar}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-sm border-2 ${
                isDarkMode ? 'border-slate-900' : 'border-white'
              } ${activity.color}`}>
                {activity.icon}
              </div>
            </div>

            {/* Activity Info */}
            <div className="flex-1">
              <p className="text-xs leading-snug">
                <span className="font-black">{activity.user}</span>
                <span className={`mx-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  {activity.type === 'like' ? 'liked' : activity.type === 'order' ? 'ordered from' : activity.type === 'chat' ? 'sent you a message:' : 'mentioned you in'}
                </span>
                <span className={`font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {activity.target}
                </span>
              </p>
              
              {activity.message && (
                <p className={`text-[10px] italic mt-1.5 p-2 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                  "{activity.message}"
                </p>
              )}

              <span className={`text-[9px] font-bold uppercase tracking-wider mt-2 block ${
                isDarkMode ? 'text-slate-600' : 'text-gray-400'
              }`}>
                {activity.time} ago
              </span>
            </div>

            {/* Action/View */}
            <div className="flex flex-col items-end space-y-2">
              {activity.reward && (
                <button 
                  onClick={() => setSelectedReward(activity)}
                  className="bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg flex items-center space-x-1 shadow-sm animate-bounce-subtle active:scale-90 transition-transform">
                  <span className="text-[10px] font-black text-amber-600">+{activity.reward}</span>
                  <span className="text-[10px]">🪙</span>
                </button>
              )}
              
              {activity.type === 'chat' && (
                <button onClick={() => navigate('/messages')} className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform shadow-md">
                  Reply
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Suggestion Section */}
        <div className={`mt-8 p-6 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center text-center ${
          isDarkMode ? 'border-slate-800 bg-slate-900/20' : 'border-gray-100 bg-gray-50'
        }`}>
          <span className="text-4xl mb-3">🤝</span>
          <h3 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Connect with Neighbors</h3>
          <p className="text-[10px] text-gray-500 mt-1 mb-4 uppercase tracking-wider">Expand your network to see more activity</p>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform shadow-md">
            Find Friends
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityScreen;
