import api from "./api";

export const getCart = () => api.get("/cart");
export const addToCart = (menuItemId, quantity = 1) =>
  api.post("/cart/items", { menuItemId, quantity });
export const updateCartItem = (cartItemId, quantity) =>
  api.patch(`/cart/items/${cartItemId}`, { quantity });
export const removeCartItem = (cartItemId) =>
  api.delete(`/cart/items/${cartItemId}`);
export const clearCart = () => api.delete("/cart");
