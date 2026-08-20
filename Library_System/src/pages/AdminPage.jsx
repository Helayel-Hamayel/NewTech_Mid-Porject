import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import BookManagement from "../components/admin/BookManagement";
import UserManagement from "../components/admin/UserManagement";
import TrackLoans from "../components/admin/TrackLoans";
import "../styles/pages/AdminPage.css";

export default function AdminPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("books");

  const userRole = currentUser?.role || "Member";
  const hasAccess = userRole === "Staff" || userRole === "Admin";

  if (!hasAccess) {
    return (
      <div className="access-denied-container">
        <p>Access Denied: Staff or Admin permissions required.</p>
      </div>
    );
  }

  return (
    <section className="admin-page">
      <h2>Library Admin & Staff Panel</h2>

      <nav className="admin-subnav">
        <button
          type="button"
          className={`nav-btn ${activeTab === "books" ? "active" : ""}`}
          onClick={() => setActiveTab("books")}
        >
          Book Management
        </button>
        <button
          type="button"
          className={`nav-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          User Management
        </button>
        <button
          type="button"
          className={`nav-btn ${activeTab === "loans" ? "active" : ""}`}
          onClick={() => setActiveTab("loans")}
        >
          Track Customer Loans
        </button>
      </nav>

      <hr className="admin-divider" />

      <div className="admin-tab-content">
        {activeTab === "books" && <BookManagement />}
        {activeTab === "users" && <UserManagement currentUser={currentUser} />}
        {activeTab === "loans" && <TrackLoans />}
      </div>
    </section>
  );
}