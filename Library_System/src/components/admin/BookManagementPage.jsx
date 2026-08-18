import { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function BookManagement() {
  const [subAction, setSubAction] = useState("add"); // 'add', 'manage'
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);

  // Table sorting states
  const [sortField, setSortField] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    name: "",
    author: "",
    genre: "",
    year: "",
    availableCopies: 1,
    image: "",
    description: "",
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      const snap = await getDocs(collection(db, "books"));
      setBooks(snap.docs.map((d) => ({ docId: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      author: "",
      genre: "",
      year: "",
      availableCopies: 1,
      image: "",
      description: "",
    });
    setEditingBook(null);
  };

  const handleOpenEditModal = (book) => {
    setEditingBook(book);
    setFormData({
      name: book.name || "",
      author: book.author || "",
      genre: book.genre || "",
      year: book.year || "",
      availableCopies: book.availableCopies ?? 1,
      image: book.image || "",
      description: book.description || "",
    });
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();

    const formattedTitle = encodeURIComponent(formData.name.trim() || "Book");
    const placeholderUrl = `https://placehold.co/500x320/e5e7eb/6b7280?text=${formattedTitle}`;
    const finalImageUrl = formData.image.trim() || placeholderUrl;

    const payload = {
      ...formData,
      year: Number(formData.year) || 0,
      availableCopies: Number(formData.availableCopies) || 0,
      image: finalImageUrl,
    };

    try {
      if (editingBook) {
        await updateDoc(doc(db, "books", editingBook.docId), payload);
        alert("Book updated successfully!");
      } else {
        await addDoc(collection(db, "books"), payload);
        alert("Book added successfully!");
      }

      resetForm();
      fetchBooks();
    } catch (err) {
      console.error("Error saving book:", err);
    }
  };

  const handleDeleteBook = async (docId, bookName) => {
    if (window.confirm(`Are you sure you want to delist "${bookName || "this book"}"?`)) {
      try {
        await deleteDoc(doc(db, "books", docId));
        fetchBooks();
      } catch (err) {
        console.error("Error deleting book:", err);
      }
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

  const sortedBooks = [...books].sort((a, b) => {
    let valA = a[sortField] ?? "";
    let valB = b[sortField] ?? "";

    if (sortField === "year" || sortField === "availableCopies") {
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

  // Calculate live preview image URL for the Add Form
  const previewTitle = encodeURIComponent(formData.name.trim() || "Book Cover");
  const previewImageSrc =
    formData.image.trim() ||
    `https://placehold.co/500x320/e5e7eb/6b7280?text=${previewTitle}`;

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          onClick={() => {
            setSubAction("add");
            resetForm();
          }}
          style={{
            fontWeight: subAction === "add" ? "bold" : "normal",
            marginRight: "0.5rem",
          }}
        >
          Add New Book
        </button>
        <button
          type="button"
          onClick={() => {
            setSubAction("manage");
            resetForm();
          }}
          style={{
            fontWeight: subAction === "manage" ? "bold" : "normal",
          }}
        >
          Manage Catalogue
        </button>
      </div>

      {/* Fancy Add Book View */}
      {subAction === "add" && (
        <div
          style={{
            background: "#fafafa",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "1.5rem",
            maxWidth: "850px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "1.2rem" }}>Add New Catalogue Item</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 240px",
              gap: "2rem",
              alignItems: "start",
            }}
          >
            <form
              onSubmit={handleSaveBook}
              style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
            >
              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem" }}>
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "0.4rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem" }}>
                    Author *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    style={{ width: "100%", padding: "0.4rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem" }}>
                    Genre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    style={{ width: "100%", padding: "0.4rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem" }}>
                    Publication Year *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    style={{ width: "100%", padding: "0.4rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem" }}>
                    Available Copies
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.availableCopies}
                    onChange={(e) =>
                      setFormData({ ...formData, availableCopies: e.target.value })
                    }
                    style={{ width: "100%", padding: "0.4rem" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem" }}>
                  Cover Image URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/cover.jpg"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  style={{ width: "100%", padding: "0.4rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem" }}>
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  style={{ width: "100%", padding: "0.4rem", resize: "vertical" }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: "0.6rem 1.2rem",
                  cursor: "pointer",
                  marginTop: "0.5rem",
                  alignSelf: "flex-start",
                }}
              >
                Save New Book
              </button>
            </form>

            {/* Live Card Preview */}
            <div
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "0.8rem",
                background: "#fff",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  color: "#64748b",
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                Cover Preview
              </span>
              <img
                src={previewImageSrc}
                alt="Book cover preview"
                style={{
                  width: "100%",
                  height: "220px",
                  objectFit: "cover",
                  borderRadius: "4px",
                  border: "1px solid #f1f5f9",
                }}
              />
              <h4 style={{ margin: "0.6rem 0 0.2rem 0", fontSize: "1rem" }}>
                {formData.name || "Book Title"}
              </h4>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#475569" }}>
                {formData.author ? `by ${formData.author}` : "Author Name"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sortable Book Table View */}
      {subAction === "manage" && (
        <div>
          <h3>Catalogue Management</h3>
          <table
            border="1"
            cellPadding="5"
            style={{ borderCollapse: "collapse", width: "100%" }}
          >
            <thead>
              <tr>
                <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                  Title {sortField === "name" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("author")} style={{ cursor: "pointer" }}>
                  Author {sortField === "author" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("genre")} style={{ cursor: "pointer" }}>
                  Genre {sortField === "genre" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("year")} style={{ cursor: "pointer" }}>
                  Year {sortField === "year" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th
                  onClick={() => handleSort("availableCopies")}
                  style={{ cursor: "pointer" }}
                >
                  Copies {sortField === "availableCopies" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedBooks.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No books found in the catalogue.
                  </td>
                </tr>
              ) : (
                sortedBooks.map((b) => (
                  <tr key={b.docId}>
                    <td>{b.name}</td>
                    <td>{b.author}</td>
                    <td>{b.genre}</td>
                    <td>{b.year || "N/A"}</td>
                    <td>{b.availableCopies ?? 0}</td>
                    <td>
                      <button type="button" onClick={() => handleOpenEditModal(b)}>
                        Edit
                      </button>{" "}
                      <button
                        type="button"
                        onClick={() => handleDeleteBook(b.docId, b.name)}
                      >
                        Delist
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Editing Book */}
      {editingBook && (
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
          onClick={resetForm}
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
            <button
              type="button"
              onClick={resetForm}
              style={{ float: "right", cursor: "pointer" }}
            >
              Close
            </button>
            <h2 style={{ marginTop: 0 }}>Edit Book</h2>

            <form
              onSubmit={handleSaveBook}
              style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
            >
              <div>
                <label style={{ display: "block", fontWeight: 600 }}>Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "0.4rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600 }}>Author *</label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  style={{ width: "100%", padding: "0.4rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600 }}>Genre *</label>
                <input
                  type="text"
                  required
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  style={{ width: "100%", padding: "0.4rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600 }}>Year *</label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    style={{ width: "100%", padding: "0.4rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600 }}>Copies</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.availableCopies}
                    onChange={(e) =>
                      setFormData({ ...formData, availableCopies: e.target.value })
                    }
                    style={{ width: "100%", padding: "0.4rem" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600 }}>
                  Custom Image URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  style={{ width: "100%", padding: "0.4rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600 }}>Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  style={{ width: "100%", padding: "0.4rem", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button type="submit" style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
                  Update Book
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}