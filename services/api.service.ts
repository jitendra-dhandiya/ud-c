import api from '../lib/axios';
import type { Product, Category, Cart, Order, Blog, Review, Banner, HomepageSection, LoginResponse, User, Address } from '../types';

// ─── Auth ──────────────────────────────────────────────────────
export const authApi = {
  register: (data: { firstName: string; lastName: string; email: string; password: string; phone?: string }) =>
    api.post<{ data: LoginResponse }>('/auth/register', data),
  login: (email: string, password: string) =>
    api.post<{ data: LoginResponse }>('/auth/login', { email, password }),
  googleLogin: (token: string) =>
    api.post<{ data: LoginResponse }>('/auth/google', { token }),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken: string) =>
    api.post<{ data: { accessToken: string; refreshToken: string } }>('/auth/refresh', { refreshToken }),
  me: () => api.get<{ data: User }>('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

// ─── Products ─────────────────────────────────────────────────
export const productApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/admin/${id}`),
  getBySlug: (slug: string) => api.get<{ data: Product }>(`/products/${slug}`),
  getFeatured: (limit = 8) => api.get<{ data: Product[] }>('/products/featured', { params: { limit } }),
  getTrending: (limit = 8) => api.get<{ data: Product[] }>('/products/trending', { params: { limit } }),
  getNewArrivals: (limit = 8) => api.get<{ data: Product[] }>('/products/new-arrivals', { params: { limit } }),
  getBestSellers: (limit = 8) => api.get<{ data: Product[] }>('/products/best-sellers', { params: { limit } }),
  search: (params: Record<string, unknown>) => api.get('/products/search', { params }),
  create: (data: FormData) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// ─── Variants ─────────────────────────────────────────────────
export const variantApi = {
  getAll: (productId: string) => api.get(`/products/${productId}/variants`),
  create: (productId: string, data: object) => api.post(`/products/${productId}/variants`, data),
  update: (productId: string, variantId: string, data: object) =>
    api.put(`/products/${productId}/variants/${variantId}`, data),
  delete: (productId: string, variantId: string) =>
    api.delete(`/products/${productId}/variants/${variantId}`),
};

// ─── Categories ───────────────────────────────────────────────
export const categoryApi = {
  getAll: (params?: Record<string, unknown>) => api.get<{ data: Category[] }>('/categories', { params }),
  getFeatured: () => api.get<{ data: Category[] }>('/categories/featured'),
  getBySlug: (slug: string) => api.get<{ data: Category }>(`/categories/${slug}`),
  create: (data: FormData) => api.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => api.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// ─── Cart ─────────────────────────────────────────────────────
export const cartApi = {
  get: () => api.get<{ data: Cart }>('/cart'),
  addItem: (productId: string, variantId?: string, quantity = 1) =>
    api.post('/cart/add', { productId, variantId, quantity }),
  updateItem: (itemId: string, quantity: number) =>
    api.put(`/cart/item/${itemId}`, { quantity }),
  removeItem: (itemId: string) => api.delete(`/cart/item/${itemId}`),
  clear: () => api.delete('/cart/clear'),
  applyCoupon: (code: string, cartTotal: number) =>
    api.post('/cart/coupon', { code, cartTotal }),
};

// ─── Orders ───────────────────────────────────────────────────
export const orderApi = {
  create: (data: object) => api.post<{ data: Order }>('/orders', data),
  getMyOrders: (page = 1, limit = 10) =>
    api.get('/orders/my', { params: { page, limit } }),
  getById: (id: string) => api.get<{ data: Order }>(`/orders/${id}`),
  track: (orderNumber: string) => api.get(`/orders/track/${orderNumber}`),
  cancel: (id: string, reason?: string) =>
    api.post(`/orders/${id}/cancel`, { reason }),
  cancelOrder: (id: string) => api.post(`/orders/${id}/cancel`),
  // Admin
  getAll: (params?: Record<string, unknown>) => api.get('/orders', { params }),
  updateStatus: (id: string, data: object) => api.put(`/orders/${id}/status`, data),
};

// ─── Payments ─────────────────────────────────────────────────
export const paymentApi = {
  createRazorpayOrder: (orderId: string) =>
    api.post('/payments/razorpay/create', { orderId }),
  verifyPayment: (data: object) =>
    api.post('/payments/razorpay/verify', data),
};

// ─── Wishlist ─────────────────────────────────────────────────
export const wishlistApi = {
  get: () => api.get('/wishlist'),
  getMyWishlist: () => api.get('/wishlist'),
  toggle: (productId: string) => api.post('/wishlist/toggle', { productId }),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`),
  check: (productId: string) => api.get(`/wishlist/check/${productId}`),
};

