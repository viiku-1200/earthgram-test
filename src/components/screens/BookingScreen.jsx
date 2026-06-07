import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TIME_SLOTS, BOOKING_DATES, MY_BOOKINGS } from '../../data/constants';

const BookingScreen = ({ isDarkMode, onClose, userBookings = [], addBooking, cancelBooking: appCancelBooking, userCoins, setUserCoins, allianceCoins, setAllianceCoins, userTransactions, setUserTransactions }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const provider = location.state?.provider;
  const service = location.state?.service;
  const category = location.state?.category;
  const subCategory = location.state?.subCategory;
  const navigateMode = location.state?.mode;

  const [selectedDate, setSelectedDate] = useState('d1');
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Logic: If instant match but no sub-category, show picker first
  const initialStep = location.state?.step || 
                      ((navigateMode === 'instant' && !subCategory) ? 'service-picker' : 
                       (navigateMode === 'instant') ? 'radar' : 
                       provider ? 'select' : 'mode-select');

  const [step, setStep] = useState(initialStep);
  const [bookingMode, setBookingMode] = useState(navigateMode || (provider ? 'manual' : null));
  const [selectedSubCat, setSelectedSubCat] = useState(subCategory);
  const [address, setAddress] = useState(() => localStorage.getItem('earthgram_user_address') || 'Flat 302, Tower B, Gaur City 2');
  
  // Instant Match Radar State
  const [radarStatus, setRadarStatus] = useState('searching'); // searching, found, confirmed
  const [foundProvider, setFoundProvider] = useState(null);
  const [trackingProgress, setTrackingProgress] = useState(0);

  useEffect(() => {
    if (bookingMode === 'instant' && step === 'radar') {
      const timer = setTimeout(() => {
        setRadarStatus('found');
        setFoundProvider({
          id: 'matched-1',
          name: 'Rajesh Kumar',
          rating: 4.9,
          reviews: 128,
          distance: '0.8 km',
          price: '₹249',
          image: 'RK',
          category: selectedSubCat || category?.name || 'Home Expert'
        });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [bookingMode, step, category, selectedSubCat]);

  // Simulate Tracking Progress
  useEffect(() => {
    if (step === 'tracking') {
      const interval = setInterval(() => {
        setTrackingProgress(prev => (prev < 100 ? prev + 1 : 100));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [step]);

  // ========= QUICK SERVICE PICKER =========
  if (step === 'service-picker') {
    const subCats = category?.subTabs?.filter(t => t.name !== 'All') || [];
    return (
      <div className={`absolute inset-0 z-50 flex flex-col animate-slide-up transition-all duration-500 ${
        isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="px-5 pt-12 pb-4 relative z-10">
          <div className="flex items-center space-x-4">
            <button onClick={() => setStep('mode-select')} className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'
            }`}>←</button>
            <h1 className="text-xl font-black">Which service?</h1>
          </div>
          <p className={`text-xs mt-1 ml-12 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Select a specific {category?.name} service</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 gap-4 animate-fade-in">
          {subCats.map((sub, i) => (
            <button key={sub.name}
              onClick={() => { setSelectedSubCat(sub.name); setStep('radar'); }}
              className={`p-6 rounded-[2.5rem] border-2 flex flex-col items-center justify-center text-center transition-all active:scale-95 group ${
                isDarkMode ? 'bg-slate-900/50 border-slate-800 hover:border-indigo-500/50' : 'bg-white border-gray-100 shadow-premium hover:border-indigo-200'
              }`}
              style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
              <div className={`w-16 h-16 ${sub.bg || 'bg-indigo-50'} rounded-3xl flex items-center justify-center text-3xl mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                {sub.icon}
              </div>
              <span className="text-sm font-black tracking-tight">{sub.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Combined bookings: user-created + mock data
  const allBookings = [...userBookings, ...MY_BOOKINGS];
  const [activeHistoryTab, setActiveHistoryTab] = useState('present');
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [viewingBooking, setViewingBooking] = useState(null);

  const handleCancelBooking = (bookingId) => {
    if (appCancelBooking) appCancelBooking(bookingId);
    setCancelConfirm(null);
  };

  // Create a real booking when user completes the flow
  const createBooking = (providerData, dateInfo, timeInfo) => {
    const selectedDateObj = BOOKING_DATES.find(d => d.id === (dateInfo || selectedDate));
    const selectedTimeObj = TIME_SLOTS.find(t => t.id === (timeInfo || selectedSlot));
    const rawPrice = providerData?.price || service?.price || '₹249';
    const priceNum = parseInt(rawPrice.replace('₹', '').replace(',', '')) || 249;

    // Deduct coins from userCoins
    setUserCoins(prev => {
      const updatedBalance = prev - priceNum;
      
      // Log Transaction
      const newTxn = {
        id: 'w_' + Date.now(),
        type: 'debit',
        title: `Paid ${providerData?.name || 'Provider'}`,
        amount: `-₹${priceNum}`,
        date: 'Just now',
        method: 'ItzWallet',
        icon: '🔧'
      };
      setUserTransactions(prevTxns => [newTxn, ...prevTxns]);
      return updatedBalance;
    });

    const newBooking = {
      id: 'bk_' + Date.now(),
      provider: providerData?.name || 'Service Provider',
      service: selectedSubCat || service?.name || providerData?.category || 'Expert Service',
      price: rawPrice,
      date: `${selectedDateObj?.day || 'Today'}, ${selectedDateObj?.date || ''} ${selectedTimeObj?.time || ''}`.trim(),
      status: 'upcoming',
      icon: providerData?.avatar || '⚡',
      address: address,
      rating: null,
    };
    if (addBooking) addBooking(newBooking);
    return newBooking;
  };

  const handleRebook = (booking) => {
    onClose();
    // Navigate back home so user can find the provider again
    navigate('/');
  };

  // If history view
  if (step === 'history') {
    const filteredBookings = allBookings.filter(b => {
      if (activeHistoryTab === 'present') return b.status === 'present';
      if (activeHistoryTab === 'upcoming') return b.status === 'upcoming';
      if (activeHistoryTab === 'past') return b.status === 'past' || b.status === 'cancelled';
      return false;
    });

    // ====== VIEW DETAILS OVERLAY ======
    if (viewingBooking) {
      return (
        <div className={`absolute inset-0 z-50 flex flex-col animate-slide-up transition-all duration-500 ${
          isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gradient-to-b from-white to-gray-50 text-gray-900'
        }`}>
          <div className="px-5 pt-12 pb-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => setViewingBooking(null)} className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform text-sm font-bold ${
                isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'
              }`}>←</button>
              <h1 className="text-xl font-extrabold">Booking Details</h1>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5 hide-scrollbar pb-28">
            {/* Provider Card */}
            <div className={`p-6 rounded-3xl border-2 text-center ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-premium'
            }`}>
              <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg mb-4 ${
                viewingBooking.status === 'present' ? 'bg-gradient-to-br from-emerald-500 to-green-600' :
                viewingBooking.status === 'upcoming' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' :
                viewingBooking.status === 'cancelled' ? 'bg-gradient-to-br from-red-400 to-red-500' :
                'bg-gradient-to-br from-gray-400 to-gray-500'
              }`}>
                {viewingBooking.icon}
              </div>
              <h2 className="text-xl font-black">{viewingBooking.provider}</h2>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{viewingBooking.service}</p>
              <span className={`inline-block mt-3 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                viewingBooking.status === 'present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                viewingBooking.status === 'upcoming' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                viewingBooking.status === 'cancelled' ? 'bg-red-50 text-red-500 border border-red-100' :
                'bg-gray-100 text-gray-500 border border-gray-200'
              }`}>
                {viewingBooking.status === 'present' ? '⚡ Active Now' : 
                 viewingBooking.status === 'upcoming' ? '⏰ Upcoming' : 
                 viewingBooking.status === 'cancelled' ? '✕ Cancelled' : '✓ Completed'}
              </span>
            </div>

            {/* Details List */}
            <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-premium'}`}>
              {[
                { label: 'Service', value: viewingBooking.service, icon: '🔧' },
                { label: 'Date & Time', value: viewingBooking.date, icon: '📅' },
                { label: 'Price', value: viewingBooking.price, icon: '💰' },
                { label: 'Address', value: viewingBooking.address, icon: '📍' },
                { label: 'Booking ID', value: viewingBooking.id.toUpperCase(), icon: '🔖' },
              ].map((item, i) => (
                <div key={i} className={`flex items-center justify-between px-5 py-4 ${
                  i < 4 ? (isDarkMode ? 'border-b border-slate-800' : 'border-b border-gray-50') : ''
                }`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{item.label}</span>
                  </div>
                  <span className="text-sm font-black">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Rating for past bookings */}
            {viewingBooking.status === 'past' && viewingBooking.rating && (
              <div className={`p-5 rounded-2xl border text-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-premium'}`}>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Your Rating</p>
                <div className="flex justify-center space-x-1 text-2xl">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < viewingBooking.rating ? '' : 'opacity-20'}>⭐</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className={`absolute bottom-0 left-0 right-0 border-t px-5 py-3 pb-6 ${isDarkMode ? 'bg-slate-900/90 border-slate-800 backdrop-blur-xl' : 'glass border-gray-100/50'}`}>
            {(viewingBooking.status === 'present' || viewingBooking.status === 'upcoming') ? (
              <div className="flex space-x-3">
                <button onClick={() => navigate('/chat')}
                  className={`flex-1 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-[0.98] ${
                    isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'
                  }`}>💬 Chat Provider</button>
                <button onClick={() => { setCancelConfirm(viewingBooking); setViewingBooking(null); }}
                  className="flex-1 py-3.5 rounded-2xl font-black text-sm bg-red-50 text-red-600 border border-red-100 active:scale-[0.98] transition-all">
                  ✕ Cancel
                </button>
              </div>
            ) : viewingBooking.status === 'past' ? (
              <button onClick={() => handleRebook(viewingBooking)}
                className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white active:scale-[0.98] transition-all shadow-glow-indigo">
                🔄 Rebook This Service
              </button>
            ) : (
              <button onClick={() => setViewingBooking(null)}
                className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all active:scale-[0.98] ${
                  isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'
                }`}>Close</button>
            )}
          </div>
        </div>
      );
    }

    // ====== CANCEL CONFIRMATION MODAL ======
    if (cancelConfirm) {
      return (
        <div className={`absolute inset-0 z-50 flex flex-col animate-slide-up transition-all duration-500 ${
          isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gradient-to-b from-white to-gray-50 text-gray-900'
        }`}>
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border-2 border-red-100">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-black text-center mb-2">Cancel Booking?</h2>
            <p className={`text-sm text-center mb-2 max-w-[280px] ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Are you sure you want to cancel the service from <span className="font-bold">{cancelConfirm.provider}</span>?
            </p>
            <p className={`text-[10px] text-center mb-8 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
              "{cancelConfirm.service}" • {cancelConfirm.price}
            </p>

            <div className={`w-full p-4 rounded-2xl border mb-8 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-amber-50 border-amber-100'}`}>
              <p className="text-[10px] font-bold text-amber-600 text-center">
                ⚡ Cancellation is instant. Refund will be processed within 24 hours.
              </p>
            </div>

            <div className="w-full space-y-3">
              <button onClick={() => handleCancelBooking(cancelConfirm.id)}
                className="w-full py-4 rounded-2xl font-black text-sm bg-red-500 text-white active:scale-[0.98] transition-all shadow-lg">
                Yes, Cancel Booking
              </button>
              <button onClick={() => setCancelConfirm(null)}
                className={`w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.98] ${
                  isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                No, Keep It
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ====== MAIN HISTORY LIST ======
    return (
      <div className={`absolute inset-0 z-50 flex flex-col animate-slide-up transition-all duration-500 ${
        isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gradient-to-b from-white to-gray-50 text-gray-900'
      }`}>
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center space-x-4">
            <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform text-sm font-bold ${
              isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'
            }`}>←</button>
            <h1 className="text-xl font-extrabold">My Bookings</h1>
          </div>
          <div className={`flex space-x-1 mt-4 rounded-xl p-1 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
            {['present', 'upcoming', 'past'].map(tab => (
              <button key={tab} onClick={() => setActiveHistoryTab(tab)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                  activeHistoryTab === tab 
                    ? (isDarkMode ? 'bg-indigo-500 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm border border-gray-100') 
                    : 'text-gray-500'
                }`}>
                {tab === 'present' ? 'Active ⚡' : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 hide-scrollbar pb-8">
          {filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <p className="text-sm font-bold">No {activeHistoryTab === 'present' ? 'active' : activeHistoryTab} bookings</p>
              <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`}>
                {activeHistoryTab === 'present' ? 'No services are running right now' : 
                 activeHistoryTab === 'upcoming' ? 'Book a service to see it here' : 'Your completed bookings will appear here'}
              </p>
            </div>
          ) : (
            filteredBookings.map((booking, i) => (
              <div key={booking.id} className={`p-4 rounded-2xl border shadow-premium card-lift animate-fade-in ${
                isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-100/50'
              }`}
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-sm ${
                    booking.status === 'present' ? 'bg-gradient-to-br from-emerald-500 to-green-600 animate-pulse' :
                    booking.status === 'upcoming' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' :
                    booking.status === 'cancelled' ? 'bg-gradient-to-br from-red-400 to-red-500' :
                    'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}>
                    {booking.provider.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black">{booking.provider}</h3>
                    <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{booking.service}</p>
                  </div>
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-full flex items-center space-x-1 ${
                    booking.status === 'present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    booking.status === 'upcoming' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                    booking.status === 'cancelled' ? 'bg-red-50 text-red-500 border border-red-100' :
                    'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}>
                    {booking.status === 'present' ? (
                      <>
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping mr-1"></span>
                        <span>Active Now</span>
                      </>
                    ) : booking.status === 'upcoming' ? '⏰ Upcoming' : 
                      booking.status === 'cancelled' ? '✕ Cancelled' : '✓ Completed'}
                  </span>
                </div>
                <div className={`flex items-center justify-between text-xs border-t pt-3 ${isDarkMode ? 'border-slate-800' : 'border-gray-50'}`}>
                  <span className={`flex items-center space-x-1 text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span>{booking.date}</span>
                  </span>
                  <span className="font-extrabold">{booking.price}</span>
                </div>

                {/* Booking Actions */}
                {(booking.status === 'present' || booking.status === 'upcoming') && (
                  <div className={`flex space-x-2 mt-4 border-t pt-3 ${isDarkMode ? 'border-dashed border-slate-800' : 'border-dashed border-gray-100'}`}>
                    <button onClick={() => setViewingBooking(booking)} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all active:scale-95 ${
                      isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-50 text-gray-600'
                    }`}>View Details</button>
                    <button onClick={() => setCancelConfirm(booking)} className="flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] bg-red-50 text-red-600 border border-red-100 transition-all active:scale-95">Cancel Service</button>
                  </div>
                )}

                {/* Past booking actions */}
                {(booking.status === 'past' || booking.status === 'cancelled') && (
                  <div className={`flex space-x-2 mt-4 border-t pt-3 ${isDarkMode ? 'border-dashed border-slate-800' : 'border-dashed border-gray-100'}`}>
                    <button onClick={() => setViewingBooking(booking)} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all active:scale-95 ${
                      isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-50 text-gray-600'
                    }`}>View Details</button>
                    <button onClick={() => handleRebook(booking)} className="flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] bg-indigo-50 text-indigo-600 border border-indigo-100 transition-all active:scale-95">🔄 Rebook</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ========= MODE SELECTOR =========
  if (step === 'mode-select') {
    return (
      <div className={`absolute inset-0 z-50 flex flex-col animate-slide-up transition-all duration-500 ${
        isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gradient-to-b from-white to-gray-50 text-gray-900'
      }`}>
        <div className="px-5 pt-12 pb-4">
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center mb-4 ${
            isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'
          }`}>←</button>
          <h1 className="text-2xl font-black tracking-tight">How would you like to book?</h1>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Choose the way that fits your schedule</p>
        </div>

        <div className="flex-1 p-5 space-y-4">
          {/* Instant Match */}
          <button 
            onClick={() => { setBookingMode('instant'); setStep(subCategory ? 'radar' : 'service-picker'); }}
            className={`w-full p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group active:scale-[0.98] ${
              isDarkMode ? 'bg-slate-900 border-indigo-500/30 shadow-indigo-500/10 shadow-lg' : 'bg-white border-indigo-100 shadow-premium'
            }`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 group-hover:scale-175 transition-transform text-2xl">⚡</div>
            <div className="flex items-center space-x-4 mb-3">
              <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-2xl shadow-glow-indigo text-white">⚡</div>
              <div>
                <h3 className="font-black text-lg">Instant Match</h3>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Speed booking</p>
              </div>
            </div>
            <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              We'll find the best available expert near you right now. 
              Average wait time: <span className="font-bold text-emerald-500">2 mins</span>.
            </p>
          </button>

          {/* Manual Select */}
          <button 
            onClick={onClose} 
            className={`w-full p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group active:scale-[0.98] ${
              isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-100 shadow-premium'
            }`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 group-hover:scale-175 transition-transform text-2xl">🔍</div>
            <div className="flex items-center space-x-4 mb-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>🔍</div>
              <div>
                <h3 className="font-black text-lg">Browse & Choose</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Best for planning</p>
              </div>
            </div>
            <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Check profiles, read reviews, and compare quality before booking. 
              Take your time to find the perfect expert.
            </p>
          </button>
        </div>
      </div>
    );
  }

  // ========= INSTANT RADAR SCREEN =========
  if (step === 'radar') {
    return (
      <div className={`absolute inset-0 z-50 flex flex-col animate-slide-up transition-all duration-500 ${
        isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="px-5 pt-12 pb-4 relative z-10">
          <div className="flex items-center justify-between">
            <button onClick={() => setStep(subCategory ? 'mode-select' : 'service-picker')} className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'
            }`}>←</button>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 animate-pulse">Live Search</span>
            <div className="w-8"></div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
          {radarStatus === 'searching' && (
            <>
              <div className="relative w-64 h-64 mb-12">
                <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full animate-ping"></div>
                <div className="absolute inset-4 border-2 border-indigo-500/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-8 border-2 border-indigo-500/40 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-indigo-500/10 rounded-full border border-indigo-500/50 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-conic-gradient from-indigo-500/40 to-transparent animate-spin-slow text-indigo-500"></div>
                    <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl shadow-glow-indigo relative z-10">⚡</div>
                  </div>
                </div>
              </div>
              <h2 className="text-xl font-black text-center">Finding your {selectedSubCat || 'Expert'}...</h2>
              <p className={`text-sm text-center mt-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>Matching with certified {category?.name} pros</p>
            </>
          )}

          {radarStatus === 'found' && foundProvider && (
            <div className="w-full max-w-sm animate-scale-in">
              <div className={`p-6 rounded-3xl border-2 text-center transition-all ${
                isDarkMode ? 'bg-slate-900 border-emerald-500/30' : 'bg-white border-emerald-100 shadow-xl'
              }`}>
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl mx-auto mb-4 flex items-center justify-center text-white text-3xl font-black shadow-glow-green">
                  {foundProvider.image}
                </div>
                <h2 className="text-2xl font-black tracking-tight text-emerald-500 text-center">Match Found!</h2>
                <h3 className="text-lg font-bold mt-1 text-center">{foundProvider.name}</h3>
                <div className="flex justify-center items-center space-x-3 mt-2 mb-6">
                  <span className="text-xs font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-lg flex items-center">
                    ★ {foundProvider.rating}
                  </span>
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                    {foundProvider.distance} away
                  </span>
                </div>
                
                <div className={`p-4 rounded-2xl mb-6 flex justify-between items-center ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Fare</p>
                    <p className="text-lg font-black">{foundProvider.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Arrival</p>
                    <p className="text-lg font-black text-emerald-500">5 Mins</p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    createBooking(foundProvider, 'd1', null); // Instant match, assume today
                    setStep('tracking');
                  }}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-2xl font-black text-sm active:scale-[0.98] transition-transform shadow-glow-green">
                  CONFIRM & ARRIVE →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========= LIVE TRACKING SCREEN =========
  if (step === 'tracking') {
    const activeProvider = foundProvider || provider;
    const statuses = [
      { id: 1, label: 'Expert matched', time: '10:30 AM', done: true },
      { id: 2, label: 'Heading to your location', time: '10:32 AM', done: trackingProgress > 30 },
      { id: 3, label: 'Expert arrived', time: '--', done: trackingProgress === 100 },
    ];

    return (
      <div className={`absolute inset-0 z-50 flex flex-col animate-slide-up transition-all duration-500 ${
        isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="relative h-2/5 w-full">
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-slate-800' : 'bg-indigo-50'} overflow-hidden`}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full animate-ping absolute -inset-0"></div>
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white relative z-10 shadow-lg border-2 border-white">🏠</div>
              </div>
            </div>
            <div className="absolute transition-all duration-[3000ms] ease-linear" 
              style={{ top: `${40 + (trackingProgress * 0.1)}%`, left: `${20 + (trackingProgress * 0.3)}%` }}>
              <div className="relative">
                <div className="w-8 h-8 bg-emerald-500/30 rounded-full animate-ping absolute -inset-0"></div>
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white relative z-10 shadow-md border-2 border-white text-xs">🏃</div>
              </div>
            </div>
          </div>
          <div className="absolute top-12 left-5 z-20">
            <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white shadow-lg flex items-center justify-center text-gray-900 font-bold">←</button>
          </div>
          <div className="absolute bottom-4 left-5 right-5 z-20">
            <div className="bg-emerald-500 text-white px-4 py-2 rounded-2xl shadow-lg flex items-center justify-between font-black">
              <span className="text-[10px] uppercase tracking-widest">Arrival</span>
              <span className="text-sm">{Math.max(0, 5 - Math.floor(trackingProgress / 20))} Mins</span>
            </div>
          </div>
        </div>

        <div className={`flex-1 p-6 rounded-t-[3rem] -mt-8 relative z-20 shadow-premium border-t ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-gray-100'
        }`}>
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-black">
                {activeProvider?.image || activeProvider?.name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-lg font-black">{activeProvider?.name}</h3>
                <p className="text-xs font-bold text-gray-400">{selectedSubCat || activeProvider?.category || 'Expert'}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => navigate('/chat')} className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl">💬</button>
              <button className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">📞</button>
            </div>
          </div>

          <div className="space-y-6">
            {statuses.map((s, idx) => (
              <div key={s.id} className="flex items-start space-x-4">
                <div className="flex flex-col items-center mt-1">
                  <div className={`w-3 h-3 rounded-full ${s.done ? 'bg-emerald-500' : 'bg-gray-200'} z-10 transition-colors duration-500`}></div>
                  {idx < statuses.length - 1 && <div className={`w-[2px] h-10 ${s.done ? 'bg-emerald-500' : 'bg-gray-100'} transition-colors`}></div>}
                </div>
                <div className="flex-1 -mt-1 flex justify-between">
                   <p className={`text-sm font-bold ${s.done ? (isDarkMode ? 'text-white' : 'text-gray-900') : 'text-gray-300'}`}>{s.label}</p>
                   <span className="text-[10px] text-gray-400 font-bold">{s.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ========= SUCCESS SCREEN =========
  if (step === 'success') {
    const finalProvider = foundProvider || provider;
    return (
      <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-8 animate-slide-up ${
        isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mb-6 shadow-glow-green">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-black mb-2 text-center">Booking Confirmed! \u2705</h2>
        <p className="text-sm text-center mb-6 text-gray-500">Your service has been booked successfully</p>
        <div className={`w-full rounded-3xl p-6 space-y-4 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-100 shadow-premium'}`}>
           <div className="text-center pb-2">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Rate your experience</p>
             <div className="flex justify-center space-x-2 text-3xl">
                {['⭐', '⭐', '⭐', '⭐', '⭐'].map((s, i) => (
                  <button key={i} className="hover:scale-125 transition-transform">⭐</button>
                ))}
             </div>
           </div>
           <div className={`border-t pt-4 space-y-3 ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
              <div className="flex justify-between text-xs"><span className="text-gray-400">Paid to</span><span className="font-bold">{finalProvider?.name}</span></div>
              <div className="flex justify-between"><span className="text-xs text-gray-400">Total Amount</span><span className="text-sm font-black text-emerald-600">{finalProvider?.price || '₹249'}</span></div>
           </div>
        </div>
        <div className="flex space-x-3 w-full mt-8">
          <button onClick={() => { setStep('history'); }} className={`flex-1 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'}`}>View Bookings</button>
          <button onClick={onClose} className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-all">Back to Home</button>
        </div>
      </div>
    );
  }

  // ========= MANUAL BOOKING FLOW (DATE & TIME) =========
  return (
    <div className={`absolute inset-0 z-50 flex flex-col animate-slide-up transition-all duration-500 ${
      isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gradient-to-b from-white to-gray-50 text-gray-900'
    }`}>
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center space-x-4">
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform text-sm font-bold ${
            isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'
          }`}>←</button>
          <div>
            <h1 className="text-lg font-extrabold">Book Service</h1>
            <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{provider?.name} • {service?.name || 'Expert Service'}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-6 hide-scrollbar pb-28">
        <div>
          <h3 className="text-sm font-extrabold mb-3 flex items-center space-x-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>Select Date</span>
          </h3>
          <div className="flex space-x-3 overflow-x-auto hide-scrollbar">
            {BOOKING_DATES.map(date => (
              <button key={date.id} onClick={() => date.available && setSelectedDate(date.id)} disabled={!date.available}
                className={`flex-shrink-0 w-20 py-3 rounded-2xl text-center transition-all ${
                  selectedDate === date.id ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow-indigo scale-105' :
                  date.available ? (isDarkMode ? 'bg-slate-800 border border-slate-700 text-slate-300' : 'bg-white border border-gray-200 text-gray-700 shadow-premium') :
                  'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}>
                <p className="text-[10px] font-bold opacity-70">{date.day}</p>
                <p className="text-sm font-extrabold mt-0.5">{date.date}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-extrabold mb-3 flex items-center space-x-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Select Time Slot</span>
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map(slot => (
              <button key={slot.id} onClick={() => slot.available && setSelectedSlot(slot.id)} disabled={!slot.available}
                className={`py-3 rounded-xl text-sm font-bold transition-all ${
                  selectedSlot === slot.id ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow-indigo scale-105' :
                  slot.available ? (isDarkMode ? 'bg-slate-800 border border-slate-700 text-slate-300' : 'bg-white border border-gray-200 text-gray-700 shadow-premium') :
                  'bg-gray-100 text-gray-300 line-through cursor-not-allowed'
                }`}>
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 border-t px-5 py-3 pb-6 ${isDarkMode ? 'bg-slate-900/90 border-slate-800 backdrop-blur-xl' : 'glass border-gray-100/50'}`}>
        <button onClick={() => {
            if (selectedSlot) {
              createBooking(provider, selectedDate, selectedSlot);
              setStep('success');
            }
          }} disabled={!selectedSlot}
          className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center space-x-2 ${
            selectedSlot ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white active:scale-[0.98] shadow-glow-indigo' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}>
          <span>Continue to Pay</span><span>→</span>
        </button>
      </div>
    </div>
  );
};

export default BookingScreen;
