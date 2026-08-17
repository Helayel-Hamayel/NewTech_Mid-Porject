import { useCart } from "../../context/CartContext";

function ProductCard({ product }) {
  const { cart, activeLoans, addToCart } = useCart();

  const isInCart = cart.some((item) => item.id === product.id);
  const isBorrowed = activeLoans.includes(product.id);
  const isOutOfStock = product.availableCopies <= 0;

  // Determine button state and label
  const isDisabled = isInCart || isBorrowed || isOutOfStock;

  let buttonText = "Borrow Book";
  if (isBorrowed) {
    buttonText = "Already Borrowed";
  } else if (isInCart) {
    buttonText = "Already in Cart";
  } else if (isOutOfStock) {
    buttonText = "Out of Stock";
  }

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
          <p>
            Available Copies:
            <strong className="product-price">
              {" "}
              {product.availableCopies}
            </strong>
          </p>

          <button
            type="button"
            className="add-button"
            disabled={isDisabled}
            onClick={() => addToCart(product)}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;