import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation(); // Gets current route path

  const isCartPage = location.pathname === "/cart";

  const { currentUser, logout } = useAuth();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/");
  };

  const handleCart = (e) => {
    e.preventDefault();
    navigate("/cart");
  };

  const handleHome = (e) => {
    e.preventDefault();
    navigate("/catalogue");
  };

  return (
    <header>
      <span>Meridian Library</span>
      -
      <span> {currentUser ? currentUser.name : "Guest"} </span>
      -
      {isCartPage ? (
        <button onClick={handleHome}>Head Home</button>
      ) : (
        <button onClick={handleCart}>{cartCount} Cart</button>
      )}

      <button onClick={handleLogout}>Sign Out</button>
    </header>
  );
}