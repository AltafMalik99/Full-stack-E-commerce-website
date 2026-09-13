import express from "express";
import { getProducts, getProductById } from "../controllers/productController.js";
import { createReview, getProductReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public — customer website
router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/:id/reviews", getProductReviews);
router.post("/:id/reviews", protect, createReview);

export default router;
