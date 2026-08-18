import { useEffect, useState } from "react";
import { db } from "../../utils/firebase";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";

export default function UserManagement({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortField, setSortField] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);

  // Extract current logged-in user ID safely across schemas
  const currentUserId = currentUser?.id || currentUser?.uid;

  useEffect(() => {
    fetchUsersAndLoans();
  }, []);

  async function fetchUsersAndLoans() {
    try {
      // Fetch users and all loans in parallel
      const [userSnapshot, loanSnapshot] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "loans"))
      ]);

      const loansList = loanSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Count active loans per user (checking if status is 'Active' or case variations/missing status)
      const activeLoanCounts = {};
      loansList.forEach((loan) => {
        const memberId = loan.memberId;
        const status = (loan.status || "Active").toLowerCase();
        
        // Consider a loan active if it is explicitly active or hasn't been returned
        if (status === "active" || status === "borrowed") {
          activeLoanCounts[memberId] = (activeLoanCounts[memberId] || 0) + 1;
        }
      });

      const usersList = userSnapshot.docs.map((d) => {
        const userData = d.data();
        return {
          id: d.id,
          ...userData,
          activeLoansCount: activeLoanCounts[d.id] || 0,
        };
      });

      setUsers(usersList);
    } catch (err) {
      console.error("Error fetching users and loans:", err);
    }
  }

  const toggleSuspendUser = async (targetUser) => {
    // Prevent self-suspension guard
    if (targetUser.id === currentUserId) {
      alert("Action blocked: You cannot suspend your own account.");
      return;
    }

    const nextState = !targetUser.isSuspended;
    await updateDoc(doc(db, "users", targetUser.id), {
      isSuspended: nextState,
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, isSuspended: nextState } : u))
    );

    // Keep modal state synced if open
    if (selectedUser?.id === targetUser.id) {
      setSelectedUser((prev) => ({ ...prev, isSuspended: nextState }));
    }
  };

  const toggleStaffRole = async (targetUser) => {
    if (targetUser.id === currentUserId) {
      alert("Action blocked: You cannot modify your own administrative role.");
      return;
    }

    const newRole = targetUser.role === "Staff" ? "Customer" : "Staff";
    await updateDoc(doc(db, "users", targetUser.id), { role: newRole });

    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
    );

    // Keep modal state synced if open
    if (selectedUser?.id === targetUser.id) {
      setSelectedUser((prev) => ({ ...prev, role: newRole }));
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

    if (sortField === "activeLoansCount") {
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
    <div>
      <h3>User Management</h3>

      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
              Name {sortField === "name" ? (sortAsc ? "▲" : "▼") : ""}
            </th>
            <th onClick={() => handleSort("email")} style={{ cursor: "pointer" }}>
              Email {sortField === "email" ? (sortAsc ? "▲" : "▼") : ""}
            </th>
            <th onClick={() => handleSort("role")} style={{ cursor: "pointer" }}>
              Role {sortField === "role" ? (sortAsc ? "▲" : "▼") : ""}
            </th>
            <th onClick={() => handleSort("isSuspended")} style={{ cursor: "pointer" }}>
              Status {sortField === "isSuspended" ? (sortAsc ? "▲" : "▼") : ""}
            </th>
            <th onClick={() => handleSort("activeLoansCount")} style={{ cursor: "pointer" }}>
              Loans {sortField === "activeLoansCount" ? (sortAsc ? "▲" : "▼") : ""}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((u) => {
            const isSelf = u.id === currentUserId;
            const suspended = Boolean(u.isSuspended);

            return (
              <tr key={u.id}>
                <td>{u.name || "N/A"}</td>
                <td>{u.email}</td>
                <td>{u.role || "Customer"}</td>
                <td>{suspended ? "Suspended" : "Active"}</td>
                <td>{u.activeLoansCount}</td>
                <td>
                  <button type="button" onClick={() => setSelectedUser(u)}>
                    View Profile
                  </button>{" "}
                  <button
                    type="button"
                    disabled={isSelf}
                    title={isSelf ? "You cannot suspend your own account" : ""}
                    onClick={() => toggleSuspendUser(u)}
                  >
                    {suspended ? "Unsuspend" : "Suspend"}
                  </button>
                  {isAdmin && u.role !== "Admin" && (
                    <button
                      type="button"
                      disabled={isSelf}
                      title={isSelf ? "You cannot alter your own role" : ""}
                      onClick={() => toggleStaffRole(u)}
                      style={{ marginLeft: "5px" }}
                    >
                      {u.role === "Staff" ? "Revoke Staff" : "Make Staff"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onToggleSuspend={() => toggleSuspendUser(selectedUser)}
          onToggleRole={() => toggleStaffRole(selectedUser)}
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
  onClose,
}) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fineInput, setFineInput] = useState("");

  const isSelf = user.id === currentUserId;

  useEffect(() => {
    async function fetchUserLoans() {
      try {
        const q = query(collection(db, "loans"), where("memberId", "==", user.id));
        const snap = await getDocs(q);
        setLoans(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching user loans:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserLoans();
  }, [user.id]);

  const handleApplyFine = async (e) => {
    e.preventDefault();
    const amount = Number(fineInput);
    if (isNaN(amount) || amount <= 0) return alert("Enter a valid fine amount.");

    try {
      const updatedFine = (user.unpaidFines || 0) + amount;
      await updateDoc(doc(db, "users", user.id), { unpaidFines: updatedFine });
      user.unpaidFines = updatedFine;
      setFineInput("");
      alert(`Applied fine of $${amount}. New total balance: $${updatedFine}`);
    } catch (err) {
      console.error("Failed to apply fine:", err);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "550px",
          width: "90%",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} style={{ float: "right" }}>
          Close
        </button>

        <h2>User Profile: {user.name || "N/A"}</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role || "Customer"}</p>
        <p><strong>Status:</strong> {user.isSuspended ? "Suspended" : "Active"}</p>
        <p><strong>Unpaid Fines:</strong> ${user.unpaidFines || 0}</p>

        <hr />

        <h3>Loan History ({loans.length} Total)</h3>
        {loading ? (
          <p>Loading loan records...</p>
        ) : loans.length === 0 ? (
          <p>No loan records found for this user.</p>
        ) : (
          <ul style={{ paddingLeft: "1.2rem" }}>
            {loans.map((loan) => (
              <li key={loan.id}>
                <strong>{loan.bookTitle || loan.bookId}</strong> — Status: {loan.status || "Active"}{" "}
                (Due: {loan.dueDate || "N/A"})
              </li>
            ))}
          </ul>
        )}

        <hr />

        <h3>Manage User</h3>
        <form onSubmit={handleApplyFine} style={{ marginBottom: "1rem" }}>
          <input
            type="number"
            min="1"
            placeholder="Fine amount ($)"
            value={fineInput}
            onChange={(e) => setFineInput(e.target.value)}
            style={{ marginRight: "0.5rem" }}
          />
          <button type="submit">Issue Fine</button>
        </form>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            disabled={isSelf}
            onClick={onToggleSuspend}
          >
            {user.isSuspended ? "Unsuspend Account" : "Suspend Account"}
          </button>

          {isAdmin && user.role !== "Admin" && (
            <button
              type="button"
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