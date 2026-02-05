import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, Truck, ShieldCheck, CreditCard, Banknote, Lock, Sparkles, Receipt, ArrowRight, ChevronRight } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { currentCurrency, formatPrice } = useCurrency();
  const [user, setUser] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setFormData(prev => ({ ...prev, email: session.user.email || "" }));
    });
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateTotal = () => {
    return cartTotal + (cartTotal >= 100 ? 0 : 15.00);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setIsProcessing(true);

    try {
      const finalTotal = calculateTotal();
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: finalTotal,
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_postal_code: formData.postalCode,
          shipping_country: formData.country,
          status: "pending",
          tracking_number: `TRK${Date.now()}`,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        book_id: item.book_id,
        quantity: item.quantity,
        price_at_purchase: item.books?.price || 0,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      await clearCart();
      setOrderId(order.id);
      setOrderComplete(true);
      toast.success("Order Placed Successfully");
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderComplete && orderId) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FEF7EB]">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white rounded-3xl p-12 text-center space-y-8 shadow-xl border border-brand-primary/5">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-serif font-black text-brand-black italic">Thank you.</h1>
              <p className="text-brand-grey font-medium">Your order has been received.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-left border-y border-brand-primary/10 py-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-grey">Order Number:</p>
                <p className="font-bold text-brand-black">{orderId.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-grey">Total:</p>
                <p className="font-bold text-brand-black">{formatPrice(calculateTotal())}</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Link to="/orders">
                <Button className="w-full h-14 bg-brand-black text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-brand-secondary">
                  Track My Order
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" className="w-full h-12 text-brand-grey font-bold uppercase tracking-widest text-[10px]">
                  Return Home
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FEF7EB] font-sans selection:bg-brand-secondary selection:text-white">
      <Header />

      <main className="flex-1">
        {/* --- EDITORIAL HERO SECTION --- */}
        <section className="relative pt-40 pb-24 lg:pt-56 lg:pb-32 bg-[#FEF7EB] border-b border-brand-primary/10 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] opacity-5" />

          <div className="container mx-auto px-6 relative z-10 text-center space-y-8 animate-slide-up max-w-[1240px]">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-brand-primary/20 shadow-sm text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary mb-2 mx-auto">
              <Sparkles className="w-3.5 h-3.5" />
              Finalize Order
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif font-black text-brand-black tracking-tighter leading-[0.9]">
              Check<span className="italic text-brand-secondary">out</span>
            </h1>

            {/* Astra Style Breadcrumb */}
            <div className="flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-brand-grey pt-6">
              <Link to="/" className="hover:text-brand-secondary transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4 text-brand-primary/40" />
              <Link to="/cart" className="hover:text-brand-secondary transition-colors">Cart</Link>
              <ChevronRight className="w-4 h-4 text-brand-primary/40" />
              <span className="text-brand-black italic">Checkout</span>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20 lg:py-32 max-w-[1240px]">
          {/* Coupon Notice */}
          <div className="mb-20 p-8 bg-white border-l-4 border-brand-secondary shadow-sm flex items-center justify-between gap-6 group">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-brand-secondary/10 flex items-center justify-center text-brand-secondary shadow-inner">
                <Receipt className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-brand-grey tracking-wide">
                Possess a promotional voucher? <button type="button" className="text-brand-black underline hover:text-brand-secondary transition-colors decoration-brand-secondary/30">Click here to enter your code</button>
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-brand-grey/20 group-hover:translate-x-1 group-hover:text-brand-secondary transition-all" />
          </div>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-start">

            {/* --- BILLING DETAILS --- */}
            <div className="lg:col-span-7 space-y-16">
              <div className="space-y-2">
                <h2 className="text-4xl font-serif font-black italic text-brand-black tracking-tight">Billing Details</h2>
                <div className="w-20 h-1 bg-brand-secondary rounded-full" />
              </div>

              <div className="grid md:grid-cols-2 gap-x-10 gap-y-12">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey">First Name *</Label>
                  <Input name="firstName" value={formData.firstName} onChange={handleInputChange} required className="h-14 rounded-none border-0 border-b-2 border-brand-black/5 focus:border-brand-secondary focus:ring-0 bg-transparent text-brand-black font-bold text-lg px-0 transition-all placeholder:text-brand-grey/20" />
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey">Last Name *</Label>
                  <Input name="lastName" value={formData.lastName} onChange={handleInputChange} required className="h-14 rounded-none border-0 border-b-2 border-brand-black/5 focus:border-brand-secondary focus:ring-0 bg-transparent text-brand-black font-bold text-lg px-0 transition-all placeholder:text-brand-grey/20" />
                </div>

                <div className="space-y-4 md:col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey">Email Address *</Label>
                  <Input name="email" type="email" value={formData.email} onChange={handleInputChange} required className="h-14 rounded-none border-0 border-b-2 border-brand-black/5 focus:border-brand-secondary focus:ring-0 bg-transparent text-brand-black font-bold text-lg px-0 transition-all placeholder:text-brand-grey/20" />
                </div>

                <div className="space-y-4 md:col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey">Street Address *</Label>
                  <Input name="address" value={formData.address} onChange={handleInputChange} required placeholder="House number and street name" className="h-14 rounded-none border-0 border-b-2 border-brand-black/5 focus:border-brand-secondary focus:ring-0 bg-transparent text-brand-black font-bold text-lg px-0 transition-all placeholder:text-brand-grey/20 placeholder:font-normal placeholder:italic" />
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey">Town / City *</Label>
                  <Input name="city" value={formData.city} onChange={handleInputChange} required className="h-14 rounded-none border-0 border-b-2 border-brand-black/5 focus:border-brand-secondary focus:ring-0 bg-transparent text-brand-black font-bold text-lg px-0 transition-all" />
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey">ZIP Code *</Label>
                  <Input name="postalCode" value={formData.postalCode} onChange={handleInputChange} required className="h-14 rounded-none border-0 border-b-2 border-brand-black/5 focus:border-brand-secondary focus:ring-0 bg-transparent text-brand-black font-bold text-lg px-0 transition-all" />
                </div>

                <div className="space-y-4 md:col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey">Phone *</Label>
                  <Input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required className="h-14 rounded-none border-0 border-b-2 border-brand-black/5 focus:border-brand-secondary focus:ring-0 bg-transparent text-brand-black font-bold text-lg px-0 transition-all" />
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="pt-12 space-y-10">
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-black italic text-brand-black tracking-tight">Payment Method</h3>
                  <div className="w-12 h-1 bg-brand-secondary/30 rounded-full" />
                </div>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-6">
                  <div className={`p-8 rounded-3xl border-2 transition-all cursor-pointer ${paymentMethod === 'card' ? 'bg-white border-brand-secondary shadow-xl shadow-brand-secondary/5' : 'bg-transparent border-brand-black/5'}`} onClick={() => setPaymentMethod('card')}>
                    <div className="flex items-start gap-6">
                      <RadioGroupItem value="card" id="card" className="mt-1" />
                      <div className="space-y-2">
                        <Label htmlFor="card" className="flex items-center gap-3 font-black text-brand-black cursor-pointer uppercase tracking-widest text-[11px]">
                          Credit / Debit Card
                        </Label>
                        <p className="text-xs text-brand-grey/60 font-medium leading-relaxed italic">
                          Safe and secure processing via global gateways. All major cards accepted.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`p-8 rounded-3xl border-2 transition-all cursor-pointer ${paymentMethod === 'cod' ? 'bg-white border-brand-secondary shadow-xl shadow-brand-secondary/5' : 'bg-transparent border-brand-black/5'}`} onClick={() => setPaymentMethod('cod')}>
                    <div className="flex items-start gap-6">
                      <RadioGroupItem value="cod" id="cod" className="mt-1" />
                      <div className="space-y-2">
                        <Label htmlFor="cod" className="flex items-center gap-3 font-black text-brand-black cursor-pointer uppercase tracking-widest text-[11px]">
                          Cash on Delivery
                        </Label>
                        <p className="text-xs text-brand-grey/60 font-medium leading-relaxed italic">
                          Pay with exact currency totals upon successful repository courier arrival.
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* --- ORDER SUMMARY SIDEBAR --- */}
            <aside className="lg:col-span-5 sticky top-40">
              <div className="bg-white p-10 lg:p-14 shadow-2xl shadow-brand-black/5 border-4 border-brand-black/5 space-y-10">
                <h2 className="text-3xl font-serif font-black italic text-brand-black border-b border-brand-primary/10 pb-8">
                  Your order
                </h2>

                <div className="space-y-8">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey border-b border-brand-primary/10 pb-6">
                    <span>Product Archive</span>
                    <span>Subtotal</span>
                  </div>

                  <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-brand-primary/10">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-start gap-6 group">
                        <div className="flex gap-4">
                          <img src={item.books?.cover_image} className="w-12 h-16 object-cover rounded shadow-sm border border-brand-black/5" alt="" />
                          <div className="space-y-1">
                            <p className="text-sm font-black text-brand-black leading-tight italic line-clamp-2">
                              {item.books?.title}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-secondary">
                              × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-brand-black shrink-0 font-sans text-sm">
                          {formatPrice((item.books?.price || 0) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6 pt-8 border-t border-brand-primary/10">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey">Subtotal</span>
                      <span className="text-sm font-bold text-brand-black font-sans">{formatPrice(cartTotal)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey">Shipping</span>
                      <span className="text-sm font-bold text-brand-black font-sans">
                        {cartTotal >= 100 ? "Complimentary" : formatPrice(15)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-10 border-t-2 border-brand-black">
                      <span className="text-[11px] font-black uppercase tracking-[0.4em] text-brand-black">Total</span>
                      <span className="text-4xl font-serif font-black italic text-brand-secondary">
                        {formatPrice(calculateTotal())}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 pt-6">
                  <p className="text-[11px] leading-relaxed text-brand-grey font-medium italic">
                    Your personal information will be utilized to facilitate order processing and support your curated experience throughout this boutique repository.
                  </p>
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full h-16 rounded-none bg-brand-black text-white hover:bg-brand-secondary font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-xl hover:shadow-brand-secondary/20 flex items-center justify-center gap-4 group"
                  >
                    {isProcessing ? "Authenticating Transaction..." : "Place order"}
                    {!isProcessing && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-3 pt-4 text-brand-grey/40">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Encrypted Transmission Protocol</span>
                </div>
              </div>
            </aside>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
