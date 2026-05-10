import React, { useState, useRef } from 'react';
import { toBlob, toPng } from 'html-to-image';

const BusinessCard = ({ isDarkMode, companyData, bizBio, onClose }) => {
  const [isScanned, setIsScanned] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef(null);
  const profileUrl = "https://earthgram-test.vercel.app/";
  const serialNo = `EG-PLT-${(companyData?.fullName || 'OWNER').slice(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Helper to convert Data URL to Blob for sharing
  const dataUrlToBlob = async (dataUrl) => {
    const res = await fetch(dataUrl);
    return await res.blob();
  };

  const generateImageWithTimeout = async (ref) => {
    // Timeout wrapper to ensure we never spin forever
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Generation timed out")), 5000);
    });
    
    // Generate the image as a Data URL (most reliable format for html-to-image)
    const generatePromise = toPng(ref, { 
      pixelRatio: 2, 
      backgroundColor: 'transparent',
      skipFonts: true, // Safety fallback to prevent CORS font issues
    });

    return await Promise.race([generatePromise, timeoutPromise]);
  };

  const handleCaptureAndShare = async (platform = 'whatsapp') => {
    if (!cardRef.current || isGenerating) return;
    setIsGenerating(true);
    
    try {
      const brand = companyData?.brandName || 'My Virtual Company';
      const msg = `Elite Platinum Partner: Check out "${brand}" on EarthGram. 🏆\n\nOfficial profile: ${profileUrl}`;

      // 1. Generate Image (with safety timeout)
      const dataUrl = await generateImageWithTimeout(cardRef.current);
      if (!dataUrl || dataUrl === 'data:,') throw new Error("Empty image generated");

      // 2. Try Native Mobile File Share
      if (navigator.share && navigator.canShare) {
        try {
          const blob = await dataUrlToBlob(dataUrl);
          const file = new File([blob], 'platinum-card.png', { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: brand,
              text: msg
            });
            return; // Success!
          }
        } catch (shareErr) {
          console.warn("Native share failed/cancelled", shareErr);
          // If user cancelled, just stop here.
          if (shareErr.name === 'AbortError') return; 
        }
      }

      // 3. Fallback: Magic Clipboard & Redirect
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          const blob = await dataUrlToBlob(dataUrl);
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          alert(`✨ MAGIC CLIPBOARD ACTIVE!\n\nYour Platinum Card is COPIED. Just click 'Paste' when ${platform === 'whatsapp' ? 'WhatsApp' : 'Instagram'} opens!`);
        } else {
          throw new Error("Clipboard not supported");
        }
      } catch (clipErr) {
        // Final Fallback: Download the file manually
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'earthgram-platinum-card.png';
        link.click();
        alert(`✨ Card Ready!\n\nIt's in your downloads folder. Please attach it manually in ${platform === 'whatsapp' ? 'WhatsApp' : 'Instagram'}.`);
      }
      
      // 4. Open Target App
      if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
      } else {
        window.open('https://www.instagram.com/', '_blank');
      }

    } catch (err) {
      console.error("Capture Engine Error:", err);
      alert("⚠️ Card Generation Failed due to browser security restrictions. Please use the DOWNLOAD JPG button, or take a screenshot.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
      const dataUrl = await generateImageWithTimeout(cardRef.current);
      if (!dataUrl || dataUrl === 'data:,') throw new Error("Empty image");
      
      const link = document.createElement('a');
      link.download = 'earthgram-platinum-card.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download Error:", err);
      alert("⚠️ Download failed. Please try again or take a manual screenshot.");
    } finally {
      setIsGenerating(false);
    }
  };

  const EarthGramLogo = ({ size = "md" }) => (
    <div className="flex items-center">
      <img 
        src="/logo.png" 
        alt="EarthGram Logo" 
        className={`${size === "lg" ? "h-16" : "h-10"} object-contain brightness-110 drop-shadow-lg`}
      />
    </div>
  );

  if (isScanned) {
    return (
      <div className="absolute inset-0 z-[101] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
        <div className={`w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in flex flex-col bg-slate-50 border border-white`}>
           <div className="relative h-44 bg-gradient-to-br from-slate-400 via-slate-200 to-slate-500 flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
              </div>
              <button onClick={() => setIsScanned(false)} className="absolute top-6 left-6 w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-slate-800 font-bold backdrop-blur-md">←</button>
              
              <div className="absolute top-6 right-8">
                 <EarthGramLogo size="md" />
              </div>

              <div className="relative z-10 flex flex-col items-center translate-y-16">
                 <div className="w-24 h-24 bg-white rounded-[2rem] p-1 shadow-2xl">
                    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 rounded-[1.8rem] flex items-center justify-center text-white text-3xl font-black">
                      {(companyData?.fullName || 'Aryan Singh').split(' ').map(n => n[0]).join('')}
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="pt-16 p-8 flex-1 space-y-6">
              <div className="text-center">
                <div className="inline-block px-3 py-1 rounded-full bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest mb-3">Platinum Elite Member</div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">{companyData?.brandName || companyData?.fullName || 'Aryan Singh'}</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Certified Virtual Company Owner</p>
                
                <div className="mt-5 p-5 rounded-3xl bg-slate-100 border border-slate-200 shadow-inner">
                   <p className="text-xs font-semibold leading-relaxed italic text-slate-600">
                     "{bizBio || "Delivering premium-tier services with platinum standards across the EarthGram ecosystem."}"
                   </p>
                </div>
              </div>

              <div className="space-y-3">
                 <div className="flex items-center space-x-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <span className="text-xl">📞</span>
                    <div className="text-left">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Direct Business Line</p>
                       <p className="text-sm font-black text-slate-900">{companyData?.phone || '+91 98765 43210'}</p>
                    </div>
                 </div>
                 <div className="flex items-center space-x-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <span className="text-xl">🏛️</span>
                    <div className="text-left">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Verification Status</p>
                       <p className="text-sm font-black text-emerald-600">EARTHGRAM VERIFIED PRO</p>
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => window.open(profileUrl, '_blank')}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-transform">
                VISIT PLATINUM PROFILE
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/85 backdrop-blur-xl animate-fade-in">
      {isGenerating && (
        <div className="absolute inset-0 z-[110] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white">
           <div className="w-16 h-16 border-4 border-slate-400 border-t-white rounded-full animate-spin mb-4"></div>
           <p className="text-sm font-black tracking-widest animate-pulse uppercase">Generating Platinum Card...</p>
        </div>
      )}

      <div className="w-full max-w-sm relative animate-scale-in group">
        
        {/* PLATINUM PREMIUM CARD */}
        <div ref={cardRef} className="w-full aspect-[1.6/1] rounded-[2.5rem] p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 bg-gradient-to-br from-slate-400 via-slate-100 to-slate-500 border-[1.5px] border-white/50">
          
          {/* Metallic Shimmer Effect */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.8),transparent)]"></div>
          </div>

          <div className="flex justify-between items-start mb-8 relative z-10">
            <EarthGramLogo />
            <div className="text-right">
               <span className="text-[9px] font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">PLATINUM ELITE</span>
               <p className="text-[6px] font-black text-slate-600 mt-1 uppercase tracking-widest">Member No: {serialNo}</p>
            </div>
          </div>

          <div className="flex items-center space-x-5 mb-8 relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-black rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-2xl border-2 border-white/30">
              {(companyData?.fullName || 'Aryan Singh').split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-2xl font-black leading-tight text-slate-900 tracking-tight">
                {companyData?.brandName || 'EarthGram Pro'}
              </h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-0.5">{companyData?.fullName || 'Aryan Singh'}</p>
              <div className="flex items-center space-x-1.5 mt-2">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                 <p className="text-[10px] font-bold text-slate-600 tracking-wider">
                    {companyData?.phone || '+91 98765 43210'}
                 </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center relative z-10">
             <div className="max-w-[160px]">
                <div className="h-0.5 w-12 bg-slate-900/10 mb-3"></div>
                <p className="text-[9px] leading-relaxed font-extrabold italic text-slate-500 uppercase tracking-tight">
                  "Excellence Redefined"
                </p>
             </div>
             <div className="flex flex-col items-center">
                <div 
                  onClick={() => setIsScanned(true)}
                  className="w-16 h-16 p-1.5 rounded-2xl bg-white shadow-2xl border border-slate-200 cursor-pointer active:scale-90 transition-transform group-hover:rotate-3">
                   <img 
                     crossOrigin="anonymous"
                     src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(profileUrl)}`} 
                     alt="QR" 
                     className="w-full h-full opacity-90" 
                   />
                </div>
                <p className="text-[7px] font-black text-slate-400 mt-2 uppercase tracking-widest">Elite Scan</p>
             </div>
          </div>

          {/* Platinum Shimmer Line */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 pointer-events-none"></div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 space-y-3">
          <div className="flex space-x-3">
             <button 
               onClick={() => handleCaptureAndShare('whatsapp')}
               className="flex-1 bg-gradient-to-r from-green-500 to-emerald-700 text-white py-4 rounded-[1.5rem] font-black text-[10px] shadow-lg active:scale-95 transition-transform flex items-center justify-center space-x-2 border-t border-white/10 uppercase tracking-wider">
                <span>📲</span>
                <span>WhatsApp</span>
             </button>
             <button 
               onClick={() => handleCaptureAndShare('instagram')}
               className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white py-4 rounded-[1.5rem] font-black text-[10px] shadow-lg active:scale-95 transition-transform flex items-center justify-center space-x-2 border-t border-white/10 uppercase tracking-wider">
                <span>📸</span>
                <span>Instagram</span>
             </button>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={handleDownload}
              className="flex-1 py-3.5 rounded-2xl font-black text-[9px] bg-white text-slate-800 border border-slate-200 shadow-md active:scale-95 transition-transform uppercase tracking-widest">
               DOWNLOAD JPG
            </button>
            <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl font-black text-[9px] bg-red-500/10 text-red-500 border border-red-100 active:scale-95 transition-transform uppercase tracking-widest">
               EXIT CARD
            </button>
          </div>
        </div>
        
        <p className="text-center text-[9px] text-white/40 font-bold mt-8 uppercase tracking-[0.4em] animate-pulse">Real-time Platinum card sharing active</p>
      </div>
    </div>
  );
};

export default BusinessCard;
