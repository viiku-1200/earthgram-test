import React, { useState } from 'react';
import { socket } from '../../utils/socket';
import { COMMUNITY_GROUPS, COUNTRIES } from '../../data/constants';
import WhatsAppChat from './WhatsAppChat';

const CommunityScreen = ({ isDarkMode, qualityPosts = [], setQualityPosts, activeScope = 'local', selectedCountry = 'in', conversations = [], setConversations, communityGroups = [], setCommunityGroups, companyData }) => {
  const [activeSubTab, setActiveSubTab] = useState('explore');
  const [commentInputs, setCommentInputs] = useState({});
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [activeGroupId, setActiveGroupId] = useState(null);

  const getUserId = () => { const cd = localStorage.getItem('earthgram_company_data'); return cd ? JSON.parse(cd).brandName : 'user_default'; };

  // Dynamic country data for filtering
  const selectedCountryData = COUNTRIES.find(c => c.id === selectedCountry);
  const selectedCountryName = selectedCountryData?.name || 'India';
  const selectedCapitalName = selectedCountryData?.capital || 'Ghaziabad';

  // Geospatial filtering logic matching ExploreScreen
  const filteredQualityPosts = qualityPosts.filter(p => {
    if (p.isUserPost) return true;
    if (!p.location) return true;
    if (typeof p.location === 'string') {
      if (activeScope === 'global' || activeScope === 'national') return true;
      if (activeScope === 'city') return true;
      if (activeScope === 'local') return true;
      return true;
    }
    if (activeScope === 'global') return true;
    if (activeScope === 'national') return p.location.country === selectedCountryName;
    if (activeScope === 'city') return p.location.city === selectedCapitalName;
    if (activeScope === 'local') return p.location.neighborhood === 'Sector 4';
    return true;
  });

  // REAL-TIME: Vote Suspend
  const handleVoteSuspend = (postId) => {
    setQualityPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const total = p.votes.suspend + p.votes.forgive;
      const newSuspend = Math.min(p.votes.suspend + 5, 100);
      return { ...p, votes: { suspend: newSuspend, forgive: 100 - newSuspend } };
    }));
  };

  // REAL-TIME: Vote Forgive
  const handleVoteForgive = (postId) => {
    setQualityPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const newForgive = Math.min(p.votes.forgive + 5, 100);
      return { ...p, votes: { suspend: 100 - newForgive, forgive: newForgive } };
    }));
  };

  // REAL-TIME: Star Rating
  const handleRate = (postId, stars) => {
    setQualityPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const newRatings = [...(p.userRatings || []), stars];
      return { ...p, userRatings: newRatings };
    }));
  };

  // REAL-TIME: Post Comment
  const handlePostComment = (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    setQualityPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const newComment = { id: Date.now(), author: 'You', text, time: 'Just now' };
      return { ...p, userComments: [...(p.userComments || []), newComment], comments: (p.comments || 0) + 1 };
    }));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  // Calculate live rating from all user ratings
  const getLiveRating = (post) => {
    const ratings = post.userRatings || [];
    if (ratings.length === 0) return (post.votes.forgive / 20);
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const userId = getUserId();
    const newGroup = {
      id: `group_${Date.now()}`,
      name: newGroupName,
      avatar: ['🥘', '⚽', '🎮', '💼', '🏡', '📚'][Math.floor(Math.random() * 6)],
      adminId: userId,
      members: [userId],
      isGroup: true
    };
    socket.emit('create_group', newGroup);
    setShowCreateGroup(false);
    setNewGroupName('');
  };

  const handleJoinOrChatGroup = (group) => {
    const userId = getUserId();
    if (!group.members.includes(userId)) {
      socket.emit('join_group', { groupId: group.id, userId });
    }
    
    // Check if we already have a conversation for this group
    const existingConv = conversations.find(c => c.provider === group.name && c.isGroup);
    if (!existingConv) {
      const newConv = {
        id: `conv_${group.id}`,
        provider: group.name,
        category: 'Community Group',
        avatar: 'gradient-3',
        messages: [],
        unread: 0,
        isGroup: true,
        groupId: group.id,
        adminId: group.adminId
      };
      setConversations(prev => [newConv, ...prev]);
    }
    
    // Set active group to open it within My Communities tab
    setActiveGroupId(group.id);
  };

  return (
    <div className={`h-full flex flex-col pt-8 pb-20 overflow-y-auto hide-scrollbar transition-all duration-500 ${
      isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gradient-to-b from-white to-gray-50/80 text-gray-900'
    }`}>


      {/* 3-Tab Sub Navigation */}
      <div className="px-5 mb-6">
        <div className={`flex p-1 rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100'}`}>
          {[
            { id: 'explore', label: 'Explore' },
            { id: 'my', label: 'My Communities' },
            { id: 'quality', label: 'Quality Check' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeSubTab === tab.id 
                  ? (isDarkMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white text-indigo-600 shadow-sm')
                  : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600')
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {/* TAB 1: QUALITY CHECK */}
        {activeSubTab === 'quality' && (
          <div className="animate-fade-in px-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Public Jury Cases</h2>
              <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 animate-pulse">Live Enforcement</span>
            </div>
            
            <div className="space-y-8 pb-10">
              {filteredQualityPosts.map((post, i) => {
                const avgRating = getLiveRating(post);
                const isExtreme = post.votes.forgive < 25 || avgRating < 1.5;
                const isGuilty = post.votes.forgive < 50 || avgRating <= 2.0;
                const ratingCount = (post.userRatings || []).length;
                const comments = post.userComments || [];

                return (
                  <div key={post.id} className={`rounded-[2.5rem] shadow-premium-lg border-2 overflow-hidden animate-fade-in ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-100'
                  }`} style={{ animationDelay: `${i * 0.1}s` }}>
                    
                    {/* 1. BEFORE & AFTER IMAGES */}
                    <div className="grid grid-cols-2 gap-1 p-2">
                      <div className="relative aspect-video rounded-[1.5rem] overflow-hidden bg-slate-100 flex items-center justify-center border border-black/5">
                        {post.beforeImage && (
                          post.beforeImage.startsWith('data:') || 
                          post.beforeImage.startsWith('blob:') || 
                          post.beforeImage.startsWith('http') || 
                          post.beforeImage.startsWith('/') || 
                          post.beforeImage.length > 10
                        )
                          ? <img src={post.beforeImage} alt="Before" className="w-full h-full object-cover" />
                          : <span className="text-4xl">{post.beforeImage || '📸'}</span>
                        }
                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">Before</div>
                      </div>
                      <div className="relative aspect-video rounded-[1.5rem] overflow-hidden bg-emerald-50 flex items-center justify-center border border-emerald-500/10">
                        {post.afterImage && (
                          post.afterImage.startsWith('data:') || 
                          post.afterImage.startsWith('blob:') || 
                          post.afterImage.startsWith('http') || 
                          post.afterImage.startsWith('/') || 
                          post.afterImage.length > 10
                        )
                          ? <img src={post.afterImage} alt="After" className="w-full h-full object-cover" />
                          : <span className="text-4xl">{post.afterImage || '📸'}</span>
                        }
                        <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">After</div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* 2. DESCRIPTION */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold">{(post.author || 'U')[0]}</div>
                        <div>
                          <h4 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{post.provider}</h4>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{post.providerCategory} · Quality Check</p>
                        </div>
                      </div>

                      <div className={`p-4 rounded-2xl mb-5 border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                         <h5 className={`text-xs font-black uppercase tracking-tight mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Service Description</h5>
                         <p className={`text-xs leading-relaxed font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{post.desc}</p>
                      </div>

                      {/* 3. INTERACTIVE STAR RATING */}
                      <div className="mb-6">
                        <div className="flex justify-between items-end mb-3">
                          <div>
                             <h5 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Rate This Service</h5>
                             <div className="flex items-center space-x-1">
                               {[1,2,3,4,5].map(star => (
                                 <button key={star} onClick={() => handleRate(post.id, star)} className="active:scale-125 transition-transform">
                                   <span className={`text-xl ${star <= Math.round(avgRating) ? 'text-amber-400 drop-shadow-sm' : isDarkMode ? 'text-slate-700' : 'text-slate-200'}`}>★</span>
                                 </button>
                               ))}
                               <span className={`text-sm font-black ml-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{avgRating.toFixed(1)}</span>
                               <span className="text-[9px] text-slate-400 font-bold">({ratingCount} votes)</span>
                             </div>
                          </div>
                          <div className="text-right">
                             <span className={`text-[10px] font-black uppercase tracking-tight ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Jurors: {ratingCount + 1200}</span>
                          </div>
                        </div>

                        {/* Rating Enforcement Warning / Recognition */}
                        {avgRating > 0 && (
                          <div className={`p-3 rounded-xl mb-4 border transition-all duration-300 ${
                            avgRating < 1.5 
                              ? 'bg-red-100 border-red-300 animate-pulse' 
                              : avgRating <= 2.0 
                                ? 'bg-red-50 border-red-200' 
                                : avgRating <= 3.0
                                  ? 'bg-emerald-50 border-emerald-200'
                                  : 'bg-indigo-50 border-indigo-100'
                          }`}>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${
                              avgRating <= 2.0 ? 'text-red-600' : avgRating <= 3.0 ? 'text-emerald-600' : 'text-indigo-600'
                            }`}>
                              {avgRating < 1.5 
                                ? '🚨 RATING BELOW 1.5 — ACCOUNT TERMINATION WITHIN 7 DAYS' 
                                : avgRating <= 2.0 
                                  ? '🚫 RATING BELOW 2.0 — ACCOUNT SUSPENSION WITHIN 3 DAYS' 
                                  : avgRating <= 3.0
                                    ? '✨ RATING BETWEEN 2.0 & 3.0 — GOOD WORK' 
                                    : '🌟 EXCELLENT WORK — REPUTATION SECURED'}
                            </p>
                          </div>
                        )}

                        {/* 4. SUSPEND VS FORGIVE VOTING */}
                        <h5 className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Community Verdict</h5>
                        <div className="relative h-12 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center mb-4">
                          <div className="absolute inset-y-0 left-0 bg-red-500/15 transition-all duration-700" style={{ width: `${post.votes.suspend}%` }}></div>
                          <div className="absolute inset-0 flex items-center justify-between px-5">
                             <div className="flex flex-col"><span className="text-[9px] font-black uppercase text-red-600">Suspend</span><span className="text-sm font-black text-red-600 leading-none">{post.votes.suspend}%</span></div>
                             <div className="flex flex-col text-right"><span className="text-[9px] font-black uppercase text-emerald-600">Forgive</span><span className="text-sm font-black text-emerald-600 leading-none">{post.votes.forgive}%</span></div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button onClick={() => handleVoteSuspend(post.id)} className="flex-1 bg-slate-950 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl">Suspend</button>
                          <button onClick={() => handleVoteForgive(post.id)} className="flex-1 bg-white border-2 border-slate-100 text-slate-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Forgive</button>
                        </div>
                      </div>

                      {/* 5. ENFORCEMENT STATUS */}
                      <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-500 ${
                        isExtreme 
                          ? 'bg-red-50 border-red-150 text-red-600' 
                          : isGuilty 
                            ? 'bg-amber-50 border-amber-150 text-amber-600' 
                            : 'bg-emerald-50 border-emerald-150 text-emerald-600'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                            isExtreme 
                              ? 'bg-red-500 text-white' 
                              : isGuilty 
                                ? 'bg-amber-500 text-white' 
                                : 'bg-emerald-500 text-white'
                          }`}>{isExtreme ? '🚫' : isGuilty ? '⌛' : '✅'}</div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none">Majority Verdict</p>
                            <p className="text-xs font-black mt-1">
                              {isExtreme 
                                ? 'ACCOUNT TERMINATED' 
                                : isGuilty 
                                  ? 'SUSPENDED (1-DAY)' 
                                  : 'REPUTATION SECURED'}
                            </p>
                          </div>
                        </div>
                        {isGuilty && !isExtreme && <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center animate-spin-slow">⚖️</div>}
                      </div>

                      {/* 6. JURY DISCUSSIONS (Real-Time) */}
                      <div className="mt-6 pt-4 border-t border-slate-100">
                         <div className="flex justify-between items-center mb-3">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Jury Discussion</span>
                            <span className="text-[10px] font-bold text-indigo-600">{(post.comments || 0) + comments.length} comments</span>
                         </div>

                         {/* Existing Comments */}
                         {comments.length > 0 && (
                           <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                             {comments.map(c => (
                               <div key={c.id} className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                 <div className="flex items-center justify-between mb-1">
                                   <span className={`text-[10px] font-black ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{c.author}</span>
                                   <span className="text-[9px] text-slate-400">{c.time}</span>
                                 </div>
                                 <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{c.text}</p>
                               </div>
                             ))}
                           </div>
                         )}

                         {/* Comment Input */}
                         <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">YOU</div>
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                value={commentInputs[post.id] || ''}
                                onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && handlePostComment(post.id)}
                                placeholder="Explain your verdict..."
                                className={`w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border border-slate-100 text-slate-900'}`}
                              />
                              <button onClick={() => handlePostComment(post.id)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-lg active:scale-95 transition-transform">POST</button>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: MY COMMUNITIES */}
        {activeSubTab === 'my' && (
          <div className="animate-fade-in h-full flex flex-col">
            {!activeGroupId ? (
              <div className="px-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>My Service Communities</h2>
                  <button onClick={() => setShowCreateGroup(!showCreateGroup)} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${isDarkMode ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>+ New Group</button>
                </div>
                
                {showCreateGroup && (
                  <div className={`p-4 mb-4 rounded-2xl border flex flex-col space-y-3 animate-fade-in ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100 shadow-premium'}`}>
                    <input 
                      type="text" 
                      value={newGroupName} 
                      onChange={(e) => setNewGroupName(e.target.value)} 
                      placeholder="Group Name (e.g. Weekend Football)" 
                      className={`px-4 py-2.5 rounded-xl text-sm outline-none font-medium ${isDarkMode ? 'bg-slate-900 text-white placeholder-slate-500' : 'bg-slate-50 text-slate-900 placeholder-slate-400'}`} 
                    />
                    <button onClick={handleCreateGroup} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl active:scale-95 transition-transform">Create Group</button>
                  </div>
                )}

                <div className="space-y-4">
                  {communityGroups.length > 0 ? communityGroups.map(group => (
                    <div key={group.id} onClick={() => handleJoinOrChatGroup(group)} className={`p-4 rounded-2xl border shadow-premium flex items-center justify-between cursor-pointer active:scale-95 transition-transform ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl">{group.avatar}</div>
                        <div>
                          <h4 className={`text-sm font-black flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            <span>{group.name}</span>
                            {group.adminId === getUserId() && <span className="bg-amber-500 text-white text-[8px] px-1.5 py-0.5 rounded-md">ADMIN</span>}
                          </h4>
                          <p className="text-[10px] text-indigo-500 font-bold uppercase">{group.members?.length || 1} members</p>
                        </div>
                      </div>
                      <button className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-gray-50 text-gray-400'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  )) : (
                    <div className={`p-8 rounded-3xl border-2 border-dashed flex flex-col items-center text-center ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                      <div className="text-4xl mb-4 opacity-20">🏘️</div>
                      <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>No groups created yet. Be the first to start a community!</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 -mx-0 z-10 relative bg-inherit">
                <WhatsAppChat 
                  isDarkMode={isDarkMode} 
                  conversations={conversations} 
                  setConversations={setConversations} 
                  communityGroups={communityGroups} 
                  overrideActiveConv={conversations.find(c => c.isGroup && c.groupId === activeGroupId)}
                  onCloseOverride={() => setActiveGroupId(null)}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EXPLORE — WhatsApp-Style Chat */}
        {activeSubTab === 'explore' && (
          <div className="animate-fade-in h-full -mx-0 -mb-20">
            <WhatsAppChat isDarkMode={isDarkMode} conversations={conversations} setConversations={setConversations} communityGroups={communityGroups} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityScreen;
