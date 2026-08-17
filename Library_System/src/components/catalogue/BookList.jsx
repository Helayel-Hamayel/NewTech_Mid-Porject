import { useEffect, useState } from "react";
import { db } from "../../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useCart } from "../../context/CartContext";
import BookWikiModal from "./BookWiki";

export default function BookList({ searchQuery, genre, startYear, endYear }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWikiBookId, setSelectedWikiBookId] = useState(null);

  const { addToCart, activeLoans, cart } = useCart();

  useEffect(() => {
    async function fetchBooks() {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const bookData = querySnapshot.docs.map((doc) => ({
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

  // Filter books matching search criteria
  const filteredBooks = books.filter((book) => {
    const bookTitle = book.name || "";
    const bookAuthor = book.author || "";

    const titleMatch = bookTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const authorMatch = bookAuthor
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesQuery = titleMatch || authorMatch;

    const matchesGenre =
      genre === "all" || book.genre?.toLowerCase() === genre.toLowerCase();

    const bookYear = Number(book.year);
    const matchesStartYear = !startYear || bookYear >= Number(startYear);
    const matchesEndYear = !endYear || bookYear <= Number(endYear);

    return matchesQuery && matchesGenre && matchesStartYear && matchesEndYear;
  });

  // Find live reference of the selected book for the modal
  const selectedBook = books.find((b) => b.id === selectedWikiBookId);

  if (loading) return <p>Loading catalogue...</p>;

  return (
    <div>
      {filteredBooks.length === 0 ? (
        <p>No books found matching your search criteria.</p>
      ) : (
        filteredBooks.map((book) => {
          const isBorrowed = activeLoans.includes(book.id);
          const isInCart = cart.some((item) => item.id === book.id);
          const isOutOfStock = book.availableCopies <= 0;

          return (
            <article key={book.docId || book.id}>
              <div
                onClick={() => setSelectedWikiBookId(book.id)}
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
                onClick={() => setSelectedWikiBookId(book.id)}
              >
                View Wiki Info
              </button>{" "}
              <button
                type="button"
                disabled={isBorrowed || isInCart || isOutOfStock}
                onClick={() => addToCart(book)}
              >
                {isBorrowed
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
