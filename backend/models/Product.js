import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: { type: String, default: "" },
    stock: { type: Number, required: true, min: 0, default: 0 },
    color: { type: String, default: "" },
    size: { type: String, default: "" },
    image: { type: String, default: "" }, // path under /uploads
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", brand: "text" });

export default mongoose.model("Product", productSchema);
