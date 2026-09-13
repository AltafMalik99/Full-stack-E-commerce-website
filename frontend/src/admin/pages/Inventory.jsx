import { useEffect, useState, useCallback } from "react";
import { adminGetProducts, adminUpdateStock } from "../../services/adminApi";
import { resolveImageUrl } from "../../services/api";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import AdminLoading from "../components/AdminLoading";
import EmptyState from "../components/EmptyState";
import Toast from "../../components/Toast";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockFilter, setStockFilter] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (stockFilter) params.stock = stockFilter;
      const data = await adminGetProducts(params);
      setProducts(data.products);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }, [stockFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleStockChange(id, change) {
    try {
      const data = await adminUpdateStock(id, change);
      setProducts((prev) => prev.map((p) => (p.id === id ? data.product : p)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update stock.");
    }
  }

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div>
      <Toast open={Boolean(toastMsg)} message={toastMsg} onClose={() => setToastMsg("")} />

      <PageHeader title="Inventory" subtitle="Track and adjust stock levels" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Stock (units)" value={totalStock} icon="📦" accent="from-blue-600 to-cyan-500" />
        <StatCard label="Low Stock Products" value={lowStockCount} icon="⚠️" accent="from-amber-500 to-orange-500" />
        <StatCard label="Out of Stock" value={outOfStockCount} icon="🚫" accent="from-red-600 to-rose-500" />
      </div>

      <div className="admin-card mb-6">
        <select
          className="admin-input max-w-[200px]"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
        >
          <option value="">All Products</option>
          <option value="low">Low Stock (≤5)</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {loading && <AdminLoading label="Loading inventory..." />}
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
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Adjust</th>
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
                    <td>{p.stock}</td>
                    <td>
                      {p.stock === 0 ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                          Out of Stock
                        </span>
                      ) : p.stock <= 5 ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
                          Low Stock
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          className="w-7 h-7 rounded bg-white/10 hover:bg-white/20"
                          onClick={() => handleStockChange(p.id, -1)}
                          disabled={p.stock <= 0}
                        >
                          −
                        </button>
                        <button
                          className="w-7 h-7 rounded bg-white/10 hover:bg-white/20"
                          onClick={() => handleStockChange(p.id, 1)}
                        >
                          +
                        </button>
                        <button
                          className="text-xs text-admin-accent2 hover:underline ml-2"
                          onClick={() => handleStockChange(p.id, 10)}
                        >
                          +10
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
