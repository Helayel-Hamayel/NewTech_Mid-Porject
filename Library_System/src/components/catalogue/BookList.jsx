import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useCart } from "../../context/CartContext";
import BookCard from "./BookCard";
import BookWikiModal from "./BookWiki";
import "../../styles/catalogue/BookList.css";

export default function BookList({ searchQuery, genre, startYear, endYear }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWikiBookId, setSelectedWikiBookId] = useState(null);

  const { unpaidFines = 0, isSuspended = false } = useCart();
  const hasFines = unpaidFines > 0;

  useEffect(() => {
    async function fetchBooks() {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const bookData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          docId: doc.id,
          ...doc.data(),
        }));
        setBooks(bookData);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  const filteredBooks = books.filter((book) => {
    const bookTitle = book.name || "";
    const bookAuthor = book.author || "";

    const titleMatch = bookTitle
      .toLowerCase()
      .includes((searchQuery || "").toLowerCase());
    const authorMatch = bookAuthor
      .toLowerCase()
      .includes((searchQuery || "").toLowerCase());
    const matchesQuery = titleMatch || authorMatch;

    const matchesGenre =
      !genre ||
      genre === "all" ||
      book.genre?.toLowerCase() === genre.toLowerCase();

    const bookYear = Number(book.year);
    const matchesStartYear = !startYear || bookYear >= Number(startYear);
    const matchesEndYear = !endYear || bookYear <= Number(endYear);

    return matchesQuery && matchesGenre && matchesStartYear && matchesEndYear;
  });

  const selectedBook = books.find(
    (b) => b.id === selectedWikiBookId || b.docId === selectedWikiBookId,
  );

  if (loading) return <p className="book-list-loading">Loading catalogue...</p>;

  return (
    <div className="book-list-wrapper">
      {isSuspended && (
        <div className="book-list-alert alert-suspended">
          <strong>Account Suspended:</strong> You cannot borrow books or add
          items to your cart while your account is suspended.
        </div>
      )}

      {!isSuspended && hasFines && (
        <div className="book-list-alert alert-fines">
          <strong>Outstanding Fine (${unpaidFines.toFixed(2)}):</strong> You
          must{" "}
          <Link to="/cart" className="alert-fines-link">
            pay your fines in your cart
          </Link>{" "}
          before borrowing new books.
        </div>
      )}

      {filteredBooks.length === 0 ? (
        <p className="book-list-empty">
          No books found matching your search criteria.
        </p>
      ) : (
        <div className="book-list-grid">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id || book.docId}
              book={book}
              onOpenWiki={setSelectedWikiBookId}
            />
          ))}
        </div>
      )}

      {selectedBook && (
        <BookWikiModal
          book={selectedBook}
          onClose={() => setSelectedWikiBookId(null)}
        />
      )}
    </div>
  );
}
