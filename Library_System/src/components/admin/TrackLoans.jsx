import { useEffect, useState } from "react";
import { db } from "../../utils/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  writeBatch,
} from "firebase/firestore";

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
    <div>
      <h3>Track All Customer Loans</h3>

      {/* Control Bar: Toggles & Bulk Cleanup */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        {/* Active vs Returned Toggle */}
        <div
          style={{
            display: "flex",
            gap: "0.25rem",
            backgroundColor: "#e5e7eb",
            padding: "0.25rem",
            borderRadius: "6px",
          }}
        >
          <button
            type="button"
            onClick={() => setStatusFilter("Active")}
            style={{
              padding: "0.4rem 0.85rem",
              border: "none",
              borderRadius: "4px",
              backgroundColor:
                statusFilter === "Active" ? "#ffffff" : "transparent",
              fontWeight: statusFilter === "Active" ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            Active ({activeLoans.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("Returned")}
            style={{
              padding: "0.4rem 0.85rem",
              border: "none",
              borderRadius: "4px",
              backgroundColor:
                statusFilter === "Returned" ? "#ffffff" : "transparent",
              fontWeight: statusFilter === "Returned" ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            Returned ({returnedLoans.length})
          </button>
        </div>

        {/* Admin Action Buttons */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => openCleanupModal("returned")}
            disabled={processing || returnedLoans.length === 0}
            style={{
              padding: "0.4rem 0.75rem",
              backgroundColor: "#f3f4f6",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              cursor: returnedLoans.length > 0 ? "pointer" : "not-allowed",
              opacity: returnedLoans.length > 0 ? 1 : 0.5,
            }}
          >
            Clean Up Returned
          </button>
          <button
            type="button"
            onClick={() => openCleanupModal("all")}
            disabled={processing || loans.length === 0}
            style={{
              padding: "0.4rem 0.75rem",
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #f87171",
              borderRadius: "4px",
              cursor: loans.length > 0 ? "pointer" : "not-allowed",
              opacity: loans.length > 0 ? 1 : 0.5,
            }}
          >
            Clean Up All
          </button>
        </div>
      </div>

      {/* Table Display */}
      {sortedLoans.length === 0 ? (
        <p style={{ padding: "1rem 0", color: "#6b7280" }}>
          No {statusFilter.toLowerCase()} customer loans found.
        </p>
      ) : (
        <table
          border="1"
          cellPadding="5"
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr>
              <th
                onClick={() => handleSort("bookTitle")}
                style={{ cursor: "pointer" }}
              >
                Book Title{" "}
                {sortField === "bookTitle" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th
                onClick={() => handleSort("memberName")}
                style={{ cursor: "pointer" }}
              >
                Member Name / ID{" "}
                {sortField === "memberName" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th
                onClick={() => handleSort("borrowedDate")}
                style={{ cursor: "pointer" }}
              >
                Borrowed Date{" "}
                {sortField === "borrowedDate" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th
                onClick={() => handleSort("dueDate")}
                style={{ cursor: "pointer" }}
              >
                {statusFilter === "Returned" ? "Return Date" : "Due Date"}{" "}
                {sortField === "dueDate" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th
                onClick={() => handleSort("status")}
                style={{ cursor: "pointer" }}
              >
                Status {sortField === "status" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedLoans.map((l) => (
              <tr key={l.id}>
                <td>{l.bookTitle || l.name || "N/A"}</td>
                <td>{l.memberName || l.memberId || l.userId || "N/A"}</td>
                <td>{l.borrowedDate || l.borrowDate || "N/A"}</td>
                <td>
                  {l.status === "Returned"
                    ? l.returnDate || l.dueDate || "N/A"
                    : l.dueDate || "N/A"}
                </td>
                <td>
                  <span
                    style={{
                      padding: "0.15rem 0.4rem",
                      borderRadius: "4px",
                      backgroundColor:
                        l.status === "Returned" ? "#d1fae5" : "#e0f2fe",
                      color: l.status === "Returned" ? "#065f46" : "#0369a1",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                    }}
                  >
                    {l.status || "Active"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* DOUBLE CONFIRMATION MODAL */}
      {confirmModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "1.5rem",
              borderRadius: "8px",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            }}
          >
            {confirmStep === 1 ? (
              <>
                <h3 style={{ marginTop: 0, color: "#991b1b" }}>
                  ⚠️ Step 1 of 2: Confirm Admin Action
                </h3>
                <p style={{ color: "#374151" }}>
                  Are you sure you want to permanently delete{" "}
                  <strong>
                    {confirmModal === "returned"
                      ? `all ${returnedLoans.length} returned loan records`
                      : `ALL ${loans.length} customer loan records (active & returned)`}
                  </strong>
                  ?
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.5rem",
                    marginTop: "1.25rem",
                  }}
                >
                  <button type="button" onClick={closeCleanupModal}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmStep(2)}
                    style={{
                      backgroundColor: "#dc2626",
                      color: "#ffffff",
                      fontWeight: "bold",
                      padding: "0.4rem 0.8rem",
                      border: "none",
                      borderRadius: "4px",
                    }}
                  >
                    Proceed to Step 2 →
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ marginTop: 0, color: "#991b1b" }}>
                  🚨 Step 2 of 2: Final Verification
                </h3>
                <p style={{ color: "#374151", fontSize: "0.9rem" }}>
                  This will permanently erase these records from Firestore. Type{" "}
                  <strong>DELETE</strong> below to confirm:
                </p>
                <input
                  type="text"
                  value={typedVerification}
                  onChange={(e) => setTypedVerification(e.target.value)}
                  placeholder="Type DELETE"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    marginBottom: "1rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    boxSizing: "border-box",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.5rem",
                  }}
                >
                  <button type="button" onClick={closeCleanupModal}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteCleanup}
                    disabled={typedVerification !== "DELETE" || processing}
                    style={{
                      backgroundColor:
                        typedVerification === "DELETE" ? "#dc2626" : "#fca5a5",
                      color: "#ffffff",
                      fontWeight: "bold",
                      padding: "0.4rem 0.8rem",
                      border: "none",
                      borderRadius: "4px",
                      cursor:
                        typedVerification === "DELETE"
                          ? "pointer"
                          : "not-allowed",
                    }}
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