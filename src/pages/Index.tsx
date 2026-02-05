import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useBooks } from "@/hooks/useBooks";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Gift,
  Star,
  Sparkles,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import BookCard from "@/components/books/BookCard";

const Index = () => {
  const { featuredBooks } = useBooks();

  const bgBeige = "bg-brand-white/80 backdrop-blur-sm";
  const bgAccent = "bg-[#FEF7EB]";

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-brand-black selection:text-white ${bgBeige}`}>
      <Header />

      <main className="flex-1">
        {/* --- 1. HERO SECTION --- */}
        <section className="relative overflow-hidden pt-40 pb-20 lg:pt-56 lg:pb-32 bg-[#FEF7EB]">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] opacity-10" />
          <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute -bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-brand-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

          <div className="container mx-auto px-6 max-w-[1240px] relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <div className="flex-1 space-y-10 text-center lg:text-left">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-brand-primary/20 shadow-sm text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary mb-2 mx-auto lg:mx-0">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Premium Literary Boutique
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black text-brand-black leading-[1.05] tracking-tighter">
                  One Book Can <br />
                  <span className="italic text-brand-secondary">Change Your Story</span>
                </h1>
                <p className="text-lg lg:text-xl text-brand-grey font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Discover a sanctuary for readers. Our curated collections bring together the finest world-class literature and hidden gems.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 justify-center lg:justify-start">
                  <Link to="/books">
                    <Button className="h-16 px-12 bg-brand-black text-white rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-brand-secondary transition-all shadow-2xl hover:-translate-y-1 active:scale-95">
                      Explore Library
                    </Button>
                  </Link>
                  <div className="flex items-center gap-4 text-brand-grey">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-brand-light flex items-center justify-center overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Join 12k+ Readers</p>
                  </div>
                </div>
              </div>

              {/* Hero Books Exhibit */}
              <div className="flex-1 relative w-full flex justify-center lg:justify-end gap-6 perspective-2000">
                {featuredBooks && featuredBooks.length > 0 && featuredBooks.slice(0, 3).map((book, i) => (
                  <div key={book?.id || `hero-book-${i}`} className={`relative w-36 md:w-64 aspect-[2/3] transition-all duration-1000 transform-gpu hover:scale-105 hover:-translate-y-6 ${i === 1 ? '-translate-y-16 lg:-translate-y-24 z-20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]' : 'mt-12 opacity-80 z-10 shadow-2xl rotate-3'} ${i === 2 ? '-rotate-3 mt-16' : ''}`}>
                    <img
                      src={book?.cover_image || `https://images.unsplash.com/photo-154494795${i}-fa07a98d237f?w=600`}
                      alt={book?.title || "Book Edition"}
                      className="w-full h-full object-cover rounded-xl border border-white/20 shadow-inner"
                    />
                    <div className="absolute inset-0 rounded-xl ring-1 ring-black/10 transition-all group-hover:ring-black/20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- 2. THE CURATED COLLECTIVE (GRID) --- */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-6 max-w-[1240px]">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 text-center md:text-left">
              <div>
                <p className="text-brand-secondary text-[10px] font-black uppercase tracking-[0.4em] mb-4">Latest Arrivals</p>
                <h2 className="text-4xl md:text-6xl font-serif font-black text-brand-black leading-tight">New In The <span className="italic text-brand-secondary">Boutique</span></h2>
              </div>
              <Link to="/books">
                <Button variant="outline" className="h-14 px-10 rounded-full border-brand-primary/20 text-brand-black font-black uppercase tracking-widest text-xs hover:bg-brand-black hover:text-white transition-all transform hover:-translate-y-1">
                  Behold All Volumes <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">
              {featuredBooks.slice(0, 4).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>

        {/* --- 3. CATEGORIES MOSAIC --- */}
        <section className="py-24 lg:py-32 bg-brand-light">
          <div className="container mx-auto px-6 max-w-[1240px]">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-serif font-black text-brand-black mb-6">Choose By <span className="italic text-brand-secondary">Category</span></h2>
              <div className="w-24 h-1 bg-brand-primary mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto md:h-[650px]">
              <Link to="/books?category=Religion" className="md:col-span-8 group relative rounded-[3rem] overflow-hidden min-h-[400px] shadow-2xl">
                <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Library" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/20 to-transparent" />
                <div className="absolute bottom-16 left-16 text-white space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary rounded-full text-[9px] font-black uppercase tracking-widest">Top Collection</div>
                  <h3 className="font-serif text-4xl md:text-6xl font-black italic">Theology & Wisdom</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 group-hover:translate-x-4 transition-transform flex items-center gap-2">Enter The Archive <ArrowRight className="w-3 h-3" /></p>
                </div>
              </Link>
              <div className="md:col-span-4 grid grid-rows-2 gap-8">
                <Link to="/books?category=Young Adult" className="group relative rounded-[3rem] overflow-hidden shadow-xl">
                  <img src="https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=1000" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Reading" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute bottom-12 left-12 text-white">
                    <h3 className="font-serif text-3xl font-black italic">Young Adult</h3>
                  </div>
                </Link>
                <Link to="/books?category=Crime" className="group relative rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-xl">
                  <img src="https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=1000" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Books" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute bottom-12 left-12 text-white">
                    <h3 className="font-serif text-3xl font-black italic">Crime & Noir</h3>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* --- 4. THE PROTAGONIST (AUTHOR OF THE MONTH) --- */}
        <section className={`py-32 lg:py-48 ${bgBeige} relative`}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-20" />
          <div className="container mx-auto px-6 max-w-[1240px]">
            <div className="bg-white rounded-[4rem] p-12 md:p-24 shadow-[0_50px_150px_-30px_rgba(0,0,0,0.15)] relative overflow-hidden border border-brand-primary/5">
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
                <div className="w-full lg:w-[40%]">
                  <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden relative shadow-2xl rotate-2 transition-transform hover:rotate-0 duration-1000">
                    <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000" alt="Author" className="w-full h-full object-cover scale-105" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10" />
                  </div>
                </div>
                <div className="flex-1 space-y-12">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 text-brand-secondary font-black text-[10px] uppercase tracking-[0.4em]">Featured Author / Jan 2024</div>
                    <h3 className="text-6xl lg:text-7xl font-serif font-black text-brand-black leading-tight tracking-tighter">Melisa Miner</h3>
                    <p className="text-brand-grey text-xl leading-relaxed font-medium">
                      "I believe literature is the highest form of human empathy. Through pages, we don't just read stories; we inherit lives."
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-4">
                    {featuredBooks.slice(4, 6).map((book, i) => (
                      <Link key={i} to={`/book/${book.id}`} className="group flex gap-6 items-center bg-brand-light p-6 rounded-3xl border border-brand-primary/5 hover:bg-white hover:shadow-2xl hover:scale-105 transition-all outline-none">
                        <img src={book.cover_image || "/placeholder.svg"} className="w-20 h-28 object-cover rounded-xl shadow-xl transition-transform duration-500 group-hover:rotate-3" />
                        <div className="flex-1 min-w-0">
                          <p className="font-serif font-black text-xl text-brand-black line-clamp-1 mb-2 italic">{book.title}</p>
                          <div className="inline-flex items-center gap-2 text-[8px] font-black uppercase text-brand-secondary tracking-widest px-2 py-1 bg-white rounded-lg shadow-sm">Masterpiece</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Button className="h-16 px-12 bg-brand-primary hover:bg-brand-secondary text-white rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-brand-primary/30 transition-all transform hover:-translate-y-1">
                    Complete Bibliography
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 5. EDITOR'S SELECTION (Astra Reference Refinement) --- */}
        <section className="py-32 lg:py-48 bg-white relative overflow-hidden">
          <div className="container mx-auto px-6 max-w-[1240px] text-center">
            <div className="space-y-6 mb-24">
              <div className="mx-auto w-20 h-20 bg-[#FEF7EB] rounded-2xl flex items-center justify-center text-brand-secondary shadow-inner transform rotate-12 transition-transform hover:rotate-0 mb-8">
                <Sparkles className="w-10 h-10" />
              </div>
              <h2 className="text-5xl md:text-7xl font-serif font-black text-brand-black tracking-tighter">Editors <span className="italic text-brand-secondary">Choice</span></h2>
              <p className="text-brand-grey text-xs font-black uppercase tracking-[0.5em]">The pinnacle of our collection</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
              {featuredBooks.slice(0, 3).map((book, i) => (
                <div key={i} className="group relative text-left">
                  <Link to={`/book/${book.id}`} className="block">
                    <div className="relative aspect-[3/4.2] bg-brand-light rounded-[3rem] overflow-hidden mb-10 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.1)] transition-all duration-700 hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] hover:-translate-y-4">
                      <img src={book.cover_image || "/placeholder.svg"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

                      <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                      <div className="absolute top-8 left-8 bg-brand-black text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl z-20">
                        Top Pick No. 0{i + 1}
                      </div>

                      <div className="absolute inset-x-8 bottom-8 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 z-20">
                        <Button className="w-full h-14 bg-white text-brand-black hover:bg-brand-primary hover:text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-2xl">
                          View Edition
                        </Button>
                      </div>
                    </div>
                  </Link>
                  <div className="space-y-4">
                    <Link to={`/book/${book.id}`}>
                      <h3 className="text-4xl font-serif font-black text-brand-black italic tracking-tight leading-none group-hover:text-brand-secondary transition-colors line-clamp-2">{book.title}</h3>
                    </Link>
                    <div className="flex items-center gap-4">
                      <span className="h-0.5 w-12 bg-brand-primary/30" />
                      <p className="text-brand-grey font-black text-[10px] uppercase tracking-[0.3em]">{book.author}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- 6. TRUST ARCHITECTURE --- */}
        <section className={`${bgBeige} py-32 border-y border-brand-primary/10`}>
          <div className="container mx-auto px-6 max-w-[1240px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 text-center lg:text-left">
              {[
                { icon: Truck, title: "Global Courier", desc: "Complimentary for orders over $150" },
                { icon: ShieldCheck, title: "Secured Vault", desc: "Encrypted transaction protocols" },
                { icon: Gift, title: "Curated Gifting", desc: "Bespoke packaging available" },
                { icon: RotateCcw, title: "Simple Exchange", desc: "30-Day correspondence window" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col lg:flex-row items-center lg:items-start gap-6 group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-secondary shadow-xl transition-all group-hover:bg-brand-primary group-hover:text-white group-hover:-translate-y-2">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black uppercase tracking-[0.2em] text-xs text-brand-black">{item.title}</h4>
                    <p className="text-sm text-brand-grey font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- 7. PRESS & PARTNERSHIP --- */}
        <section className="py-32 lg:py-48 bg-white relative overflow-hidden">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-brand-primary/5 rounded-full blur-[100px]" />
          <div className="container mx-auto px-6 max-w-[1240px] relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-24 lg:gap-32">
              <div className="flex-1 flex justify-center lg:justify-end">
                <div className="relative group/typewriter">
                  <div className="absolute -inset-10 bg-brand-primary/10 rounded-full blur-[80px] group-hover/typewriter:bg-brand-primary/20 transition-all duration-1000" />
                  <img
                    src="/premium_vintage_typewriter.png"
                    alt="Premium Vintage Typewriter"
                    className="relative w-full max-w-lg rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] transition-all duration-1000 group-hover/typewriter:scale-[1.03] group-hover/typewriter:-rotate-2 group-hover/typewriter:shadow-[0_80px_150px_-30px_rgba(0,0,0,0.3)]"
                  />
                  {/* Floating Elements */}
                  <div className="absolute -top-6 -right-6 w-20 h-20 bg-white rounded-2xl shadow-2xl flex items-center justify-center animate-bounce duration-700">
                    <Sparkles className="w-10 h-10 text-brand-secondary" />
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-10 text-center lg:text-left">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-secondary">Author Hub</p>
                  <h2 className="text-5xl md:text-7xl font-serif font-black text-brand-black leading-tight tracking-tighter">
                    Write Your Next <br /><span className="italic text-brand-secondary">Legacy</span>
                  </h2>
                </div>
                <p className="text-brand-grey text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                  We empower visionary writers with the tools to self-publish. Join an elite collective of independent authors and see your work in print.
                </p>
                <div className="pt-4">
                  <Button className="h-16 px-14 bg-brand-black text-white rounded-full font-black uppercase tracking-[0.3em] text-[10px] hover:bg-brand-secondary shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] transition-all transform hover:-translate-y-1 active:scale-95">
                    Consult Our Editors
                  </Button>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-8 opacity-40 pt-10">
                  {/* Placeholder Logos */}
                  <span className="font-serif italic text-2xl font-black text-brand-black">Astra</span>
                  <span className="font-serif italic text-2xl font-black text-brand-black">Spectra</span>
                  <span className="font-serif italic text-2xl font-black text-brand-black">Elite</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 8. THE DISCOURSE (NEWSLETTER) --- */}
        <section className={`${bgBeige} py-32 lg:py-48`}>
          <div className="container mx-auto px-6 max-w-[1240px]">
            <div className="flex flex-col lg:flex-row items-center gap-24">
              <div className="flex-1 space-y-12 lg:pl-10">
                <div className="space-y-6">
                  <h2 className="text-5xl md:text-7xl font-serif font-black text-brand-black leading-[1.1] tracking-tighter">
                    Join The <br />
                    <span className="italic text-brand-secondary">Literary Circle</span>
                  </h2>
                  <p className="text-brand-grey text-lg font-medium max-w-md">Receive curated dispatches, exclusive first editions, and invitations to private literary salons.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 max-w-xl group">
                  <Input
                    placeholder="Correspondence Email"
                    className="h-18 bg-white border-brand-primary/10 rounded-2xl px-8 shadow-inner text-base font-bold text-brand-black focus-visible:ring-brand-primary"
                  />
                  <Button className="h-18 px-12 rounded-2xl bg-brand-primary hover:bg-brand-secondary text-white flex items-center justify-center shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 gap-3 font-black uppercase tracking-widest text-xs">
                    Subscribe <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-[10px] font-black text-brand-grey uppercase tracking-widest opacity-60">* No solicitation, only excellence. Unsubscribe at your leisure.</p>
              </div>
              <div className="flex-1 flex justify-center lg:justify-end lg:pr-10">
                <div className="relative w-full max-w-lg group">
                  <div className="absolute -inset-4 bg-brand-primary/10 rounded-[3rem] blur-2xl group-hover:bg-brand-primary/20 transition-all duration-700" />
                  <img
                    src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80"
                    className="w-full h-[500px] object-cover rounded-[3rem] shadow-2xl transform rotate-2 group-hover:rotate-0 transition-all duration-700"
                    alt="Stack of Fine Books"
                  />
                  <div className="absolute bottom-10 -right-10 bg-white p-8 rounded-[2rem] shadow-2xl space-y-2 hidden lg:block transform -rotate-3 group-hover:rotate-0 transition-all duration-700">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-secondary">Weekly Dispatch</p>
                    <p className="font-serif text-xl font-black text-brand-black italic">The Modern Classic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
