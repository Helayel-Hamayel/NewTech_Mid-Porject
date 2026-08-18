import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import BookManagement from "../components/admin/BookManagementPage";
import UserManagement from "../components/admin/UserManagement";
import TrackLoans from "../components/admin/TrackLoans";

export default function AdminPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("books"); // 'books', 'users', 'loans'

  const userRole = currentUser?.role || "Member";
  const hasAccess = userRole === "Staff" || userRole === "Admin";

  if (!hasAccess)
    return <p>Access Denied: Staff or Admin permissions required.</p>;

  return (
    <section>
      <h2>Library Admin & Staff Panel</h2>

      {/* Secondary Header / Sub-Nav */}
      <nav style={{ marginBottom: "1.5rem", display: "flex", gap: "10px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("books")}
          style={{ fontWeight: activeTab === "books" ? "bold" : "normal" }}
        >
          Book Management
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          style={{ fontWeight: activeTab === "users" ? "bold" : "normal" }}
        >
          User Management
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("loans")}
          style={{ fontWeight: activeTab === "loans" ? "bold" : "normal" }}
        >
          Track Customer Loans
        </button>
      </nav>

      <hr />

      {/* Active Tab View Rendering */}
      {activeTab === "books" && <BookManagement />}
      {activeTab === "users" && <UserManagement currentUser={currentUser} />}
      {activeTab === "loans" && <TrackLoans />}
    </section>
  );
}
