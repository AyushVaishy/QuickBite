import { createSlice } from '@reduxjs/toolkit';

// Cart item shape: { id, name, price, isVeg, restaurantId, restaurantName, imageUrl, quantity }
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
  },
  reducers: {
    addItem: (state, action) => {
      const newItem = action.payload;
      // If cart has items from a different restaurant, clear first
      if (state.items.length > 0 && state.items[0].restaurantId !== newItem.restaurantId) {
        state.items = [];
      }
      const existing = state.items.find((item) => item.id === newItem.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...newItem, quantity: 1 });
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCart: () => {
      return { items: [] };
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) {
        item.quantity = quantity;
      }
    },
  },
});

export const { addItem, removeItem, clearCart, updateQuantity } = cartSlice.actions;

export default cartSlice.reducer;
