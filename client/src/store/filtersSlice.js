import { createSlice } from '@reduxjs/toolkit';

export const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating_desc', label: 'Rating: High to Low' },
  { value: 'cost_asc', label: 'Cost: Low to High' },
  { value: 'cost_desc', label: 'Cost: High to Low' },
];

export const RATING_OPTIONS = [
  { value: null, label: 'Any' },
  { value: 3.5, label: '3.5+' },
  { value: 4.0, label: '4.0+' },
  { value: 4.5, label: '4.5+' },
  { value: 5.0, label: '5.0' },
];

// costForTwo is stored in paise. ₹200 for two = 20000 paise.
export const COST_OPTIONS = [
  { value: null,   label: 'Any' },
  { value: 'low',  label: '₹ (Under ₹200 for two)' },
  { value: 'mid',  label: '₹₹ (₹200 – ₹500 for two)' },
  { value: 'high', label: '₹₹₹ (Above ₹500 for two)' },
];

export const DELIVERY_TIME_OPTIONS = [
  { value: null, label: 'Any' },
  { value: 30,   label: 'Under 30 mins' },
  { value: 45,   label: 'Under 45 mins' },
  { value: 60,   label: 'Under 60 mins' },
];

const initialState = {
  sortBy: 'popularity',
  cuisines: [],        // array of exact cuisine strings (from restaurant data)
  rating: null,        // null | 3.5 | 4.0 | 4.5 | 5.0
  costRange: null,     // null | 'low' | 'mid' | 'high'
  vegOnly: false,
  deliveryTimeMax: null, // null | 30 | 45 | 60
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    applyFilters: (state, action) => ({ ...state, ...action.payload }),
    clearFilters: () => ({ ...initialState }),
    toggleVeg: (state) => { state.vegOnly = !state.vegOnly; },
  },
});

export const { applyFilters, clearFilters, toggleVeg } = filtersSlice.actions;
export default filtersSlice.reducer;
