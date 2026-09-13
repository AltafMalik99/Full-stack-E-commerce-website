import express from "express";
import { getOrders, getOrderById, createOrder } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateCheckout } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);
router.post("/", protect, validateCheckout, createOrder);

export default router;
