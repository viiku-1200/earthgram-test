import React, { useState } from 'react';

const AuthScreen = ({ isDarkMode, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1: Credentials, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      
      setMessage('OTP sent to your email! Please check your inbox.');
      setStep(2); // Move to OTP step
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      
      // Success!
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      // Success!
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'} overflow-hidden`}>
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 -right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className={`relative w-[90%] max-w-md p-8 rounded-3xl shadow-2xl backdrop-blur-xl border ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-white/50'}`}>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform rotate-3">
            <span className="text-3xl">🌍</span>
          </div>
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            {step === 2 ? 'Verify Email' : isLogin ? 'Welcome Back' : 'Join Earthgram'}
          </h2>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {step === 2 ? 'Enter the 6-digit code sent to your email.' : isLogin ? 'Sign in to continue exploring.' : 'Create your account to start booking.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl text-sm font-semibold text-center animate-shake">
            {error}
          </div>
        )}
        
        {message && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 rounded-xl text-sm font-semibold text-center">
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold mb-1 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-100 border-transparent text-slate-900 placeholder-slate-400'}`}
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className={`block text-xs font-bold mb-1 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-100 border-transparent text-slate-900 placeholder-slate-400'}`}
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div className="animate-fade-in">
                <label className={`block text-xs font-bold mb-1 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Confirm Password</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-100 border-transparent text-slate-900 placeholder-slate-400'}`}
                  placeholder="••••••••"
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/30 transition-all active:scale-95 ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'}`}
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4 animate-slide-up">
            <div>
              <label className={`block text-xs font-bold mb-1 uppercase tracking-wider text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>6-Digit Code</label>
              <input 
                type="text" 
                name="otp"
                maxLength="6"
                value={formData.otp}
                onChange={handleChange}
                required
                className={`w-full px-4 py-4 text-center text-3xl tracking-[0.5em] rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-100 border-transparent text-slate-900 placeholder-slate-400'}`}
                placeholder="000000"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/30 transition-all active:scale-95 ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'}`}
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="mt-6 text-center">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className={`text-sm font-semibold transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
