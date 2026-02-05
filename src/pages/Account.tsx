import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Package, CreditCard, Lock,
  MapPin, Headphones, ArrowLeft,
  ShieldCheck, Trash2, User, ChevronRight,
  BookOpen, Sparkles, LogOut, Settings,
  Globe, Phone, Mail, Hash,
  Zap, Fingerprint, Shield
} from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
}

type AccountView = 'dashboard' | 'profile' | 'addresses' | 'payment_methods';

const Account = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentView, setCurrentView] = useState<AccountView>('dashboard');
  const navigate = useNavigate();

  const [savedCards, setSavedCards] = useState([
    { id: 1, type: "Digital Platinum", last4: "8890", expiry: "08/30", holder: "Elite Collector" },
  ]);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "United States",
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
        if (profileData) {
          setProfile(profileData);
          setFormData({
            fullName: profileData.full_name || "",
            phone: profileData.phone || "",
            address: profileData.address || "",
            city: profileData.city || "",
            postalCode: profileData.postal_code || "",
            country: profileData.country || "United States",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 800); // Slight delay for cinematic feel
      }
    };
    fetchData();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      if (profile) {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: formData.fullName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            country: formData.country,
          })
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            full_name: formData.fullName,
            email: user.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            country: formData.country,
          });
        if (error) throw error;
      }
      toast.success("Identity configuration synchronized.");
      setCurrentView('dashboard');
    } catch (error: any) {
      toast.error("Operation failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const MenuItem = ({ icon: Icon, title, description, onClick }: any) => (
    <div
      onClick={onClick}
      className="group bg-white rounded-[2rem] p-8 cursor-pointer border border-brand-primary/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] hover:border-brand-primary/40 transition-all duration-500 flex items-center justify-between overflow-hidden relative active:scale-[0.98]"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-[5rem] group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
      <div className="flex items-center gap-8 relative z-10">
        <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center text-brand-black group-hover:bg-brand-black group-hover:text-brand-primary transition-all duration-500 shadow-inner">
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-2xl font-serif font-black italic text-brand-black mb-1.5 leading-tight">{title}</h3>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-grey/60 group-hover:text-brand-black transition-colors">{description}</p>
        </div>
      </div>
      <div className="w-10 h-10 rounded-full border border-brand-primary/10 flex items-center justify-center group-hover:bg-brand-black group-hover:text-white transition-all relative z-10 shadow-sm">
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-light">
        <Header />
        <main className="flex-1 container mx-auto px-6 py-24 flex items-center justify-center">
          <div className="flex flex-col items-center gap-10 group">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 border-[3px] border-brand-primary/10 rounded-full" />
              <div className="absolute inset-0 border-[3px] border-brand-primary border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-4 border-[1px] border-brand-secondary/20 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Fingerprint className="w-10 h-10 text-brand-primary/40 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-brand-grey animate-pulse">Authenticating Identity</span>
              <div className="h-0.5 w-12 bg-brand-primary/30 rounded-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF9] font-sans selection:bg-brand-black selection:text-white">
      <Header />

      <main className="flex-1 pb-32">
        {/* --- CINEMATIC PORTAL HEADER --- */}
        <section className="relative overflow-hidden pt-44 pb-24 lg:pt-60 lg:pb-40">
          <div className="absolute inset-0 bg-[#FEF7EB]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] opacity-[0.07] mix-blend-multiply" />

          {/* Ambient Glows */}
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] bg-brand-primary/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[50%] bg-brand-secondary/5 blur-[100px] rounded-full" />

          <div className="container mx-auto px-6 max-w-[1240px] relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-16">
              <div className="space-y-10 animate-fade-in">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/80 backdrop-blur-xl border border-brand-primary/20 shadow-sm">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-secondary"></span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-secondary">Authorized Access • Protocol Active</span>
                </div>

                <div className="space-y-6">
                  <h1 className="text-6xl md:text-9xl font-serif font-black text-brand-black tracking-tighter italic leading-[0.85] animate-slide-up">
                    Member <br /> <span className="text-brand-secondary">Portal</span>
                  </h1>
                  <p className="text-brand-grey/70 text-xl md:text-2xl font-medium max-w-xl leading-relaxed animate-fade-in opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]">
                    Curate your personal identity, acquisition history, and preferred communication lanes.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8 p-8 bg-white/60 backdrop-blur-2xl rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] border border-white/40 group animate-fade-in opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards]">
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl bg-brand-black flex items-center justify-center text-brand-primary shadow-2xl transition-transform duration-500 group-hover:rotate-6">
                    <User className="w-10 h-10" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center text-white border-4 border-white shadow-lg">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey/50 leading-none mb-2">Authenticated Identity</p>
                  <p className="text-3xl font-black text-brand-black italic font-serif leading-none tracking-tight">
                    {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "Collector"}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-bold text-brand-grey/40 uppercase tracking-widest">{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6 -mt-20 lg:-mt-28 relative z-20 max-w-[1240px]">
          <div className="bg-white rounded-[4rem] p-10 lg:p-20 shadow-[0_100px_180px_-40px_rgba(0,0,0,0.15)] border border-brand-primary/5 min-h-[750px]">
            {currentView === 'dashboard' ? (
              <div className="space-y-20 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                  <MenuItem
                    icon={Package}
                    title="Acquisitions"
                    description="Trace shipment history & archives"
                    onClick={() => navigate('/orders')}
                  />
                  <MenuItem
                    icon={Fingerprint}
                    title="Profile Dose"
                    description="Personal identity configuration"
                    onClick={() => setCurrentView('profile')}
                  />
                  <MenuItem
                    icon={MapPin}
                    title="Registry"
                    description="Coordinates for strategic delivery"
                    onClick={() => setCurrentView('addresses')}
                  />
                  <MenuItem
                    icon={CreditCard}
                    title="Financials"
                    description="Secure authorization instruments"
                    onClick={() => setCurrentView('payment_methods')}
                  />
                </div>

                <div className="pt-20 border-t border-brand-primary/10 flex flex-col items-center gap-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-1 bg-brand-light rounded-full" />
                    <span className="text-[9px] font-black tracking-[0.4em] text-brand-grey/30 uppercase">Enterprise Security Protocol</span>
                  </div>

                  <button
                    onClick={() => {
                      const promise = supabase.auth.signOut();
                      toast.promise(promise, {
                        loading: 'Terminating session...',
                        success: 'Session terminated. Farewell.',
                        error: 'Termination failed.',
                      });
                      promise.then(() => navigate('/'));
                    }}
                    className="group relative px-16 py-6 rounded-2xl bg-brand-light hover:bg-black text-brand-grey hover:text-white transition-all duration-500 flex items-center gap-5 text-[11px] font-black uppercase tracking-[0.4em] shadow-inner overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-red-500 translate-y-full group-hover:translate-y-[90%] transition-transform duration-500 opacity-20" />
                    <LogOut className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-500" />
                    <span className="relative z-10">Terminate Secure Session</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto animate-slide-up">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="inline-flex items-center gap-5 text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey hover:text-brand-black transition-all mb-20 group"
                >
                  <div className="w-14 h-14 rounded-2xl border border-brand-primary/10 flex items-center justify-center bg-white group-hover:bg-brand-black group-hover:text-white group-hover:-translate-x-2 transition-all shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)]">
                    <ArrowLeft className="w-6 h-6" />
                  </div>
                  Return to Portal Command
                </button>

                <div className="space-y-20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-brand-primary/10 pb-12">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-brand-light rounded-3xl flex items-center justify-center text-brand-secondary shadow-inner relative">
                        {currentView === 'profile' && <Fingerprint className="w-10 h-10" />}
                        {currentView === 'addresses' && <MapPin className="w-10 h-10" />}
                        {currentView === 'payment_methods' && <CreditCard className="w-10 h-10" />}
                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-brand-black rounded-xl flex items-center justify-center text-white scale-75">
                          <Settings className="w-4 h-4 animate-spin-slow" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-5xl md:text-6xl font-serif font-black italic text-brand-black tracking-tighter leading-none mb-3">
                          {currentView === 'profile' ? 'Identity Design' :
                            currentView === 'addresses' ? 'Tactical Coordinates' : 'Secure Instruments'}
                        </h2>
                        <div className="flex items-center gap-3">
                          <span className="h-1 w-8 bg-brand-primary rounded-full transition-all group-hover:w-16" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey/40">Configuration Registry</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-brand-light/50 border border-brand-primary/5">
                      <Shield className="w-4 h-4 text-brand-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-grey/60">Quantum Encrypted</span>
                    </div>
                  </div>

                  <div className="space-y-16">
                    {currentView === 'profile' && (
                      <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Mail className="w-3.5 h-3.5 text-brand-primary" />
                            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/60">Registry Email</Label>
                          </div>
                          <div className="h-20 px-10 flex items-center bg-brand-light rounded-3xl border border-brand-primary/5 text-xl font-bold text-brand-grey/30 font-mono shadow-inner overflow-hidden truncate">
                            {user?.email}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-3.5 h-3.5 text-brand-primary" />
                            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/60">Full Legal Name</Label>
                          </div>
                          <Input
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="h-20 px-10 rounded-3xl bg-brand-light border-0 focus:bg-white focus:ring-4 focus:ring-brand-primary/10 font-bold text-2xl shadow-inner transition-all duration-300 placeholder:text-brand-grey/10"
                            placeholder="EX: MELISA MINER"
                          />
                        </div>

                        <div className="space-y-4 md:col-span-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Phone className="w-3.5 h-3.5 text-brand-primary" />
                            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/60">Communication Terminal</Label>
                          </div>
                          <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="h-20 px-10 rounded-3xl bg-brand-light border-0 focus:bg-white focus:ring-4 focus:ring-brand-primary/10 font-bold text-2xl shadow-inner transition-all duration-300 placeholder:text-brand-grey/10"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>
                    )}

                    {currentView === 'addresses' && (
                      <div className="space-y-12">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/60">Street Residence / Office</Label>
                          </div>
                          <Input
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="h-20 px-10 rounded-3xl bg-brand-light border-0 focus:bg-white focus:ring-4 focus:ring-brand-primary/10 font-bold text-2xl shadow-inner transition-all duration-300 placeholder:text-brand-grey/10"
                            placeholder="123 ARCHIVE LANE"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Globe className="w-3.5 h-3.5 text-brand-primary" />
                              <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/60">City / Sector</Label>
                            </div>
                            <Input
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              className="h-20 px-10 rounded-3xl bg-brand-light border-0 focus:bg-white focus:ring-4 focus:ring-brand-primary/10 font-bold text-2xl shadow-inner transition-all duration-300 placeholder:text-brand-grey/10"
                              placeholder="NEW YORK"
                            />
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Hash className="w-3.5 h-3.5 text-brand-primary" />
                              <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/60">Postal Registry</Label>
                            </div>
                            <Input
                              name="postalCode"
                              value={formData.postalCode}
                              onChange={handleInputChange}
                              className="h-20 px-10 rounded-3xl bg-brand-light border-0 focus:bg-white focus:ring-4 focus:ring-brand-primary/10 font-bold text-2xl shadow-inner transition-all duration-300 placeholder:text-brand-grey/10"
                              placeholder="10001"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {currentView === 'payment_methods' && (
                      <div className="space-y-12">
                        {savedCards.map(card => (
                          <div key={card.id} className="flex items-center justify-between p-10 border border-brand-primary/10 rounded-[3rem] bg-brand-light group hover:bg-white hover:border-brand-primary/30 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-brand-primary/5 rounded-bl-[6rem] -mr-10 -mt-10 group-hover:scale-110 transition-transform" />

                            <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12 relative z-10">
                              <div className="w-28 h-20 bg-brand-black rounded-2xl flex items-center justify-center text-brand-primary shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3">
                                <CreditCard className="w-10 h-10" />
                              </div>
                              <div>
                                <p className="font-serif italic font-black text-3xl text-brand-black leading-tight mb-2 tracking-tight">{card.type} •••• {card.last4}</p>
                                <div className="flex items-center gap-4">
                                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey/40">Valid Thru {card.expiry}</p>
                                  <div className="h-1 w-1 rounded-full bg-brand-primary/30" />
                                  <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-green-100">Verified Active</span>
                                </div>
                              </div>
                            </div>
                            <div className="relative z-10">
                              <Button variant="ghost" size="icon" className="w-16 h-16 text-brand-grey/30 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all" onClick={() => toast.error("Self-termination of payment instruments disabled for demo.")}>
                                <Trash2 className="w-8 h-8" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full h-28 border-dashed border-[3px] border-brand-primary/20 rounded-[3rem] text-brand-grey/40 font-black uppercase tracking-[0.4em] text-[12px] hover:border-black hover:text-black hover:bg-brand-light/50 transition-all shadow-sm group">
                          <span className="flex items-center gap-4 group-hover:scale-105 transition-transform">
                            <Sparkles className="w-5 h-5 text-brand-primary" />
                            Integrate New Authorization Instrument
                          </span>
                        </Button>
                      </div>
                    )}

                    {(currentView === 'profile' || currentView === 'addresses') && (
                      <div className="flex flex-col sm:flex-row justify-end gap-6 pt-16 border-t border-brand-primary/10">
                        <Button
                          variant="ghost"
                          className="h-20 px-12 rounded-2xl font-black text-brand-grey/40 hover:text-brand-black uppercase tracking-[0.4em] text-[11px] transition-all"
                          onClick={() => setCurrentView('dashboard')}
                        >
                          Void Changes
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="h-20 px-16 bg-brand-black text-white rounded-3xl font-black uppercase tracking-[0.5em] text-[11px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:bg-brand-secondary hover:shadow-[0_25px_50px_-12px_rgba(255,172,47,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                        >
                          {isSaving ? "Synchronizing..." : "Synchronize Identity"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {currentView === 'profile' && (
                  <div className="mt-32 p-12 bg-red-50/50 rounded-[4rem] border border-red-100/50 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-bl-[8rem] -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700" />
                    <div className="space-y-5 text-center lg:text-left relative z-10 max-w-xl">
                      <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.3em] shadow-lg shadow-red-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Critical Danger Zone
                      </div>
                      <h3 className="text-4xl md:text-5xl font-serif font-black italic text-red-900 leading-none tracking-tighter">Terminate Archive <br /> Dossier</h3>
                      <p className="text-base font-medium text-red-700/60 leading-relaxed">
                        Irreversible termination of your archive identity, acquisition history, and all associated member privileges. This action cannot be rescinded.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      className="h-20 px-16 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] bg-red-600 hover:bg-red-700 transition-all transform hover:-translate-y-1 active:scale-95 relative z-10 border-4 border-white/20"
                      onClick={() => toast.error("Identity termination protocol locked for current session security.")}
                    >
                      Process Termination
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;

