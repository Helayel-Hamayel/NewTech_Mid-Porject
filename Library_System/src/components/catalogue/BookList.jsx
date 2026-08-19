import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useCart } from "../../context/CartContext";
import BookWikiModal from "./BookWiki";

export default function BookList({ searchQuery, genre, startYear, endYear }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWikiBookId, setSelectedWikiBookId] = useState(null);

  // Consume cart, active loans, fines & suspension directly from CartContext
  const {
    addToCart,
    activeLoans = [],
    cart = [],
    unpaidFines = 0,
    isSuspended = false,
  } = useCart();

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

  if (loading) return <p>Loading catalogue...</p>;

  return (
    <div>
      {/* Account Suspended Warning Banner */}
      {isSuspended && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
            backgroundColor: "#fee2e2",
            border: "1px solid #f87171",
            color: "#991b1b",
            borderRadius: "6px",
          }}
        >
          <strong>Account Suspended:</strong> You cannot borrow books or add
          items to your cart while your account is suspended.
        </div>
      )}

      {/* Unpaid Fine Warning Banner */}
      {!isSuspended && hasFines && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
            backgroundColor: "#fef3c7",
            border: "1px solid #f59e0b",
            color: "#92400e",
            borderRadius: "6px",
          }}
        >
          <strong>Outstanding Fine (${unpaidFines.toFixed(2)}):</strong> You
          must{" "}
          <Link to="/cart" style={{ color: "#78350f", fontWeight: "bold" }}>
            pay your fines in your cart
          </Link>{" "}
          before borrowing new books.
        </div>
      )}

      {filteredBooks.length === 0 ? (
        <p>No books found matching your search criteria.</p>
      ) : (
        filteredBooks.map((book) => {
          const currentBookId = book.id || book.docId;

          const isBorrowed = activeLoans.some((loan) => {
            const loanId =
              typeof loan === "string" ? loan : loan.bookId || loan.id;
            return loanId === currentBookId && Boolean(currentBookId);
          });

          const isInCart = cart.some((item) => {
            const itemId = item.id || item.docId;
            return itemId === currentBookId && Boolean(currentBookId);
          });

          const isOutOfStock = Number(book.availableCopies) <= 0;

          // Block borrowing if suspended OR user has unpaid fines
          const isDisabled =
            isBorrowed || isInCart || isOutOfStock || isSuspended || hasFines;

          let buttonText = "Borrow Book";
          if (isSuspended) {
            buttonText = "Account Suspended";
          } else if (hasFines) {
            buttonText = "Pay Fine First";
          } else if (isBorrowed) {
            buttonText = "Already Borrowed";
          } else if (isInCart) {
            buttonText = "In Cart";
          } else if (isOutOfStock) {
            buttonText = "Out of Stock";
          }

          return (
            <article key={currentBookId}>
              <div
                onClick={() => setSelectedWikiBookId(currentBookId)}
                style={{ cursor: "pointer" }}
              >
                {book.image && (
                  <img
                    src={book.image}
                    alt={book.name}
                    width="120"
                    style={{ display: "block", marginBottom: "0.5rem" }}
                  />
                )}

                <h3>
                  {book.name} <span>({book.author})</span>
                </h3>
              </div>
              <p>
                Genre: {book.genre} | Year: {book.year}
              </p>
              <p>Available Copies: {book.availableCopies}</p>
              <button
                type="button"
                onClick={() => setSelectedWikiBookId(currentBookId)}
              >
                View Wiki Info
              </button>{" "}
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => addToCart({ ...book, id: currentBookId })}
              >
                {buttonText}
              </button>
              <hr />
            </article>
          );
        })
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