import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { REGISTRATION_PLANS, SERVICE_CATEGORY_OPTIONS, LAUNCH_SCALE_OPTIONS, REVENUE_MODELS, SUBCATEGORIES_MAP } from '../../data/constants';

const RegisterScreen = ({ isDarkMode, onClose, onRegisterSuccess }) => {
  const [step, setStep] = useState(1); // 1=plans, 2=details, 3=addons, 4=verification, 5=success
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    brandName: '',
    fullName: '',
    phone: '',
    category: '',
    subCategory: '',
    customCategory: '',
    description: '',
    instagram: '',
    whatsapp: '',
    website: '',
    aadharNumber: '',
    address: '',
    launchScale: 'Surrounding',
    revenueModel: 'Fixed Price',
    offerPrime: false,
    createGroup: false,
    enableGroupDiscussion: false,
    teamMembers: [],
    location: null,
  });
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', domain: '', rate: '', description: '' });

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const addTeamMember = () => {
    if (newMember.name.trim() && newMember.domain.trim()) {
      setFormData(prev => ({ ...prev, teamMembers: [...prev.teamMembers, { ...newMember, id: Date.now() }] }));
      setNewMember({ name: '', domain: '', rate: '', description: '' });
      setShowAddMember(false);
    }
  };

  const canProceedStep2 = formData.brandName.trim() && formData.fullName.trim() && formData.phone.trim() && formData.category && 
    (!SUBCATEGORIES_MAP[formData.category] || formData.subCategory) && 
    ((formData.category !== 'Other' && formData.subCategory !== 'Other') || (formData.customCategory && formData.customCategory.trim()));
  const canProceedStep4 = formData.aadharNumber.trim().length >= 12 && formData.address.trim();

  // Map Marker Component
  const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return position ? <Marker position={position} /> : null;
  };

  // ============== STEP 1: PLAN SELECTION ==============
  const PlanSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <span className="text-5xl block mb-3">🚀</span>
        <h2 className="text-2xl font-black text-gray-900">Start Your Virtual Company</h2>
        <p className="text-sm text-gray-500 mt-2">We take <span className="font-bold text-green-600">0% Commission</span>. You keep 100% of earnings.</p>
      </div>

      {/* Plan Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
        {REGISTRATION_PLANS.map(plan => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
              selectedPlan === plan.id ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500'
            }`}
          >
            {plan.icon} {plan.name}
          </button>
        ))}
      </div>

      {/* Selected Plan Details */}
      {selectedPlan && REGISTRATION_PLANS.filter(p => p.id === selectedPlan).map(plan => (
        <div key={plan.id} className="space-y-4">
          <div className={`bg-gradient-to-r ${plan.color} rounded-2xl p-6 text-white`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black">{plan.price}<span className="text-sm font-medium opacity-70">{plan.period}</span></h3>
                <p className="text-xs opacity-80 mt-1">{plan.desc}</p>
              </div>
              <span className="text-4xl">{plan.icon}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-2">
            {plan.features.map((feat, i) => (
              <div key={i} className="flex items-start space-x-2">
                <span className="text-green-500 text-sm mt-0.5">✓</span>
                <span className="text-sm text-gray-700">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {!selectedPlan && (
        <div className="text-center py-8 text-gray-400">
          <span className="text-4xl block mb-2">👆</span>
          <p className="text-sm font-medium">Select a plan above to continue</p>
        </div>
      )}

      {/* Policy Banners */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
          <span className="font-bold">⚠️ Strict Quality & Legal Policy:</span> To build trust, you must maintain high quality. If your rating drops below <strong>2.5</strong>, your account will be suspended.
        </p>
        <p className="text-[10px] text-red-700 font-bold mt-1">
          Warning: If you are found stealing anything, you will face <strong>legal action (Jail)</strong> and a fine of <strong>2x the product value</strong>.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
        <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
          <span className="font-bold">💡 Pro Tip:</span> Companies with detailed member profiles and real photos get 5x more trust.
        </p>
      </div>
    </div>
  );

  // ============== STEP 2: BUSINESS DETAILS ==============
  const BusinessDetails = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <span className="text-4xl block mb-2">🏪</span>
        <h2 className="text-xl font-black text-gray-900">Your Brand Identity</h2>
        <p className="text-xs text-gray-500">This is how customers will see you</p>
      </div>

      {/* Brand Photo */}
      <div className="flex justify-center">
        <div className="w-24 h-24 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
          <span className="text-3xl mb-1">📸</span>
          <span className="text-[9px] font-bold text-gray-400">Face Photo</span>
        </div>
      </div>

      <InputField label="Brand Name *" value={formData.brandName} onChange={v => updateField('brandName', v)} placeholder="e.g., Ravi Electric Solutions" />
      <InputField label="Your Full Name *" value={formData.fullName} onChange={v => updateField('fullName', v)} placeholder="e.g., Ravi Kumar" />
      <InputField label="Phone Number *" type="tel" value={formData.phone} onChange={v => updateField('phone', v)} placeholder="+91 98765 43210" />

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <label className="text-xs font-bold text-gray-700 mb-2 block">Service Category *</label>
        <select value={formData.category} onChange={e => { updateField('category', e.target.value); updateField('subCategory', ''); }}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white transition-colors cursor-pointer">
          <option value="">Select your service...</option>
          {SERVICE_CATEGORY_OPTIONS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        
        {formData.category && SUBCATEGORIES_MAP[formData.category] && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
            <label className="text-xs font-bold text-gray-700 mb-2 block">Specialization / Subcategory *</label>
            <div className="grid grid-cols-2 gap-2">
              {SUBCATEGORIES_MAP[formData.category].map(sub => (
                <button key={sub.id} onClick={() => updateField('subCategory', sub.name)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all border ${
                    formData.subCategory === sub.name ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                  <span className="text-sm">{sub.icon}</span>
                  <span className="text-left flex-1">{sub.name}</span>
                </button>
              ))}
              <button onClick={() => updateField('subCategory', 'Other')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all border ${
                    formData.subCategory === 'Other' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                  <span className="text-sm">✏️</span>
                  <span className="text-left flex-1">Other</span>
              </button>
            </div>
          </div>
        )}

        {(formData.category === 'Other' || formData.subCategory === 'Other') && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
            <InputField 
              label="Specify Custom Category *" 
              value={formData.customCategory || ''} 
              onChange={v => updateField('customCategory', v)} 
              placeholder="e.g., Pet Walking, Tarot Reading, Photography" 
              extra="This will be displayed as your main profession on your profile."
            />
          </div>
        )}
      </div>

      <div>
        <label className="text-xs font-bold text-gray-700 mb-1 block">Expertise Description</label>
        <textarea value={formData.description} onChange={e => updateField('description', e.target.value)}
          placeholder="Tell customers what makes your service special..."
          rows="3" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors resize-none" />
      </div>

      {/* Revenue Model */}
      <div>
        <label className="text-xs font-bold text-gray-700 mb-2 block">Revenue Model</label>
        <div className="flex space-x-2">
          {REVENUE_MODELS.map(model => (
            <button key={model} onClick={() => updateField('revenueModel', model)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                formData.revenueModel === model ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'
              }`}>
              {model === 'Fixed Price' ? '💰' : '⏱️'} {model}
            </button>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="grid grid-cols-2 gap-3">
        <InputField label="📷 Instagram" value={formData.instagram} onChange={v => updateField('instagram', v)} placeholder="Profile link" />
        <InputField label="💬 WhatsApp" value={formData.whatsapp} onChange={v => updateField('whatsapp', v)} placeholder="Group link" />
      </div>
      <InputField label="🌐 Website" value={formData.website} onChange={v => updateField('website', v)} placeholder="https://..." />
    </div>
  );

  // ============== STEP 3: ADD-ONS & TEAM ==============
  const AddOnsStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <span className="text-4xl block mb-2">⚙️</span>
        <h2 className="text-xl font-black text-gray-900">Features & Scale</h2>
        <p className="text-xs text-gray-500">Customize your Virtual Company</p>
      </div>

      {/* Feature Toggles */}
      <ToggleOption
        checked={formData.offerPrime}
        onChange={() => updateField('offerPrime', !formData.offerPrime)}
        title="Offer Prime Membership?"
        desc="Create loyal customers with recurring plans."
        icon="👑"
      />
      <ToggleOption
        checked={formData.createGroup}
        onChange={() => updateField('createGroup', !formData.createGroup)}
        title="Create Customer Group?"
        desc="A private community for your clients."
        icon="👥"
      />
      <div className={`p-4 rounded-2xl border-2 transition-all ${formData.enableGroupDiscussion ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-lg">💬</span>
              <h4 className="text-sm font-bold text-gray-900">Enable Online Group Discussion</h4>
              <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">+₹50/mo</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1 ml-7">Live screen share & voice chat with clients.</p>
          </div>
          <button onClick={() => updateField('enableGroupDiscussion', !formData.enableGroupDiscussion)}
            className={`w-12 h-7 rounded-full p-0.5 transition-colors ${formData.enableGroupDiscussion ? 'bg-blue-600' : 'bg-gray-300'}`}>
            <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform ${formData.enableGroupDiscussion ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Launch Scale */}
      <div>
        <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">Launch Scale</label>
        <div className="grid grid-cols-2 gap-2">
          {LAUNCH_SCALE_OPTIONS.map(scale => (
            <button key={scale} onClick={() => updateField('launchScale', scale)}
              className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                formData.launchScale === scale ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'
              }`}>
              {scale}
            </button>
          ))}
        </div>
      </div>

      {/* Team Members (Agency only) */}
      {selectedPlan === 'agency' && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Team Members</label>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{formData.teamMembers.length} Added</span>
          </div>

          {formData.teamMembers.map(member => (
            <div key={member.id} className="bg-white p-3 rounded-xl border border-gray-100 mb-2 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">👤</div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900">{member.name}</h4>
                <p className="text-[10px] text-gray-500">{member.domain} • ₹{member.rate}</p>
              </div>
            </div>
          ))}

          {!showAddMember ? (
            <button onClick={() => setShowAddMember(true)}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm font-bold text-gray-500 flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors">
              <span>➕</span><span>Add Team Member</span>
            </button>
          ) : (
            <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-gray-900">Add Expert Details</h4>
                <button onClick={() => setShowAddMember(false)} className="text-gray-400 text-lg">✕</button>
              </div>
              <InputField label="Name *" value={newMember.name} onChange={v => setNewMember(p => ({ ...p, name: v }))} placeholder="Expert name" />
              <InputField label="Specific Domain *" value={newMember.domain} onChange={v => setNewMember(p => ({ ...p, domain: v }))} placeholder="e.g., AC specialist" />
              <InputField label="Rate (₹)" value={newMember.rate} onChange={v => setNewMember(p => ({ ...p, rate: v }))} placeholder="e.g., 500/hr" />
              <InputField label="Description" value={newMember.description} onChange={v => setNewMember(p => ({ ...p, description: v }))} placeholder="Brief intro" />
              <button onClick={addTeamMember}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm active:scale-[0.98] transition-transform">Add Member</button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ============== STEP 4: VERIFICATION ==============
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(30);

  const handleSendOTP = () => {
    if (formData.aadharNumber.length === 12) {
      setOtpSent(true);
      setTimer(30);
      // Simulated timer
      const interval = setInterval(() => {
        setTimer(t => {
          if (t <= 1) { clearInterval(interval); return 0; }
          return t - 1;
        });
      }, 1000);
    }
  };

  const handleVerifyOTP = () => {
    setIsVerifying(true);
    // Simulate Aadhaar server verification delay
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      setOtpSent(false);
    }, 2000);
  };

  const VerificationStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <span className="text-4xl block mb-2">🛡️</span>
        <h2 className="text-xl font-black text-gray-900">Legal Verification</h2>
        <p className="text-xs text-gray-500">Government-grade verification for Boss Mode</p>
      </div>

      <div className="relative">
        <InputField 
          label="Aadhar Number *" 
          value={formData.aadharNumber}
          onChange={v => updateField('aadharNumber', v.replace(/\D/g, '').slice(0, 12))}
          placeholder="XXXX XXXX XXXX" 
          extra="Linked mobile number will receive an OTP" 
        />
        {formData.aadharNumber.length === 12 && !isVerified && (
          <button 
            onClick={handleSendOTP}
            className="absolute right-2 top-7 bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg active:scale-95 transition-transform"
          >
            SEND OTP
          </button>
        )}
        {isVerified && (
          <div className="absolute right-2 top-8 flex items-center space-x-1 text-emerald-600 font-black text-[10px] uppercase">
            <span className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">✓</span>
            <span>Verified</span>
          </div>
        )}
      </div>

      {/* ID Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all relative overflow-hidden">
        <span className="text-4xl block mb-2">🪪</span>
        <p className="text-sm font-bold text-gray-700">Upload Aadhar Photo</p>
        <p className="text-[10px] text-gray-400 mt-1">Front side • JPG/PNG • Max 5MB</p>
        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
      </div>

      <InputField label="Business Operating Area (Text) *" value={formData.address}
        onChange={v => updateField('address', v)} placeholder="e.g., Gaur City 2, Noida" />

      {/* NEW: Interactive Leaflet Map for Shop Location */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm relative z-0">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-gray-700">Set Map Location *</label>
          {formData.location && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Pinned ✓</span>}
        </div>
        <div className="h-48 w-full rounded-xl overflow-hidden shadow-inner border border-gray-100 relative">
          <MapContainer center={[28.6273, 77.4363]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            <LocationMarker position={formData.location} setPosition={(pos) => updateField('location', pos)} />
          </MapContainer>
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-[9px] text-gray-400 font-bold">👆 Tap map to drop pin</p>
          <button 
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => updateField('location', [pos.coords.latitude, pos.coords.longitude]),
                  () => alert("Please allow location access or tap the map manually.")
                );
              }
            }}
            className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg shadow-sm active:scale-95 transition-transform">
            📍 USE MY GPS
          </button>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
        <p className="text-[10px] text-indigo-700 font-medium leading-relaxed">
          <span className="font-bold text-indigo-900">🔐 Biometric Shield:</span> Your Aadhar data is processed via secure UIDAI-style encryption. EarthGram never stores your full ID.
        </p>
      </div>

      {/* OTP MODAL OVERLAY */}
      {otpSent && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-scale-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📱</div>
              <h3 className="text-lg font-black text-gray-900">Enter OTP</h3>
              <p className="text-[10px] text-gray-500 mt-1">Sent to mobile linked with Aadhar <br/> <span className="font-bold text-gray-800">XXXX-XXXX-{formData.aadharNumber.slice(-4)}</span></p>
            </div>
            
            <input 
              type="text" 
              maxLength="6"
              value={otpInput}
              onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-gray-100 border-2 border-gray-200 rounded-2xl py-4 text-center text-3xl font-black tracking-[0.5em] focus:border-indigo-500 outline-none transition-all"
              placeholder="000000"
            />

            <div className="mt-6 space-y-3">
              <button 
                onClick={handleVerifyOTP}
                disabled={otpInput.length !== 6 || isVerifying}
                className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  otpInput.length === 6 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isVerifying ? 'VERIFYING...' : 'VERIFY & CONTINUE'}
              </button>
              
              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Resend OTP in {timer}s</p>
                ) : (
                  <button onClick={handleSendOTP} className="text-[10px] font-black text-indigo-600 uppercase">Resend OTP Now</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ============== STEP 5: SUCCESS ==============
  const SuccessStep = () => (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center text-6xl animate-bounce" style={{ animationDuration: '2s' }}>🎉</div>
      <h2 className="text-2xl font-black text-gray-900 text-center">You're Live!</h2>
      <p className="text-sm text-gray-500 text-center leading-relaxed max-w-xs">
        <span className="font-bold text-gray-800">{formData.brandName}</span> is now a Virtual Company on EarthGram!
      </p>
      <div className="bg-gray-50 rounded-2xl p-4 w-full border border-gray-100">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
            {selectedPlan === 'solo' ? '🧑‍💼' : '🏢'}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{formData.brandName}</h3>
            <p className="text-xs text-gray-500">
              {(formData.category === 'Other' || formData.subCategory === 'Other') ? formData.customCategory : 
                (formData.subCategory ? `${formData.category} (${formData.subCategory})` : formData.category)} • {formData.address || 'Ghaziabad'}
            </p>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-[8px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">Verified ✓</span>
              <span className="text-[8px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">Active</span>
              {formData.offerPrime && <span className="text-[8px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">Prime 👑</span>}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <StatBox label="Plan" value={selectedPlan === 'solo' ? 'Solo' : 'Agency'} />
          <StatBox label="Scale" value={formData.launchScale} />
          <StatBox label="Model" value={formData.revenueModel} />
        </div>
        {formData.teamMembers.length > 0 && (
          <div className="mt-2 flex space-x-2">
            <StatBox label="Team" value={`${formData.teamMembers.length} members`} />
            <StatBox label="Earnings" value="₹0" />
          </div>
        )}
        {formData.enableGroupDiscussion && (
          <p className="text-[9px] text-center text-blue-600 mt-2 font-bold">💬 Group Discussion Enabled (+₹50/mo)</p>
        )}
      </div>
    </div>
  );

  const totalSteps = 5;
  const stepTitles = ['Choose Plan', 'Brand Details', 'Features & Scale', 'Verification', 'Complete!'];

  const handleNext = () => {
    if (step === totalSteps) {
      // Build Provider Object to inject into global search
      const newProvider = {
        id: `custom_${Date.now()}`,
        name: formData.brandName,
        category: formData.category === 'Other' ? formData.customCategory : formData.category,
        sub: formData.subCategory,
        subCategory: formData.subCategory,
        rating: 5.0, // Give new shops a perfect 5.0 to start
        reviews: 0,
        price: '₹' + (formData.revenueModel === 'Fixed Price' ? '150' : '200/hr'),
        distance: '0.1 km', // Treat as nearby since they just registered here
        tag: 'NEW PRO',
        avatar: formData.category === 'Other' ? '✨' : '💼',
        available: true,
        address: formData.address,
        location: formData.location
      };

      onRegisterSuccess?.({ ...formData, providerObj: newProvider });
      onClose();
      return;
    }
    setStep(s => s + 1);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!selectedPlan;
      case 2: return canProceedStep2;
      case 3: return true; // add-ons are optional
      case 4: return canProceedStep4;
      case 5: return true;
      default: return false;
    }
  };

  const ctaLabels = ['Continue', 'Next: Features', 'Next: Verification', 'Submit & Go Live 🚀', 'Go to Dashboard'];

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 z-50 flex flex-col animate-slide-up">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <button onClick={step > 1 && step < totalSteps ? () => setStep(s => s - 1) : onClose}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition-transform text-sm font-bold">
          {step > 1 && step < totalSteps ? '←' : '✕'}
        </button>
        <div className="text-center">
          <h2 className="text-sm font-extrabold text-gray-900">{stepTitles[step - 1]}</h2>
          {step < totalSteps && (
            <div className="flex space-x-1.5 mt-2 justify-center">
              {Array.from({ length: totalSteps - 1 }, (_, i) => i + 1).map(s => (
                <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? 'w-8 bg-gradient-to-r from-indigo-600 to-purple-600' : s < step ? 'w-4 bg-indigo-300' : 'w-4 bg-gray-200'}`} />
              ))}
            </div>
          )}
        </div>
        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 hide-scrollbar">
        {step === 1 && PlanSelection()}
        {step === 2 && BusinessDetails()}
        {step === 3 && AddOnsStep()}
        {step === 4 && VerificationStep()}
        {step === 5 && SuccessStep()}
      </div>

      {/* Bottom CTA */}
      <div className="glass px-5 py-4 pb-8 border-t border-gray-100/50">
        <button onClick={handleNext} disabled={!canProceed()}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] ${
            canProceed() ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow-indigo' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}>
          {ctaLabels[step - 1]}
        </button>
      </div>
    </div>
  );
};

// --- Reusable components ---
const InputField = ({ label, value, onChange, placeholder, type = 'text', extra }) => (
  <div>
    <label className="text-xs font-bold text-gray-700 mb-1 block">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white transition-colors" />
    {extra && <p className="text-[10px] text-gray-400 mt-1">{extra}</p>}
  </div>
);

const ToggleOption = ({ checked, onChange, title, desc, icon }) => (
  <div className={`p-4 rounded-2xl border-2 transition-all ${checked ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <span className="text-lg">{icon}</span>
        <div>
          <h4 className="text-sm font-bold text-gray-900">{title}</h4>
          <p className="text-[10px] text-gray-500">{desc}</p>
        </div>
      </div>
      <button onClick={onChange}
        className={`w-12 h-7 rounded-full p-0.5 transition-colors ${checked ? 'bg-green-500' : 'bg-gray-300'}`}>
        <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  </div>
);

const StatBox = ({ label, value }) => (
  <div className="flex-1 bg-white p-2 rounded-xl text-center border border-gray-100">
    <span className="block text-[10px] text-gray-400">{label}</span>
    <span className="block text-xs font-bold text-gray-800">{value}</span>
  </div>
);

export default RegisterScreen;
