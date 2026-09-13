import User from "../models/User.js";
import Order from "../models/Order.js";

// GET /api/admin/users — list customers with search/filter
export async function getUsers(req, res, next) {
  try {
    const { search, status } = req.query;
    const filter = { role: "user" };

    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }
    if (status === "blocked") filter.isBlocked = true;
    if (status === "active") filter.isBlocked = false;

    const users = await User.find(filter).sort({ createdAt: -1 });

    // Attach order stats per customer
    const withStats = await Promise.all(
      users.map(async (u) => {
        const orders = await Order.find({ user: u._id });
        const totalSpending = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        return {
          ...u.toSafeObject(),
          totalOrders: orders.length,
          totalSpending,
        };
      })
    );

    res.json({ count: withStats.length, users: withStats });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/users/:id
export async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
    const totalSpending = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({
      user: { ...user.toSafeObject(), totalOrders: orders.length, totalSpending },
      orders,
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/users/:id/block
export async function blockUser(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User blocked", user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/users/:id/unblock
export async function unblockUser(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User unblocked", user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}
