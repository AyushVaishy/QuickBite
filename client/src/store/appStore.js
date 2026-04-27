import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import searchReducer from './searchSlice';
import authReducer from './authSlice';
import filtersReducer from './filtersSlice';

const appStore = configureStore({
  reducer: {
    cart: cartReducer,
    search: searchReducer,
    auth: authReducer,
    filters: filtersReducer,
  },
});

export default appStore;
