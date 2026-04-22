import api from "./api";

export const getRestaurants = (lat, lng, radius = 5) =>
  api.get("/restaurants", { params: { lat, lng, radius } });

export const getRestaurant = (id) => api.get(`/restaurants/${id}`);

export const getRestaurantMenu = (id) => api.get(`/restaurants/${id}/menu`);

export const searchRestaurants = (lat, lng, query) =>
  api.get("/restaurants/search", { params: { lat, lng, q: query } });
