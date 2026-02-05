import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User, Menu, X, Book, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useCurrency } from "@/context/CurrencyContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const navItems = [
    { label: "All Books", path: "/books" },
    { label: "New Arrival", path: "/new-arrivals" },
    { label: "Best Seller", path: "/best-sellers" },
    { label: "Editors Pick", path: "/editors-pick" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" }
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled
        ? "bg-white/95 backdrop-blur-md shadow-sm py-4"
        : "bg-transparent py-6"
        }`}
    >
      <div className="container mx-auto px-6 max-w-[1240px]">
        <div className="flex items-center justify-between">
          {/* Logo - Bookish Bliss */}
          <Link to="/" className="flex items-center gap-4 group shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center transition-all duration-700 group-hover:rotate-[360deg] shadow-lg">
              <Book className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="font-serif font-black text-2xl tracking-tighter text-brand-black italic">
              Bookish <span className="text-brand-secondary">Bliss</span>
            </span>
          </Link>

          {/* Center Navigation - Uppercase & Bold */}
          <nav className="hidden xl:flex items-center gap-10">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`text-[12px] font-black uppercase tracking-[0.25em] transition-all relative group/nav ${isActive(item.path) ? "text-brand-secondary" : "text-brand-black hover:text-brand-secondary"
                  }`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-brand-secondary transition-all ${isActive(item.path) ? "w-full" : "w-0 group-hover/nav:w-full"
                  }`} />
              </Link>
            ))}
          </nav>

          {/* Right Actions - Bag & User */}
          <div className="hidden lg:flex items-center gap-10 shrink-0">
            {/* Bag Icon with premium styling */}
            <Link to="/cart" className="relative group">
              <div className="w-12 h-12 rounded-2xl bg-brand-light border border-brand-primary/10 flex items-center justify-center hover:bg-brand-black hover:text-white transition-all duration-500 shadow-sm active:scale-95 group-hover:-translate-y-1">
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform stroke-[2.5px]" />
              </div>
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-brand-secondary text-brand-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce-slow">
                {cartCount}
              </span>
            </Link>

            {/* User Icon */}
            {user ? (
              <Link to="/account" className="relative group">
                <div className="w-12 h-12 rounded-2xl bg-brand-light border border-brand-primary/10 flex items-center justify-center hover:bg-brand-black hover:text-white transition-all duration-500 shadow-sm active:scale-95 group-hover:-translate-y-1">
                  <User className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
              </Link>
            ) : (
              <Link to="/auth" className="relative group">
                <div className="w-12 h-12 rounded-2xl bg-brand-light border border-brand-primary/10 flex items-center justify-center hover:bg-brand-black hover:text-white transition-all duration-500 shadow-sm active:scale-95 group-hover:-translate-y-1">
                  <User className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button (Visible on smaller screens) */}
          <div className="flex lg:hidden items-center gap-4">
            <Link to="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-900" />
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[80px] w-full bg-white/95 backdrop-blur-xl py-12 px-8 flex flex-col justify-between z-50 animate-in fade-in slide-in-from-top duration-500">
            <nav className="flex flex-col gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`text-2xl font-black uppercase tracking-[0.2em] font-serif transition-colors ${isActive(item.path) ? "text-brand-secondary italic" : "text-brand-black"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="h-px bg-brand-primary/10 my-4" />
              <Link
                to="/track-order"
                className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-brand-black"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                Track Order
              </Link>
              <Link
                to="/account"
                className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-brand-black"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                Account Profile
              </Link>
            </nav>

            {user && (
              <Button
                onClick={handleLogout}
                className="w-full h-16 bg-brand-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px]"
              >
                Terminate Session
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
