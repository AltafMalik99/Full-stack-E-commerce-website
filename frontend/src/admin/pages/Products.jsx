import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetCategories,
} from "../../services/adminApi";
import { resolveImageUrl } from "../../services/api";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import AdminLoading from "../components/AdminLoading";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import Toast from "../../components/Toast";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  oldPrice: "",
  discount: "",
  category: "",
  brand: "",
  stock: "",
  color: "",
  size: "",
  status: "active",
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("");

  const [modalOpen, setModalOpen] = useState(searchParams.get("new") === "1");
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (sort) params.sort = sort;

      const data = await adminGetProducts(params);
      setProducts(data.products);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter, sort]);

  useEffect(() => {
    adminGetCategories().then((data) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function openAddModal() {
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setImageFile(null);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEditModal(product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice || "",
      discount: product.discount || "",
      category: product.categoryId || "",
      brand: product.brand || "",
      stock: product.stock,
      color: product.color || "",
      size: product.size || "",
      status: product.status,
    });
    setImageFile(null);
    setFormErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSearchParams({});
  }

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validate() {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Product name is required.";
    if (!formData.description.trim()) errors.description = "Description is required.";
    if (!formData.price || Number(formData.price) <= 0) errors.price = "Enter a valid price.";
    if (!formData.category) errors.category = "Select a category.";
    if (formData.stock === "" || Number(formData.stock) < 0)
      errors.stock = "Enter a valid stock quantity.";
    if (!editingProduct && !imageFile) errors.image = "Product image is required.";
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
      if (editingProduct) {
        await adminUpdateProduct(editingProduct.id, fd);
        setToastMsg("Product updated successfully!");
      } else {
        await adminCreateProduct(fd);
        setToastMsg("Product added successfully!");
      }
      closeModal();
      loadProducts();
    } catch (err) {
      setFormErrors({ general: err.response?.data?.message || "Failed to save product." });
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmedDelete() {
    try {
      await adminDeleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setToastMsg("Product deleted.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <Toast open={Boolean(toastMsg)} message={toastMsg} onClose={() => setToastMsg("")} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product?"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"?` : ""}
        confirmLabel="Delete"
        danger
        onConfirm={handleConfirmedDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <PageHeader
        title="Products"
        subtitle="Manage your store's product catalog"
        action={
          <button className="admin-btn-primary" onClick={openAddModal}>
            + Add Product
          </button>
        }
      />

      {/* Filters */}
      <div className="admin-card mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search products..."
          className="admin-input max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-input max-w-[180px]"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="admin-input max-w-[160px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          className="admin-input max-w-[180px]"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Sort: Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading && <AdminLoading label="Loading products..." />}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {!loading && !error && (
        <div className="admin-card overflow-x-auto">
          {products.length === 0 ? (
            <EmptyState message="No products found." />
          ) : (
            <table className="w-full admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={resolveImageUrl(p.image)}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-white/10"
                      />
                    </td>
                    <td className="font-medium">{p.name}</td>
                    <td>{p.category}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>
                      <span className={p.stock <= 5 ? "text-amber-400" : ""}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          p.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-white/10 text-white/50"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="text-admin-accent2 hover:underline text-xs"
                          onClick={() => openEditModal(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-400 hover:underline text-xs"
                          onClick={() => setDeleteTarget(p)}
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
        title={editingProduct ? "Edit Product" : "Add New Product"}
        onClose={closeModal}
        wide
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {formErrors.general && (
            <p className="bg-red-500/10 text-red-400 text-sm rounded-lg px-3 py-2">
              {formErrors.general}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Product Name</label>
              <input
                name="name"
                className="admin-input"
                value={formData.name}
                onChange={handleChange}
              />
              {formErrors.name && <span className="text-red-400 text-xs">{formErrors.name}</span>}
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Category</label>
              <select
                name="category"
                className="admin-input"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {formErrors.category && (
                <span className="text-red-400 text-xs">{formErrors.category}</span>
              )}
            </div>
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
            {formErrors.description && (
              <span className="text-red-400 text-xs">{formErrors.description}</span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                name="price"
                className="admin-input"
                value={formData.price}
                onChange={handleChange}
              />
              {formErrors.price && <span className="text-red-400 text-xs">{formErrors.price}</span>}
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Old Price ($)</label>
              <input
                type="number"
                step="0.01"
                name="oldPrice"
                className="admin-input"
                value={formData.oldPrice}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Discount (%)</label>
              <input
                type="number"
                name="discount"
                className="admin-input"
                value={formData.discount}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Stock</label>
              <input
                type="number"
                name="stock"
                className="admin-input"
                value={formData.stock}
                onChange={handleChange}
              />
              {formErrors.stock && <span className="text-red-400 text-xs">{formErrors.stock}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Brand</label>
              <input name="brand" className="admin-input" value={formData.brand} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Color</label>
              <input name="color" className="admin-input" value={formData.color} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Size</label>
              <input name="size" className="admin-input" value={formData.size} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Status</label>
              <select name="status" className="admin-input" value={formData.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">
              Product Image {editingProduct && "(leave empty to keep current image)"}
            </label>
            <input
              type="file"
              accept="image/*"
              className="admin-input"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
            {formErrors.image && <span className="text-red-400 text-xs">{formErrors.image}</span>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="admin-btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="admin-btn-primary" disabled={saving}>
              {saving ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
