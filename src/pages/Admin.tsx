import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    Users,
    LogOut,
    Plus,
    Search,
    Bell,
    BookOpen,
    CheckCircle,
    Trash2,
    Clock,
    Pencil,
    Save,
    Image as ImageIcon,
    Truck,
    TrendingUp,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    Menu
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sendEmail } from "@/utils/email";
import { startPeriodicEmails, stopPeriodicEmails, updateOrderEmailSchedule, restoreEmailSchedules } from "@/utils/emailScheduler";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Product {
    id?: string;
    title: string;
    author: string;
    price: number;
    category: string;
    stock: number;
    description: string;
    cover_image: string;
}

const Admin = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [emailLogs, setEmailLogs] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Dashboard State
    const [stats, setStats] = useState([
        { label: "Total Revenue", value: "...", change: "calculating..." },
        { label: "Total Orders", value: "...", change: "calculating..." },
        { label: "Active Customers", value: "...", change: "calculating..." },
        { label: "Products in Stock", value: "...", change: "calculating..." }
    ]);
    const [revenueData, setRevenueData] = useState<any[]>([]);

    // Order State
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    // Product State
    const [products, setProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product>({
        title: "", author: "", price: 0, category: "", stock: 0, description: "", cover_image: ""
    });
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Pagination & Sort State
    const [sortConfig, setSortConfig] = useState<any>({ key: 'created_at', direction: 'desc' });
    const [customerSort, setCustomerSort] = useState<any>({ key: 'totalSpent', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        // Load logs from localStorage
        const updateLogs = () => {
            const storedLogs = JSON.parse(localStorage.getItem("admin_email_logs") || "[]");
            if (storedLogs.length === 0) {
                const initialMocks = [
                    { id: 1, to: "user@example.com", subject: "Order Confirmation #1234", status: "Sent", time: "2 mins ago" },
                    { id: 2, to: "admin@bookstore.com", subject: "New User Registration", status: "Received", time: "15 mins ago" },
                    { id: 3, to: "customer@gmail.com", subject: "OTP Verification: 4829", status: "Delivered", time: "1 hour ago" },
                ];
                setEmailLogs(initialMocks);
            } else {
                setEmailLogs(storedLogs);
            }
        };

        updateLogs();
        const interval = setInterval(updateLogs, 2000);

        // Restore email schedules on component mount
        restoreEmailSchedules();

        return () => clearInterval(interval);
    }, []);

    const loadDashboard = async () => {
        const { data: orderData } = await supabase.from('orders').select('*');
        const { data: prodData } = await supabase.from('books').select('*');
        const { data: activeOrders } = await supabase.from('orders').select('*').not('status', 'in', '("cancelled", "returned")');

        const allOrders = orderData || [];
        const realOrders = activeOrders || []; // Revenue only from non-cancelled
        const allProducts = prodData || [];

        const revenue = realOrders.reduce((acc, order) => acc + (Number(order.total_amount) || 0), 0);
        const uniqueUsers = new Set(allOrders.map(o => o.user_id)).size;

        setStats([
            {
                label: "Total Revenue",
                value: `$${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                change: "Lifetime earnings"
            },
            {
                label: "Total Orders",
                value: allOrders.length.toString(),
                change: `${realOrders.length} active / completed`
            },
            {
                label: "Active Customers",
                value: uniqueUsers.toString(),
                change: "Based on order history"
            },
            {
                label: "Stock Count",
                value: allProducts.reduce((acc, p) => acc + (p.stock || 0), 0).toString(),
                change: `${allProducts.length} unique titles`
            }
        ]);

        // Calculate Chart Data (Revenue per Month)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = Array(12).fill(0);

        realOrders.forEach(order => {
            const date = new Date(order.created_at);
            if (date.getFullYear() === currentYear) {
                monthlyRevenue[date.getMonth()] += Number(order.total_amount);
            }
        });

        const chartData = months.map((month, index) => ({
            name: month,
            total: monthlyRevenue[index]
        }));

        setRevenueData(chartData);
    };

    useEffect(() => {
        if (activeTab === "dashboard") loadDashboard();
        if (activeTab === "orders" || activeTab === "users") fetchOrders();
        if (activeTab === "products") fetchProducts();
    }, [activeTab]);

    // Realtime Intelligence Subscription
    useEffect(() => {
        // Order Events
        const orderChannel = supabase
            .channel('admin-orders-stream')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    // Update stats immediately if on dashboard
                    if (activeTab === "dashboard") loadDashboard();

                    // Specific event handling for orders list
                    if (activeTab === "orders" || activeTab === "users") {
                        if (payload.eventType === 'INSERT') {
                            toast.success("Intelligence Alert: New Acquisition Record Incoming", {
                                icon: <TrendingUp className="w-4 h-4 text-green-500" />
                            });
                            fetchOrders(); // Full fetch to get profile data
                        } else if (payload.eventType === 'UPDATE') {
                            fetchOrders(); // Refresh to get updated status and potentially new profile data
                        } else if (payload.eventType === 'DELETE') {
                            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
                        }
                    }
                }
            )
            .subscribe();

        // Product Events
        const bookChannel = supabase
            .channel('admin-books-stream')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'books' },
                () => {
                    if (activeTab === "dashboard") loadDashboard();
                    if (activeTab === "products") fetchProducts();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(orderChannel);
            supabase.removeChannel(bookChannel);
        };
    }, [activeTab]);

    // --- Order Logic ---
    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            // Fetch user profiles to map names and emails
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('user_id, email, full_name');

            if (profilesError) throw profilesError;

            // Map profiles to orders for rich interface
            const richOrders = ordersData.map(order => {
                const profile = profilesData?.find(p => p.user_id === order.user_id);
                return {
                    ...order,
                    user_email: profile?.email || 'unidentified@bliss.com',
                    user_name: profile?.full_name || 'Anonymous User'
                };
            });

            setOrders(richOrders || []);
        } catch (error) {
            console.error(error);
            toast.error("Critical Failure: Unable to retrieve logistics stream");
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleApproveOrder = async (orderId: string, userEmail: string) => {
        try {
            // Get order details for admin notification
            const { data: orderData, error: fetchError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (fetchError) throw fetchError;

            const { error } = await supabase.from('orders').update({ status: 'confirmed' }).eq('id', orderId);
            if (error) throw error;
            toast.success("Authorization Confirmed: Order Validated");

            // Start periodic email updates for this order
            await startPeriodicEmails(orderId, userEmail, 'confirmed');

            toast.info("📧 Periodic email updates activated", {
                description: "Customer will receive status updates every 30 minutes"
            });

            // Send admin notification email
            const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "admin@bookstore.com";
            const orderTotal = Number(orderData.total_amount).toFixed(2);
            const orderDate = new Date(orderData.created_at).toLocaleString();

            await sendEmail(
                adminEmail,
                `✅ Order Confirmed: #${orderId.slice(0, 8).toUpperCase()}`,
                `
ADMIN NOTIFICATION - ORDER CONFIRMED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Order ID: ${orderId}
Status: CONFIRMED ✓
Customer Email: ${userEmail}
Order Total: $${orderTotal}
Order Date: ${orderDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTIONS TAKEN:
✓ Order status updated to "confirmed"
✓ Customer notification emails activated
✓ Periodic status updates scheduled (every 30 minutes)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXT STEPS:
1. Prepare items for shipment
2. Update order status to "shipped" when dispatched
3. Customer will receive automatic tracking updates

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is an automated notification from Bookish Bliss Admin Panel.
                `.trim(),
                true // Silent mode (no toast for admin notification)
            );

            console.log(`[ADMIN NOTIFICATION] Order confirmation email sent to ${adminEmail}`);

            // Realtime subscription will refresh the UI automatically
        } catch (error) {
            console.error("[ADMIN] Order approval error:", error);
            toast.error("Operation Failed: Verification Error");
        }
    };

    const handleShipOrder = async (orderId: string, userEmail: string) => {
        try {
            // Get order details for admin notification
            const { data: orderData, error: fetchError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (fetchError) throw fetchError;

            const { error } = await supabase.from('orders').update({ status: 'shipped' }).eq('id', orderId);
            if (error) throw error;
            toast.success("Logistics Update: Shipment Dispatched");

            // Update email schedule to shipping status
            await updateOrderEmailSchedule(orderId, 'shipped', userEmail);

            toast.info("📧 Shipping updates activated", {
                description: "Customer will receive tracking updates every 60 minutes"
            });

            // Send admin notification email
            const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "admin@bookstore.com";
            const orderTotal = Number(orderData.total_amount).toFixed(2);
            const shippedDate = new Date().toLocaleString();

            await sendEmail(
                adminEmail,
                `📦 Order Shipped: #${orderId.slice(0, 8).toUpperCase()}`,
                `
ADMIN NOTIFICATION - ORDER SHIPPED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Order ID: ${orderId}
Status: SHIPPED 📦
Customer Email: ${userEmail}
Order Total: $${orderTotal}
Shipped Date: ${shippedDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTIONS TAKEN:
✓ Order status updated to "shipped"
✓ Customer shipping notification sent
✓ Tracking updates scheduled (every 60 minutes)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXT STEPS:
1. Monitor delivery status
2. Customer will receive automatic tracking updates
3. Order will auto-complete upon delivery

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is an automated notification from Bookish Bliss Admin Panel.
                `.trim(),
                true // Silent mode (no toast for admin notification)
            );

            console.log(`[ADMIN NOTIFICATION] Order shipping email sent to ${adminEmail}`);

            // Realtime subscription will refresh the UI automatically
        } catch (error) {
            console.error("[ADMIN] Order shipping error:", error);
            toast.error("Operation Failed: Dispatch Error");
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm("Are you sure you want to PERMANENTLY delete this order?")) return;
        try {
            const { error } = await supabase.from('orders').delete().eq('id', orderId);
            if (error) throw error;

            // Stop any periodic emails for this order
            stopPeriodicEmails(orderId);

            toast.success("Order deleted");
            setOrders(orders.filter(o => o.id !== orderId));
        } catch (error) {
            toast.error("Failed to delete order");
        }
    };

    // --- Product Logic ---
    const fetchProducts = async () => {
        setLoadingProducts(true);
        const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: false });
        if (error) {
            toast.error("Failed to fetch products");
        } else {
            setProducts(data || []);
        }
        setLoadingProducts(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!e.target.files || e.target.files.length === 0) {
                return;
            }
            setUploading(true);
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('book_covers')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('book_covers').getPublicUrl(filePath);

            setCurrentProduct({ ...currentProduct, cover_image: data.publicUrl });
            toast.success("Image uploaded successfully!");
        } catch (error: any) {
            console.error(error);
            toast.error("Upload failed. Ensure 'book_covers' bucket exists in Supabase.");
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProduct = async () => {
        try {
            if (!currentProduct.title || !currentProduct.author) {
                toast.error("Please fill in required fields");
                return;
            }

            const productData = {
                ...currentProduct,
                price: parseFloat((currentProduct.price || 0).toString()),
                stock: parseInt((currentProduct.stock || 0).toString()),
                is_available: true
            };

            const { error } = await supabase
                .from('books')
                .upsert(productData);

            if (error) throw error;

            toast.success(isEditing ? "Product updated" : "Product created");
            setIsProductDialogOpen(false);
            fetchProducts();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save product");
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            const { error } = await supabase.from('books').delete().eq('id', id);
            if (error) throw error;
            toast.success("Product deleted");
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            toast.error("Failed to delete product");
        }
    };

    const openProductDialog = (product?: any) => {
        if (product) {
            setCurrentProduct(product);
            setIsEditing(true);
        } else {
            setCurrentProduct({ title: "", author: "", price: 0, category: "", stock: 10, description: "", cover_image: "" });
            setIsEditing(false);
        }
        setIsProductDialogOpen(true);
    };

    // --- Render Helpers ---
    const getUniqueCustomers = () => {
        const unique = new Map();
        orders.forEach(o => {
            if (!unique.has(o.user_id)) {
                unique.set(o.user_id, {
                    id: o.user_id,
                    email: o.user_email,
                    name: o.user_name,
                    count: 1,
                    lastOrder: o.created_at,
                    totalSpent: Number(o.total_amount)
                });
            } else {
                const u = unique.get(o.user_id);
                u.count++;
                u.totalSpent += Number(o.total_amount);
                unique.set(o.user_id, u);
            }
        });
        return Array.from(unique.values());
    };

    const handleSort = (key: string, type: 'orders' | 'customers' | 'products' = 'orders') => {
        if (type === 'orders' || type === 'products') {
            setSortConfig((prev: any) => ({
                key,
                direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
            }));
        } else {
            setCustomerSort((prev: any) => ({
                key,
                direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
            }));
        }
    };


    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <div className="space-y-16 animate-fade-in pb-20">
                        {/* --- STATS GRID --- */}
                        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                            {stats.map((stat, i) => (
                                <div key={i} className="bg-white rounded-[3rem] p-10 border border-brand-primary/5 shadow-2xl shadow-brand-black/5 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 cursor-default group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-bl-[3rem] group-hover:scale-150 transition-transform duration-700" />
                                    <div className="flex flex-row items-center justify-between pb-6 relative z-10">
                                        <h3 className="text-[10px] uppercase font-black tracking-[0.4em] text-brand-grey/50 group-hover:text-brand-secondary transition-colors">
                                            {stat.label}
                                        </h3>
                                        <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
                                            <ArrowUpRight className="w-5 h-5 text-brand-secondary" />
                                        </div>
                                    </div>
                                    <div className="text-4xl font-serif font-black text-brand-black mb-4 relative z-10">{stat.value}</div>
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="flex items-center text-[9px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 uppercase tracking-widest">
                                            <TrendingUp className="w-3 h-3 mr-2" /> Accelerated
                                        </div>
                                        <p className="text-[9px] text-brand-grey font-black uppercase tracking-[0.2em]">{stat.change}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* --- ANALYTICS & LOGS --- */}
                        <div className="grid gap-12 lg:grid-cols-12 items-start">
                            {/* Revenue Chart */}
                            <div className="lg:col-span-8 bg-white rounded-[4rem] p-12 lg:p-16 border border-brand-primary/5 shadow-2xl shadow-brand-black/5">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                                    <div>
                                        <h3 className="text-4xl font-serif font-black italic text-brand-black mb-2 tracking-tighter">Fiscal Intelligence</h3>
                                        <p className="text-[10px] text-brand-secondary font-black uppercase tracking-[0.4em]">Revenue Projections — CY{new Date().getFullYear()}</p>
                                    </div>
                                    <div className="flex gap-4 p-2 bg-brand-light rounded-2xl shadow-inner">
                                        {['W', 'M', 'Y'].map(t => (
                                            <button key={t} className={`w-14 h-12 rounded-xl text-[10px] font-black tracking-widest flex items-center justify-center transition-all ${t === 'M' ? 'bg-brand-black text-white shadow-xl' : 'text-brand-grey hover:bg-white/50'}`}>
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-[450px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={revenueData}>
                                            <defs>
                                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#ffac2f" stopOpacity={0.9} />
                                                    <stop offset="100%" stopColor="#000000" stopOpacity={0.9} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE4D5" />
                                            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#424242', fontWeight: 900, letterSpacing: '0.1em' }} dy={15} />
                                            <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#424242', fontWeight: 900 }} tickFormatter={(v) => `$${v}`} />
                                            <Tooltip
                                                cursor={{ fill: '#FEF7EB' }}
                                                contentStyle={{ borderRadius: '2rem', border: '1px solid rgba(255,196,107,0.2)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.1)', padding: '2rem', background: '#FFFFFF' }}
                                                itemStyle={{ fontSize: '14px', fontWeight: '900', color: '#000000', fontFamily: 'DM Sans', textTransform: 'uppercase' }}
                                            />
                                            <Bar dataKey="total" fill="url(#barGradient)" radius={[10, 10, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Live Intel Stream */}
                            <div className="lg:col-span-4 bg-brand-black rounded-[4rem] overflow-hidden shadow-[0_60px_120px_-30px_rgba(0,0,0,0.4)] relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                                <div className="p-10 border-b border-white/5 bg-white/5 flex items-center justify-between relative z-10">
                                    <h3 className="text-brand-primary font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-4">
                                        <div className="w-3 h-3 rounded-full bg-brand-secondary animate-pulse shadow-[0_0_15px_rgba(255,172,47,0.8)]" />
                                        Intelligence Ledger
                                    </h3>
                                    <Badge variant="outline" className="text-[10px] font-black border-brand-primary/20 text-brand-secondary tracking-[0.2em] px-4 py-1">ENCRYPTED</Badge>
                                </div>
                                <div className="p-8 space-y-6 max-h-[500px] overflow-y-auto w-full relative z-10 scrollbar-hide">
                                    {emailLogs.length === 0 ? (
                                        <div className="py-32 text-center text-white/20 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Establishing Connection...</div>
                                    ) : (
                                        emailLogs.slice(0, 10).map((log, i) => (
                                            <div key={log.id || i} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-brand-primary/20 transition-all duration-500 group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="space-y-2">
                                                        <span className="block text-[9px] text-brand-secondary font-black uppercase tracking-[0.3em] opacity-60">Entry Source: {log.to.split('@')[0]}</span>
                                                        <span className="block text-base font-serif italic font-black text-white leading-tight">{log.subject}</span>
                                                    </div>
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{log.time}</span>
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{log.status} protocol</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                                        <span className="text-[9px] font-black text-green-500 uppercase tracking-widest underline decoration-green-500/20 underline-offset-4 decoration-2">Verified</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "orders":
                const filteredOrders = orders.filter(o => {
                    const matchesUser = selectedUserId ? o.user_id === selectedUserId : true;
                    const matchesSearch = searchQuery
                        ? (o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.total_amount.toString().includes(searchQuery))
                        : true;
                    return matchesUser && matchesSearch;
                });

                return (
                    <div className="space-y-16 animate-fade-in pb-20">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 px-2 gap-8">
                            <div>
                                <h2 className="text-5xl font-serif font-black italic text-brand-black mb-3 tracking-tighter">Logistics <span className="text-brand-secondary">Ledger</span></h2>
                                <p className="text-[10px] text-brand-grey font-black uppercase tracking-[0.4em]">Transaction registry & fulfillment dispatch</p>
                            </div>
                            <button onClick={fetchOrders} className="flex items-center gap-4 px-10 py-5 rounded-2xl bg-white border border-brand-primary/10 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey hover:text-brand-black">
                                <Clock className="w-5 h-5 text-brand-secondary" /> Refresh Intelligence
                            </button>
                        </div>

                        {selectedUserId && (
                            <div className="bg-brand-light rounded-[2.5rem] border border-brand-primary/10 p-10 flex items-center justify-between animate-fade-in mb-12 shadow-inner">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-brand-primary/10 flex items-center justify-center text-brand-secondary shadow-sm">
                                        <Users className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-secondary mb-1">Targeted Analysis Active</p>
                                        <span className="font-serif italic font-black text-2xl text-brand-black">User ID: {selectedUserId.slice(0, 12)}...</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUserId(null)} className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-black hover:text-white hover:bg-brand-black transition-all bg-white border border-brand-primary/10 px-8 py-4 rounded-full shadow-sm">
                                    Release Filter
                                </button>
                            </div>
                        )}

                        <div className="bg-white rounded-[3rem] border border-brand-primary/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-brand-light/30 border-b border-brand-primary/5">
                                        <tr>
                                            <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 cursor-pointer hover:text-brand-black transition-colors" onClick={() => handleSort('created_at')}>Timestamp</th>
                                            <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50">Reference ID</th>
                                            <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 cursor-pointer hover:text-brand-black transition-colors" onClick={() => handleSort('total_amount')}>Valuation</th>
                                            <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 text-center cursor-pointer hover:text-brand-black transition-colors" onClick={() => handleSort('status')}>Status protocol</th>
                                            <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 text-right">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-primary/5">
                                        {loadingOrders ? (
                                            <tr><td colSpan={5} className="py-32 text-center text-brand-grey/30 font-serif italic text-2xl animate-pulse">Establishing secure link...</td></tr>
                                        ) : filteredOrders.length === 0 ? (
                                            <tr><td colSpan={5} className="py-32 text-center text-brand-grey/30 font-serif italic text-2xl">No transaction records found.</td></tr>
                                        ) : (
                                            filteredOrders.map((order) => (
                                                <tr key={order.id} className="hover:bg-brand-light/20 transition-all duration-500 group">
                                                    <td className="px-12 py-8">
                                                        <span className="text-base font-bold text-brand-black">{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        <span className="block text-[10px] text-brand-grey/40 font-black uppercase tracking-widest mt-1">{new Date(order.created_at).toLocaleTimeString()}</span>
                                                    </td>
                                                    <td className="px-12 py-8">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-light rounded-xl border border-brand-primary/5 w-fit">
                                                                <span className="font-mono text-[10px] font-black text-brand-grey tracking-wider">#{order.id.slice(0, 12).toUpperCase()}</span>
                                                            </div>
                                                            <div className="text-[10px] font-black text-brand-secondary uppercase tracking-widest">{order.user_email}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-12 py-8">
                                                        <span className="text-2xl font-serif font-black italic text-brand-black">${Number(order.total_amount).toFixed(2)}</span>
                                                    </td>
                                                    <td className="px-12 py-8 text-center">
                                                        <span className={`inline-flex items-center gap-3 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border ${order.status === 'confirmed' ? "bg-green-50 text-green-700 border-green-100" :
                                                            order.status === 'shipped' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                                order.status === 'cancelled' ? "bg-red-50 text-red-700 border-red-100" :
                                                                    "bg-amber-50 text-amber-700 border-amber-100 shadow-amber-200/20"
                                                            }`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'confirmed' ? "bg-green-500" : order.status === 'shipped' ? "bg-blue-500" : order.status === 'cancelled' ? "bg-red-500" : "bg-amber-500 animate-pulse"}`} />
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-12 py-8 text-right">
                                                        <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                                                            {order.status === 'pending' && (
                                                                <button onClick={() => handleApproveOrder(order.id, order.user_email)} className="w-12 h-12 rounded-2xl bg-white border border-brand-primary/10 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-xl">
                                                                    <CheckCircle className="w-6 h-6" />
                                                                </button>
                                                            )}
                                                            {order.status === 'confirmed' && (
                                                                <button onClick={() => handleShipOrder(order.id, order.user_email)} className="w-12 h-12 rounded-2xl bg-white border border-brand-primary/10 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-xl">
                                                                    <Truck className="w-6 h-6" />
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleDeleteOrder(order.id)} className="w-12 h-12 rounded-2xl bg-white border border-brand-primary/10 text-brand-grey/40 flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-xl">
                                                                <Trash2 className="w-6 h-6" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case "products":
                const filteredProducts = products.filter(p =>
                    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
                );


                const sortedProducts = [...filteredProducts].sort((a, b) => {
                    const aValue = a[sortConfig.key];
                    const bValue = b[sortConfig.key];
                    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                });

                const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
                const paginatedProducts = sortedProducts.slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                );

                return (
                    <div className="space-y-16 animate-fade-in pb-20">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 px-2 gap-8">
                            <div>
                                <h2 className="text-5xl font-serif font-black italic text-brand-black mb-3 tracking-tighter">Archive <span className="text-brand-secondary">Management</span></h2>
                                <p className="text-[10px] text-brand-grey font-black uppercase tracking-[0.4em]">Curate and classify the volumes of the repository</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <button onClick={fetchProducts} className="flex items-center gap-4 px-8 py-5 rounded-2xl bg-white border border-brand-primary/10 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey hover:text-brand-black">
                                    <Clock className="w-5 h-5 text-brand-secondary" /> Sync Repository
                                </button>
                                <button onClick={() => openProductDialog()} className="px-10 py-5 bg-brand-black text-white rounded-[1.5rem] flex items-center gap-4 shadow-2xl hover:bg-brand-secondary transition-all transform hover:-translate-y-1 group">
                                    <Plus className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" /> <span className="text-[10px] font-black uppercase tracking-[0.3em]">Catalog New Volume</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-[3rem] border border-brand-primary/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-brand-light/30 border-b border-brand-primary/5">
                                        <tr>
                                            <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 cursor-pointer hover:text-brand-black transition-colors" onClick={() => handleSort('title', 'products')}>Narrative Title</th>
                                            <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 cursor-pointer hover:text-brand-black transition-colors" onClick={() => handleSort('category', 'products')}>Genre / Category</th>
                                            <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 text-center cursor-pointer hover:text-brand-black transition-colors" onClick={() => handleSort('price', 'products')}>Fiscal Valuation</th>
                                            <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 text-center cursor-pointer hover:text-brand-black transition-colors" onClick={() => handleSort('stock', 'products')}>Current Inventory</th>
                                            <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 text-right">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-primary/5">
                                        {loadingProducts ? (
                                            <tr><td colSpan={5} className="py-32 text-center text-brand-grey/30 font-serif italic text-2xl animate-pulse">Scanning repository...</td></tr>
                                        ) : paginatedProducts.length === 0 ? (
                                            <tr><td colSpan={5} className="py-32 text-center text-brand-grey/30 font-serif italic text-2xl">No volumes identified in the archive.</td></tr>
                                        ) : (
                                            paginatedProducts.map((product) => (
                                                <tr key={product.id} className="hover:bg-brand-light/20 transition-all duration-500 group">
                                                    <td className="px-12 py-8">
                                                        <div className="flex items-center gap-8">
                                                            <div className="w-16 h-24 bg-brand-light rounded-xl overflow-hidden shadow-2xl transform group-hover:scale-105 group-hover:-rotate-3 transition-all duration-700">
                                                                {product.cover_image ? (
                                                                    <img src={product.cover_image} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <ImageIcon className="w-6 h-6 m-auto mt-9 text-brand-grey/20" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-xl font-serif font-black text-brand-black mb-1 group-hover:text-brand-secondary transition-colors">{product.title}</div>
                                                                <div className="text-[10px] uppercase font-black tracking-[0.3em] text-brand-grey/40">{product.author}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-12 py-8">
                                                        <span className="px-5 py-2 rounded-full bg-brand-light border border-brand-primary/10 text-[9px] font-black uppercase tracking-[0.2em] text-brand-grey">
                                                            {product.category || 'Unclassified'}
                                                        </span>
                                                    </td>
                                                    <td className="px-12 py-8 text-center">
                                                        <span className="text-2xl font-serif font-black italic text-brand-black">${product.price}</span>
                                                    </td>
                                                    <td className="px-12 py-8 text-center">
                                                        <div className={`text-base font-black ${product.stock > 10 ? "text-green-600" : product.stock > 0 ? "text-amber-600" : "text-red-500"}`}>
                                                            {product.stock} <span className="text-[9px] text-brand-grey/40 uppercase font-black tracking-widest ml-1">Volumes</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-12 py-8 text-right">
                                                        <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                                                            <button onClick={() => openProductDialog(product)} className="w-12 h-12 rounded-2xl bg-white border border-brand-primary/10 flex items-center justify-center text-brand-grey/40 hover:text-brand-black hover:border-brand-black transition-all shadow-xl">
                                                                <Pencil className="w-6 h-6" />
                                                            </button>
                                                            <button onClick={() => handleDeleteProduct(product.id)} className="w-12 h-12 rounded-2xl bg-white border border-brand-primary/10 flex items-center justify-center text-brand-grey/40 hover:text-red-600 hover:border-red-600 transition-all shadow-xl">
                                                                <Trash2 className="w-6 h-6" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div >
                            {totalPages > 1 && (
                                <div className="px-12 py-8 border-t border-brand-primary/5 bg-brand-light/30 flex items-center justify-between">
                                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50">
                                        Archive Segment Segment {currentPage} of {totalPages}
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-8 py-4 rounded-full bg-white border border-brand-primary/10 text-[10px] font-black uppercase tracking-[0.3em] disabled:opacity-20 hover:shadow-2xl transition-all">Prev Sequence</button>
                                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-8 py-4 rounded-full bg-white border border-brand-primary/10 text-[10px] font-black uppercase tracking-[0.3em] disabled:opacity-20 hover:shadow-2xl transition-all">Next Sequence</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Product Dialog */}
                        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                            <DialogContent className="sm:max-w-[750px] bg-white rounded-[4rem] p-12 lg:p-16 border-none shadow-[0_80px_150px_-30px_rgba(0,0,0,0.2)]">
                                <DialogHeader className="mb-12">
                                    <DialogTitle className="text-5xl font-serif font-black italic text-brand-black mb-3 tracking-tighter">{isEditing ? "Modify Record" : "New Volume Manifest"}</DialogTitle>
                                    <DialogDescription className="text-[10px] text-brand-secondary font-black uppercase tracking-[0.4em]">
                                        {isEditing ? "Synchronizing details with the central repository." : "Initializing new narrative data structure."}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-12 py-6">
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <Label htmlFor="title" className="text-[10px] uppercase font-black tracking-[0.4em] text-brand-grey/50 ml-1">Narrative Title</Label>
                                            <Input id="title" value={currentProduct.title} onChange={(e) => setCurrentProduct({ ...currentProduct, title: e.target.value })} className="h-16 rounded-2xl bg-brand-light border-0 font-bold focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-inner" placeholder="E.g. The Midnight Archive" />
                                        </div>
                                        <div className="space-y-4">
                                            <Label htmlFor="author" className="text-[10px] uppercase font-black tracking-[0.4em] text-brand-grey/50 ml-1">Lead Author</Label>
                                            <Input id="author" value={currentProduct.author} onChange={(e) => setCurrentProduct({ ...currentProduct, author: e.target.value })} className="h-16 rounded-2xl bg-brand-light border-0 font-bold focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-inner" placeholder="E.g. Elena V. Thorne" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <Label htmlFor="price" className="text-[10px] uppercase font-black tracking-[0.4em] text-brand-grey/50 ml-1">Fiscal Valuation ($)</Label>
                                            <Input id="price" type="number" value={currentProduct.price} onChange={(e) => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })} className="h-16 rounded-2xl bg-brand-light border-0 font-bold focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-inner" />
                                        </div>
                                        <div className="space-y-4">
                                            <Label htmlFor="stock" className="text-[10px] uppercase font-black tracking-[0.4em] text-brand-grey/50 ml-1">Inventory Allocation</Label>
                                            <Input id="stock" type="number" value={currentProduct.stock} onChange={(e) => setCurrentProduct({ ...currentProduct, stock: parseInt(e.target.value) })} className="h-16 rounded-2xl bg-brand-light border-0 font-bold focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-inner" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <Label htmlFor="category" className="text-[10px] uppercase font-black tracking-[0.4em] text-brand-grey/50 ml-1">Genre Classification</Label>
                                        <Select value={currentProduct.category} onValueChange={(val) => setCurrentProduct({ ...currentProduct, category: val })}>
                                            <SelectTrigger className="h-16 rounded-2xl bg-brand-light border-0 font-bold focus:ring-2 focus:ring-brand-primary/20 shadow-inner">
                                                <SelectValue placeholder="Select genre" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-[2rem] border-brand-primary/10 shadow-2xl p-4">
                                                {["Fiction", "Non-Fiction", "Mystery", "Romance", "Sci-Fi", "Philosophy", "Art & Design", "History", "Religion", "Young Adult", "Crime"].map(cat => (
                                                    <SelectItem key={cat} value={cat} className="font-bold text-sm h-12 rounded-xl focus:bg-brand-light focus:text-brand-black transition-colors">{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-4">
                                        <Label htmlFor="cover" className="text-[10px] uppercase font-black tracking-[0.4em] text-brand-grey/50 ml-1">Visual Manifest (Cover Image)</Label>
                                        <div className="flex items-start gap-10">
                                            <div className="w-32 h-44 bg-brand-light rounded-2xl overflow-hidden border border-brand-primary/10 shadow-2xl flex-shrink-0 group/preview relative">
                                                {currentProduct.cover_image ? (
                                                    <img src={currentProduct.cover_image} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-110" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-brand-grey/20">
                                                        <ImageIcon className="w-10 h-10" />
                                                    </div>
                                                )}
                                                {uploading && (
                                                    <div className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm flex items-center justify-center">
                                                        <Clock className="w-8 h-8 text-brand-primary animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-6">
                                                <div className="flex items-center gap-6">
                                                    <Input id="file-upload" type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                                                    <label htmlFor="file-upload" className="flex-1 h-20 rounded-[1.5rem] border-4 border-dashed border-brand-primary/10 hover:border-brand-secondary hover:bg-brand-light/50 transition-all cursor-pointer flex items-center justify-center gap-5 group">
                                                        <ImageIcon className="w-7 h-7 text-brand-grey/30 group-hover:text-brand-secondary transition-colors" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey/50 group-hover:text-brand-black">Upload Visual Terminal</span>
                                                    </label>
                                                </div>
                                                <div className="relative">
                                                    <Input id="cover" value={currentProduct.cover_image || ''} onChange={(e) => setCurrentProduct({ ...currentProduct, cover_image: e.target.value })} placeholder="Integration URL Override..." className="h-16 rounded-2xl bg-brand-light border-0 font-bold focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-inner pr-12" />
                                                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                                        <div className={`w-2 h-2 rounded-full ${currentProduct.cover_image ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-brand-grey/20'}`} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="mt-16 gap-6">
                                    <button onClick={() => setIsProductDialogOpen(false)} className="px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey hover:text-brand-black transition-colors">Abort Manifest</button>
                                    <button onClick={handleSaveProduct} disabled={!currentProduct.title || !currentProduct.author || uploading} className="px-16 py-6 rounded-[1.5rem] bg-brand-black text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] hover:bg-brand-secondary transition-all flex items-center gap-4 transform hover:-translate-y-1">
                                        <Save className="w-5 h-5" /> Commit to Archive
                                    </button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                );
            case "users":
                const customers = getUniqueCustomers();
                const filteredCustomers = customers.filter(c =>
                    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.name.toLowerCase().includes(searchQuery.toLowerCase())
                ).sort((a: any, b: any) => {
                    const order = customerSort.direction === 'asc' ? 1 : -1;
                    if (customerSort.key === 'totalSpent' || customerSort.key === 'count') {
                        return (a[customerSort.key] - b[customerSort.key]) * order;
                    }
                    return a[customerSort.key].localeCompare(b[customerSort.key]) * order;
                });
                return (
                    <div className="space-y-16 animate-fade-in pb-20">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 px-2 gap-8">
                            <div>
                                <h2 className="text-5xl font-serif font-black italic text-brand-black mb-3 tracking-tighter">Clientele <span className="text-brand-secondary">Registry</span></h2>
                                <p className="text-[10px] text-brand-grey font-black uppercase tracking-[0.4em]">Comprehensive database of authenticated site members</p>
                            </div>
                            <button onClick={() => { localStorage.removeItem("admin_email_logs"); setEmailLogs([]); toast.success("Intel Purged"); }} className="px-10 py-5 rounded-2xl border border-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 group">
                                <Trash2 className="w-5 h-5 group-hover:animate-bounce" /> Purge Intelligence
                            </button>
                        </div>

                        <div className="grid lg:grid-cols-12 gap-12">
                            {/* Live Stream */}
                            <div className="lg:col-span-4">
                                <div className="bg-brand-black rounded-[3rem] overflow-hidden shadow-[0_60px_120px_-30px_rgba(0,0,0,0.4)] relative">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                                    <div className="p-10 border-b border-white/5 bg-white/5 flex items-center justify-between relative z-10">
                                        <h3 className="text-brand-primary font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-4">
                                            <div className="w-3 h-3 rounded-full bg-brand-secondary animate-pulse shadow-[0_0_15px_rgba(255,172,47,0.8)]" />
                                            Transmission Stream
                                        </h3>
                                        <Badge variant="outline" className="text-[10px] font-black border-brand-primary/20 text-brand-secondary tracking-[0.2em] px-4 py-1">{emailLogs.length}</Badge>
                                    </div>
                                    <div className="p-8 space-y-6 max-h-[600px] overflow-y-auto w-full relative z-10 scrollbar-hide">
                                        {emailLogs.length === 0 ? (
                                            <div className="py-32 text-center text-white/20 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Awaiting Signal...</div>
                                        ) : (
                                            emailLogs.map((log, i) => (
                                                <div key={i} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-brand-primary/20 transition-all duration-500 group">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className="block text-[9px] text-brand-secondary font-black uppercase tracking-[0.3em] opacity-60 truncate max-w-[120px]">{log.to}</span>
                                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{log.time}</span>
                                                    </div>
                                                    <p className="text-base font-serif italic font-black text-white mb-4 line-clamp-1">{log.subject}</p>
                                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Protocol Active</span>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                                            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">{log.status}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Record */}
                            <div className="lg:col-span-8">
                                <div className="bg-white rounded-[3rem] border border-brand-primary/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-brand-light/30 border-b border-brand-primary/5">
                                                <tr>
                                                    <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 cursor-pointer hover:text-brand-black transition-colors" onClick={() => handleSort('name', 'customers')}>Client Intelligence</th>
                                                    <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 text-center cursor-pointer hover:text-brand-black transition-colors" onClick={() => handleSort('count', 'customers')}>Acquisitions</th>
                                                    <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 text-center cursor-pointer hover:text-brand-black transition-colors" onClick={() => handleSort('totalSpent', 'customers')}>Lifetime Valuation</th>
                                                    <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 text-right">Operations</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-brand-primary/5">
                                                {filteredCustomers.length === 0 ? (
                                                    <tr><td colSpan={4} className="py-32 text-center text-brand-grey/30 font-serif italic text-2xl">No active members identified.</td></tr>
                                                ) : (
                                                    filteredCustomers.map((cust, i) => (
                                                        <tr key={i} className="hover:bg-brand-light/20 transition-all duration-500 group">
                                                            <td className="px-12 py-8">
                                                                <div className="flex items-center gap-6">
                                                                    <div className="w-16 h-16 rounded-2xl bg-brand-black text-white flex items-center justify-center text-xl font-serif font-black italic shadow-2xl transform group-hover:rotate-12 transition-transform duration-700">
                                                                        {cust.name.slice(0, 1).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-base font-black text-brand-black font-serif italic">{cust.name}</div>
                                                                        <div className="text-[9px] uppercase font-black tracking-[0.2em] text-brand-secondary mt-1">{cust.email}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-12 py-8 text-center">
                                                                <span className="text-lg font-bold text-brand-black">{cust.count} <span className="text-[10px] text-brand-grey/40 uppercase font-black tracking-widest ml-2">Shipments</span></span>
                                                            </td>
                                                            <td className="px-12 py-8 text-center">
                                                                <span className="text-2xl font-serif font-black italic text-green-600">${cust.totalSpent.toFixed(2)}</span>
                                                            </td>
                                                            <td className="px-12 py-8 text-right">
                                                                <button
                                                                    onClick={() => { setSelectedUserId(cust.id); setActiveTab("orders"); }}
                                                                    className="px-8 py-4 rounded-full bg-white border border-brand-primary/10 text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey hover:text-brand-black hover:border-brand-black hover:shadow-2xl transition-all"
                                                                >
                                                                    Access History
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white">
            {/* Sidebar Header */}
            <div className="h-40 flex items-center px-10 border-b border-brand-primary/10 mb-8 bg-[#FEF7EB]/50">
                <div className="w-14 h-14 rounded-2xl bg-brand-black flex items-center justify-center text-white shadow-2xl mr-6 transform -rotate-6 group-hover:rotate-0 transition-transform">
                    <BookOpen className="w-7 h-7" />
                </div>
                <div>
                    <span className="font-serif text-3xl font-black italic tracking-tighter block leading-none text-brand-black">Bliss</span>
                    <span className="text-[10px] uppercase font-black tracking-[0.4em] text-brand-secondary block mt-2">Executive</span>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 px-8 space-y-6">
                {[
                    { id: "dashboard", icon: LayoutDashboard, label: "Intelligence" },
                    { id: "orders", icon: Truck, label: "Logistics" },
                    { id: "products", icon: Package, label: "Archive" },
                    { id: "users", icon: Users, label: "Clientele" }
                ].map((btn) => (
                    <button
                        key={btn.id}
                        onClick={() => {
                            setActiveTab(btn.id);
                        }}
                        className={`w-full group flex items-center gap-6 px-8 py-5 rounded-[2rem] transition-all duration-500 relative ${activeTab === btn.id
                            ? "bg-brand-black text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] scale-[1.02] z-10"
                            : "text-brand-grey/60 hover:text-brand-black hover:bg-brand-light"
                            }`}
                    >
                        <btn.icon className={`w-5 h-5 ${activeTab === btn.id ? "text-brand-secondary" : "group-hover:scale-110 transition-transform"}`} />
                        <span className="font-black text-[10px] uppercase tracking-[0.3em]">{btn.label}</span>
                        {activeTab === btn.id && (
                            <div className="absolute right-8 w-2 h-2 rounded-full bg-brand-secondary shadow-[0_0_15px_rgba(255,172,47,0.8)] animate-pulse" />
                        )}
                    </button>
                ))}
            </div>

            {/* Sidebar Footer */}
            <div className="p-10 border-t border-brand-primary/10 space-y-8 bg-brand-light/20">
                <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-white border border-brand-primary/5 shadow-xl shadow-brand-black/5">
                    <div className="w-12 h-12 rounded-2xl bg-brand-black shadow-lg flex items-center justify-center text-white font-black text-lg italic font-serif">A</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black truncate text-brand-black leading-none mb-1">Administrator</p>
                        <p className="text-[9px] text-brand-secondary uppercase font-black tracking-widest leading-none">Security Lvl 04</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate("/")}
                    className="w-full flex items-center justify-center gap-4 py-5 rounded-full border border-brand-primary/10 text-brand-grey/60 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all text-[10px] font-black uppercase tracking-[0.4em]"
                >
                    <LogOut className="w-4 h-4" /> Terminate Auth
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex bg-brand-light font-sans selection:bg-brand-black selection:text-white overflow-hidden">
            {/* --- PREMIUM SIDEBAR (DESKTOP) --- */}
            <div className="w-[380px] border-r border-brand-primary/10 bg-white text-brand-black hidden md:flex flex-col relative z-20 shadow-[20px_0_60px_rgba(0,0,0,0.02)]">
                <SidebarContent />
            </div>

            {/* --- MAIN INTERFACE --- */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#FEF7EB]/30">
                {/* Global Ambient Background */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-60" />

                {/* Header Gallery */}
                <header className="h-40 flex items-center justify-between px-10 md:px-20 relative z-10 shrink-0 border-b border-brand-primary/10 bg-white/50 backdrop-blur-xl">
                    <div className="flex items-center gap-12 w-1/2">
                        {/* Mobile Sidebar Trigger */}
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <button className="p-6 rounded-[2rem] bg-white border border-brand-primary/10 shadow-sm text-brand-black">
                                        <Menu className="w-8 h-8" />
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-80 border-r border-brand-primary/10">
                                    <SidebarContent />
                                </SheetContent>
                            </Sheet>
                        </div>

                        <div className="relative group w-full max-w-xl hidden md:block">
                            <div className="absolute -inset-1 bg-brand-primary/5 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                            <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-grey/40 group-focus-within:text-brand-secondary transition-colors" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Intelligence Lookup...`}
                                className="relative w-full bg-white border border-brand-primary/10 rounded-full py-7 pl-20 pr-12 text-base font-bold shadow-sm focus:shadow-2xl focus:border-brand-primary/40 transition-all outline-none placeholder:text-brand-grey/30"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-12">
                        <div className="hidden lg:flex flex-col items-end">
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-secondary">Operations Status</p>
                            <p className="text-base font-bold text-brand-black flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
                                Nominal Efficiency
                            </p>
                        </div>
                        <div className="h-12 w-[1px] bg-brand-primary/10 mx-4 hidden md:block" />
                        <button className="relative p-7 rounded-[2.5rem] bg-white border border-brand-primary/10 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all group overflow-hidden">
                            <div className="absolute inset-0 bg-brand-light translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <Bell className="w-7 h-7 text-brand-grey/40 group-hover:text-brand-black transition-colors relative z-10" />
                            <span className="absolute top-7 right-7 w-3 h-3 bg-brand-secondary rounded-full border-[3px] border-white shadow-[0_0_15px_rgba(255,172,47,0.8)] relative z-10" />
                        </button>
                    </div>
                </header>

                {/* Scrollable Intelligence Content */}
                <main className="flex-1 p-8 md:p-20 overflow-auto relative z-10 scrollbar-hide pb-40">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default Admin;
