import { useEffect, useState } from "react";
import {
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
} from "../../services/adminApi";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import AdminLoading from "../components/AdminLoading";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import Toast from "../../components/Toast";

const EMPTY_FORM = {
  code: "",
  discountPercentage: "",
  minOrderAmount: "",
  expiryDate: "",
  status: "active",
};

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  async function loadCoupons() {
    try {
      setLoading(true);
      const data = await adminGetCoupons();
      setCoupons(data.coupons);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load coupons.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  function openAddModal() {
    setEditingCoupon(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEditModal(coupon) {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      minOrderAmount: coupon.minOrderAmount,
      expiryDate: coupon.expiryDate?.slice(0, 10) || "",
      status: coupon.status,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validate() {
    const errors = {};
    if (!formData.code.trim()) errors.code = "Coupon code is required.";
    if (!formData.discountPercentage || formData.discountPercentage <= 0 || formData.discountPercentage > 100)
      errors.discountPercentage = "Enter a valid discount percentage (1-100).";
    if (!formData.expiryDate) errors.expiryDate = "Expiry date is required.";
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      ...formData,
      discountPercentage: Number(formData.discountPercentage),
      minOrderAmount: Number(formData.minOrderAmount) || 0,
    };

    try {
      setSaving(true);
      if (editingCoupon) {
        await adminUpdateCoupon(editingCoupon._id, payload);
        setToastMsg("Coupon updated successfully!");
      } else {
        await adminCreateCoupon(payload);
        setToastMsg("Coupon created successfully!");
      }
      setModalOpen(false);
      loadCoupons();
    } catch (err) {
      setFormErrors({ general: err.response?.data?.message || "Failed to save coupon." });
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmedDelete() {
    try {
      await adminDeleteCoupon(deleteTarget._id);
      setCoupons((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      setToastMsg("Coupon deleted.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete coupon.");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <Toast open={Boolean(toastMsg)} message={toastMsg} onClose={() => setToastMsg("")} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete coupon?"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.code}"?` : ""}
        confirmLabel="Delete"
        danger
        onConfirm={handleConfirmedDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <PageHeader
        title="Coupons"
        subtitle="Create and manage discount codes"
        action={
          <button className="admin-btn-primary" onClick={openAddModal}>
            + Add Coupon
          </button>
        }
      />

      {loading && <AdminLoading label="Loading coupons..." />}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {!loading && !error && (
        <div className="admin-card overflow-x-auto">
          {coupons.length === 0 ? (
            <EmptyState message="No coupons created yet." />
          ) : (
            <table className="w-full admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c._id}>
                    <td className="font-mono font-medium">{c.code}</td>
                    <td>{c.discountPercentage}%</td>
                    <td>${c.minOrderAmount}</td>
                    <td>{new Date(c.expiryDate).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          c.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-white/10 text-white/50"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="text-admin-accent2 hover:underline text-xs"
                          onClick={() => openEditModal(c)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-400 hover:underline text-xs"
                          onClick={() => setDeleteTarget(c)}
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

      <Modal
        open={modalOpen}
        title={editingCoupon ? "Edit Coupon" : "Add New Coupon"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {formErrors.general && (
            <p className="bg-red-500/10 text-red-400 text-sm rounded-lg px-3 py-2">
              {formErrors.general}
            </p>
          )}

          <div>
            <label className="block text-sm text-white/70 mb-1">Coupon Code</label>
            <input
              name="code"
              className="admin-input uppercase"
              value={formData.code}
              onChange={handleChange}
            />
            {formErrors.code && <span className="text-red-400 text-xs">{formErrors.code}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Discount (%)</label>
              <input
                type="number"
                name="discountPercentage"
                className="admin-input"
                value={formData.discountPercentage}
                onChange={handleChange}
              />
              {formErrors.discountPercentage && (
                <span className="text-red-400 text-xs">{formErrors.discountPercentage}</span>
              )}
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Min Order ($)</label>
              <input
                type="number"
                name="minOrderAmount"
                className="admin-input"
                value={formData.minOrderAmount}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              className="admin-input"
              value={formData.expiryDate}
              onChange={handleChange}
            />
            {formErrors.expiryDate && (
              <span className="text-red-400 text-xs">{formErrors.expiryDate}</span>
            )}
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Status</label>
            <select name="status" className="admin-input" value={formData.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="admin-btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="admin-btn-primary" disabled={saving}>
              {saving ? "Saving..." : editingCoupon ? "Update Coupon" : "Add Coupon"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
