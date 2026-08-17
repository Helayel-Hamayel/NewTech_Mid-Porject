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

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [activeLoans, setActiveLoans] = useState([]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Fetch active loans for current user
  useEffect(() => {
    async function fetchUserLoans() {
      const userId = currentUser?.id || currentUser?.uid;
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
          (doc) => doc.data().bookId,
        );
        setActiveLoans(loanedBookIds);
      } catch (error) {
        console.error("Error fetching active user loans:", error);
      }
    }

    fetchUserLoans();
  }, [currentUser]);

  function addToCart(product) {
    setCart((currentCart) => {
      const exists = currentCart.some((item) => item.id === product.id);
      if (exists) return currentCart;
      return [...currentCart, product];
    });
  }

  function removeFromCart(productId) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId),
    );
  }

  function clearCart() {
    setCart([]);
  }

  async function checkout() {
    const userId = currentUser?.id || currentUser?.uid;
    if (!userId) {
      return { success: false, error: "You must be logged in to checkout!" };
    }

    if (cart.length === 0) {
      return { success: false, error: "Your cart is empty." };
    }

    try {
      const now = new Date();
      const borrowDate = now.toISOString().split("T")[0];

      // Due date set to 14 days from today
      const due = new Date();
      due.setDate(due.getDate() + 14);
      const dueDate = due.toISOString().split("T")[0];

      for (const item of cart) {
        const generatedLoanId = `LN-${now.getFullYear()}-${Math.floor(
          100 + Math.random() * 900,
        )}`;

        // 1. Add complete loan document matching database structure
        await addDoc(collection(db, "loans"), {
          bookId: item.id,
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

        // 2. Stringify item.id to resolve doc path error
        const bookRef = doc(db, "books", String(item.id));
        await updateDoc(bookRef, {
          availableCopies: increment(-1),
        });
      }

      // Update local state and clear cart
      setActiveLoans((prev) => [...prev, ...cart.map((item) => item.id)]);
      clearCart();

      return { success: true };
    } catch (error) {
      console.error("Checkout failed:", error);
      return { success: false, error: error.message };
    }
  }

  async function returnBook(loanDocId, bookId) {
    const userId = currentUser?.id || currentUser?.uid;
    if (!userId) return { success: false, error: "Not logged in" };

    try {
      const today = new Date().toISOString().split("T")[0];

      // 1. Update loan document status and set return date in Firestore
      const loanRef = doc(db, "loans", loanDocId);
      await updateDoc(loanRef, {
        status: "Returned",
        returnDate: today,
      });

      // 2. Increment availableCopies back by +1 in books collection
      const bookRef = doc(db, "books", String(bookId));
      await updateDoc(bookRef, {
        availableCopies: increment(1),
      });

      // 3. Update local state to remove book from activeLoans
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