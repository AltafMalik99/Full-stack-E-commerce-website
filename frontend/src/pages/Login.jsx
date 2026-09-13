import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearAuthError } from "../redux/authSlice";
import Toast from "../components/Toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state) => state.auth);

  const redirectTo = location.state?.from?.pathname || "/";

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validate() {
    const errors = {};
    if (!formData.email || !EMAIL_REGEX.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.password) {
      errors.password = "Password is required.";
    }
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
      setShowToast(true);
    }
  }

  return (
    <div className="auth-page">
      <Toast
        open={showToast}
        message="Login successful! Redirecting..."
        onClose={() => {
          setShowToast(false);
          navigate(redirectTo);
        }}
      />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>Login</h1>

        {typeof error === "string" && <p className="form-error-banner">{error}</p>}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {formErrors.email && <span className="field-error">{formErrors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          {formErrors.password && (
            <span className="field-error">{formErrors.password}</span>
          )}
        </div>

        <button className="btn btn-primary btn-large" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Logging in..." : "Login"}
        </button>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
