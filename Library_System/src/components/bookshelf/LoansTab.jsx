export default function LoansTab({ loans, loading, handleReturn, processing }) {
  if (loading) {
    return <p>Loading your active loans...</p>;
  }

  if (!loans || loans.length === 0) {
    return (
      <div style={{ padding: "2rem 0", textAlign: "center" }}>
        <p style={{ color: "#6b7280" }}>You have no active loans right now.</p>
      </div>
    );
  }

  return (
    <div>
      {loans.map((loan, index) => {
        // Ensure robust ID extraction regardless of data source
        const loanDocId = loan.docId || loan.id;
        const bookId = loan.bookId || (typeof loan.book === "string" ? loan.book : loan.book?.id);
        const title = loan.bookTitle || loan.title || "Untitled Book";

        const onReturnClick = () => {
          if (!loanDocId || !bookId) {
            console.error("Missing required IDs for return:", { loanDocId, bookId, loan });
            return;
          }
          handleReturn(loanDocId, bookId);
        };

        return (
          <article
            key={loanDocId || index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem",
              marginBottom: "0.5rem",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
          >
            <div>
              <h4 style={{ margin: "0 0 0.25rem 0" }}>{title}</h4>
              <div style={{ display: "flex", gap: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
                {loan.loanId && <span>Loan ID: <strong>{loan.loanId}</strong></span>}
                {loan.borrowDate && <span>Borrowed: <strong>{loan.borrowDate}</strong></span>}
                <span>Due Date: <strong>{loan.dueDate || "N/A"}</strong></span>
              </div>
            </div>
            <button
              type="button"
              onClick={onReturnClick}
              disabled={processing || !loanDocId || !bookId}
            >
              {processing ? "Processing..." : "Return Book"}
            </button>
          </article>
        );
      })}
    </div>
  );
}