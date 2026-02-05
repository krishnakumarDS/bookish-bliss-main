import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Book, ArrowLeft, Sparkles, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-brand-light relative overflow-hidden font-sans selection:bg-brand-black selection:text-white">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#FEF7EB]">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-secondary/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] opacity-[0.05]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-[600px] text-center px-10 animate-fade-in">
        <div className="w-24 h-24 rounded-[2.5rem] bg-brand-black flex items-center justify-center mb-12 shadow-2xl shadow-brand-black/20 transform rotate-12 hover:rotate-0 transition-all duration-1000 group">
          <Book className="w-10 h-10 text-brand-secondary group-hover:scale-110 transition-transform" />
        </div>

        <div className="relative mb-8">
          <h1 className="text-[12rem] font-serif font-black italic text-brand-black/5 select-none leading-none tracking-tighter">404</h1>
          <div className="absolute inset-0 flex items-center justify-center pt-8">
            <h2 className="text-5xl md:text-6xl font-serif font-black italic text-brand-black tracking-tighter">
              Lost <span className="text-brand-secondary">Volume</span>
            </h2>
          </div>
        </div>

        <div className="p-8 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-brand-primary/10 shadow-xl mb-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-700" />
          <p className="text-brand-grey font-medium leading-relaxed text-lg relative z-10">
            The narrative you are pursuing seems to have reached an unforeseen conclusion. The volume requested is not present in our curated repository.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center">
          <Link to="/" className="w-full sm:w-auto">
            <Button className="w-full h-16 px-12 bg-brand-black text-white rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:bg-brand-secondary hover:text-brand-black transition-all flex items-center gap-4 group active:scale-95">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
              Return to Catalog
            </Button>
          </Link>
          <Link to="/contact" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full h-16 px-8 border-brand-primary/20 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] text-brand-grey hover:bg-white hover:text-brand-black transition-all flex items-center gap-4 active:scale-95">
              <AlertCircle className="w-4 h-4" />
              Report Discrepancy
            </Button>
          </Link>
        </div>

        <div className="mt-20 flex flex-col items-center gap-4 text-brand-black/20">
          <div className="w-12 h-0.5 bg-brand-primary/10 rounded-full" />
          <p className="text-[9px] font-black uppercase tracking-[0.6em]">
            Bookish Bliss Archive Protocol
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
