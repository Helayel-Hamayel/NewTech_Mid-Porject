import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function MyLoansPage() {
  const { currentUser } = useAuth();
  const { returnBook } = useCart();

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState("");

  const userId = currentUser?.id || currentUser?.uid;

  const fetchUserLoans = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
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
      console.error("Error fetching loans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserLoans = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
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
        console.error("Error fetching loans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLoans();
  }, [userId]);

  const handleReturn = async (loanDocId, bookId) => {
    setActionLoadingId(loanDocId);
    setMessage("");

    const result = await returnBook(loanDocId, bookId);

    if (result.success) {
      setMessage("Book returned successfully!");
      setLoans((prev) => prev.filter((item) => item.docId !== loanDocId));
    } else {
      setMessage(`Error: ${result.error}`);
    }

    setActionLoadingId(null);
  };

  if (loading) return <p>Loading your active loans...</p>;

  return (
    <section>
      <h2>My Active Loans</h2>

      {message && <p>{message}</p>}

      {loans.length === 0 ? (
        <p>You have no active loans right now.</p>
      ) : (
        <div>
          {loans.map((loan) => (
            <article key={loan.docId}>
              <h3>{loan.bookTitle}</h3>
              <p>Loan ID: {loan.loanId || "N/A"}</p>
              <p>Borrowed Date: {loan.borrowDate}</p>
              <p>Due Date: {loan.dueDate}</p>

              <button
                type="button"
                disabled={actionLoadingId === loan.docId}
                onClick={() => handleReturn(loan.docId, loan.bookId)}
              >
                {actionLoadingId === loan.docId ? "Returning..." : "Return Book"}
              </button>
              <hr />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}