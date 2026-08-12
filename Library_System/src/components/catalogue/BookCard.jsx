import { useCart } from "../../context/CartContext";

function ProductCard({ product }) {
  const { cart, addToCart } = useCart();
  const isInCart = cart.some((item) => item.id === product.id);

  return (
    <article className="product-card">
      <div className="product-image-container">
        <img className="product-image" src={product.image} alt={product.name} />
      </div>

      <div className="product-content">
        <span className="product-category">{product.category}</span>

        <h3>{product.name}</h3>

        <p className="product-description">{product.description}</p>

        <div className="product-footer">
          <strong className="product-price">${product.price.toFixed(2)}</strong>

          <button
            type="button"
            className="add-button"
            disabled={isInCart}
            onClick={() => addToCart(product)}
          >
            {isInCart ? "Already in Cart" : "Borrow Book"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
