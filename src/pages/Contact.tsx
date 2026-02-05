import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, Send, MessageCircle, Twitter, Facebook, Instagram, Youtube, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            toast.success("Correspondence received. Our concierges will reply shortly.");
            setLoading(false);
            (e.target as HTMLFormElement).reset();
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-brand-light font-sans flex flex-col selection:bg-brand-black selection:text-white">
            <Header />
            <main className="flex-1">
                {/* --- EDITORIAL HERO SECTION --- */}
                <section className="relative pt-40 pb-24 lg:pt-56 lg:pb-32 bg-[#FEF7EB] border-b border-brand-primary/10">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-[0.03] scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FEF7EB]" />

                    <div className="container mx-auto px-6 max-w-[1240px] relative z-10 text-center space-y-8 animate-slide-up">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-brand-primary/20 shadow-sm text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary mb-6 mx-auto">
                            <MessageCircle className="w-3.5 h-3.5" />
                            Book Store Concierge
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif font-black text-brand-black tracking-tighter leading-[0.9]">
                            Contact <span className="italic text-brand-secondary">Us</span>
                        </h1>

                        {/* Astra Style Breadcrumb */}
                        <div className="flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-brand-grey pt-6">
                            <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
                            <ChevronRight className="w-4 h-4 text-brand-primary/40" />
                            <span className="text-brand-black">Contact</span>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-6 py-24 -mt-20 relative z-20 max-w-[1240px]">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-start">
                        {/* Information Panel - Matching Astra Reference */}
                        <div className="lg:col-span-5 space-y-10 animate-fade-in">
                            <div className="bg-white rounded-[2rem] p-10 lg:p-14 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-white/50">
                                <h2 className="text-3xl font-serif font-black text-brand-black mb-10">Get In Touch</h2>

                                <div className="space-y-12">
                                    <div className="flex items-start gap-8 group">
                                        <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center text-brand-black shrink-0 transition-all group-hover:bg-brand-primary group-hover:text-white group-hover:-translate-y-1 shadow-sm">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-xs uppercase tracking-widest text-brand-black">Our Location</h3>
                                            <p className="text-brand-grey text-lg font-medium leading-relaxed">
                                                1569 2nd Ave, New York,<br />NY 10028, USA
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-8 group">
                                        <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center text-brand-black shrink-0 transition-all group-hover:bg-brand-primary group-hover:text-white group-hover:-translate-y-1 shadow-sm">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-xs uppercase tracking-widest text-brand-black">Call Us</h3>
                                            <p className="text-brand-grey text-lg font-medium leading-relaxed">+39 123 456 7890</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-8 group">
                                        <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center text-brand-black shrink-0 transition-all group-hover:bg-brand-primary group-hover:text-white group-hover:-translate-y-1 shadow-sm">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-xs uppercase tracking-widest text-brand-black">Email Us</h3>
                                            <p className="text-brand-grey text-lg font-medium leading-relaxed">info@example.com</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-16 pt-10 border-t border-brand-light flex flex-col gap-6">
                                    <h3 className="font-bold text-xs uppercase tracking-widest text-brand-black">Follow Us</h3>
                                    <div className="flex gap-4">
                                        {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                                            <a
                                                key={i}
                                                href="#"
                                                className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand-black hover:bg-brand-primary hover:text-white hover:-translate-y-1 transition-all"
                                            >
                                                <Icon className="w-5 h-5" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-7 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <div className="bg-white rounded-[2rem] p-10 lg:p-14 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-white/50">
                                <form onSubmit={handleSubmit} className="space-y-10">
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-serif font-black text-brand-black mb-3">Send a Message</h3>
                                        <p className="text-brand-grey text-base leading-relaxed">We typically respond within 24 hours.</p>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-brand-grey ml-1">Your Name</Label>
                                            <Input placeholder="Full Name" required className="h-16 px-6 rounded-2xl bg-brand-light border-0 focus:bg-white transition-all font-bold text-brand-black shadow-inner" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-brand-grey ml-1">Email Address</Label>
                                            <Input type="email" placeholder="Email Address" required className="h-16 px-6 rounded-2xl bg-brand-light border-0 focus:bg-white transition-all font-bold text-brand-black shadow-inner" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-brand-grey ml-1">Subject</Label>
                                        <Input placeholder="How can we help?" required className="h-16 px-6 rounded-2xl bg-brand-light border-0 focus:bg-white transition-all font-bold text-brand-black shadow-inner" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-brand-grey ml-1">Message</Label>
                                        <Textarea placeholder="Share your thoughts with us..." className="min-h-[220px] p-6 rounded-2xl bg-brand-light border-0 focus:bg-white transition-all text-base font-medium text-brand-black shadow-inner resize-none" required />
                                    </div>
                                    <Button type="submit" className="w-full h-16 bg-brand-black text-white font-black uppercase tracking-[0.2em] text-xs rounded-full shadow-2xl hover:bg-brand-secondary transition-all flex items-center justify-center gap-3 group" disabled={loading}>
                                        {loading ? "Transmitting..." : (
                                            <>Submit Inquiry <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Contact;
