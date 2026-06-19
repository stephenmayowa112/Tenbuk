import React, { useState, useEffect } from 'react';
import { Truck, Copy, CheckCircle, Clock, Archive, ArrowLeft, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { dbService } from '../services/db';

interface OrderTrackingProps {
  orderId: string;
  onBack: () => void;
  currency: 'USD' | 'NGN';
}

export default function OrderTracking({
  orderId,
  onBack,
  currency,
}: OrderTrackingProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      const orders = await dbService.getOrders();
      const found = orders.find(o => o.id === orderId);
      if (found) {
        setOrder(found);
      } else {
        // Fallback to primary seed order shown in Screen 4
        setOrder(orders[0]); // Which is #TBK-8924-M
      }
      setLoading(false);
    }
    loadOrder();
  }, [orderId]);

  if (loading || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent id-spin rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 mt-4 text-xs font-sans">Connecting with SwiftLogistics servers...</p>
      </div>
    );
  }

  const handleCopyTracking = () => {
    navigator.clipboard.writeText('SLX-9938201-US');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmReceipt = async () => {
    try {
      await dbService.updateOrderStatus(order.id, 'delivered', 'released');
      const updated = { ...order, status: 'delivered' as OrderStatus, escrowStatus: 'released' as any };
      setOrder(updated);
      alert(`Success! Delivery confirmed. Your funds of ${formatValue(order.total)} have been safely released to the vendor, and the escrow ledger has been closed.`);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason) return;

    try {
      await dbService.raiseDispute({
        id: `disp-${Math.floor(1000 + Math.random() * 9000)}`,
        orderId: order.id,
        raisedBy: 'buyer-jane-doe',
        raisedByName: 'Jane Doe',
        reason: disputeReason,
        status: 'open',
        createdAt: new Date().toISOString()
      });

      const updated = { ...order, escrowStatus: 'disputed' as any };
      setOrder(updated);
      setShowDisputeModal(false);
      setDisputeReason('');
      alert("Escrow funds have been successfully locked and flagged. An admin has been notified in the moderation queue to evaluate and resolve this dispute.");
    } catch (err) {
      console.warn(err);
    }
  };

  // Currency conversions
  const formatValue = (usdVal: number) => {
    const rate = 1500;
    if (currency === 'USD') {
      return `$${usdVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      const realVal = order.subtotal > 2000 ? usdVal : usdVal * rate; // Check NGN base defaults
      return `₦${Math.ceil(realVal).toLocaleString()}`;
    }
  };

  const isDelivered = order.status === 'delivered';
  const isShipped = order.status === 'shipped' || isDelivered;
  const isProcessing = order.status === 'processing' || isShipped;
  const isPlaced = order.status === 'placed' || isProcessing;

  const isDisputed = order.escrowStatus === 'disputed';

  return (
    <div className="font-sans text-slate-800 bg-[#f8fafc]/40 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation */}
        <button
          id="btn-back-to-orders"
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-orange-600 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Tracking timelines and map overlay */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xs space-y-6">
              
              {/* Order Tracking Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans">
                    Track Order <span className="text-slate-400 font-mono">#{order.id}</span>
                  </h1>
                  <p className="text-xs text-slate-400 font-medium font-sans">
                    Estimated Delivery: <span className="font-bold text-slate-700">Tomorrow, by 8:00 PM</span>
                  </p>
                </div>
                
                {/* Release Escrow / Dispute buttons */}
                <div className="flex gap-2">
                  {!isDelivered && !isDisputed ? (
                    <>
                      <button
                        id="btn-dispute-trigger"
                        onClick={() => setShowDisputeModal(true)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold border border-rose-100 px-4 py-2 rounded-xl text-[11px] cursor-pointer transition-colors"
                      >
                        File Dispute
                      </button>
                      <button
                        id="btn-confirm-arrival"
                        onClick={handleConfirmReceipt}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-5 py-2.5 rounded-xl text-[11px] shadow-sm cursor-pointer hover:translate-y-[-1px] transition-all"
                      >
                        Confirm Receipt & Release Funds
                      </button>
                    </>
                  ) : isDisputed ? (
                    <span className="bg-rose-100 text-rose-700 font-bold text-[10px] uppercase tracking-wider px-3 py-2 rounded-xl flex items-center gap-1 border border-rose-200">
                      ⚠️ Escrow Held on Dispute
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase tracking-wider px-3 py-2 rounded-xl flex items-center gap-1 border border-emerald-200">
                      ✓ Funds Released to Vendor
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Horizontal Track matching Screen 4 */}
              <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50">
                <div className="relative flex items-center justify-between">
                  {/* Track connection lines */}
                  <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-200 -translate-y-1/2 -z-10"></div>
                  <div 
                    className="absolute left-0 top-1/2 h-1 bg-emerald-500 -translate-y-1/2 -z-10 transition-all duration-500 font-sans"
                    style={{ width: isDelivered ? '100%' : isShipped ? '66%' : isProcessing ? '33%' : '0%' }}
                  ></div>

                  {/* Step 1 Placed */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ${isPlaced ? 'bg-emerald-500 text-white ring-emerald-100' : 'bg-white border border-slate-200'}`}>
                      {isPlaced ? '✓' : '1'}
                    </div>
                    <div className="text-center font-sans space-y-0.5">
                      <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-800">Placed</p>
                      <p className="text-[8px] text-slate-400 font-mono font-medium">Oct 24, 09:30 AM</p>
                    </div>
                  </div>

                  {/* Step 2 Processing */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ${isProcessing ? 'bg-emerald-500 text-white ring-emerald-100' : 'bg-white border border-slate-200'}`}>
                      {isProcessing ? '✓' : '2'}
                    </div>
                    <div className="text-center font-sans space-y-0.5">
                      <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-800 font-sans">Processing</p>
                      <p className="text-[8px] text-slate-400 font-mono font-medium">Oct 24, 02:15 PM</p>
                    </div>
                  </div>

                  {/* Step 3 Shipped */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ${isShipped ? 'bg-orange-500 text-white ring-orange-100' : 'bg-white border border-slate-200'}`}>
                      {isShipped ? (isDelivered ? '✓' : '🚚') : '3'}
                    </div>
                    <div className="text-center font-sans space-y-0.5">
                      <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-800">Shipped</p>
                      <p className="text-[8px] text-slate-400 font-mono font-medium">Oct 25, 08:45 AM</p>
                    </div>
                  </div>

                  {/* Step 4 Delivered */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ${isDelivered ? 'bg-emerald-500 text-white ring-emerald-100' : 'bg-white border border-slate-200'}`}>
                      4
                    </div>
                    <div className="text-center font-sans space-y-0.5">
                      <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-800">Delivered</p>
                      <p className="text-[8px] text-slate-400 font-mono font-medium">{isDelivered ? 'Delivered' : 'Pending'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Illustration vector area matching Screen 4 isometric style */}
              <div className="border border-slate-100 rounded-2xl h-80 relative overflow-hidden bg-slate-100 flex items-center justify-center shadow-inner">
                {/* Pure CSS Roadmap Grid */}
                <div className="absolute inset-0 bg-slate-200/50 [background-image:linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none origin-center rotate-12 scale-[1.5]"></div>
                
                {/* Custom Isometric styled road overlays */}
                <div className="absolute w-[500px] h-3 bg-white border-y border-slate-300 rounded-full rotate-[-30deg] translate-y-[-40px]"></div>
                <div className="absolute w-[400px] h-3 bg-white border-y border-slate-300 rounded-full rotate-[40deg] translate-x-[-50px]"></div>
                <div className="absolute w-2 h-24 bg-slate-300/30 rotate-25"></div>

                {/* Logistics Truck vector marker bubble */}
                <div className="absolute bg-[#0b1528] text-white rounded-2xl p-4 shadow-xl border border-slate-800 z-10 font-sans text-xs flex items-center gap-3 left-[30%] top-[45%] animate-bounce">
                  <div className="bg-orange-500 text-white p-2 rounded-xl">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-extrabold uppercase text-[9px] tracking-wider text-orange-400 font-mono">Current Location</p>
                    <p className="font-black">In Transit - {order.shippingAddress?.city || 'Metropolis'}, {order.shippingAddress?.state || 'NY'}</p>
                  </div>
                </div>

                {/* Destination Red Pin */}
                <div className="absolute right-[20%] top-[25%] text-slate-900 flex flex-col items-center">
                  <span className="text-3xl filter drop-shadow-md animate-pulse">📍</span>
                  <span className="bg-white/9
0 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 font-sans tracking-tight text-[10px] font-bold">Buyer Node</span>
                </div>
              </div>

              {/* Courier service box matching Screen 4 */}
              <div className="border border-slate-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
                    SLX
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Courier Service</p>
                    <p className="text-sm font-black text-slate-800">SwiftLogistics Express</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                      Tracking: SLX-9938201-US
                      <button
                        id="btn-copy-tracking-no"
                        onClick={handleCopyTracking}
                        className="text-orange-500 hover:text-orange-600 font-bold text-[10px] cursor-pointer flex items-center gap-0.5 ml-1"
                      >
                        <Copy className="w-3 h-3" />
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </p>
                  </div>
                </div>

                <button
                  id="btn-view-logistics-history"
                  onClick={() => alert("SwiftLogistics reports: Manifest scanned in Lagos sorting facility. Parcel processed on courier delivery vehicle.")}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2.5 px-5 rounded-xl text-xs cursor-pointer active:scale-95 transition-all shadow-xs"
                >
                  View Full History
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Order Summary matching Screen 4 sidebar */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-8 shadow-xs space-y-6">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider font-sans pb-3 border-b border-slate-100">
              Order Summary
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-4 border-b border-slate-50 pb-4">
                <div className="w-16 h-16 rounded-xl bg-slate-50 p-2 border border-slate-100 flex items-center justify-center flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1617005082133-548c4ae27f35?auto=format&fit=crop&q=80&w=600" alt="Product thumbnail" referrerPolicy="no-referrer" className="object-contain" />
                </div>
                <div className="flex-1 space-y-1 text-xs">
                  <h4 className="font-bold text-slate-800 line-clamp-2 leading-snug">Sigma 24-70mm f/2.8 DG DN Art Lens for Sony E</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Qty: 1</p>
                  <p className="font-extrabold text-slate-900">{formatValue(order.subtotal || 1099.00)}</p>
                </div>
              </div>
            </div>

            {/* Totals bill card */}
            <div className="space-y-3 pt-2 text-xs text-slate-500 font-sans leading-none">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">{formatValue(order.subtotal || 1099.00)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-slate-800">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (Vat)</span>
                <span className="font-semibold text-slate-800">{formatValue(order.tax || 96.16)}</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline text-slate-800">
                <span className="font-bold">Total</span>
                <span className="text-lg font-black text-orange-600 font-mono">{formatValue(order.total || 1195.16)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 flex flex-col gap-3">
              <button
                id="btn-tracking-contact-support"
                onClick={() => alert("Connecting you with SwiftLogistics dispatcher (+234-1-888-SHIP)...")}
                className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3.5 rounded-xl text-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1 shadow-md shadow-orange-500/10"
              >
                📞 Contact Support
              </button>
              <button
                id="btn-tracking-download-invoice"
                onClick={() => alert("Downloading PDF Invoice with Escrow hash references (SLX-TBK-FED-1823)...")}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl text-xs transition-colors cursor-pointer text-center active:scale-95"
              >
                📄 Download Invoice
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Escrow Dispute Filing Modal Drawer matching details specification */}
      {showDisputeModal && (
        <div id="dispute-form-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 font-sans">
            <div className="flex items-center gap-2 text-rose-500">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <h3 className="text-base font-black tracking-tight text-slate-900">File Escrow Dispute</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Filing a dispute locks the escrow balance of <span className="font-extrabold text-slate-700">{formatValue(order.total)}</span> immediately, blocking any automatic payout to the vendor. Our administration panel will review your dispute details.
            </p>
            <form onSubmit={handleRaiseDispute} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reason for dispute / Item issue</label>
                <textarea
                  id="dispute-reason-input"
                  required
                  rows={4}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Detail the issue (e.g. Item received broken or does not match specifications)..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/10 focus:outline-hidden"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  id="btn-dispute-cancel"
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="bg-slate-100 font-bold text-slate-700 text-xs px-4 py-2.5 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-dispute-confirm"
                  type="submit"
                  className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-lg cursor-pointer"
                >
                  Confirm & Lock Escrow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
