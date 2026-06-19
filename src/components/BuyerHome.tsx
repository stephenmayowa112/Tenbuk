import React, { useState } from 'react';
import { LuHeart as Heart, LuStar as Star, LuSlidersHorizontal as SlidersHorizontal, LuArrowRightLeft as ArrowRightLeft, LuShield as Shield, LuSparkles as Sparkles, LuSend as Send } from 'react-icons/lu';
import { Product } from '../types';

interface BuyerHomeProps {
  products: Product[];
  onSelectProduct: (id: string) => void;
  currency: 'USD' | 'NGN';
  onToggleWishlist: (p: Product) => void;
  wishlistIds: string[];
  onOpenCompare: (p: Product) => void;
  searchQuery: string;
  onClearSearch: () => void;
}

export default function BuyerHome({
  products,
  onSelectProduct,
  currency,
  onToggleWishlist,
  wishlistIds,
  onOpenCompare,
  searchQuery,
  onClearSearch,
}: BuyerHomeProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Category list as shown in Screen 3
  const categories = [
    { id: 'phones', name: 'Phones', icon: '📱' },
    { id: 'computers', name: 'Computers', icon: '💻' },
    { id: 'fashion', name: 'Fashion', icon: '🧥' },
    { id: 'home_living', name: 'Home & Living', icon: '🛋️' },
    { id: 'beauty', name: 'Beauty', icon: '🧴' },
    { id: 'electronics', name: 'Electronics', icon: '⚙️' },
  ];

  // Helper function to format prices cleanly based on currency
  const formatPrice = (val: number, prodCurrency: 'USD' | 'NGN') => {
    // If currency state doesn't match product default currency, apply conversion rate
    // Let's assume $1 = 1500 NGN for display parity
    const rate = 1500;
    if (currency === 'USD') {
      const priceUSD = prodCurrency === 'USD' ? val : val / rate;
      return `$${priceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      const priceNGN = prodCurrency === 'NGN' ? val : val * rate;
      return `₦${Math.ceil(priceNGN).toLocaleString()}`;
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSuccessEmail(newsletterEmail);
      setNewsletterEmail('');
      setTimeout(() => setSuccessEmail(''), 5000);
    }
  };

  // Filter based on category & search query
  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory ? p.categoryId === activeCategory : true;
    const matchesSearch = searchQuery
      ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="font-sans text-slate-800 bg-[#f8fafc]/50 min-h-screen">
      {/* Hero Banner matching Screen 3 */}
      <section className="max-w-7xl mx-auto px-4 pt-6 sm:px-6 lg:px-8">
        <div className="bg-[#0b1528] rounded-3xl overflow-hidden relative shadow-xl grid md:grid-cols-2 items-center min-h-[380px] p-8 md:p-12 lg:p-16">
          {/* Decorative background vectors */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-6">
            <span className="bg-orange-500 text-white font-extrabold text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full">
              Limited Time Offer
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Hot Deals &<br className="hidden sm:inline" /> Big Savings!
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-sm font-sans font-light leading-relaxed">
              Discover top products at unbeatable prices. Shop smart with our multi-vendor escrow protection.
            </p>
            <div className="flex items-baseline gap-4">
              <button
                id="hero-buy-button"
                onClick={() => onSelectProduct('prod-zenith-anc')}
                className="bg-orange-500 text-white hover:bg-orange-600 font-extrabold px-8 py-3 rounded-xl transition-all shadow-md hover:translate-y-[-2px] cursor-pointer"
              >
                Shop Now
              </button>
              <div className="text-white">
                <span className="text-xs text-slate-400 block line-through">₦18,500</span>
                <span className="text-2xl font-black text-orange-400">₦12,000</span>
              </div>
            </div>
          </div>

          {/* Banner image matching Screen 3 shoe design */}
          <div className="relative flex justify-center mt-8 md:mt-0">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-white/5 rounded-3xl overflow-hidden flex items-center justify-center p-8 border border-white/10 shadow-inner">
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600"
                alt="Nike Red Sneaker Offer"
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain drop-shadow-[0_20px_40px_rgba(249,115,22,0.3)] animate-float"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Explore Categories matching Screen 3 icons strip */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 font-sans">
          Explore Categories
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {categories.map((c) => (
            <button
              id={`cat-select-${c.id}`}
              key={c.id}
              onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all cursor-pointer ${
                activeCategory === c.id
                  ? 'border-orange-500 bg-orange-50 text-orange-600 font-bold shadow-md shadow-orange-500/10'
                  : 'border-slate-100 bg-white text-slate-700 hover:border-slate-200 hover:shadow-xs'
              }`}
            >
              <span className="text-2xl mb-2">{c.icon}</span>
              <span className="text-xs font-semibold tracking-tight">{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Top Deals matching Screen 3 grid layout */}
      <section className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
              Top Deals
            </h2>
            <p className="text-xs text-slate-400 font-sans">Discover verified quality and escrow convenience.</p>
          </div>
          <button
            id="view-all-deals-btn"
            onClick={() => setActiveCategory(null)}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 font-sans cursor-pointer flex items-center gap-1"
          >
            View All &rarr;
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 max-w-lg mx-auto space-y-4">
            <span className="text-4xl text-slate-300">🔍</span>
            <h3 className="text-lg font-bold text-slate-700">No products match your criteria</h3>
            <p className="text-sm text-slate-400">Try modifying your search or select a different category filter.</p>
            <button
              onClick={() => { onClearSearch(); setActiveCategory(null); }}
              className="bg-orange-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const isWishlisted = wishlistIds.includes(p.id);
              // Calculate discount tag for products matching screenshots
              const isANC = p.id === 'prod-zenith-anc';
              const isPremium = p.id === 'prod-premium-wireless';
              const isSpeaker = p.id === 'prod-home-assistant';
              let discountPct = 0;
              if (isPremium) discountPct = 38;
              if (isSpeaker) discountPct = 15;

              return (
                <div
                  id={`prod-card-${p.id}`}
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-lg transition-all group duration-300 flex flex-col relative"
                >
                  {/* Discount Badge */}
                  {discountPct > 0 && (
                    <span className="absolute top-4 left-4 z-10 bg-orange-500 text-white font-black text-[10px] uppercase tracking-wider px-2 py-1 rounded-md">
                      -{discountPct}%
                    </span>
                  )}

                  {/* Wishlist Icon */}
                  <button
                    id={`btn-wishlist-${p.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(p);
                    }}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 shadow-md hover:bg-white text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>

                  {/* Product Image Clickable */}
                  <div 
                    onClick={() => onSelectProduct(p.id)}
                    className="bg-slate-50 h-52 overflow-hidden relative flex items-center justify-center p-6 cursor-pointer"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain group-hover:scale-[1.05] transition-transform duration-300"
                    />
                    {/* Hover fast action */}
                    <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/90 text-slate-800 text-xs font-bold px-4 py-2 rounded-lg shadow-md flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                        AI Bargain & Buy
                      </span>
                    </div>
                  </div>

                  {/* Card Content Grid */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                          🛡️ {p.vendorName}
                        </span>
                      </div>

                      {/* Stars count */}
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 fill-current ${
                                i < Math.floor(p.rating) ? 'text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">({p.reviewsCount})</span>
                      </div>

                      <h3 
                        onClick={() => onSelectProduct(p.id)}
                        className="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition-colors cursor-pointer line-clamp-2 leading-snug font-sans h-10"
                      >
                        {p.title}
                      </h3>
                    </div>

                    <div className="pt-4 flex flex-col gap-3 border-t border-slate-50 mt-4 justify-end">
                      {/* Pricing block */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-orange-600">
                          {formatPrice(p.price, p.currency)}
                        </span>
                        {discountPct > 0 && (
                          <span className="text-xs text-slate-300 line-through">
                            {formatPrice(p.price / (1 - discountPct / 100), p.currency)}
                          </span>
                        )}
                      </div>

                      {/* Multi Action buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          id={`btn-compare-${p.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCompare(p);
                          }}
                          className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-1.5 rounded-lg font-sans cursor-pointer transition-all active:scale-[0.98]"
                        >
                          <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                          Compare
                        </button>
                        <button
                          id={`btn-bargain-buy-${p.id}`}
                          onClick={() => onSelectProduct(p.id)}
                          className="flex items-center justify-center text-[11px] font-extrabold text-white bg-orange-500 hover:bg-orange-600 py-1.5 rounded-lg font-sans cursor-pointer shadow-xs transition-all active:scale-[0.98]"
                        >
                          Bargain & Buy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Buy Smart. Sell Easy. Escrow Blue Callout Banner matching Screen 3 footer section */}
      <section className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
        <div className="bg-[#0b1528] rounded-3xl p-8 sm:p-12 lg:p-16 text-center text-white relative overflow-hidden shadow-lg border border-slate-800">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900/0 md:scale-[1.1] pointer-events-none"></div>

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-sans">
              Buy Smart. Sell Easy.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
              Join thousands of verified buyers and sellers on TENBUK. Get the best electronic gadgets and lifestyle goods, and rest easy knowing funds reside safely in escrow until you verify delivery.
            </p>

            {/* Quick Benefits icons strip */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5 text-slate-300 max-w-lg mx-auto text-center">
              <div className="space-y-1">
                <span className="text-lg bg-emerald-500/10 p-2 rounded-full inline-block">🛡️</span>
                <p className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Escrow Payment</p>
                <p className="text-[9px] text-slate-500">100% Secure held funds</p>
              </div>
              <div className="space-y-1">
                <span className="text-lg bg-orange-500/10 p-2 rounded-full inline-block">🚚</span>
                <p className="text-[10px] font-black uppercase text-orange-400 tracking-wider">Fast Delivery</p>
                <p className="text-[9px] text-slate-500">Nationwide courier</p>
              </div>
              <div className="space-y-1">
                <span className="text-lg bg-sky-500/10 p-2 rounded-full inline-block">📞</span>
                <p className="text-[10px] font-black uppercase text-sky-400 tracking-wider font-sans">24/7 Support</p>
                <p className="text-[9px] text-slate-500">Always here to help</p>
              </div>
            </div>

            {/* Newsletter input form */}
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto relative pt-4">
              <input
                id="newsletter-email-input"
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email for hot deals"
                className="flex-1 px-4 py-3 text-sm text-slate-800 bg-white rounded-xl placeholder-slate-400 focus:outline-hidden"
              />
              <button
                id="newsletter-submit-btn"
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                Subscribe
              </button>
            </form>

            {successEmail && (
              <div className="p-3 bg-emerald-500/10 text-emerald-400 text-xs rounded-xl font-bold border border-emerald-500/20 max-w-sm mx-auto animate-in fade-in duration-200">
                🎉 Subscribed successfully with {successEmail}! Welcome to Tenbuk!
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
