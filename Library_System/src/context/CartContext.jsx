import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../utils/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  onSnapshot,
  updateDoc,
  increment,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || currentUser?.uid;

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [activeLoans, setActiveLoans] = useState([]);
  const [unpaidFines, setUnpaidFines] = useState(0);
  const [isSuspended, setIsSuspended] = useState(false);

  // REAL-TIME FIRESTORE LISTENER FOR USER FINES & SUSPENSION
  useEffect(() => {
    if (!userId) {
      setUnpaidFines(0);
      setIsSuspended(false);
      return;
    }

    const userRef = doc(db, "users", userId);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUnpaidFines(Number(data?.unpaidFines) || 0);
          setIsSuspended(Boolean(data?.isSuspended));
        }
      },
      (error) => {
        console.error("Error watching user profile:", error);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  // Clear cart whenever userId changes or user logs out
  useEffect(() => {
    setCart((prev) => {
      if (prev.length === 0) return prev;
      localStorage.removeItem("cart");
      return [];
    });
  }, [userId]);

  // Keep single localStorage key synced
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("cart");
    }
  }, [cart]);

  // Fetch active loans for current user
  useEffect(() => {
    async function fetchUserLoans() {
      if (!userId) {
        setActiveLoans([]);
        return;
      }

      try {
        const q = query(
          collection(db, "loans"),
          where("memberId", "==", userId),
          where("status", "==", "Active"),
        );

        const querySnapshot = await getDocs(q);
        const loanedBookIds = querySnapshot.docs.map(
          (docSnap) => docSnap.data().bookId,
        );
        setActiveLoans(loanedBookIds);
      } catch (error) {
        console.error("Error fetching active user loans:", error);
      }
    }

    fetchUserLoans();
  }, [userId]);

  function addToCart(product) {
    if (isSuspended || unpaidFines > 0) return;

    const safeId = product.id || product.docId;
    if (!safeId) return;

    setCart((currentCart) => {
      const exists = currentCart.some(
        (item) => (item.id || item.docId) === safeId,
      );
      if (exists) return currentCart;
      return [...currentCart, { ...product, id: safeId, docId: safeId }];
    });
  }

  function removeFromCart(productId) {
    setCart((currentCart) =>
      currentCart.filter((item) => (item.id || item.docId) !== productId),
    );
  }

  function clearCart() {
    setCart([]);
    localStorage.removeItem("cart");
  }

  async function payFine() {
    if (!userId) return { success: false, error: "Not logged in" };
    try {
      await updateDoc(doc(db, "users", userId), { unpaidFines: 0 });
      return { success: true };
    } catch (err) {
      console.error("Failed to pay fine:", err);
      return { success: false, error: err.message };
    }
  }

  async function checkout() {
    if (isSuspended) {
      return {
        success: false,
        error:
          "Your account is currently suspended. Please contact library staff.",
      };
    }

    if (unpaidFines > 0) {
      return {
        success: false,
        error: `You have an outstanding fine of $${unpaidFines}. Please pay your fine before loaning books.`,
      };
    }

    if (!userId) {
      return { success: false, error: "You must be logged in to checkout!" };
    }

    if (cart.length === 0) {
      return { success: false, error: "Your cart is empty." };
    }

    try {
      const now = new Date();
      const borrowDate = now.toISOString().split("T")[0];

      const due = new Date();
      due.setDate(due.getDate() + 14);
      const dueDate = due.toISOString().split("T")[0];

      for (const item of cart) {
        const targetBookId = item.id || item.docId;
        const generatedLoanId = `LN-${now.getFullYear()}-${Math.floor(
          100 + Math.random() * 900,
        )}`;

        await addDoc(collection(db, "loans"), {
          bookId: targetBookId,
          bookTitle: item.name || item.title || "Untitled",
          borrowDate: borrowDate,
          dueDate: dueDate,
          fineAmount: 0,
          loanId: generatedLoanId,
          memberId: userId,
          memberName: currentUser?.name || currentUser?.displayName || "Member",
          returnDate: null,
          status: "Active",
        });

        const bookRef = doc(db, "books", String(targetBookId));
        await updateDoc(bookRef, {
          availableCopies: increment(-1),
        });
      }

      setActiveLoans((prev) => [
        ...prev,
        ...cart.map((item) => item.id || item.docId),
      ]);
      clearCart();

      return { success: true };
    } catch (error) {
      console.error("Checkout failed:", error);
      return { success: false, error: error.message };
    }
  }

  async function returnBook(loanDocId, bookId) {
    if (!userId) return { success: false, error: "Not logged in" };

    try {
      const today = new Date().toISOString().split("T")[0];

      // 1. Reference and update loan status
      const loanRef = doc(db, "loans", loanDocId);
      await updateDoc(loanRef, {
        status: "Returned",
        returnDate: today,
      });

      // 2. Reference and update book inventory (FIXED: removed nested doc wrapper)
      const bookRef = doc(db, "books", String(bookId));
      await updateDoc(bookRef, {
        availableCopies: increment(1),
      });

      setActiveLoans((prev) => prev.filter((id) => id !== bookId));

      return { success: true };
    } catch (error) {
      console.error("Return failed:", error);
      return { success: false, error: error.message };
    }
  }

  const value = {
    cart,
    cartItems: cart,
    activeLoans,
    unpaidFines,
    isSuspended,
    addToCart,
    removeFromCart,
    clearCart,
    checkout,
    returnBook,
    payFines: payFine,
    cartCount: cart.length,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export default CartProvider;