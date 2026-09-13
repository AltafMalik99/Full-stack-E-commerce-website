import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send the httpOnly auth cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach a bearer token from localStorage too, as a fallback for
// environments where cross-site cookies are restricted.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // When sending FormData (image uploads), let the browser set its own
  // Content-Type with the correct multipart boundary — a manually set
  // "multipart/form-data" header has no boundary and breaks upload parsing.
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

// Base origin of the API (without the trailing /api) — used to build
// full URLs for images served from the backend's /uploads folder.
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

// Resolves a product/category image path (e.g. "/uploads/xyz.jpg")
// returned by the backend into a full, loadable URL. Falls back to the
// value unchanged if it's already a full URL (e.g. seeded Unsplash links).
export function resolveImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}

export default api;
