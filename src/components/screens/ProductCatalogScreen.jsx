import React, { useState } from 'react';

const ProductCatalogScreen = ({ isDarkMode, onClose }) => {
  const [products, setProducts] = useState([
    { id: 1, name: 'Premium Organic Coffee', desc: 'Freshly roasted arabica beans (250g)', price: '₹450', stock: 'In Stock', active: true, image: '☕' },
    { id: 2, name: 'Handcrafted Ceramic Mug', desc: 'Artisan made coffee mug', price: '₹299', stock: 'Low Stock', active: true, image: '🏺' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', desc: '', price: '', stock: 'In Stock', image: '📦' });

  const stockOptions = ['In Stock', 'Low Stock', 'Out of Stock'];
  const imageIcons = ['📦', '☕', '🏺', '👕', '📱', '🍔', '💄', '🛒', '🍎', '👟'];

  const handleSave = () => {
    if (!form.name.trim() || !form.price.trim()) return;
    if (editId) {
      setProducts(prev => prev.map(p => p.id === editId ? { ...p, ...form } : p));
      setEditId(null);
    } else {
      setProducts(prev => [...prev, { id: Date.now(), ...form, active: true }]);
    }
    setForm({ name: '', desc: '', price: '', stock: 'In Stock', image: '📦' });
    setShowAdd(false);
  };

  const handleEdit = (product) => {
    setForm({ name: product.name, desc: product.desc, price: product.price, stock: product.stock, image: product.image });
    setEditId(product.id);
    setShowAdd(true);
  };

  const handleDelete = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleActive = (id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  // Add/Edit Form
  if (showAdd) {
    return (
      <div className={`absolute inset-0 z-50 flex flex-col animate-slide-up ${isDarkMode ? 'bg-[#060B19]' : 'bg-gray-50'}`}>
        <div className={`px-4 pt-12 pb-4 flex items-center border-b ${isDarkMode ? 'border-white/[0.04] bg-[#0A1128]' : 'border-gray-200 bg-white'} shadow-sm`}>
          <button onClick={() => { setShowAdd(false); setEditId(null); setForm({ name: '', desc: '', price: '', stock: 'In Stock', image: '📦' }); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-transform active:scale-90 ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'}`}>
            ←
          </button>
          <h1 className={`text-lg font-black ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{editId ? 'Edit Product' : 'Add Product'}</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 hide-scrollbar pb-28">
          {/* Image Selector */}
          <div className="flex flex-col items-center">
            <label className="relative cursor-pointer group">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => setForm({ ...form, image: event.target.result, isRealImage: true });
                  reader.readAsDataURL(file);
                }
              }} />
              <div className="w-24 h-24 bg-amber-100 rounded-3xl flex items-center justify-center text-4xl mb-2 shadow-sm border-2 border-dashed border-amber-300 overflow-hidden relative transition-all group-hover:border-amber-500 group-hover:bg-amber-50">
                {form.isRealImage || (form.image && form.image.startsWith('data:image')) ? (
                  <img src={form.image} alt="Product" className="w-full h-full object-cover" />
                ) : (
                  <span className="opacity-80">{form.image}</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-[10px] font-black uppercase tracking-widest text-center leading-tight">Upload<br/>Photo</span>
                </div>
              </div>
            </label>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Tap to add photo</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Product Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Running Shoes" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 transition-colors" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
              <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })}
                placeholder="Details about the product..." rows="2"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:border-amber-400 transition-colors" />
            </div>
            <div className="flex space-x-3">
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-700 block mb-1">Price *</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-amber-400 transition-colors">
                  <span className="text-sm font-bold text-gray-400 mr-1">₹</span>
                  <input type="text" value={form.price.replace('₹', '')}
                    onChange={e => setForm({ ...form, price: `₹${e.target.value}` })}
                    placeholder="500" className="flex-1 outline-none text-sm font-medium bg-transparent" />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-700 block mb-1">Stock Status</label>
                <select value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none appearance-none focus:border-amber-400 transition-colors">
                  {stockOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className={`absolute bottom-0 w-full p-4 border-t ${isDarkMode ? 'bg-[#0A1128] border-white/[0.04]' : 'bg-white border-gray-100'} shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]`}>
          <button onClick={handleSave}
            disabled={!form.name.trim() || !form.price.trim()}
            className={`w-full py-4 rounded-xl font-black text-sm transition-all shadow-lg ${
              form.name.trim() && form.price.trim() ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 shadow-amber-500/30 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}>
            {editId ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 z-50 flex flex-col animate-slide-up ${isDarkMode ? 'bg-[#060B19]' : 'bg-gray-50'}`}>
      <div className={`px-4 pt-12 pb-4 border-b flex justify-between items-center ${isDarkMode ? 'border-white/[0.04] bg-[#0A1128]' : 'border-gray-200 bg-white'} shadow-sm`}>
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-transform active:scale-90 ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'}`}>
            ←
          </button>
          <div>
            <h1 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Shop Inventory</h1>
            <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{products.length} products listed</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 px-4 py-2 rounded-xl text-xs font-black shadow-md active:scale-95 transition-transform">
          + Add New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar pb-24">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-5xl mb-4">🛒</span>
            <p className="text-sm font-bold text-gray-500">Your shop is empty</p>
            <p className="text-xs mt-1">Add your first physical product to start selling</p>
          </div>
        ) : (
          products.map(product => (
            <div key={product.id} className={`bg-white p-3 rounded-2xl border shadow-sm transition-opacity flex items-center ${product.active ? 'border-gray-100' : 'border-gray-200 opacity-50'}`}>
              <div className="w-16 h-16 bg-amber-50 rounded-xl flex items-center justify-center text-3xl mr-3 border border-amber-100 overflow-hidden">
                {product.isRealImage || (product.image && product.image.startsWith('data:image')) ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  product.image
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">{product.name}</h3>
                  {!product.active && <span className="text-[8px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Hidden</span>}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{product.desc}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-black text-amber-600">{product.price}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${product.stock === 'In Stock' ? 'bg-green-100 text-green-700' : product.stock === 'Low Stock' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                    {product.stock}
                  </span>
                </div>
              </div>
              
              <div className="ml-2 flex flex-col items-end space-y-2 border-l border-gray-100 pl-3">
                <button onClick={() => toggleActive(product.id)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${product.active ? 'bg-amber-400' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${product.active ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </button>
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(product)} className="text-[10px] font-bold text-blue-600 p-1 active:scale-90">✏️</button>
                  <button onClick={() => handleDelete(product.id)} className="text-[10px] font-bold text-red-600 p-1 active:scale-90">🗑️</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductCatalogScreen;
