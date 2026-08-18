import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../utils/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
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
    if (currentUser?.isSuspended) return;

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

  async function checkout() {
    if (currentUser?.isSuspended) {
      alert(
        "Your account is currently suspended. Please contact library staff.",
      );
      return { success: false, error: "Account suspended" };
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

      const loanRef = doc(db, "loans", loanDocId);
      await updateDoc(loanRef, {
        status: "Returned",
        returnDate: today,
      });

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
    addToCart,
    removeFromCart,
    clearCart,
    checkout,
    returnBook,
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