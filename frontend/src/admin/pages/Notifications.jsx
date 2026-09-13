import { useEffect, useState } from "react";
import {
  adminGetNotifications,
  adminMarkNotificationRead,
  adminMarkAllNotificationsRead,
} from "../../services/adminApi";
import PageHeader from "../components/PageHeader";
import AdminLoading from "../components/AdminLoading";
import EmptyState from "../components/EmptyState";

const TYPE_ICONS = {
  new_order: "🧾",
  new_customer: "👤",
  low_stock: "⚠️",
  new_message: "💬",
  cancelled_order: "❌",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadNotifications() {
    try {
      setLoading(true);
      const data = await adminGetNotifications();
      setNotifications(data.notifications);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function handleMarkRead(id) {
    try {
      await adminMarkNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update notification.");
    }
  }

  async function handleMarkAllRead() {
    try {
      await adminMarkAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update notifications.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Store activity and alerts"
        action={
          <button className="admin-btn-secondary" onClick={handleMarkAllRead}>
            Mark all as read
          </button>
        }
      />

      {loading && <AdminLoading label="Loading notifications..." />}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {!loading && !error && (
        <div className="admin-card">
          {notifications.length === 0 ? (
            <EmptyState message="No notifications yet." />
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`flex items-start gap-3 py-3 ${!n.read ? "bg-white/5 -mx-5 px-5" : ""}`}
                >
                  <span className="text-xl">{TYPE_ICONS[n.type] || "🔔"}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm">{n.message}</p>
                    <p className="text-white/40 text-xs mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.read && (
                    <button
                      className="text-admin-accent2 text-xs hover:underline whitespace-nowrap"
                      onClick={() => handleMarkRead(n._id)}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
