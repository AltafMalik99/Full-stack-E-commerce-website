import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { resolveImageUrl } from "../services/api";

// Renders one product. Props are destructured from the `product` object
// passed down from parent components (ProductGrid, Home sections, etc.)
export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id, name, price, oldPrice, discount, rating, image, stock } = product;

  function handleAddToCart() {
    dispatch(addToCart({ id, name, price, image, stock, quantity: 1 }));
  }

  function goToDetail() {
    navigate(`/products/${id}`);
  }

  // NOTE: the button lives OUTSIDE the clickable area so it is never a
  // nested interactive element inside an <a> tag (which causes
  // unreliable clicks in some browsers). The image/title area
  // navigates via onClick + keyboard support instead of wrapping
  // everything in a <Link>.
  return (
    <div className="product-card">
      <div
        className="product-card-clickable"
        onClick={goToDetail}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") goToDetail();
        }}
      >
        <div className="product-card-image">
          <img src={resolveImageUrl(image)} alt={name} loading="lazy" />
          {discount > 0 && <span className="discount-badge">-{discount}%</span>}
        </div>

        <div className="product-card-body">
          <h3 className="product-card-name">{name}</h3>

          <div className="product-card-rating">
            {"★".repeat(Math.round(rating))}
            {"☆".repeat(5 - Math.round(rating))}
            <span>({rating})</span>
          </div>

          <div className="product-card-price">
            <span className="price">${price.toFixed(2)}</span>
            {oldPrice && oldPrice > price && (
              <span className="old-price">${oldPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="btn btn-primary btn-add-cart"
        onClick={handleAddToCart}
        disabled={stock === 0}
      >
        {stock === 0 ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
}
