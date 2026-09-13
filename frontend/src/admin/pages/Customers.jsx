import { useEffect, useState, useCallback } from "react";
import { adminGetUsers, adminBlockUser, adminUnblockUser } from "../../services/adminApi";
import PageHeader from "../components/PageHeader";
import AdminLoading from "../components/AdminLoading";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import Toast from "../../components/Toast";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirmTarget, setConfirmTarget] = useState(null); // { user, action: "block" | "unblock" }
  const [toastMsg, setToastMsg] = useState("");

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const data = await adminGetUsers(params);
      setCustomers(data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  async function handleConfirmedAction() {
    const { user, action } = confirmTarget;
    try {
      if (action === "block") await adminBlockUser(user.id);
      else await adminUnblockUser(user.id);

      setCustomers((prev) =>
        prev.map((c) => (c.id === user.id ? { ...c, isBlocked: action === "block" } : c))
      );
      setToastMsg(action === "block" ? "Customer blocked." : "Customer unblocked.");
    } catch (err) {
      setError(err.response?.data?.message || "Action failed.");
    } finally {
      setConfirmTarget(null);
    }
  }

  return (
    <div>
      <Toast open={Boolean(toastMsg)} message={toastMsg} onClose={() => setToastMsg("")} />

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        title={confirmTarget?.action === "block" ? "Block customer?" : "Unblock customer?"}
        message={
          confirmTarget
            ? confirmTarget.action === "block"
              ? `Are you sure you want to block "${confirmTarget.user.name}"? They will not be able to log in.`
              : `Are you sure you want to unblock "${confirmTarget.user.name}"?`
            : ""
        }
        confirmLabel={confirmTarget?.action === "block" ? "Block" : "Unblock"}
        danger={confirmTarget?.action === "block"}
        onConfirm={handleConfirmedAction}
        onCancel={() => setConfirmTarget(null)}
      />

      <PageHeader title="Customers" subtitle="Manage registered customers" />

      <div className="admin-card mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="admin-input max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-input max-w-[160px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Customers</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {loading && <AdminLoading label="Loading customers..." />}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {!loading && !error && (
        <div className="admin-card overflow-x-auto">
          {customers.length === 0 ? (
            <EmptyState message="No customers found." />
          ) : (
            <table className="w-full admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registered</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium">{c.name}</td>
                    <td>{c.email}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>{c.totalOrders}</td>
                    <td>${c.totalSpending.toFixed(2)}</td>
                    <td>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          c.isBlocked
                            ? "bg-red-500/20 text-red-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {c.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td>
                      {c.isBlocked ? (
                        <button
                          className="text-emerald-400 hover:underline text-xs"
                          onClick={() => setConfirmTarget({ user: c, action: "unblock" })}
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          className="text-red-400 hover:underline text-xs"
                          onClick={() => setConfirmTarget({ user: c, action: "block" })}
                        >
                          Block
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
