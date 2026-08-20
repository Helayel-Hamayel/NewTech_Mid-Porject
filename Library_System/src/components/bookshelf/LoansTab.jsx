import "../../styles/bookshelf/LoansTab.css";

export default function LoansTab({ loans, loading, handleReturn, processing }) {
  if (loading) {
    return <p className="loans-loading">Loading your active loans...</p>;
  }

  if (!loans || loans.length === 0) {
    return (
      <div className="loans-empty">
        <p className="loans-empty-text">You have no active loans right now.</p>
      </div>
    );
  }

  return (
    <div className="loans-list">
      {loans.map((loan, index) => {
        // Ensure robust ID extraction regardless of data source
        const loanDocId = loan.docId || loan.id;
        const bookId =
          loan.bookId ||
          (typeof loan.book === "string" ? loan.book : loan.book?.id);
        const title = loan.bookTitle || loan.title || "Untitled Book";

        const onReturnClick = () => {
          if (!loanDocId || !bookId) {
            console.error("Missing required IDs for return:", {
              loanDocId,
              bookId,
              loan,
            });
            return;
          }
          handleReturn(loanDocId, bookId);
        };

        return (
          <article key={loanDocId || index} className="loan-item-card">
            <div>
              <h4 className="loan-item-title">{title}</h4>
              <div className="loan-item-meta">
                {loan.loanId && (
                  <span>
                    Loan ID: <strong>{loan.loanId}</strong>
                  </span>
                )}
                {loan.borrowDate && (
                  <span>
                    Borrowed: <strong>{loan.borrowDate}</strong>
                  </span>
                )}
                <span>
                  Due Date: <strong>{loan.dueDate || "N/A"}</strong>
                </span>
              </div>
            </div>
            <button
              type="button"
              className="loan-item-return-btn"
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
