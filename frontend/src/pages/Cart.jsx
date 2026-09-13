import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCartItems,
  selectCartTotal,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} from "../redux/cartSlice";
import { useAuth } from "../context/AuthContext";
import { resolveImageUrl } from "../services/api";

export default function Cart() {
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (items.length === 0) {
    return (
      <div className="empty-state cart-empty">
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/categories/all" className="btn btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  function handleCheckout() {
    navigate(isAuthenticated ? "/checkout" : "/login", {
      state: { from: { pathname: "/checkout" } },
    });
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div className="cart-item" key={item.id}>
              <img src={resolveImageUrl(item.image)} alt={item.name} />

              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p className="price">${item.price.toFixed(2)}</p>
              </div>

              <div className="quantity-selector">
                <button
                  onClick={() => dispatch(decreaseQuantity(item.id))}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => dispatch(increaseQuantity(item.id))}>+</button>
              </div>

              <p className="cart-item-subtotal">
                ${(item.price * item.quantity).toFixed(2)}
              </p>

              <button
                className="remove-btn"
                onClick={() => dispatch(removeFromCart(item.id))}
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button className="btn btn-primary btn-large" onClick={handleCheckout}>
            Go to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
