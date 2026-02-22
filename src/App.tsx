import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  Sparkles, 
  ArrowRight,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getScentRecommendation, ScentProfile } from './services/geminiService';
import { Product, CartItem } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // AI Recommendation State
  const [aiInput, setAiInput] = useState('');
  const [aiResult, setAiResult] = useState<ScentProfile | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [view, setView] = useState<'list' | 'detail' | 'checkout' | 'about' | 'returns' | 'contact' | 'journal'>('list');
  const [isOrderComplete, setIsOrderComplete] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.notes.some(n => n.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleAiRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    try {
      const result = await getScentRecommendation(aiInput);
      setAiResult(result);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-brand-cream/80 backdrop-blur-md border-b border-brand-ink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-8">
              <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-brand-ink/5 rounded-full transition-colors">
                <Menu size={24} />
              </button>
              <div className="hidden md:flex gap-6 text-xs uppercase tracking-widest font-medium">
                <button onClick={() => setView('list')} className="hover:text-brand-gold transition-colors">Collections</button>
                <button onClick={() => setView('about')} className="hover:text-brand-gold transition-colors">About</button>
                <button onClick={() => setView('journal')} className="hover:text-brand-gold transition-colors">Journal</button>
              </div>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 text-2xl font-serif tracking-tighter font-semibold cursor-pointer" onClick={() => setView('list')}>
              ESSENCE DE LUXE
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <input 
                  type="text" 
                  placeholder="Search scents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-brand-ink/5 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-brand-gold w-48 transition-all focus:w-64"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/40" size={16} />
              </div>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-brand-ink/5 rounded-full transition-colors"
              >
                <ShoppingBag size={24} />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-brand-gold text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Hero Section */}
              <section className="relative h-[80vh] overflow-hidden">
                <div className="absolute inset-0">
                  <img 
                    src="https://picsum.photos/seed/perfume-hero/1920/1080?blur=2" 
                    alt="Hero" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                </div>
                <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-center text-center text-white">
                  <motion.span 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs uppercase tracking-[0.4em] mb-6 font-medium"
                  >
                    The Art of Fragrance
                  </motion.span>
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-6xl md:text-8xl font-serif mb-8 leading-tight"
                  >
                    Ethereal <br /> <span className="italic">Elegance</span>
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <button className="bg-white text-brand-ink px-10 py-4 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-brand-gold hover:text-white transition-all duration-300 flex items-center gap-2 group">
                      Explore Collection
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                </div>
              </section>

              {/* AI Scent Finder */}
              <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                  <div className="inline-flex items-center gap-2 text-brand-gold mb-4">
                    <Sparkles size={20} />
                    <span className="text-xs uppercase tracking-widest font-bold">AI Fragrance Assistant</span>
                  </div>
                  <h2 className="text-4xl font-serif mb-6">Find Your Signature Scent</h2>
                  <p className="text-brand-ink/60 mb-10 font-light leading-relaxed">
                    Tell us about your personality, the occasions you love, or the memories you cherish. 
                    Our AI will craft a personalized scent profile just for you.
                  </p>
                  
                  <form onSubmit={handleAiRecommendation} className="relative max-w-2xl mx-auto">
                    <input 
                      type="text" 
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="e.g., 'I love rainy mornings in Paris and the smell of old books'"
                      className="w-full bg-brand-cream border-none rounded-2xl py-6 px-8 text-lg focus:ring-2 focus:ring-brand-gold/20 transition-all placeholder:text-brand-ink/30"
                    />
                    <button 
                      disabled={isAiLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-ink text-white p-3 rounded-xl hover:bg-brand-gold transition-colors disabled:opacity-50"
                    >
                      {isAiLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <ArrowRight size={24} />
                      )}
                    </button>
                  </form>

                  <AnimatePresence>
                    {aiResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mt-12 p-8 bg-brand-cream rounded-3xl text-left border border-brand-gold/10"
                      >
                        <h3 className="text-2xl font-serif mb-2 text-brand-gold">{aiResult.recommendation}</h3>
                        <p className="text-brand-ink/70 mb-6 italic leading-relaxed">"{aiResult.explanation}"</p>
                        <div className="flex flex-wrap gap-2">
                          {aiResult.suggestedNotes.map((note, i) => (
                            <span key={i} className="bg-white px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold border border-brand-ink/5">
                              {note}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* Product Grid */}
              <section className="py-24 max-w-7xl mx-auto px-4 w-full">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                  <div>
                    <h2 className="text-5xl font-serif mb-4">The Collection</h2>
                    <div className="flex flex-wrap gap-4">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={cn(
                            "text-[10px] uppercase tracking-[0.2em] font-bold px-6 py-2 rounded-full border transition-all",
                            activeCategory === cat 
                              ? "bg-brand-ink text-white border-brand-ink" 
                              : "bg-transparent text-brand-ink/40 border-brand-ink/10 hover:border-brand-ink/30"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="text-right text-brand-ink/40 text-xs uppercase tracking-widest font-medium">
                    Showing {filteredProducts.length} results
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                  {filteredProducts.map((product, idx) => (
                    <motion.div 
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="group cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-6 bg-white">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-brand-ink px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-brand-gold hover:text-white"
                        >
                          Add to Bag
                        </button>
                      </div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-serif">{product.name}</h3>
                          <p className="text-[10px] uppercase tracking-widest text-brand-ink/40 font-bold">{product.brand}</p>
                        </div>
                        <span className="text-lg font-light">${product.price.toFixed(2)}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {product.notes.slice(0, 3).map((note, i) => (
                          <span key={i} className="text-[9px] uppercase tracking-tighter text-brand-ink/30">
                            {note}{i < 2 ? ' •' : ''}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : view === 'about' ? (
            <motion.div
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-4 py-24 w-full"
            >
              <h2 className="text-6xl font-serif mb-12 text-center">Our Heritage</h2>
              <div className="aspect-video rounded-3xl overflow-hidden mb-16">
                <img src="https://picsum.photos/seed/heritage/1200/800" alt="Heritage" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-8 text-lg font-light leading-relaxed text-brand-ink/70">
                <p>
                  Founded in 1924 in the heart of Grasse, France, Essence de Luxe began as a small family atelier dedicated to the preservation of traditional perfumery. For a century, we have remained steadfast in our commitment to sourcing the world's most exquisite raw materials.
                </p>
                <p>
                  Our philosophy is simple: fragrance is the most intimate form of art. It is a silent language that speaks of memories, desires, and the ethereal beauty of the present moment. Each bottle is hand-poured and aged to perfection, ensuring a depth and complexity that is truly unparalleled.
                </p>
                <p>
                  Today, Essence de Luxe continues to push the boundaries of olfactory creation, blending time-honored techniques with modern innovation to create scents that are both timeless and contemporary.
                </p>
              </div>
            </motion.div>
          ) : view === 'returns' ? (
            <motion.div
              key="returns"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-4 py-24 w-full"
            >
              <h2 className="text-5xl font-serif mb-12">Shipping & Returns</h2>
              <div className="space-y-12">
                <section>
                  <h3 className="text-xl font-serif mb-4">Complimentary Shipping</h3>
                  <p className="text-brand-ink/60 font-light leading-relaxed">
                    We are pleased to offer complimentary standard shipping on all orders worldwide. Each order is carefully packaged in our signature luxury box and includes two complimentary samples of your choice.
                  </p>
                </section>
                <section>
                  <h3 className="text-xl font-serif mb-4">Delivery Times</h3>
                  <ul className="list-disc list-inside text-brand-ink/60 font-light space-y-2">
                    <li>Domestic (France): 2-3 business days</li>
                    <li>Europe: 3-5 business days</li>
                    <li>International: 5-10 business days</li>
                  </ul>
                </section>
                <section>
                  <h3 className="text-xl font-serif mb-4">Returns & Exchanges</h3>
                  <p className="text-brand-ink/60 font-light leading-relaxed">
                    If you are not entirely satisfied with your purchase, you may return the unopened product in its original packaging within 30 days for a full refund or exchange. Please note that for hygiene reasons, we cannot accept returns of opened fragrances.
                  </p>
                </section>
              </div>
            </motion.div>
          ) : view === 'contact' ? (
            <motion.div
              key="contact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-4 py-24 w-full"
            >
              <h2 className="text-5xl font-serif mb-12 text-center">Concierge Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-8">
                  <p className="text-brand-ink/60 font-light leading-relaxed">
                    Our fragrance experts are available to assist you with personalized recommendations, order inquiries, or any other requests you may have.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 mb-1">Email</h4>
                      <p className="text-lg">concierge@essencedeluxe.com</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 mb-1">Phone</h4>
                      <p className="text-lg">+1 (888) ESSENCE</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 mb-1">Hours</h4>
                      <p className="text-sm text-brand-ink/60">Monday – Friday: 9am – 6pm CET</p>
                    </div>
                  </div>
                </div>
                <form className="space-y-6">
                  <input type="text" placeholder="Name" className="w-full bg-white border border-brand-ink/10 rounded-xl py-4 px-6 outline-none focus:ring-1 focus:ring-brand-gold" />
                  <input type="email" placeholder="Email" className="w-full bg-white border border-brand-ink/10 rounded-xl py-4 px-6 outline-none focus:ring-1 focus:ring-brand-gold" />
                  <textarea placeholder="Message" rows={5} className="w-full bg-white border border-brand-ink/10 rounded-xl py-4 px-6 outline-none focus:ring-1 focus:ring-brand-gold resize-none" />
                  <button className="w-full bg-brand-ink text-white py-4 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-brand-gold transition-all">Send Message</button>
                </form>
              </div>
            </motion.div>
          ) : view === 'journal' ? (
            <motion.div
              key="journal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 py-24 w-full"
            >
              <h2 className="text-6xl font-serif mb-16 text-center italic">The Journal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {[
                  { title: "The Secret of Grasse", date: "Oct 12, 2023", img: "https://picsum.photos/seed/journal1/800/600" },
                  { title: "Notes of Autumn", date: "Sep 28, 2023", img: "https://picsum.photos/seed/journal2/800/600" },
                  { title: "The Art of Layering", date: "Aug 15, 2023", img: "https://picsum.photos/seed/journal3/800/600" },
                  { title: "Sustainable Sourcing", date: "Jul 04, 2023", img: "https://picsum.photos/seed/journal4/800/600" }
                ].map((post, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="aspect-video rounded-3xl overflow-hidden mb-6">
                      <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-brand-gold mb-2 block">{post.date}</span>
                    <h3 className="text-3xl font-serif group-hover:italic transition-all">{post.title}</h3>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : view === 'checkout' ? (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto px-4 py-24 w-full"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2">
                  <h2 className="text-4xl font-serif mb-12">Checkout</h2>
                  
                  {isOrderComplete ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white p-12 rounded-3xl text-center border border-brand-gold/10 shadow-xl"
                    >
                      <div className="w-20 h-20 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-8">
                        <Sparkles size={40} />
                      </div>
                      <h3 className="text-3xl font-serif mb-4 text-brand-gold">Order Confirmed</h3>
                      <p className="text-brand-ink/60 font-light mb-8 max-w-md mx-auto">
                        Thank you for choosing Essence de Luxe. Your fragrance journey has begun. 
                        We'll notify you when your package is on its way.
                      </p>
                      <button 
                        onClick={() => {
                          setCart([]);
                          setIsOrderComplete(false);
                          setView('list');
                        }}
                        className="bg-brand-ink text-white px-12 py-4 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-brand-gold transition-all"
                      >
                        Return to Collection
                      </button>
                    </motion.div>
                  ) : (
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const orderData = {
                          customer_name: formData.get('name'),
                          total: cartTotal,
                          items: cart.map(i => ({ id: i.id, name: i.name, quantity: i.quantity }))
                        };
                        
                        try {
                          const res = await fetch('/api/orders', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(orderData)
                          });
                          if (res.ok) setIsOrderComplete(true);
                        } catch (err) {
                          console.error("Order error:", err);
                        }
                      }}
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">Full Name</label>
                          <input required name="name" type="text" className="w-full bg-white border border-brand-ink/10 rounded-xl py-4 px-6 focus:ring-1 focus:ring-brand-gold outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">Email Address</label>
                          <input required name="email" type="email" className="w-full bg-white border border-brand-ink/10 rounded-xl py-4 px-6 focus:ring-1 focus:ring-brand-gold outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">Phone Number</label>
                          <input required name="phone" type="tel" placeholder="+1 (555) 000-0000" className="w-full bg-white border border-brand-ink/10 rounded-xl py-4 px-6 focus:ring-1 focus:ring-brand-gold outline-none" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">Shipping Address</label>
                        <textarea required name="address" rows={3} className="w-full bg-white border border-brand-ink/10 rounded-xl py-4 px-6 focus:ring-1 focus:ring-brand-gold outline-none resize-none" />
                      </div>

                      <div className="p-8 bg-white rounded-2xl border border-brand-ink/10">
                        <h4 className="text-xs uppercase tracking-widest font-bold mb-6">Payment Method</h4>
                        <div className="flex items-center gap-4 p-4 border border-brand-gold bg-brand-gold/5 rounded-xl">
                          <div className="w-6 h-6 rounded-full border-4 border-brand-gold" />
                          <div>
                            <p className="text-sm font-bold">Cash on Delivery</p>
                            <p className="text-xs text-brand-ink/40">Pay when your perfume arrives at your doorstep.</p>
                          </div>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-brand-ink text-white py-6 rounded-2xl text-xs uppercase tracking-[0.2em] font-bold hover:bg-brand-gold transition-all duration-300 shadow-xl shadow-brand-ink/10"
                      >
                        Complete Order • ${cartTotal.toFixed(2)}
                      </button>
                    </form>
                  )}
                </div>

                <div className="lg:col-span-1">
                  <div className="sticky top-32 bg-white p-8 rounded-3xl border border-brand-ink/5 shadow-sm">
                    <h3 className="text-xl font-serif mb-8">Order Summary</h3>
                    <div className="space-y-6 mb-8 max-h-96 overflow-y-auto pr-2">
                      {cart.map(item => (
                        <div key={item.id} className="flex gap-4">
                          <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-serif">{item.name}</h4>
                            <p className="text-[10px] text-brand-ink/40 uppercase tracking-widest font-bold">Qty: {item.quantity}</p>
                            <p className="text-sm font-medium mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4 pt-6 border-t border-brand-ink/5">
                      <div className="flex justify-between text-sm">
                        <span className="text-brand-ink/40">Shipping</span>
                        <span className="font-medium text-emerald-600 uppercase tracking-widest text-[10px] font-bold">Complimentary</span>
                      </div>
                      <div className="flex justify-between text-xl font-serif pt-4">
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            selectedProduct && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-7xl mx-auto px-4 py-24 w-full"
              >
                <button 
                  onClick={() => setView('list')}
                  className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-brand-ink/40 hover:text-brand-ink transition-colors mb-12 group"
                >
                  <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                  Back to Collection
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-white shadow-2xl">
                    <img 
                      src={selectedProduct.image_url} 
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="py-8">
                    <span className="text-xs uppercase tracking-[0.3em] text-brand-gold font-bold mb-4 block">
                      {selectedProduct.brand}
                    </span>
                    <h1 className="text-6xl font-serif mb-6">{selectedProduct.name}</h1>
                    <p className="text-3xl font-light mb-8">${selectedProduct.price.toFixed(2)}</p>
                    
                    <div className="h-px bg-brand-ink/10 w-full mb-8" />
                    
                    <div className="space-y-8 mb-12">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 mb-4">The Story</h4>
                        <p className="text-brand-ink/70 leading-relaxed font-light text-lg">
                          {selectedProduct.description}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 mb-4">Olfactory Notes</h4>
                        <div className="flex flex-wrap gap-3">
                          {selectedProduct.notes.map((note, i) => (
                            <span key={i} className="bg-white border border-brand-ink/5 px-6 py-2 rounded-full text-xs font-medium">
                              {note}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 mb-2">Category</h4>
                          <p className="text-sm font-medium">{selectedProduct.category}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 mb-2">Availability</h4>
                          <p className="text-sm font-medium">{selectedProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => addToCart(selectedProduct)}
                        className="flex-1 bg-brand-ink text-white py-6 rounded-2xl text-xs uppercase tracking-[0.2em] font-bold hover:bg-brand-gold transition-all duration-300 shadow-xl shadow-brand-ink/10"
                      >
                        Add to Bag
                      </button>
                      <button className="w-16 h-16 rounded-2xl border border-brand-ink/10 flex items-center justify-center hover:bg-brand-ink hover:text-white transition-all">
                        <ShoppingBag size={20} />
                      </button>
                    </div>

                    <p className="mt-8 text-[10px] text-brand-ink/30 uppercase tracking-widest font-bold text-center">
                      Secure checkout • Free worldwide shipping • 30-day returns
                    </p>
                  </div>
                </div>

                {/* Related Products */}
                <div className="mt-32">
                  <h3 className="text-3xl font-serif mb-12">You May Also Like</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products
                      .filter(p => p.id !== selectedProduct.id && p.category === selectedProduct.category)
                      .slice(0, 4)
                      .map(p => (
                        <div key={p.id} onClick={() => handleProductClick(p)} className="group cursor-pointer">
                          <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-white">
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                          </div>
                          <h4 className="font-serif text-lg">{p.name}</h4>
                          <p className="text-[10px] uppercase tracking-widest text-brand-ink/40 font-bold">${p.price.toFixed(2)}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-brand-ink text-white py-24 mt-auto">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-serif mb-6 tracking-tighter">ESSENCE DE LUXE</h2>
            <p className="text-white/50 max-w-sm font-light leading-relaxed mb-8">
              Crafting olfactory masterpieces since 1924. Each bottle is a journey through time and emotion, 
              distilled into the purest essence of luxury.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-brand-ink transition-colors cursor-pointer">
                <span className="text-xs font-bold">IG</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-brand-ink transition-colors cursor-pointer">
                <span className="text-xs font-bold">FB</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-brand-ink transition-colors cursor-pointer">
                <span className="text-xs font-bold">TW</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-white/40">Shop</h4>
            <ul className="space-y-4 text-sm font-light text-white/70">
              <li><button onClick={() => setView('list')} className="hover:text-white transition-colors">All Perfumes</button></li>
              <li><button onClick={() => setView('journal')} className="hover:text-white transition-colors">Journal</button></li>
              <li><button onClick={() => setView('about')} className="hover:text-white transition-colors">Our Story</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-white/40">Support</h4>
            <ul className="space-y-4 text-sm font-light text-white/70">
              <li><button onClick={() => setView('returns')} className="hover:text-white transition-colors">Shipping & Returns</button></li>
              <li><button onClick={() => setView('contact')} className="hover:text-white transition-colors">Contact Us</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-white/30 font-bold">
          <span>© 2024 Essence de Luxe. All Rights Reserved.</span>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-brand-cream z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-8 flex justify-between items-center border-b border-brand-ink/5">
                <h2 className="text-2xl font-serif">Your Bag</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-brand-ink/5 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <ShoppingBag size={48} className="text-brand-ink/10 mb-4" />
                    <p className="text-brand-ink/40 font-light italic">Your bag is currently empty.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-6">
                        <div className="w-24 h-32 rounded-xl overflow-hidden bg-white flex-shrink-0">
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg font-serif">{item.name}</h3>
                              <button onClick={() => removeFromCart(item.id)} className="text-brand-ink/20 hover:text-red-500 transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-brand-ink/40 font-bold">{item.brand}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-full border border-brand-ink/5">
                              <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-brand-gold"><Minus size={12} /></button>
                              <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-brand-gold"><Plus size={12} /></button>
                            </div>
                            <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-8 bg-white border-t border-brand-ink/5">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs uppercase tracking-widest font-bold text-brand-ink/40">Subtotal</span>
                    <span className="text-2xl font-serif">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      setView('checkout');
                    }}
                    className="w-full bg-brand-ink text-white py-5 rounded-2xl text-xs uppercase tracking-[0.2em] font-bold hover:bg-brand-gold transition-all duration-300 shadow-lg shadow-brand-ink/10"
                  >
                    Proceed to Checkout
                  </button>
                  <p className="text-center text-[10px] text-brand-ink/30 mt-4 uppercase tracking-widest font-bold">
                    Complimentary shipping on all orders.
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-brand-ink/90 backdrop-blur-md z-[80]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-full max-w-sm bg-brand-ink text-white z-[90] p-12 flex flex-col"
            >
              <button onClick={() => setIsMenuOpen(false)} className="self-end p-2 hover:bg-white/10 rounded-full transition-colors mb-12">
                <X size={32} />
              </button>
              <div className="space-y-8">
                <button onClick={() => { setView('list'); setIsMenuOpen(false); }} className="block text-5xl font-serif hover:italic transition-all text-left w-full">Collections</button>
                <button onClick={() => { setView('about'); setIsMenuOpen(false); }} className="block text-5xl font-serif hover:italic transition-all text-left w-full">About</button>
                <button onClick={() => { setView('journal'); setIsMenuOpen(false); }} className="block text-5xl font-serif hover:italic transition-all text-left w-full">Journal</button>
                <button onClick={() => { setView('contact'); setIsMenuOpen(false); }} className="block text-5xl font-serif hover:italic transition-all text-left w-full">Contact</button>
              </div>
              <div className="mt-auto space-y-4 pt-12 border-t border-white/10">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Contact</p>
                <p className="text-lg font-light">concierge@essencedeluxe.com</p>
                <p className="text-lg font-light">+1 (888) ESSENCE</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
