import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Customer-facing
import CustomerLayout from "./layouts/CustomerLayout";
import Home from "./pages/Home";
import Category from "./pages/Category";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./routes/ProtectedRoute";

// Admin panel
import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import AdminLayout from "./admin/layouts/AdminLayout";
import AdminLogin from "./admin/pages/AdminLogin";
import Dashboard from "./admin/pages/Dashboard";
import Products from "./admin/pages/Products";
import Categories from "./admin/pages/Categories";
import Orders from "./admin/pages/Orders";
import Customers from "./admin/pages/Customers";
import Inventory from "./admin/pages/Inventory";
import Reviews from "./admin/pages/Reviews";
import Coupons from "./admin/pages/Coupons";
import CustomerService from "./admin/pages/CustomerService";
import Notifications from "./admin/pages/Notifications";
import Analytics from "./admin/pages/Analytics";
import Settings from "./admin/pages/Settings";
import AdminProfile from "./admin/pages/AdminProfile";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ===== Admin login (standalone, no sidebar/topbar) ===== */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ===== Admin panel (protected, admin role only) ===== */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="support" element={<CustomerService />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* ===== Customer-facing website ===== */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="categories/:categoryName" element={<Category />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
