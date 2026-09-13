import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps any /admin/* route. A logged-out user is sent to the admin
// login page. A logged-in but non-admin user sees "Access Denied"
// and is redirected back to the customer website instead of the
// admin panel — normal customers must never reach admin screens.
export default function AdminProtectedRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <h1>Access Denied</h1>
        <p>You do not have permission to view the admin panel.</p>
        <a href="/">Return to the store</a>
      </div>
    );
  }

  return children;
}
