import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectCartItems, selectCartTotal, clearCart } from "../redux/cartSlice";
import { createOrder, clearLastOrder } from "../redux/orderSlice";
import Invoice from "../components/Invoice";

export default function Checkout() {
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const { status, error, lastOrder } = useSelector((state) => state.orders);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState({});

  function handleChange(e) {
    setShippingInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validate() {
    const errors = {};
    if (!shippingInfo.name.trim()) errors.name = "Name is required.";
    if (!shippingInfo.address.trim()) errors.address = "Address is required.";
    if (!shippingInfo.city.trim()) errors.city = "City is required.";
    if (!shippingInfo.phone.trim()) errors.phone = "Phone is required.";
    return errors;
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Snapshot the cart items with full details so the invoice has
    // everything it needs even after the cart is cleared.
    const orderData = {
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      shippingInfo,
      total,
    };

    const result = await dispatch(createOrder(orderData));
    if (createOrder.fulfilled.match(result)) {
      dispatch(clearCart());
    }
  }

  // After a successful order, show the full bill/invoice instead of the form.
  if (lastOrder) {
    return (
      <div className="checkout-page">
        <Invoice
          order={lastOrder}
          onDone={() => {
            dispatch(clearLastOrder());
            navigate("/");
          }}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <h2>Your cart is empty</h2>
        <p>Add some products before checking out.</p>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handlePlaceOrder} noValidate>
          <h2>Shipping Information</h2>

          {typeof error === "string" && <p className="form-error-banner">{error}</p>}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={shippingInfo.name}
              onChange={handleChange}
            />
            {formErrors.name && <span className="field-error">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              type="text"
              name="address"
              value={shippingInfo.address}
              onChange={handleChange}
            />
            {formErrors.address && <span className="field-error">{formErrors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              name="city"
              value={shippingInfo.city}
              onChange={handleChange}
            />
            {formErrors.city && <span className="field-error">{formErrors.city}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={shippingInfo.phone}
              onChange={handleChange}
            />
            {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
          </div>

          <button
            className="btn btn-primary btn-large"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        <div className="order-summary">
          <h2>Order Summary</h2>
          {items.map((item) => (
            <div className="summary-row" key={item.id}>
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