// ─── Users ────────────────────────────────────────────────────
export const userApi = {
  updateProfile: (data: FormData) =>
    api.put('/users/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAddresses: () => api.get<{ data: Address[] }>('/users/addresses'),
  addAddress: (data: Partial<Address>) => api.post('/users/addresses', data),
  updateAddress: (id: string, data: Partial<Address>) =>
    api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/users/addresses/${id}`),
  getRecentlyViewed: () => api.get('/users/recently-viewed'),
  addRecentlyViewed: (productId: string) =>
    api.post('/users/recently-viewed', { productId }),
  getNotifications: () => api.get('/users/notifications'),
  markNotificationsRead: () => api.put('/users/notifications/read'),
  // Admin
  getAll: (params?: Record<string, unknown>) => api.get('/users', { params }),
  update: (id: string, data: object) => api.put(`/users/${id}`, data),
  toggleStatus: (id: string) => api.put(`/users/${id}/toggle-status`),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
};

// ─── Reviews ──────────────────────────────────────────────────
export const reviewApi = {
  getByProduct: (productId: string, params?: Record<string, unknown>) =>
    api.get(`/reviews/product/${productId}`, { params }),
  create: (data: { productId: string; rating: number; title?: string; body?: string }) =>
    api.post('/reviews', data),
  // Admin
  getAll: (params?: Record<string, unknown>) => api.get('/reviews', { params }),
  update: (id: string, data: object) => api.put(`/reviews/${id}`, data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
  updateStatus: (id: string, data: object) =>
    api.put(`/reviews/${id}/status`, data),
};

// ─── Banners ──────────────────────────────────────────────────
export const bannerApi = {
  getByType: (type: string) => api.get<{ data: Banner[] }>(`/banners/type/${type}`),
  getAll: (params?: Record<string, unknown>) => api.get('/banners', { params }),
  create: (data: FormData) =>
    api.post('/banners', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData | object) => {
    const isForm = data instanceof FormData;
    return api.put(`/banners/${id}`, data, isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : {});
  },
  delete: (id: string) => api.delete(`/banners/${id}`),
  reorder: (items: { id: string; sortOrder: number }[]) =>
    api.put('/banners/reorder', { items }),
};

// ─── Homepage ─────────────────────────────────────────────────
export const homepageApi = {
  getData: () => api.get('/homepage/data'),
  getSections: () => api.get<{ data: HomepageSection[] }>('/homepage'),
  getAllAdmin: () => api.get('/homepage/admin'),
  createSection: (data: object) => api.post('/homepage', data),
  updateSection: (id: string, data: object) => api.put(`/homepage/${id}`, data),
  deleteSection: (id: string) => api.delete(`/homepage/${id}`),
  reorder: (items: { id: string; sortOrder: number }[]) =>
    api.put('/homepage/reorder', { items }),
};

// ─── Blogs ────────────────────────────────────────────────────
export const blogApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/blogs', { params }),
  getBySlug: (slug: string) => api.get<{ data: Blog }>(`/blogs/${slug}`),
  getCategories: () => api.get('/blogs/categories'),
  // Admin
  getAllAdmin: (params?: Record<string, unknown>) =>
    api.get('/blogs/admin/all', { params }),
  create: (data: FormData) =>
    api.post('/blogs', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) =>
    api.put(`/blogs/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/blogs/${id}`),
};

// ─── Analytics ────────────────────────────────────────────────
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getRevenue: (params?: Record<string, unknown>) =>
    api.get('/analytics/revenue', { params }),
};

// ─── Settings ─────────────────────────────────────────────────
export const settingsApi = {
  getPublic: () => api.get('/settings/public'),
  getByGroup: (group: string) => api.get(`/settings/${group}`),
  getAll: () => api.get('/settings'),
  upsert: (data: object) => api.post('/settings', data),
  upsertBulk: (settings: { key: string; value: string }[]) =>
    api.post('/settings/bulk', { settings }),
};

// ─── SEO ──────────────────────────────────────────────────────
export const seoApi = {
  getByPage: (page: string) => api.get(`/seo/page/${page}`),
  getCmsPage: (slug: string) => api.get(`/seo/cms/${slug}`),
  upsert: (data: object) => api.post('/seo/admin/upsert', data),
  getAll: (params?: Record<string, unknown>) => api.get('/seo/admin/all', { params }),
  update: (id: string, data: object) => api.put(`/seo/admin/${id}`, data),
  getAllCms: () => api.get('/seo/admin/cms'),
  upsertCms: (data: object) => api.post('/seo/admin/cms', data),
};

// ─── Coupons ──────────────────────────────────────────────────
export const couponApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/coupons', { params }),
  validate: (code: string, cartTotal: number) => api.post('/coupons/validate', { code, cartTotal }),
  create: (data: object) => api.post('/coupons', data),
  update: (id: string, data: object) => api.put(`/coupons/${id}`, data),
  delete: (id: string) => api.delete(`/coupons/${id}`),
};

// ─── Collections ──────────────────────────────────────────────
export const collectionApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/collections', { params }),
  getBySlug: (slug: string) => api.get(`/collections/${slug}`),
  create: (data: FormData) =>
    api.post('/collections', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData | object) => {
    const isForm = data instanceof FormData;
    return api.put(`/collections/${id}`, data, isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : {});
  },
  delete: (id: string) => api.delete(`/collections/${id}`),
};

// ─── Media ────────────────────────────────────────────────────
export const mediaApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/media', { params }),
  upload: (data: FormData) =>
    api.post('/media/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/media/${id}`),
};
