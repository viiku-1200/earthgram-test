import React from 'react';
import { COMMUNITY_GROUPS, QUALITY_CHECK_POSTS } from '../../data/constants';

const CommunityScreen = ({ isDarkMode }) => (
  <div className={`h-full flex flex-col pt-8 pb-20 overflow-y-auto hide-scrollbar transition-all duration-500 ${
    isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gradient-to-b from-white to-gray-50/80 text-gray-900'
  }`}>
    {/* Header */}
    <div className="px-5 pt-2 pb-4">
      <h1 className={`text-2xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Community</h1>
      <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Groups, Votes & Accountability</p>
    </div>

    {/* Groups & Alerts */}
    <div className="px-5">
      <div className="flex justify-between items-center mb-3">
        <h2 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Local Groups & Alerts</h2>
        <button className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${
          isDarkMode ? 'text-indigo-400 bg-indigo-500/10' : 'text-indigo-600 bg-indigo-50'
        }`}>+ New Group</button>
      </div>
      <div className="space-y-3">
        {COMMUNITY_GROUPS.map((group, i) => (
          <div key={group.id}
            className={`p-4 rounded-2xl border ${isDarkMode ? 'border-slate-800 bg-slate-900/60' : `${group.border} ${group.bg}`} shadow-premium relative overflow-hidden card-lift animate-fade-in`}
            style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm ${group.type === 'alert' ? 'bg-red-100' : 'bg-blue-100'}`}>
                  {group.icon}
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{group.name}</h3>
                  <p className={`text-[9px] font-medium ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>{group.members}</p>
                </div>
              </div>
              {group.type === 'alert' && (
                <span className="bg-red-600 text-white text-[7px] font-black px-2 py-1 rounded-full uppercase tracking-wider animate-pulse">Vote Active</span>
              )}
            </div>
            <div className={`p-3 rounded-xl mt-3 relative z-10 ${isDarkMode ? 'bg-slate-800/50' : 'glass'}`}>
              <h4 className={`text-xs font-extrabold mb-1 ${group.type === 'alert' ? 'text-red-500' : isDarkMode ? 'text-indigo-400' : 'text-blue-700'}`}>{group.title}</h4>
              <p className={`text-[11px] mb-3 leading-snug ${isDarkMode ? 'text-slate-400' : 'text-gray-700'}`}>{group.desc}</p>
              {group.type === 'alert' ? (
                <div className="flex space-x-2">
                  <button className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white py-2 rounded-xl text-[11px] font-bold shadow-sm active:scale-95 transition-transform">
                    Suspend (89%)
                  </button>
                  <button className={`flex-1 py-2 rounded-xl text-[11px] font-bold active:scale-95 transition-transform border ${
                    isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-gray-700 border-gray-200'
                  }`}>
                    Forgive (11%)
                  </button>
                  <button className={`w-10 flex items-center justify-center rounded-xl border ${
                    isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-gray-600 border-gray-200'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-xl text-[11px] font-bold shadow-glow-indigo flex justify-center items-center space-x-2 active:scale-95 transition-transform">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Reply in Group</span>
                </button>
              )}
            </div>
            <div className="absolute -bottom-4 -right-4 text-6xl opacity-[0.04]">
              {group.type === 'alert' ? '⚖️' : '📢'}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Quality Check Posts */}
    <div className="px-5 mt-6 pb-4">
      <h2 className={`text-sm font-extrabold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quality Checks</h2>
      <div className="space-y-3">
        {QUALITY_CHECK_POSTS.slice(0, 2).map((post, i) => (
          <div key={post.id} className={`rounded-2xl shadow-premium border p-4 card-lift animate-fade-in ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-100/50'
          }`}
            style={{ animationDelay: `${(i + 2) * 0.08}s`, opacity: 0 }}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-[11px] font-bold">
                {post.author.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{post.author}</p>
                <p className={`text-[9px] ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{post.location} · {post.timeAgo}</p>
              </div>
              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${post.verdict === 'approved' ? 'bg-emerald-50 text-emerald-600' : post.verdict === 'unsafe' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                {post.verdict === 'approved' ? '✓ Approved' : post.verdict === 'unsafe' ? '⚠ Unsafe' : '⏳ Pending'}
              </span>
            </div>
            <h4 className={`text-sm font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{post.title}</h4>
            <p className={`text-[11px] leading-snug ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{post.desc}</p>
            <div className={`flex items-center justify-between mt-3 pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-50'}`}>
              <div className={`flex items-center space-x-3 text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                <span>👍 {post.reactions.helpful}</span>
                <span>💬 {post.comments}</span>
              </div>
              <button className={`text-[11px] font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>View Details →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default CommunityScreen;
