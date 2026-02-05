import { Link } from "react-router-dom";
import { ShoppingCart, Star, Heart, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useCurrency } from "@/context/CurrencyContext";
import { useState } from "react";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  price: number;
  cover_image: string | null;
  category: string | null;
}

interface BookCardProps {
  book: Book;
}

const BookCard = ({ book }: BookCardProps) => {
  const { addToCart, isAddingToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(book.id);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="group relative">
      <Link to={`/book/${book.id}`} className="block">
        <div className="relative bg-white rounded-[2.5rem] p-6 transition-all duration-700 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-brand-primary/5 group-hover:border-brand-primary/20 overflow-hidden">
          {/* Subtle Corner Ornament */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-bl-[5rem] -mr-12 -mt-12 transition-all duration-700 group-hover:scale-150 group-hover:bg-brand-primary/10" />

          {/* Cinematic Image Container */}
          <div className="relative aspect-[2/3] rounded-[1.5rem] overflow-hidden mb-8 shadow-2xl shadow-brand-black/10 transform-gpu transition-all duration-700 group-hover:scale-[1.03] group-hover:-rotate-1">
            <img
              src={book.cover_image || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600"}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-[2500ms] group-hover:scale-110"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Premium Category Badge */}
            {book.category && (
              <div className="absolute top-5 left-5 px-4 py-2 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-brand-black shadow-xl z-20">
                {book.category}
              </div>
            )}

            {/* NEW ARRIVAL BADGE (Astra Style) */}
            {(book.category === "New Arrival") && (
              <div className="absolute top-5 right-5 px-5 py-2.5 bg-brand-secondary text-brand-black rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl z-30 animate-pulse-slow">
                New Arrival
              </div>
            )}

            {/* Quick Actions Reveal */}
            <div className="absolute top-5 right-5 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-100 z-20">
              <button
                onClick={handleWishlist}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-xl backdrop-blur-md ${isWishlisted ? 'bg-brand-secondary text-white' : 'bg-white/90 text-brand-black hover:bg-brand-primary hover:text-white'}`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <div className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md text-brand-black flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all shadow-xl cursor-pointer">
                <ZoomIn className="w-4 h-4" />
              </div>
            </div>

            {/* Add to Cart - Narrative Action */}
            <div className="absolute inset-x-6 bottom-6 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-200 z-20">
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full h-12 rounded-2xl bg-brand-primary text-white font-black text-[10px] uppercase tracking-[0.2em] gap-3 hover:bg-brand-secondary transition-all shadow-2xl border-none active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                {isAddingToCart ? "Acquiring..." : "Acquire Volume"}
              </Button>
            </div>
          </div>

          {/* Detailed Metadata */}
          <div className="space-y-4 px-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-brand-primary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <span className="text-[10px] font-black tracking-widest text-brand-grey uppercase">Featured Edition</span>
            </div>

            <h3 className="font-serif text-2xl font-black text-brand-black line-clamp-2 leading-[1.2] group-hover:text-brand-secondary transition-colors italic">
              {book.title}
            </h3>

            <div className="flex items-center justify-between pt-4 border-t border-brand-light">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-grey mb-1">Author / Creator</span>
                <span className="text-sm font-bold text-brand-black truncate max-w-[140px] uppercase tracking-tight">{book.author}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-grey mb-1 block">Collector Value</span>
                <span className="text-xl font-serif font-black italic text-brand-black">
                  {formatPrice(book.price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BookCard;
