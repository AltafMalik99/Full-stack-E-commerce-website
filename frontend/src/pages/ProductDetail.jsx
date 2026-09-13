import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, fetchProducts, clearSelectedProduct } from "../redux/productSlice";
import { addToCart } from "../redux/cartSlice";
import { resolveImageUrl } from "../services/api";
import ProductGrid from "../components/ProductGrid";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedProduct, detailStatus, error, items } = useSelector(
    (state) => state.products
  );
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(id));
    // Also make sure we have a product list available for "related products"
    if (items.length === 0) dispatch(fetchProducts());

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, id]);

  useEffect(() => {
    setQuantity(1);
    setAddedMessage(false);
  }, [id]);

  if (detailStatus === "loading") return <Loading label="Loading product..." />;
  if (detailStatus === "failed") {
    return (
      <ErrorMessage
        message={error || "Product not found."}
        onRetry={() => dispatch(fetchProductById(id))}
      />
    );
  }
  if (!selectedProduct) return null;

  const { name, price, oldPrice, discount, rating, category, stock, image, description } =
    selectedProduct;

  const related = items
    .filter((p) => p.category === category && p.id !== selectedProduct.id)
    .slice(0, 4);

  function handleAddToCart() {
    dispatch(
      addToCart({
        id: selectedProduct.id,
        name,
        price,
        image,
        stock,
        quantity,
      })
    );
    setAddedMessage(true);
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail">
        <div className="product-detail-image">
          <img src={resolveImageUrl(image)} alt={name} />
        </div>

        <div className="product-detail-info">
          <span className="category-label">{category}</span>
          <h1>{name}</h1>

          <div className="product-card-rating">
            {"★".repeat(Math.round(rating))}
            {"☆".repeat(5 - Math.round(rating))}
            <span>({rating})</span>
          </div>

          <div className="product-detail-price">
            <span className="price">${price.toFixed(2)}</span>
            {oldPrice && oldPrice > price && (
              <>
                <span className="old-price">${oldPrice.toFixed(2)}</span>
                <span className="discount-badge">-{discount}%</span>
              </>
            )}
          </div>

          <p className="product-description">{description}</p>

          <p className="stock-info">
            {stock > 0 ? `${stock} in stock` : "Out of stock"}
          </p>

          <div className="quantity-selector">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              -
            </button>
            <span>{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
              disabled={quantity >= stock}
            >
              +
            </button>
          </div>

          <button
            className="btn btn-primary btn-large"
            onClick={handleAddToCart}
            disabled={stock === 0}
          >
            {stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>

          {addedMessage && (
            <p className="success-message">
              Added to cart! <Link to="/cart">View Cart</Link>
            </p>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <h2 className="section-title">Related Products</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
