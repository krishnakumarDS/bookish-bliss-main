import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Package, Search, Truck, MapPin, Clock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import TrackingTimeline from "@/components/orders/TrackingTimeline";
import { Link } from "react-router-dom";

interface Order {
    id: string;
    status: string;
    total_amount: number;
    tracking_number: string | null;
    created_at: string;
    shipping_address: string | null;
    shipping_city: string | null;
    shipping_country: string | null;
    shipping_postal_code: string | null;
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

const OrderTracking = () => {
    const [searchParams] = useSearchParams();
    const [orderId, setOrderId] = useState(searchParams.get("orderId") || "");
    const [order, setOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const navigate = useNavigate();
    const { formatPrice } = useCurrency();

    const handleTrackOrder = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!orderId.trim()) {
            toast.error("Please enter an Order ID or Tracking Number");
            return;
        }

        setIsLoading(true);
        setHasSearched(true);

        try {
            // Try to find order by ID or tracking number
            const { data: orderData, error: orderError } = await supabase
                .from("orders")
                .select("*")
                .or(`id.eq.${orderId},tracking_number.eq.${orderId}`)
                .single();

            if (orderError || !orderData) {
                setOrder(null);
                setOrderItems([]);
                toast.error("Order not found. Please check your Order ID or Tracking Number.");
                return;
            }

            setOrder(orderData);

            // Fetch order items
            const { data: itemsData, error: itemsError } = await supabase
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
                .eq("order_id", orderData.id);

            if (itemsError) throw itemsError;
            setOrderItems(itemsData as OrderItem[] || []);
            toast.success("Order found successfully!");
        } catch (error) {
            console.error("Error tracking order:", error);
            toast.error("An error occurred while tracking your order");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            case 'shipped':
                return <Truck className="w-6 h-6 text-blue-500" />;
            case 'cancelled':
            case 'returned':
                return <AlertCircle className="w-6 h-6 text-red-500" />;
            default:
                return <Package className="w-6 h-6 text-brand-secondary" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'bg-green-50 text-green-700 border-green-100';
            case 'shipped':
                return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'cancelled':
            case 'returned':
                return 'bg-red-50 text-red-700 border-red-100';
            case 'confirmed':
                return 'bg-blue-50 text-blue-700 border-blue-100';
            default:
                return 'bg-brand-primary/10 text-brand-secondary border-brand-primary/20';
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-brand-light font-sans selection:bg-brand-black selection:text-white">
            <Header />

            <main className="flex-1 pb-32">
                {/* Page Header */}
                <div className="bg-[#FEF7EB] pt-40 pb-20 border-b border-brand-primary/10">
                    <div className="container mx-auto px-6 max-w-[1240px]">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey hover:text-brand-black transition-all mb-12 group"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-white border border-brand-primary/10 flex items-center justify-center shadow-sm group-hover:bg-brand-black group-hover:text-white group-hover:-translate-x-1 transition-all">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            Return to Home
                        </Link>

                        <div className="space-y-4 mb-12">
                            <div className="inline-flex items-center gap-2 text-brand-secondary font-black text-[10px] uppercase tracking-[0.4em]">
                                <Truck className="w-4 h-4" />
                                Live Tracking
                            </div>
                            <h1 className="text-5xl md:text-7xl font-serif font-black text-brand-black tracking-tighter italic">
                                Track Your <span className="text-brand-secondary">Order</span>
                            </h1>
                            <p className="text-brand-grey text-lg font-medium max-w-2xl leading-relaxed">
                                Enter your Order ID or Tracking Number to view real-time updates on your shipment.
                            </p>
                        </div>

                        {/* Search Form */}
                        <form onSubmit={handleTrackOrder} className="relative max-w-3xl group">
                            <div className="absolute inset-0 bg-brand-primary/5 rounded-2xl blur-lg group-hover:bg-brand-primary/10 transition-all" />
                            <div className="relative flex gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-grey group-hover:text-brand-primary transition-colors" />
                                    <Input
                                        type="text"
                                        placeholder="Enter Order ID or Tracking Number..."
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        className="w-full pl-14 pr-8 h-16 bg-white border border-brand-primary/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-bold text-brand-black placeholder:text-brand-grey/40 shadow-xl"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="h-16 px-12 bg-brand-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-brand-secondary transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            Tracking...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-4 h-4 mr-2" />
                                            Track Order
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Results Section */}
                <div className="container mx-auto px-6 py-16 lg:py-24 max-w-[1240px]">
                    {!hasSearched && !order && (
                        <div className="text-center py-20 bg-white rounded-[4rem] border border-brand-primary/10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-brand-primary/5 rounded-br-[4rem]" />
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-secondary/5 rounded-tl-[4rem]" />
                            <div className="relative">
                                <div className="w-24 h-24 bg-brand-light rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                                    <Package className="w-12 h-12 text-brand-secondary" />
                                </div>
                                <h3 className="text-4xl font-serif font-black italic text-brand-black mb-4">
                                    Ready to Track
                                </h3>
                                <p className="text-brand-grey mb-8 max-w-md mx-auto text-lg font-medium leading-relaxed">
                                    Enter your Order ID or Tracking Number above to get started.
                                </p>
                                <div className="flex flex-wrap gap-4 justify-center">
                                    <Link to="/orders">
                                        <Button variant="outline" className="h-14 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px]">
                                            View All Orders
                                        </Button>
                                    </Link>
                                    <Link to="/books">
                                        <Button className="h-14 px-10 bg-brand-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-brand-secondary transition-all">
                                            Browse Books
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {hasSearched && !order && !isLoading && (
                        <div className="text-center py-20 bg-white rounded-[4rem] border border-red-100 shadow-2xl">
                            <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10">
                                <AlertCircle className="w-12 h-12 text-red-500" />
                            </div>
                            <h3 className="text-4xl font-serif font-black italic text-brand-black mb-4">
                                Order Not Found
                            </h3>
                            <p className="text-brand-grey mb-8 max-w-md mx-auto text-lg font-medium leading-relaxed">
                                We couldn't find an order matching "{orderId}". Please check your Order ID or Tracking Number and try again.
                            </p>
                            <Button
                                onClick={() => {
                                    setOrderId("");
                                    setHasSearched(false);
                                }}
                                className="h-14 px-10 bg-brand-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-brand-secondary transition-all"
                            >
                                Try Again
                            </Button>
                        </div>
                    )}

                    {order && (
                        <div className="space-y-12 animate-fade-in">
                            {/* Order Summary Card */}
                            <div className="bg-white rounded-[4rem] overflow-hidden border border-brand-primary/5 shadow-2xl">
                                <div className="bg-gradient-to-br from-brand-black to-brand-secondary p-10 lg:p-16 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-bl-[8rem]" />
                                    <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                {getStatusIcon(order.status)}
                                                <div className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-2">
                                                    Order Reference
                                                </p>
                                                <h2 className="text-4xl font-serif font-black italic">
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </h2>
                                            </div>
                                        </div>
                                        <div className="text-left lg:text-right space-y-4">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-2">
                                                    Order Date
                                                </p>
                                                <p className="text-xl font-bold">
                                                    {new Date(order.created_at).toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary mb-2">
                                                    Total Amount
                                                </p>
                                                <p className="text-3xl font-serif font-black italic">
                                                    {formatPrice(order.total_amount)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tracking Timeline */}
                                <div className="p-10 lg:p-16">
                                    <div className="mb-12">
                                        <h3 className="text-3xl font-serif font-black italic text-brand-black mb-2">
                                            Shipment Progress
                                        </h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-secondary">
                                            Real-time tracking updates
                                        </p>
                                    </div>
                                    <TrackingTimeline status={order.status} className="mb-12" />

                                    {/* Delivery Information */}
                                    {order.status !== 'cancelled' && order.status !== 'returned' && (
                                        <div className="grid md:grid-cols-2 gap-8 mt-12">
                                            <div className="p-8 bg-brand-light rounded-[2.5rem] border border-brand-primary/10">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                        <MapPin className="w-6 h-6 text-brand-secondary" />
                                                    </div>
                                                    <h4 className="text-xl font-black text-brand-black">Delivery Address</h4>
                                                </div>
                                                <div className="space-y-2 text-brand-grey font-medium">
                                                    {order.shipping_address && <p>{order.shipping_address}</p>}
                                                    {(order.shipping_city || order.shipping_country || order.shipping_postal_code) && (
                                                        <p>
                                                            {order.shipping_city && `${order.shipping_city}, `}
                                                            {order.shipping_country && `${order.shipping_country} `}
                                                            {order.shipping_postal_code}
                                                        </p>
                                                    )}
                                                    {!order.shipping_address && !order.shipping_city && (
                                                        <p className="text-brand-grey/50 italic">Address information not available</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-8 bg-brand-primary/5 rounded-[2.5rem] border border-brand-primary/10">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                        <Clock className="w-6 h-6 text-brand-secondary" />
                                                    </div>
                                                    <h4 className="text-xl font-black text-brand-black">Estimated Delivery</h4>
                                                </div>
                                                <p className="text-2xl font-serif font-black italic text-brand-black">
                                                    {order.status === 'delivered' ? 'Delivered' : '2-3 Business Days'}
                                                </p>
                                                <p className="text-sm text-brand-grey mt-2 font-medium">
                                                    {order.status === 'delivered'
                                                        ? 'Your order has been successfully delivered'
                                                        : 'Your package is on its way'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="bg-white rounded-[4rem] overflow-hidden border border-brand-primary/5 shadow-2xl p-10 lg:p-16">
                                <div className="mb-12">
                                    <h3 className="text-3xl font-serif font-black italic text-brand-black mb-2">
                                        Order Items
                                    </h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-secondary">
                                        {orderItems.length} {orderItems.length === 1 ? 'Item' : 'Items'} in this order
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    {orderItems.map((item) => (
                                        <div key={item.id} className="flex gap-8 items-start p-6 bg-brand-light rounded-[2rem] border border-brand-primary/5 hover:border-brand-primary/20 transition-all group">
                                            <Link to={`/book/${item.books.id}`} className="shrink-0 relative">
                                                <div className="absolute -inset-4 bg-brand-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <img
                                                    src={item.books.cover_image || "/placeholder.svg"}
                                                    alt={item.books.title}
                                                    className="relative w-24 h-36 object-cover rounded-2xl shadow-xl border-4 border-white group-hover:-rotate-2 transition-all"
                                                />
                                            </Link>
                                            <div className="flex-1 min-w-0 space-y-3">
                                                <Link to={`/book/${item.books.id}`}>
                                                    <h4 className="text-2xl font-serif font-black text-brand-black hover:text-brand-secondary transition-colors italic leading-tight">
                                                        {item.books.title}
                                                    </h4>
                                                </Link>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-grey">
                                                    By {item.books.author}
                                                </p>
                                                <div className="flex items-center gap-6 text-sm font-bold text-brand-grey">
                                                    <span>Quantity: {item.quantity}</span>
                                                    <span className="text-brand-black text-lg font-serif italic">
                                                        {formatPrice(item.price_at_purchase)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-4 justify-center">
                                <Link to="/orders">
                                    <Button variant="outline" className="h-16 px-12 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border-2">
                                        View All Orders
                                    </Button>
                                </Link>
                                <Link to="/books">
                                    <Button className="h-16 px-12 bg-brand-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-brand-secondary transition-all transform hover:-translate-y-1">
                                        Continue Shopping
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default OrderTracking;
