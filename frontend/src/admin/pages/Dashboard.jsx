import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  getDashboardStats,
  getSalesOverview,
  getTopProducts,
} from "../../services/adminApi";
import StatCard from "../components/StatCard";
import PageHeader from "../components/PageHeader";
import AdminLoading from "../components/AdminLoading";
import "../admin.css";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        const [statsRes, salesRes, topRes] = await Promise.all([
          getDashboardStats(),
          getSalesOverview(),
          getTopProducts(),
        ]);
        setStats(statsRes);
        setSalesData(
          salesRes.labels.map((label, i) => ({ month: label, sales: salesRes.values[i] }))
        );
        setTopProducts(topRes.topProducts);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  if (loading) return <AdminLoading label="Loading dashboard..." />;
  if (error) return <p className="text-red-400">{error}</p>;
  if (!stats) return null;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your store's performance"
      />

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon="💰" accent="from-purple-600 to-indigo-500" />
        <StatCard label="Total Orders" value={stats.totalOrders} icon="🧾" accent="from-blue-600 to-cyan-500" />
        <StatCard label="Total Customers" value={stats.totalCustomers} icon="👥" accent="from-emerald-600 to-teal-500" />
        <StatCard label="Total Products" value={stats.totalProducts} icon="📦" accent="from-orange-500 to-amber-500" />
      </div>

      {/* Order status breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="admin-card">
          <p className="text-white/50 text-xs">Pending</p>
          <p className="text-xl font-bold text-white">{stats.ordersByStatus.pending}</p>
        </div>
        <div className="admin-card">
          <p className="text-white/50 text-xs">Processing</p>
          <p className="text-xl font-bold text-white">{stats.ordersByStatus.processing}</p>
        </div>
        <div className="admin-card">
          <p className="text-white/50 text-xs">Shipped</p>
          <p className="text-xl font-bold text-white">{stats.ordersByStatus.shipped}</p>
        </div>
        <div className="admin-card">
          <p className="text-white/50 text-xs">Delivered</p>
          <p className="text-xl font-bold text-white">{stats.ordersByStatus.delivered}</p>
        </div>
        <div className="admin-card">
          <p className="text-white/50 text-xs">Cancelled</p>
          <p className="text-xl font-bold text-white">{stats.ordersByStatus.cancelled}</p>
        </div>
      </div>

      {stats.lowStockProducts > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl px-4 py-3 mb-6 text-sm">
          ⚠️ {stats.lowStockProducts} product(s) are running low on stock.{" "}
          <Link to="/admin/inventory" className="underline">
            View inventory
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link to="/admin/products?new=1" className="admin-btn-primary">
          + Add Product
        </Link>
        <Link to="/admin/products" className="admin-btn-secondary">
          View Products
        </Link>
        <Link to="/admin/orders" className="admin-btn-secondary">
          View Orders
        </Link>
        <Link to="/admin/customers" className="admin-btn-secondary">
          View Customers
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales chart */}
        <div className="admin-card lg:col-span-2">
          <h3 className="text-white font-semibold mb-4">Sales Overview (Last 12 Months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "#1c2038", border: "none", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }}
              />
              <Bar dataKey="sales" fill="#7c5cff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top selling products */}
        <div className="admin-card">
          <h3 className="text-white font-semibold mb-4">Top Selling Products</h3>
          {topProducts.length === 0 ? (
            <p className="text-white/40 text-sm">No sales yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-white">{p.name}</p>
                    <p className="text-white/40 text-xs">{p.unitsSold} sold</p>
                  </div>
                  <span className="text-emerald-400 font-medium">
                    ${p.revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent orders */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Recent Orders</h3>
            <Link to="/admin/orders" className="text-admin-accent text-sm">
              View all
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-white/40 text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-white">{o.customerName}</p>
                    <p className="text-white/40 text-xs">#{String(o.id).slice(-6)}</p>
                  </div>
                  <span className="text-white/70">${o.total.toFixed(2)}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent customers */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Recent Customers</h3>
            <Link to="/admin/customers" className="text-admin-accent text-sm">
              View all
            </Link>
          </div>
          {stats.recentCustomers.length === 0 ? (
            <p className="text-white/40 text-sm">No customers yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentCustomers.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-white">{c.name}</p>
                    <p className="text-white/40 text-xs">{c.email}</p>
                  </div>
                  <span className="text-white/40 text-xs">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
