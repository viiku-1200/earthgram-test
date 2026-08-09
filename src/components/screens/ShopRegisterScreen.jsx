import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

const InputField = ({ label, value, onChange, placeholder, type = 'text', extra }) => (
  <div className="mb-4">
    <label className="text-xs font-bold text-gray-700 mb-1.5 block">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder}
      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 focus:bg-white transition-colors"
    />
    {extra && <p className="text-[10px] text-gray-400 mt-1">{extra}</p>}
  </div>
);

const ToggleOption = ({ checked, onChange, title, desc, icon }) => (
  <button onClick={onChange} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${checked ? 'bg-amber-50 border-amber-400' : 'bg-white border-gray-200'}`}>
    <div className="flex items-center space-x-3 text-left">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${checked ? 'bg-amber-100' : 'bg-gray-100'}`}>{icon}</div>
      <div>
        <h4 className={`text-sm font-bold ${checked ? 'text-amber-900' : 'text-gray-700'}`}>{title}</h4>
        <p className="text-[10px] text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-amber-500' : 'bg-gray-200'}`}>
      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
    </div>
  </button>
);

const ShopRegisterScreen = ({ isDarkMode, onClose, onRegisterSuccess }) => {
  const [step, setStep] = useState(1);
  const [isLocating, setIsLocating] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    description: '',
    aadharNumber: '',
    gstNumber: '',
    upiId: '',
    createGroup: true,
    location: null,
    address: '',
  });

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({ click(e) { setPosition([e.latlng.lat, e.latlng.lng]); } });
    return position ? <Marker position={position} /> : null;
  };

  const canProceedStep1 = formData.shopName.trim() && formData.ownerName.trim() && formData.phone.trim();
  const canProceedStep2 = formData.aadharNumber.trim().length >= 4; // Relaxed for testing

  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        updateField('location', [latitude, longitude]);
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          if (data && data.address) {
            const addr = data.address;
            const shortAddress = `${addr.suburb || addr.neighbourhood || addr.road || ''}, ${addr.city || addr.town || addr.state || ''}`.trim().replace(/^, |, $/, '');
            updateField('address', shortAddress || data.display_name);
          }
        } catch (err) {
          console.error("Geocoding failed:", err);
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLocating(false);
        alert("Unable to retrieve your location. Please check your browser permissions.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleLaunch = () => {
    // Use either the GPS pin or a default location near Delhi for the map
    const shopLocation = formData.location || [28.6139 + (Math.random() * 0.01), 77.2090 + (Math.random() * 0.01)];
    
    const newProvider = {
      id: `shop_${Date.now()}`,
      name: formData.shopName,
      category: 'Shop',
      sub: 'Physical Store',
      subCategory: 'Retail',
      rating: 5.0,
      reviews: 0,
      price: '₹Prices vary',
      distance: '0.1 km',
      tag: 'NEW SHOP',
      avatar: '🏬',
      available: true,
      address: formData.address || 'Local Shop',
      location: shopLocation
    };
    
    if (onRegisterSuccess) {
      onRegisterSuccess({ ...formData, providerObj: newProvider });
      // Don't call onClose() here — onRegisterSuccess already navigates to /profile
    } else {
      onClose();
    }
  };

  return (
    <div className={`absolute inset-0 z-50 flex flex-col animate-slide-up ${isDarkMode ? 'bg-[#060B19]' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`px-4 py-4 flex items-center border-b ${isDarkMode ? 'border-white/[0.04]' : 'border-gray-200'} sticky top-0 z-10 ${isDarkMode ? 'bg-[#0A1128]' : 'bg-white'} shadow-sm`}>
        <button onClick={onClose} className={`p-2 -ml-2 rounded-full ${isDarkMode ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-gray-50 active:bg-gray-100'} transition-colors`}>
          <svg className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="ml-2 flex-1">
          <h1 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Register Premium Shop ✨</h1>
          <div className="flex space-x-1 mt-1">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-amber-400' : 'bg-gray-200'}`} />
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-amber-400' : 'bg-gray-200'}`} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <span className="text-4xl block mb-2">🏬</span>
              <h2 className="text-xl font-black text-gray-900">Basic Shop Details</h2>
              <p className="text-xs text-gray-500">Let's set up your storefront.</p>
            </div>

            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-white rounded-full shadow-md border-2 border-dashed border-amber-300 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-50 transition-colors">
                <span className="text-2xl mb-1">📷</span>
                <span className="text-[9px] font-bold text-amber-600">Shop Logo</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <InputField label="Shop Name *" value={formData.shopName} onChange={v => updateField('shopName', v)} placeholder="e.g., Ramesh Grocery Mart" />
              <InputField label="Owner Full Name *" value={formData.ownerName} onChange={v => updateField('ownerName', v)} placeholder="e.g., Ramesh Kumar" />
              <InputField label="Phone Number *" type="tel" value={formData.phone} onChange={v => updateField('phone', v)} placeholder="+91 98765 43210" />
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <InputField label="💬 WhatsApp (Optional)" type="tel" value={formData.whatsapp} onChange={v => updateField('whatsapp', v)} placeholder="WhatsApp No." />
                <InputField label="📷 Instagram (Optional)" value={formData.instagram} onChange={v => updateField('instagram', v)} placeholder="Insta ID / Link" />
              </div>
              
              <div className="mt-4">
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">Shop Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => updateField('description', e.target.value)}
                  placeholder="What do you sell? (e.g., Fresh daily groceries and household items)"
                  rows="3" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 focus:bg-white transition-colors resize-none" 
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <span className="text-4xl block mb-2">🛡️</span>
              <h2 className="text-xl font-black text-gray-900">Verification & Location</h2>
              <p className="text-xs text-gray-500">Earn your Blue Tick and let customers find you.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <InputField label="Aadhar Card Number *" value={formData.aadharNumber} onChange={v => updateField('aadharNumber', v)} placeholder="12-digit number for KYC" extra="Required to get the Verified Shop badge." />
              <InputField label="GST Number (Optional)" value={formData.gstNumber} onChange={v => updateField('gstNumber', v)} placeholder="e.g., 22AAAAA0000A1Z5" extra="Helps build trust with B2B clients." />
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="text-xl">💸</span>
                <label className="text-xs font-bold text-gray-700 block">UPI ID for Direct Payments *</label>
              </div>
              <input 
                type="text" 
                value={formData.upiId} 
                onChange={e => updateField('upiId', e.target.value)} 
                placeholder="e.g., 9876543210@paytm or name@okicici"
                className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm font-bold text-amber-900 outline-none focus:border-amber-400 focus:bg-amber-100 transition-colors"
              />
              <p className="text-[10px] text-gray-500 mt-2 font-bold flex items-center">
                <span className="text-green-500 mr-1">✓</span> 
                Customers pay you directly. 0% Commission forever.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-gray-900">Pin Shop Location *</h3>
                <button 
                  onClick={handleGetLiveLocation}
                  disabled={isLocating}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center space-x-1 shadow-sm transition-all ${
                    isLocating ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  <span className={isLocating ? 'animate-spin' : ''}>📡</span>
                  <span>{isLocating ? 'Locating...' : 'Use Live GPS'}</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">Tap the map or use live GPS if you are at the shop.</p>
              <div className="h-48 rounded-xl overflow-hidden border border-gray-200 z-0 mb-4 relative">
                <MapContainer center={formData.location || [28.6139, 77.2090]} zoom={formData.location ? 16 : 13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <LocationMarker position={formData.location} setPosition={(pos) => updateField('location', pos)} />
                </MapContainer>
              </div>
              
              <InputField 
                label="Full Shop Address *" 
                value={formData.address} 
                onChange={v => updateField('address', v)} 
                placeholder="e.g., Shop 42, Main Market Road, Delhi" 
                extra="This will be shown on your profile so customers can visit you." 
              />
            </div>

            <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
              <ToggleOption
                checked={formData.createGroup}
                onChange={() => updateField('createGroup', !formData.createGroup)}
                title="Auto-Create VIP Community"
                desc="Instantly create a verified group chat for your customers."
                icon="👥"
              />
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <div className={`absolute bottom-0 w-full p-4 border-t ${isDarkMode ? 'bg-[#0A1128] border-white/[0.04]' : 'bg-white border-gray-100'} shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]`}>
        {step === 1 ? (
          <button 
            disabled={!canProceedStep1}
            onClick={() => setStep(2)}
            className={`w-full py-4 rounded-xl font-black text-sm transition-all shadow-lg ${canProceedStep1 ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 shadow-amber-500/30 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            Continue to Verification ➔
          </button>
        ) : (
          <button 
            disabled={!canProceedStep2}
            onClick={handleLaunch}
            className={`w-full py-4 rounded-xl font-black text-sm transition-all shadow-lg ${canProceedStep2 ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 shadow-amber-500/30 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            Launch Premium Shop ✨
          </button>
        )}
      </div>
    </div>
  );
};

export default ShopRegisterScreen;
