import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function BookLoaning() {
  const { cart, removeFromCart, checkout } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Calculate return date 14 days from today
  const returnDate = new Date();
  returnDate.setDate(returnDate.getDate() + 14);
  const formattedReturnDate = returnDate.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    const result = await checkout();

    if (result.success) {
      navigate("/catalogue");
    } else {
      setError(result.error || "Failed to process loans.");
    }

    setLoading(false);
  };

  if (cart.length === 0) {
    return (
      <section>
        <h2>Your Cart</h2>
        <p>Your cart is currently empty.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Your Cart</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        {cart.map((item) => (
          <article
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              borderBottom: "1px solid #ccc",
              padding: "0.5rem 0",
            }}
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                style={{ width: "50px", height: "70px", objectFit: "cover" }}
              />
            )}

            <div style={{ flex: 1 }}>
              <h3>{item.name}</h3>
            </div>

            <button
              type="button"
              onClick={() => removeFromCart && removeFromCart(item.id)}
            >
              Remove
            </button>
          </article>
        ))}
      </div>

      <footer style={{ marginTop: "1rem" }}>
        <p>
          Note: before you loan, you must return them by{" "}
          <strong>{formattedReturnDate}</strong> failing to do so will issue
          late fines unless expanded the loan, or your account will be suspended
          til the books are returned.
        </p>
        <button type="button" onClick={handleCheckout} disabled={loading}>
          {loading ? "Processing Loan..." : "Checkout"}
        </button>
      </footer>
    </section>
  );
}