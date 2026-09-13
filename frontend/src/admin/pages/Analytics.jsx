import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getAnalytics, getSalesOverview, getTopProducts } from "../../services/adminApi";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import AdminLoading from "../components/AdminLoading";
import "../admin.css";

const PIE_COLORS = ["#7c5cff", "#3fa9f5", "#34d399", "#fbbf24", "#f87171"];

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        const [analyticsRes, topRes] = await Promise.all([
          getAnalytics(),
          getTopProducts(),
        ]);
        setAnalytics(analyticsRes);
        setTopProducts(topRes.topProducts);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  if (loading) return <AdminLoading label="Loading analytics..." />;
  if (error) return <p className="text-red-400">{error}</p>;
  if (!analytics) return null;

  const pieData = topProducts.map((p) => ({ name: p.name, value: p.unitsSold }));

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Sales performance and best sellers" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Today's Sales" value={`$${analytics.todaySales.toFixed(2)}`} icon="📅" accent="from-purple-600 to-indigo-500" />
        <StatCard label="Weekly Sales" value={`$${analytics.weekSales.toFixed(2)}`} icon="🗓️" accent="from-blue-600 to-cyan-500" />
        <StatCard label="Monthly Sales" value={`$${analytics.monthSales.toFixed(2)}`} icon="📈" accent="from-emerald-600 to-teal-500" />
        <StatCard label="New Customers (Month)" value={analytics.newCustomersThisMonth} icon="🆕" accent="from-orange-500 to-amber-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="admin-card">
          <p className="text-white/50 text-xs">Today's Orders</p>
          <p className="text-xl font-bold text-white">{analytics.todayOrders}</p>
        </div>
        <div className="admin-card">
          <p className="text-white/50 text-xs">This Week's Orders</p>
          <p className="text-xl font-bold text-white">{analytics.weekOrders}</p>
        </div>
        <div className="admin-card">
          <p className="text-white/50 text-xs">This Month's Orders</p>
          <p className="text-xl font-bold text-white">{analytics.monthOrders}</p>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="text-white font-semibold mb-4">Best Selling Products (by units sold)</h3>
        {pieData.length === 0 ? (
          <p className="text-white/40 text-sm">No sales data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#1c2038", border: "none", borderRadius: 8 }} />
              <Legend wrapperStyle={{ color: "#fff", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
