import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext"; // 1. Import AuthContext

export default function BookWikiModal({ book, onClose }) {
  const { currentUser } = useAuth(); // 2. Access current logged-in user
  const { addToCart, activeLoans = [], cart = [] } = useCart();

  if (!book) return null;

  const isSuspended = Boolean(currentUser?.isSuspended); // 3. Evaluate suspension state

  const bookId = book.id || book.docId;
  const isBorrowed = Boolean(bookId && activeLoans.includes(bookId));
  const isInCart = Boolean(
    bookId && cart.some((item) => (item.id || item.docId) === bookId),
  );
  const isOutOfStock = Number(book.availableCopies) <= 0;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} style={{ float: "right" }}>
          Close
        </button>

        <h2>
          {book.name} <span>({book.author})</span>
        </h2>

        {book.image && (
          <img
            src={book.image}
            alt={book.name}
            width="150"
            style={{ display: "block", marginBottom: "1rem" }}
          />
        )}

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

        <hr />

        <h3>Overview / Wiki</h3>
        <p>{book.description || "No wiki entry available for this title."}</p>

        <hr />

        {/* 4. Disable button and update label when suspended */}
        <button
          type="button"
          disabled={isBorrowed || isInCart || isOutOfStock || isSuspended}
          onClick={() => addToCart({ ...book, id: bookId })}
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
      </div>
    </div>
  );
}