import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

const LOW_STOCK_THRESHOLD = 5;

// GET /api/admin/dashboard — top-level stats for the dashboard page
export async function getDashboardStats(req, res, next) {
  try {
    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      lowStockProducts,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      allOrders,
      recentOrders,
      recentCustomers,
    ] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ role: "user" }),
      Order.countDocuments(),
      Product.countDocuments({ stock: { $gt: 0, $lte: LOW_STOCK_THRESHOLD } }),
      Order.countDocuments({ status: "Pending" }),
      Order.countDocuments({ status: "Processing" }),
      Order.countDocuments({ status: "Shipped" }),
      Order.countDocuments({ status: "Delivered" }),
      Order.countDocuments({ status: "Cancelled" }),
      Order.find({ status: { $ne: "Cancelled" } }),
      Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(5),
      User.find({ role: "user" }).sort({ createdAt: -1 }).limit(5),
    ]);

    const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({
      totalProducts,
      totalCustomers,
      totalOrders,
      totalRevenue,
      lowStockProducts,
      ordersByStatus: {
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o._id,
        customerName: o.user?.name || "Unknown",
        total: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt,
      })),
      recentCustomers: recentCustomers.map((c) => ({
        id: c._id,
        name: c.name,
        email: c.email,
        createdAt: c.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/dashboard/sales-overview — monthly sales for the last 12 months (for the bar chart)
export async function getSalesOverview(req, res, next) {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      createdAt: { $gte: twelveMonthsAgo },
      status: { $ne: "Cancelled" },
    });

    const monthLabels = [];
    const monthlyTotals = {};
    for (let i = 0; i < 12; i++) {
      const d = new Date(twelveMonthsAgo);
      d.setMonth(d.getMonth() + i);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleString("default", { month: "short" });
      monthLabels.push({ key, label });
      monthlyTotals[key] = 0;
    }

    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthlyTotals[key] !== undefined) monthlyTotals[key] += o.totalAmount;
    });

    res.json({
      labels: monthLabels.map((m) => m.label),
      values: monthLabels.map((m) => Number(monthlyTotals[m.key].toFixed(2))),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/dashboard/top-products — best sellers by units sold
export async function getTopProducts(req, res, next) {
  try {
    const orders = await Order.find({ status: { $ne: "Cancelled" } });
    const salesByProduct = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.product ? String(item.product) : item.name;
        if (!salesByProduct[key]) {
          salesByProduct[key] = { name: item.name, unitsSold: 0, revenue: 0 };
        }
        salesByProduct[key].unitsSold += item.quantity;
        salesByProduct[key].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(salesByProduct)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    res.json({ topProducts });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/dashboard/analytics — today/week/month sales + best categories
export async function getAnalytics(req, res, next) {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayOrders, weekOrders, monthOrders, newCustomersThisMonth] = await Promise.all([
      Order.find({ createdAt: { $gte: startOfToday }, status: { $ne: "Cancelled" } }),
      Order.find({ createdAt: { $gte: startOfWeek }, status: { $ne: "Cancelled" } }),
      Order.find({ createdAt: { $gte: startOfMonth }, status: { $ne: "Cancelled" } }),
      User.countDocuments({ role: "user", createdAt: { $gte: startOfMonth } }),
    ]);

    const sum = (orders) => orders.reduce((s, o) => s + o.totalAmount, 0);

    res.json({
      todaySales: sum(todayOrders),
      weekSales: sum(weekOrders),
      monthSales: sum(monthOrders),
      todayOrders: todayOrders.length,
      weekOrders: weekOrders.length,
      monthOrders: monthOrders.length,
      newCustomersThisMonth,
    });
  } catch (err) {
    next(err);
  }
}
