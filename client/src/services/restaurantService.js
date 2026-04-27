import api from "./api";

export const getRestaurants = (lat, lng, { radius = 10, limit = 20, page = 1 } = {}) =>
  api.get("/restaurants", { params: { lat, lng, radius, limit, page } });

export const getRestaurant = (id) => api.get(`/restaurants/${id}`);

export const getRestaurantMenu = (id) => api.get(`/menu/${id}`);

export const searchRestaurants = (lat, lng, query) =>
  api.get("/restaurants/search", { params: { lat, lng, q: query } });

export const createReview = (restaurantId, data) =>
  api.post(`/restaurants/${restaurantId}/reviews`, data);
