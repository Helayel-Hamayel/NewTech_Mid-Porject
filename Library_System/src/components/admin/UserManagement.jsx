import { useEffect, useState } from "react";
import { db } from "../../utils/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import "../../styles/admin/UserManagement.css";
import { toast } from "react-toastify";

// Helper to sanitize document IDs and strip hidden spaces/non-breaking spaces (\u00A0)
const cleanDocId = (id) =>
  String(id || "")
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "")
    .trim();

export default function UserManagement({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortField, setSortField] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);

  // Extract current logged-in user ID safely across schemas
  const rawCurrentUserId = currentUser?.id || currentUser?.uid;
  const currentUserId = cleanDocId(rawCurrentUserId);

  useEffect(() => {
    fetchUsersAndLoans();
  }, []);

  async function fetchUsersAndLoans() {
    try {
      // Fetch users and all loans in parallel
      const [userSnapshot, loanSnapshot] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "loans")),
      ]);

      const loansList = loanSnapshot.docs.map((d) => ({
        id: cleanDocId(d.id),
        ...d.data(),
      }));

      // Count active loans per user (checking if status is 'Active' or case variations/missing status)
      const activeLoanCounts = {};
      loansList.forEach((loan) => {
        const memberId = cleanDocId(loan.memberId);
        const status = (loan.status || "Active").toLowerCase();

        // Consider a loan active if it is explicitly active or hasn't been returned
        if (status === "active" || status === "borrowed") {
          activeLoanCounts[memberId] = (activeLoanCounts[memberId] || 0) + 1;
        }
      });

      const usersList = userSnapshot.docs.map((d) => {
        const userData = d.data();
        const targetId = cleanDocId(d.id);

        return {
          ...userData,
          id: targetId, // Placed last so userData.id cannot overwrite cleaned doc key
          activeLoansCount: activeLoanCounts[targetId] || 0,
        };
      });

      setUsers(usersList);
    } catch (err) {
      console.error("Error fetching users and loans:", err);
    }
  }

  const toggleSuspendUser = async (targetUser) => {
    const targetId = cleanDocId(targetUser.id);

    // Prevent self-suspension guard
    if (targetId === currentUserId) {
      toast("Action blocked: You cannot suspend your own account.");
      return;
    }

    const nextState = !targetUser.isSuspended;

    try {
      // Use setDoc with merge so missing documents get created smoothly
      await setDoc(
        doc(db, "users", targetId),
        { isSuspended: nextState },
        { merge: true },
      );

      setUsers((prev) =>
        prev.map((u) =>
          cleanDocId(u.id) === targetId ? { ...u, isSuspended: nextState } : u,
        ),
      );

      // Keep modal state synced if open
      if (cleanDocId(selectedUser?.id) === targetId) {
        setSelectedUser((prev) => ({ ...prev, isSuspended: nextState }));
      }
    } catch (err) {
      console.error("Failed to toggle suspension:", err);
      toast("Error updating user status: " + err.message);
    }
  };

  const toggleStaffRole = async (targetUser) => {
    const targetId = cleanDocId(targetUser.id);

    if (targetId === currentUserId) {
      toast("Action blocked: You cannot modify your own administrative role.");
      return;
    }

    const newRole = targetUser.role === "Staff" ? "Customer" : "Staff";

    try {
      await setDoc(
        doc(db, "users", targetId),
        { role: newRole },
        { merge: true },
      );

      setUsers((prev) =>
        prev.map((u) =>
          cleanDocId(u.id) === targetId ? { ...u, role: newRole } : u,
        ),
      );

      // Keep modal state synced if open
      if (cleanDocId(selectedUser?.id) === targetId) {
        setSelectedUser((prev) => ({ ...prev, role: newRole }));
      }
    } catch (err) {
      console.error("Failed to toggle role:", err);
      toast("Error updating user role: " + err.message);
    }
  };

  const handleForgiveFine = async (targetUser) => {
    const targetId = cleanDocId(targetUser.id);

    try {
      await setDoc(
        doc(db, "users", targetId),
        { unpaidFines: 0 },
        { merge: true },
      );

      setUsers((prev) =>
        prev.map((u) =>
          cleanDocId(u.id) === targetId ? { ...u, unpaidFines: 0 } : u,
        ),
      );

      if (cleanDocId(selectedUser?.id) === targetId) {
        setSelectedUser((prev) => ({ ...prev, unpaidFines: 0 }));
      }

      toast(`Fines forgiven for ${targetUser.name || "this user"}.`);
    } catch (err) {
      console.error("Failed to forgive fines:", err);
      toast("Failed to forgive fines: " + err.message);
    }
  };

  const updateUserFine = (targetUser, unpaidFines) => {
    const targetId = cleanDocId(targetUser.id);

    setUsers((prev) =>
      prev.map((u) =>
        cleanDocId(u.id) === targetId ? { ...u, unpaidFines } : u,
      ),
    );

    if (cleanDocId(selectedUser?.id) === targetId) {
      setSelectedUser((prev) => ({ ...prev, unpaidFines }));
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let valA = a[sortField] ?? "";
    let valB = b[sortField] ?? "";

    if (sortField === "activeLoansCount" || sortField === "unpaidFines") {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
    } else {
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const isAdmin = currentUser?.role === "Admin";

  return (
    <div className="um-container">
      <h3 className="um-title">User Management</h3>

      <div className="um-table-container">
        <table className="um-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("name")}>
                Name {sortField === "name" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => handleSort("email")}>
                Email {sortField === "email" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => handleSort("role")}>
                Role {sortField === "role" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => handleSort("isSuspended")}>
                Status{" "}
                {sortField === "isSuspended" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => handleSort("activeLoansCount")}>
                Loans{" "}
                {sortField === "activeLoansCount" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => handleSort("unpaidFines")}>
                Fines {sortField === "unpaidFines" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((u) => {
              const uId = cleanDocId(u.id);
              const isSelf = uId === currentUserId;
              const suspended = Boolean(u.isSuspended);

              return (
                <tr key={uId}>
                  <td>{u.name || "N/A"}</td>
                  <td>{u.email}</td>
                  <td>{u.role || "Customer"}</td>
                  <td>
                    <span
                      className={`um-badge ${
                        suspended ? "suspended" : "active"
                      }`}
                    >
                      {suspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td>{u.activeLoansCount}</td>
                  <td>${(Number(u.unpaidFines) || 0).toFixed(2)}</td>
                  <td>
                    <div className="um-action-group">
                      <button
                        type="button"
                        className="um-btn-action"
                        onClick={() => setSelectedUser(u)}
                      >
                        View Profile
                      </button>
                      <button
                        type="button"
                        className="um-btn-warning"
                        disabled={isSelf}
                        title={
                          isSelf ? "You cannot suspend your own account" : ""
                        }
                        onClick={() => toggleSuspendUser(u)}
                      >
                        {suspended ? "Unsuspend" : "Suspend"}
                      </button>
                      <button
                        type="button"
                        className="um-btn-action"
                        disabled={!(Number(u.unpaidFines) > 0)}
                        onClick={() => handleForgiveFine(u)}
                      >
                        Forgive Fines
                      </button>
                      {isAdmin && u.role !== "Admin" && (
                        <button
                          type="button"
                          className="um-btn-action"
                          disabled={isSelf}
                          title={isSelf ? "You cannot alter your own role" : ""}
                          onClick={() => toggleStaffRole(u)}
                        >
                          {u.role === "Staff" ? "Revoke Staff" : "Make Staff"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onToggleSuspend={() => toggleSuspendUser(selectedUser)}
          onToggleRole={() => toggleStaffRole(selectedUser)}
          onFineUpdated={(unpaidFines) =>
            updateUserFine(selectedUser, unpaidFines)
          }
          onForgiveFine={() => handleForgiveFine(selectedUser)}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

function UserProfileModal({
  user,
  currentUserId,
  isAdmin,
  onToggleSuspend,
  onToggleRole,
  onFineUpdated,
  onForgiveFine,
  onClose,
}) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fineInput, setFineInput] = useState("");

  const targetUserId = cleanDocId(user.id);
  const isSelf = targetUserId === currentUserId;

  useEffect(() => {
    async function fetchUserLoans() {
      try {
        const q = query(
          collection(db, "loans"),
          where("memberId", "==", targetUserId),
        );
        const snap = await getDocs(q);
        setLoans(snap.docs.map((d) => ({ id: cleanDocId(d.id), ...d.data() })));
      } catch (err) {
        console.error("Error fetching user loans:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserLoans();
  }, [targetUserId]);

  const handleApplyFine = async (e) => {
    e.preventDefault();
    const amount = Number(fineInput);
    if (isNaN(amount) || amount <= 0)
      return toast("Enter a valid fine amount.");

    try {
      const updatedFine = (user.unpaidFines || 0) + amount;
      await setDoc(
        doc(db, "users", targetUserId),
        { unpaidFines: updatedFine },
        { merge: true },
      );
      onFineUpdated(updatedFine);
      setFineInput("");
      toast(`Applied fine of $${amount}. New total balance: $${updatedFine}`);
    } catch (err) {
      console.error("Failed to apply fine:", err);
      toast("Failed to issue fine: " + err.message);
    }
  };

  const hasUnpaidFines = Number(user.unpaidFines) > 0;

  return (
    <div className="um-modal-overlay" onClick={onClose}>
      <div className="um-modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="um-btn-close" onClick={onClose}>
          Close
        </button>

        <h3 className="um-modal-title">User Profile: {user.name || "N/A"}</h3>
        <p className="um-profile-info">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="um-profile-info">
          <strong>Role:</strong> {user.role || "Customer"}
        </p>
        <p className="um-profile-info">
          <strong>Status:</strong>{" "}
          <span
            className={`um-badge ${user.isSuspended ? "suspended" : "active"}`}
          >
            {user.isSuspended ? "Suspended" : "Active"}
          </span>
        </p>
        <p className="um-profile-info">
          <strong>Unpaid Fines:</strong> ${user.unpaidFines || 0}
        </p>

        <hr className="um-divider" />

        <h4>Loan History ({loans.length} Total)</h4>
        {loading ? (
          <p className="um-profile-info">Loading loan records...</p>
        ) : loans.length === 0 ? (
          <p className="um-profile-info">
            No loan records found for this user.
          </p>
        ) : (
          <ul className="um-loan-list">
            {loans.map((loan) => (
              <li key={loan.id} className="um-loan-item">
                <strong>{loan.bookTitle || loan.bookId}</strong> — Status:{" "}
                {loan.status || "Active"} (Due: {loan.dueDate || "N/A"})
              </li>
            ))}
          </ul>
        )}

        <hr className="um-divider" />

        <h4>Manage User</h4>
        <form onSubmit={handleApplyFine} className="um-fine-form">
          <input
            type="number"
            min="1"
            placeholder="Fine amount ($)"
            className="um-input-fine"
            value={fineInput}
            onChange={(e) => setFineInput(e.target.value)}
          />
          <button type="submit" className="um-btn-action">
            Issue Fine
          </button>
        </form>

        <div className="um-modal-actions">
          <button
            type="button"
            className="um-btn-action"
            disabled={!hasUnpaidFines}
            onClick={onForgiveFine}
          >
            Forgive Fines
          </button>
          <button
            type="button"
            className="um-btn-warning"
            disabled={isSelf}
            onClick={onToggleSuspend}
          >
            {user.isSuspended ? "Unsuspend Account" : "Suspend Account"}
          </button>

          {isAdmin && user.role !== "Admin" && (
            <button
              type="button"
              className="um-btn-action"
              disabled={isSelf}
              onClick={onToggleRole}
            >
              {user.role === "Staff" ? "Revoke Staff Role" : "Make Staff"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}