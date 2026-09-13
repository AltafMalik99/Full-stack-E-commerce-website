import { useEffect, useState, useCallback } from "react";
import { adminGetOrders, adminUpdateOrderStatus } from "../../services/adminApi";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import AdminLoading from "../components/AdminLoading";
import EmptyState from "../components/EmptyState";
import Toast from "../../components/Toast";

const STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

const STATUS_COLORS = {
  Pending: "bg-amber-500/20 text-amber-400",
  Confirmed: "bg-blue-500/20 text-blue-400",
  Processing: "bg-indigo-500/20 text-indigo-400",
  Shipped: "bg-cyan-500/20 text-cyan-400",
  Delivered: "bg-emerald-500/20 text-emerald-400",
  Cancelled: "bg-red-500/20 text-red-400",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const data = await adminGetOrders(params);
      setOrders(data.orders);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleStatusChange(orderId, newStatus) {
    try {
      const data = await adminUpdateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      if (selectedOrder?.id === orderId) setSelectedOrder(data.order);
      setToastMsg("Order status updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order status.");
    }
  }

  return (
    <div>
      <Toast open={Boolean(toastMsg)} message={toastMsg} onClose={() => setToastMsg("")} />

      <PageHeader title="Orders" subtitle="View and manage customer orders" />

      <div className="admin-card mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by customer or order ID..."
          className="admin-input max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-input max-w-[160px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="admin-input max-w-[160px]"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          className="admin-input max-w-[160px]"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>

      {loading && <AdminLoading label="Loading orders..." />}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {!loading && !error && (
        <div className="admin-card overflow-x-auto">
          {orders.length === 0 ? (
            <EmptyState message="No orders found." />
          ) : (
            <table className="w-full admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="font-mono text-xs">#{String(o.id).slice(-6)}</td>
                    <td>
                      <p>{o.customerName}</p>
                      <p className="text-white/40 text-xs">{o.customerEmail}</p>
                    </td>
                    <td>${o.total.toFixed(2)}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="text-admin-accent2 hover:underline text-xs"
                        onClick={() => setSelectedOrder(o)}
                      >
                        View / Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal
        open={Boolean(selectedOrder)}
        title={selectedOrder ? `Order #${String(selectedOrder.id).slice(-6)}` : ""}
        onClose={() => setSelectedOrder(null)}
        wide
      >
        {selectedOrder && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/50 text-xs mb-1">Customer</p>
                <p>{selectedOrder.customerName}</p>
                <p className="text-white/40 text-xs">{selectedOrder.customerEmail}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs mb-1">Shipping Address</p>
                <p>{selectedOrder.shippingInfo?.address}</p>
                <p>{selectedOrder.shippingInfo?.city}</p>
                <p>{selectedOrder.shippingInfo?.phone}</p>
              </div>
            </div>

            <div>
              <p className="text-white/50 text-xs mb-2">Items</p>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex justify-between border-t border-white/5 pt-2">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between font-semibold border-t border-white/10 pt-3">
              <span>Total</span>
              <span>${selectedOrder.total.toFixed(2)}</span>
            </div>

            <div>
              <p className="text-white/50 text-xs mb-1">Payment Method</p>
              <p>{selectedOrder.paymentMethod}</p>
            </div>

            <div>
              <label className="block text-white/50 text-xs mb-1">Update Order Status</label>
              <select
                className="admin-input"
                value={selectedOrder.status}
                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
