import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import searchReducer from './searchSlice';
import authReducer from './authSlice';
import filtersReducer from './filtersSlice';
import favoritesReducer from './favoritesSlice';
import notificationsReducer from './notificationsSlice';

const appStore = configureStore({
  reducer: {
    cart: cartReducer,
    search: searchReducer,
    auth: authReducer,
    filters: filtersReducer,
    favorites: favoritesReducer,
    notifications: notificationsReducer,
  },
});

export default appStore;
