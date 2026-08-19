import { Link } from "react-router-dom";

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
      <div style={{ padding: "2rem 0", textAlign: "center" }}>
        <p style={{ color: "#6b7280" }}>Your pending cart is empty.</p>
        <Link to="/catalogue" style={{ color: "#2563eb", fontWeight: "bold" }}>
          Browse Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div>
      {cart.map((item) => {
        const itemId = item.id || item.docId;
        const itemTitle = item.title || item.name || "Untitled Book";
        return (
          <article
            key={itemId}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem",
              marginBottom: "0.5rem",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
          >
            <div>
              <h4 style={{ margin: "0 0 0.25rem 0" }}>{itemTitle}</h4>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
                {item.author ? item.author : ""} {item.genre ? `| ${item.genre}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeFromCart(itemId)}
              disabled={processing}
            >
              Remove
            </button>
          </article>
        );
      })}

      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          backgroundColor: "#f3f4f6",
          borderRadius: "8px",
          borderLeft: "4px solid #2563eb",
        }}
      >
        <p style={{ margin: 0, fontSize: "0.875rem", color: "#374151" }}>
          📌 <strong>Borrowing Policy:</strong> Books must be returned on or before their assigned due date (14 days from checkout — <strong>Due: {formattedDueDate}</strong>). Late returns incur daily fines.
        </p>
      </div>

      <div
        style={{
          marginTop: "1.25rem",
          display: "flex",
          gap: "1rem",
          justifyContent: "flex-end",
        }}
      >
        <button type="button" onClick={clearCart} disabled={processing}>
          Clear Cart
        </button>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={processing || isSuspended || hasFines}
          style={{ fontWeight: "bold" }}
        >
          {processing ? "Processing..." : "Confirm Checkout"}
        </button>
      </div>
    </div>
  );
}