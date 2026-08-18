import { useEffect, useState } from "react";
import { db } from "../../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext"; // 1. Import AuthContext
import BookWikiModal from "./BookWiki";

export default function BookList({ searchQuery, genre, startYear, endYear }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWikiBookId, setSelectedWikiBookId] = useState(null);

  const { currentUser } = useAuth(); // 2. Extract currentUser
  const { addToCart, activeLoans = [], cart = [] } = useCart();

  // 3. Evaluate suspension status safely
  const isSuspended = Boolean(currentUser?.isSuspended);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const bookData = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Primary ID for React checks
          docId: doc.id, // Backup docId
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

  // Filter books matching search criteria
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

  // Find live reference using id or docId fallback
  const selectedBook = books.find(
    (b) => b.id === selectedWikiBookId || b.docId === selectedWikiBookId,
  );

  if (loading) return <p>Loading catalogue...</p>;

  return (
    <div>
      {/* 4. Display notice if user is suspended */}
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

      {filteredBooks.length === 0 ? (
        <p>No books found matching your search criteria.</p>
      ) : (
        filteredBooks.map((book) => {
          const currentBookId = book.id || book.docId;

          // Safe status evaluation
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
              {/* 5. Disable button and update text for suspended users */}
              <button
                type="button"
                disabled={isBorrowed || isInCart || isOutOfStock || isSuspended}
                onClick={() => addToCart({ ...book, id: currentBookId })}
              >
                {isSuspended
                  ? "Account Suspended"
                  : isBorrowed
                    ? "Already Borrowed"
                    : isInCart
                      ? "In Cart"
                      : isOutOfStock
                        ? "Out of Stock"
                        : "Borrow Book"}
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