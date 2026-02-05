import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CartProvider } from "@/hooks/useCart";
import { CurrencyProvider } from "@/context/CurrencyContext";
import Index from "./pages/Index";
import BookDetails from "./pages/BookDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import OrderTracking from "./pages/OrderTracking";
import Account from "./pages/Account";
import Books from "./pages/Books";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import UpdatePassword from "./pages/UpdatePassword";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import ChatBot from "./components/chat/ChatBot";

const queryClient = new QueryClient();

// Wrapper to handle global auth events like Password Recovery
const AppRoutes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        navigate("/update-password");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/book/:id" element={<BookDetails />} />
      <Route path="/books" element={<Books />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/order/:orderId" element={<OrderDetails />} />
      <Route path="/track-order" element={<OrderTracking />} />
      <Route path="/account" element={<Account />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="/reset-password" element={<UpdatePassword />} /> {/* Fallback Alias */}

      {/* Content Pages */}
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Privacy />} />
      <Route path="/cookies" element={<Privacy />} />
      <Route path="/best-sellers" element={<Books />} />
      <Route path="/new-arrivals" element={<Books />} />
      <Route path="/editors-pick" element={<Books />} />

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CurrencyProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
            <ChatBot />
          </BrowserRouter>
        </CartProvider>
      </CurrencyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
