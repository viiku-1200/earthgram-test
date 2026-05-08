import React from 'react';
import { useNavigate } from 'react-router-dom';

const ActivityScreen = ({ isDarkMode }) => {
  const navigate = useNavigate();

  const ACTIVITIES = [
    { id: 1, type: 'like', user: 'Aman Sharma', target: 'Your Virtual Company', time: '2m', icon: '❤️', avatar: '👨‍💼', color: 'bg-rose-100 text-rose-600' },
    { id: 2, type: 'order', user: 'Sita Devi', target: 'Fresh Milk Delivery', time: '15m', icon: '📦', avatar: '👩‍🌾', color: 'bg-emerald-100 text-emerald-600' },
    { id: 3, type: 'comment', user: 'Rajesh Kumar', target: 'Agri Tools', time: '1h', icon: '💬', avatar: '👨‍🔧', color: 'bg-blue-100 text-blue-600' },
    { id: 4, type: 'system', user: 'EarthGram Team', target: 'System Update', time: '3h', icon: '🚀', avatar: '🌍', color: 'bg-indigo-100 text-indigo-600' },
    { id: 5, type: 'mention', user: 'Priya Patel', target: 'Village Marketplace', time: '5h', icon: '🏷️', avatar: '👩‍⚕️', color: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <div className={`h-full flex flex-col pt-8 transition-all duration-500 ${
      isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <div className={`px-5 pt-2 pb-4 flex items-center space-x-4 border-b ${
        isDarkMode ? 'bg-[#0f172a]/95 border-slate-800' : 'bg-white border-gray-100'
      }`}>
        <button onClick={() => navigate(-1)}
          className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform text-sm font-bold ${
            isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'
          }`}>←</button>
        <h1 className="text-lg font-black tracking-tight">Activity</h1>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 space-y-4 pb-20 no-scrollbar">
        {/* Date Section */}
        <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${
          isDarkMode ? 'text-slate-500' : 'text-gray-400'
        }`}>New Activity</h2>

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
                  {activity.type === 'like' ? 'liked' : activity.type === 'order' ? 'ordered from' : activity.type === 'comment' ? 'commented on' : 'mentioned you in'}
                </span>
                <span className={`font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {activity.target}
                </span>
              </p>
              <span className={`text-[9px] font-bold uppercase tracking-wider mt-1 block ${
                isDarkMode ? 'text-slate-600' : 'text-gray-400'
              }`}>
                {activity.time} ago
              </span>
            </div>

            {/* Action/View */}
            {activity.type === 'like' && (
              <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden opacity-50 flex items-center justify-center text-[10px] font-black">
                IMG
              </div>
            )}
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
  );
};

export default ActivityScreen;
