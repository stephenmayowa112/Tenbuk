import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, CreditCard, Landmark, PhoneCall, Key, ArrowRight, ShieldCheck, Trash } from 'lucide-react';
import { Product, Order } from '../types';
import { dbService } from '../services/db';

interface CheckoutProps {
  cart: Array<{ product: Product; quantity: number; negotiatedPrice?: number }>;
  onClearCart: () => void;
  currency: 'USD' | 'NGN';
  onOrderCompleted: (orderId: string) => void;
}

export default function Checkout({
  cart,
  onClearCart,
  currency,
  onOrderCompleted,
}: CheckoutProps) {
  // Step tracker: 1 = Shipping, 2 = Payment, 3 = Completed/Review
  const [step, setStep] = useState<1 | 2>(1);

  // Shipping form states initialized with screenshot default values
  const [firstName, setFirstName] = useState('Jane');
  const [lastName, setLastName] = useState('Doe');
  const [streetAddress, setStreetAddress] = useState('123 Market Lane, Apt 4B');
  const [city, setCity] = useState('Metropolis');
  const [province, setProvince] = useState('New York');
  const [zipCode, setZipCode] = useState('10001');
  const [phone, setPhone] = useState('+1 (555) 123-4567');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer' | 'ussd' | 'mobile_money'>('card');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  // Compute pricing
  const subtotal = cart.reduce((acc, item) => {
    const singlePrice = item.negotiatedPrice || item.product.price;
    return acc + singlePrice * item.quantity;
  }, 0);

  const shippingCost = subtotal > 0 ? 12.50 : 0;
  const escrowFeeStr = 'Free';
  const total = subtotal + shippingCost;

  const displaySymbol = currency === 'USD' ? '$ font-mono' : '₦';

  // Format monetary value
  const formatValue = (usdVal: number) => {
    const rate = 1500;
    if (currency === 'USD') {
      return `$${usdVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      const realVal = cart.some(item => item.product.currency === 'NGN') ? usdVal : usdVal * rate;
      return `₦${Math.ceil(realVal).toLocaleString()}`;
    }
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Your cart is empty. Please add products in the Marketplace tab first.");
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setProcessingPayment(true);
    // Simulate payment processor delay
    setTimeout(async () => {
      const mockOrderNo = `TBK-${Math.floor(1000 + Math.random() * 9000)}-M`;
      const newOrder: Order = {
        id: mockOrderNo,
        buyerId: 'buyer-jane-doe',
        vendorId: cart[0]?.product.vendorId || 'vendor-techhaven',
        vendorName: cart[0]?.product.vendorName || 'TechHaven',
        status: 'placed',
        subtotal: subtotal,
        shipping: shippingCost,
        tax: Number((subtotal * 0.08).toFixed(2)),
        total: total + Number((subtotal * 0.08).toFixed(2)),
        escrowStatus: 'held',
        escrowReleaseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        paymentRef: `paystack_tx_${Math.floor(100000 + Math.random() * 900000)}`,
        paymentMethod: paymentMethod,
        createdAt: new Date().toISOString(),
        shippingAddress: {
          firstName,
          lastName,
          streetAddress,
          city,
          state: province,
          zipCode,
          phone,
        }
      };

      try {
        await dbService.createOrder(newOrder);
      } catch (err) {
        console.error(err);
      }

      setProcessingPayment(false);
      setPaySuccess(true);
      onClearCart();
      setTimeout(() => {
        onOrderCompleted(mockOrderNo);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="font-sans text-slate-800 bg-[#f8fafc]/40 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner matching Screen 1 - Secure Escrow info */}
        <div className="bg-[#eff6ff] border border-blue-100 rounded-2xl p-5 mb-8 flex items-start gap-4">
          <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
            <ShieldCheck className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-900 tracking-tight font-sans">
              Secure Escrow Payment System
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Your funds are protected. We release payment to the vendor within 14 working days <span className="font-extrabold text-slate-700">after</span> successful delivery, and once you confirm receipt of the items and the dispute window is closed.
            </p>
          </div>
        </div>

        {/* Progress track matching Screen 1 */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 top-1/2 w-full h-[3px] bg-slate-200 -translate-y-1/2 -z-10"></div>
            
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ${step === 1 ? 'bg-slate-900 text-white ring-slate-100' : 'bg-emerald-500 text-white ring-emerald-50'}`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 font-mono">Shipping</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ${step === 2 ? 'bg-slate-900 text-white ring-slate-100' : 'bg-white text-slate-300 ring-slate-100 border border-slate-200'}`}>
                2
              </div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">Payment</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 bg-white text-slate-300 ring-slate-100 border border-slate-200">
                3
              </div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">Review</span>
            </div>
          </div>
        </div>

        {/* main Form Content */}
        {cart.length === 0 && !paySuccess ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 max-w-lg mx-auto space-y-4 shadow-xs">
            <span className="text-4xl">🛒</span>
            <h3 className="text-lg font-bold text-slate-800">Your cart is currently empty</h3>
            <p className="text-sm text-slate-500">Go to the Marketplace, choose any product, and click Buy Now or Negotiated offer to test this escrow checkout!</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form entries */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-8 shadow-xs">
              
              {step === 1 ? (
                /* Phase 1: Shipping Form */
                <form onSubmit={handleContinueToPayment} className="space-y-6">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 font-sans pb-3 border-b border-slate-50">
                    🚚 Shipping Information
                  </h2>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">First Name</label>
                      <input
                        id="shipping-first-name"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/10 focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Last Name</label>
                      <input
                        id="shipping-last-name"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/10 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Street Address</label>
                    <input
                      id="shipping-address"
                      type="text"
                      required
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/10 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">City</label>
                      <input
                        id="shipping-city"
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/10 focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">State / Province</label>
                      <select
                        id="shipping-state"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/10 focus:outline-hidden bg-white text-xs font-semibold"
                      >
                        <option value="New York">New York</option>
                        <option value="Lagos">Lagos (Nigeria)</option>
                        <option value="Abuja">Abuja (Nigeria)</option>
                        <option value="Rivers">Rivers State</option>
                        <option value="Oyo">Oyo State</option>
                        <option value="California">California</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Zip / Postal Code</label>
                      <input
                        id="shipping-postal"
                        type="text"
                        required
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/10 focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Phone Number</label>
                      <input
                        id="shipping-phone"
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/10 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      id="btn-checkout-submit"
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-8 py-4 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-[0.98] shadow-md shadow-orange-500/10"
                    >
                      Continue to Payment &rarr;
                    </button>
                  </div>
                </form>
              ) : (
                /* Phase 2: Secure Escrow Payment Options */
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 font-sans pb-3 border-b border-slate-50">
                    💳 Escrow Payment Selection
                  </h2>

                  {/* Multi Payment processors explanation */}
                  <p className="text-xs text-slate-500 font-sans leading-relaxed">
                    Choose your payment method below. We route securely through Paystack/Flutterwave supporting Nigerian cards, instant bank transfers, USSD, and Mobile Money. No card data touches our servers.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Payment 1 Card */}
                    <button
                      id="pay-method-card"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-2xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'border-orange-500 bg-orange-50/50 text-slate-800 font-bold'
                          : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      <div className="p-2.5 rounded-lg bg-orange-100 text-orange-600">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">ATM Cards</p>
                        <p className="text-[10px] text-slate-400 font-sans">Promo, Mastercard, Visa</p>
                      </div>
                    </button>

                    {/* Payment 2 Bank Transfer */}
                    <button
                      id="pay-method-transfer"
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-4 rounded-2xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-orange-500 bg-orange-50/50 text-slate-800 font-bold'
                          : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-600">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Bank Transfer</p>
                        <p className="text-[10px] text-slate-400 font-sans">GTB, Zenith, Kuda, Moneypoint</p>
                      </div>
                    </button>

                    {/* Payment 3 USSD */}
                    <button
                      id="pay-method-ussd"
                      onClick={() => setPaymentMethod('ussd')}
                      className={`p-4 rounded-2xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                        paymentMethod === 'ussd'
                          ? 'border-orange-500 bg-orange-50/50 text-slate-800 font-bold'
                          : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      <div className="p-2.5 rounded-lg bg-blue-100 text-blue-600">
                        <Key className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">USSD Transfer Code</p>
                        <p className="text-[10px] text-slate-400 font-sans">*737#, *901#, *894# codes</p>
                      </div>
                    </button>

                    {/* Payment 4 Mobile money */}
                    <button
                      id="pay-method-momo"
                      onClick={() => setPaymentMethod('mobile_money')}
                      className={`p-4 rounded-2xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                        paymentMethod === 'mobile_money'
                          ? 'border-orange-500 bg-orange-50/50 text-slate-800 font-bold'
                          : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      <div className="p-2.5 rounded-lg bg-violet-100 text-violet-600">
                        <PhoneCall className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Mobile Money (Opay/Palmpay)</p>
                        <p className="text-[10px] text-slate-400 font-sans">Direct mobile money triggers</p>
                      </div>
                    </button>
                  </div>

                  {/* Payment sub-details */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-xs text-slate-500 space-y-4">
                    {paymentMethod === 'card' && (
                      <div className="space-y-2">
                        <p className="font-bold text-slate-700">Add Card Details</p>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="Card Number" defaultValue="5399 2311 9082 3456" className="p-2.5 border rounded-lg bg-white" />
                          <input type="text" placeholder="MM/YY" defaultValue="12/28" className="p-2.5 border rounded-lg bg-white" />
                        </div>
                      </div>
                    )}
                    {paymentMethod === 'bank_transfer' && (
                      <div className="space-y-1">
                        <p className="font-bold text-slate-700">Paystack Automated Payout Account</p>
                        <p>Bank: <span className="font-extrabold text-slate-800">WEMA Bank (Tenbuk Escrow Ledger)</span></p>
                        <p>Account Number: <span className="font-extrabold text-slate-800 text-sm tracking-wider font-mono">1022981290</span></p>
                        <p className="text-[10px] text-slate-400">Please send exact {formatValue(total)} NGN. Account expires in 20 minutes.</p>
                      </div>
                    )}
                    {paymentMethod === 'ussd' && (
                      <div className="space-y-1">
                        <p className="font-bold text-slate-700">Select Bank USSD</p>
                        <select className="p-2 border rounded-lg bg-white font-semibold">
                          <option>*737# GTBank</option>
                          <option>*901# AccessBank</option>
                          <option>*894# FirstBank</option>
                        </select>
                      </div>
                    )}
                    {paymentMethod === 'mobile_money' && (
                      <div className="space-y-1">
                        <p className="font-bold text-slate-700">Enter Payment Phone number</p>
                        <input type="text" defaultValue="+234 81 2345 6789" className="p-2 border rounded-lg bg-white text-xs w-full" />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex justify-between gap-4">
                    <button
                      id="btn-payment-back"
                      onClick={() => setStep(1)}
                      className="text-slate-500 font-extrabold text-xs cursor-pointer hover:text-slate-700"
                    >
                      &larr; Back to Shipping
                    </button>
                    <button
                      id="btn-place-escrow-order"
                      onClick={handlePlaceOrder}
                      disabled={processingPayment}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-8 py-4 rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-md disabled:bg-slate-300"
                    >
                      {processingPayment ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing secure Escrow...
                        </>
                      ) : paySuccess ? (
                        'Escrow locked successfully!'
                      ) : (
                        `Pay & Lock in Escrow (${formatValue(total)})`
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Order Summary matching Screen 1 sidebar */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-8 shadow-xs space-y-6">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider font-sans pb-3 border-b border-slate-100">
                Order Summary
              </h2>

              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-4 border-b border-slate-50 pb-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 p-2 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img src={item.product.images[0]} alt={item.product.title} referrerPolicy="no-referrer" className="object-contain" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-1 leading-snug">{item.product.title}</h4>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-indigo-500 uppercase font-bold flex items-center gap-0.5">⭐ {item.product.vendorName}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
                        <span>Qty: {item.quantity}</span>
                        <span className="font-bold text-slate-900">
                          {formatValue(item.negotiatedPrice || item.product.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals computation billing card */}
              <div className="pt-4 border-t border-slate-100 space-y-3 text-xs leading-none">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">{formatValue(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-800">{formatValue(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span className="flex items-center gap-1">
                    Escrow Protection Fee
                    <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-1 rounded-sm">FREE</span>
                  </span>
                  <span className="font-bold text-emerald-600">Free</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline text-slate-800">
                  <span className="font-bold">Total</span>
                  <div className="text-right">
                    <span className="text-xl font-black text-orange-600 font-mono">{formatValue(total)}</span>
                    <span className="block text-[8px] text-slate-400 font-medium font-sans">Includes applicable taxes</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center text-xs text-slate-500 font-sans flex items-center justify-center gap-2">
                <span>🛡️</span>
                <span>BUY SMART. SECURE ESCROW.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
