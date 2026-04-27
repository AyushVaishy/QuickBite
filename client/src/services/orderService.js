import api from "./api";

export const createOrder = ({ items, restaurantId, deliveryAddress }) =>
  api.post("/orders", { items, restaurantId, deliveryAddress });

export const getOrders = () => api.get("/orders");
export const getOrder = (id) => api.get(`/orders/${id}`);
export const cancelOrder = (id) => api.patch(`/orders/${id}/cancel`);
export const createReview = (restaurantId, data) => api.post(`/restaurants/${restaurantId}/reviews`, data);
