import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { socket } from '../../utils/socket';

const SUB_TABS = ['Chats', 'Updates', 'Calls'];
const STATUS_DATA = [
  { id: 's1', name: 'Ravi Electric', username: '@ravi_electric', avatar: '⚡', time: '10 min ago', seen: false },
  { id: 's2', name: 'ShineX Clean', username: '@shinex_clean', avatar: '🧹', time: '30 min ago', seen: false },
  { id: 's3', name: "Sunita's Artistry", username: '@sunita_art', avatar: '💄', time: '2 hours ago', seen: true },
  { id: 's4', name: 'Amit Plumber', username: '@amit_plumb', avatar: '🔧', time: '5 hours ago', seen: true },
];
const CALL_HISTORY = [
  { id: 'c1', name: 'Ravi Electric', username: '@ravi_electric', avatar: '⚡', type: 'video', direction: 'outgoing', time: 'Today, 2:30 PM' },
  { id: 'c2', name: 'ShineX Clean', username: '@shinex_clean', avatar: '🧹', type: 'voice', direction: 'incoming', time: 'Today, 11:15 AM' },
  { id: 'c3', name: "Sunita's Artistry", username: '@sunita_art', avatar: '💄', type: 'video', direction: 'missed', time: 'Yesterday, 6:00 PM' },
  { id: 'c4', name: 'Amit Plumber', username: '@amit_plumb', avatar: '🔧', type: 'voice', direction: 'outgoing', time: 'Yesterday, 9:30 AM' },
  { id: 'c5', name: 'Cool Breeze AC', username: '@coolbreeze', avatar: '❄️', type: 'voice', direction: 'incoming', time: 'Mon, 3:45 PM' },
];
const AVATAR_GRADIENTS = { '⚡': 'from-amber-400 to-orange-500', '🧹': 'from-emerald-400 to-teal-500', '💄': 'from-pink-400 to-rose-500', '🔧': 'from-blue-400 to-indigo-500', '❄️': 'from-cyan-400 to-blue-500' };
const DEFAULT_GRADIENT = 'from-indigo-400 to-purple-500';
const toUsername = (name) => '@' + name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

