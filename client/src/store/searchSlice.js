import { createSlice } from '@reduxjs/toolkit';

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    results: [],
    suggestions: [],
    isLoading: false,
    recentSearches: [],
    allRestaurants: [],
    filteredRestaurants: [],
  },
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    setResults: (state, action) => {
      state.results = action.payload;
    },
    setSuggestions: (state, action) => {
      state.suggestions = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    addRecentSearch: (state, action) => {
      const query = action.payload;
      // Remove if already exists
      state.recentSearches = state.recentSearches.filter(search => search !== query);
      // Add to beginning
      state.recentSearches.unshift(query);
      // Keep only last 10 searches
      state.recentSearches = state.recentSearches.slice(0, 10);
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
    setAllRestaurants: (state, action) => {
      state.allRestaurants = action.payload;
    },
    setFilteredRestaurants: (state, action) => {
      state.filteredRestaurants = action.payload;
    },
    clearSearch: (state) => {
      state.query = '';
      state.results = [];
      state.suggestions = [];
      state.filteredRestaurants = [];
    }
  }
});

export const {
  setQuery,
  setResults,
  setSuggestions,
  setIsLoading,
  addRecentSearch,
  clearRecentSearches,
  setAllRestaurants,
  setFilteredRestaurants,
  clearSearch
} = searchSlice.actions;

export default searchSlice.reducer;
