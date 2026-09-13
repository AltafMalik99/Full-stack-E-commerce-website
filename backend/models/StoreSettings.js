import mongoose from "mongoose";

// Singleton document — only one settings record should ever exist.
const storeSettingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "SHOP.CO" },
    storeEmail: { type: String, default: "" },
    contactNumber: { type: String, default: "" },
    address: { type: String, default: "" },
    currency: { type: String, default: "USD" },
    shippingCharges: { type: Number, default: 0 },
    minOrderAmount: { type: Number, default: 0 },
    storeStatus: { type: String, enum: ["open", "closed"], default: "open" },
  },
  { timestamps: true }
);

export default mongoose.model("StoreSettings", storeSettingsSchema);
