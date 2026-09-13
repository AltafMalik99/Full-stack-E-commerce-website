import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearAuthError } from "../redux/authSlice";
import Toast from "../components/Toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validate() {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required.";
    if (!formData.email || !EMAIL_REGEX.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.password || formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch(clearAuthError());
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const result = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(result)) {
      setShowToast(true);
    }
  }

  // The backend may also return field-level errors - merge them in
  const backendErrors = typeof error === "object" && error !== null ? error : {};

  return (
    <div className="auth-page">
      <Toast
        open={showToast}
        message="Account created successfully! Redirecting..."
        onClose={() => {
          setShowToast(false);
          navigate("/");
        }}
      />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>Register</h1>

        {typeof error === "string" && <p className="form-error-banner">{error}</p>}

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} />
          {(formErrors.name || backendErrors.name) && (
            <span className="field-error">{formErrors.name || backendErrors.name}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {(formErrors.email || backendErrors.email) && (
            <span className="field-error">{formErrors.email || backendErrors.email}</span>
          )}
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
          {(formErrors.password || backendErrors.password) && (
            <span className="field-error">
              {formErrors.password || backendErrors.password}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {formErrors.confirmPassword && (
            <span className="field-error">{formErrors.confirmPassword}</span>
          )}
        </div>

        <button className="btn btn-primary btn-large" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Creating account..." : "Register"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
