import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  price: number;
  cover_image: string | null;
  category: string | null;
  isbn: string | null;
  pages: number | null;
  published_date: string | null;
  stock: number | null;
  is_featured: boolean | null;
  is_available: boolean | null;
  created_at: string;
  updated_at: string;
}

// Fallback Mock Data
const mockBooks: Book[] = [
  {
    id: "1",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    description: "The Silent Patient is a shocking psychological thriller of a woman's act of violence against her husband—and of the therapist obsessed with uncovering her motive.",
    price: 14.99,
    cover_image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
    category: "Mystery",
    isbn: "978-1250301697",
    pages: 336,
    published_date: "2019-02-05",
    stock: 12,
    is_featured: true,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    title: "Dune",
    author: "Frank Herbert",
    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange.",
    price: 19.99,
    cover_image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600&q=80",
    category: "Sci-Fi",
    isbn: "978-0441013593",
    pages: 412,
    published_date: "1965-08-01",
    stock: 5,
    is_featured: true,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "3",
    title: "Atomic Habits",
    author: "James Clear",
    description: "No matter your goals, Atomic Habits offers a proven framework for improving--every day.",
    price: 16.99,
    cover_image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
    category: "Non-Fiction",
    isbn: "978-0735211292",
    pages: 320,
    published_date: "2018-10-16",
    stock: 20,
    is_featured: true,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "4",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "The Great Gatsby, F. Scott Fitzgerald's third book, stands as the supreme achievement of his career.",
    price: 10.99,
    cover_image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&q=80",
    category: "Fiction",
    isbn: "978-0743273565",
    pages: 180,
    published_date: "1925-04-10",
    stock: 3,
    is_featured: false,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        // Fallback to mock data if DB is empty or fails
        console.warn("Supabase fetch failed or empty, using mock data.", error);
        setBooks(mockBooks);
        setFeaturedBooks(mockBooks.filter(book => book.is_featured));
      } else {
        setBooks(data);
        setFeaturedBooks(data.filter(book => book.is_featured));
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      // Fallback to mock data on catch
      setBooks(mockBooks);
      setFeaturedBooks(mockBooks.filter(book => book.is_featured));
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return { books, featuredBooks, isLoading, error, refetch: fetchBooks };
};

export const useBook = (id: string) => {
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setIsLoading(true);
        // Optimistically check mock data first if offline/testing
        const mockMatch = mockBooks.find(b => b.id === id);

        let dbData = null;
        let dbError = null;

        try {
          const result = await supabase
            .from("books")
            .select("*")
            .eq("id", id)
            .single();
          dbData = result.data;
          dbError = result.error;
        } catch (e) {
          console.warn("Check DB failed, defaulting to mock check");
        }

        if (dbData) {
          setBook(dbData);
        } else if (mockMatch) {
          // If DB fails or returns nothing, but we have a mock match, use it
          console.log("Using mock data for book details");
          setBook(mockMatch);
        } else {
          if (dbError) throw dbError;
          throw new Error("Book not found");
        }

      } catch (err) {
        console.error("Error fetching book:", err);
        setError(err as Error);

        // Final fallback attempt
        const fallback = mockBooks.find(b => b.id === id);
        if (fallback) setBook(fallback);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBook();
    }
  }, [id]);

  return { book, isLoading, error };
};
