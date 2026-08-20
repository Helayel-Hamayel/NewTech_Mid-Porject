import { useCart } from "../../context/CartContext";
import "../../styles/catalogue/BookWiki.css";

export default function BookWikiModal({ book, onClose }) {
  const {
    addToCart,
    activeLoans = [],
    cart = [],
    unpaidFines = 0,
    isSuspended = false,
  } = useCart();

  if (!book) return null;

  const bookId = book.id || book.docId;
  const isBorrowed = Boolean(
    bookId &&
    activeLoans.some((loan) => {
      const id = typeof loan === "string" ? loan : loan.bookId || loan.id;
      return id === bookId;
    }),
  );
  const isInCart = Boolean(
    bookId && cart.some((item) => (item.id || item.docId) === bookId),
  );
  const isOutOfStock = Number(book.availableCopies) <= 0;
  const hasFines = unpaidFines > 0;

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
    <div className="book-wiki-overlay" onClick={onClose}>
      <div className="book-wiki-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="book-wiki-close-btn">
          Close
        </button>

        <h2 className="book-wiki-title">
          {book.name}{" "}
          {book.author && (
            <span className="book-wiki-author">({book.author})</span>
          )}
        </h2>

        {book.image && (
          <img src={book.image} alt={book.name} className="book-wiki-image" />
        )}

        <div className="book-wiki-meta">
          <p>
            <strong>Library ID:</strong> {book.libraryId || bookId}
          </p>
          <p>
            <strong>Genre:</strong> {book.genre}
          </p>
          <p>
            <strong>Publication Year:</strong> {book.year}
          </p>
          <p>
            <strong>Available Inventory:</strong> {book.availableCopies} copies
          </p>
        </div>

        <hr className="book-wiki-divider" />

        <h3 className="book-wiki-subtitle">Overview / Wiki</h3>
        <p className="book-wiki-description">
          {book.description || "No wiki entry available for this title."}
        </p>

        <hr className="book-wiki-divider" />

        <button
          type="button"
          className="book-wiki-action-btn"
          disabled={isDisabled}
          onClick={() => addToCart({ ...book, id: bookId })}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
