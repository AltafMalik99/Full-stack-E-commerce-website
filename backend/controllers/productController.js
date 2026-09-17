import cloudinary from "../config/cloudinary.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { createNotification } from "./notificationController.js";

const LOW_STOCK_THRESHOLD = 5;

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "shopco/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(buffer);
  });
}


/**
 * GET /api/products
 * Public — used by the customer website.
 * Supports: category, search, minPrice, maxPrice, sort, page, limit
 * Only returns products with status "active".
 */
export async function getProducts(req, res, next) {
  try {
    const { category, search, minPrice, maxPrice, sort } = req.query;
    const filter = { status: "active" };

    if (category && category.toLowerCase() !== "all") {
      const categoryDoc = await Category.findOne({
        name: new RegExp(`^${category}$`, "i"),
      });
      // If the category name doesn't match anything, force zero results
      // rather than silently ignoring the filter.
      filter.category = categoryDoc ? categoryDoc._id : null;
    }
    if (search) {
      filter.$text = { $search: search };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let query = Product.find(filter).populate("category", "name");

    if (sort === "price_asc") query = query.sort({ price: 1 });
    if (sort === "price_desc") query = query.sort({ price: -1 });
    if (sort === "rating_desc") query = query.sort({ rating: -1 });
    if (sort === "newest") query = query.sort({ createdAt: -1 });

    const products = await query;
    res.json({ count: products.length, products: products.map(formatProduct) });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:id — public
export async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name");
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ product: formatProduct(product) });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/products — admin only, includes inactive products + full filters
export async function getAdminProducts(req, res, next) {
  try {
    const { search, category, status, stock, sort, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (stock === "low") filter.stock = { $gt: 0, $lte: LOW_STOCK_THRESHOLD };
    if (stock === "out") filter.stock = 0;

    let query = Product.find(filter).populate("category", "name");

    if (sort === "price_asc") query = query.sort({ price: 1 });
    else if (sort === "price_desc") query = query.sort({ price: -1 });
    else query = query.sort({ createdAt: -1 });

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      query.skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      count: total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products: products.map(formatProduct),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/products — admin only


export async function createProduct(req, res, next) {
  try {
    const body = { ...req.body };
    // if (req.file) body.image = `/uploads/${req.file.filename}`;

if (req.file) {
  const result = await uploadToCloudinary(req.file.buffer);
  body.image = result.secure_url;
}
    const product = await Product.create(body);
    await product.populate("category", "name");

    if (product.stock <= LOW_STOCK_THRESHOLD) {
      createNotification("low_stock", `Low stock: "${product.name}" has ${product.stock} left.`).catch(() => {});
    }

    res.status(201).json({ message: "Product created", product: formatProduct(product) });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/products/:id — admin only
export async function updateProduct(req, res, next) {
  try {
    const body = { ...req.body };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      body.image = result.secure_url;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    }).populate("category", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (product.stock <= LOW_STOCK_THRESHOLD) {
      createNotification(
        "low_stock",
        `Low stock: "${product.name}" has ${product.stock} left.`
      ).catch(() => {});
    }

    res.json({
      message: "Product updated",
      product: formatProduct(product),
    });
  } catch (err) {
    next(err);
  }
}




// DELETE /api/admin/products/:id — admin only
export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/products/:id/stock — admin only, increase/decrease stock
export async function updateStock(req, res, next) {
  try {
    const { change } = req.body; // e.g. +5 or -3
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });

    product.stock = Math.max(0, product.stock + Number(change));
    await product.save();

    res.json({ message: "Stock updated", product: formatProduct(product) });
  } catch (err) {
    next(err);
  }
}

// Helper — normalize a Mongo product doc for the frontend
function formatProduct(p) {
  return {
    id: p._id,
    name: p.name,
    description: p.description,
    price: p.price,
    oldPrice: p.oldPrice,
    discount: p.discount,
    category: p.category?.name || "",
    categoryId: p.category?._id || p.category,
    brand: p.brand,
    stock: p.stock,
    color: p.color,
    size: p.size,
    image: p.image,
    status: p.status,
    rating: p.rating,
    numReviews: p.numReviews,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}
