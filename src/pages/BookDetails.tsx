import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useBook } from "@/hooks/useBooks";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart, ArrowLeft, Star, Truck, ShieldCheck, Info, Sparkles, BookOpen, Heart, Share2 } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/context/CurrencyContext";
import { Label } from "@/components/ui/label";

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { book, isLoading, error } = useBook(id || "");
  const { addToCart, isAddingToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [quantity, setQuantity] = useState("1");
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = async () => {
    if (book) {
      await addToCart(book.id, parseInt(quantity));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-light">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-8 group">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-brand-primary/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey animate-pulse">Retrieving Edition...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-light">
        <Header />
        <main className="flex-1 container mx-auto px-6 py-24 text-center flex flex-col items-center justify-center space-y-8">
          <div className="w-32 h-32 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center text-brand-grey transform -rotate-6">
            <BookOpen className="w-12 h-12 opacity-20" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-serif font-black text-brand-black italic">Archive Entry Missing</h1>
            <p className="text-brand-grey max-w-sm mx-auto text-lg font-medium leading-relaxed">The requested volume has been temporarily removed from our active repository.</p>
          </div>
          <Link to="/books">
            <Button className="rounded-full px-12 h-16 bg-brand-black text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-brand-secondary transition-all shadow-2xl hover:-translate-y-1">Return to Collection</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-light font-sans selection:bg-brand-black selection:text-white">
      <Header />

      <main className="flex-1">
        {/* --- DYNAMIC HEADER BACKGROUND --- */}
        <section className="relative overflow-hidden pt-40 pb-24 lg:pt-56 lg:pb-32 bg-[#FEF7EB]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] opacity-10" />
          <div className="container mx-auto px-6 relative z-10 max-w-[1240px]">
            <Link
              to="/books"
              className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey hover:text-brand-black transition-all mb-12 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-brand-primary/10 flex items-center justify-center shadow-sm group-hover:bg-brand-black group-hover:text-white group-hover:-translate-x-1 transition-all">
                <ArrowLeft className="w-4 h-4" />
              </div>
              Return to Repository
            </Link>
          </div>
        </section>

        <div className="container mx-auto px-6 -mt-32 relative z-20 pb-32 max-w-[1240px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

            {/* --- CINEMATIC BOOK DISPLAY --- */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-40 animate-slide-up">
              <div className="relative rounded-[3rem] overflow-hidden shadow-[0_60px_120px_-30px_rgba(0,0,0,0.2)] bg-white border border-brand-primary/5 p-3 group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-secondary/5 opacity-50" />
                <img
                  src={book.cover_image || "/placeholder.svg"}
                  alt={book.title}
                  className="relative w-full h-auto aspect-[3/4.6] object-cover rounded-[2.5rem] shadow-xl transition-transform duration-[2000ms] group-hover:scale-105"
                />

                {/* Status Badges */}
                <div className="absolute top-10 left-10 flex flex-col gap-3">
                  {book.category && (
                    <div className="px-5 py-2.5 bg-brand-black/90 backdrop-blur-xl rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-white shadow-2xl flex items-center gap-2 border border-white/10">
                      <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                      {book.category} Edition
                    </div>
                  )}
                  {book.category === "New Arrival" && (
                    <div className="px-5 py-2.5 bg-brand-secondary text-brand-black rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl border border-white/10 font-bold">
                      New Arrival
                    </div>
                  )}
                  {book.stock && book.stock < 10 && (
                    <div className="px-5 py-2.5 bg-brand-black text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl animate-pulse border border-white/10">
                      Limited Allocation
                    </div>
                  )}
                </div>
              </div>

              {/* Utility Actions */}
              <div className="flex gap-4 mt-8 px-4">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`flex-1 h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${isWishlisted ? 'bg-brand-secondary text-white' : 'bg-white text-brand-black hover:bg-brand-light'}`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  {isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
                <button className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-black hover:bg-brand-light transition-all shadow-lg">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* --- DETAILED MANUSCRIPT INFO --- */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-16 pt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-brand-primary">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] font-black tracking-[0.3em] text-brand-grey uppercase">Professional Evaluation 4.9/5</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black text-brand-black leading-[1] tracking-tighter italic">
                    {book.title}
                  </h1>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="w-16 h-0.5 bg-brand-primary/40 transition-all group-hover:w-24 group-hover:bg-brand-primary" />
                  <div className="flex items-center gap-3">
                    <span className="font-serif italic text-2xl text-brand-grey">by</span>
                    <span className="font-black text-brand-black uppercase tracking-widest text-xl">{book.author}</span>
                  </div>
                </div>
              </div>

              {/* Specification Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 py-12 border-y border-brand-primary/10">
                {[
                  { label: "Volume Length", value: `${book.pages || 448} Pages` },
                  { label: "Binding Type", value: "Hardcover (Premium)" },
                  { label: "Language", value: "English / UK" },
                  { label: "Registry Date", value: new Date(book.published_date || Date.now()).getFullYear() }
                ].map((stat, i) => (
                  <div key={i} className="space-y-3">
                    <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">{stat.label}</span>
                    <span className="block text-lg font-bold text-brand-black">{stat.value}</span>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-5 gap-16 items-start">
                {/* Synopsis Section */}
                <div className="lg:col-span-3 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-light rounded-xl flex items-center justify-center text-brand-black">
                      <Info className="w-5 h-5" />
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-brand-black">Publisher Note</h2>
                  </div>
                  <p className="text-brand-grey text-lg leading-[2] font-medium text-justify italic font-serif opacity-80 decoration-brand-primary/20 decoration-clone border-l-4 border-brand-primary/20 pl-8 py-2">
                    {book.description || "Every once in a decade, a manuscript emerges that transcends the boundaries of ordinary fiction. This exceptional volume has been hand-selected by our senior curators for its breathtaking prose and unparalleled narrative depth. A definitive edition for any serious collector's library."}
                  </p>
                </div>

                {/* Acquisition Panel */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-[3rem] p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-brand-primary/5 space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary" />

                    <div className="space-y-8 relative z-10">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey mb-4">Edition Value</p>
                        <div className="flex items-end gap-5">
                          <span className="text-5xl font-serif font-black text-brand-black leading-none">{formatPrice(book.price)}</span>
                          <span className="text-sm text-brand-grey line-through font-bold pb-1 opacity-40">{formatPrice(book.price * 1.25)}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey ml-1">Copy Count</Label>
                        <Select value={quantity} onValueChange={setQuantity}>
                          <SelectTrigger className="h-16 px-6 bg-brand-light border-0 rounded-2xl font-black text-brand-black focus:ring-brand-primary shadow-inner">
                            <SelectValue placeholder="1" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-brand-primary/10 rounded-2xl">
                            {[1, 2, 3, 4, 10].map(num => (
                              <SelectItem key={num} value={num.toString()} className="font-bold py-3 uppercase tracking-tighter">{num} {num === 1 ? 'Copy' : 'Copies'}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                        className="w-full h-16 bg-brand-black text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-brand-secondary transition-all shadow-2xl flex items-center justify-center gap-4 group/btn hover:-translate-y-1"
                      >
                        {isAddingToCart ? (
                          "Authorizing..."
                        ) : (
                          <>
                            Add to Cart <ShoppingCart className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                          </>
                        )}
                      </Button>

                      <div className="pt-8 border-t border-brand-light space-y-5">
                        <div className="flex items-center gap-4 text-[10px] font-black text-brand-grey uppercase tracking-[0.2em]">
                          <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand-secondary"><Truck className="w-5 h-5" /></div>
                          Priority Global Dispatch
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black text-brand-grey uppercase tracking-[0.2em]">
                          <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand-secondary"><ShieldCheck className="w-5 h-5" /></div>
                          Authenticated Edition
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookDetails;
