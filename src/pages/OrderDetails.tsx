import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
    ArrowLeft,
    Download,
    Truck,
    Package,
    MapPin,
    Calendar,
    CreditCard,
    User,
    Phone,
    Mail,
    Printer,
    RefreshCw,
    XCircle,
    CheckCircle
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import TrackingTimeline from "@/components/orders/TrackingTimeline";
import { Separator } from "@/components/ui/separator";

interface Order {
    id: string;
    status: string;
    total_amount: number;
    tracking_number: string | null;
    created_at: string;
    updated_at: string;
    shipping_address: string | null;
    shipping_city: string | null;
    shipping_country: string | null;
    shipping_postal_code: string | null;
    user_id: string;
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
        isbn: string | null;
    };
}

interface UserProfile {
    full_name: string | null;
    email: string | null;
    phone: string | null;
}

const OrderDetails = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { formatPrice } = useCurrency();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/auth");
                return;
            }

            try {
                // Fetch order
                const { data: orderData, error: orderError } = await supabase
                    .from("orders")
                    .select("*")
                    .eq("id", orderId)
                    .eq("user_id", session.user.id)
                    .single();

                if (orderError) throw orderError;
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
              cover_image,
              isbn
            )
          `)
                    .eq("order_id", orderId);

                if (itemsError) throw itemsError;
                setOrderItems(itemsData as OrderItem[] || []);

                // Fetch user profile
                setUserProfile({
                    full_name: session.user.user_metadata?.full_name || null,
                    email: session.user.email || null,
                    phone: session.user.user_metadata?.phone || null,
                });

            } catch (error) {
                console.error("Error fetching order details:", error);
                toast.error("Failed to load order details");
                navigate("/orders");
            } finally {
                setIsLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId, navigate]);

    const handlePrint = () => {
        window.print();
    };

    const handleCancelOrder = async () => {
        if (!confirm("Are you sure you want to cancel this order?")) return;

        try {
            const { error } = await supabase
                .from("orders")
                .update({ status: 'cancelled' })
                .eq('id', orderId);

            if (error) throw error;

            setOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
            toast.success("Order cancelled successfully");
        } catch (error) {
            toast.error("Failed to cancel order");
        }
    };

    const handleReturnOrder = async () => {
        if (!confirm("Are you sure you want to return this order?")) return;

        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'returned' })
                .eq('id', orderId);

            if (error) throw error;

            setOrder(prev => prev ? { ...prev, status: 'returned' } : null);
            toast.success("Return request submitted successfully");
        } catch (error) {
            toast.error("Failed to submit return request");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'shipped':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'cancelled':
            case 'returned':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'confirmed':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            default:
                return 'bg-brand-primary/10 text-brand-secondary border-brand-primary/20';
        }
    };

    const calculateSubtotal = () => {
        return orderItems.reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-brand-light">
                <Header />
                <main className="flex-1 flex items-center justify-center py-40">
                    <div className="flex flex-col items-center gap-8">
                        <div className="relative w-20 h-20">
                            <div className="absolute inset-0 border-4 border-brand-primary/10 rounded-full" />
                            <div className="absolute inset-0 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey animate-pulse">
                            Loading Order Details...
                        </span>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col bg-brand-light">
                <Header />
                <main className="flex-1 flex items-center justify-center py-40">
                    <div className="text-center">
                        <h2 className="text-4xl font-serif font-black italic text-brand-black mb-4">
                            Order Not Found
                        </h2>
                        <Link to="/orders">
                            <Button className="h-14 px-10 bg-brand-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px]">
                                Back to Orders
                            </Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-brand-light font-sans selection:bg-brand-black selection:text-white print:bg-white">
            <div className="print:hidden">
                <Header />
            </div>

            <main className="flex-1 pb-32 print:pb-0">
                {/* Page Header */}
                <div className="bg-[#FEF7EB] pt-40 pb-20 border-b border-brand-primary/10 print:pt-10 print:pb-10">
                    <div className="container mx-auto px-6 max-w-[1240px]">
                        <Link
                            to="/orders"
                            className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey hover:text-brand-black transition-all mb-12 group print:hidden"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-white border border-brand-primary/10 flex items-center justify-center shadow-sm group-hover:bg-brand-black group-hover:text-white group-hover:-translate-x-1 transition-all">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            Back to Orders
                        </Link>

                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 text-brand-secondary font-black text-[10px] uppercase tracking-[0.4em]">
                                    <Package className="w-4 h-4" />
                                    Order Details
                                </div>
                                <h1 className="text-5xl md:text-7xl font-serif font-black text-brand-black tracking-tighter italic print:text-4xl">
                                    Order <span className="text-brand-secondary">#{order.id.slice(0, 8).toUpperCase()}</span>
                                </h1>
                                <div className={`inline-flex px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </div>
                            </div>

                            <div className="flex gap-4 print:hidden">
                                <Button
                                    onClick={handlePrint}
                                    variant="outline"
                                    className="h-14 px-8 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border-2"
                                >
                                    <Printer className="w-4 h-4 mr-2" />
                                    Print
                                </Button>
                                <Link to={`/track-order?orderId=${order.id}`}>
                                    <Button className="h-14 px-8 bg-brand-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-brand-secondary transition-all">
                                        <Truck className="w-4 h-4 mr-2" />
                                        Track Order
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-6 py-16 lg:py-24 max-w-[1240px] print:py-8">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Order Items */}
                            <div className="bg-white rounded-[4rem] overflow-hidden border border-brand-primary/5 shadow-2xl p-10 lg:p-16 print:shadow-none print:rounded-2xl">
                                <h2 className="text-3xl font-serif font-black italic text-brand-black mb-2">
                                    Order Items
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-secondary mb-12">
                                    {orderItems.length} {orderItems.length === 1 ? 'Item' : 'Items'}
                                </p>

                                <div className="space-y-8">
                                    {orderItems.map((item) => (
                                        <div key={item.id} className="flex gap-8 items-start p-6 bg-brand-light rounded-[2rem] border border-brand-primary/5 hover:border-brand-primary/20 transition-all group print:bg-gray-50">
                                            <Link to={`/book/${item.books.id}`} className="shrink-0 relative print:pointer-events-none">
                                                <img
                                                    src={item.books.cover_image || "/placeholder.svg"}
                                                    alt={item.books.title}
                                                    className="w-24 h-36 object-cover rounded-2xl shadow-xl border-4 border-white group-hover:-rotate-2 transition-all"
                                                />
                                            </Link>
                                            <div className="flex-1 min-w-0 space-y-3">
                                                <div>
                                                    <h4 className="text-2xl font-serif font-black text-brand-black italic leading-tight">
                                                        {item.books.title}
                                                    </h4>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-grey mt-2">
                                                        By {item.books.author}
                                                    </p>
                                                    {item.books.isbn && (
                                                        <p className="text-xs text-brand-grey/60 font-mono mt-1">
                                                            ISBN: {item.books.isbn}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between pt-2">
                                                    <span className="text-sm font-bold text-brand-grey">
                                                        Quantity: {item.quantity}
                                                    </span>
                                                    <span className="text-xl font-serif font-black italic text-brand-black">
                                                        {formatPrice(item.price_at_purchase)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="my-12" />

                                {/* Order Summary */}
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span className="text-brand-grey">Subtotal</span>
                                        <span className="text-brand-black">{formatPrice(calculateSubtotal())}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span className="text-brand-grey">Shipping</span>
                                        <span className="text-green-600">FREE</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-serif font-black italic text-brand-black">Total</span>
                                        <span className="text-3xl font-serif font-black italic text-brand-black">
                                            {formatPrice(order.total_amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tracking Timeline */}
                            {order.status !== 'cancelled' && order.status !== 'returned' && (
                                <div className="bg-white rounded-[4rem] overflow-hidden border border-brand-primary/5 shadow-2xl p-10 lg:p-16 print:hidden">
                                    <h2 className="text-3xl font-serif font-black italic text-brand-black mb-2">
                                        Shipment Progress
                                    </h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-secondary mb-12">
                                        Real-time tracking
                                    </p>
                                    <TrackingTimeline status={order.status} />
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Order Information */}
                            <div className="bg-white rounded-[3rem] overflow-hidden border border-brand-primary/5 shadow-2xl p-8 print:shadow-none print:rounded-2xl">
                                <h3 className="text-xl font-serif font-black italic text-brand-black mb-8">
                                    Order Information
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-brand-light rounded-xl flex items-center justify-center shrink-0">
                                            <Calendar className="w-5 h-5 text-brand-secondary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-grey mb-1">
                                                Order Date
                                            </p>
                                            <p className="font-bold text-brand-black">
                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {order.tracking_number && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-brand-light rounded-xl flex items-center justify-center shrink-0">
                                                <Package className="w-5 h-5 text-brand-secondary" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-grey mb-1">
                                                    Tracking Number
                                                </p>
                                                <p className="font-mono font-bold text-brand-black text-sm">
                                                    {order.tracking_number}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-brand-light rounded-xl flex items-center justify-center shrink-0">
                                            <CreditCard className="w-5 h-5 text-brand-secondary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-grey mb-1">
                                                Payment Method
                                            </p>
                                            <p className="font-bold text-brand-black">
                                                Credit Card
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white rounded-[3rem] overflow-hidden border border-brand-primary/5 shadow-2xl p-8 print:shadow-none print:rounded-2xl">
                                <h3 className="text-xl font-serif font-black italic text-brand-black mb-8">
                                    Shipping Address
                                </h3>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-brand-light rounded-xl flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-brand-secondary" />
                                    </div>
                                    <div className="space-y-1 text-brand-grey font-medium">
                                        {userProfile?.full_name && <p className="font-bold text-brand-black">{userProfile.full_name}</p>}
                                        {order.shipping_address && <p>{order.shipping_address}</p>}
                                        {(order.shipping_city || order.shipping_country || order.shipping_postal_code) && (
                                            <p>
                                                {order.shipping_city && `${order.shipping_city}, `}
                                                {order.shipping_country && `${order.shipping_country} `}
                                                {order.shipping_postal_code}
                                            </p>
                                        )}
                                        {!order.shipping_address && !order.shipping_city && (
                                            <p className="text-brand-grey/50 italic">Address not available</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="bg-white rounded-[3rem] overflow-hidden border border-brand-primary/5 shadow-2xl p-8 print:shadow-none print:rounded-2xl">
                                <h3 className="text-xl font-serif font-black italic text-brand-black mb-8">
                                    Customer Information
                                </h3>
                                <div className="space-y-6">
                                    {userProfile?.email && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-brand-light rounded-xl flex items-center justify-center shrink-0">
                                                <Mail className="w-5 h-5 text-brand-secondary" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-grey mb-1">
                                                    Email
                                                </p>
                                                <p className="font-medium text-brand-black text-sm break-all">
                                                    {userProfile.email}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {userProfile?.phone && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-brand-light rounded-xl flex items-center justify-center shrink-0">
                                                <Phone className="w-5 h-5 text-brand-secondary" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-grey mb-1">
                                                    Phone
                                                </p>
                                                <p className="font-medium text-brand-black">
                                                    {userProfile.phone}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-4 print:hidden">
                                {(order.status === 'pending' || order.status === 'confirmed') && (
                                    <Button
                                        onClick={handleCancelOrder}
                                        variant="outline"
                                        className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border-2 border-red-200 text-red-600 hover:bg-red-50"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Cancel Order
                                    </Button>
                                )}

                                {order.status === 'delivered' && (
                                    <Button
                                        onClick={handleReturnOrder}
                                        variant="outline"
                                        className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border-2"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Return Order
                                    </Button>
                                )}

                                <Link to="/books" className="block">
                                    <Button className="w-full h-14 bg-brand-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-brand-secondary transition-all">
                                        Continue Shopping
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <div className="print:hidden">
                <Footer />
            </div>
        </div>
    );
};

export default OrderDetails;
