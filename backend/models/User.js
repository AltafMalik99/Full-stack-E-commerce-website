import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true }, // always stored hashed
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBlocked: { type: Boolean, default: false },
    profileImage: { type: String, default: "" },
  },
  { timestamps: true }
);

// Never send the password hash back in API responses
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isBlocked: this.isBlocked,
    profileImage: this.profileImage,
    createdAt: this.createdAt,
  };
};

export default mongoose.model("User", userSchema);
