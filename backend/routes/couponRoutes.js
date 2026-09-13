import express from "express";
import { validateCoupon } from "../controllers/couponController.js";

const router = express.Router();

// Public — used at checkout to apply a coupon code
router.post("/validate", validateCoupon);

export default router;
