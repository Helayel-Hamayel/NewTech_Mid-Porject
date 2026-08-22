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
import "../../styles/admin/BookManagement.css";
import { toast } from "react-toastify";

export default function BookManagement() {
  const [subAction, setSubAction] = useState("add");
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);

  const [sortField, setSortField] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);

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
        toast("Book updated successfully!");
      } else {
        await addDoc(collection(db, "books"), payload);
        toast("Book added successfully!");
      }

      resetForm();
      fetchBooks();
    } catch (err) {
      console.error("Error saving book:", err);
    }
  };

  const handleDeleteBook = async (docId, bookName) => {
    if (
      window.confirm(
        `Are you sure you want to delist "${bookName || "this book"}"?`,
      )
    ) {
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

  const previewTitle = encodeURIComponent(formData.name.trim() || "Book Cover");
  const previewImageSrc =
    formData.image.trim() ||
    `https://placehold.co/500x320/e5e7eb/6b7280?text=${previewTitle}`;

  return (
    <div className="bm-container">
      <div className="bm-tab-bar">
        <button
          type="button"
          className={`bm-tab-btn ${subAction === "add" ? "active" : ""}`}
          onClick={() => {
            setSubAction("add");
            resetForm();
          }}
        >
          Add New Book
        </button>
        <button
          type="button"
          className={`bm-tab-btn ${subAction === "manage" ? "active" : ""}`}
          onClick={() => {
            setSubAction("manage");
            resetForm();
          }}
        >
          Manage Catalogue
        </button>
      </div>

      {subAction === "add" && (
        <div className="bm-form-panel">
          <h3 className="bm-panel-title">Add New Catalogue Item</h3>

          <div className="bm-form-grid">
            <form onSubmit={handleSaveBook} className="bm-form">
              <div className="bm-form-field">
                <label className="bm-label">Title *</label>
                <input
                  type="text"
                  className="bm-input"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="bm-form-field-row">
                <div className="bm-form-field">
                  <label className="bm-label">Author *</label>
                  <input
                    type="text"
                    className="bm-input"
                    required
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                  />
                </div>
                <div className="bm-form-field">
                  <label className="bm-label">Genre *</label>
                  <input
                    type="text"
                    className="bm-input"
                    required
                    value={formData.genre}
                    onChange={(e) =>
                      setFormData({ ...formData, genre: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="bm-form-field-row">
                <div className="bm-form-field">
                  <label className="bm-label">Publication Year *</label>
                  <input
                    type="number"
                    className="bm-input"
                    required
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                  />
                </div>
                <div className="bm-form-field">
                  <label className="bm-label">Available Copies</label>
                  <input
                    type="number"
                    className="bm-input"
                    min="1"
                    value={formData.availableCopies}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availableCopies: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="bm-form-field">
                <label className="bm-label">Cover Image URL (Optional)</label>
                <input
                  type="text"
                  className="bm-input"
                  placeholder="https://example.com/cover.jpg"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                />
              </div>

              <div className="bm-form-field">
                <label className="bm-label">Description</label>
                <textarea
                  className="bm-textarea"
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <button type="submit" className="bm-btn-submit">
                Save New Book
              </button>
            </form>

            <div className="bm-preview-card">
              <span className="bm-preview-badge">Cover Preview</span>
              <img
                src={previewImageSrc}
                alt="Book cover preview"
                className="bm-preview-img"
              />
              <h4 className="bm-preview-title">
                {formData.name || "Book Title"}
              </h4>
              <p className="bm-preview-author">
                {formData.author ? `by ${formData.author}` : "Author Name"}
              </p>
            </div>
          </div>
        </div>
      )}

      {subAction === "manage" && (
        <div className="bm-table-container">
          <h3 className="bm-panel-title">Catalogue Management</h3>
          <table className="bm-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("name")}>
                  Title {sortField === "name" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("author")}>
                  Author {sortField === "author" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("genre")}>
                  Genre {sortField === "genre" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("year")}>
                  Year {sortField === "year" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("availableCopies")}>
                  Copies{" "}
                  {sortField === "availableCopies" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedBooks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="bm-table-empty">
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
                      <button
                        type="button"
                        className="bm-btn-action"
                        onClick={() => handleOpenEditModal(b)}
                      >
                        Edit
                      </button>{" "}
                      <button
                        type="button"
                        className="bm-btn-action"
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

      {editingBook && (
        <div className="bm-modal-overlay" onClick={resetForm}>
          <div className="bm-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="bm-modal-close-btn"
              onClick={resetForm}
            >
              Close
            </button>
            <h2 className="bm-panel-title">Edit Book</h2>

            <form onSubmit={handleSaveBook} className="bm-form">
              <div className="bm-form-field">
                <label className="bm-label">Title *</label>
                <input
                  type="text"
                  className="bm-input"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="bm-form-field">
                <label className="bm-label">Author *</label>
                <input
                  type="text"
                  className="bm-input"
                  required
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                />
              </div>

              <div className="bm-form-field">
                <label className="bm-label">Genre *</label>
                <input
                  type="text"
                  className="bm-input"
                  required
                  value={formData.genre}
                  onChange={(e) =>
                    setFormData({ ...formData, genre: e.target.value })
                  }
                />
              </div>

              <div className="bm-form-field-row">
                <div className="bm-form-field">
                  <label className="bm-label">Year *</label>
                  <input
                    type="number"
                    className="bm-input"
                    required
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                  />
                </div>
                <div className="bm-form-field">
                  <label className="bm-label">Copies</label>
                  <input
                    type="number"
                    className="bm-input"
                    min="0"
                    value={formData.availableCopies}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availableCopies: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="bm-form-field">
                <label className="bm-label">Custom Image URL</label>
                <input
                  type="text"
                  className="bm-input"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                />
              </div>

              <div className="bm-form-field">
                <label className="bm-label">Description</label>
                <textarea
                  className="bm-textarea"
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="bm-modal-actions">
                <button type="submit" className="bm-btn-submit">
                  Update Book
                </button>
                <button
                  type="button"
                  className="bm-btn-action"
                  onClick={resetForm}
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