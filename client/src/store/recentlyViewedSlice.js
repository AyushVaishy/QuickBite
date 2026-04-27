import { createSlice } from "@reduxjs/toolkit";

const MAX = 8;
const STORAGE_KEY = "qb_recently_viewed";

const loadFromStorage = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
};

const recentlyViewedSlice = createSlice({
  name: "recentlyViewed",
  initialState: loadFromStorage(),
  reducers: {
    viewRestaurant(state, action) {
      const restaurant = action.payload;
      const filtered = state.filter(r => r.id !== restaurant.id);
      const next = [restaurant, ...filtered].slice(0, MAX);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    },
  },
});

export const { viewRestaurant } = recentlyViewedSlice.actions;
export const selectRecentlyViewed = (state) => state.recentlyViewed;
export default recentlyViewedSlice.reducer;
