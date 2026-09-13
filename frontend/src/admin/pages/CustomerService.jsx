import { useEffect, useState, useCallback } from "react";
import { adminGetContacts, adminUpdateContactStatus } from "../../services/adminApi";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import AdminLoading from "../components/AdminLoading";
import EmptyState from "../components/EmptyState";
import Toast from "../../components/Toast";

const STATUSES = ["New", "In Progress", "Resolved"];
const STATUS_COLORS = {
  New: "bg-blue-500/20 text-blue-400",
  "In Progress": "bg-amber-500/20 text-amber-400",
  Resolved: "bg-emerald-500/20 text-emerald-400",
};

export default function CustomerService() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const data = await adminGetContacts(params);
      setContacts(data.contacts);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  async function handleStatusChange(id, status) {
    try {
      const data = await adminUpdateContactStatus(id, status);
      setContacts((prev) => prev.map((c) => (c._id === id ? data.contact : c)));
      if (selected?._id === id) setSelected(data.contact);
      setToastMsg("Status updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    }
  }

  return (
    <div>
      <Toast open={Boolean(toastMsg)} message={toastMsg} onClose={() => setToastMsg("")} />

      <PageHeader title="Customer Service" subtitle="Support requests and contact messages" />

      <div className="admin-card mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search messages..."
          className="admin-input max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-input max-w-[180px]"
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
      </div>

      {loading && <AdminLoading label="Loading messages..." />}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {!loading && !error && (
        <div className="admin-card overflow-x-auto">
          {contacts.length === 0 ? (
            <EmptyState message="No support messages yet." />
          ) : (
            <table className="w-full admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c._id}>
                    <td className="font-medium">{c.name}</td>
                    <td>{c.email}</td>
                    <td className="max-w-xs truncate">{c.message}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="text-admin-accent2 hover:underline text-xs"
                        onClick={() => setSelected(c)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal open={Boolean(selected)} title="Support Message" onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-white/50 text-xs">From</p>
              <p>{selected.name} ({selected.email})</p>
            </div>
            <div>
              <p className="text-white/50 text-xs">Message</p>
              <p className="whitespace-pre-wrap">{selected.message}</p>
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1">Status</label>
              <select
                className="admin-input"
                value={selected.status}
                onChange={(e) => handleStatusChange(selected._id, e.target.value)}
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
