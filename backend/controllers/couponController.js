import Coupon from "../models/Coupon.js";

// GET /api/admin/coupons
export async function getCoupons(req, res, next) {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ count: coupons.length, coupons });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/coupons
export async function createCoupon(req, res, next) {
  try {
    const existing = await Coupon.findOne({ code: req.body.code?.toUpperCase() });
    if (existing) {
      return res.status(409).json({ message: "A coupon with this code already exists." });
    }
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ message: "Coupon created", coupon });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/coupons/:id
export async function updateCoupon(req, res, next) {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!coupon) return res.status(404).json({ message: "Coupon not found." });
    res.json({ message: "Coupon updated", coupon });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/coupons/:id
export async function deleteCoupon(req, res, next) {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found." });
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    next(err);
  }
}

// POST /api/coupons/validate — public, used at checkout
export async function validateCoupon(req, res, next) {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code?.toUpperCase(), status: "active" });

    if (!coupon) return res.status(404).json({ message: "Invalid or inactive coupon code." });
    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: "This coupon has expired." });
    }
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount for this coupon is $${coupon.minOrderAmount}.`,
      });
    }

    res.json({ coupon });
  } catch (err) {
    next(err);
  }
}
