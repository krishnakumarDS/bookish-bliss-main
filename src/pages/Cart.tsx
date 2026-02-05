import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight, Lock, BookOpen, Sparkles, ChevronRight, X, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/context/CurrencyContext";

const Cart = () => {
  const { cartItems, cartTotal, isLoading, updateQuantity, removeFromCart, refetch } = useCart();
  const { currentCurrency, formatPrice } = useCurrency();
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FEF7EB]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="w-12 h-12 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin" />
            <p className="font-serif italic text-brand-grey">Synchronizing your selection...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const RenderEmpty = ({ title, desc, icon: Icon, badge }: any) => (
    <div className="min-h-screen flex flex-col bg-[#FEF7EB]">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb Section */}
        <section className="pt-40 pb-20 border-b border-brand-primary/10">
          <div className="container mx-auto px-6 text-center max-w-[1240px]">
            <h1 className="text-6xl md:text-8xl font-serif font-black text-brand-black mb-8 tracking-tighter">
              Cart
            </h1>
            <div className="flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-brand-grey">
              <Link to="/" className="hover:text-brand-secondary transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4 text-brand-primary/40" />
              <span className="text-brand-black italic">Cart</span>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-24 text-center max-w-[1240px]">
          <div className="max-w-md mx-auto space-y-8">
            <div className="w-24 h-24 bg-brand-primary/5 rounded-full flex items-center justify-center mx-auto">
              <Icon className="w-10 h-10 text-brand-primary/40" />
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary">{badge}</p>
              <h2 className="text-3xl font-serif font-bold text-brand-black italic">{title}</h2>
              <p className="text-brand-grey leading-loose">{desc}</p>
            </div>
            <Link to="/books" className="block">
              <Button className="h-14 px-10 rounded-full bg-brand-black text-white hover:bg-brand-secondary font-black uppercase tracking-widest text-[10px] transition-all">
                Explore Collection
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );

  if (!user) {
    return <RenderEmpty
      title="Authentication Required"
      desc="Please sign in to view and manage your selected volumes."
      icon={Lock}
      badge="Security Protocol"
    />;
  }

  if (cartItems.length === 0) {
    return <RenderEmpty
      title="Your cart is empty."
      desc="Explore our curated collection to find your next favorite masterpiece."
      icon={ShoppingBag}
      badge="Blank Canvas"
    />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-light/20 font-sans selection:bg-brand-secondary selection:text-white">
      <Header />

      <main className="flex-1">
        {/* --- EDITORIAL HERO SECTION --- */}
        <section className="relative pt-40 pb-24 lg:pt-56 lg:pb-32 bg-[#FEF7EB] border-b border-brand-primary/10 overflow-hidden">
          {/* Subtle Text Texture Background */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] opacity-5" />

          <div className="container mx-auto px-6 relative z-10 text-center space-y-8 animate-slide-up max-w-[1240px]">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-brand-primary/20 shadow-sm text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary mb-2 mx-auto">
              <Sparkles className="w-3.5 h-3.5" />
              Your Selection Archive
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif font-black text-brand-black tracking-tighter leading-[0.9]">
              Shopping <span className="italic text-brand-secondary">Cart</span>
            </h1>

            {/* Astra Style Breadcrumb */}
            <div className="flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-brand-grey pt-6">
              <Link to="/" className="hover:text-brand-secondary transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4 text-brand-primary/40" />
              <span className="text-brand-black italic">Cart</span>
            </div>
          </div>
        </section>

        {/* --- MAIN CONTENT --- */}
        <section className="container mx-auto px-6 py-20 lg:py-32 max-w-[1240px]">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">

            {/* --- CART TABLE --- */}
            <div className="flex-1 w-full space-y-12">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-brand-black/10">
                      <th className="pb-8 text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey w-12"></th>
                      <th className="pb-8 text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey">Product</th>
                      <th className="pb-8 text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey hidden md:table-cell">Price</th>
                      <th className="pb-8 text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey">Quantity</th>
                      <th className="pb-8 text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-primary/5">
                    {cartItems.map((item) => (
                      <tr key={item.id} className="group transition-colors">
                        <td className="py-10 align-middle">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-10 h-10 rounded-full flex items-center justify-center border border-brand-primary/10 text-brand-grey/40 hover:text-red-500 hover:border-red-500 hover:bg-red-50 transition-all"
                            aria-label="Remove item"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="py-10 align-middle">
                          <div className="flex items-center gap-8">
                            <Link to={`/book/${item.book_id}`} className="shrink-0 relative">
                              <div className="absolute inset-0 bg-brand-black/10 rounded translate-x-1 translate-y-1 -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform" />
                              <img
                                src={item.books?.cover_image || "/placeholder.svg"}
                                alt={item.books?.title}
                                className="w-20 h-28 object-cover rounded shadow-md border border-white"
                              />
                            </Link>
                            <div className="space-y-1.5 min-w-0">
                              <Link to={`/book/${item.book_id}`}>
                                <h3 className="font-serif font-black text-xl text-brand-black hover:text-brand-secondary transition-colors italic leading-tight truncate">
                                  {item.books?.title}
                                </h3>
                              </Link>
                              <p className="text-[10px] font-black uppercase tracking-widest text-brand-grey/50">
                                {item.books?.author}
                              </p>
                              {/* Price for Mobile Only */}
                              <p className="text-sm font-bold text-brand-black md:hidden mt-3">
                                {formatPrice(item.books?.price || 0)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-10 hidden md:table-cell align-middle">
                          <span className="text-sm font-bold text-brand-black font-sans">
                            {formatPrice(item.books?.price || 0)}
                          </span>
                        </td>

                        <td className="py-10 align-middle">
                          <div className="flex items-center bg-white rounded-full border border-brand-primary/10 p-1 w-fit shadow-sm">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-9 h-9 rounded-full flex items-center justify-center text-brand-grey hover:bg-brand-light transition-colors disabled:opacity-20"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-black min-w-[2.5rem] text-center font-sans">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-9 h-9 rounded-full flex items-center justify-center text-brand-grey hover:bg-brand-light transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        <td className="py-10 text-right align-middle">
                          <span className="text-base font-black text-brand-black font-sans">
                            {formatPrice((item.books?.price || 0) * item.quantity)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-12 pt-12 border-t border-brand-black/10">
                <div className="flex w-full md:w-auto gap-4">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    className="flex-1 md:w-56 h-16 px-8 bg-white border border-brand-primary/10 focus:border-brand-secondary focus:ring-0 placeholder:text-brand-grey/40 placeholder:text-[10px] placeholder:font-black placeholder:uppercase placeholder:tracking-widest text-sm transition-all"
                  />
                  <Button className="h-16 px-10 rounded-full border-2 border-brand-black bg-transparent text-brand-black hover:bg-brand-secondary hover:border-brand-secondary hover:text-white font-black uppercase tracking-widest text-[10px] transition-all">
                    Apply Coupon
                  </Button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-10">
                  <Link to="/books" className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black hover:text-brand-secondary transition-colors inline-flex items-center gap-3 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Library
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      refetch();
                      import("sonner").then(({ toast }) => toast.success("Inventory synchronized"));
                    }}
                    className="h-16 px-10 rounded-full text-brand-grey hover:text-brand-black hover:bg-brand-primary/5 font-black uppercase tracking-widest text-[10px] transition-all"
                  >
                    Update Cart
                  </Button>
                </div>
              </div>
            </div>

            {/* --- CART TOTALS SIDEBAR --- */}
            <aside className="w-full lg:w-[420px] shrink-0 sticky top-40">
              <div className="bg-white border-4 border-brand-black/5 p-10 lg:p-14 space-y-12 shadow-2xl shadow-brand-black/5">
                <h2 className="text-3xl font-serif font-black italic text-brand-black border-b border-brand-primary/10 pb-10">
                  Cart totals
                </h2>

                <div className="space-y-10">
                  <div className="flex justify-between items-center pb-8 border-b border-brand-primary/5">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey">Subtotal</span>
                    <span className="text-base font-bold text-brand-black font-sans">{formatPrice(cartTotal)}</span>
                  </div>

                  <div className="space-y-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey block">Shipping</span>
                    <div className="space-y-6 bg-brand-light/20 p-8 rounded-2xl border border-brand-primary/5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-brand-grey font-medium">Flat rate:</span>
                        <span className="font-bold text-brand-black font-sans">
                          {cartTotal >= 100 ? "Complimentary" : formatPrice(15)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[11px] leading-relaxed text-brand-grey font-medium italic">
                          Global shipping rates applied based on repository location.
                        </p>
                        <button className="text-[9px] font-black uppercase tracking-widest text-brand-secondary hover:text-brand-black transition-colors underline">
                          Calculate Shipping
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-10 border-t-2 border-brand-black/5">
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-brand-black">Total</span>
                    <span className="text-4xl font-serif font-black italic text-brand-secondary">
                      {formatPrice(cartTotal + (cartTotal >= 100 ? 0 : 15))}
                    </span>
                  </div>
                </div>

                <div className="space-y-6 pt-6">
                  <Link to="/checkout" className="block">
                    <Button className="w-full h-16 rounded-none bg-brand-black text-white hover:bg-brand-secondary font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-4 group">
                      Proceed to checkout
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <div className="flex items-center justify-center gap-3 text-brand-grey/40">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">Secure SSL Processing</span>
                  </div>
                </div>
              </div>
            </aside>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
