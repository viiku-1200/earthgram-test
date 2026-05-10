import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CompanyBuilderScreen = ({ isDarkMode, onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    phone: '',
    description: '',
    location: 'Ghaziabad, UP',
  });

  const CATEGORIES = [
    { id: 'agri', label: 'Agriculture', icon: '🌾' },
    { id: 'home', label: 'Home Services', icon: '🔧' },
    { id: 'craft', label: 'Handicrafts', icon: '🎨' },
    { id: 'food', label: 'Local Food', icon: '🍯' },
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      // Complete logic
      localStorage.setItem('earthgram_company_data', JSON.stringify(formData));
      localStorage.setItem('earthgram_registered', 'true');
      localStorage.setItem('earthgram_boss_mode', 'true');
      if (onComplete) onComplete(formData);
      navigate('/profile');
    }
  };

  return (
    <div className={`h-full flex flex-col pt-12 pb-20 overflow-y-auto hide-scrollbar transition-all duration-500 ${
      isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Header */}
      <div className="px-5 mb-8 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="text-2xl">✕</button>
        <div className="flex space-x-1">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-200'}`}></div>
          ))}
        </div>
        <div className="w-6"></div>
      </div>

      <div className="px-6 flex-1">
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-black tracking-tighter mb-2">Name your <span className="text-indigo-600">Vision.</span></h1>
            <p className="text-gray-500 text-sm mb-8 font-medium">What should we call your virtual company?</p>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Company Name</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Singh Agro Exports"
                  className={`w-full p-4 rounded-2xl border-2 outline-none transition-all font-bold ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-indigo-500' : 'bg-gray-50 border-gray-100 focus:border-indigo-600'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Select Category</label>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setFormData({...formData, category: cat.label})}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                        formData.category === cat.label 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg scale-[1.02]' 
                          : (isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-gray-100 bg-gray-50')
                      }`}>
                      <span className="text-2xl mb-2">{cat.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-tighter">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-black tracking-tighter mb-2">Global <span className="text-indigo-600">Reach.</span></h1>
            <p className="text-gray-500 text-sm mb-8 font-medium">How can customers reach your company?</p>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Business Phone</label>
                <input 
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+91 00000 00000"
                  className={`w-full p-4 rounded-2xl border-2 outline-none transition-all font-bold ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-indigo-500' : 'bg-gray-50 border-gray-100 focus:border-indigo-600'
                  }`}
                />
              </div>

              <div className={`p-5 rounded-[2rem] border-2 border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-800/30' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white">📍</div>
                  <div>
                    <h3 className="font-bold text-sm">Business Location</h3>
                    <p className="text-[10px] text-gray-500">{formData.location}</p>
                  </div>
                </div>
                <button className="w-full bg-white border border-gray-200 text-[10px] font-black py-2.5 rounded-xl shadow-sm uppercase tracking-widest active:scale-95 transition-all">
                  Update Pin on Map
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-black tracking-tighter mb-2">Final <span className="text-indigo-600">Polish.</span></h1>
            <p className="text-gray-500 text-sm mb-8 font-medium">Describe your company for the world.</p>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Company Pitch</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="e.g. We provide the freshest organic wheat in Uttar Pradesh with same-day delivery."
                  rows="5"
                  className={`w-full p-4 rounded-2xl border-2 outline-none transition-all font-bold resize-none ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-indigo-500' : 'bg-gray-50 border-gray-100 focus:border-indigo-600'
                  }`}
                />
              </div>

              <div className="flex items-center space-x-2 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                <span className="text-lg">✨</span>
                <p className="text-[10px] text-indigo-700 font-bold italic">
                  I will polish this pitch with AI as soon as you finish!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="px-6 mt-8">
        <button 
          onClick={handleNext}
          disabled={step === 1 && !formData.name}
          className={`w-full py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-xl active:scale-95 disabled:opacity-50 ${
            step === 3 ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
          }`}>
          {step === 3 ? 'Launch Company 🚀' : 'Continue →'}
        </button>
      </div>
    </div>
  );
};

export default CompanyBuilderScreen;
