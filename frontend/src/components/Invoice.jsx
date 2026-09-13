// Full order invoice/bill shown after a successful checkout.
// Receives the created order object (id, items, shippingInfo, total, createdAt).
export default function Invoice({ order, onDone }) {
  if (!order) return null;

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString()
    : new Date().toLocaleString();

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  function handlePrint() {
    window.print();
  }

  return (
    <div className="invoice-wrapper">
      <div className="invoice-success-banner">
        <span className="toast-icon">✓</span>
        <h2>Order Placed Successfully!</h2>
        <p>Thank you for your purchase. Here is your bill.</p>
      </div>

      <div className="invoice" id="invoice-print-area">
        <div className="invoice-header">
          <div>
            <h2 className="logo">SHOP.CO</h2>
            <p className="invoice-muted">Order Invoice</p>
          </div>
          <div className="invoice-meta">
            <p>
              <strong>Order #:</strong> {order.id}
            </p>
            <p>
              <strong>Date:</strong> {orderDate}
            </p>
            <p>
              <strong>Status:</strong> {order.status || "pending"}
            </p>
          </div>
        </div>

        <div className="invoice-shipping">
          <h4>Shipping To</h4>
          <p>{order.shippingInfo?.name}</p>
          <p>{order.shippingInfo?.address}</p>
          <p>{order.shippingInfo?.city}</p>
          <p>{order.shippingInfo?.phone}</p>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-totals">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total Paid</span>
            <span>${(order.total ?? subtotal).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="invoice-actions">
        <button className="btn btn-secondary" onClick={handlePrint}>
          Print / Save Bill
        </button>
        <button className="btn btn-primary" onClick={onDone}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
