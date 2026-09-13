import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { createNotification } from "./notificationController.js";

// GET /api/orders — customer's own orders
export async function getOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ count: orders.length, orders: orders.map(formatOrder) });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/:id — customer's own order
export async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (String(order.user) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this order." });
    }
    res.json({ order: formatOrder(order) });
  } catch (err) {
    next(err);
  }
}

// POST /api/orders — customer places an order (protected)
export async function createOrder(req, res, next) {
  try {
    const { items, shippingInfo, total, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cannot place an order with an empty cart." });
    }

    // Reduce stock for each ordered item
    for (const item of items) {
      if (item.id) {
        await Product.findByIdAndUpdate(item.id, { $inc: { stock: -item.quantity } });
      }
    }

    const order = await Order.create({
      user: req.user._id,
      items: items.map((i) => ({
        product: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      shippingInfo,
      totalAmount: total,
      paymentMethod: paymentMethod || "Cash on Delivery",
      status: "Pending",
    });

    createNotification(
      "new_order",
      `New order #${String(order._id).slice(-6)} placed — $${total.toFixed(2)}`
    ).catch(() => {});

    res.status(201).json({ message: "Order placed successfully", order: formatOrder(order) });
  } catch (err) {
    next(err);
  }
}

// ===== ADMIN =====

// GET /api/admin/orders — all orders, with filters
export async function getAdminOrders(req, res, next) {
  try {
    const { status, search, dateFrom, dateTo } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    let orders = await Order.find(filter).populate("user", "name email").sort({ createdAt: -1 });

    if (search) {
      const term = search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.user?.name?.toLowerCase().includes(term) ||
          o.user?.email?.toLowerCase().includes(term) ||
          String(o._id).includes(term)
      );
    }

    res.json({ count: orders.length, orders: orders.map(formatAdminOrder) });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/orders/:id
export async function getAdminOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json({ order: formatAdminOrder(order) });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/orders/:id/status
export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status." });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate(
      "user",
      "name email"
    );
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (status === "Cancelled") {
      createNotification(
        "cancelled_order",
        `Order #${String(order._id).slice(-6)} was cancelled.`
      ).catch(() => {});
    }

    res.json({ message: "Order status updated", order: formatAdminOrder(order) });
  } catch (err) {
    next(err);
  }
}

function formatOrder(o) {
  return {
    id: o._id,
    items: o.items,
    shippingInfo: o.shippingInfo,
    paymentMethod: o.paymentMethod,
    total: o.totalAmount,
    status: o.status,
    createdAt: o.createdAt,
  };
}

function formatAdminOrder(o) {
  return {
    id: o._id,
    customerName: o.user?.name || "Unknown",
    customerEmail: o.user?.email || "",
    items: o.items,
    shippingInfo: o.shippingInfo,
    paymentMethod: o.paymentMethod,
    total: o.totalAmount,
    status: o.status,
    createdAt: o.createdAt,
  };
}
