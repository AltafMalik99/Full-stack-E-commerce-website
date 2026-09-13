import Notification from "../models/Notification.js";

/**
 * Helper used by other controllers to raise an admin notification
 * (new order, new customer, low stock, etc). Not an Express handler.
 */
export async function createNotification(type, message) {
  return Notification.create({ type, message });
}

// GET /api/admin/notifications
export async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ read: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/notifications/:id/read
export async function markNotificationRead(req, res, next) {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found." });
    res.json({ notification });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/notifications/read-all
export async function markAllNotificationsRead(req, res, next) {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ message: "All notifications marked as read." });
  } catch (err) {
    next(err);
  }
}
