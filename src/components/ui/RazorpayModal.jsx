import React, { useState } from 'react';

const RazorpayModal = ({ amount, isDarkMode, onSuccess, onClose }) => {
  const [step, setStep] = useState('methods'); // methods, processing, otp, success
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [otp, setOtp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setStep('processing');
    setTimeout(() => {
      setStep('otp');
    }, 1500);
  };

  const handleOtpSubmit = () => {
    if (otp.length !== 4) return;
    setIsProcessing(true);
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess({ method: selectedMethod, id: 'pay_' + Math.random().toString(36).substr(2, 9) });
      }, 1500);
    }, 2000);
  };

  return (
    <div className="absolute inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col ${isDarkMode ? 'bg-slate-900' : 'bg-white'} animate-slide-up`}>
        {/* Header */}
        <div className={`p-4 flex justify-between items-center border-b ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-gray-200'}`}>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full transform -rotate-45"></div>
            </div>
            <span className={`font-bold text-sm tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Razorpay</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 text-gray-500 hover:bg-black/10 transition-colors">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {step === 'methods' && (
            <div className="animate-fade-in">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Amount to pay</p>
                  <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>₹{amount}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400">EarthGram Secure</p>
                </div>
              </div>

              <p className={`text-xs font-bold mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>SELECT PAYMENT METHOD</p>
              
              <div className="space-y-3">
                {['UPI', 'Credit / Debit Card', 'Netbanking', 'Wallets'].map((method) => (
                  <button key={method} onClick={() => handleMethodSelect(method)}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between group transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-500'}`}>
                    <span className={`font-semibold ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-800 group-hover:text-blue-600'}`}>{method}</span>
                    <span className="text-gray-400 group-hover:text-blue-500">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 animate-fade-in">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Connecting to bank...</p>
              <p className="text-xs text-gray-500 mt-2">Please do not close this window</p>
            </div>
          )}

          {step === 'otp' && (
            <div className="animate-fade-in flex flex-col h-full">
              <div className="mb-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Enter Bank OTP</h3>
                <p className="text-xs text-gray-500">We've sent a code to your registered mobile number to verify this transaction of ₹{amount}.</p>
              </div>

              <div className="flex justify-center space-x-3 mb-8">
                {[1, 2, 3, 4].map((_, i) => (
                  <input key={i} type="text" maxLength="1" 
                    value={otp[i] || ''}
                    onChange={(e) => {
                      const newOtp = otp.split('');
                      newOtp[i] = e.target.value;
                      setOtp(newOtp.join(''));
                    }}
                    className={`w-12 h-14 text-center text-xl font-bold rounded-xl border focus:border-blue-500 outline-none transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-gray-300 text-slate-900'}`} 
                  />
                ))}
              </div>

              <button onClick={handleOtpSubmit} disabled={otp.length !== 4 || isProcessing}
                className={`w-full py-4 rounded-xl font-bold flex justify-center items-center transition-all ${otp.length === 4 && !isProcessing ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                {isProcessing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : `Pay ₹${amount}`}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="flex-1 flex flex-col items-center justify-center py-10 animate-fade-in scale-in">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl mb-4 shadow-lg shadow-green-500/30">
                ✓
              </div>
              <p className={`font-black text-xl mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Payment Successful</p>
              <p className="text-sm text-gray-500">Redirecting to merchant...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`py-3 px-4 flex justify-center items-center space-x-1 border-t ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
          <span className="text-[10px] text-gray-400 font-medium">Secured by</span>
          <span className="text-[10px] font-black text-slate-500 tracking-wider">RAZORPAY</span>
        </div>
      </div>
    </div>
  );
};

export default RazorpayModal;
