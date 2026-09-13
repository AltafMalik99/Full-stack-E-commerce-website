import Review from "../models/Review.js";
import Product from "../models/Product.js";

// POST /api/products/:id/reviews — customer, protected
export async function createReview(req, res, next) {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });

    const review = await Review.create({
      product: product._id,
      user: req.user._id,
      userName: req.user.name,
      rating,
      comment,
    });

    // Recalculate the product's average rating
    const allReviews = await Review.find({ product: product._id });
    product.numReviews = allReviews.length;
    product.rating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await product.save();

    res.status(201).json({ message: "Review submitted, pending approval.", review });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:id/reviews — public, approved only
export async function getProductReviews(req, res, next) {
  try {
    const reviews = await Review.find({ product: req.params.id, approved: true }).sort({
      createdAt: -1,
    });
    res.json({ count: reviews.length, reviews });
  } catch (err) {
    next(err);
  }
}

// ===== ADMIN =====

// GET /api/admin/reviews
export async function getAdminReviews(req, res, next) {
  try {
    const { search, approved } = req.query;
    const filter = {};
    if (approved === "true") filter.approved = true;
    if (approved === "false") filter.approved = false;

    let reviews = await Review.find(filter).populate("product", "name").sort({ createdAt: -1 });

    if (search) {
      const term = search.toLowerCase();
      reviews = reviews.filter(
        (r) =>
          r.userName.toLowerCase().includes(term) ||
          r.comment.toLowerCase().includes(term) ||
          r.product?.name?.toLowerCase().includes(term)
      );
    }

    res.json({ count: reviews.length, reviews });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/reviews/:id/approve
export async function approveReview(req, res, next) {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!review) return res.status(404).json({ message: "Review not found." });
    res.json({ message: "Review approved", review });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/reviews/:id
export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found." });
    res.json({ message: "Review deleted" });
  } catch (err) {
    next(err);
  }
}
