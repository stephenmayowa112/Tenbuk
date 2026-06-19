import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, Activity, Inbox, Package, Grid, AlertTriangle, 
  Settings, HelpCircle, LogOut, Plus, Search, Edit2, Trash2, Check, RefreshCw 
} from 'lucide-react';
import { Product, Order, Vendor, OrderStatus, EscrowStatus } from '../types';
import { dbService } from '../services/db';

interface VendorAnalyticsProps {
  onAddProduct: (p: Product) => void;
  currency: 'USD' | 'NGN';
}

export default function VendorAnalytics({
  onAddProduct,
  currency,
}: VendorAnalyticsProps) {
  // Navigation tabs: 'dashboard' | 'inventory' | 'orders' | 'settings'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'orders'>('dashboard');
  
  // Database states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // CRUD product form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields
  const [pTitle, setPTitle] = useState('');
  const [pPrice, setPPrice] = useState(100);
  const [pFloor, setPFloor] = useState(80);
  const [pStock, setPStock] = useState(10);
  const [pCategory, setPCategory] = useState('electronics');
  const [pDesc, setPDesc] = useState('');
  const [pImg, setPImg] = useState('');

  // Sample Recharts historical analytics matching Screen 2 line points
  const trendsData = [
    { day: 'Oct 1', sales: 400 },
    { day: 'Oct 5', sales: 900 },
    { day: 'Oct 10', sales: 700 },
    { day: 'Oct 15', sales: 1500 },
    { day: 'Oct 20', sales: 1200 },
    { day: 'Oct 25', sales: 2100 },
    { day: 'Oct 30', sales: 1800 },
  ];

  // Load database
  const loadVendorData = async () => {
    setLoading(true);
    const prods = await dbService.getProducts();
    const ords = await dbService.getOrders();
    setProducts(prods);
    setOrders(ords);
    setLoading(false);
  };

  useEffect(() => {
    loadVendorData();
  }, [activeTab]);

  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setPTitle(p.title);
    setPPrice(p.price);
    setPFloor(p.priceFloor || Math.round(p.price * 0.8));
    setPStock(p.stockQty);
    setPCategory(p.categoryId);
    setPDesc(p.description);
    setPImg(p.images[0]);
    setShowAddForm(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingProduct ? editingProduct.id : `prod-custom-${Date.now()}`;
    const newProd: Product = {
      id,
      vendorId: 'vendor-techhaven',
      vendorName: 'TechHaven',
      categoryId: pCategory,
      title: pTitle,
      description: pDesc || `High quality premium ${pTitle} ready for immediate processing and secure escrow delivery.`,
      price: Number(pPrice),
      currency: 'USD',
      stockQty: Number(pStock),
      images: [pImg || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600'],
      status: Number(pStock) > 0 ? 'active' : 'out_of_stock',
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 1,
      priceFloor: Number(pFloor),
    };

    await dbService.saveProduct(newProd);
    onAddProduct(newProd); // Bubble to App level
    
    // Clear
    setShowAddForm(false);
    setEditingProduct(null);
    setPTitle('');
    setPDesc('');
    setPImg('');
    loadVendorData();
    alert("Success! Product catalog updated and synchronized to our e-commerce marketplace node.");
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this listing from the Tenbuk grid?")) {
      await dbService.deleteProduct(id);
      loadVendorData();
    }
  };

  const handleUpdateOrderStatus = async (ordId: string, status: OrderStatus) => {
    // Escrow releases automatically if delivered
    const escrow: EscrowStatus = status === 'delivered' ? 'released' : 'held';
    await dbService.updateOrderStatus(ordId, status, escrow);
    loadVendorData();
    alert(`Order status updated to: ${status}. Active escrow states recalculated.`);
  };

  // Convert numerical pricing values based on current display currency toggle
  const formatValue = (usdVal: number) => {
    const rate = 1500;
    if (currency === 'USD') {
      return `$${usdVal.toLocaleString()}`;
    } else {
      return `₦${Math.ceil(usdVal * rate).toLocaleString()}`;
    }
  };

  return (
    <div className="font-sans text-slate-800 bg-[#f8fafc]/40 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header summary and Horizontal Navigation Tabs */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-orange-500 flex items-center justify-center p-1 overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" alt="Vendor owner avatar" referrerPolicy="no-referrer" className="object-cover rounded-full h-full w-full" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                  Vendor Hub
                </h1>
                <p className="text-[10px] text-orange-500 font-extrabold uppercase tracking-widest font-mono">Elite Seller Status</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                id="btn-vendor-post-product"
                onClick={() => { setActiveTab('inventory'); setShowAddForm(true); setEditingProduct(null); }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98] shadow-md shadow-orange-500/10"
              >
                <Plus className="w-4 h-4" />
                Post New Product
              </button>
              <button 
                onClick={loadVendorData}
                className="p-2.5 border border-slate-200 hover:bg-slate-50 transition-colors rounded-xl text-slate-600 text-xs font-bold font-sans cursor-pointer flex items-center justify-center bg-white shadow-xs"
                title="Refresh database node"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Nav links */}
          <nav className="flex gap-2 overflow-x-auto pb-1">
            <button
              id="tab-db"
              onClick={() => { setActiveTab('dashboard'); setShowAddForm(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
                activeTab === 'dashboard' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-4 h-4" />
              Dashboard
            </button>
            <button
              id="tab-inv"
              onClick={() => { setActiveTab('inventory'); setShowAddForm(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
                activeTab === 'inventory' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4" />
              Inventory
            </button>
            <button
              id="tab-orders"
              onClick={() => { setActiveTab('orders'); setShowAddForm(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
                activeTab === 'orders' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Inbox className="w-4 h-4" />
              Orders Queue
            </button>
          </nav>
        </div>

        {/* Dynamic view segments */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Quick Status Stats grid matching Screen 2 */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Storefront Performance Score matching Screen 2 */}
              <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-xs flex flex-col justify-between min-h-[140px] border-l-4 border-l-emerald-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Your Storefront</p>
                    <p className="text-sm font-black text-emerald-600 font-sans">Elite Seller Status</p>
                  </div>
                  <span className="p-2 bg-emerald-50 rounded-xl text-emerald-500 text-xs font-bold font-sans">✓ Verified</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-black text-slate-700">
                    <span>Performance Score</span>
                    <span>95/100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
              </div>

              {/* Total Revenue Stat matching Screen 2 */}
              <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-xs flex flex-col justify-between min-h-[140px] border-l-4 border-l-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Total Revenue</p>
                    <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{formatValue(24500)}</p>
                  </div>
                  <div className="bg-blue-50 text-blue-500 p-2.5 rounded-xl">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-0.5">
                  📈 +12% vs last month
                </p>
              </div>

              {/* Active Orders Count matching Screen 2 */}
              <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-xs flex flex-col justify-between min-h-[140px] border-l-4 border-l-orange-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Active Orders</p>
                    <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{orders.length + 138}</p>
                  </div>
                  <div className="bg-orange-50 text-orange-500 p-2.5 rounded-xl">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                  <span>Processing: <span className="font-black text-slate-700">85</span></span>
                  <span>In Escrow: <span className="font-black text-slate-700">53</span></span>
                </div>
              </div>

              {/* Stock Alerts matching Screen 2 */}
              <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-xs flex flex-col justify-between min-h-[140px] border-l-4 border-l-rose-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Stock Alerts</p>
                    <p className="text-[11px] font-bold text-slate-800 line-clamp-1 leading-snug">Wireless Earbuds Pro</p>
                  </div>
                  <div className="bg-rose-50 text-rose-500 p-1.5 rounded-lg">
                    <AlertTriangle className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md font-bold">2 Left</span>
                  <span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-md font-bold">Smart Watch Out</span>
                </div>
              </div>

            </div>

            {/* Sales Trends Chart Row matching Screen 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-2">
                <h3 className="font-bold text-base text-slate-900 tracking-tight font-sans">
                  Sales Trends
                </h3>
                <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-50 border px-2.5 py-1 rounded-lg font-sans">
                  Last 30 Days
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0b1528', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#f97316" 
                      strokeWidth={3} 
                      activeDot={{ r: 6 }} 
                      dot={{ r: 4, stroke: '#ea580c', fill: '#ffffff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Orders log panel matching Screen 2 */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-base text-slate-900 tracking-tight font-sans">
                  Recent Active Orders (Escrow State)
                </h3>
                <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-orange-500 hover:text-orange-600 font-sans">View All Orders Queue &rarr;</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 uppercase tracking-wider font-extrabold font-mono border-b border-slate-100">
                      <th className="p-4 pl-6">Order ID</th>
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Placement Date</th>
                      <th className="p-4">Delivery Status</th>
                      <th className="p-4">Escrow Status</th>
                      <th className="p-4 text-right pr-6">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/40">
                        <td className="p-4 pl-6 font-mono font-bold text-slate-900">#{o.id}</td>
                        <td className="p-4 font-bold">{o.shippingAddress?.firstName || 'Guest'} {o.shippingAddress?.lastName || ''}</td>
                        <td className="p-4 font-mono">{new Date(o.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full font-bold text-[9px] uppercase ${
                            o.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                            o.status === 'shipped' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full font-bold text-[9px] uppercase ${
                            o.escrowStatus === 'released' ? 'bg-emerald-100 text-emerald-700' :
                            o.escrowStatus === 'disputed' ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-yellow-50 text-yellow-700'
                          }`}>
                            {o.escrowStatus === 'released' ? 'Credited' : o.escrowStatus === 'disputed' ? 'Flagged/disputed' : 'Pending Escrow'}
                          </span>
                        </td>
                        <td className="p-4 text-right pr-6 font-bold text-slate-900 font-mono">{formatValue(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* CRUD form slide down */}
            {showAddForm && (
              <form onSubmit={handleSaveProduct} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-md max-w-2xl">
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-widest font-sans border-b border-slate-50 pb-2">
                  {editingProduct ? '📝 Edit Platform Product' : '➕ Post New Marketplace Product'}
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Name / Title</label>
                    <input type="text" required value={pTitle} onChange={(e) => setPTitle(e.target.value)} placeholder="Zenith Pro Headphones..." className="w-full text-xs p-3 border rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Category</label>
                    <select value={pCategory} onChange={(e) => setPCategory(e.target.value)} className="w-full text-xs p-3 border rounded-xl bg-white font-semibold">
                      <option value="phones">Phones</option>
                      <option value="computers">Computers</option>
                      <option value="fashion">Fashion & Travel</option>
                      <option value="electronics">Electronics</option>
                      <option value="home_living">Home & Living</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Default Retail Price (USD)</label>
                    <input type="number" required min={1} value={pPrice} onChange={(e) => setPPrice(Number(e.target.value))} className="w-full text-xs p-3 border rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bargain Floor Price (USD)</label>
                    <input type="number" required min={1} value={pFloor} onChange={(e) => setPFloor(Number(e.target.value))} className="w-full text-xs p-3 border rounded-xl text-orange-600 font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock Quantity</label>
                    <input type="number" required min={0} value={pStock} onChange={(e) => setPStock(Number(e.target.value))} className="w-full text-xs p-3 border rounded-xl" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Feature Description</label>
                  <textarea rows={3} value={pDesc} onChange={(e) => setPDesc(e.target.value)} placeholder="Premium features of product catalog..." className="w-full text-xs p-3 border rounded-xl" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unsplash image URL / asset link</label>
                  <input type="text" value={pImg} onChange={(e) => setPImg(e.target.value)} placeholder="https://images.unsplash.com/..." className="w-full text-xs p-3 border rounded-xl" />
                </div>

                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => { setShowAddForm(false); setEditingProduct(null); }} className="bg-slate-100 font-bold text-slate-700 px-4 py-2.5 rounded-lg text-xs cursor-pointer">Cancel</button>
                  <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-5 py-2.5 rounded-lg text-xs cursor-pointer">Save Catalog Listing</button>
                </div>
              </form>
            )}

            {/* Inventory List Grid Custom CRUD */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-slate-900 tracking-tight font-sans">Active Storefront Inventory ({products.length} Items)</h3>
                {!showAddForm && (
                  <button
                    id="btn-add-inv-list"
                    onClick={() => { setShowAddForm(true); setEditingProduct(null); }}
                    className="bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    + Add New Custom Item
                  </button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div key={p.id} className="border border-slate-100 rounded-xl bg-slate-50 p-4 space-y-3 relative flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="h-32 flex items-center justify-center p-2 rounded-lg bg-white overflow-hidden border">
                        <img src={p.images[0]} alt={p.title} referrerPolicy="no-referrer" className="max-h-full max-w-full object-contain" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{p.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Category: {p.categoryId}</p>
                    </div>

                    <div className="pt-3 border-t space-y-2">
                      <div className="flex justify-between text-[11px] font-mono leading-none">
                        <span>List Price: <span className="font-bold text-slate-900">{formatValue(p.price)}</span></span>
                        <span>Floor Price: <span className="font-bold text-orange-600">{formatValue(p.priceFloor || p.price * 0.8)}</span></span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>Stock: <span className={`font-black uppercase ${p.stockQty > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{p.stockQty} Units</span></span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          id={`btn-edit-inv-${p.id}`}
                          onClick={() => handleEditClick(p)}
                          className="bg-white border rounded-lg py-1.5 text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                          <Edit2 className="w-3 h-3 text-slate-400" /> Edit
                        </button>
                        <button
                          id={`btn-delete-inv-${p.id}`}
                          onClick={() => handleDeleteProduct(p.id)}
                          className="bg-rose-50 text-rose-600 border border-rose-100 rounded-lg py-1.5 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 border shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900 font-sans pb-2 border-b">Active Escrow Order Logistics Panel</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                As a vendor, you can update order shipment statuses here. Setting step to "Shipped" moves it to dispatch, and "Delivered" will complete shipping and release held escrow funds from the ledger.
              </p>

              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="p-5 border rounded-xl bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5 text-xs">
                      <p className="font-extrabold text-slate-800 flex items-center gap-2">
                        Order #{o.id}
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          o.escrowStatus === 'released' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.escrowStatus === 'released' ? 'Escrow Disbursed' : 'Escrow Locked/Held'}
                        </span>
                      </p>
                      <p className="text-slate-500 font-mono">Date: {new Date(o.createdAt).toLocaleDateString()}</p>
                      <p className="font-medium">Total Billing: <span className="font-bold text-slate-950 font-mono">{formatValue(o.total)}</span></p>
                      <p className="text-slate-400">Shipped to: {o.shippingAddress?.firstName} {o.shippingAddress?.lastName} ({o.shippingAddress?.streetAddress}, {o.shippingAddress?.city})</p>
                    </div>

                    <div className="space-y-1.5 text-xs font-semibold w-full md:w-auto">
                      <p className="text-slate-400 uppercase text-[9px] tracking-wider">Recalculate Status</p>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'placed')}
                          className={`px-3 py-1.5 rounded-lg border cursor-pointer ${o.status === 'placed' ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-100'}`}
                        >
                          Placed
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'processing')}
                          className={`px-3 py-1.5 rounded-lg border cursor-pointer ${o.status === 'processing' ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-100'}`}
                        >
                          Processing
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'shipped')}
                          className={`px-3 py-1.5 rounded-lg border cursor-pointer ${o.status === 'shipped' ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-100'}`}
                        >
                          Shipped
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'delivered')}
                          className={`px-3 py-1.5 rounded-lg border border-emerald-300 cursor-pointer ${o.status === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-white hover:bg-emerald-50 text-emerald-700'}`}
                        >
                          Delivered
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
