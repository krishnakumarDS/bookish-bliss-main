import { Link } from "react-router-dom";
import { Book, Github, Twitter, Instagram, Linkedin, Heart, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-brand-black pt-24 pb-12 font-sans relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] opacity-[0.03] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 max-w-[1240px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-10">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center transition-all duration-700 group-hover:rotate-[360deg] shadow-2xl">
                <Book className="w-6 h-6 text-white fill-white" />
              </div>
              <span className="font-serif font-black text-3xl tracking-tighter text-white block leading-none italic">
                Bookish <span className="text-brand-secondary">Bliss</span>
              </span>
            </Link>
            <p className="text-gray-400 text-base leading-loose font-medium pr-12">
              A sanctuary for bibliographic connoisseurs. We curate the finest literary works, ensuring every acquisition is a journey into the extraordinary.
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-brand-secondary hover:text-brand-black transition-all duration-500 hover:-translate-y-2 shadow-lg"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h4 className="font-serif font-black italic text-white mb-10 text-xl">Explore</h4>
            <ul className="space-y-6 text-sm font-bold uppercase tracking-widest text-gray-500">
              {[
                { name: "About Us", path: "/about" },
                { name: "Collection", path: "/books" },
                { name: "New Arrivals", path: "/new-arrivals" },
                { name: "Best Sellers", path: "/best-sellers" }
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="hover:text-brand-secondary transition-colors duration-300">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-3">
            <h4 className="font-serif font-black italic text-white mb-10 text-xl">Support</h4>
            <ul className="space-y-6 text-sm font-bold uppercase tracking-widest text-gray-500">
              {[
                { name: "Track Order", path: "/track-order" },
                { name: "Contact Us", path: "/contact" },
                { name: "Privacy Protocol", path: "/privacy" },
                { name: "Terms of Service", path: "/privacy" }
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="hover:text-brand-secondary transition-colors duration-300">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-3 space-y-8">
            <h4 className="font-serif font-black italic text-white mb-10 text-xl">Contact</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-secondary">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-gray-400 text-sm font-medium">1569 2nd Ave, NY 10028</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-secondary">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-gray-400 text-sm font-medium">+1 (212) 555-0198</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-secondary">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-gray-400 text-sm font-medium">concierge@bookishbliss.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
          <p>
            © {new Date().getFullYear()} Bookish Bliss. Crafted for the Distinguished Reader.
          </p>
          <div className="flex gap-8 items-center">
            <div className="flex gap-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3 opacity-20 grayscale hover:opacity-50 transition-all cursor-pointer" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4 opacity-20 grayscale hover:opacity-50 transition-all cursor-pointer" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-3 opacity-20 grayscale hover:opacity-50 transition-all cursor-pointer" />
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2 group cursor-pointer hover:text-white transition-colors">
              Built with <Heart className="w-3 h-3 text-brand-primary fill-brand-primary" /> in NY
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
