import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export default function BookCard({ book, onOpenWiki }) {
  const {
    cart,
    activeLoans,
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
    <article className="product-card">
      <div
        className="product-image-container"
        onClick={() => onOpenWiki(currentBookId)}
        style={{ cursor: "pointer" }}
      >
        {book.image && (
          <img className="product-image" src={book.image} alt={book.name} />
        )}
      </div>

      <div className="product-content">
        <span className="product-category">{book.genre}</span>

        <h3
          onClick={() => onOpenWiki(currentBookId)}
          style={{ cursor: "pointer" }}
        >
          {book.name} {book.author && <span>({book.author})</span>}
        </h3>

        {book.description && (
          <p className="product-description">{book.description}</p>
        )}

        <p className="product-year">Published: {book.year}</p>

        {isSuspended && (
          <p
            style={{
              color: "#991b1b",
              fontSize: "0.85rem",
              margin: "0.5rem 0",
            }}
          >
            Account suspended.
          </p>
        )}

        {!isSuspended && hasFines && (
          <p
            style={{
              color: "#92400e",
              fontSize: "0.85rem",
              margin: "0.5rem 0",
            }}
          >
            Pay your fine in{" "}
            <Link to="/cart" style={{ fontWeight: "bold" }}>
              Cart
            </Link>{" "}
            to borrow.
          </p>
        )}

        <div className="product-footer">
          <p>
            Available Copies:{" "}
            <strong className="product-price">{book.availableCopies}</strong>
          </p>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button type="button" onClick={() => onOpenWiki(currentBookId)}>
              View Wiki Info
            </button>

            <button
              type="button"
              className="add-button"
              disabled={isDisabled}
              onClick={() => addToCart({ ...book, id: currentBookId })}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
