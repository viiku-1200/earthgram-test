import React, { useState } from 'react';

const ServiceCatalogScreen = ({ isDarkMode, onClose }) => {
  const [services, setServices] = useState([
    { id: 1, name: 'Standard Service', desc: 'Basic service package', price: '₹200', duration: '30 min', active: true },
    { id: 2, name: 'Premium Service', desc: 'Comprehensive premium package', price: '₹500', duration: '60 min', active: true },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', desc: '', price: '', duration: '30 min' });

  const durations = ['15 min', '30 min', '45 min', '1 hour', '2 hours', '3 hours', 'Full day'];

  const handleSave = () => {
    if (!form.name.trim() || !form.price.trim()) return;
    if (editId) {
      setServices(prev => prev.map(s => s.id === editId ? { ...s, ...form } : s));
      setEditId(null);
    } else {
      setServices(prev => [...prev, { id: Date.now(), ...form, active: true }]);
    }
    setForm({ name: '', desc: '', price: '', duration: '30 min' });
    setShowAdd(false);
  };

  const handleEdit = (service) => {
    setForm({ name: service.name, desc: service.desc, price: service.price, duration: service.duration });
    setEditId(service.id);
    setShowAdd(true);
  };

  const handleDelete = (id) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const toggleActive = (id) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  // Add/Edit Form
  if (showAdd) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 z-50 flex flex-col animate-slide-up">
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => { setShowAdd(false); setEditId(null); setForm({ name: '', desc: '', price: '', duration: '30 min' }); }}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition-transform text-sm font-bold">←</button>
            <h1 className="text-lg font-extrabold text-gray-900">{editId ? 'Edit Service' : 'Add Service'}</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 hide-scrollbar pb-28">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Service Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Fan Installation" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 transition-colors" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Description</label>
            <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })}
              placeholder="Describe what's included" rows="3"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none focus:border-blue-500 transition-colors" />
          </div>
          <div className="flex space-x-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Price *</label>
              <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
                <span className="text-sm font-bold text-gray-400 mr-1">₹</span>
                <input type="text" value={form.price.replace('₹', '')}
                  onChange={e => setForm({ ...form, price: `₹${e.target.value}` })}
                  placeholder="200" className="flex-1 outline-none text-sm font-medium bg-transparent" />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Duration</label>
              <select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none appearance-none">
                {durations.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Preview */}
          {form.name && (
            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Preview</h3>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900">{form.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{form.desc || 'No description'}</p>
                  </div>
                  <div className="text-right ml-3">
                    <span className="text-sm font-black text-gray-900">{form.price || '₹0'}</span>
                    <p className="text-[10px] text-gray-400 mt-0.5">⏱️ {form.duration}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 glass border-t border-gray-100/50 px-5 py-3 pb-6">
          <button onClick={handleSave}
            disabled={!form.name.trim() || !form.price.trim()}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all ${
              form.name.trim() && form.price.trim() ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white active:scale-[0.98] shadow-glow-indigo' : 'bg-gray-200 text-gray-400'
            }`}>
            {editId ? 'Update Service' : 'Add Service'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 z-50 flex flex-col animate-slide-up">
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition-transform text-sm font-bold">←</button>
            <div>
              <h1 className="text-lg font-extrabold text-gray-900">Service Catalog</h1>
              <p className="text-[10px] text-gray-400">{services.length} services listed</p>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform shadow-glow-indigo">
            + Add
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3 hide-scrollbar pb-24">
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-5xl mb-4">🛠️</span>
            <p className="text-sm font-bold">No services yet</p>
            <p className="text-xs mt-1">Add your first service to start receiving bookings</p>
            <button onClick={() => setShowAdd(true)}
              className="mt-4 bg-black text-white px-6 py-3 rounded-xl text-sm font-bold active:scale-95 transition-transform">
              + Add Service
            </button>
          </div>
        ) : (
          services.map(service => (
            <div key={service.id} className={`bg-white p-4 rounded-2xl border shadow-sm transition-opacity ${service.active ? 'border-gray-100' : 'border-gray-200 opacity-50'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-gray-900">{service.name}</h3>
                    {!service.active && <span className="text-[8px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Paused</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{service.desc}</p>
                </div>
                <div className="text-right ml-3">
                  <span className="text-base font-black text-gray-900">{service.price}</span>
                  <p className="text-[10px] text-gray-400">⏱️ {service.duration}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-2">
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(service)} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full active:scale-95 transition-transform">✏️ Edit</button>
                  <button onClick={() => handleDelete(service.id)} className="text-[10px] font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full active:scale-95 transition-transform">🗑️ Delete</button>
                </div>
                <button onClick={() => toggleActive(service.id)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${service.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${service.active ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceCatalogScreen;
