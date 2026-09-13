// Run with: npm run seed:admin
// Creates the first admin user, sample categories, and sample products
// so you have something to look at immediately after connecting MongoDB.
import dotenv from "dotenv";
import dns from "dns";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

dotenv.config();

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@shop.co";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@123";
const CATEGORIES = [
  { name: "Men", description: "Men's fashion", image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=400&q=80" },
  { name: "Women", description: "Women's fashion", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80" },
  { name: "Shoes", description: "Footwear for everyone", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80" },
  { name: "Accessories", description: "Bags, watches and more", image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&q=80" },
];

async function run() {
  await connectDB();

  // 1. Admin user
  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({
      name: "Admin",
      email: ADMIN_EMAIL,
      password: hashed,
      role: "admin",
    });
    console.log(`✔ Admin created — email: ${ADMIN_EMAIL}  password: ${ADMIN_PASSWORD}`);
  } else if (existingAdmin.role !== "admin") {
    existingAdmin.role = "admin";
    await existingAdmin.save();
    console.log(`✔ Existing user ${ADMIN_EMAIL} promoted to admin.`);
  } else {
    console.log(`ℹ Admin already exists: ${ADMIN_EMAIL}`);
  }

  // 2. Categories
  const categoryDocs = {};
  for (const cat of CATEGORIES) {
    let doc = await Category.findOne({ name: cat.name });
    if (!doc) {
      doc = await Category.create(cat);
      console.log(`✔ Category created: ${cat.name}`);
    }
    categoryDocs[cat.name] = doc;
  }

  // 3. Sample products (only if none exist yet)
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    const sampleProducts = [
      { name: "Classic Casual T-Shirt", category: "Men", price: 29.99, oldPrice: 39.99, discount: 25, stock: 20, brand: "SHOP.CO", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", description: "A soft, breathable cotton t-shirt with a relaxed fit." },
      { name: "Slim Fit Denim Jeans", category: "Men", price: 59.99, oldPrice: 79.99, discount: 25, stock: 15, brand: "SHOP.CO", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80", description: "Slim fit denim jeans made from premium stretch fabric." },
      { name: "Floral Summer Dress", category: "Women", price: 49.99, oldPrice: 64.99, discount: 23, stock: 20, brand: "SHOP.CO", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80", description: "Lightweight floral dress, ideal for summer days." },
      { name: "Oversized Knit Sweater", category: "Women", price: 42.99, oldPrice: 54.99, discount: 22, stock: 16, brand: "SHOP.CO", image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&q=80", description: "Oversized knit sweater with a chunky texture." },
      { name: "Running Sneakers", category: "Shoes", price: 74.99, oldPrice: 94.99, discount: 21, stock: 30, brand: "SHOP.CO", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", description: "Lightweight running sneakers with responsive cushioning." },
      { name: "Leather Crossbody Bag", category: "Accessories", price: 69.99, oldPrice: 89.99, discount: 22, stock: 15, brand: "SHOP.CO", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80", description: "Compact leather crossbody bag with adjustable strap." },
    ];

    for (const p of sampleProducts) {
      await Product.create({ ...p, category: categoryDocs[p.category]._id, rating: 4.5 });
    }
    console.log(`✔ ${sampleProducts.length} sample products created.`);
  } else {
    console.log("ℹ Products already exist, skipping sample product seed.");
  }

  console.log("Seed complete.");
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
