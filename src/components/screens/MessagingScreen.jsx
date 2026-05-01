import React, { useState, useRef, useEffect } from 'react';
import { CONVERSATIONS } from '../../data/constants';

const AVATAR_GRADIENTS = { '⚡': 'from-amber-400 to-orange-500', '🧹': 'from-emerald-400 to-teal-500', '💄': 'from-pink-400 to-rose-500' };

const MessagingScreen = ({ onClose }) => {
  const [activeConv, setActiveConv] = useState(null);
  const [newMsg, setNewMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => { if (activeConv) setMessages(activeConv.messages); }, [activeConv]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    if (!newMsg.trim()) return;
    setMessages(prev => [...prev, { id: `m${Date.now()}`, sender: 'user', text: newMsg, time: 'Now' }]);
    setNewMsg('');
    setTimeout(() => {
      const replies = ['Okay, noted! 👍', "I'll be there soon!", 'Sure, no problem.', 'Thanks for letting me know!', 'Got it! See you then.'];
      setMessages(prev => [...prev, { id: `m${Date.now() + 1}`, sender: 'provider', text: replies[Math.floor(Math.random() * replies.length)], time: 'Now' }]);
    }, 1500);
  };

  // Chat Thread View
  if (activeConv) {
    const grad = AVATAR_GRADIENTS[activeConv.avatar] || 'from-gray-500 to-gray-700';
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white z-50 flex flex-col animate-slide-up">
        <div className="px-5 pt-12 pb-3 flex items-center space-x-3 border-b border-gray-100/50">
          <button onClick={() => setActiveConv(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition-transform text-sm font-bold">←</button>
          <div className={`w-10 h-10 bg-gradient-to-br ${grad} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
            {activeConv.provider.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-gray-900">{activeConv.provider}</h2>
            <p className="text-[10px] text-gray-400 flex items-center">
              {activeConv.service}
              <span className="mx-1">·</span>
              {activeConv.online ? (
                <span className="flex items-center text-emerald-500"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full online-dot mr-1"></span>Online</span>
              ) : (
                <span className="text-gray-400">Offline</span>
              )}
            </p>
          </div>
          <button className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
          <div className="text-center text-[9px] font-bold text-gray-300 my-2 uppercase tracking-wider">Today</div>
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${
                msg.sender === 'user' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm' : 'bg-white border border-gray-100/50 text-gray-800 rounded-tl-sm shadow-premium'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <span className={`text-[8px] mt-1 block text-right font-bold ${msg.sender === 'user' ? 'text-indigo-200' : 'text-gray-300'}`}>{msg.time}</span>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="glass p-3 border-t border-gray-100/50 flex items-center pb-8">
          <button className="text-gray-400 mr-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          </button>
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 flex items-center border border-gray-200/50">
            <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..." className="flex-1 bg-transparent outline-none text-sm font-medium" />
          </div>
          {newMsg.trim() ? (
            <button onClick={handleSend} className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white ml-2 shadow-glow-indigo active:scale-90 transition-transform">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            </button>
          ) : (
            <button className="w-10 h-10 flex items-center justify-center ml-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Conversation List
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 z-50 flex flex-col animate-slide-up">
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition-transform text-sm font-bold">←</button>
            <h1 className="text-xl font-extrabold text-gray-900">Messages</h1>
          </div>
          <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
            {CONVERSATIONS.filter(c => c.unread > 0).length} new
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-8">
        {CONVERSATIONS.map((conv, i) => {
          const grad = AVATAR_GRADIENTS[conv.avatar] || 'from-gray-500 to-gray-700';
          return (
            <button key={conv.id} onClick={() => setActiveConv(conv)}
              className="w-full px-5 py-3.5 flex items-center space-x-3 border-b border-gray-50 active:bg-gray-50 transition-colors text-left animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
              <div className="relative">
                <div className={`w-12 h-12 bg-gradient-to-br ${grad} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                  {conv.provider.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full online-dot"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className={`text-sm ${conv.unread > 0 ? 'font-extrabold text-gray-900' : 'font-bold text-gray-700'}`}>{conv.provider}</h3>
                  <span className="text-[9px] text-gray-400 font-medium">{conv.time}</span>
                </div>
                <p className={`text-[11px] truncate mt-0.5 ${conv.unread > 0 ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <div className="w-5 h-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-[9px] font-bold text-white">{conv.unread}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MessagingScreen;
