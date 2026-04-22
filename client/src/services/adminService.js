import api from './api';

export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = () => api.get('/admin/users');
export const getAdminRestaurants = () => api.get('/admin/restaurants');
export const approveRestaurant = (id, approved) => api.patch(`/admin/restaurants/${id}/approve`, { approved });
export const getAdminOrders = () => api.get('/admin/orders');
export const updateAdminOrderStatus = (orderId, status) => api.patch(`/admin/orders/${orderId}/status`, { status });

export const getMyRestaurants = () => api.get('/restaurants/my');
export const toggleRestaurantOpen = (id) => api.patch(`/restaurants/${id}/toggle-open`);
export const getRestaurantOrders = (restaurantId) => api.get(`/orders/restaurant/${restaurantId}`);
