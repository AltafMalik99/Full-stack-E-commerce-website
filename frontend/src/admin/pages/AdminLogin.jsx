import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearAuthError } from "../../redux/authSlice";
import "../admin.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state) => state.auth);

  const redirectTo = location.state?.from?.pathname || "/admin/dashboard";

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validate() {
    const errors = {};
    if (!formData.email || !EMAIL_REGEX.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.password) errors.password = "Password is required.";
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch(clearAuthError());
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      if (result.payload.user.role === "admin") {
        navigate(redirectTo);
      } else {
        // Logged in fine, but this account isn't an admin
        setFormErrors({ general: "This account does not have admin access." });
      }
    }
  }

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="admin-card w-full max-w-sm"
      >
        <div className="text-center mb-6">
          <span className="text-3xl">🛍️</span>
          <h1 className="text-xl font-bold text-white mt-2">SHOP.CO Admin</h1>
          <p className="text-white/50 text-sm mt-1">Sign in to manage your store</p>
        </div>

        {(typeof error === "string" || formErrors.general) && (
          <p className="bg-red-500/10 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">
            {formErrors.general || error}
          </p>
        )}

        <div className="mb-4">
          <label className="block text-sm text-white/70 mb-1">Email</label>
          <input
            type="email"
            name="email"
            className="admin-input"
            value={formData.email}
            onChange={handleChange}
          />
          {formErrors.email && (
            <span className="text-red-400 text-xs mt-1 block">{formErrors.email}</span>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm text-white/70 mb-1">Password</label>
          <input
            type="password"
            name="password"
            className="admin-input"
            value={formData.password}
            onChange={handleChange}
          />
          {formErrors.password && (
            <span className="text-red-400 text-xs mt-1 block">{formErrors.password}</span>
          )}
        </div>

        <button
          type="submit"
          className="admin-btn-primary w-full"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-white/40 text-xs mt-6">
          Not an admin?{" "}
          <a href="/login" className="text-admin-accent">
            Go to customer login
          </a>
        </p>
      </form>
    </div>
  );
}
