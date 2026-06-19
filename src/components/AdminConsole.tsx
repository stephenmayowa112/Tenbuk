import React, { useState, useEffect } from 'react';
import { LuShieldCheck as ShieldCheck, LuUserX as UserX, LuUserCheck as UserCheck, LuTriangleAlert as AlertTriangle, LuCoins as Coins, LuRefreshCw as RefreshCw, LuCheckCircle as CheckCircle, LuHelpCircle as HelpCircle } from 'react-icons/lu';
import { Dispute, Vendor, Order } from '../types';
import { dbService } from '../services/db';

interface AdminConsoleProps {
  currency: 'USD' | 'NGN';
}

export default function AdminConsole({
  currency,
}: AdminConsoleProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminQueue = async () => {
    setLoading(true);
    const vList = await dbService.getVendors();
    const dList = await dbService.getDisputes();
    const oList = await dbService.getOrders();
    setVendors(vList);
    setDisputes(dList);
    setOrders(oList);
    setLoading(false);
  };

  useEffect(() => {
    loadAdminQueue();
  }, []);

  const handleVerifyVendor = async (vId: string, status: boolean) => {
    await dbService.verifyVendor(vId, status);
    loadAdminQueue();
    alert(`Vendor status successfully updated. Store badges will reflect on the marketplace catalog.`);
  };

  const handleDisputeResolution = async (dispId: string, orderId: string, resolution: 'refunded' | 'released') => {
    await dbService.resolveDispute(dispId, orderId, resolution);
    loadAdminQueue();
    alert(`Dispute closed successfully. Escrow ledger updated to trigger an instant bank ${resolution} loop.`);
  };

  const formatValue = (usdVal: number) => {
    const rate = 1500;
    if (currency === 'USD') {
      return `$${usdVal.toLocaleString()}`;
    } else {
      return `₦${Math.ceil(usdVal * rate).toLocaleString()}`;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 mt-4 text-xs">Loading Admin queues...</p>
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-800 bg-[#f8fafc]/40 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Admin overview header block */}
        <div className="bg-white rounded-3xl p-6 border shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 font-sans">
              <ShieldCheck className="w-6 h-6 text-slate-900" />
              Tenbuk Moderation Authority
            </h1>
            <p className="text-xs text-slate-400 font-sans">Moderating vendor storefront applications, compliance metrics, and active escrow dispute resolutions.</p>
          </div>
          <button 
            onClick={loadAdminQueue}
            className="p-2 border hover:bg-slate-50 border-slate-200 transition-colors text-xs font-bold font-sans rounded-xl text-slate-600 cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Queues
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Vendor verification list */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-widest font-sans border-b border-slate-50 pb-2 flex items-center gap-1.5">
                💼 Vendor Verifications ({vendors.length})
              </h3>
              
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {vendors.map((v) => (
                  <div key={v.id} className="p-4 border rounded-xl bg-slate-50 flex items-center justify-between gap-4">
                    <div className="space-y-1.5 text-xs font-sans">
                      <p className="font-black text-slate-800">{v.storeName}</p>
                      <p className="text-slate-400 font-sans line-clamp-1">{v.description}</p>
                      <div className="flex items-center gap-2 text-[9px] font-mono font-medium">
                        <span className="text-orange-500 font-extrabold">Performance: {v.performanceScore}/100</span>
                        <span className="text-slate-400">Commission Plan: {v.commissionPlanId}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {v.verified ? (
                        <button
                          id={`btn-reject-vendor-${v.id}`}
                          onClick={() => handleVerifyVendor(v.id, false)}
                          className="bg-white text-rose-600 border border-rose-100 hover:bg-rose-50 px-3.5 py-2 rounded-xl text-[10px] font-black cursor-pointer shadow-xs"
                        >
                          Revoke Badge
                        </button>
                      ) : (
                        <button
                          id={`btn-approve-vendor-${v.id}`}
                          onClick={() => handleVerifyVendor(v.id, true)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-extrabold cursor-pointer shadow-xs"
                        >
                          Verify Vendor
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Escrow Disputes Queue */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-950 uppercase tracking-widest font-sans border-b border-slate-50 pb-2 flex items-center gap-1.5">
                ⚠️ Escrow Arbitration & Disputes ({disputes.length})
              </h3>

              {disputes.length === 0 ? (
                <div className="text-center p-12 text-slate-400 space-y-2">
                  <span className="text-3xl">🎉</span>
                  <p className="text-xs font-bold font-sans">Perfect compliance Score! No pending disputes.</p>
                  <p className="text-[10px] text-slate-400 font-sans">When a buyer files a dispute in the order tracking tab, it appears here instantly for mediation.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {disputes.map((d) => {
                    const linkedOrder = orders.find(o => o.id === d.orderId);
                    return (
                      <div key={d.id} className="p-4 border border-slate-100 rounded-xl bg-orange-50/20 space-y-3">
                        <div className="flex justify-between items-start text-xs border-b border-slate-100 pb-2.5">
                          <div>
                            <p className="font-extrabold text-slate-800 flex items-center gap-1">
                              <AlertTriangle className="w-4.5 h-4.5 text-orange-500" />
                              Dispute Linked Order: #{d.orderId}
                            </p>
                            <p className="text-[9px] text-slate-400 font-mono">Filer: {d.raisedByName} &bull; {new Date(d.createdAt).toLocaleDateString()}</p>
                          </div>
                          {linkedOrder && (
                            <span className="font-mono font-extrabold text-slate-900 bg-white border px-2 py-1 rounded-md">
                              {formatValue(linkedOrder.total)}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 font-sans bg-white p-3 rounded-xl border">
                          <p className="font-bold text-slate-400 uppercase text-[9px] tracking-wider pb-1">Arbitration Claim details:</p>
                          <p className="italic font-sans">"{d.reason}"</p>
                        </div>

                        {d.status === 'open' ? (
                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              id={`btn-dispute-refund-${d.id}`}
                              onClick={() => handleDisputeResolution(d.id, d.orderId, 'refunded')}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-bold px-3 py-1.5 rounded-xl text-[10px] cursor-pointer"
                            >
                              Refund Escrow to Buyer
                            </button>
                            <button
                              id={`btn-dispute-disburse-${d.id}`}
                              onClick={() => handleDisputeResolution(d.id, d.orderId, 'released')}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-3.5 py-2 rounded-xl text-[10px] cursor-pointer"
                            >
                              Release Payout to Vendor
                            </button>
                          </div>
                        ) : (
                          <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold p-2 rounded-lg text-center font-sans border border-emerald-100">
                            ✓ Dispute Arbitrated and resolved with state: {d.status.replace('_', ' ').toUpperCase()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
