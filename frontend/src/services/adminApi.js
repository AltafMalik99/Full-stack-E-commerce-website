import api from "./api";

// Centralizes every admin-panel API call in one place so pages don't
// each hand-roll their own axios calls. Reuses the same `api` instance
// (and therefore the same auth cookie/token) as the customer site.

// ----- Dashboard -----
export const getDashboardStats = () => api.get("/admin/dashboard").then((r) => r.data);
export const getSalesOverview = () =>
  api.get("/admin/dashboard/sales-overview").then((r) => r.data);
export const getTopProducts = () =>
  api.get("/admin/dashboard/top-products").then((r) => r.data);
export const getAnalytics = () => api.get("/admin/dashboard/analytics").then((r) => r.data);

// ----- Products -----
export const adminGetProducts = (params) =>
  api.get("/admin/products", { params }).then((r) => r.data);
export const adminCreateProduct = (formData) =>
  api
    .post("/admin/products", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
export const adminUpdateProduct = (id, formData) =>
  api
    .put(`/admin/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
export const adminDeleteProduct = (id) =>
  api.delete(`/admin/products/${id}`).then((r) => r.data);
export const adminUpdateStock = (id, change) =>
  api.patch(`/admin/products/${id}/stock`, { change }).then((r) => r.data);

// ----- Categories -----
export const adminGetCategories = (params) =>
  api.get("/admin/categories", { params }).then((r) => r.data);
export const adminCreateCategory = (formData) =>
  api
    .post("/admin/categories", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
export const adminUpdateCategory = (id, formData) =>
  api
    .put(`/admin/categories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
export const adminDeleteCategory = (id) =>
  api.delete(`/admin/categories/${id}`).then((r) => r.data);

// ----- Orders -----
export const adminGetOrders = (params) =>
  api.get("/admin/orders", { params }).then((r) => r.data);
export const adminGetOrderById = (id) => api.get(`/admin/orders/${id}`).then((r) => r.data);
export const adminUpdateOrderStatus = (id, status) =>
  api.put(`/admin/orders/${id}/status`, { status }).then((r) => r.data);

// ----- Customers -----
export const adminGetUsers = (params) => api.get("/admin/users", { params }).then((r) => r.data);
export const adminGetUserById = (id) => api.get(`/admin/users/${id}`).then((r) => r.data);
export const adminBlockUser = (id) => api.put(`/admin/users/${id}/block`).then((r) => r.data);
export const adminUnblockUser = (id) => api.put(`/admin/users/${id}/unblock`).then((r) => r.data);

// ----- Coupons -----
export const adminGetCoupons = () => api.get("/admin/coupons").then((r) => r.data);
export const adminCreateCoupon = (data) => api.post("/admin/coupons", data).then((r) => r.data);
export const adminUpdateCoupon = (id, data) =>
  api.put(`/admin/coupons/${id}`, data).then((r) => r.data);
export const adminDeleteCoupon = (id) => api.delete(`/admin/coupons/${id}`).then((r) => r.data);

// ----- Reviews -----
export const adminGetReviews = (params) =>
  api.get("/admin/reviews", { params }).then((r) => r.data);
export const adminApproveReview = (id) =>
  api.put(`/admin/reviews/${id}/approve`).then((r) => r.data);
export const adminDeleteReview = (id) => api.delete(`/admin/reviews/${id}`).then((r) => r.data);

// ----- Customer service / support messages -----
export const adminGetContacts = (params) =>
  api.get("/admin/contacts", { params }).then((r) => r.data);
export const adminUpdateContactStatus = (id, status) =>
  api.put(`/admin/contacts/${id}/status`, { status }).then((r) => r.data);

// ----- Notifications -----
export const adminGetNotifications = () => api.get("/admin/notifications").then((r) => r.data);
export const adminMarkNotificationRead = (id) =>
  api.put(`/admin/notifications/${id}/read`).then((r) => r.data);
export const adminMarkAllNotificationsRead = () =>
  api.put("/admin/notifications/read-all").then((r) => r.data);

// ----- Settings -----
export const adminGetSettings = () => api.get("/admin/settings").then((r) => r.data);
export const adminUpdateSettings = (data) =>
  api.put("/admin/settings", data).then((r) => r.data);

// ----- Admin profile -----
export const adminUpdateProfile = (formData) =>
  api
    .put("/admin/profile", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
export const adminChangePassword = (data) =>
  api.put("/admin/profile/password", data).then((r) => r.data);
