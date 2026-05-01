import React, { useState } from 'react';

const UploadReelScreen = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    videoFile: null,
    caption: '',
    language: 'English',
    scope: 'National',
    ctaText: 'View Profile',
    ctaLink: ''
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePublish = () => {
    setStep(2); // Success step
  };

  const CTA_OPTIONS = [
    'View Profile',
    'Order Food',
    'Book Appointment',
    'Link Shop',
    'Custom Website'
  ];

  const SCOPE_OPTIONS = ['Local', 'National', 'Global'];
  const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Tamil', 'Italian', 'Other'];

  return (
    <div className="absolute inset-0 bg-gray-50 z-50 flex flex-col animate-slide-up">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition-transform">
          ✕
        </button>
        <h2 className="text-sm font-extrabold text-gray-900">Upload New Reel</h2>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {step === 1 ? (
          <>
            {/* Video Upload Mock */}
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Select Video *</label>
              <div 
                className={`border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer transition-colors ${formData.videoFile ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                onClick={() => updateField('videoFile', 'video.mp4')}
              >
                {formData.videoFile ? (
                  <>
                    <span className="text-4xl mb-2">✅</span>
                    <span className="text-sm font-bold text-indigo-700">Video Selected</span>
                    <span className="text-[10px] text-indigo-500 mt-1">Tap to change</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl mb-2">📹</span>
                    <span className="text-sm font-bold text-gray-600">Tap to upload video</span>
                    <span className="text-[10px] text-gray-400 mt-1">MP4, max 30 seconds</span>
                  </>
                )}
              </div>
            </div>

            {/* Caption */}
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">Caption</label>
              <textarea 
                value={formData.caption}
                onChange={(e) => updateField('caption', e.target.value)}
                placeholder="Write a catchy description... #trending"
                className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-indigo-400 transition-colors resize-none h-24"
              />
            </div>

            {/* Scope & Language */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2 block">Reach (Scope)</label>
                <select 
                  value={formData.scope}
                  onChange={(e) => updateField('scope', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400"
                >
                  {SCOPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2 block">Language</label>
                <select 
                  value={formData.language}
                  onChange={(e) => updateField('language', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400"
                >
                  {LANGUAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            {/* Call to Action (CTA) */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Add Action Button (CTA)</h3>
              
              <div>
                <label className="text-[10px] font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Button Text</label>
                <select 
                  value={formData.ctaText}
                  onChange={(e) => updateField('ctaText', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400"
                >
                  {CTA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              {(formData.ctaText === 'Link Shop' || formData.ctaText === 'Custom Website') && (
                <div className="animate-fade-in">
                  <label className="text-[10px] font-bold text-gray-500 mb-1.5 block uppercase tracking-wider">Destination URL *</label>
                  <input 
                    type="url"
                    value={formData.ctaLink}
                    onChange={(e) => updateField('ctaLink', e.target.value)}
                    placeholder="https://your-shop.com/product"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400"
                  />
                </div>
              )}
            </div>

            <button 
              onClick={handlePublish}
              disabled={!formData.videoFile}
              className={`w-full py-4 rounded-xl font-bold text-sm shadow-glow-indigo transition-all active:scale-[0.98] ${
                formData.videoFile ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Publish Reel 🚀
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-fade-in text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-5xl">
              🎉
            </div>
            <h2 className="text-2xl font-black text-gray-900">Reel Published!</h2>
            <p className="text-sm text-gray-500">Your new reel is now live and can be seen by customers.</p>
            <button 
              onClick={onClose}
              className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm"
            >
              Back to Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadReelScreen;
