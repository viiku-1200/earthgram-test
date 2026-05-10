import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MOCK_UPCOMING = [
  { id: 1, service: 'AC Repair & Service', provider: 'Rahul Sharma', date: 'Tomorrow, 10:00 AM', status: 'Confirmed', price: '₹599', icon: '❄️' },
  { id: 2, service: 'Expert Electrician', provider: 'Amit Kumar', date: '14 May, 02:00 PM', status: 'Pending', price: '₹249', icon: '⚡' },
];

const MOCK_HISTORY = [
  { id: 3, service: 'Professional Cleaning', provider: 'CleanPro Services', date: '08 May, 2024', status: 'Completed', price: '₹1,299', icon: '✨' },
  { id: 4, service: 'Plumbing Checkup', provider: 'Sanjay Repairs', date: '01 May, 2024', status: 'Completed', price: '₹350', icon: '🔧' },
];

const BookingHistoryScreen = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');

  const renderBookingCard = (booking, type) => (
    <div key={booking.id} className={`p-4 rounded-[2rem] mb-4 border transition-all animate-fade-in ${
      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100 shadow-premium'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
            isDarkMode ? 'bg-slate-700' : 'bg-indigo-50 text-indigo-600'
          }`}>
            {booking.icon}
          </div>
          <div>
            <h3 className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{booking.service}</h3>
            <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{booking.provider}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
          booking.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 
          booking.status === 'Confirmed' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
        }`}>
          {booking.status}
        </div>
      </div>

      <div className={`flex items-center justify-between p-3 rounded-2xl mb-4 ${
        isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'
      }`}>
        <div className="flex items-center space-x-2">
          <span className="text-xs">📅</span>
          <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>{booking.date}</span>
        </div>
        <div className="font-black text-xs text-indigo-600">{booking.price}</div>
      </div>

      <div className="flex space-x-2">
        {type === 'upcoming' ? (
          <>
            <button className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-[10px] font-black active:scale-95 transition-transform shadow-lg shadow-indigo-500/20">
              CALL PROVIDER
            </button>
            <button className={`flex-1 py-2.5 rounded-xl text-[10px] font-black active:scale-95 transition-transform border ${
              isDarkMode ? 'border-slate-700 text-slate-400' : 'border-gray-200 text-gray-500'
            }`}>
              CANCEL
            </button>
          </>
        ) : (
          <button className={`w-full py-2.5 rounded-xl text-[10px] font-black active:scale-95 transition-transform border flex items-center justify-center space-x-2 ${
            isDarkMode ? 'border-slate-700 text-emerald-400' : 'border-gray-200 text-emerald-600'
          }`}>
            <span>📄</span>
            <span>VIEW RECEIPT</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className={`h-full flex flex-col pt-12 pb-20 overflow-y-auto hide-scrollbar transition-all duration-500 ${
      isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <div className="px-5 flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-premium border ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
        }`}>
          ←
        </button>
        <h1 className="text-xl font-black tracking-tight">My Bookings</h1>
        <div className="w-10"></div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-8">
        <div className={`flex rounded-[2rem] p-1.5 shadow-inner border ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
        }`}>
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${
              activeTab === 'upcoming' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : (isDarkMode ? 'text-slate-400' : 'text-gray-400')
            }`}>
            Upcoming
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${
              activeTab === 'history' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : (isDarkMode ? 'text-slate-400' : 'text-gray-400')
            }`}>
            History
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5">
        {activeTab === 'upcoming' ? (
          MOCK_UPCOMING.length > 0 ? (
            MOCK_UPCOMING.map(b => renderBookingCard(b, 'upcoming'))
          ) : (
            <div className="text-center py-20">
              <span className="text-4xl mb-4 block">📅</span>
              <p className="text-sm font-bold opacity-40">No upcoming bookings</p>
            </div>
          )
        ) : (
          MOCK_HISTORY.map(b => renderBookingCard(b, 'history'))
        )}
      </div>

      <p className="text-center text-[9px] text-gray-300 font-medium mt-auto mb-4">Official Receipt Portal</p>
    </div>
  );
};

export default BookingHistoryScreen;
