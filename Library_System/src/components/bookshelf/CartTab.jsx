import { Link } from "react-router-dom";
import "../../styles/bookshelf/CartTab.css";

export default function CartTab({
  cart,
  removeFromCart,
  clearCart,
  handleCheckout,
  processing,
  isSuspended,
  hasFines,
}) {
  const estimatedDueDate = new Date();
  estimatedDueDate.setDate(estimatedDueDate.getDate() + 14);
  const formattedDueDate = estimatedDueDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (!cart || cart.length === 0) {
    return (
      <div className="cart-tab-empty">
        <p className="cart-tab-empty-text">Your pending cart is empty.</p>
        <Link to="/catalogue" className="cart-tab-empty-link">
          Browse Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-tab-container">
      {cart.map((item) => {
        const itemId = item.id || item.docId;
        const itemTitle = item.title || item.name || "Untitled Book";
        return (
          <article key={itemId} className="cart-item-card">
            <div>
              <h4 className="cart-item-title">{itemTitle}</h4>
              <p className="cart-item-meta">
                {item.author ? item.author : ""}{" "}
                {item.genre ? `| ${item.genre}` : ""}
              </p>
            </div>
            <button
              type="button"
              className="cart-item-remove-btn"
              onClick={() => removeFromCart(itemId)}
              disabled={processing}
            >
              Remove
            </button>
          </article>
        );
      })}

      <div className="cart-policy-box">
        <p className="cart-policy-text">
          📌 <strong>Borrowing Policy:</strong> Books must be returned on or
          before their assigned due date (14 days from checkout —{" "}
          <strong>Due: {formattedDueDate}</strong>). Late returns incur daily
          fines.
        </p>
      </div>

      <div className="cart-actions-row">
        <button
          type="button"
          className="cart-btn-secondary"
          onClick={clearCart}
          disabled={processing}
        >
          Clear Cart
        </button>
        <button
          type="button"
          className="cart-btn-primary"
          onClick={handleCheckout}
          disabled={processing || isSuspended || hasFines}
        >
          {processing ? "Processing..." : "Confirm Checkout"}
        </button>
      </div>
    </div>
  );
}
