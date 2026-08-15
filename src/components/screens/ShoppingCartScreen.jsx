import React, { useState, useRef } from 'react';
import RazorpayModal from '../ui/RazorpayModal';

const ShoppingCartScreen = ({ isDarkMode, onClose, cartItems = [], setCartItems, provider = null }) => {
  const [paymentStep, setPaymentStep] = useState('cart'); // cart, selection, upi_verify, processing, success
  const [useCoins, setUseCoins] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(''); // 'upi_direct' or 'cashfree'
  const [utrNumber, setUtrNumber] = useState('');
  const [isVerifyingUtr, setIsVerifyingUtr] = useState(false);

  // For demo/testing if cart is empty
  const displayItems = cartItems.length > 0 ? cartItems : [
    { id: 1, name: 'Premium Coffee Beans', price: 450, qty: 2, image: '☕' },
    { id: 2, name: 'Handcrafted Mug', price: 299, qty: 1, image: '🏺' }
  ];

  const updateQty = (id, delta) => {
    if (setCartItems) {
      setCartItems(prev => prev.map(item =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      ));
    }
  };

  const removeItem = (id) => {
    if (setCartItems) setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = displayItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = 0; // Free pickup / direct from shop
  const gst = Math.round(subtotal * 0.05);
  const userCoins = 150;
  const coinDiscount = useCoins ? Math.min(userCoins, Math.round(subtotal * 0.1)) : 0;
  
  // Calculate final totals based on payment method
  const baseTotal = subtotal + gst - coinDiscount;
  const gatewayFee = Math.round(baseTotal * 0.02); // 2% gateway fee
  const finalTotal = paymentMethod === 'cashfree' ? baseTotal + gatewayFee : baseTotal;

  const handleCheckoutClick = () => {
    setPaymentStep('selection');
  };

  const handleLaunchUpi = () => {
    // If a provider prop is passed, use their UPI ID. Otherwise, try to extract from the first cart item.
    const cartProvider = provider || cartItems[0]?.providerObj || {};
    const ownerUpiId = cartProvider.upiId || 'merchant@upi';
    const shopName = cartProvider.brandName || cartProvider.name || 'EarthGram Shop';
    const upiLink = `upi://pay?pa=${ownerUpiId}&pn=${encodeURIComponent(shopName)}&am=${finalTotal}&cu=INR`;
    
    // Launch deep link
    window.location.href = upiLink;
    console.log('Launched real UPI deep link:', upiLink);
  };

  const verifyUtr = () => {
    if (utrNumber.length !== 12) return;
    setIsVerifyingUtr(true);
    // Simulate API verification delay
    setTimeout(() => {
      setIsVerifyingUtr(false);
      setPaymentStep('success');
      if (setCartItems) setCartItems([]);
    }, 2000);
  };

  const handleCashfreePayment = async () => {
    setPaymentMethod('cashfree');
    setPaymentStep('processing');
    try {
      // 1. Get Payment Session ID from Backend
      const response = await fetch('http://localhost:5000/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: baseTotal + gatewayFee,
          customerId: 'user_' + Math.floor(Math.random() * 100000),
          customerPhone: '9999999999',
          customerName: 'EarthGram User'
        })
      });
      const data = await response.json();
      
      if (!data.payment_session_id) {
        throw new Error('Failed to get payment session');
      }

      // 2. Load Cashfree SDK if not loaded
      if (!window.Cashfree) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      // 3. Initialize and Open Cashfree
      const cashfree = window.Cashfree({
        mode: "sandbox" // change to "production" when live
      });

      cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_modal",
      }).then((result) => {
        if(result.error){
            console.error("Payment failed or cancelled:", result.error);
            setPaymentStep('selection'); 
        }
        if(result.paymentDetails){
            console.log("Payment completed", result.paymentDetails);
            setPaymentStep('success');
            if (setCartItems) setCartItems([]);
        }
      });
    } catch (error) {
      console.error(error);
      alert("Payment initiation failed!");
      setPaymentStep('selection');
    }
  };

  // ========= SUCCESS SCREEN =========
  if (paymentStep === 'success') {
    return (
      <div className={`absolute inset-0 z-[200] flex flex-col items-center justify-center px-6 ${isDarkMode ? 'bg-[#060B19]' : 'bg-white'}`}>
        <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center text-6xl mb-6 shadow-lg">
          🎉
        </div>
        <h2 className={`text-2xl font-black text-center mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order Placed!</h2>
        <p className={`text-sm text-center mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {paymentMethod === 'upi_direct' ? 'Your manual payment verification was successful.' : 'Your payment was successfully processed by Razorpay.'}
        </p>

        <div className={`w-full rounded-3xl p-5 border mb-6 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex justify-between text-sm mb-3">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Amount Paid</span>
            <span className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{finalTotal}</span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Payment Method</span>
            <span className="font-bold text-emerald-500">{paymentMethod === 'upi_direct' ? 'UPI Direct (Zero Fee)' : 'Cashfree Gateway'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Status</span>
            <span className="font-bold text-emerald-500 flex items-center space-x-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse inline-block"></span>
              <span>Success</span>
            </span>
          </div>
        </div>

        {/* Coins earned */}
        <div className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-3xl p-4 flex items-center space-x-4 shadow-lg mb-8">
          <span className="text-4xl">🪙</span>
          <div>
            <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Loyalty Reward</p>
            <p className="text-2xl font-black text-amber-900">+{Math.round(finalTotal * 0.1)} Coins Earned!</p>
          </div>
        </div>

        <button onClick={onClose}
          className={`w-full py-4 rounded-2xl font-black text-sm ${isDarkMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}`}>
          Back to Shop
        </button>
      </div>
    );
  }

  // ========= PAYMENT SELECTION SCREEN =========
  if (paymentStep === 'selection') {
    return (
      <div className={`absolute inset-0 z-[200] flex flex-col ${isDarkMode ? 'bg-[#060B19]' : 'bg-white'}`}>
        <div className={`px-5 pt-14 pb-4 flex items-center justify-between border-b ${isDarkMode ? 'border-white/[0.05] bg-[#0A1128]' : 'border-gray-100 bg-white'}`}>
          <div className="flex items-center space-x-3">
            <button onClick={() => setPaymentStep('cart')} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-transform active:scale-90 ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'}`}>
              ←
            </button>
            <h1 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment Method</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Option 1: UPI Direct */}
          <div 
            onClick={() => { setPaymentMethod('upi_direct'); setPaymentStep('upi_verify'); }}
            className={`p-5 rounded-3xl border-2 cursor-pointer transition-all active:scale-95 ${isDarkMode ? 'bg-slate-900 border-slate-700 hover:border-emerald-500' : 'bg-white border-gray-200 hover:border-emerald-500'} shadow-sm`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 text-2xl">
                💸
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">0% Fee</span>
            </div>
            <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>UPI Direct</h3>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Transfer directly to the merchant. Requires manual UTR entry.</p>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800 flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total to pay:</span>
              <span className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{baseTotal}</span>
            </div>
          </div>

          {/* Option 2: Cashfree */}
          <div 
            onClick={handleCashfreePayment}
            className={`p-5 rounded-3xl border-2 cursor-pointer transition-all active:scale-95 ${isDarkMode ? 'bg-slate-900 border-slate-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-500'} shadow-sm`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-2xl">
                💳
              </div>
              <span className="bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-300 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Instant</span>
            </div>
            <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Cards, Netbanking & Wallets</h3>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Powered securely by Cashfree. Includes ~2% gateway fee.</p>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800 flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total to pay:</span>
              <span className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{baseTotal + gatewayFee}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========= PROCESSING SCREEN =========
  if (paymentStep === 'processing') {
    return (
      <div className={`absolute inset-0 z-[200] flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#060B19]' : 'bg-white'}`}>
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <h2 className={`text-xl font-black text-center mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Connecting to Cashfree...</h2>
        <p className={`text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Please wait while we securely generate your payment link.</p>
      </div>
    );
  }

  // ========= UPI VERIFY SCREEN =========
  if (paymentStep === 'upi_verify') {
    return (
      <div className={`absolute inset-0 z-[200] flex flex-col ${isDarkMode ? 'bg-[#060B19]' : 'bg-white'}`}>
        <div className={`px-5 pt-14 pb-4 flex items-center justify-between border-b ${isDarkMode ? 'border-white/[0.05] bg-[#0A1128]' : 'border-gray-100 bg-white'}`}>
          <div className="flex items-center space-x-3">
            <button onClick={() => setPaymentStep('selection')} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-transform active:scale-90 ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'}`}>
              ←
            </button>
            <h1 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Verify Payment</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className={`p-6 rounded-3xl text-center mb-6 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-emerald-50 border-emerald-100'}`}>
            <h2 className={`text-3xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-emerald-900'}`}>₹{finalTotal}</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-emerald-700'}`}>Paying EarthGram Merchant</p>
            
            <button onClick={handleLaunchUpi} className="mt-5 bg-emerald-500 text-white w-full py-4 rounded-xl font-black shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform flex justify-center items-center space-x-2">
              <span>🚀</span>
              <span>Open UPI App to Pay</span>
            </button>
            <p className="text-[10px] text-gray-500 mt-3 px-4">This will open your installed UPI apps (GPay, PhonePe, Paytm). Complete the payment and return here.</p>
          </div>

          <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
            <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 2: Enter UTR Number</h3>
            <p className="text-xs text-gray-500 mb-4">After paying, enter the 12-digit UPI Reference Number (UTR) to confirm your order.</p>
            
            <input 
              type="text" 
              maxLength="12"
              placeholder="e.g. 312456789012"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9]/g, ''))}
              className={`w-full py-4 px-5 text-center text-xl tracking-widest font-black rounded-xl border outline-none transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-emerald-500'}`}
            />
          </div>
        </div>

        <div className={`p-4 border-t ${isDarkMode ? 'bg-[#0A1128] border-slate-800' : 'bg-white border-gray-100'}`}>
          <button onClick={verifyUtr} disabled={utrNumber.length !== 12 || isVerifyingUtr}
            className={`w-full py-4 rounded-xl font-black flex justify-center items-center transition-all ${utrNumber.length === 12 && !isVerifyingUtr ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xl active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            {isVerifyingUtr ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Verify Payment'}
          </button>
        </div>
      </div>
    );
  }

  // ========= CART + CHECKOUT SCREEN =========
  return (
    <div className={`absolute inset-0 z-[200] flex flex-col ${isDarkMode ? 'bg-[#060B19]' : 'bg-white'}`}>

      {/* ── Header ── */}
      <div className={`px-5 pt-14 pb-4 flex items-center justify-between border-b ${isDarkMode ? 'border-white/[0.05] bg-[#0A1128]' : 'border-gray-100 bg-white'}`}>
        <button onClick={onClose}
          className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <h1 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your Cart 🛒</h1>
          <p className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{displayItems.length} item{displayItems.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="w-9" /> {/* spacer */}
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-44">

        {/* Cart Items */}
        <div className="p-4 space-y-3">
          {displayItems.map((item) => (
            <div key={item.id} className={`flex items-center p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
              {/* Image */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                {item.image?.startsWith?.('data:') || item.image?.startsWith?.('http') ? (
                  <img src={item.image} className="w-full h-full object-cover rounded-xl" alt={item.name} />
                ) : (
                  <span>{item.image}</span>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 ml-3">
                <p className={`text-xs font-black leading-tight line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                <p className="text-sm font-black text-amber-600 mt-0.5">₹{item.price}</p>
              </div>

              {/* Quantity Controls */}
              <div className={`flex items-center space-x-3 px-3 py-2 rounded-xl ml-2 ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-gray-200'}`}>
                <button onClick={() => updateQty(item.id, -1)} className="text-gray-400 font-black text-lg leading-none active:scale-75 transition-transform">−</button>
                <span className={`text-xs font-black w-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.qty}</span>
                <button onClick={() => updateQty(item.id, +1)} className="text-amber-500 font-black text-lg leading-none active:scale-75 transition-transform">+</button>
              </div>

              {/* Remove */}
              <button onClick={() => removeItem(item.id)} className="ml-2 text-gray-300 active:text-red-400 transition-colors p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* ── Loyalty Coins Toggle ── */}
        <div className={`mx-4 mt-1 rounded-2xl overflow-hidden border ${isDarkMode ? 'border-amber-500/20 bg-amber-500/5' : 'border-amber-200 bg-amber-50'}`}>
          <button onClick={() => setUseCoins(!useCoins)}
            className="w-full flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🪙</span>
              <div className="text-left">
                <p className={`text-xs font-black ${isDarkMode ? 'text-amber-300' : 'text-amber-900'}`}>Use Loyalty Coins</p>
                <p className={`text-[10px] font-bold ${isDarkMode ? 'text-amber-500' : 'text-amber-700'}`}>{userCoins} coins available · saves ₹{Math.min(userCoins, Math.round(subtotal * 0.1))}</p>
              </div>
            </div>
            <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${useCoins ? 'bg-amber-500' : isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${useCoins ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>

        {/* ── Bill Summary ── */}
        <div className={`mx-4 mt-4 rounded-2xl border p-5 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
          <p className={`text-xs font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bill Summary</p>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Subtotal</span>
              <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>GST (5%)</span>
              <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{gst}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Delivery</span>
              <span className="text-sm font-bold text-emerald-500">FREE</span>
            </div>
            {useCoins && (
              <div className="flex justify-between">
                <span className="text-sm text-amber-500 font-bold">Coin Discount</span>
                <span className="text-sm font-bold text-amber-500">− ₹{coinDiscount}</span>
              </div>
            )}
          </div>

          <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} flex justify-between items-center`}>
            <span className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total to Pay</span>
            <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{baseTotal}</span>
          </div>
        </div>

      </div>

      {/* ── Sticky Pay Button ── */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${isDarkMode ? 'bg-[#0A1128] border-white/[0.04]' : 'bg-white border-gray-100'}`}>
        <div className="flex justify-between items-center mb-3">
          <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Subtotal</span>
          <span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{baseTotal}</span>
        </div>
        <button
          onClick={handleCheckoutClick}
          className="w-full py-4 rounded-2xl bg-gray-900 text-white font-black text-sm flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform shadow-xl shadow-gray-900/30 dark:bg-white dark:text-gray-900 dark:shadow-white/20"
        >
          <span>Select Payment Method</span>
          <span>→</span>
        </button>
        <p className={`text-center text-[9px] font-bold mt-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          🔒 Secure Checkout
        </p>
      </div>
    </div>
  );
};

export default ShoppingCartScreen;
