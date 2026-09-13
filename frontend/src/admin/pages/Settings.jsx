import { useEffect, useState } from "react";
import { adminGetSettings, adminUpdateSettings } from "../../services/adminApi";
import PageHeader from "../components/PageHeader";
import AdminLoading from "../components/AdminLoading";
import Toast from "../../components/Toast";

export default function Settings() {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    adminGetSettings()
      .then((data) => setFormData(data.settings))
      .catch((err) => setError(err.response?.data?.message || "Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const data = await adminUpdateSettings(formData);
      setFormData(data.settings);
      setToastMsg("Settings saved successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLoading label="Loading settings..." />;
  if (!formData) return <p className="text-red-400">{error}</p>;

  return (
    <div>
      <Toast open={Boolean(toastMsg)} message={toastMsg} onClose={() => setToastMsg("")} />

      <PageHeader title="Store Settings" subtitle="Manage your store's basic configuration" />

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="admin-card max-w-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Store Name</label>
            <input
              name="storeName"
              className="admin-input"
              value={formData.storeName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Store Email</label>
            <input
              type="email"
              name="storeEmail"
              className="admin-input"
              value={formData.storeEmail}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Contact Number</label>
            <input
              name="contactNumber"
              className="admin-input"
              value={formData.contactNumber}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Currency</label>
            <input
              name="currency"
              className="admin-input"
              value={formData.currency}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Store Address</label>
          <textarea
            name="address"
            rows="2"
            className="admin-input"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Shipping Charges ($)</label>
            <input
              type="number"
              name="shippingCharges"
              className="admin-input"
              value={formData.shippingCharges}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Min Order Amount ($)</label>
            <input
              type="number"
              name="minOrderAmount"
              className="admin-input"
              value={formData.minOrderAmount}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Store Status</label>
            <select
              name="storeStatus"
              className="admin-input"
              value={formData.storeStatus}
              onChange={handleChange}
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button type="submit" className="admin-btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
