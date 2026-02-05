import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
    return (
        <div className="min-h-screen bg-brand-light font-sans flex flex-col selection:bg-brand-black selection:text-white">
            <Header />

            {/* --- EDITORIAL HERO SECTION --- */}
            <section className="relative pt-40 pb-24 lg:pt-56 lg:pb-32 bg-[#FEF7EB] border-b border-brand-primary/10">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-[0.03] scale-110" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FEF7EB]" />

                <div className="container mx-auto px-6 max-w-[1240px] relative z-10 text-center space-y-8 animate-slide-up">
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-brand-primary/20 shadow-sm text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary mb-6 mx-auto">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Secure Protocol
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif font-black text-brand-black tracking-tighter leading-[0.9]">
                        Privacy <span className="italic text-brand-secondary">Manifest</span>
                    </h1>

                    {/* Astra Style Breadcrumb */}
                    <div className="flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-brand-grey pt-6">
                        <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 text-brand-primary/40" />
                        <span className="text-brand-black">Privacy</span>
                    </div>
                </div>
            </section>

            <main className="flex-1 py-16 -mt-10 relative z-20">
                <div className="container mx-auto px-6 max-w-[1240px]">
                    <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-gray-200/50 border border-gray-100">
                        <div className="prose prose-gray max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:font-medium prose-p:text-gray-500 prose-li:text-gray-500">

                            <h2 className="text-4xl font-serif font-black italic text-brand-black mb-8">1. Introduction</h2>
                            <p className="text-brand-grey text-lg font-medium leading-relaxed mb-12">
                                Welcome to Bookish Bliss. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.
                            </p>

                            <h2 className="text-4xl font-serif font-black italic text-brand-black mb-8 mt-16">2. Data Acquisition</h2>
                            <p className="text-brand-grey text-lg font-medium leading-relaxed mb-10">
                                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                            </p>
                            <ul className="grid md:grid-cols-2 gap-8 list-none pl-0 mt-8">
                                <li className="bg-white p-8 rounded-[2rem] border border-brand-primary/10 shadow-sm group hover:shadow-xl hover:border-brand-secondary transition-all">
                                    <strong className="block text-brand-black font-black uppercase tracking-widest text-[10px] mb-3 text-brand-secondary">Identity Data</strong>
                                    <p className="text-sm font-medium text-brand-grey leading-relaxed">Includes first name, last name, username or similar identifier.</p>
                                </li>
                                <li className="bg-white p-8 rounded-[2rem] border border-brand-primary/10 shadow-sm group hover:shadow-xl hover:border-brand-secondary transition-all">
                                    <strong className="block text-brand-black font-black uppercase tracking-widest text-[10px] mb-3 text-brand-secondary">Contact Data</strong>
                                    <p className="text-sm font-medium text-brand-grey leading-relaxed">Includes billing address, delivery address, email address and telephone numbers.</p>
                                </li>
                                <li className="bg-white p-8 rounded-[2rem] border border-brand-primary/10 shadow-sm group hover:shadow-xl hover:border-brand-secondary transition-all md:col-span-2">
                                    <strong className="block text-brand-black font-black uppercase tracking-widest text-[10px] mb-3 text-brand-secondary">Transaction Data</strong>
                                    <p className="text-sm font-medium text-brand-grey leading-relaxed">Includes details about payments to and from you and other details of products you have purchased from us.</p>
                                </li>
                            </ul>

                            <h2 className="text-4xl font-serif font-black italic text-brand-black mb-8 mt-16">3. Utilization of Intelligence</h2>
                            <p className="text-brand-grey text-lg font-medium leading-relaxed mb-10">
                                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                            </p>
                            <ul className="space-y-6 pl-0 list-none mt-8">
                                <li className="flex gap-6 items-start p-6 bg-brand-light rounded-2xl border border-brand-primary/5">
                                    <div className="mt-1 w-2.5 h-2.5 rounded-full bg-brand-secondary flex-shrink-0 shadow-[0_0_10px_rgba(255,172,47,0.4)]" />
                                    <span className="text-brand-black font-bold">Where we need to perform the contract we are about to enter into or have entered into with you.</span>
                                </li>
                                <li className="flex gap-6 items-start p-6 bg-brand-light rounded-2xl border border-brand-primary/5">
                                    <div className="mt-1 w-2.5 h-2.5 rounded-full bg-brand-secondary flex-shrink-0 shadow-[0_0_10px_rgba(255,172,47,0.4)]" />
                                    <span className="text-brand-black font-bold">Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</span>
                                </li>
                            </ul>

                            <div className="mt-20 pt-10 border-t border-brand-primary/10 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/40">Registry Protocol Last Revised</span>
                                <span className="text-xs font-black font-mono text-brand-black flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Privacy;
