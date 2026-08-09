import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { socket } from '../../utils/socket';
import EmojiPicker from 'emoji-picker-react';

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

const AVATAR_GRADIENTS = { '⚡': 'from-amber-400 to-orange-500', '🧹': 'from-emerald-400 to-teal-500', '💄': 'from-pink-400 to-rose-500', '🔧': 'from-indigo-400 to-blue-500', '❄️': 'from-cyan-400 to-blue-500' };
const DEFAULT_GRADIENT = 'from-blue-500 to-indigo-600';
const toUsername = (name) => '@' + name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

const getTheme = (isDark) => ({
  root: isDark ? 'bg-[#060B19]' : 'bg-[#F8FAFC]',
  header: isDark ? 'bg-[#0A1128] border-b border-white/[0.04]' : 'bg-white border-b border-slate-200/60 shadow-sm',
  chatFooter: isDark ? 'bg-[#0A1128] border-t border-white/[0.04]' : 'bg-white border-t border-slate-200/60 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]',
  card: isDark ? 'bg-white/[0.02] border border-white/[0.04]' : 'bg-white border border-slate-200/60 shadow-sm',
  cardHover: isDark ? 'hover:bg-white/[0.04] active:bg-white/[0.06]' : 'hover:bg-slate-50 active:bg-slate-100',
  inputBox: isDark ? 'bg-[#121A30]' : 'bg-slate-100',
  userBubble: isDark ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-900/20' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20',
  providerBubble: isDark ? 'bg-[#121A30] text-white/90 border border-white/[0.03] shadow-sm' : 'bg-white text-slate-800 border border-slate-200/60 shadow-sm',
  textMain: isDark ? 'text-white' : 'text-slate-900',
  textSecondary: isDark ? 'text-white/60' : 'text-slate-500',
  textMuted: isDark ? 'text-white/30' : 'text-slate-400',
  icon: isDark ? 'text-white/50' : 'text-slate-400',
  iconActive: isDark ? 'text-white' : 'text-slate-700',
  accentText: isDark ? 'text-blue-400' : 'text-blue-600',
  divider: isDark ? 'border-white/[0.04]' : 'border-slate-200/60',
});

const Ticks = ({ status, isDark }) => {
  if (status === 'read') return <span className="text-[10px] text-sky-400 ml-1 font-medium">✓✓</span>;
  if (status === 'delivered') return <span className={`text-[10px] ml-1 ${isDark ? 'text-white/30' : 'text-white/60'}`}>✓✓</span>;
  return <span className={`text-[10px] ml-1 ${isDark ? 'text-white/20' : 'text-white/50'}`}>✓</span>;
};

