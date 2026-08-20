import { useEffect, useState } from "react";
import { db } from "../../utils/firebase";
import { collection, getDocs, doc, writeBatch } from "firebase/firestore";
import "../../styles/admin/TrackLoans.css";

export default function TrackLoans() {
  const [loans, setLoans] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Active"); // "Active" | "Returned"
  const [sortField, setSortField] = useState("bookTitle");
  const [sortAsc, setSortAsc] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Double confirmation modal state
  const [confirmModal, setConfirmModal] = useState(null); // null | "returned" | "all"
  const [confirmStep, setConfirmStep] = useState(1);
  const [typedVerification, setTypedVerification] = useState("");

  const fetchLoans = async () => {
    try {
      const snap = await getDocs(collection(db, "loans"));
      setLoans(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Failed to fetch loans:", err);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getFieldValue = (loan, field) => {
    switch (field) {
      case "bookTitle":
        return loan.bookTitle || loan.name || "";
      case "memberName":
        return loan.memberName || loan.memberId || loan.userId || "";
      case "borrowedDate":
        return loan.borrowedDate || loan.borrowDate || "";
      case "dueDate":
        return loan.dueDate || "";
      case "status":
        return loan.status || "Active";
      default:
        return loan[field] ?? "";
    }
  };

  // Filter loans by Active vs Returned status
  const activeLoans = loans.filter((l) => (l.status || "Active") === "Active");
  const returnedLoans = loans.filter((l) => l.status === "Returned");
  const displayedLoans =
    statusFilter === "Active" ? activeLoans : returnedLoans;

  // Sort displayed loans
  const sortedLoans = [...displayedLoans].sort((a, b) => {
    const valA = String(getFieldValue(a, sortField)).toLowerCase();
    const valB = String(getFieldValue(b, sortField)).toLowerCase();

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  // Modal Handlers
  const openCleanupModal = (type) => {
    setConfirmModal(type);
    setConfirmStep(1);
    setTypedVerification("");
  };

  const closeCleanupModal = () => {
    setConfirmModal(null);
    setConfirmStep(1);
    setTypedVerification("");
  };

  // Bulk Deletion Execution
  const handleExecuteCleanup = async () => {
    setProcessing(true);
    try {
      const targets = confirmModal === "returned" ? returnedLoans : loans;

      // Batch deletion in Firestore
      const batch = writeBatch(db);
      targets.forEach((l) => {
        batch.delete(doc(db, "loans", l.id));
      });
      await batch.commit();

      await fetchLoans();
      closeCleanupModal();
    } catch (err) {
      console.error("Cleanup failed:", err);
      alert("Failed to delete loan records: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="tl-container">
      <h3 className="tl-title">Track All Customer Loans</h3>

      {/* Control Bar: Toggles & Bulk Cleanup */}
      <div className="tl-control-bar">
        {/* Active vs Returned Toggle */}
        <div className="tl-toggle-group">
          <button
            type="button"
            className={`tl-toggle-btn ${statusFilter === "Active" ? "active" : ""}`}
            onClick={() => setStatusFilter("Active")}
          >
            Active ({activeLoans.length})
          </button>
          <button
            type="button"
            className={`tl-toggle-btn ${statusFilter === "Returned" ? "active" : ""}`}
            onClick={() => setStatusFilter("Returned")}
          >
            Returned ({returnedLoans.length})
          </button>
        </div>

        {/* Admin Action Buttons */}
        <div className="tl-action-group">
          <button
            type="button"
            className="tl-btn-cleanup"
            onClick={() => openCleanupModal("returned")}
            disabled={processing || returnedLoans.length === 0}
          >
            Clean Up Returned
          </button>
          <button
            type="button"
            className="tl-btn-danger"
            onClick={() => openCleanupModal("all")}
            disabled={processing || loans.length === 0}
          >
            Clean Up All
          </button>
        </div>
      </div>

      {/* Table Display */}
      {sortedLoans.length === 0 ? (
        <p className="tl-empty-msg">
          No {statusFilter.toLowerCase()} customer loans found.
        </p>
      ) : (
        <div className="tl-table-container">
          <table className="tl-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("bookTitle")}>
                  Book Title{" "}
                  {sortField === "bookTitle" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("memberName")}>
                  Member Name / ID{" "}
                  {sortField === "memberName" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("borrowedDate")}>
                  Borrowed Date{" "}
                  {sortField === "borrowedDate" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("dueDate")}>
                  {statusFilter === "Returned" ? "Return Date" : "Due Date"}{" "}
                  {sortField === "dueDate" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("status")}>
                  Status {sortField === "status" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedLoans.map((l) => {
                const isReturned = l.status === "Returned";
                return (
                  <tr key={l.id}>
                    <td>{l.bookTitle || l.name || "N/A"}</td>
                    <td>{l.memberName || l.memberId || l.userId || "N/A"}</td>
                    <td>{l.borrowedDate || l.borrowDate || "N/A"}</td>
                    <td>
                      {isReturned
                        ? l.returnDate || l.dueDate || "N/A"
                        : l.dueDate || "N/A"}
                    </td>
                    <td>
                      <span
                        className={`tl-status-badge ${
                          isReturned ? "returned" : "active"
                        }`}
                      >
                        {l.status || "Active"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* DOUBLE CONFIRMATION MODAL */}
      {confirmModal && (
        <div className="tl-modal-overlay">
          <div className="tl-modal-card">
            {confirmStep === 1 ? (
              <>
                <h3 className="tl-modal-title">
                  ⚠️ Step 1 of 2: Confirm Admin Action
                </h3>
                <p className="tl-modal-text">
                  Are you sure you want to permanently delete{" "}
                  <strong>
                    {confirmModal === "returned"
                      ? `all ${returnedLoans.length} returned loan records`
                      : `ALL ${loans.length} customer loan records (active & returned)`}
                  </strong>
                  ?
                </p>
                <div className="tl-modal-actions">
                  <button
                    type="button"
                    className="tl-btn-cancel"
                    onClick={closeCleanupModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="tl-btn-confirm-step"
                    onClick={() => setConfirmStep(2)}
                  >
                    Proceed to Step 2 →
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="tl-modal-title">
                  🚨 Step 2 of 2: Final Verification
                </h3>
                <p className="tl-modal-text-sm">
                  This will permanently erase these records from Firestore. Type{" "}
                  <strong>DELETE</strong> below to confirm:
                </p>
                <input
                  type="text"
                  className="tl-input-verify"
                  value={typedVerification}
                  onChange={(e) => setTypedVerification(e.target.value)}
                  placeholder="Type DELETE"
                />
                <div className="tl-modal-actions">
                  <button
                    type="button"
                    className="tl-btn-cancel"
                    onClick={closeCleanupModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`tl-btn-delete-final ${
                      typedVerification === "DELETE" ? "ready" : ""
                    }`}
                    onClick={handleExecuteCleanup}
                    disabled={typedVerification !== "DELETE" || processing}
                  >
                    {processing ? "Deleting..." : "Permanently Delete"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}