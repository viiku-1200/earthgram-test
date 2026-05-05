import React, { useState, useEffect, useRef } from 'react';
import { getMockResponse } from '../../utils/gemini';
// botAvatar accessed via public path

const ChatScreen = ({ onClose }) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [botMood, setBotMood] = useState('idle');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', text: "Hey! I'm ItzBot, your local guide for Ghaziabad. Need an expert, or just looking for something fun nearby? 😊", time: '10:00 AM' }
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const userText = inputText;
    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText, time: 'Now' }]);
    setInputText('');
    setIsTyping(true);
    setBotMood('thinking');
    const fillerId = Date.now() + 1;
    setChatMessages(prev => [...prev, { id: fillerId, sender: 'bot', text: "Hmm, let me look into that for you...", time: 'Now' }]);
    setBotMood('speaking');
    const replyText = await getMockResponse(userText);
    setChatMessages(prev => prev.map(msg => msg.id === fillerId ? { ...msg, text: replyText } : msg));
    setIsTyping(false);
    setTimeout(() => setBotMood('idle'), 3000);
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white z-50 flex flex-col animate-slide-up">
      {/* Header */}
      <div className="px-4 pt-10 pb-5 flex flex-col items-center relative rounded-b-3xl z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100/50">
        <button onClick={onClose} className="absolute top-10 left-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 active:scale-90 transition-transform">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Dynamic Expression Face */}
        <div className={`w-20 h-20 rounded-full overflow-hidden shadow-premium-lg border-4 border-white transition-all duration-500 relative ${
          botMood === 'speaking' ? 'scale-105' :
          botMood === 'thinking' ? 'scale-100' :
          ''
        }`}>
          <img src="/bot-avatar.png" alt="AI Assistant" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full online-dot"></div>
        </div>

        <h2 className="text-lg font-extrabold text-gray-900 mt-3">ItzBot</h2>
        <p className={`text-[9px] font-bold tracking-widest mt-0.5 transition-colors uppercase ${
          botMood === 'listening' ? 'text-indigo-500' : botMood === 'thinking' ? 'text-amber-500' : 'text-emerald-500'
        }`}>
          {botMood === 'idle' ? 'Online • Ready to help' : botMood === 'listening' ? 'Watching you type...' : botMood === 'thinking' ? 'Thinking...' : 'Replying...'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
        <div className="text-center text-[9px] font-bold text-gray-300 my-2 uppercase tracking-wider">Today</div>
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${
              msg.sender === 'user' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm' : 'bg-white border border-gray-100/50 text-gray-800 rounded-tl-sm shadow-premium'
            }`}>
              <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
              <span className={`text-[8px] mt-1 block text-right font-bold ${msg.sender === 'user' ? 'text-indigo-200' : 'text-gray-300'}`}>{msg.time}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100/50 rounded-2xl rounded-tl-sm p-4 shadow-premium flex space-x-1.5">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Action Chips */}
      <div className="px-3 pb-2 flex overflow-x-auto space-x-2 hide-scrollbar z-20 relative">
        {[
          { text: '✨ Diagnose AC Issue', bg: 'bg-purple-50 text-purple-700 border-purple-100' },
          { text: '✨ Find Local Food', bg: 'bg-orange-50 text-orange-700 border-orange-100' },
          { text: '✨ Gym Advice', bg: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
        ].map((chip, i) => (
          <button key={i} onClick={() => setInputText(chip.text)}
            className={`flex-shrink-0 ${chip.bg} border px-3 py-1.5 rounded-full text-[10px] font-bold active:scale-95 transition-transform whitespace-nowrap`}>
            {chip.text}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="glass p-3 border-t border-gray-100/50 flex items-center pb-8 z-20 relative">
        <button className="text-gray-400 mr-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        </button>
        <div className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 flex items-center border border-gray-200/50">
          <input type="text" value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (e.target.value.length > 0 && botMood !== 'listening' && !isTyping) setBotMood('listening');
              else if (e.target.value.length === 0 && !isTyping) setBotMood('idle');
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..." className="flex-1 bg-transparent outline-none text-sm font-medium" />
          <button className="ml-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </button>
        </div>
        {inputText.trim() ? (
          <button onClick={handleSendMessage} className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white ml-2 shadow-glow-indigo active:scale-90 transition-transform">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
          </button>
        ) : (
          <button className="w-10 h-10 flex items-center justify-center ml-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatScreen;
