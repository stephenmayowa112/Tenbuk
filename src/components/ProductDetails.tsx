import React, { useState, useEffect, useRef } from 'react';
import { Star, Shield, ArrowLeft, ShoppingCart, Sparkles, Send, Check, X, ArrowRightLeft } from 'lucide-react';
import { Product, ChatMessage } from '../types';
import { dbService } from '../services/db';

interface ProductDetailsProps {
  productId: string;
  onBack: () => void;
  onAddToCart: (p: Product, qty: number, finalPrice?: number) => void;
  currency: 'USD' | 'NGN';
}

export default function ProductDetails({
  productId,
  onBack,
  onAddToCart,
  currency,
}: ProductDetailsProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');
  const [activeImage, setActiveImage] = useState('');
  const [chatOpen, setChatOpen] = useState(true);

  // Chat/Bargain states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [bargainPrice, setBargainPrice] = useState<number | null>(null);
  const [negotiating, setNegotiating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load product & chat data
  useEffect(() => {
    async function loadProductData() {
      setLoading(true);
      const allProds = await dbService.getProducts();
      const found = allProds.find(p => p.id === productId);
      if (found) {
        setProduct(found);
        setActiveImage(found.images[0]);
        // Load messages for this product
        const chatHist = await dbService.getChatMessages(productId);
        setMessages(chatHist);
      }
      setLoading(false);
    }
    loadProductData();
  }, [productId]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 mt-4 text-sm font-sans">Loading product specification sheet...</p>
      </div>
    );
  }

  const discountPrice = product.price * 0.85; // Mock original price was higher
  const originalPriceStr = (product.price * 1.2).toFixed(2);
  const displaySymbol = currency === 'USD' ? '$' : '₦';

  // Format price based on current toggle currency
  const formatValue = (usdVal: number) => {
    const rate = 1500;
    if (currency === 'USD') {
      return `$${usdVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `₦${Math.ceil(usdVal * rate).toLocaleString()}`;
    }
  };

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || userInput;
    if (!textToSend.trim()) return;

    setUserInput('');
    setNegotiating(true);

    // 1. Append user message
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      productId: product.id,
      senderId: 'buyer-jane',
      senderRole: 'buyer',
      body: textToSend,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    await dbService.addChatMessage(userMsg);

    // 2. Fetch AI response from backend /api/negotiate
    try {
      const response = await fetch('/api/negotiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          productTitle: product.title,
          productPrice: product.price,
          priceFloor: product.priceFloor || product.price * 0.8,
          currency: 'USD', // Negotiate in USD base
          lastMessage: textToSend,
          history: updatedMessages.slice(-6), // Send last 6 messages
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          productId: product.id,
          senderId: 'ai-vendor-bot',
          senderRole: 'ai_vendor',
          body: data.message,
          createdAt: new Date().toISOString(),
          proposedPrice: data.proposedPrice || undefined,
          status: data.status,
        };

        setMessages((prev) => [...prev, aiMsg]);
        await dbService.addChatMessage(aiMsg);

        if (data.status === 'accepted' && data.proposedPrice) {
          setBargainPrice(data.proposedPrice);
        } else if (data.proposedPrice) {
          setBargainPrice(data.proposedPrice);
        }
      } else {
        // HTTP Fail fallback
        throw new Error('Negotiation endpoint failed');
      }
    } catch (err) {
      console.warn(err);
      // Static offline fallback
      const aiMsg: ChatMessage = {
        id: `msg-ai-err-${Date.now()}`,
        productId: product.id,
        senderId: 'ai-vendor-bot',
        senderRole: 'ai_vendor',
        body: `Because we appreciate your immediate purchase, I'm delighted to offer this item to you for $225.00! Would you like to accept this special offer?`,
        createdAt: new Date().toISOString(),
        proposedPrice: 225,
        status: 'pending',
      };
      setMessages((prev) => [...prev, aiMsg]);
      setBargainPrice(225);
    } finally {
      setNegotiating(false);
    }
  };

  const offerAccepted = messages.some(m => m.senderRole === 'ai_vendor' && m.status === 'accepted');

  return (
    <div className="font-sans bg-[#f8fafc]/40 py-8 min-h-screen relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button
          id="btn-back-to-marketplace"
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-orange-600 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </button>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Media Gallery Gallery Grid */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-8 flex items-center justify-center min-h-[460px] relative shadow-xs">
              <img
                src={activeImage}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="max-h-[380px] object-contain"
              />
              <span className="absolute top-4 left-4 bg-orange-100 text-orange-600 font-black text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs font-sans">
                ⭐ {product.rating} Rating
              </span>
            </div>

            {/* Thumbnail selector */}
            <div className="flex gap-4">
              {product.images.map((img, index) => (
                <button
                  id={`btn-thumb-select-${index}`}
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`w-24 h-24 rounded-2xl bg-white border p-3 flex items-center justify-center overflow-hidden transition-all cursor-pointer ${
                    activeImage === img ? 'border-orange-500 ring-2 ring-orange-100' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <img src={img} alt="Thumbnail view" referrerPolicy="no-referrer" className="object-contain max-h-full max-w-full" />
                </button>
              ))}
            </div>

            {/* Compare Vendors sidebar list from Screen 5 */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider font-sans">
                <ArrowRightLeft className="w-4 h-4 text-orange-500" />
                Compare Prices Across Platform
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border border-slate-50 rounded-xl p-4 bg-slate-50/50 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800">AudioGalaxy Seller</p>
                    <p className="text-slate-400 font-mono">Rating: ⭐ 4.8</p>
                  </div>
                  <span className="font-extrabold text-slate-900">{formatValue(252.00)}</span>
                </div>
                <div className="border border-slate-50 rounded-xl p-4 bg-slate-50/50 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800">TechBargains Hub</p>
                    <p className="text-slate-400 font-mono">Rating: ⭐ 4.5</p>
                  </div>
                  <span className="font-extrabold text-slate-900">{formatValue(248.50)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Layout Grid: Product Info + Tab Pane */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-8 space-y-6 shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-sm uppercase flex items-center gap-0.5">
                    🛡️ Verified Vendor
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{product.vendorName}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight font-sans">
                  {product.title}
                </h1>

                {/* Stars reviews count */}
                <div className="flex items-center gap-2 text-sm mt-1">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 font-mono">(128 Customer Reviews)</span>
                </div>
              </div>

              {/* Price Container */}
              <div className="bg-orange-50/40 border border-orange-100/60 rounded-2xl p-6 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 block pb-1">Special Escrow Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-orange-600">
                      {formatValue(product.price)}
                    </span>
                    <span className="text-sm text-slate-300 line-through">
                      {formatValue(product.price * 1.2)}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase block pt-1.5">
                    🟢 In Stock &bull; Fast Delivery
                  </span>
                </div>
                {bargainPrice && (
                  <div className="bg-orange-500 text-white rounded-xl py-2.5 px-4 text-center">
                    <span className="text-[9px] uppercase tracking-wider block font-bold">Your Negotiated Offer</span>
                    <span className="text-lg font-black font-mono">{formatValue(bargainPrice)}</span>
                  </div>
                )}
              </div>

              {/* Description Tab selectors */}
              <div className="border-b border-slate-100 flex gap-4 text-xs font-semibold uppercase tracking-wider">
                <button
                  id="tab-select-description"
                  onClick={() => setActiveTab('description')}
                  className={`pb-3 ${
                    activeTab === 'description'
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Description
                </button>
                <button
                  id="tab-select-specifications"
                  onClick={() => setActiveTab('specifications')}
                  className={`pb-3 ${
                    activeTab === 'specifications'
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Specifications
                </button>
              </div>

              {/* Tab Item Render */}
              <div className="text-xs font-sans text-slate-500 leading-relaxed min-h-[140px]">
                {activeTab === 'description' ? (
                  <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
                ) : (
                  <div className="space-y-2 font-sans text-[11px]">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="font-bold text-slate-700">Driver Unit</span>
                      <span>40mm Dynamic dome drivers</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="font-bold text-slate-700">ANC Suppression</span>
                      <span>Up to -45dB Active suppression</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="font-bold text-slate-700">Battery Capacity</span>
                      <span>960mAh (Up to 40 Hours playtime)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="font-bold text-slate-700">Bluetooth protocol</span>
                      <span>v5.3 Low-Latency synchronization</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout actions */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <button
                  id="btn-details-add-cart"
                  onClick={() => onAddToCart(product, 1, bargainPrice || undefined)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
                <button
                  id="btn-details-buy-now"
                  onClick={() => {
                    onAddToCart(product, 1, bargainPrice || undefined);
                    // Dynamically trigger checkout route transition
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-xl text-xs transition-colors cursor-pointer shadow-md shadow-orange-500/10 active:scale-[0.98]"
                >
                  Buy Now &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating TENBUK AI Bargaining Widget Panel (Bottom Right) */}
      <div 
        id="bargain-bot-modal"
        className={`fixed bottom-6 right-6 z-40 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 w-96 flex flex-col max-h-[500px] border-t-4 border-t-slate-900 ${
          chatOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-75 translate-y-24 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header bar matching Screen 5 overlay */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between font-sans">
          <div className="flex items-center gap-2">
            <span className="bg-orange-500 p-1 rounded-md text-white animate-pulse">🤖</span>
            <div>
              <p className="text-xs font-black tracking-tight flex items-center gap-1">
                TENBUK AI Bargain
              </p>
              <p className="text-[10px] text-slate-400 font-mono">Representing {product.vendorName}</p>
            </div>
          </div>
          <button
            id="btn-close-bargain-modal"
            onClick={() => setChatOpen(false)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation list area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 min-h-[240px] max-h-[300px]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col max-w-[85%] ${
                m.senderRole === 'buyer' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed font-sans ${
                  m.senderRole === 'buyer'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-xs'
                }`}
              >
                {m.body}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 font-mono">
                {m.senderRole === 'buyer' ? 'You' : 'AI Negotiator Agent'}
              </span>

              {/* Actionable Counter Proposal Acceptance Form inside chat bubble */}
              {m.senderRole === 'ai_vendor' && m.proposedPrice && m.status === 'pending' && (
                <div className="mt-2 bg-amber-50 border border-amber-100 rounded-xl p-3 flex flex-col items-center gap-2 text-center text-slate-800 w-full shadow-xs">
                  <p className="text-[10px] font-sans font-medium">Accept AI offer at <span className="font-extrabold">{formatValue(m.proposedPrice)}</span>?</p>
                  <div className="flex gap-2 w-full justify-center">
                    <button
                      onClick={async () => {
                        setBargainPrice(m.proposedPrice!);
                        await dbService.updateChatMessageStatus(m.id, 'accepted');
                        // Add accepted message
                        const confirmMsg: ChatMessage = {
                          id: `msg-acc-${Date.now()}`,
                          productId: product.id,
                          senderId: 'buyer-jane',
                          senderRole: 'buyer',
                          body: `I gladly accept your offer of ${formatValue(m.proposedPrice!)}!`,
                          createdAt: new Date().toISOString()
                        };
                        setMessages(prev => [...prev, confirmMsg]);
                        await dbService.addChatMessage(confirmMsg);

                        const systemConfirm: ChatMessage = {
                          id: `msg-sys-${Date.now()}`,
                          productId: product.id,
                          senderId: 'ai-vendor-bot',
                          senderRole: 'ai_vendor',
                          body: `Brilliant! Your offer price of ${formatValue(m.proposedPrice!)} is officially locked and applied as your checkout rate. Add item to cart to complete purchase at this price!`,
                          createdAt: new Date().toISOString(),
                          status: 'accepted'
                        };
                        setMessages(prev => [...prev, systemConfirm]);
                        await dbService.addChatMessage(systemConfirm);
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-0.5"
                    >
                      <Check className="w-3 h-3" /> Yes, Accept
                    </button>
                    <button
                      onClick={async () => {
                        await dbService.updateChatMessageStatus(m.id, 'declined');
                        const rejectMsg: ChatMessage = {
                          id: `msg-rej-${Date.now()}`,
                          productId: product.id,
                          senderId: 'buyer-jane',
                          senderRole: 'buyer',
                          body: `No thanks, I'd like to offer something else.`,
                          createdAt: new Date().toISOString()
                        };
                        setMessages(prev => [...prev, rejectMsg]);
                        await dbService.addChatMessage(rejectMsg);
                      }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {negotiating && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-white border border-slate-100 p-2 rounded-xl w-32 font-sans animate-pulse">
              <span>🤖 Agent thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips layout */}
        <div className="px-4 py-2 border-t border-slate-50 flex gap-2 overflow-x-auto bg-white">
          <button
            onClick={() => handleSendMessage("Would you accept $220 if I buy it right now?")}
            className="border border-slate-100 bg-slate-55/65 hover:bg-slate-100 text-[10px] px-2.5 py-1.5 rounded-full whitespace-nowrap cursor-pointer text-slate-600 font-sans font-medium"
          >
            Offer $220
          </button>
          <button
            onClick={() => handleSendMessage("Can we settle on $230?")}
            className="border border-slate-100 bg-slate-55/65 hover:bg-slate-100 text-[10px] px-2.5 py-1.5 rounded-full whitespace-nowrap cursor-pointer text-slate-600 font-sans font-medium"
          >
            Offer $230
          </button>
          <button
            onClick={() => handleSendMessage("Is there any further discount for student buyers?")}
            className="border border-slate-100 bg-slate-55/65 hover:bg-slate-100 text-[10px] px-2.5 py-1.5 rounded-full whitespace-nowrap cursor-pointer text-slate-600 font-sans font-medium"
          >
            Student Discount
          </button>
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="border-t border-slate-100 p-3 flex gap-2 bg-white"
        >
          <input
            id="bargain-chat-input"
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your price offer (e.g. $225)..."
            className="flex-1 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-orange-500 font-sans"
          />
          <button
            id="btn-bargain-send-chat"
            type="submit"
            className="bg-slate-900 hover:bg-orange-500 text-white rounded-xl p-2 cursor-pointer transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Circle slide button to re-open chat if closed */}
      {!chatOpen && (
        <button
          id="btn-open-bargain-chat"
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center gap-1 font-bold text-xs cursor-pointer hover:scale-105 transition-all"
        >
          <Sparkles className="w-5 h-5" />
          Negotiate Price
        </button>
      )}
    </div>
  );
}
