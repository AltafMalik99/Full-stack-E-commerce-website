import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/authSlice";
import { useAuth } from "../../context/AuthContext";
import { adminGetNotifications } from "../../services/adminApi";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    adminGetNotifications()
      .then((data) => setUnreadCount(data.unreadCount))
      .catch(() => {});
  }, []);

  function handleConfirmedLogout() {
    dispatch(logoutUser());
    setShowLogoutConfirm(false);
    navigate("/admin/login");
  }

  return (
    <header className="sticky top-0 z-20 bg-admin-card/95 backdrop-blur border-b border-white/10 px-4 lg:px-8 py-3 flex items-center justify-between">
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Log out of Admin Panel?"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        danger
        onConfirm={handleConfirmedLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <button
        className="lg:hidden text-white text-xl"
        onClick={onMenuClick}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      <div className="hidden lg:block text-white/50 text-sm">
        Welcome back, <span className="text-white font-medium">{user?.name}</span>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/admin/notifications" className="relative text-white text-xl">
          🔔
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <Link
          to="/admin/profile"
          className="w-9 h-9 rounded-full bg-admin-accent flex items-center justify-center text-white font-semibold text-sm"
        >
          {user?.name?.charAt(0).toUpperCase() || "A"}
        </Link>

        <button
          className="admin-btn-secondary text-sm py-1.5 px-3"
          onClick={() => setShowLogoutConfirm(true)}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
