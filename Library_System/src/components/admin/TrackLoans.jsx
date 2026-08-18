import { useEffect, useState } from "react";
import { db } from "../../utils/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function TrackLoans() {
  const [loans, setLoans] = useState([]);
  const [sortField, setSortField] = useState("bookTitle");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    async function fetchLoans() {
      const snap = await getDocs(collection(db, "loans"));
      setLoans(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
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

  const sortedLoans = [...loans].sort((a, b) => {
    const valA = String(getFieldValue(a, sortField)).toLowerCase();
    const valB = String(getFieldValue(b, sortField)).toLowerCase();

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <h3>Track All Customer Loans</h3>
      {loans.length === 0 ? (
        <p>No active loans found.</p>
      ) : (
        <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th onClick={() => handleSort("bookTitle")} style={{ cursor: "pointer" }}>
                Book Title {sortField === "bookTitle" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => handleSort("memberName")} style={{ cursor: "pointer" }}>
                Member Name / ID {sortField === "memberName" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => handleSort("borrowedDate")} style={{ cursor: "pointer" }}>
                Borrowed Date {sortField === "borrowedDate" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => handleSort("dueDate")} style={{ cursor: "pointer" }}>
                Due Date {sortField === "dueDate" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
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
                <td>{l.dueDate || "N/A"}</td>
                <td>{l.status || "Active"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}