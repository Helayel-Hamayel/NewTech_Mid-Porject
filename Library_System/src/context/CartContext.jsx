import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(product) {
    setCart((currentCart) => {
      // Check if the item is already in the cart
      const exists = currentCart.some((item) => item.id === product.id);

      if (exists) {
        console.log("Only one copy of this item can be borrowed at a time!");
        return currentCart; // Return unchanged cart
      }

      // Add item if it's not in the cart yet
      return [...currentCart, product];
    });
  }

  function removeFromCart(productId) {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
  }

  const value = {
    cart,
    cartItems: cart,
    addToCart,
    removeFromCart,
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