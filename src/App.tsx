import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BuyerHome from './components/BuyerHome';
import ProductDetails from './components/ProductDetails';
import Checkout from './components/Checkout';
import OrderTracking from './components/OrderTracking';
import VendorAnalytics from './components/VendorAnalytics';
import AdminConsole from './components/AdminConsole';
import { Product, Order, UserRole } from './types';
import { dbService } from './services/db';
import { LuTrash as Trash, LuShieldCheck as ShieldCheck, LuX as X, LuShoppingCart as ShoppingCart, LuHandshake as Handshake, LuScale as Scale } from 'react-icons/lu';

export default function App() {
  const [currentView, setView] = useState<'marketplace' | 'details' | 'checkout' | 'track_order' | 'vendor_hub' | 'admin_console'>('marketplace');
  const [selectedProductId, setSelectedProductId] = useState<string>('prod-zenith-anc');
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string>('TBK-8924-M');
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number; negotiatedPrice?: number }>>([]);
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD');
  const [role, setRole] = useState<UserRole>('buyer');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Db synced lists
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Compare overlay states
  const [compareProductA, setCompareProductA] = useState<Product | null>(null);
  const [compareProductB, setCompareProductB] = useState<Product | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Fetch db initial lists
  const refreshAppData = async () => {
    const listProds = await dbService.getProducts();
    const listOrders = await dbService.getOrders();
    setProducts(listProds);
    setOrders(listOrders);
  };

  useEffect(() => {
    refreshAppData();
  }, [currentView]);

  // Sync default currency with specific view requirements
  useEffect(() => {
    if (currentView === 'marketplace') {
      setCurrency('NGN'); // Marketplace focuses on Naira deals as shown in Screen 3
    } else {
      setCurrency('USD'); // Shipping, payment, dashboards represent USD standard as shown in Screens 1, 2, 4, 5
    }
  }, [currentView]);

  const handleSelectProduct = (id: string) => {
    setSelectedProductId(id);
    setView('details');
  };

  const handleAddToCart = (product: Product, quantity: number, finalPrice?: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        existing.quantity += quantity;
        if (finalPrice) existing.negotiatedPrice = finalPrice;
        return [...prev];
      }
      return [...prev, { product, quantity, negotiatedPrice: finalPrice }];
    });
    setCartOpen(true);
  };

  const handleRemoveFromCart = (prodId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== prodId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleToggleWishlist = (p: Product) => {
    setWishlistIds((prev) =>
      prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
    );
  };

  const handleOpenCompare = (p: Product) => {
    setCompareProductA(p);
    // Find another item in the same category
    const alternative = products.find((item) => item.id !== p.id && item.categoryId === p.categoryId) || products[0];
    setCompareProductB(alternative || null);
    setShowCompareModal(true);
  };

  const formatPrice = (val: number, prodCurrency: 'USD' | 'NGN') => {
    const rate = 1500;
    if (currency === 'USD') {
      const pUSD = prodCurrency === 'USD' ? val : val / rate;
      return `$${pUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      const pNGN = prodCurrency === 'NGN' ? val : val * rate;
      return `₦${Math.ceil(pNGN).toLocaleString()}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]/30">
      
      {/* Top Header Component */}
      <Header
        currentView={currentView}
        setView={setView}
        cart={cart}
        currency={currency}
        setCurrency={setCurrency}
        openCart={() => setCartOpen(!cartOpen)}
        role={role}
        setRole={setRole}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main viewport frame */}
      <main className="flex-grow">
        {currentView === 'marketplace' && (
          <BuyerHome
            products={products}
            onSelectProduct={handleSelectProduct}
            currency={currency}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onOpenCompare={handleOpenCompare}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery('')}
            setView={setView}
          />
        )}

        {currentView === 'details' && (
          <ProductDetails
            productId={selectedProductId}
            onBack={() => setView('marketplace')}
            onAddToCart={handleAddToCart}
            currency={currency}
          />
        )}

        {currentView === 'checkout' && (
          <Checkout
            cart={cart}
            onClearCart={handleClearCart}
            currency={currency}
            onOrderCompleted={(orderId) => {
              setSelectedTrackingOrderId(orderId);
              setView('track_order');
            }}
          />
        )}

        {currentView === 'track_order' && (
          <OrderTracking
            orderId={selectedTrackingOrderId}
            onBack={() => setView('marketplace')}
            currency={currency}
          />
        )}

        {currentView === 'vendor_hub' && (
          <VendorAnalytics
            onAddProduct={async (p) => {
              setProducts(prev => [p, ...prev]);
              await refreshAppData();
            }}
            currency={currency}
          />
        )}

        {currentView === 'admin_console' && (
          <AdminConsole
            currency={currency}
          />
        )}
      </main>

      {/* Sub footer branding matching Screen 3 bottom rail */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 py-8 text-center text-xs space-y-2 font-sans flex-shrink-0">
        <p className="font-extrabold text-white tracking-widest uppercase">TENBUK.COM &bull; EXPERT ESCROW LOGISTICS</p>
        <p className="max-w-md mx-auto text-[10px] text-slate-400 font-light px-4">
          All negotiations, deposits, and delivery transactions are logged on platform nodes. Escrow settlements automatically resolve within 14 days after courier dispatch verification.
        </p>
        <p className="text-[9px] text-slate-600">&copy; 2026 Tenbuk Escrow Systems. All rights reserved.</p>
      </footer>

      {/* Cart Drawer Panel (Slide out right side overlay) */}
      {cartOpen && (
        <div id="cart-drawer-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white max-w-md w-full h-full shadow-2xl p-6 flex flex-col justify-between font-sans animate-in slide-in-from-right duration-300">
            <div className="space-y-6 flex-grow overflow-y-auto pr-1">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="font-black text-slate-900 uppercase text-sm font-sans flex items-center gap-1.5 pb-1">
                  <ShoppingCart className="w-4 h-4" /> Verified Shopping Cart
                </h3>
                <button 
                  id="btn-close-cart"
                  onClick={() => setCartOpen(false)} 
                  className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-24 text-slate-400 flex flex-col items-center space-y-4 font-sans">
                  <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold font-sans">Your shopping cart is empty</p>
                  <p className="text-[10px] text-slate-400">Discover premium items in our top deals and start a bargained deal!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => {
                    const priceToUse = item.negotiatedPrice || item.product.price;
                    return (
                      <div key={item.product.id} className="flex gap-4 border-b border-slate-50 pb-4">
                        <div className="w-16 h-16 rounded-xl bg-slate-50 p-2 border flex items-center justify-center flex-shrink-0">
                          <img src={item.product.images[0]} alt={item.product.title} className="object-contain max-h-full" />
                        </div>
                        <div className="flex-1 space-y-1 text-xs">
                          <h4 className="font-bold text-slate-800 line-clamp-1">{item.product.title}</h4>
                          <p className="text-[10px] text-orange-500 font-extrabold font-mono uppercase">Store: {item.product.vendorName}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Qty: {item.quantity}</span>
                            <span className="font-extrabold text-slate-900 font-mono">
                              {formatPrice(priceToUse, item.product.currency)}
                            </span>
                          </div>
                          {item.negotiatedPrice && (
                            <span className="bg-orange-100 text-orange-700 flex items-center gap-1 w-max text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md mt-1">
                              <Handshake className="w-3 h-3" /> AI Price Locked
                            </span>
                          )}
                        </div>
                        <button
                          id={`btn-del-cart-${item.product.id}`}
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer p-1.5 fit-content flex-shrink-0"
                          title="Remove item"
                        >
                          <Trash className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Actions of checkout */}
            {cart.length > 0 && (
              <div className="border-t border-slate-100 pt-4 mt-4 space-y-4">
                <div className="flex justify-between items-baseline text-sm font-sans font-bold">
                  <span>Subtotal:</span>
                  <span className="text-xl font-black text-orange-600 font-mono">
                    {formatPrice(
                      cart.reduce((acc, i) => acc + (i.negotiatedPrice || i.product.price) * i.quantity, 0),
                      currency === 'USD' ? 'USD' : 'NGN' // match display conversions
                    )}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-cart-clear-all"
                    onClick={handleClearCart}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 border text-xs font-bold py-3.5 rounded-xl transition-all cursor-pointer text-center"
                  >
                    Clear All
                  </button>
                  <button
                    id="btn-cart-checkout"
                    onClick={() => {
                      setCartOpen(false);
                      setView('checkout');
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black py-4 rounded-xl transition-all shadow-md shadow-orange-500/10 cursor-pointer text-center"
                  >
                    Secure Checkout &rarr;
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 text-center uppercase tracking-wider block pt-1 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SwiftLogistics & Escrow Guaranteed
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compare Vendors Modal popup */}
      {showCompareModal && compareProductA && compareProductB && (
        <div id="compare-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full border shadow-2xl p-8 space-y-6 relative animate-in zoom-in-95 duration-200 font-sans">
            <button 
              id="btn-close-compare"
              onClick={() => setShowCompareModal(false)} 
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="font-black text-slate-900 text-lg uppercase tracking-wider font-sans border-b pb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-500" /> Side-By-Side Product Comparison
            </h3>

            <div className="grid grid-cols-2 gap-8 divide-x divide-slate-100 p-2">
              
              {/* Product A Compare */}
              <div className="space-y-4">
                <div className="h-36 flex items-center justify-center rounded-xl bg-slate-50 border p-3">
                  <img src={compareProductA.images[0]} alt={compareProductA.title} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="space-y-1.5 text-xs">
                  <span className="bg-orange-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-sm">Current Selection</span>
                  <h4 className="font-bold text-slate-800 line-clamp-1">{compareProductA.title}</h4>
                  <p className="text-slate-400">Merchant: <span className="text-indigo-600 font-bold">{compareProductA.vendorName}</span></p>
                  <p className="font-extrabold text-sm text-orange-600">{formatPrice(compareProductA.price, compareProductA.currency)}</p>
                  <p className="text-slate-500">{compareProductA.description.slice(0, 100)}...</p>
                  <button
                    id="btn-confirm-compare-a"
                    onClick={() => {
                      handleSelectProduct(compareProductA.id);
                      setShowCompareModal(false);
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-[11px] cursor-pointer"
                  >
                    View & Bargain Selected
                  </button>
                </div>
              </div>

              {/* Product B Compare alternative */}
              <div className="space-y-4 pl-8">
                <div className="h-36 flex items-center justify-center rounded-xl bg-slate-50 border p-3">
                  <img src={compareProductB.images[0]} alt={compareProductB.title} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="space-y-1.5 text-xs">
                  <span className="bg-slate-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-sm">Alternative Deal</span>
                  <h4 className="font-bold text-slate-800 line-clamp-1">{compareProductB.title}</h4>
                  <p className="text-slate-400">Merchant: <span className="text-indigo-600 font-bold">{compareProductB.vendorName}</span></p>
                  <p className="font-extrabold text-sm text-orange-600">{formatPrice(compareProductB.price, compareProductB.currency)}</p>
                  <p className="text-slate-500">{compareProductB.description.slice(0, 100)}...</p>
                  <button
                    id="btn-confirm-compare-b"
                    onClick={() => {
                      handleSelectProduct(compareProductB.id);
                      setShowCompareModal(false);
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-[11px] cursor-pointer"
                  >
                    View & Bargain Alternative
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
