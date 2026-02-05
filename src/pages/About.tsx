import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { BookOpen, Users, Globe, ChevronRight, Sparkles, Quote, ArrowRight, ShieldCheck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => {
    return (
        <div className="min-h-screen bg-brand-light font-sans flex flex-col selection:bg-brand-black selection:text-white">
            <Header />
            <main className="flex-1">
                {/* --- EDITORIAL HERO SECTION --- */}
                <section className="relative pt-40 pb-24 lg:pt-56 lg:pb-32 bg-[#FEF7EB] border-b border-brand-primary/10">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-[0.03] scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FEF7EB]" />

                    <div className="container mx-auto px-6 max-w-[1240px] relative z-10 text-center space-y-8 animate-slide-up">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-brand-primary/20 shadow-sm text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary mb-6 mx-auto">
                            <Sparkles className="w-3.5 h-3.5" />
                            Premium Literary Boutique
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif font-black text-brand-black tracking-tighter leading-[0.9]">
                            About <span className="italic text-brand-secondary">Us</span>
                        </h1>

                        {/* Astra Style Breadcrumb */}
                        <div className="flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-brand-grey pt-6">
                            <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
                            <ChevronRight className="w-4 h-4 text-brand-primary/40" />
                            <span className="text-brand-black">About</span>
                        </div>
                    </div>
                </section>

                {/* --- OUR STORY SECTION (Astra Style) --- */}
                <section className="py-24 lg:py-40 px-6 bg-white">
                    <div className="container mx-auto max-w-[1240px]">
                        <div className="flex flex-col lg:flex-row gap-20 lg:gap-32 items-center">
                            <div className="flex-1 space-y-10 order-2 lg:order-1">
                                <div className="space-y-6 text-center lg:text-left">
                                    <p className="text-brand-secondary text-[10px] font-black uppercase tracking-[0.4em]">The Narrative</p>
                                    <h2 className="text-4xl md:text-6xl font-serif font-black text-brand-black leading-tight italic">Welcome to <br />Bookish Bliss</h2>
                                    <div className="w-20 h-1 bg-brand-primary mx-auto lg:mx-0 rounded-full" />
                                </div>
                                <div className="space-y-8 text-brand-grey text-lg leading-relaxed font-medium">
                                    <p>
                                        Natoque euismod a hic porta. Auctor, consequatur occaecati magna natus pretium ornare ornare penatibus. Tempor viverra, erat veritatis. Welcome to Bookish Bliss—where every volume tells a story beyond its pages.
                                    </p>
                                    <p>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem eget condimentum enim libero ultricies amet odio fringilla. Ut nibh morbi augue porta aliquet commodo. Fermentum auctor lacus eget in ut integer viverra.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-brand-light">
                                    <div className="space-y-2">
                                        <p className="text-3xl font-serif font-black italic text-brand-black">12k+</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-grey">Global Readers</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-3xl font-serif font-black italic text-brand-black">850+</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-grey">Curated Volumes</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 order-1 lg:order-2">
                                <div className="relative group">
                                    <div className="absolute -inset-4 bg-brand-secondary/10 rounded-[4rem] group-hover:inset-0 transition-all duration-700" />
                                    <div className="relative rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)]">
                                        <img
                                            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=1600"
                                            alt="Library Spiral"
                                            className="w-full aspect-[4/5] object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/40 to-transparent" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- THE MISSION PILLARS --- */}
                <section className="py-24 lg:py-40 px-6 bg-brand-light relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-[100px]" />
                    <div className="container mx-auto max-w-[1240px] relative z-10">
                        <div className="text-center mb-24 max-w-3xl mx-auto space-y-6">
                            <h2 className="text-4xl md:text-6xl font-serif font-black text-brand-black italic">Our Core <span className="text-brand-secondary">Principles</span></h2>
                            <p className="text-brand-grey font-medium text-lg">We are committed to delivering an unparalleled literary experience through three foundational pillars of excellence.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
                            {[
                                {
                                    icon: ShieldCheck,
                                    label: "Authenticity",
                                    desc: "We source only authentic, high-quality editions from globally recognized publishers and private collectors."
                                },
                                {
                                    icon: Heart,
                                    label: "Passion",
                                    desc: "Our curation process is driven by a deep love for literature and a commitment to storytelling that moves the soul."
                                },
                                {
                                    icon: Globe,
                                    label: "Community",
                                    desc: "We foster a global sanctuary for readers, bridging cultures through the shared language of imagination."
                                }
                            ].map((pillar, i) => (
                                <div key={i} className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-brand-black/5 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 group border border-brand-primary/5">
                                    <div className="w-20 h-20 bg-brand-light rounded-2xl flex items-center justify-center mb-10 text-brand-black group-hover:bg-brand-black group-hover:text-white transition-all duration-500 transform group-hover:-translate-y-2 group-hover:rotate-6">
                                        <pillar.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-serif font-black text-brand-black mb-4 italic leading-tight">{pillar.label}</h3>
                                    <p className="text-brand-grey leading-relaxed font-medium opacity-80">{pillar.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- CURATORIAL TEAM SECTION --- */}
                <section className="py-24 lg:py-40 px-6 bg-white overflow-hidden">
                    <div className="container mx-auto max-w-[1240px]">
                        <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-8">
                            <div className="space-y-4">
                                <p className="text-brand-secondary text-[10px] font-black uppercase tracking-[0.4em]">The Architects</p>
                                <h2 className="text-4xl md:text-6xl font-serif font-black text-brand-black italic leading-tight">Behind The <br /><span className="text-brand-secondary">Manuscripts</span></h2>
                            </div>
                            <p className="text-brand-grey max-w-md font-medium text-lg lg:text-right italic">"The curation of a library is the curation of a soul. We don't just sell books; we offer windows into other worlds."</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {/* Member 1 - Melisa Miner */}
                            <div className="group space-y-8">
                                <div className="relative rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl group-hover:-translate-y-4 transition-transform duration-700">
                                    <img
                                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200"
                                        alt="Melisa Miner"
                                        className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <div className="absolute bottom-10 left-10 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-brand-primary transition-colors cursor-pointer"><Users className="w-4 h-4" /></div>
                                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-brand-primary transition-colors cursor-pointer"><Quote className="w-4 h-4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 text-center">
                                    <h3 className="text-3xl font-serif font-black italic text-brand-black">Melisa Miner</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-secondary">Principal Archivist</p>
                                </div>
                            </div>

                            {/* Member 2 - Library Curator */}
                            <div className="group space-y-8 lg:mt-24">
                                <div className="relative rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl group-hover:-translate-y-4 transition-transform duration-700">
                                    <img
                                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1200"
                                        alt="Elena Volkov"
                                        className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <div className="absolute bottom-10 left-10 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-brand-primary transition-colors cursor-pointer"><Users className="w-4 h-4" /></div>
                                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-brand-primary transition-colors cursor-pointer"><Quote className="w-4 h-4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 text-center">
                                    <h3 className="text-3xl font-serif font-black italic text-brand-black">Elena Volkov</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-secondary">Head of Curation</p>
                                </div>
                            </div>

                            {/* Library Scene Exhibit */}
                            <div className="group space-y-8">
                                <div className="relative rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl group-hover:-translate-y-4 transition-transform duration-700">
                                    <img
                                        src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=1200"
                                        alt="The Archive"
                                        className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <div className="absolute inset-0 flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-500">
                                        <div className="w-20 h-20 rounded-full bg-brand-primary/90 backdrop-blur-md flex items-center justify-center shadow-2xl font-serif italic text-2xl font-black">Est.</div>
                                    </div>
                                </div>
                                <div className="space-y-2 text-center">
                                    <h3 className="text-3xl font-serif font-black italic text-brand-black">The Archive</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-secondary">Established 2014</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- ULTIMATE CALL TO ACTION --- */}
                <section className="py-32 lg:py-56 px-6 bg-[#FEF7EB] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] opacity-10" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />

                    <div className="container mx-auto max-w-5xl relative z-10 text-center space-y-12">
                        <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-brand-primary/20 shadow-sm text-[10px] font-black uppercase tracking-[0.4em] text-brand-secondary mx-auto">
                            <ArrowRight className="w-3.5 h-3.5" />
                            Next Steps
                        </div>
                        <h2 className="text-5xl md:text-8xl font-serif font-black text-brand-black tracking-tighter leading-[0.9] italic">Begin Your <br />New Chapter.</h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
                            <Link to="/books">
                                <Button className="h-20 px-16 rounded-full bg-brand-black text-white font-black uppercase tracking-[0.3em] text-[11px] hover:bg-brand-secondary shadow-2xl transition-all transform hover:-translate-y-2 active:scale-95">
                                    Explore Library
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button variant="outline" className="h-20 px-16 rounded-full border-brand-primary/20 text-brand-black font-black uppercase tracking-[0.3em] text-[11px] hover:bg-white shadow-xl transition-all transform hover:-translate-y-2">
                                    Direct Inquiry
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default About;

