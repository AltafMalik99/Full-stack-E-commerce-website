import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { createNotification } from "./notificationController.js";

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function setTokenCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = signToken(newUser);
    setTokenCookie(res, token);

    // Fire-and-forget admin notification, never block the response on it
    createNotification("new_customer", `New customer registered: ${newUser.name}`).catch(() => {});

    res.status(201).json({
      message: "Registration successful",
      user: newUser.toSafeObject(),
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account has been blocked. Contact support." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);
    setTokenCookie(res, token);

    res.json({
      message: "Login successful",
      user: user.toSafeObject(),
      token,
    });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
}

export async function getMe(req, res, next) {
  try {
    res.json({ user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}
