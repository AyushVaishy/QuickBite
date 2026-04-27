import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'qb_favourites';

const loadFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const saveToStorage = (items) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: { items: loadFromStorage() },
  reducers: {
    toggleFavourite(state, action) {
      const restaurant = action.payload;
      const idx = state.items.findIndex(r => r.id === restaurant.id);
      if (idx >= 0) {
        state.items.splice(idx, 1);
      } else {
        state.items.push(restaurant);
      }
      saveToStorage(state.items);
    },
  },
});

export const { toggleFavourite } = favoritesSlice.actions;
export const selectFavourites = (state) => state.favorites.items;
export const selectIsFavourite = (id) => (state) =>
  state.favorites.items.some(r => r.id === id);
export default favoritesSlice.reducer;
