
export default function BookshelfHeader({
  activeTab,
  setActiveTab,
  cartCount,
  loansCount,
  unpaidFines,
  isSuspended,
}) {
  const hasFines = unpaidFines > 0;

  return (
    <>
      <header className="bookshelf-header" style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "1.75rem" }}>My Bookshelf</h1>
        <p style={{ margin: 0, color: "#6b7280" }}>
          Manage your pending requests, active borrowings, and account status.
        </p>
      </header>

      <nav
        style={{
          display: "flex",
          gap: "0.5rem",
          padding: "0.5rem",
          backgroundColor: "#f3f4f6",
          borderRadius: "8px",
          marginBottom: "1.5rem",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("cart")}
          style={{
            flex: 1,
            padding: "0.6rem 1rem",
            border: "none",
            borderRadius: "6px",
            backgroundColor: activeTab === "cart" ? "#ffffff" : "transparent",
            boxShadow: activeTab === "cart" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            fontWeight: activeTab === "cart" ? "600" : "500",
            cursor: "pointer",
          }}
        >
          Pending Cart ({cartCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("loans")}
          style={{
            flex: 1,
            padding: "0.6rem 1rem",
            border: "none",
            borderRadius: "6px",
            backgroundColor: activeTab === "loans" ? "#ffffff" : "transparent",
            boxShadow: activeTab === "loans" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            fontWeight: activeTab === "loans" ? "600" : "500",
            cursor: "pointer",
          }}
        >
          Active Loans ({loansCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("fines")}
          style={{
            flex: 1,
            padding: "0.6rem 1rem",
            border: "none",
            borderRadius: "6px",
            backgroundColor: activeTab === "fines" ? "#ffffff" : "transparent",
            boxShadow: activeTab === "fines" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            fontWeight: activeTab === "fines" ? "600" : "500",
            color: hasFines ? "#b45309" : "inherit",
            cursor: "pointer",
          }}
        >
          Fines & Status {hasFines ? `($${unpaidFines.toFixed(2)})` : ""}
        </button>
      </nav>

      {isSuspended && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1.25rem",
            backgroundColor: "#fee2e2",
            border: "1px solid #f87171",
            color: "#991b1b",
            borderRadius: "6px",
          }}
        >
          <strong>Account Suspended:</strong> You cannot borrow items while suspended.
        </div>
      )}

      {!isSuspended && hasFines && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1.25rem",
            backgroundColor: "#fef3c7",
            border: "1px solid #f59e0b",
            color: "#92400e",
            borderRadius: "6px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            <strong>Outstanding Fine (${unpaidFines.toFixed(2)}):</strong> Clear balance to resume borrowing.
          </span>
          <button
            type="button"
            onClick={() => setActiveTab("fines")}
            style={{ padding: "0.3rem 0.75rem", cursor: "pointer" }}
          >
            Pay Fine
          </button>
        </div>
      )}
    </>
  );
}