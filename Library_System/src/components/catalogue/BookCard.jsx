import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "../../styles/catalogue/BookCard.css";

export default function BookCard({ book, onOpenWiki }) {
  const {
    cart = [],
    activeLoans = [],
    unpaidFines = 0,
    isSuspended = false,
    addToCart,
  } = useCart();

  const currentBookId = book.id || book.docId;

  const isBorrowed = activeLoans.some((loan) => {
    const loanId = typeof loan === "string" ? loan : loan.bookId || loan.id;
    return loanId === currentBookId && Boolean(currentBookId);
  });

  const isInCart = cart.some((item) => {
    const itemId = item.id || item.docId;
    return itemId === currentBookId && Boolean(currentBookId);
  });

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
    <article className="book-card">
      <div>
        <div
          className="book-card-image-container"
          onClick={() => onOpenWiki(currentBookId)}
        >
          {book.image && (
            <img className="book-card-image" src={book.image} alt={book.name} />
          )}
        </div>

        <div className="book-card-content">
          <span className="book-card-category">{book.genre}</span>

          <h3
            className="book-card-title"
            onClick={() => onOpenWiki(currentBookId)}
          >
            {book.name}{" "}
            {book.author && (
              <span className="book-card-author">({book.author})</span>
            )}
          </h3>

          {book.description && (
            <p className="book-card-description">{book.description}</p>
          )}

          <p className="book-card-year">Published: {book.year}</p>

          {isSuspended && (
            <p className="book-card-warning font-medium">Account suspended.</p>
          )}

          {!isSuspended && hasFines && (
            <p className="book-card-fine">
              Pay your fine in{" "}
              <Link to="/bookshelf" className="book-card-fine-link">
                Bookhshelf
              </Link>{" "}
              to borrow.
            </p>
          )}
        </div>
      </div>

      <div className="book-card-footer">
        <p className="book-card-copies">
          Available Copies:{" "}
          <strong className="book-card-copies-count">
            {book.availableCopies}
          </strong>
        </p>

        <div className="book-card-actions">
          <button
            type="button"
            className="book-card-btn-secondary"
            onClick={() => onOpenWiki(currentBookId)}
          >
            View Wiki Info
          </button>

          <button
            type="button"
            className="book-card-btn-primary"
            disabled={isDisabled}
            onClick={() => addToCart({ ...book, id: currentBookId })}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </article>
  );
}
