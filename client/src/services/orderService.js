import api from "./api";

export const createOrder = (addressId) => api.post("/orders", { addressId });
export const getOrders = () => api.get("/orders");
export const getOrder = (id) => api.get(`/orders/${id}`);
