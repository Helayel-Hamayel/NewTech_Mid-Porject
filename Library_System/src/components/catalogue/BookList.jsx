import BookCard from "./BookCard";
import Books from "../../data/Books";

function ProductList() {

  return (
    <section className="products-section">
      <div className="section-heading">
        <span className="products-count">{Books.length} Books output</span>
      </div>

      <div className="products-grid">
        {Books.map((Book) => {
          return <BookCard key={Book.id} product={Book} />;
        })}
      </div>
    </section>
  );
}

export default ProductList;
