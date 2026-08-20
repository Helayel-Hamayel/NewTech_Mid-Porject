import { NavLink, Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import "../../styles/common/Header.css";

export default function Header() {
  const { cartCount, activeLoans } = useCart();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const isStaffOrAdmin =
    currentUser?.role === "Staff" || currentUser?.role === "Admin";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const loanCount = activeLoans?.length || 0;

  return (
    <header className="site-header">
      <div className="header-container">
        <Link to="/catalogue" className="brand-logo">
          <span className="brand-icon">📚</span>
          <div className="brand-text">
            <span className="brand-title">Meridian</span>
            <span className="brand-subtitle">Public Library</span>
          </div>
        </Link>

        <nav className="header-nav">
          <NavLink
            to="/catalogue"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Catalogue
          </NavLink>

          <NavLink
            to="/bookshelf"
            className={({ isActive }) =>
              `nav-link bookshelf-link ${isActive ? "active" : ""}`
            }
          >
            My Bookshelf
            {cartCount > 0 && (
              <span className="badge badge-cart" title="Items in cart">
                {cartCount}
              </span>
            )}
            {loanCount > 0 && (
              <span className="badge badge-loans" title="Active loans">
                {loanCount}
              </span>
            )}
          </NavLink>

          {isStaffOrAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `nav-link admin-link ${isActive ? "active" : ""}`
              }
            >
              Admin Panel
            </NavLink>
          )}
        </nav>

        <div className="header-user-section">
          {currentUser ? (
            <div className="user-profile">
              <span className="user-greeting">
                Hello, <strong>{currentUser?.name || "Member"}</strong>
              </span>
              <button
                type="button"
                className="btn btn-logout"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/" className="btn btn-login">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
