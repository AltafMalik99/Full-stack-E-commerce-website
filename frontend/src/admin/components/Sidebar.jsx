import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/admin/products", label: "Products", icon: "📦" },
  { to: "/admin/categories", label: "Categories", icon: "🗂️" },
  { to: "/admin/orders", label: "Orders", icon: "🧾" },
  { to: "/admin/customers", label: "Customers", icon: "👥" },
  { to: "/admin/inventory", label: "Inventory", icon: "📋" },
  { to: "/admin/reviews", label: "Reviews", icon: "⭐" },
  { to: "/admin/coupons", label: "Coupons", icon: "🏷️" },
  { to: "/admin/support", label: "Customer Service", icon: "💬" },
  { to: "/admin/notifications", label: "Notifications", icon: "🔔" },
  { to: "/admin/analytics", label: "Analytics", icon: "📈" },
  { to: "/admin/settings", label: "Settings", icon: "⚙️" },
  { to: "/admin/profile", label: "Admin Profile", icon: "👤" },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-admin-sidebar text-white z-40
          transform transition-transform duration-200 flex flex-col
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-2">
          <span className="text-2xl">🛍️</span>
          <span className="font-bold text-lg tracking-wide">SHOP.CO Admin</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                ${
                  isActive
                    ? "bg-admin-accent text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
