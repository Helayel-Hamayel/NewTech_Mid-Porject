import BookList from "../components/catalogue/BookList";

export default function Catalogue() {
  return (
      <section>
        <form action="/catalogue" method="GET">

          <label for="search">Search:</label>
          <input type="text" id="search" name="query" placeholder="Enter title or author..."/>
          <label for="genre">Genre:</label>
          <select id="genre" name="genre">
            <option value="all">All Genres</option>
            <option value="literary-fiction">Literary Fiction</option>
            <option value="magical-realism">Magical Realism</option>
            <option value="mystery">Mystery</option>
          </select>


          <button type="submit">Search</button>
        </form>
        
        <BookList/>

    </section>
  );
}


