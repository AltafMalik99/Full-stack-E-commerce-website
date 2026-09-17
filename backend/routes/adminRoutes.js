import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { handleUpload } from "../middleware/uploadMiddleware.js";

import {
  getDashboardStats,
  getSalesOverview,
  getTopProducts,
  getAnalytics,
} from "../controllers/dashboardController.js";

import {
  
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} from "../controllers/productController.js";


import {
  getAdminCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

import {
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";

import { getUsers, getUserById, blockUser, unblockUser } from "../controllers/userController.js";

import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";

import {
  getAdminReviews,
  approveReview,
  deleteReview,
} from "../controllers/reviewController.js";

import { getContacts, updateContactStatus } from "../controllers/contactController.js";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationController.js";

import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { updateProfile, changePassword } from "../controllers/profileController.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/dashboard", getDashboardStats);
router.get("/dashboard/sales-overview", getSalesOverview);
router.get("/dashboard/top-products", getTopProducts);
router.get("/dashboard/analytics", getAnalytics);

router.get("/products", getAdminProducts);

router.post("/products", handleUpload("image"), createProduct);
router.put("/products/:id", handleUpload("image"), updateProduct);
router.delete("/products/:id", deleteProduct);

router.patch("/products/:id/stock", updateStock);

router.get("/categories", getAdminCategories);
router.get("/categories/:id", getCategoryById);

router.post("/categories", handleUpload("image"), createCategory);
router.put("/categories/:id", handleUpload("image"), updateCategory);
router.delete("/categories/:id", deleteCategory);

router.get("/orders", getAdminOrders);
router.get("/orders/:id", getAdminOrderById);
router.put("/orders/:id/status", updateOrderStatus);





router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/block", blockUser);
router.put("/users/:id/unblock", unblockUser);



router.get("/coupons", getCoupons);
router.post("/coupons", createCoupon);

router.put("/coupons/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);

router.get("/reviews", getAdminReviews);
router.put("/reviews/:id/approve", approveReview);
router.delete("/reviews/:id", deleteReview);

router.get("/contacts", getContacts);
router.put("/contacts/:id/status", updateContactStatus);

router.get("/notifications", getNotifications);
router.put("/notifications/:id/read", markNotificationRead);
router.put("/notifications/read-all", markAllNotificationsRead);

router.get("/settings", getSettings);
router.put("/settings", updateSettings);

router.put("/profile", handleUpload("profileImage"), updateProfile);
router.put("/profile/password", changePassword);

export default router;