const TypingDots = ({ isDark }) => (
  <div className="flex justify-start animate-fade-in my-1">
    <div className={`${isDark ? 'bg-[#121A30] border border-white/[0.03]' : 'bg-white border border-slate-200/60 shadow-sm'} rounded-2xl rounded-tl-sm px-5 py-3.5 flex items-center space-x-2`}>
      <div className={`w-2 h-2 ${isDark ? 'bg-blue-400' : 'bg-blue-500'} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
      <div className={`w-2 h-2 ${isDark ? 'bg-blue-400' : 'bg-blue-500'} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
      <div className={`w-2 h-2 ${isDark ? 'bg-blue-400' : 'bg-blue-500'} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

const WhatsAppChat = ({ isDarkMode, conversations = [], setConversations, communityGroups = [], overrideActiveConv = null, onCloseOverride = null }) => {
  const t = getTheme(isDarkMode);
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
  const fileInputRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mediaAttachment, setMediaAttachment] = useState(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [addMemberInput, setAddMemberInput] = useState('');

  const activeConv = overrideActiveConv || conversations.find(c => c.id === activeConvId);
  const activeGroup = activeConv?.isGroup ? communityGroups.find(g => g.id === activeConv.groupId) : null;
  const getUserId = () => { const cd = localStorage.getItem('earthgram_company_data'); return cd ? JSON.parse(cd).brandName : 'user_default'; };

  // ── REAL-TIME SOCKET LISTENERS ──
  useEffect(() => {
    socket.emit('get_online_users');
    const onOnline = (users) => setOnlineUsers(users);
    const onOffline = ({ userId }) => setOnlineUsers(p => p.filter(u => u !== userId));
    const onTypingStart = () => setIsTyping(true);
    const onTypingStop = () => setIsTyping(false);
    const onDirect = (msg) => {
      if (setConversations) setConversations(prev => prev.map(c => c.provider === msg.from ? { ...c, messages: [...c.messages, { id: msg.id, sender: 'provider', text: msg.text, media: msg.media, mediaType: msg.mediaType, time: msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'read' }], lastMessage: msg.media ? (msg.mediaType === 'image' ? '📷 Photo' : '🎥 Video') : msg.text, time: 'Just now', unread: (c.unread || 0) + 1 } : c));
      setIsTyping(false);
    };
    const onGroupMsg = (msg) => {
      if (setConversations) setConversations(prev => prev.map(c => {
        if (c.isGroup && c.groupId === msg.groupId) {
          if (c.messages.some(m => m.id === msg.id)) return c;
          return { ...c, messages: [...c.messages, { id: msg.id, sender: msg.from === getUserId() ? 'user' : 'provider', senderName: msg.from, text: msg.text, media: msg.media, mediaType: msg.mediaType, time: msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'read' }], lastMessage: msg.media ? (msg.mediaType === 'image' ? '📷 Photo' : '🎥 Video') : msg.text, time: 'Just now', unread: (c.unread || 0) + 1 };
        }
        return c;
      }));
    };
    const onGroupMsgDeleted = ({ groupId, messageId }) => {
      if (setConversations) setConversations(prev => prev.map(c => (c.isGroup && c.groupId === groupId) ? { ...c, messages: c.messages.filter(m => m.id !== messageId) } : c));
    };

    const onDelivered = ({ messageId }) => { if (setConversations) setConversations(prev => prev.map(c => ({ ...c, messages: c.messages.map(m => m.id === messageId ? { ...m, status: 'delivered' } : m) }))); };
    const onRead = ({ messageId }) => { if (setConversations) setConversations(prev => prev.map(c => ({ ...c, messages: c.messages.map(m => m.id === messageId ? { ...m, status: 'read' } : m) }))); };
    socket.on('online_users', onOnline); socket.on('user_offline_status', onOffline);
    socket.on('typing_start', onTypingStart); socket.on('typing_stop', onTypingStop);
    socket.on('direct_message', onDirect); socket.on('group_message', onGroupMsg); socket.on('group_message_deleted', onGroupMsgDeleted); socket.on('message_delivered', onDelivered); socket.on('message_read', onRead);
    const poll = setInterval(() => socket.emit('get_online_users'), 10000);
    return () => { socket.off('online_users', onOnline); socket.off('user_offline_status', onOffline); socket.off('typing_start', onTypingStart); socket.off('typing_stop', onTypingStop); socket.off('direct_message', onDirect); socket.off('group_message', onGroupMsg); socket.off('group_message_deleted', onGroupMsgDeleted); socket.off('message_delivered', onDelivered); socket.off('message_read', onRead); clearInterval(poll); };
  }, [setConversations]);

  useEffect(() => { localStorage.setItem('earthgram_call_log', JSON.stringify(callLog)); }, [callLog]);
  useEffect(() => { localStorage.setItem('earthgram_my_statuses', JSON.stringify(myStatuses)); }, [myStatuses]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeConv?.messages, isTyping]);
  useEffect(() => { if (activeConvId && setConversations) setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, unread: 0 } : c)); }, [activeConvId]);
  useEffect(() => { if (callConnected) callTimerRef.current = setInterval(() => setCallTimer(timer => timer + 1), 1000); return () => clearInterval(callTimerRef.current); }, [callConnected]);

  const formatCallTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const handleInputChange = (e) => {
    setNewMsg(e.target.value);
    if (activeConv) { socket.emit('typing_start', { to: activeConv.provider, from: getUserId() }); clearTimeout(typingTimeoutRef.current); typingTimeoutRef.current = setTimeout(() => socket.emit('typing_stop', { to: activeConv.provider, from: getUserId() }), 2000); }
  };

  const handleSend = useCallback(() => {
    if ((!newMsg.trim() && !mediaAttachment) || !activeConv) return;
    const text = newMsg; setNewMsg('');
    const media = mediaAttachment?.data || null;
    const mediaType = mediaAttachment?.type || null;
    setMediaAttachment(null);
    setShowEmojiPicker(false);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const id = `m${Date.now()}`;
    socket.emit('typing_stop', { to: activeConv.provider, from: getUserId() });
    
    if (activeConv.isGroup) {
      socket.emit('group_message', { groupId: activeConv.groupId, from: getUserId(), text, media, mediaType, id, time });
    } else {
      socket.emit('direct_message', { to: activeConv.provider, from: getUserId(), text, media, mediaType, id, time });
      socket.emit('send_message', { to: activeConv.provider, text, media, mediaType, from: getUserId(), id, chatId: activeConv.id, senderId: getUserId(), senderName: getUserId() });
    }

    if (setConversations) setConversations(prev => prev.map(c => c.id === activeConv.id ? { ...c, messages: [...c.messages, { id, sender: 'user', senderName: getUserId(), text, media, mediaType, time, status: 'sent' }], lastMessage: media ? (mediaType === 'image' ? '📷 Photo' : '🎥 Video') : text, time: 'Just now' } : c));
    if (!activeConv.isGroup && !onlineUsers.includes(activeConv.provider)) {
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
        if (setConversations) { setConversations(prev => prev.map(c => c.id === activeConv.id ? { ...c, messages: [...c.messages, { id: `m${Date.now()+1}`, sender: 'provider', text: reply, time, status: 'read' }], lastMessage: reply, time: 'Just now' } : c)); setConversations(prev => prev.map(c => ({ ...c, messages: c.messages.map(m => m.id === id ? { ...m, status: 'read' } : m) }))); }
        setIsTyping(false);
      }, 1500 + Math.random() * 1500);
    }
  }, [newMsg, activeConv, activeConvId, setConversations, onlineUsers, mediaAttachment]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setMediaAttachment({ type: file.type.startsWith('image/') ? 'image' : 'video', data: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handlePostStatus = () => { if (!statusInput.trim()) return; setMyStatuses(prev => [{ id: `st_${Date.now()}`, text: statusInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev]); setStatusInput(''); setShowStatusInput(false); };
  const handleDeleteStatus = (sid) => setMyStatuses(prev => prev.filter(s => s.id !== sid));

  const initiateCall = useCallback(async (conv, type) => {
    setCallTarget(conv); setCallType(type); setCallConnected(false); setCallTimer(0); setCallStatus('Calling...'); setShowCallScreen(true); setMicMuted(false); setCameraOn(type === 'video');
    setCallLog(prev => [{ id: `c${Date.now()}`, name: conv.provider, username: toUsername(conv.provider), avatar: conv.avatar || '', type, direction: 'outgoing', time: new Date().toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' }) }, ...prev.slice(0, 19)]);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
      localStream.current = stream; if (localVideoRef.current) localVideoRef.current.srcObject = stream; setCallStatus('Ringing...');
      peerConnection.current = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));
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
  const filteredConvs = useMemo(() => {
    const dms = conversations.filter(c => !c.isGroup);
    if (!searchQuery) return dms;
    const q = searchQuery.toLowerCase();
    return dms.filter(c => c.provider.toLowerCase().includes(q) || toUsername(c.provider).includes(q));
  }, [conversations, searchQuery]);

  // ══ CALL SCREEN ══
  if (showCallScreen && callTarget) {
    const grad = AVATAR_GRADIENTS[callTarget.avatar] || DEFAULT_GRADIENT;
    return (
      <div className={`h-full w-full ${t.root} flex flex-col items-center justify-between relative overflow-hidden animate-fade-in`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-10 blur-3xl`} />
        {callType === 'video' && (<><video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-30" /><div className="absolute top-14 right-4 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-20 bg-black"><video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" /></div></>)}
        <div className="relative z-10 w-full pt-12 px-6 flex items-center"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" /><span className={`${t.textSecondary} text-xs font-medium`}>End-to-end encrypted</span></div></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-28 h-28 bg-gradient-to-br ${grad} rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl mb-5 ${!callConnected ? 'animate-pulse' : ''}`}>{callTarget.provider.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
          <h2 className={`${t.textMain} text-2xl font-bold mb-1`}>{callTarget.provider}</h2>
          <p className={`text-sm font-medium ${callConnected ? t.accentText : t.textMuted}`}>{callConnected ? formatCallTime(callTimer) : callStatus}</p>
        </div>
        <div className="relative z-10 w-full pb-12 px-6"><div className="flex justify-center items-center space-x-6 mb-8">
          <button onClick={toggleMic} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${micMuted ? 'bg-white text-blue-900 shadow-lg' : (isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-700')}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></button>
          <button onClick={endCall} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/30 active:scale-90 transition-transform"><svg className="w-7 h-7 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg></button>
          {callType === 'video' && <button onClick={toggleCamera} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${!cameraOn ? 'bg-white text-blue-900 shadow-lg' : (isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-700')}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>}
          <button className={`w-14 h-14 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-700'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg></button>
        </div></div>
      </div>
    );
  }

  // ══ CHAT THREAD ══
  if (activeConv) {
    const grad = AVATAR_GRADIENTS[activeConv.avatar] || DEFAULT_GRADIENT;
    
    if (showGroupInfo && activeGroup) {
      const isAdmin = activeGroup.adminId === getUserId();
      return (
        <div className={`h-full flex flex-col ${t.root} animate-slide-up z-50`}>
          <div className={`${t.header} px-4 pt-12 pb-4 flex items-center space-x-4 shadow-md`}>
            <button onClick={() => setShowGroupInfo(false)} className={`${t.iconActive} active:scale-90 transition-transform p-1`}><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
            <h2 className={`${t.textMain} text-lg font-black`}>Group Settings</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-4xl text-white shadow-xl mb-4">{activeGroup.avatar}</div>
              <h3 className={`${t.textMain} text-2xl font-black`}>{activeGroup.name}</h3>
              <p className={`${t.textSecondary} text-sm font-bold uppercase tracking-widest mt-1`}>Group • {activeGroup.members?.length || 1} members</p>
            </div>
            
            {isAdmin && (
              <div className={`mb-8 p-5 rounded-3xl border ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-100 shadow-premium'}`}>
                <h4 className={`text-xs font-black uppercase tracking-widest mb-3 ${t.textSecondary}`}>Add Member</h4>
                <div className="flex space-x-2">
                  <input type="text" value={addMemberInput} onChange={e => setAddMemberInput(e.target.value)} placeholder="Enter username..." className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium outline-none ${isDarkMode ? 'bg-slate-900 text-white placeholder-slate-500' : 'bg-slate-50 text-slate-900 placeholder-slate-400'}`} />
                  <button onClick={() => { if(addMemberInput.trim()) { socket.emit('add_group_member', { groupId: activeGroup.id, userId: addMemberInput.trim(), adminId: getUserId() }); setAddMemberInput(''); } }} className="bg-indigo-600 text-white font-bold px-4 rounded-xl active:scale-95 transition-transform">Add</button>
                </div>
              </div>
            )}

            <div>
              <h4 className={`text-xs font-black uppercase tracking-widest mb-4 ml-2 ${t.textSecondary}`}>Group Members</h4>
              <div className="space-y-3">
                {(activeGroup.members || []).map(member => (
                  <div key={member} className={`flex items-center justify-between p-3 rounded-2xl ${isDarkMode ? 'bg-slate-800/40 hover:bg-slate-800' : 'bg-slate-50 hover:bg-slate-100'} transition-colors`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm">{member.substring(0, 2).toUpperCase()}</div>
                      <div>
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{member} {member === getUserId() ? '(You)' : ''}</p>
                        {member === activeGroup.adminId && <span className="text-[9px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-md font-black tracking-wider uppercase">Admin</span>}
                      </div>
                    </div>
                    {isAdmin && member !== getUserId() && (
                      <button onClick={() => socket.emit('remove_group_member', { groupId: activeGroup.id, targetUserId: member, adminId: getUserId() })} className="text-red-500 bg-red-500/10 w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`h-full flex flex-col ${t.root} animate-fade-in`}>
        <div className={`${t.header} px-3 pt-10 pb-3 flex items-center space-x-3 z-10`}>
          <button onClick={() => overrideActiveConv ? (onCloseOverride && onCloseOverride()) : setActiveConvId(null)} className={`${t.iconActive} active:scale-90 transition-transform p-1`}><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
          <div onClick={() => activeConv.isGroup && setShowGroupInfo(true)} className={`w-10 h-10 bg-gradient-to-br ${grad} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-transform`}>
            {activeConv.provider.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div onClick={() => activeConv.isGroup && setShowGroupInfo(true)} className="flex-1 min-w-0 cursor-pointer active:opacity-70 transition-opacity">
            <h2 className={`${t.textMain} text-[15px] font-bold truncate tracking-tight flex items-center space-x-1`}>
              <span>{activeConv.provider}</span>
              {activeConv.isGroup && <svg className={`w-3.5 h-3.5 ${t.textSecondary}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>}
            </h2>
            <p className={`text-[11px] font-medium mt-0.5 ${isTyping ? t.accentText : (onlineUsers.includes(activeConv.provider) ? 'text-blue-500' : t.textSecondary)}`}>{isTyping ? 'typing...' : activeGroup ? `${activeGroup.members?.length || 1} members` : (onlineUsers.includes(activeConv.provider) ? 'online' : `${toUsername(activeConv.provider)}`)}</p>
          </div>
          <button onClick={() => initiateCall(activeConv, 'video')} className={`p-2 active:scale-90 transition-transform ${t.iconActive}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
          <button onClick={() => initiateCall(activeConv, 'audio')} className={`p-2 active:scale-90 transition-transform ${t.iconActive}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5 hide-scrollbar">
          <div className="flex justify-center my-4"><span className={`${isDarkMode ? 'bg-white/5' : 'bg-slate-200'} ${t.textSecondary} text-[10px] font-bold px-3 py-1 rounded-full shadow-sm`}>Today</span></div>
          <div className="flex justify-center mb-6"><div className={`${t.card} ${t.textSecondary} text-[10px] font-medium px-4 py-2 rounded-xl text-center max-w-[280px] leading-relaxed flex items-center justify-center space-x-1.5`}><svg className={`w-3 h-3 ${t.accentText}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg><span>Messages are end-to-end encrypted.</span></div></div>
          {activeConv.messages.map(msg => (
            <div key={msg.id} className={`flex flex-col mb-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
              {activeConv.isGroup && msg.sender !== 'user' && (
                <span className="text-[10px] font-bold text-slate-500 mb-0.5 ml-2">{msg.senderName}</span>
              )}
              <div className="flex items-center space-x-2 group">
                {activeConv.isGroup && activeConv.adminId === getUserId() && msg.sender !== 'user' && (
                  <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => socket.emit('delete_group_message', { groupId: activeConv.groupId, messageId: msg.id, adminId: getUserId() })} className="text-red-400 p-1 active:scale-90" title="Delete message">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    <button onClick={() => socket.emit('remove_group_member', { groupId: activeConv.groupId, targetUserId: msg.senderName, adminId: getUserId() })} className="text-orange-400 p-1 active:scale-90" title="Kick user">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    </button>
                  </div>
                )}
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${msg.sender === 'user' ? t.userBubble + ' rounded-tr-sm' : t.providerBubble + ' rounded-tl-sm'} ${msg.media ? 'p-2' : ''}`}>
                  {msg.media && (
                    <div className="mb-2 rounded-xl overflow-hidden shadow-sm">
                      {msg.mediaType === 'image' ? (
                        <img src={msg.media} alt="Attachment" className="max-w-full h-auto max-h-60 object-contain" />
                      ) : (
                        <video src={msg.media} controls className="max-w-full h-auto max-h-60" />
                      )}
                    </div>
                  )}
                  {msg.text && <p className="text-[14px] leading-relaxed tracking-tight">{msg.text}</p>}
                  <div className="flex items-center justify-end space-x-0.5 mt-1"><span className={`text-[9px] font-medium ${msg.sender === 'user' ? 'text-white/70' : t.textMuted}`}>{msg.time}</span>{msg.sender === 'user' && <Ticks status={msg.status || 'delivered'} isDark={msg.sender === 'user' || isDarkMode} />}</div>
                </div>
              </div>
            </div>
          ))}
          {isTyping && <TypingDots isDark={isDarkMode} />}
          <div ref={chatEndRef} />
        </div>
        <div className="relative">
          {showEmojiPicker && (
            <div className="absolute bottom-full left-2 mb-2 z-50 animate-fade-in shadow-2xl rounded-2xl overflow-hidden border border-slate-200/20">
              <EmojiPicker theme={isDarkMode ? 'dark' : 'light'} onEmojiClick={(eo) => setNewMsg(m => m + eo.emoji)} lazyLoadEmojis />
            </div>
          )}
          {mediaAttachment && (
            <div className={`px-4 py-3 border-t ${t.divider} ${t.root} flex items-center justify-between`}>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-black/10 overflow-hidden flex items-center justify-center">
                  {mediaAttachment.type === 'image' ? <img src={mediaAttachment.data} className="w-full h-full object-cover" /> : <span className="text-2xl">🎥</span>}
                </div>
                <div className="flex flex-col"><span className={`text-xs font-bold ${t.textMain}`}>Attachment</span><span className={`text-[10px] ${t.textSecondary}`}>Ready to send</span></div>
              </div>
              <button onClick={() => setMediaAttachment(null)} className="w-8 h-8 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center active:scale-90"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          )}
          <div className={`${t.chatFooter} px-3 py-3 flex items-center space-x-2 pb-6`}>
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`${t.icon} p-2 hover:bg-white/5 rounded-full transition-colors`}><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
            <div className={`flex-1 ${t.inputBox} rounded-full px-5 py-3 flex items-center shadow-inner relative`}>
              <input type="text" value={newMsg} onChange={handleInputChange} onKeyDown={e => e.key === 'Enter' && handleSend()} onFocus={() => { setShowEmojiPicker(false); window.dispatchEvent(new Event('earthgram_hide_bot')); }} onBlur={() => window.dispatchEvent(new Event('earthgram_show_bot'))} placeholder="Message..." className={`flex-1 bg-transparent outline-none text-sm ${t.textMain} placeholder-${isDarkMode ? 'white/30' : 'slate-400'} font-medium`} />
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className={`${t.icon} ml-2 hover:text-blue-500 transition-colors`}><svg className="w-5 h-5 rotate-45" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
            </div>
            {newMsg.trim() || mediaAttachment ? (
              <button onClick={handleSend} className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform shadow-lg shadow-blue-600/30"><svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg></button>
            ) : (
              <button className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/20"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ══ MAIN TABS ══
  return (
    <div className={`h-full flex flex-col ${t.root} transition-colors duration-300`}>
      <div className="relative pt-10 px-5 pb-2 overflow-hidden">
        {isDarkMode && <div className="absolute inset-0 bg-gradient-to-b from-[#0A1128] to-[#060B19]" />}
        {isDarkMode && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 bg-blue-600/10 rounded-full blur-[80px]" />}
        {!isDarkMode && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-gradient-to-b from-blue-50 to-transparent opacity-60" />}
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div><h1 className={`${t.textMain} text-3xl font-black tracking-tight`}>Messages</h1><p className={`${t.accentText} text-[10px] font-bold uppercase tracking-[0.2em] mt-1 flex items-center space-x-1`}><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg><span>Encrypted</span></p></div>
            <div className="flex items-center space-x-3">
              <button onClick={() => setSearchOpen(!searchOpen)} className={`w-10 h-10 rounded-full ${t.card} flex items-center justify-center ${t.iconActive} active:scale-95 transition-all shadow-sm`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
              <button className={`w-10 h-10 rounded-full ${t.card} flex items-center justify-center ${t.iconActive} shadow-sm`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></button>
            </div>
          </div>
          {searchOpen && (<div className="mb-5 animate-fade-in"><div className={`${t.card} rounded-2xl px-5 py-3.5 flex items-center`}><svg className={`w-4 h-4 ${t.icon} mr-3`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name or username..." className={`flex-1 bg-transparent outline-none text-[13px] ${t.textMain} placeholder-${isDarkMode?'white/20':'slate-400'} font-semibold`} autoFocus /></div></div>)}
          <div className={`flex ${isDarkMode ? 'bg-white/[0.03]' : 'bg-slate-200/50'} rounded-2xl p-1.5 ${t.border}`}>
            {SUB_TABS.map(tab => (<button key={tab} onClick={() => setActiveSubTab(tab)} className={`flex-1 py-2.5 rounded-[12px] text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 flex items-center justify-center ${activeSubTab === tab ? 'bg-white text-blue-900 shadow-md' : t.textSecondary}`}>{tab}{tab === 'Chats' && conversations.filter(c => c.unread > 0).length > 0 && <span className={`ml-2 ${activeSubTab===tab ? 'bg-blue-600 text-white' : 'bg-blue-500/20 text-blue-500'} text-[9px] font-bold px-1.5 py-0.5 rounded-full`}>{conversations.filter(c => c.unread > 0).length}</span>}</button>))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pt-3">
        {/* CHATS */}
        {activeSubTab === 'Chats' && (<div className="animate-fade-in pb-20">
          {filteredConvs.length === 0 ? (<div className="flex flex-col items-center justify-center py-20"><div className={`w-24 h-24 rounded-full ${t.card} flex items-center justify-center mb-6 shadow-sm`}><span className="text-4xl opacity-80">💬</span></div><p className={`${t.textSecondary} text-sm font-semibold`}>No conversations yet</p></div>) : (
            filteredConvs.map((conv, i) => {
              const grad = AVATAR_GRADIENTS[conv.avatar] || DEFAULT_GRADIENT;
              return (
                <button key={conv.id} onClick={() => setActiveConvId(conv.id)} className={`w-full px-5 py-4 flex items-center space-x-4 ${t.cardHover} transition-all text-left animate-fade-in`} style={{ animationDelay: `${i*0.04}s` }}>
                  <div className="relative flex-shrink-0">
                    <div className={`bg-gradient-to-br ${grad} rounded-[1.2rem] flex items-center justify-center text-white text-lg font-black shadow-lg shadow-blue-900/10`} style={{width:'56px',height:'56px'}}>{conv.provider.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                    {(conv.online || onlineUsers.includes(conv.provider)) && <div className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-blue-500 border-4 ${isDarkMode ? 'border-[#060B19]' : 'border-[#F8FAFC]'} rounded-full`} />}
                  </div>
                  <div className="flex-1 min-w-0 border-b pb-4 pt-1" style={{borderColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'}}>
                    <div className="flex justify-between items-center"><div className="min-w-0"><h3 className={`text-[15px] ${conv.unread > 0 ? 'font-black' : 'font-bold'} ${t.textMain} truncate tracking-tight`}>{conv.provider}</h3></div><span className={`text-[11px] flex-shrink-0 font-semibold ${conv.unread > 0 ? t.accentText : t.textMuted}`}>{conv.time}</span></div>
                    <div className="flex items-center justify-between mt-0.5"><p className={`text-[13px] truncate ${conv.unread > 0 ? t.textMain+' font-semibold' : t.textSecondary+' font-medium'} flex items-center`}><Ticks status="delivered" isDark={isDarkMode} /><span className="ml-1.5">{conv.lastMessage}</span></p>{conv.unread > 0 && <span className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center ml-2 shadow-lg shadow-blue-500/30"><span className="text-[10px] font-black text-white">{conv.unread}</span></span>}</div>
                  </div>
                </button>
              );
            })
          )}
        </div>)}

        {/* UPDATES */}
        {activeSubTab === 'Updates' && (<div className="animate-fade-in px-5 pb-20">
          <div className={`flex items-center space-x-4 mb-6 pb-6 border-b ${t.divider}`}>
            <div className="relative"><div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[1.2rem] flex items-center justify-center text-white text-xl font-black shadow-lg shadow-purple-500/20">Y</div><div onClick={() => setShowStatusInput(true)} className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center border-4 ${isDarkMode?'border-[#060B19]':'border-[#F8FAFC]'} shadow-lg cursor-pointer active:scale-90 transition-transform`}><span className="text-white text-sm font-bold">+</span></div></div>
            <div className="flex-1"><h3 className={`${t.textMain} text-[15px] font-bold`}>My Status</h3><p className={`${t.textSecondary} text-[12px] font-medium mt-0.5`}>Tap + to add status update</p></div>
          </div>
          {showStatusInput && (<div className="mb-6 animate-fade-in"><div className={`${t.card} rounded-2xl p-4`}><textarea value={statusInput} onChange={e => setStatusInput(e.target.value)} placeholder="What's on your mind?" className={`w-full bg-transparent outline-none text-[14px] ${t.textMain} placeholder-${isDarkMode?'white/20':'slate-400'} font-medium resize-none h-20`} autoFocus /><div className="flex justify-end space-x-2 mt-3"><button onClick={() => { setShowStatusInput(false); setStatusInput(''); }} className={`px-4 py-2 rounded-xl text-xs font-bold ${t.textSecondary} hover:bg-slate-100 dark:hover:bg-white/5`}>Cancel</button><button onClick={handlePostStatus} className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">Post</button></div></div></div>)}
          {myStatuses.length > 0 && (<div className="mb-6"><h4 className={`${t.accentText} text-[11px] font-black uppercase tracking-[0.2em] mb-4`}>Your Statuses</h4>{myStatuses.map(st => (<div key={st.id} className={`${t.card} rounded-2xl p-4 mb-3 relative group`}><p className={`${t.textMain} text-[14px] font-medium leading-relaxed`}>{st.text}</p><p className={`${t.textMuted} text-[10px] font-bold mt-2 uppercase tracking-wide`}>{st.time}</p><button onClick={() => handleDeleteStatus(st.id)} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button></div>))}</div>)}
          <h4 className={`${t.accentText} text-[11px] font-black uppercase tracking-[0.2em] mb-5`}>Recent Updates</h4>
          {STATUS_DATA.map(status => { const grad = AVATAR_GRADIENTS[status.avatar] || DEFAULT_GRADIENT; return (<div key={status.id} className="flex items-center space-x-4 mb-6 group cursor-pointer"><div className={`w-[68px] h-[68px] rounded-[1.3rem] p-[3px] transition-all group-hover:scale-105 ${status.seen ? (isDarkMode?'bg-white/10':'bg-slate-200') : 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-500/20'}`}><div className={`w-full h-full bg-gradient-to-br ${grad} rounded-[1rem] flex items-center justify-center text-white text-lg font-black border-2 ${isDarkMode?'border-[#060B19]':'border-[#F8FAFC]'}`}>{status.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div></div><div><h3 className={`${t.textMain} text-[15px] font-bold tracking-tight`}>{status.name}</h3><p className={`${t.textSecondary} text-[12px] font-medium mt-0.5`}>{status.username} <span className="mx-1">•</span> {status.time}</p></div></div>); })}
        </div>)}

        {/* CALLS */}
        {activeSubTab === 'Calls' && (<div className="animate-fade-in pb-20">
          <div className={`mx-5 mb-6 p-4 rounded-2xl ${t.card} flex items-center space-x-4`}><div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[1rem] flex items-center justify-center shadow-lg shadow-blue-500/20"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg></div><div><h3 className={`${t.textMain} text-[15px] font-bold`}>Create call link</h3><p className={`${t.textSecondary} text-[12px] font-medium mt-0.5`}>Share a link for EarthGram call</p></div></div>
          <h4 className={`${t.textMuted} text-[11px] font-black uppercase tracking-[0.2em] px-5 mb-4`}>Recent</h4>
          {callLog.map(call => { const grad = AVATAR_GRADIENTS[call.avatar] || DEFAULT_GRADIENT; const miss = call.direction === 'missed'; return (
            <div key={call.id} className={`px-5 py-3.5 flex items-center space-x-4 ${t.cardHover} transition-colors`}>
              <div className={`w-14 h-14 bg-gradient-to-br ${grad} rounded-[1.1rem] flex items-center justify-center text-white text-lg font-black shadow-md shadow-blue-900/10`}>{call.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
              <div className="flex-1 min-w-0"><h3 className={`text-[15px] font-bold truncate ${miss ? 'text-red-500' : t.textMain} tracking-tight`}>{call.name}</h3><div className="flex items-center space-x-1.5 mt-0.5">{call.direction === 'outgoing' ? <svg className={`w-3.5 h-3.5 ${t.accentText}`} viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> : call.direction === 'incoming' ? <svg className={`w-3.5 h-3.5 ${t.accentText}`} viewBox="0 0 24 24"><path d="M17 7L7 17M7 17H17M7 17V7" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> : <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24"><path d="M17 7L7 17M7 17H17M7 17V7" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}<span className={`${t.textSecondary} text-[12px] font-medium`}>{call.time}</span></div></div>
              <button onClick={() => { const cv = conversations.find(c => c.provider === call.name); if (cv) initiateCall(cv, call.type); }} className={`w-11 h-11 rounded-xl ${t.card} flex items-center justify-center ${t.accentText} active:scale-90 transition-all shadow-sm`}>{call.type === 'video' ? <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}</button>
            </div>
          ); })}
        </div>)}
      </div>

      {activeSubTab === 'Chats' && (<div className="absolute bottom-24 right-5 z-20"><button className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/30 active:scale-90 transition-all hover:scale-105"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></button></div>)}
    </div>
  );
};

export default WhatsAppChat;
