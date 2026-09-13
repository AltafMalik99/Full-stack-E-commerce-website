import { useEffect, useState, useCallback } from "react";
import { adminGetReviews, adminApproveReview, adminDeleteReview } from "../../services/adminApi";
import PageHeader from "../components/PageHeader";
import AdminLoading from "../components/AdminLoading";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import Toast from "../../components/Toast";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [approvedFilter, setApprovedFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (approvedFilter) params.approved = approvedFilter;
      const data = await adminGetReviews(params);
      setReviews(data.reviews);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, [search, approvedFilter]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  async function handleApprove(id) {
    try {
      const data = await adminApproveReview(id);
      setReviews((prev) => prev.map((r) => (r._id === id ? data.review : r)));
      setToastMsg("Review approved.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve review.");
    }
  }

  async function handleConfirmedDelete() {
    try {
      await adminDeleteReview(deleteTarget._id);
      setReviews((prev) => prev.filter((r) => r._id !== deleteTarget._id));
      setToastMsg("Review deleted.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete review.");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <Toast open={Boolean(toastMsg)} message={toastMsg} onClose={() => setToastMsg("")} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete review?"
        message="Are you sure you want to delete this review? This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleConfirmedDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <PageHeader title="Reviews" subtitle="Moderate product reviews and ratings" />

      <div className="admin-card mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search reviews..."
          className="admin-input max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-input max-w-[180px]"
          value={approvedFilter}
          onChange={(e) => setApprovedFilter(e.target.value)}
        >
          <option value="">All Reviews</option>
          <option value="true">Approved</option>
          <option value="false">Pending Approval</option>
        </select>
      </div>

      {loading && <AdminLoading label="Loading reviews..." />}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {!loading && !error && (
        <div className="admin-card overflow-x-auto">
          {reviews.length === 0 ? (
            <EmptyState message="No reviews found." />
          ) : (
            <table className="w-full admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r._id}>
                    <td>{r.product?.name}</td>
                    <td>{r.userName}</td>
                    <td>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</td>
                    <td className="max-w-xs truncate">{r.comment}</td>
                    <td>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          r.approved
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {r.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {!r.approved && (
                          <button
                            className="text-emerald-400 hover:underline text-xs"
                            onClick={() => handleApprove(r._id)}
                          >
                            Approve
                          </button>
                        )}
                        <button
                          className="text-red-400 hover:underline text-xs"
                          onClick={() => setDeleteTarget(r)}
                        >
                          Delete
                        </button>
                      </div>
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
