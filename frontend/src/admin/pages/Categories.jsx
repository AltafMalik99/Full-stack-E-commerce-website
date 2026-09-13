import { useEffect, useState, useCallback } from "react";
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "../../services/adminApi";
import { resolveImageUrl } from "../../services/api";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import AdminLoading from "../components/AdminLoading";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import Toast from "../../components/Toast";

const EMPTY_FORM = { name: "", description: "", status: "active" };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminGetCategories(search ? { search } : {});
      setCategories(data.categories);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  function openAddModal() {
    setEditingCategory(null);
    setFormData(EMPTY_FORM);
    setImageFile(null);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEditModal(category) {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      status: category.status,
    });
    setImageFile(null);
    setFormErrors({});
    setModalOpen(true);
  }

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validate() {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Category name is required.";
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => fd.append(key, value));
    if (imageFile) fd.append("image", imageFile);

    try {
      setSaving(true);
      if (editingCategory) {
        await adminUpdateCategory(editingCategory._id, fd);
        setToastMsg("Category updated successfully!");
      } else {
        await adminCreateCategory(fd);
        setToastMsg("Category added successfully!");
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      setFormErrors({ general: err.response?.data?.message || "Failed to save category." });
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmedDelete() {
    try {
      await adminDeleteCategory(deleteTarget._id);
      setCategories((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      setToastMsg("Category deleted.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete category.");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <Toast open={Boolean(toastMsg)} message={toastMsg} onClose={() => setToastMsg("")} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete category?"
        message={
          deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"?` : ""
        }
        confirmLabel="Delete"
        danger
        onConfirm={handleConfirmedDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <PageHeader
        title="Categories"
        subtitle="Organize your products into categories"
        action={
          <button className="admin-btn-primary" onClick={openAddModal}>
            + Add Category
          </button>
        }
      />

      <div className="admin-card mb-6">
        <input
          type="text"
          placeholder="Search categories..."
          className="admin-input max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <AdminLoading label="Loading categories..." />}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {!loading && !error && (
        <div className="admin-card overflow-x-auto">
          {categories.length === 0 ? (
            <EmptyState message="No categories found." />
          ) : (
            <table className="w-full admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <img
                        src={resolveImageUrl(c.image)}
                        alt={c.name}
                        className="w-10 h-10 rounded-lg object-cover bg-white/10"
                      />
                    </td>
                    <td className="font-medium">{c.name}</td>
                    <td className="max-w-xs truncate">{c.description}</td>
                    <td>{c.productCount}</td>
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
        title={editingCategory ? "Edit Category" : "Add New Category"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {formErrors.general && (
            <p className="bg-red-500/10 text-red-400 text-sm rounded-lg px-3 py-2">
              {formErrors.general}
            </p>
          )}

          <div>
            <label className="block text-sm text-white/70 mb-1">Category Name</label>
            <input
              name="name"
              className="admin-input"
              value={formData.name}
              onChange={handleChange}
            />
            {formErrors.name && <span className="text-red-400 text-xs">{formErrors.name}</span>}
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Description</label>
            <textarea
              name="description"
              rows="3"
              className="admin-input"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Status</label>
            <select name="status" className="admin-input" value={formData.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">
              Category Image {editingCategory && "(leave empty to keep current image)"}
            </label>
            <input
              type="file"
              accept="image/*"
              className="admin-input"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="admin-btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="admin-btn-primary" disabled={saving}>
              {saving ? "Saving..." : editingCategory ? "Update Category" : "Add Category"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