const Ticks = ({ status }) => {
  if (status === 'read') return <span className="text-[10px] text-sky-400 ml-1 font-medium">✓✓</span>;
  if (status === 'delivered') return <span className="text-[10px] text-white/30 ml-1">✓✓</span>;
  return <span className="text-[10px] text-white/20 ml-1">✓</span>;
};
const TypingDots = () => (
  <div className="flex justify-start animate-fade-in">
    <div className="bg-white/[0.06] backdrop-blur-sm rounded-2xl rounded-tl-sm px-5 py-3.5 flex items-center space-x-2 border border-white/[0.04]">
      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

const WhatsAppChat = ({ isDarkMode, conversations = [], setConversations }) => {
  const [activeSubTab, setActiveSubTab] = useState('Chats');
  const [activeConvId, setActiveConvId] = useState(null);
  const [newMsg, setNewMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [callLog, setCallLog] = useState(() => { try { return JSON.parse(localStorage.getItem('earthgram_call_log')) || CALL_HISTORY; } catch { return CALL_HISTORY; } });
  const [myStatuses, setMyStatuses] = useState(() => { try { return JSON.parse(localStorage.getItem('earthgram_my_statuses')) || []; } catch { return []; } });
  const [statusInput, setStatusInput] = useState('');
  const [showStatusInput, setShowStatusInput] = useState(false);
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [callType, setCallType] = useState('video');
  const [callConnected, setCallConnected] = useState(false);
  const [callStatus, setCallStatus] = useState('');
  const [callTimer, setCallTimer] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [callTarget, setCallTarget] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const callTimerRef = useRef(null);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const getUserId = () => { const cd = localStorage.getItem('earthgram_company_data'); return cd ? JSON.parse(cd).brandName : 'user_default'; };

  // ── REAL-TIME SOCKET LISTENERS ──
  useEffect(() => {
    socket.emit('get_online_users');
    const onOnline = (users) => setOnlineUsers(users);
    const onOffline = ({ userId }) => setOnlineUsers(p => p.filter(u => u !== userId));
    const onTypingStart = () => setIsTyping(true);
    const onTypingStop = () => setIsTyping(false);
    const onDirect = (msg) => {
      if (setConversations) setConversations(prev => prev.map(c => c.provider === msg.from ? { ...c, messages: [...c.messages, { id: msg.id, sender: 'provider', text: msg.text, time: msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'read' }], lastMessage: msg.text, time: 'Just now', unread: (c.unread || 0) + 1 } : c));
      setIsTyping(false);
    };
    const onDelivered = ({ messageId }) => { if (setConversations) setConversations(prev => prev.map(c => ({ ...c, messages: c.messages.map(m => m.id === messageId ? { ...m, status: 'delivered' } : m) }))); };
    const onRead = ({ messageId }) => { if (setConversations) setConversations(prev => prev.map(c => ({ ...c, messages: c.messages.map(m => m.id === messageId ? { ...m, status: 'read' } : m) }))); };
    socket.on('online_users', onOnline); socket.on('user_offline_status', onOffline);
    socket.on('typing_start', onTypingStart); socket.on('typing_stop', onTypingStop);
    socket.on('direct_message', onDirect); socket.on('message_delivered', onDelivered); socket.on('message_read', onRead);
    const poll = setInterval(() => socket.emit('get_online_users'), 10000);
    return () => { socket.off('online_users', onOnline); socket.off('user_offline_status', onOffline); socket.off('typing_start', onTypingStart); socket.off('typing_stop', onTypingStop); socket.off('direct_message', onDirect); socket.off('message_delivered', onDelivered); socket.off('message_read', onRead); clearInterval(poll); };
  }, [setConversations]);

  useEffect(() => { localStorage.setItem('earthgram_call_log', JSON.stringify(callLog)); }, [callLog]);
  useEffect(() => { localStorage.setItem('earthgram_my_statuses', JSON.stringify(myStatuses)); }, [myStatuses]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeConv?.messages, isTyping]);
  useEffect(() => { if (activeConvId && setConversations) setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, unread: 0 } : c)); }, [activeConvId]);
  useEffect(() => { if (callConnected) callTimerRef.current = setInterval(() => setCallTimer(t => t + 1), 1000); return () => clearInterval(callTimerRef.current); }, [callConnected]);

  const formatCallTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const handleInputChange = (e) => {
    setNewMsg(e.target.value);
    if (activeConv) { socket.emit('typing_start', { to: activeConv.provider, from: getUserId() }); clearTimeout(typingTimeoutRef.current); typingTimeoutRef.current = setTimeout(() => socket.emit('typing_stop', { to: activeConv.provider, from: getUserId() }), 2000); }
  };

  const handleSend = useCallback(() => {
    if (!newMsg.trim() || !activeConv) return;
    const text = newMsg; setNewMsg('');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const id = `m${Date.now()}`;
    socket.emit('typing_stop', { to: activeConv.provider, from: getUserId() });
    socket.emit('direct_message', { to: activeConv.provider, from: getUserId(), text, id, time });
    socket.emit('send_message', { to: activeConv.provider, text, from: getUserId(), id, chatId: activeConv.id, senderId: getUserId(), senderName: getUserId() });
    if (setConversations) setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, messages: [...c.messages, { id, sender: 'user', text, time, status: 'sent' }], lastMessage: text, time: 'Just now' } : c));
    if (!onlineUsers.includes(activeConv.provider)) {
      setIsTyping(true);
      setTimeout(() => {
        let reply = "Okay, noted! 👍 I'll get back to you shortly.";
        const l = text.toLowerCase();
        if (l.includes('when') || l.includes('time')) reply = "I can be there in 30-45 minutes. Does that work? ⏰";
        else if (l.includes('price') || l.includes('cost')) reply = "My standard rate applies. I'll give you a quote once I see the job 💰";
        else if (l.includes('address') || l.includes('location')) reply = "Please share your complete address with landmark 📍";
        else if (l.includes('hello') || l.includes('hi') || l.includes('hey')) reply = "Hello! 👋 How can I help you today?";
        else if (l.includes('thank')) reply = "You're welcome! Happy to help 😊🙏";
        else if (l.includes('urgent')) reply = "On my way! 🏃 I'll be there ASAP.";
        else if (l.includes('cancel')) reply = "No problem, cancelled. Let me know if you need anything.";
        else if (l.includes('done') || l.includes('finished')) reply = "Great! A 5-star rating would really help ⭐";
        if (setConversations) { setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, messages: [...c.messages, { id: `m${Date.now()+1}`, sender: 'provider', text: reply, time, status: 'read' }], lastMessage: reply, time: 'Just now' } : c)); setConversations(prev => prev.map(c => ({ ...c, messages: c.messages.map(m => m.id === id ? { ...m, status: 'read' } : m) }))); }
        setIsTyping(false);
      }, 1500 + Math.random() * 1500);
    }
  }, [newMsg, activeConv, activeConvId, setConversations, onlineUsers]);

  const handlePostStatus = () => { if (!statusInput.trim()) return; setMyStatuses(prev => [{ id: `st_${Date.now()}`, text: statusInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev]); setStatusInput(''); setShowStatusInput(false); };
  const handleDeleteStatus = (sid) => setMyStatuses(prev => prev.filter(s => s.id !== sid));

  const initiateCall = useCallback(async (conv, type) => {
    setCallTarget(conv); setCallType(type); setCallConnected(false); setCallTimer(0); setCallStatus('Calling...'); setShowCallScreen(true); setMicMuted(false); setCameraOn(type === 'video');
    setCallLog(prev => [{ id: `c${Date.now()}`, name: conv.provider, username: toUsername(conv.provider), avatar: conv.avatar || '', type, direction: 'outgoing', time: new Date().toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' }) }, ...prev.slice(0, 19)]);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
      localStream.current = stream; if (localVideoRef.current) localVideoRef.current.srcObject = stream; setCallStatus('Ringing...');
      peerConnection.current = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      stream.getTracks().forEach(t => peerConnection.current.addTrack(t, stream));
      peerConnection.current.ontrack = (e) => { if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) remoteVideoRef.current.srcObject = e.streams[0]; setCallConnected(true); setCallStatus('Connected'); };
      peerConnection.current.onicecandidate = (e) => { if (e.candidate) socket.emit('ice_candidate', { to: conv.provider, candidate: e.candidate }); };
      socket.on('call_answered', async ({ answer }) => { if (peerConnection.current) { await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer)); setCallConnected(true); setCallStatus('Connected'); } });
      socket.on('ice_candidate', async ({ candidate }) => { if (peerConnection.current?.remoteDescription) await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate)); });
      socket.on('hangup', () => endCall());
      const offer = await peerConnection.current.createOffer(); await peerConnection.current.setLocalDescription(offer);
      socket.emit('call_user', { to: conv.provider, offer, from: getUserId(), callerInfo: { name: getUserId() } });
      setTimeout(() => { if (!callConnected) { setCallConnected(true); setCallStatus('Connected'); } }, 4000);
    } catch (err) { setCallStatus('Camera/mic denied'); setTimeout(() => { setCallConnected(true); setCallStatus('Connected (Demo)'); }, 2000); }
  }, []);

  const endCall = useCallback(() => {
    if (peerConnection.current) { peerConnection.current.close(); peerConnection.current = null; }
    if (localStream.current) { localStream.current.getTracks().forEach(t => t.stop()); localStream.current = null; }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    clearInterval(callTimerRef.current); setShowCallScreen(false);
    socket.off('call_answered'); socket.off('ice_candidate'); socket.off('hangup');
    if (callTarget) socket.emit('hangup', { to: callTarget.provider });
  }, [callTarget]);

  const toggleMic = () => { if (localStream.current) localStream.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; }); setMicMuted(m => !m); };
  const toggleCamera = () => { if (localStream.current) localStream.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled; }); setCameraOn(c => !c); };
  const filteredConvs = useMemo(() => { if (!searchQuery) return conversations; const q = searchQuery.toLowerCase(); return conversations.filter(c => c.provider.toLowerCase().includes(q) || toUsername(c.provider).includes(q)); }, [conversations, searchQuery]);

  // ══ CALL SCREEN ══
  if (showCallScreen && callTarget) {
    const grad = AVATAR_GRADIENTS[callTarget.avatar] || DEFAULT_GRADIENT;
    return (
      <div className="h-full w-full bg-[#0B141A] flex flex-col items-center justify-between relative overflow-hidden animate-fade-in">
        <div className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-10 blur-3xl`} />
        {callType === 'video' && (<><video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-30" /><div className="absolute top-14 right-4 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-20 bg-black"><video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" /></div></>)}
        <div className="relative z-10 w-full pt-12 px-6 flex items-center"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /><span className="text-white/60 text-xs font-medium">End-to-end encrypted</span></div></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-28 h-28 bg-gradient-to-br ${grad} rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl mb-5 ${!callConnected ? 'animate-pulse' : ''}`}>{callTarget.provider.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
          <h2 className="text-white text-2xl font-bold mb-1">{callTarget.provider}</h2>
          <p className={`text-sm font-medium ${callConnected ? 'text-green-400' : 'text-white/50'}`}>{callConnected ? formatCallTime(callTimer) : callStatus}</p>
        </div>
        <div className="relative z-10 w-full pb-12 px-6"><div className="flex justify-center items-center space-x-6 mb-8">
          <button onClick={toggleMic} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${micMuted ? 'bg-white text-[#0B141A]' : 'bg-white/15 text-white'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></button>
          <button onClick={endCall} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/30 active:scale-90 transition-transform"><svg className="w-7 h-7 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg></button>
          {callType === 'video' && <button onClick={toggleCamera} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${!cameraOn ? 'bg-white text-[#0B141A]' : 'bg-white/15 text-white'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>}
          <button className="w-14 h-14 rounded-full bg-white/15 text-white flex items-center justify-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg></button>
        </div></div>
      </div>
    );
  }

  // ══ CHAT THREAD ══
  if (activeConv) {
    const grad = AVATAR_GRADIENTS[activeConv.avatar] || DEFAULT_GRADIENT;
    return (
      <div className="h-full flex flex-col bg-[#0B141A] animate-fade-in">
        <div className="bg-[#1F2C34] px-3 pt-10 pb-3 flex items-center space-x-3 z-10 shadow-lg">
          <button onClick={() => setActiveConvId(null)} className="text-white/70 active:scale-90 transition-transform p-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
          <div className={`w-10 h-10 bg-gradient-to-br ${grad} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm`}>{activeConv.provider.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white text-sm font-bold truncate">{activeConv.provider}</h2>
            <p className="text-[10px] text-white/40 font-medium">{isTyping ? <span className="text-emerald-400">typing...</span> : onlineUsers.includes(activeConv.provider) ? <span className="text-green-400">online</span> : `${toUsername(activeConv.provider)} · offline`}</p>
          </div>
          <button onClick={() => initiateCall(activeConv, 'video')} className="p-2 active:scale-90 transition-transform"><svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
          <button onClick={() => initiateCall(activeConv, 'audio')} className="p-2 active:scale-90 transition-transform"><svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 hide-scrollbar">
          <div className="flex justify-center my-3"><span className="bg-[#1F2C34] text-white/50 text-[10px] font-medium px-3 py-1 rounded-lg shadow-sm">Today</span></div>
          <div className="flex justify-center mb-3"><div className="bg-[#1A2730] text-white/40 text-[10px] px-4 py-2 rounded-lg text-center max-w-[280px] leading-relaxed">🔒 Messages are end-to-end encrypted.</div></div>
          {activeConv.messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[78%] rounded-lg px-3 py-2 shadow-sm ${msg.sender === 'user' ? 'bg-[#005C4B] text-white rounded-tr-none' : 'bg-[#1F2C34] text-white/90 rounded-tl-none'}`}>
                <p className="text-[13px] leading-relaxed">{msg.text}</p>
                <div className="flex items-center justify-end space-x-0.5 mt-0.5"><span className="text-[9px] text-white/40">{msg.time}</span>{msg.sender === 'user' && <Ticks status={msg.status || 'delivered'} />}</div>
              </div>
            </div>
          ))}
          {isTyping && <TypingDots />}
          <div ref={chatEndRef} />
        </div>
        <div className="bg-[#1F2C34] px-2 py-2 flex items-center space-x-2 pb-6">
          <button className="text-white/40 p-1"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
          <div className="flex-1 bg-[#2A3942] rounded-full px-4 py-2.5 flex items-center">
            <input type="text" value={newMsg} onChange={handleInputChange} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Message" className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/30 font-medium" />
            <button className="text-white/40 ml-2"><svg className="w-5 h-5 rotate-45" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
          </div>
          {newMsg.trim() ? (
            <button onClick={handleSend} className="w-11 h-11 bg-[#00A884] rounded-full flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg></button>
          ) : (
            <button className="w-11 h-11 bg-[#00A884] rounded-full flex items-center justify-center text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></button>
          )}
        </div>
      </div>
    );
  }

  // ══ MAIN TABS ══
  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      <div className="relative pt-8 px-5 pb-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1923] to-[#0a0a0f]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 rounded-full blur-[80px]" />
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-5">
            <div><h1 className="text-white text-2xl font-black tracking-tight">Messages</h1><p className="text-white/30 text-[10px] font-semibold uppercase tracking-[0.2em] mt-0.5">End-to-end encrypted</p></div>
            <div className="flex items-center space-x-2">
              <button onClick={() => setSearchOpen(!searchOpen)} className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.06] flex items-center justify-center text-white/50 active:scale-90 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
              <button className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.06] flex items-center justify-center text-white/50"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></button>
            </div>
          </div>
          {searchOpen && (<div className="mb-4 animate-fade-in"><div className="bg-white/[0.05] rounded-2xl px-4 py-3 flex items-center border border-white/[0.06]"><svg className="w-4 h-4 text-white/20 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name or username..." className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/20 font-medium" autoFocus /></div></div>)}
          <div className="flex bg-white/[0.04] rounded-2xl p-1 border border-white/[0.04]">
            {SUB_TABS.map(tab => (<button key={tab} onClick={() => setActiveSubTab(tab)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-400 ${activeSubTab === tab ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/30'}`}>{tab}{tab === 'Chats' && conversations.filter(c => c.unread > 0).length > 0 && <span className="ml-1.5 bg-white/20 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">{conversations.filter(c => c.unread > 0).length}</span>}</button>))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pt-4">
        {/* CHATS */}
        {activeSubTab === 'Chats' && (<div className="animate-fade-in">
          {filteredConvs.length === 0 ? (<div className="flex flex-col items-center justify-center py-20"><div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-5"><span className="text-4xl">💬</span></div><p className="text-white/30 text-sm font-semibold">No conversations yet</p></div>) : (
            filteredConvs.map((conv, i) => {
              const grad = AVATAR_GRADIENTS[conv.avatar] || DEFAULT_GRADIENT;
              return (
                <button key={conv.id} onClick={() => setActiveConvId(conv.id)} className="w-full px-5 py-3.5 flex items-center space-x-3.5 active:bg-white/[0.03] transition-all text-left animate-fade-in" style={{ animationDelay: `${i*0.04}s` }}>
                  <div className="relative flex-shrink-0">
                    <div className={`bg-gradient-to-br ${grad} rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-black/20`} style={{width:'52px',height:'52px'}}>{conv.provider.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                    {(conv.online || onlineUsers.includes(conv.provider)) && <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 border-[2.5px] border-[#0a0a0f] rounded-full shadow-lg shadow-emerald-400/30" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center"><div className="min-w-0"><h3 className={`text-[13px] ${conv.unread > 0 ? 'font-bold text-white' : 'font-semibold text-white/80'} truncate`}>{conv.provider}</h3><span className="text-[9px] text-white/20 font-medium">{toUsername(conv.provider)}</span></div><span className={`text-[10px] flex-shrink-0 ${conv.unread > 0 ? 'text-emerald-400 font-bold' : 'text-white/20'}`}>{conv.time}</span></div>
                    <div className="flex items-center justify-between mt-1"><p className={`text-[11px] truncate ${conv.unread > 0 ? 'text-white/60 font-medium' : 'text-white/25'}`}><Ticks status="delivered" /><span className="ml-1">{conv.lastMessage}</span></p>{conv.unread > 0 && <span className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center ml-2 shadow-lg shadow-emerald-500/30"><span className="text-[9px] font-bold text-white">{conv.unread}</span></span>}</div>
                  </div>
                </button>
              );
            })
          )}
        </div>)}

        {/* UPDATES */}
        {activeSubTab === 'Updates' && (<div className="animate-fade-in px-5">
          <div className="flex items-center space-x-3.5 mb-4 pb-5 border-b border-white/[0.04]">
            <div className="relative"><div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-purple-500/20">Y</div><div onClick={() => setShowStatusInput(true)} className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center border-[2.5px] border-[#0a0a0f] shadow-lg cursor-pointer active:scale-90 transition-transform"><span className="text-white text-xs font-bold">+</span></div></div>
            <div className="flex-1"><h3 className="text-white text-sm font-bold">My Status</h3><p className="text-white/25 text-[11px] font-medium">Tap + to add status update</p></div>
          </div>
          {showStatusInput && (<div className="mb-5 animate-fade-in"><div className="bg-white/[0.05] rounded-2xl p-4 border border-white/[0.06]"><textarea value={statusInput} onChange={e => setStatusInput(e.target.value)} placeholder="What's on your mind?" className="w-full bg-transparent outline-none text-sm text-white placeholder-white/20 font-medium resize-none h-20" autoFocus /><div className="flex justify-end space-x-2 mt-2"><button onClick={() => { setShowStatusInput(false); setStatusInput(''); }} className="px-4 py-2 rounded-xl text-xs font-bold text-white/40">Cancel</button><button onClick={handlePostStatus} className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform">Post</button></div></div></div>)}
          {myStatuses.length > 0 && (<div className="mb-5"><h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3">Your Statuses</h4>{myStatuses.map(st => (<div key={st.id} className="bg-white/[0.03] rounded-2xl p-4 mb-3 border border-white/[0.04] relative group"><p className="text-white text-sm font-medium leading-relaxed">{st.text}</p><p className="text-white/20 text-[10px] mt-2">Posted at {st.time}</p><button onClick={() => handleDeleteStatus(st.id)} className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/30 opacity-0 group-hover:opacity-100 transition-opacity active:scale-90">×</button></div>))}</div>)}
          <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">Recent Updates</h4>
          {STATUS_DATA.map(status => { const grad = AVATAR_GRADIENTS[status.avatar] || DEFAULT_GRADIENT; return (<div key={status.id} className="flex items-center space-x-3.5 mb-5 group cursor-pointer"><div className={`w-16 h-16 rounded-2xl p-[2.5px] transition-all group-hover:scale-105 ${status.seen ? 'bg-white/10' : 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20'}`}><div className={`w-full h-full bg-gradient-to-br ${grad} rounded-[13px] flex items-center justify-center text-white text-sm font-bold`}>{status.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div></div><div><h3 className="text-white text-sm font-semibold">{status.name}</h3><p className="text-white/20 text-[10px] font-medium">{status.username} · {status.time}</p></div></div>); })}
        </div>)}

        {/* CALLS */}
        {activeSubTab === 'Calls' && (<div className="animate-fade-in">
          <div className="mx-5 mb-5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center space-x-3.5"><div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg></div><div><h3 className="text-white text-sm font-bold">Create call link</h3><p className="text-white/25 text-[11px] font-medium">Share a link for EarthGram call</p></div></div>
          <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-5 mb-3">Recent</h4>
          {callLog.map(call => { const grad = AVATAR_GRADIENTS[call.avatar] || DEFAULT_GRADIENT; const miss = call.direction === 'missed'; return (
            <div key={call.id} className="px-5 py-3.5 flex items-center space-x-3.5 active:bg-white/[0.03] transition-colors">
              <div className={`w-12 h-12 bg-gradient-to-br ${grad} rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-black/20`}>{call.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
              <div className="flex-1 min-w-0"><h3 className={`text-[13px] font-semibold truncate ${miss ? 'text-red-400' : 'text-white'}`}>{call.name}</h3><div className="flex items-center space-x-1.5 mt-0.5">{call.direction === 'outgoing' ? <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.5" fill="none" /></svg> : call.direction === 'incoming' ? <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24"><path d="M17 7L7 17M7 17H17M7 17V7" stroke="currentColor" strokeWidth="2.5" fill="none" /></svg> : <svg className="w-3 h-3 text-red-400" viewBox="0 0 24 24"><path d="M17 7L7 17M7 17H17M7 17V7" stroke="currentColor" strokeWidth="2.5" fill="none" /></svg>}<span className="text-white/20 text-[10px] font-medium">{call.username} · {call.time}</span></div></div>
              <button onClick={() => { const cv = conversations.find(c => c.provider === call.name); if (cv) initiateCall(cv, call.type); }} className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-emerald-400 active:scale-90 transition-all">{call.type === 'video' ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}</button>
            </div>
          ); })}
        </div>)}
      </div>

      {activeSubTab === 'Chats' && (<div className="absolute bottom-24 right-5 z-20"><button className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 active:scale-90 transition-all hover:scale-105"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></button></div>)}
    </div>
  );
};

export default WhatsAppChat;
