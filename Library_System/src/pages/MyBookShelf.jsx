import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { db } from "../utils/firebase";

import BookshelfHeader from "../components/bookshelf/BookshelfHeader";
import CartTab from "../components/bookshelf/CartTab";
import LoansTab from "../components/bookshelf/LoansTab";

export default function MyBookshelf() {
  const { currentUser } = useAuth();
  const {
    cart,
    removeFromCart,
    clearCart,
    activeLoans: contextLoans,
    returnBook,
    checkout,
    unpaidFines,
    payFine,
    payFines,
    isSuspended,
  } = useCart();

  const [activeTab, setActiveTab] = useState("cart");
  const [loans, setLoans] = useState([]);
  const [loansLoading, setLoansLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);

  const userId = currentUser?.id || currentUser?.uid;
  const handlePay = payFines || payFine;
  const hasFines = unpaidFines > 0;

  const fetchUserLoans = async () => {
    if (!userId) return;
    try {
      setLoansLoading(true);
      const q = query(
        collection(db, "loans"),
        where("memberId", "==", userId),
        where("status", "==", "Active")
      );
      const snapshot = await getDocs(q);
      const loanList = snapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      }));
      setLoans(loanList);
    } catch (error) {
      console.error("Error fetching active loans:", error);
    } finally {
      setLoansLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "loans") {
      fetchUserLoans();
    }
  }, [userId, activeTab]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    setMessage(null);

    try {
      const res = await checkout();
      if (res && res.success === false) {
        setMessage({ type: "error", text: res.error || "Failed to check out books." });
      } else {
        setMessage({ type: "success", text: "Books checked out successfully!" });
        setActiveTab("loans");
        fetchUserLoans();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to check out books." });
    } finally {
      setProcessing(false);
    }
  };

  const handleReturn = async (loanDocId, bookId) => {
    // Prevent execution if either parameter is missing or invalid
    if (!loanDocId || !bookId) {
      setMessage({
        type: "error",
        text: "Cannot process return: Missing loan or book reference ID.",
      });
      return;
    }

    setProcessing(true);
    setMessage(null);

    try {
      const res = await returnBook(loanDocId, bookId);
      if (res && res.success) {
        setMessage({ type: "success", text: "Book returned successfully!" });
        setLoans((prev) => prev.filter((item) => (item.docId || item.id) !== loanDocId));
      } else {
        setMessage({ type: "error", text: res?.error || "Failed to return book." });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to return book." });
    } finally {
      setProcessing(false);
    }
  };

  const handlePayFines = async () => {
    setProcessing(true);
    setMessage(null);

    try {
      if (!handlePay) throw new Error("Payment function not available.");
      const res = await handlePay();
      if (res && res.success === false) {
        setMessage({ type: "error", text: res.error || "Failed to pay fines." });
      } else {
        setMessage({ type: "success", text: "Fines paid successfully!" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to pay fines." });
    } finally {
      setProcessing(false);
    }
  };

  const displayedLoans = loans.length > 0 ? loans : contextLoans || [];

  return (
    <div className="bookshelf-container" style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.5rem" }}>
      
      <BookshelfHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart ? cart.length : 0}
        loansCount={displayedLoans.length}
        unpaidFines={unpaidFines}
        isSuspended={isSuspended}
      />

      {message && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1.25rem",
            backgroundColor: message.type === "success" ? "#d1fae5" : "#fee2e2",
            color: message.type === "success" ? "#065f46" : "#991b1b",
            borderRadius: "6px",
          }}
        >
          {message.text}
        </div>
      )}

      <main className="bookshelf-content" style={{ minHeight: "300px" }}>
        {activeTab === "cart" && (
          <CartTab
            cart={cart}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            handleCheckout={handleCheckout}
            processing={processing}
            isSuspended={isSuspended}
            hasFines={hasFines}
          />
        )}

        {activeTab === "loans" && (
          <LoansTab
            loans={displayedLoans}
            loading={loansLoading}
            handleReturn={handleReturn}
            processing={processing}
          />
        )}

        {activeTab === "fines" && (
          <section>
            {!hasFines ? (
              <div
                style={{
                  padding: "1.5rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  backgroundColor: "#f9fafb",
                }}
              >
                <h3 style={{ margin: "0 0 0.5rem 0" }}>Account Status: Good Standing</h3>
                <p style={{ margin: 0, color: "#4b5563" }}>
                  You have no outstanding balance or unpaid fines.
                </p>
              </div>
            ) : (
              <div
                style={{
                  padding: "1.5rem",
                  border: "1px solid #f59e0b",
                  borderRadius: "8px",
                  backgroundColor: "#fffbeb",
                }}
              >
                <h3 style={{ margin: "0 0 0.5rem 0" }}>Outstanding Balance</h3>
                <p style={{ fontSize: "1.75rem", fontWeight: "bold", margin: "0.5rem 0" }}>
                  ${unpaidFines.toFixed(2)}
                </p>
                <p style={{ color: "#78350f", marginBottom: "1.25rem" }}>
                  Pay your outstanding fines to clear restrictions and resume borrowing.
                </p>
                <button
                  type="button"
                  onClick={handlePayFines}
                  disabled={processing}
                  style={{ fontWeight: "bold", cursor: "pointer" }}
                >
                  {processing ? "Processing Payment..." : "Pay Balance Now"}
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}