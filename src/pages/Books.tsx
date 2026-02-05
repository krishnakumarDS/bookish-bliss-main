import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BookCard from "@/components/books/BookCard";
import { useBooks } from "@/hooks/useBooks";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link, useLocation } from "react-router-dom";
import { Search, SlidersHorizontal, ChevronRight, LayoutGrid, List, Filter } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCurrency } from "@/context/CurrencyContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Books = () => {
  const { books, isLoading } = useBooks();
  const { currentCurrency, convertPrice } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortOption, setSortOption] = useState("default");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const isNewArrivalPath = location.pathname === "/new-arrivals";
    const isBestSellerPath = location.pathname === "/best-sellers";
    const isEditorsPickPath = location.pathname === "/editors-pick";

    if (isNewArrivalPath) {
      setSelectedCategory("New Arrival");
      setCurrentPage(1);
    } else if (isBestSellerPath) {
      setSelectedCategory("Best Seller");
      setCurrentPage(1);
    } else if (isEditorsPickPath) {
      setSelectedCategory("Editors Pick");
      setCurrentPage(1);
    } else if (categoryParam) {
      setSelectedCategory(categoryParam);
      setCurrentPage(1);
    } else {
      setSelectedCategory(null);
    }
  }, [searchParams, location.pathname]);

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    if (category) {
      setSearchParams({ category });
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("category");
      setSearchParams(newParams);
    }
  };

  const categories = useMemo(() =>
    [...new Set(books.map(book => book.category).filter(Boolean))],
    [books]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach(book => {
      if (book.category) {
        counts[book.category] = (counts[book.category] || 0) + 1;
      }
    });
    return counts;
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesCategory = true;
      if (selectedCategory === "New Arrival") {
        // Simple heuristic: created in last 30 days OR has category "New Arrival"
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        matchesCategory = book.category === "New Arrival" || new Date(book.created_at) > monthAgo;
      } else if (selectedCategory === "Best Seller") {
        // Heuristic: stock running low or has category "Best Seller"
        matchesCategory = book.category === "Best Seller" || (book.stock !== null && book.stock < 10);
      } else if (selectedCategory === "Editors Pick") {
        matchesCategory = book.category === "Editors Pick" || book.is_featured === true;
      } else if (selectedCategory) {
        matchesCategory = book.category === selectedCategory;
      }

      const convertedPrice = convertPrice(book.price);
      const matchesPrice = convertedPrice >= priceRange[0] && convertedPrice <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    }).sort((a, b) => {
      const priceA = convertPrice(a.price);
      const priceB = convertPrice(b.price);
      if (sortOption === "price_asc") return priceA - priceB;
      if (sortOption === "price_desc") return priceB - priceA;
      return 0;
    });
  }, [books, searchQuery, selectedCategory, priceRange, sortOption, convertPrice]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  useEffect(() => {
    const newMax = Math.ceil(100 * currentCurrency.rate);
    setPriceRange([0, newMax]);
  }, [currentCurrency]);

  const maxPriceSlider = Math.ceil(200 * currentCurrency.rate);

  const SidebarContent = () => (
    <div className="space-y-16">
      {/* Search Widget */}
      <div className="group">
        <h3 className="font-serif text-xl font-bold text-brand-black mb-6 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-brand-secondary rounded-full" />
          Search
        </h3>
        <div className="relative">
          <Input
            placeholder="Search our archive..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-12 pl-0 pr-10 rounded-none border-0 border-b border-brand-primary/10 focus-visible:ring-0 focus-visible:border-brand-secondary placeholder:text-brand-grey/40 bg-transparent text-brand-black font-medium transition-all"
          />
          <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-black group-hover:text-brand-secondary transition-colors" />
        </div>
      </div>

      {/* Categories Widget - Astra Style */}
      <div className="group">
        <h3 className="font-serif text-xl font-bold text-brand-black mb-8 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-brand-secondary rounded-full" />
          Categories
        </h3>
        <div className="flex flex-col gap-5">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`flex justify-between items-center text-sm tracking-wide transition-all group/item ${selectedCategory === null
              ? 'text-brand-secondary font-bold italic translate-x-3'
              : 'text-brand-grey hover:text-brand-black hover:translate-x-2'
              }`}
          >
            <span>All Books</span>
            <span className={`text-[10px] font-black opacity-40 group-hover/item:opacity-100 transition-opacity`}>
              ({books.length})
            </span>
          </button>

          {/* Collection Filters */}
          {["New Arrival", "Best Seller", "Editors Pick"].map((collection) => (
            <button
              key={collection}
              onClick={() => handleCategoryChange(collection)}
              className={`flex justify-between items-center text-sm tracking-wide transition-all group/item ${selectedCategory === collection
                ? 'text-brand-secondary font-bold italic translate-x-3'
                : 'text-brand-grey hover:text-brand-black hover:translate-x-2 font-medium'
                }`}
            >
              <span>{collection}</span>
              <span className={`text-[10px] font-black opacity-40 group-hover/item:opacity-100 transition-opacity`}>
                ({books.filter(b => {
                  if (collection === "New Arrival") {
                    const monthAgo = new Date();
                    monthAgo.setDate(monthAgo.getDate() - 30);
                    return b.category === collection || new Date(b.created_at) > monthAgo;
                  }
                  if (collection === "Best Seller") return b.category === collection || (b.stock !== null && b.stock < 10);
                  if (collection === "Editors Pick") return b.category === collection || b.is_featured;
                  return b.category === collection;
                }).length})
              </span>
            </button>
          ))}

          <div className="h-px bg-brand-primary/5 my-2" />

          {categories.filter(c => !["New Arrival", "Best Seller", "Editors Pick"].includes(c || "")).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`flex justify-between items-center text-sm tracking-wide transition-all group/item ${selectedCategory === cat
                ? 'text-brand-secondary font-bold italic translate-x-3'
                : 'text-brand-grey hover:text-brand-black hover:translate-x-2'
                }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] font-black opacity-40 group-hover/item:opacity-100 transition-opacity`}>
                ({categoryCounts[cat] || 0})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter Widget */}
      <div className="group">
        <h3 className="font-serif text-xl font-bold text-brand-black mb-10 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-brand-secondary rounded-full" />
          Refine by Price
        </h3>
        <div className="px-1">
          <Slider
            defaultValue={[0, maxPriceSlider]}
            max={maxPriceSlider}
            step={1}
            value={priceRange}
            onValueChange={setPriceRange}
            className="py-4"
          />
        </div>
        <div className="mt-8 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-grey">
            Price: <span className="text-brand-black font-bold">
              {new Intl.NumberFormat(undefined, { style: 'currency', currency: currentCurrency.code, maximumFractionDigits: 0 }).format(priceRange[0])} — {new Intl.NumberFormat(undefined, { style: 'currency', currency: currentCurrency.code, maximumFractionDigits: 0 }).format(priceRange[1])}
            </span>
          </p>
          <button
            onClick={() => setCurrentPage(1)}
            className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-black border-b-2 border-brand-secondary hover:text-brand-secondary transition-colors pb-1"
          >
            Refine
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F8] font-sans selection:bg-brand-black selection:text-white">
      <Header />

      <main className="flex-1">
        {/* --- HIGH-END HERO SECTION --- */}
        <section className="relative overflow-hidden pt-40 pb-24 lg:pt-56 lg:pb-32 bg-[#FEF7EB] border-b border-brand-primary/10">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-[0.03] scale-110" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FEF7EB]" />

          <div className="container mx-auto px-6 max-w-[1240px] relative z-10 text-center space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-brand-primary/20 shadow-sm text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary mb-6 mx-auto">
              <Filter className="w-3.5 h-3.5" />
              Curation Archive
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif font-black text-brand-black tracking-tighter leading-[0.9]">
              {selectedCategory ? (
                <>{selectedCategory} <span className="italic text-brand-secondary">Archive</span></>
              ) : (
                <>All <span className="italic text-brand-secondary">Books</span></>
              )}
            </h1>

            {/* Astra Style Breadcrumb */}
            <div className="flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-brand-grey pt-6">
              <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4 text-brand-primary/40" />
              <span className="text-brand-black">Collection</span>
              {selectedCategory && (
                <>
                  <ChevronRight className="w-4 h-4 text-brand-primary/40" />
                  <span className="text-brand-secondary italic">{selectedCategory}</span>
                </>
              )}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6 py-20 lg:py-28 max-w-[1240px]">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">

            {/* SYMBOLIC SIDEBAR */}
            <aside className="hidden lg:block w-80 shrink-0 sticky top-40 animate-fade-in">
              <SidebarContent />
            </aside>

            {/* MAIN ARCHIVE GRID */}
            <div className="flex-1 w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>

              {/* ADVANCED TOOLBAR */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-16 pb-8 border-b border-brand-black/5 gap-8">
                <div className="flex items-center gap-6">
                  <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-brand-primary/10">
                    <button className="p-2 rounded-lg bg-brand-light text-brand-black"><LayoutGrid className="w-4 h-4" /></button>
                    <button className="p-2 rounded-lg text-brand-grey hover:text-brand-black transition-colors"><List className="w-4 h-4" /></button>
                  </div>
                  <p className="text-brand-grey text-xs font-black uppercase tracking-widest hidden sm:block">
                    Showing <span className="text-brand-black">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredBooks.length)}–{Math.min(currentPage * itemsPerPage, filteredBooks.length)}</span> of {filteredBooks.length} Editions
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="lg:hidden">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="h-12 w-12 rounded-xl border-brand-primary/20 bg-white shadow-sm flex items-center justify-center p-0">
                          <SlidersHorizontal className="w-5 h-5 text-brand-black" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-[320px] bg-brand-light overflow-y-auto">
                        <SheetHeader className="mb-10 text-left">
                          <SheetTitle className="font-serif text-3xl font-black">Refine Results</SheetTitle>
                        </SheetHeader>
                        <SidebarContent />
                      </SheetContent>
                    </Sheet>
                  </div>

                  <div className="relative flex-1 sm:flex-initial">
                    <Select value={sortOption} onValueChange={setSortOption}>
                      <SelectTrigger className="h-12 w-full sm:w-[240px] px-6 rounded-xl border-brand-primary/10 bg-white shadow-sm focus:ring-brand-primary text-xs font-black uppercase tracking-widest text-brand-black">
                        <SelectValue placeholder="Standard Sorting" />
                      </SelectTrigger>
                      <SelectContent align="end" className="rounded-xl border-brand-primary/10">
                        <SelectItem value="default" className="text-xs font-bold py-3 uppercase tracking-widest">Standard Sorting</SelectItem>
                        <SelectItem value="price_asc" className="text-xs font-bold py-3 uppercase tracking-widest">Ascending Value</SelectItem>
                        <SelectItem value="price_desc" className="text-xs font-bold py-3 uppercase tracking-widest">Descending Value</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* DYNAMIC GRID LOADING */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="animate-pulse space-y-6">
                      <div className="aspect-[2/3] bg-brand-primary/5 rounded-[2rem]" />
                      <div className="h-6 bg-brand-primary/5 rounded-full w-3/4" />
                      <div className="h-4 bg-brand-primary/5 rounded-full w-1/4" />
                    </div>
                  ))}
                </div>
              ) : filteredBooks.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14 mb-20">
                    {currentBooks.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>

                  {/* PREMIUM PAGINATION */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                          key={number}
                          onClick={() => {
                            setCurrentPage(number);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[11px] font-black transition-all transform hover:scale-110 active:scale-95 ${currentPage === number
                            ? "bg-brand-black text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]"
                            : "bg-white border border-brand-primary/10 text-brand-grey hover:border-brand-primary hover:text-brand-black hover:shadow-xl"
                            }`}
                        >
                          {String(number).padStart(2, '0')}
                        </button>
                      ))}
                      {currentPage < totalPages && (
                        <button
                          onClick={() => {
                            setCurrentPage(p => p + 1);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-brand-primary/10 text-brand-grey hover:border-brand-primary hover:text-brand-black hover:shadow-xl transition-all transform hover:scale-110"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="py-32 bg-white rounded-[3rem] text-center space-y-8 shadow-sm border border-brand-primary/10">
                  <div className="w-24 h-24 bg-brand-light rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-10 h-10 text-brand-primary/40" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-serif text-3xl font-black text-brand-black">No Matches Found</h3>
                    <p className="text-brand-grey text-lg font-medium">Refining your search or adjusting the price range might help.</p>
                  </div>
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      handleCategoryChange(null);
                      setPriceRange([0, maxPriceSlider]);
                    }}
                    className="h-12 px-8 bg-brand-black text-white rounded-full font-black uppercase tracking-widest text-[9px] hover:bg-brand-secondary transition-all shadow-xl"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Books;
