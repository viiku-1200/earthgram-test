import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CTA_OPTIONS = ['View Profile', 'Order Food', 'Book Appointment', 'Link Shop', 'Custom Website'];
const SCOPE_OPTIONS = ['Local', 'National', 'Global'];
const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Tamil', 'Italian', 'Other'];
const CATEGORY_OPTIONS = ['Food & Tiffin', 'Home Repair', 'Cleaning', 'Transport', 'Beauty', 'Health', 'Education', 'Agriculture', 'Other'];

const UploadReelScreen = ({ isDarkMode, onClose, addUserReel }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=form, 2=success
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);

  const [formData, setFormData] = useState({
    mediaFile: null,
    mediaUrl: null,
    mediaType: null, // 'video' or 'image'
    thumbnail: null,
    caption: '',
    category: 'Food & Tiffin',
    language: 'Hindi',
    scope: 'Local',
    ctaText: 'View Profile',
    ctaLink: '',
    tags: '',
    price: '',
    showPrice: false,
  });

  const mediaInputRef = useRef(null);
  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleMediaSelect = (file) => {
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        mediaFile: file,
        mediaUrl: reader.result,
        mediaType: isVideo ? 'video' : 'image',
        thumbnail: isImage ? reader.result : null,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = () => {
    if (!formData.mediaUrl || !formData.caption.trim()) return;
    setIsPublishing(true);
    setPublishProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setPublishProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Build reel object
          const newReel = {
            id: 'reel_' + Date.now(),
            type: 'reel',
            isUserPost: true,
            username: 'You',
            handle: '@yourhandle',
            avatar: '👤',
            category: formData.category,
            scope: formData.scope.toLowerCase(),
            language: formData.language,
            caption: formData.caption,
            tags: formData.tags.split(' ').filter(t => t.startsWith('#')),
            mediaUrl: formData.mediaUrl,
            mediaType: formData.mediaType,
            thumbnail: formData.thumbnail || formData.mediaUrl,
            ctaText: formData.ctaText,
            ctaLink: formData.ctaLink,
            price: formData.showPrice ? formData.price : null,
            likes: 0,
            comments: 0,
            shares: 0,
            timeAgo: 'Just now',
            isVerified: false,
            gradient: 'from-indigo-800 via-purple-900 to-indigo-900',
            icon: '📹',
          };
          if (addUserReel) addUserReel(newReel);
          setIsPublishing(false);
          setStep(2);
          return 100;
        }
        return prev + 5;
      });
    }, 60);
  };

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
    isDarkMode ? 'bg-slate-800 text-white border border-slate-700 placeholder-slate-500' : 'bg-slate-50 border border-slate-100 text-slate-900'
  }`;
  const labelClass = 'text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block';

  return (
    <div className={`absolute inset-0 z-50 flex flex-col ${isDarkMode ? 'bg-[#0f172a]' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`px-5 pt-12 pb-4 flex items-center justify-between border-b sticky top-0 z-10 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} shadow-sm`}>
        <button onClick={onClose} className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600'}`}>✕</button>
        <h2 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Upload Reel</h2>
        <div className="w-9" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {step === 1 ? (
          <div className="px-5 py-6 space-y-5 pb-10">

            {/* ─── MEDIA PICKER ─── */}
            <div>
              <label className={labelClass}>Select Video or Photo *</label>
              <input
                ref={mediaInputRef}
                type="file"
                accept="video/*,image/*"
                className="hidden"
                onChange={e => handleMediaSelect(e.target.files[0])}
              />
              <div
                onClick={() => mediaInputRef.current.click()}
                className={`relative rounded-3xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform border-2 border-dashed ${
                  formData.mediaUrl
                    ? 'border-transparent'
                    : isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
                }`}
                style={{ height: 220 }}
              >
                {formData.mediaUrl ? (
                  <>
                    {formData.mediaType === 'video' ? (
                      <video
                        src={formData.mediaUrl}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img src={formData.mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center space-y-1">
                      <span className="text-white text-3xl">✅</span>
                      <span className="text-white text-xs font-black uppercase tracking-widest">
                        {formData.mediaType === 'video' ? 'Video' : 'Photo'} Selected
                      </span>
                      <span className="text-white/70 text-[9px] font-bold">Tap to change</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <span className="text-3xl">📹</span>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Tap to Upload</p>
                      <p className={`text-[10px] font-bold mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Video (MP4, max 60s) or Photo</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─── CAPTION ─── */}
            <div>
              <label className={labelClass}>Caption *</label>
              <textarea
                value={formData.caption}
                onChange={e => updateField('caption', e.target.value)}
                placeholder="Write a catchy description... #trending #local"
                rows={3}
                className={`${inputClass} resize-none`}
              />
              <div className="flex justify-between mt-1">
                <span className={`text-[9px] font-bold ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>Add hashtags to reach more people</span>
                <span className={`text-[9px] font-bold ${formData.caption.length > 200 ? 'text-red-400' : isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{formData.caption.length}/250</span>
              </div>
            </div>

            {/* ─── CATEGORY ─── */}
            <div>
              <label className={labelClass}>Service Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map(cat => (
                  <button
                    key={cat}
                    onClick={() => updateField('category', cat)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all active:scale-95 ${
                      formData.category === cat
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-white text-slate-500 border border-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── SCOPE & LANGUAGE ─── */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Reach</label>
                <div className="flex flex-col space-y-2">
                  {SCOPE_OPTIONS.map(opt => (
                    <button key={opt} onClick={() => updateField('scope', opt)} className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${formData.scope === opt ? 'bg-indigo-600 text-white' : isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-white text-slate-500 border border-slate-100'}`}>{opt}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Language</label>
                <div className="flex flex-col space-y-2">
                  {LANGUAGE_OPTIONS.map(opt => (
                    <button key={opt} onClick={() => updateField('language', opt)} className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${formData.language === opt ? 'bg-purple-600 text-white' : isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-white text-slate-500 border border-slate-100'}`}>{opt}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── PRICE TAG ─── */}
            <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Show Price Tag</p>
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Add a price to your service</p>
                </div>
                <button onClick={() => updateField('showPrice', !formData.showPrice)} className={`w-12 h-6 rounded-full p-1 transition-all ${formData.showPrice ? 'bg-emerald-500' : isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${formData.showPrice ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>
              {formData.showPrice && (
                <input
                  type="number"
                  value={formData.price}
                  onChange={e => updateField('price', e.target.value)}
                  placeholder="₹ Enter price"
                  className={inputClass}
                />
              )}
            </div>

            {/* ─── CTA ─── */}
            <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'}`}>
              <label className={labelClass}>Action Button (CTA)</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {CTA_OPTIONS.map(opt => (
                  <button key={opt} onClick={() => updateField('ctaText', opt)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all active:scale-95 ${formData.ctaText === opt ? 'bg-slate-950 text-white' : isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{opt}</button>
                ))}
              </div>
              {(formData.ctaText === 'Link Shop' || formData.ctaText === 'Custom Website') && (
                <input type="url" value={formData.ctaLink} onChange={e => updateField('ctaLink', e.target.value)} placeholder="https://your-shop.com" className={inputClass} />
              )}
            </div>

            {/* ─── PUBLISH BUTTON ─── */}
            {isPublishing ? (
              <div className={`p-5 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-100'}`}>
                <div className="flex justify-between mb-2">
                  <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Uploading & Publishing...</span>
                  <span className="text-xs font-black text-indigo-600">{publishProgress}%</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300" style={{ width: `${publishProgress}%` }}></div>
                </div>
              </div>
            ) : (
              <button
                onClick={handlePublish}
                disabled={!formData.mediaUrl || !formData.caption.trim()}
                className={`w-full py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all ${
                  formData.mediaUrl && formData.caption.trim()
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : isDarkMode ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                🚀 Publish Reel Now
              </button>
            )}
          </div>
        ) : (
          /* ─── SUCCESS SCREEN ─── */
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center space-y-6 animate-fade-in">
            {/* Preview of published reel */}
            {formData.mediaUrl && (
              <div className="w-40 h-40 rounded-3xl overflow-hidden shadow-2xl border-4 border-indigo-500/20">
                {formData.mediaType === 'video'
                  ? <video src={formData.mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                  : <img src={formData.mediaUrl} alt="Published" className="w-full h-full object-cover" />
                }
              </div>
            )}
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/30">🎉</div>
            <div>
              <h2 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Reel Published!</h2>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Your reel is now live in the {formData.scope} feed. Customers can see and interact with it right now.</p>
            </div>
            <div className={`w-full p-4 rounded-2xl text-left space-y-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50 border border-slate-100'}`}>
              <div className="flex justify-between">
                <span className={`text-[10px] font-black uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Category</span>
                <span className={`text-[10px] font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formData.category}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-[10px] font-black uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Reach</span>
                <span className={`text-[10px] font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formData.scope}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-[10px] font-black uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Language</span>
                <span className={`text-[10px] font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formData.language}</span>
              </div>
            </div>
            <div className="flex space-x-3 w-full">
              <button onClick={() => { setStep(1); setFormData({ mediaFile: null, mediaUrl: null, mediaType: null, thumbnail: null, caption: '', category: 'Food & Tiffin', language: 'Hindi', scope: 'Local', ctaText: 'View Profile', ctaLink: '', tags: '', price: '', showPrice: false }); }} className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}>Upload Another</button>
              <button onClick={() => navigate('/reels')} className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-gradient-to-r from-indigo-600 to-purple-600 text-white active:scale-95 transition-transform shadow-lg">View in Reels</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadReelScreen;
