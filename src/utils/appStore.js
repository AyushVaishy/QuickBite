import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import searchReducer from './searchSlice';

const appStore = configureStore({
  reducer: {
    cart: cartReducer,
    search: searchReducer,
  },
});

export default appStore;
