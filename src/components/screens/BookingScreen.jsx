import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { TIME_SLOTS, BOOKING_DATES, MY_BOOKINGS } from '../../data/constants';

const BookingScreen = ({ onClose }) => {
  const location = useLocation();
  const provider = location.state?.provider;
  const service = location.state?.service;
  const [selectedDate, setSelectedDate] = useState('d1');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState('select');
  const [address, setAddress] = useState('Flat 302, Tower B, Gaur City 2');
  const [activeHistoryTab, setActiveHistoryTab] = useState('upcoming');

  // If no provider, show booking history
  if (!provider) {
    const filteredBookings = MY_BOOKINGS.filter(b => {
      if (activeHistoryTab === 'upcoming') return b.status === 'upcoming';
      if (activeHistoryTab === 'completed') return b.status === 'completed';
      return b.status === 'cancelled';
    });

    return (
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 z-50 flex flex-col animate-slide-up">
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center space-x-4">
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition-transform text-sm font-bold">←</button>
            <h1 className="text-xl font-extrabold text-gray-900">My Bookings</h1>
          </div>
          <div className="flex space-x-1 mt-4 bg-gray-100 rounded-xl p-1">
            {['upcoming', 'completed', 'cancelled'].map(tab => (
              <button key={tab} onClick={() => setActiveHistoryTab(tab)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                  activeHistoryTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 hide-scrollbar pb-8">
          {filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <p className="text-sm font-bold">No {activeHistoryTab} bookings</p>
            </div>
          ) : (
            filteredBookings.map((booking, i) => (
              <div key={booking.id} className="bg-white p-4 rounded-2xl border border-gray-100/50 shadow-premium card-lift animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm ${
                    booking.status === 'upcoming' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' :
                    booking.status === 'completed' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                    'bg-gradient-to-br from-red-400 to-red-500'
                  }`}>
                    {booking.provider.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900">{booking.provider}</h3>
                    <p className="text-[10px] text-gray-400">{booking.service}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${
                    booking.status === 'upcoming' ? 'bg-indigo-50 text-indigo-600' :
                    booking.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-red-50 text-red-500'
                  }`}>
                    {booking.status === 'upcoming' ? '⏰ Upcoming' : booking.status === 'completed' ? '✓ Done' : '✕ Cancelled'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-3">
                  <span className="flex items-center space-x-1 text-[10px]">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span>{booking.date}</span>
                  </span>
                  <span className="font-extrabold text-gray-900">{booking.price}</span>
                </div>
                <p className="text-[9px] text-gray-400 mt-1">📍 {booking.address}</p>

                {booking.status === 'completed' && booking.rating && (
                  <div className="flex items-center space-x-1 mt-2">
                    <span className="text-[10px] text-gray-400">Your rating:</span>
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={`text-xs ${i < booking.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                    ))}
                  </div>
                )}

                {booking.status === 'upcoming' && (
                  <div className="flex space-x-2 mt-3">
                    <button className="flex-1 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-600 active:scale-[0.98] transition-transform">Reschedule</button>
                    <button className="flex-1 py-2 bg-red-50 border border-red-100 rounded-xl text-[10px] font-bold text-red-500 active:scale-[0.98] transition-transform">Cancel</button>
                    <button className="flex-1 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-[10px] font-bold active:scale-[0.98] transition-transform">Message</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ========= SUCCESS =========
  if (step === 'success') {
    return (
      <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-8 animate-slide-up">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mb-6 shadow-glow-green">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Your service has been booked successfully</p>
        <div className="w-full bg-gray-50 rounded-2xl p-5 space-y-3 border border-gray-100">
          {[
            ['Provider', provider?.name],
            ['Service', service?.name || 'General Service'],
            ['Date', `${BOOKING_DATES.find(d => d.id === selectedDate)?.day}, ${BOOKING_DATES.find(d => d.id === selectedDate)?.date}`],
            ['Time', TIME_SLOTS.find(s => s.id === selectedSlot)?.time],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-xs text-gray-400">{label}</span>
              <span className="text-xs font-bold text-gray-900">{value}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-gray-200 pt-3">
            <span className="text-sm font-bold text-gray-900">Total</span>
            <span className="text-sm font-extrabold text-emerald-600">{service?.price || provider?.price || '₹200'}</span>
          </div>
        </div>
        <button onClick={onClose}
          className="w-full mt-6 bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform shadow-lg">
          Done
        </button>
      </div>
    );
  }

  // ========= CONFIRM =========
  if (step === 'confirm') {
    const selectedDateObj = BOOKING_DATES.find(d => d.id === selectedDate);
    const selectedSlotObj = TIME_SLOTS.find(s => s.id === selectedSlot);
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 z-50 flex flex-col animate-slide-up">
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => setStep('select')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition-transform text-sm font-bold">←</button>
            <h1 className="text-lg font-extrabold text-gray-900">Confirm Booking</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar pb-28">
          <div className="bg-white p-4 rounded-2xl border border-gray-100/50 shadow-premium flex items-center space-x-3">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-sm">
              {provider.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{provider.name}</h3>
              <p className="text-xs text-gray-400">{service?.name || 'General Service'}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100/50 shadow-premium space-y-3">
            <h3 className="text-sm font-extrabold text-gray-900">Booking Details</h3>
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <div>
                <p className="text-sm font-bold text-gray-900">{selectedDateObj?.day}, {selectedDateObj?.date}</p>
                <p className="text-xs text-gray-400">{selectedSlotObj?.time}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100/50 shadow-premium">
            <h3 className="text-sm font-extrabold text-gray-900 mb-2">Service Address</h3>
            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="flex-1 text-sm text-gray-700 bg-transparent outline-none" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100/50 shadow-premium space-y-2">
            <h3 className="text-sm font-extrabold text-gray-900 mb-2">Payment Summary</h3>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Service charge</span><span className="font-bold text-gray-900">{service?.price || '₹200'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Platform fee</span><span className="font-bold text-emerald-600">₹0</span></div>
            <div className="flex justify-between text-sm border-t border-gray-100 pt-2 mt-2"><span className="font-bold text-gray-900">Total</span><span className="font-extrabold text-gray-900">{service?.price || '₹200'}</span></div>
            <p className="text-[9px] text-emerald-600 font-bold">🎉 ₹0 platform fee — You save more with EarthGram!</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100/50 shadow-premium">
            <h3 className="text-sm font-extrabold text-gray-900 mb-3">Payment Method</h3>
            <div className="space-y-2">
              {[
                { label: 'ItzWallet', desc: 'Balance: ₹450.00', checked: true, bg: 'bg-indigo-50 border-indigo-200', icon: <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
                { label: 'Pay after service', desc: 'Cash / UPI on completion', checked: false, bg: 'bg-gray-50 border-gray-200', icon: <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
              ].map(m => (
                <label key={m.label} className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer ${m.bg}`}>
                  <input type="radio" name="payment" defaultChecked={m.checked} className="accent-indigo-600" />
                  {m.icon}
                  <div><p className="text-sm font-bold text-gray-900">{m.label}</p><p className="text-[9px] text-gray-400">{m.desc}</p></div>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 glass border-t border-gray-100/50 px-5 py-3 pb-6">
          <button onClick={() => setStep('success')}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform shadow-glow-indigo flex items-center justify-center space-x-2">
            <span>Confirm & Book</span><span>→</span>
          </button>
        </div>
      </div>
    );
  }

  // ========= DATE & TIME SELECTION =========
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 z-50 flex flex-col animate-slide-up">
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center space-x-4">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition-transform text-sm font-bold">←</button>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900">Book Service</h1>
            <p className="text-[10px] text-gray-400">{provider.name} • {service?.name || 'Service'}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-6 hide-scrollbar pb-28">
        <div>
          <h3 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center space-x-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>Select Date</span>
          </h3>
          <div className="flex space-x-3 overflow-x-auto hide-scrollbar">
            {BOOKING_DATES.map(date => (
              <button key={date.id} onClick={() => date.available && setSelectedDate(date.id)} disabled={!date.available}
                className={`flex-shrink-0 w-20 py-3 rounded-2xl text-center transition-all ${
                  selectedDate === date.id ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow-indigo scale-105' :
                  date.available ? 'bg-white border border-gray-200 text-gray-700 shadow-premium active:scale-95' :
                  'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}>
                <p className="text-[10px] font-bold opacity-70">{date.day}</p>
                <p className="text-sm font-extrabold mt-0.5">{date.date}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center space-x-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Select Time Slot</span>
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map(slot => (
              <button key={slot.id} onClick={() => slot.available && setSelectedSlot(slot.id)} disabled={!slot.available}
                className={`py-3 rounded-xl text-sm font-bold transition-all ${
                  selectedSlot === slot.id ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow-indigo scale-105' :
                  slot.available ? 'bg-white border border-gray-200 text-gray-700 shadow-premium active:scale-95' :
                  'bg-gray-100 text-gray-300 line-through cursor-not-allowed'
                }`}>
                {slot.time}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100/50 shadow-premium">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-bold text-gray-900">{service?.name || 'Service'}</h4>
              <p className="text-[10px] text-gray-400">{service?.desc || provider.name}</p>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-gray-900">{service?.price || provider.price || '₹200'}</span>
              {service?.time && <p className="text-[9px] text-gray-400">⏱️ {service.time}</p>}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 glass border-t border-gray-100/50 px-5 py-3 pb-6">
        <button onClick={() => selectedSlot && setStep('confirm')} disabled={!selectedSlot}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${
            selectedSlot ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white active:scale-[0.98] shadow-glow-indigo' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}>
          <span>Continue</span><span>→</span>
        </button>
      </div>
    </div>
  );
};

export default BookingScreen;
