import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { db } from "../utils/firebase";

import BookshelfHeader from "../components/bookshelf/BookshelfHeader";
import CartTab from "../components/bookshelf/CartTab";
import LoansTab from "../components/bookshelf/LoansTab";
import "../styles/pages/MyBookShelf.css";

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
        where("status", "==", "Active"),
      );
      const snapshot = await getDocs(q);
      const loanList = snapshot.docs.map((docSnap) => ({
        docId: docSnap.id,
        ...docSnap.data(),
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
        setMessage({
          type: "error",
          text: res.error || "Failed to check out books.",
        });
      } else {
        setMessage({
          type: "success",
          text: "Books checked out successfully!",
        });
        setActiveTab("loans");
        fetchUserLoans();
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to check out books.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReturn = async (loanDocId, bookId) => {
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
        setLoans((prev) =>
          prev.filter((item) => (item.docId || item.id) !== loanDocId),
        );
      } else {
        setMessage({
          type: "error",
          text: res?.error || "Failed to return book.",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to return book.",
      });
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
        setMessage({
          type: "error",
          text: res.error || "Failed to pay fines.",
        });
      } else {
        setMessage({ type: "success", text: "Fines paid successfully!" });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to pay fines.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const displayedLoans = loans.length > 0 ? loans : contextLoans || [];

  return (
    <div className="bookshelf-page">
      <BookshelfHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart ? cart.length : 0}
        loansCount={displayedLoans.length}
        unpaidFines={unpaidFines}
        isSuspended={isSuspended}
      />

      {message && (
        <div className={`status-banner banner-${message.type}`}>
          {message.text}
        </div>
      )}

      <main className="bookshelf-content">
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
          <section className="fines-section">
            {!hasFines ? (
              <div className="fine-card good-standing">
                <h3>Account Status: Good Standing</h3>
                <p>You have no outstanding balance or unpaid fines.</p>
              </div>
            ) : (
              <div className="fine-card balance-due">
                <h3>Outstanding Balance</h3>
                <p className="fine-amount">${unpaidFines.toFixed(2)}</p>
                <p className="fine-notice">
                  Pay your outstanding fines to clear restrictions and resume
                  borrowing.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePayFines}
                  disabled={processing}
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