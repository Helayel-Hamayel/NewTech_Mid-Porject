import { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import BookList from "../components/catalogue/BookList";

export default function Catalogue() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [genres, setGenres] = useState([]);

  // Fetch unique genres dynamically from Firestore
  useEffect(() => {
    async function fetchGenres() {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const extractedGenres = new Set();

        querySnapshot.docs.forEach((doc) => {
          const bookGenre = doc.data().genre;
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
    <section>
      <form onSubmit={handleSearch}>
        <label htmlFor="search">Search:</label>
        <input
          type="text"
          id="search"
          placeholder="Enter title or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

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

        <label htmlFor="startYear">From Year:</label>
        <input
          type="number"
          placeholder="e.g. 1900"
          value={startYear}
          onChange={(e) => setStartYear(e.target.value)}
        />

        <label htmlFor="endYear">To Year:</label>
        <input
          type="number"
          placeholder="e.g. 2026"
          value={endYear}
          onChange={(e) => setEndYear(e.target.value)}
        />

        <button type="submit">Search</button>
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