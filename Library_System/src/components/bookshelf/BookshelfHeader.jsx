import "../../styles/bookshelf/BookshelfHeader.css";

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
      <header className="bookshelf-header">
        <h1 className="bookshelf-title">My Bookshelf</h1>
        <p className="bookshelf-subtitle">
          Manage your pending requests, active borrowings, and account status.
        </p>
      </header>

      <nav className="bookshelf-nav">
        <button
          type="button"
          onClick={() => setActiveTab("cart")}
          className={`bookshelf-tab-btn ${
            activeTab === "cart" ? "active" : ""
          }`}
        >
          Pending Cart ({cartCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("loans")}
          className={`bookshelf-tab-btn ${
            activeTab === "loans" ? "active" : ""
          }`}
        >
          Active Loans ({loansCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("fines")}
          className={`bookshelf-tab-btn ${
            activeTab === "fines" ? "active" : ""
          } ${hasFines ? "has-fines" : ""}`}
        >
          Fines & Status {hasFines ? `($${unpaidFines.toFixed(2)})` : ""}
        </button>
      </nav>

      {isSuspended && (
        <div className="bookshelf-alert alert-suspended">
          <strong>Account Suspended:</strong> You cannot borrow items while
          suspended.
        </div>
      )}

      {!isSuspended && hasFines && (
        <div className="bookshelf-alert alert-fines">
          <span>
            <strong>Outstanding Fine (${unpaidFines.toFixed(2)}):</strong> Clear
            balance to resume borrowing.
          </span>
          <button
            type="button"
            className="bookshelf-alert-pay-btn"
            onClick={() => setActiveTab("fines")}
          >
            Pay Fine
          </button>
        </div>
      )}
    </>
  );
}
