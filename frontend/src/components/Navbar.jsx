import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCartCount } from "../redux/cartSlice";
import { logoutUser } from "../redux/authSlice";
import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";
import ConfirmDialog from "./ConfirmDialog";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const cartCount = useSelector(selectCartCount);
  const { user, isAuthenticated, isAdmin } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleConfirmedLogout() {
    dispatch(logoutUser());
    setShowLogoutConfirm(false);
    setMobileOpen(false);
    navigate("/");
  }

  return (
    <header className="navbar">
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Log out?"
        message="Are you sure you want to log out of your account?"
        confirmLabel="Log out"
        danger
        onConfirm={handleConfirmedLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <div className="navbar-top">
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <Link to="/" className="logo">
          SHOP.CO
        </Link>

        <nav className={`nav-links ${mobileOpen ? "open" : ""}`}>
          <Link to="/categories/men" onClick={() => setMobileOpen(false)}>
            Men
          </Link>
          <Link to="/categories/women" onClick={() => setMobileOpen(false)}>
            Women
          </Link>
          <Link to="/categories/shoes" onClick={() => setMobileOpen(false)}>
            Shoes
          </Link>
          <Link to="/categories/accessories" onClick={() => setMobileOpen(false)}>
            Accessories
          </Link>
          {isAdmin && (
            <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)}>
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="navbar-search">
          <SearchBar />
        </div>

        <div className="navbar-actions">
          <Link to="/cart" className="cart-icon" aria-label="Cart">
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">Hi, {user?.name?.split(" ")[0]}</span>
              <button className="btn btn-link" onClick={() => setShowLogoutConfirm(true)}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-link">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
