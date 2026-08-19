import { NavLink, Link, useMatch, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { cartCount } = useCart();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // React Router route matchers replace manual useLocation string checks
  const isCartPage = useMatch("/cart");
  const isLoansPage = useMatch("/my-loans");

  const isStaffOrAdmin =
    currentUser?.role === "Staff" || currentUser?.role === "Admin";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header>
      <span>Meridian Library - {currentUser?.name || "Guest"}</span>

      <nav style={{ display: "inline-flex", gap: "10px", margin: "0 1rem" }}>
        {isStaffOrAdmin && <NavLink to="/admin">Admin Panel</NavLink>}

        {isCartPage ? (
          <NavLink to="/catalogue">Catalogue</NavLink>
        ) : (
          <Link to="/cart">{cartCount || 0} Cart</Link>
        )}
      </nav>

      <button type="button" onClick={handleLogout}>
        Sign Out
      </button>
    </header>
  );
}
