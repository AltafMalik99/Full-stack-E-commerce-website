import Category from "../models/Category.js";
import Product from "../models/Product.js";

export async function getCategories(req, res, next) {
  try {
    const categories = await Category.find({ status: "active" }).sort({ name: 1 });
    res.json({ count: categories.length, categories });
  } catch (err) {
    next(err);
  }
}

export async function getAdminCategories(req, res, next) {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) filter.name = new RegExp(search, "i");

    const categories = await Category.find(filter).sort({ createdAt: -1 });

    const withCounts = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({ category: cat._id });
        return { ...cat.toObject(), productCount };
      })
    );

    res.json({ count: withCounts.length, categories: withCounts });
  } catch (err) {
    next(err);
  }
}

export async function getCategoryById(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found." });
    res.json({ category });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const body = { ...req.body };
    if (req.file) body.image = `/uploads/${req.file.filename}`;

    const existing = await Category.findOne({ name: new RegExp(`^${body.name}$`, "i") });
    if (existing) {
      return res.status(409).json({ message: "A category with this name already exists." });
    }

    const category = await Category.create(body);
    res.status(201).json({ message: "Category created", category });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const body = { ...req.body };
    if (req.file) body.image = `/uploads/${req.file.filename}`;

    const category = await Category.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ message: "Category not found." });

    res.json({ message: "Category updated", category });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const inUse = await Product.countDocuments({ category: req.params.id });
    if (inUse > 0) {
      return res.status(400).json({
        message: `Cannot delete — ${inUse} product(s) are still using this category.`,
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found." });

    res.json({ message: "Category deleted" });
  } catch (err) {
    next(err);
  }
}
