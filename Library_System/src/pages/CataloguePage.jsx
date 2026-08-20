import { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import BookList from "../components/catalogue/BookList";
import "../styles/pages/CataloguePage.css";

export default function Catalogue() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const extractedGenres = new Set();

        querySnapshot.docs.forEach((docSnap) => {
          const bookGenre = docSnap.data().genre;
          if (bookGenre) {
            extractedGenres.add(bookGenre.trim());
          }
        });

        setGenres(Array.from(extractedGenres));
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    }

    fetchGenres();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <section className="catalogue-page">
      <form className="catalogue-search-form" onSubmit={handleSearch}>
        <div className="form-group">
          <label htmlFor="search">Search:</label>
          <input
            type="text"
            id="search"
            placeholder="Enter title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="genre">Genre:</label>
          <select
            id="genre"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="all">All Genres</option>
            {genres.map((g) => (
              <option key={g} value={g.toLowerCase()}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="startYear">From Year:</label>
          <input
            type="number"
            id="startYear"
            placeholder="e.g. 1900"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="endYear">To Year:</label>
          <input
            type="number"
            id="endYear"
            placeholder="e.g. 2026"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary search-btn">
          Search
        </button>
      </form>

      <BookList
        searchQuery={searchQuery}
        genre={selectedGenre}
        startYear={startYear}
        endYear={endYear}
      />
    </section>
  );
}