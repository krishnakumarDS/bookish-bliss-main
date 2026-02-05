import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Package, ArrowLeft, Search, RefreshCw, Trash2, Clock, Truck, CheckCircle, Sparkles, Box } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import TrackingTimeline from "@/components/orders/TrackingTimeline";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  tracking_number: string | null;
  created_at: string;
  shipping_city: string | null;
}

interface OrderItem {
  id: string;
  quantity: number;
  price_at_purchase: number;
  books: {
    id: string;
    title: string;
    author: string;
    cover_image: string | null;
  };
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setOrders(data || []);
        if (data) {
          data.forEach(order => fetchOrderItems(order.id));
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [navigate]);

  useEffect(() => {
    const channel = supabase
      .channel('orders-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast.info("New Acquisition Registered");
            setOrders(prev => [payload.new as Order, ...prev]);
            fetchOrderItems((payload.new as Order).id);
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            toast.info("Registry Updated: Synchronizing...");
            setOrders(prevOrders => prevOrders.map(order =>
              order.id === payload.new.id ? { ...order, ...payload.new } : order
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select(`
          id,
          quantity,
          price_at_purchase,
          books (
            id,
            title,
            author,
            cover_image
          )
        `)
        .eq("order_id", orderId);
      if (error) throw error;
      setOrderItems(prev => ({ ...prev, [orderId]: data as OrderItem[] }));
    } catch (error) {
      console.error("Error fetching order items:", error);
    }
  };

  const handleBuyAgain = async (bookId: string) => {
    try {
      await addToCart(bookId, 1);
      toast.success("Volume staged in manifest", { action: { label: "View Manifest", onClick: () => navigate("/cart") } });
    } catch (error) {
      toast.error("Failed to add component");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to void this acquisition?")) return;
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: 'cancelled' })
        .eq('id', orderId);
      if (error) throw error;
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
      toast.success("Acquisition voided.");
    } catch (error) {
      toast.error("Failed to update registry");
    }
  };

  const handleReturnOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'returned' })
        .eq('id', orderId);
      if (error) throw error;
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'returned' } : o));
      toast.success("Return sequence initiated.");
    } catch (error) {
      toast.error("Protocol failure: Archive return offline.");
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab =
      activeTab === "cancelled" ? (order.status === "cancelled" || order.status === "returned") :
        activeTab === "open" ? !["delivered", "cancelled", "returned"].includes(order.status) :
          true;
    let matchesSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const orderIdMatch = order.id.toLowerCase().includes(query);
      const items = orderItems[order.id] || [];
      const productMatch = items.some(item =>
        item.books.title.toLowerCase().includes(query) ||
        item.books.author.toLowerCase().includes(query)
      );
      matchesSearch = orderIdMatch || productMatch;
    }
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-brand-light font-sans selection:bg-brand-black selection:text-white">
      <Header />

      <main className="flex-1 pb-32">
        {/* --- PAGE HEADER --- */}
        <div className="bg-[#FEF7EB] pt-40 pb-20 border-b border-brand-primary/10">
          <div className="container mx-auto px-6 max-w-[1240px]">
            <Link
              to="/account"
              className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey hover:text-brand-black transition-all mb-12 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-brand-primary/10 flex items-center justify-center shadow-sm group-hover:bg-brand-black group-hover:text-white group-hover:-translate-x-1 transition-all">
                <ArrowLeft className="w-4 h-4" />
              </div>
              Return to Dashboard
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-end gap-12">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-brand-secondary font-black text-[10px] uppercase tracking-[0.4em]">Historical Registry</div>
                <h1 className="text-5xl md:text-7xl font-serif font-black text-brand-black tracking-tighter italic">Acquisition <span className="text-brand-secondary">Archive</span></h1>
              </div>

              <div className="relative w-full md:w-96 group">
                <div className="absolute inset-0 bg-brand-primary/5 rounded-2xl blur-lg group-hover:bg-brand-primary/10 transition-all" />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-grey group-hover:text-brand-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search Reference Registry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-8 h-16 bg-white border border-brand-primary/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-bold text-brand-black placeholder:text-brand-grey/40 shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-16 lg:py-24 max-w-[1240px]">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-16">
            <TabsList className="bg-white p-2 rounded-3xl h-auto border border-brand-primary/10 inline-flex shadow-2xl">
              <TabsTrigger value="all" className="rounded-2xl px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] data-[state=active]:bg-brand-black data-[state=active]:text-white transition-all text-brand-grey">Full Archive</TabsTrigger>
              <TabsTrigger value="open" className="rounded-2xl px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] data-[state=active]:bg-brand-primary data-[state=active]:text-white transition-all text-brand-grey">In Transit</TabsTrigger>
              <TabsTrigger value="cancelled" className="rounded-2xl px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] data-[state=active]:bg-brand-secondary data-[state=active]:text-white transition-all text-brand-grey">Voided</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-12 outline-none animate-fade-in">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-8">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-brand-primary/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey animate-pulse">Consulting Registry...</span>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-40 bg-white rounded-[4rem] border border-brand-primary/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-brand-primary/5 rounded-br-[4rem]" />
                  <div className="relative group">
                    <div className="w-24 h-24 bg-brand-light rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner group-hover:rotate-12 transition-transform">
                      <Box className="w-10 h-10 text-brand-grey opacity-40" />
                    </div>
                  </div>
                  <h3 className="text-4xl font-serif font-black italic text-brand-black mb-4">Archive Clean</h3>
                  <p className="text-brand-grey mb-12 max-w-md mx-auto text-lg font-medium leading-relaxed">No historical acquisitions match your current selection in the registry.</p>
                  <Link to="/books">
                    <Button className="h-16 px-12 bg-brand-black text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-brand-secondary transition-all transform hover:-translate-y-1">Initialize Collection</Button>
                  </Link>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-[4rem] overflow-hidden border border-brand-primary/5 shadow-2xl group transition-all hover:shadow-[0_80px_150px_-30px_rgba(0,0,0,0.15)] hover:border-brand-primary/20 relative">
                    {/* Corner Ornament */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-700" />

                    {/* Order Header */}
                    <div className="bg-brand-light/50 px-10 lg:px-16 py-10 border-b border-brand-primary/10 flex flex-wrap items-center justify-between gap-10">
                      <div className="flex flex-wrap gap-12 lg:gap-24">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-brand-grey uppercase tracking-[0.3em]">Registry Date</p>
                          <p className="font-bold text-brand-black text-lg">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-brand-grey uppercase tracking-[0.3em]">Total Valuation</p>
                          <p className="font-black text-brand-black font-serif italic text-2xl">{formatPrice(order.total_amount)}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-brand-grey uppercase tracking-[0.3em]">Reference ID</p>
                          <p className="font-bold text-brand-black uppercase font-mono text-lg truncate max-w-[150px]">#{order.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                      </div>

                      <div className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border shadow-sm ${order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-100' :
                        order.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-brand-primary/10 text-brand-secondary border-brand-primary/20'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-green-500 animate-pulse' :
                          order.status === 'confirmed' ? 'bg-blue-500 animate-pulse' :
                            order.status === 'cancelled' ? 'bg-red-500' : 'bg-brand-secondary animate-pulse'
                          }`} />
                        {order.status}
                      </div>
                    </div>

                    {/* Order Body */}
                    <div className="p-10 lg:p-16">
                      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
                        <div className="flex-1 space-y-12">
                          {orderItems[order.id] ? (
                            orderItems[order.id].map((item) => (
                              <div key={item.id} className="flex gap-10 items-start group/item relative">
                                <Link to={`/book/${item.books.id}`} className="shrink-0 relative group/img">
                                  <div className="absolute -inset-4 bg-brand-primary/10 rounded-2xl blur-xl opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                  <img
                                    src={item.books.cover_image || "/placeholder.svg"}
                                    alt={item.books.title}
                                    className="relative w-24 h-36 object-cover rounded-2xl shadow-xl transform group-hover/item:-rotate-2 transition-all duration-500 border-4 border-white"
                                  />
                                </Link>
                                <div className="flex-1 min-w-0 pt-4 space-y-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                                      <span className="text-[9px] font-black uppercase tracking-widest text-brand-grey">Verified Edition</span>
                                    </div>
                                    <Link to={`/book/${item.books.id}`}>
                                      <h4 className="text-2xl font-serif font-black text-brand-black hover:text-brand-secondary transition-colors italic leading-tight">
                                        {item.books.title}
                                      </h4>
                                    </Link>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-grey">Authored by <span className="text-brand-black">{item.books.author}</span> — Allocation: {item.quantity}</p>
                                  </div>

                                  <div className="flex flex-wrap gap-4 pt-2">
                                    <Button
                                      onClick={() => handleBuyAgain(item.books.id)}
                                      className="h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest bg-brand-light text-brand-black hover:bg-brand-primary hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-3"
                                    >
                                      <RefreshCw className="w-4 h-4" /> Re-Acquire
                                    </Button>
                                    <Link to={`/book/${item.books.id}`}>
                                      <Button variant="ghost" className="h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-grey hover:text-brand-black hover:bg-brand-light transition-all">
                                        Registry Details
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center gap-4 py-8">
                              <div className="relative w-8 h-8">
                                <div className="absolute inset-0 border-2 border-brand-primary/10 rounded-full" />
                                <div className="absolute inset-0 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-grey">Consulting Archive...</span>
                            </div>
                          )}
                        </div>

                        <div className="w-full lg:w-80 space-y-6 shrink-0 lg:border-l lg:border-brand-primary/10 lg:pl-16 pt-4">
                          <Link to={`/order/${order.id}`} className="block">
                            <Button className="w-full h-16 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl hover:bg-brand-secondary transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 active:scale-95">
                              <Package className="w-5 h-5" /> View Details
                            </Button>
                          </Link>

                          {order.status !== 'cancelled' && order.status !== 'returned' && (
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button className="w-full h-18 bg-brand-black text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-brand-secondary transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 active:scale-95">
                                  <Truck className="w-5 h-5" /> Trace Logistics
                                </Button>
                              </SheetTrigger>
                              <SheetContent side="right" className="sm:max-w-md w-full border-l border-brand-primary/10 bg-brand-light overflow-y-auto">
                                <SheetHeader className="mb-16 text-left">
                                  <div className="mx-auto lg:mx-0 w-20 h-20 bg-brand-primary/10 rounded-[1.5rem] flex items-center justify-center text-brand-secondary mb-8 shadow-inner">
                                    <Truck className="w-10 h-10" />
                                  </div>
                                  <SheetTitle className="text-4xl font-serif font-black italic text-brand-black leading-tight">Tracking Ledger</SheetTitle>
                                  <SheetDescription className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-secondary">Reference: #{order.id.slice(0, 10).toUpperCase()}</SheetDescription>
                                </SheetHeader>
                                <div className="space-y-12">
                                  <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-brand-primary/5">
                                    <TrackingTimeline status={order.status} />
                                  </div>

                                  <div className="p-10 bg-brand-black rounded-[3rem] text-white space-y-8 relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-bl-[4rem]" />
                                    <div className="flex items-center gap-6">
                                      <div className="w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-xl flex items-center justify-center text-brand-primary">
                                        <Clock className="w-8 h-8" />
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-2">Estimated Arrival</p>
                                        <p className="font-serif italic font-black text-2xl">2-3 Solar Days</p>
                                      </div>
                                    </div>
                                    <p className="text-xs text-white/40 leading-relaxed font-medium">Your edition is traversing our premium courier lanes with the utmost priority.</p>
                                  </div>
                                </div>
                              </SheetContent>
                            </Sheet>
                          )}

                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <Button
                              onClick={() => handleCancelOrder(order.id)}
                              variant="ghost"
                              className="w-full h-16 text-brand-grey/50 hover:text-red-500 hover:bg-red-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all"
                            >
                              Void Acquisition
                            </Button>
                          )}

                          {order.status === 'delivered' && (
                            <Button
                              onClick={() => handleReturnOrder(order.id)}
                              variant="ghost"
                              className="w-full h-16 text-brand-grey/50 hover:text-brand-secondary hover:bg-brand-secondary/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all"
                            >
                              Return Sequence
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
