import express from "express";
import { getCategories } from "../controllers/categoryController.js";

const router = express.Router();

// Public — customer website (category nav, filters)
router.get("/", getCategories);

export default router;
