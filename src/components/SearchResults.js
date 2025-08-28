import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaStar } from 'react-icons/fa';
import { searchRestaurants, searchByCategory } from '../utils/searchUtils';
import { setFilteredRestaurants, setQuery } from '../utils/searchSlice';

const SearchResults = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const { allRestaurants, filteredRestaurants } = useSelector((store) => store.search);
  const [sortBy, setSortBy] = useState('relevance');
  const [filterBy, setFilterBy] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      dispatch(setQuery(query));
      performSearch(query);
    }
  }, [query, allRestaurants, dispatch]);

  const performSearch = (searchQuery) => {
    setLoading(true);
    
    setTimeout(() => {
      let results = [];
      
      if (allRestaurants.length > 0) {
        // Search in restaurants
        results = searchRestaurants(allRestaurants, searchQuery);
        
        // If no direct matches, try category search
        if (results.length === 0) {
          results = searchByCategory(allRestaurants, searchQuery);
        }
      }
      
      // Apply filters
      if (filterBy !== 'all') {
        results = results.filter(restaurant => {
          switch (filterBy) {
            case 'veg':
              return restaurant.info?.veg === true;
            case 'rating':
              return parseFloat(restaurant.info?.avgRating || 0) >= 4.0;
            case 'fast':
              return parseInt(restaurant.info?.sla?.deliveryTime || 60) <= 30;
            default:
              return true;
          }
        });
      }
      
      // Apply sorting
      results = [...results].sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return parseFloat(b.info?.avgRating || 0) - parseFloat(a.info?.avgRating || 0);
          case 'deliveryTime':
            return parseInt(a.info?.sla?.deliveryTime || 60) - parseInt(b.info?.sla?.deliveryTime || 60);
          case 'costLowToHigh':
            return parseInt(a.info?.costForTwo?.replace(/[^\d]/g, '') || 0) - parseInt(b.info?.costForTwo?.replace(/[^\d]/g, '') || 0);
          case 'costHighToLow':
            return parseInt(b.info?.costForTwo?.replace(/[^\d]/g, '') || 0) - parseInt(a.info?.costForTwo?.replace(/[^\d]/g, '') || 0);
          default:
            return 0;
        }
      });
      
      dispatch(setFilteredRestaurants(results));
      setLoading(false);
    }, 300);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    performSearch(query);
  };

  const handleFilterChange = (newFilterBy) => {
    setFilterBy(newFilterBy);
    performSearch(query);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 pt-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
              <span className="text-lg">Searching for "{query}"...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 pt-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FaSearch className="text-orange-500 text-xl" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Search Results for "{query}"
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Found {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Filter:</span>
              </div>
              <select
                value={filterBy}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm"
              >
                <option value="all">All Restaurants</option>
                <option value="veg">Pure Veg</option>
                <option value="rating">Rating 4.0+</option>
                <option value="fast">Fast Delivery (≤30 min)</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Rating</option>
                <option value="deliveryTime">Delivery Time</option>
                <option value="costLowToHigh">Cost: Low to High</option>
                <option value="costHighToLow">Cost: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <Link to={`/home/restaurants/${restaurant.info.id}`} key={restaurant.info.id}>
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden group cursor-pointer border border-transparent dark:border-gray-700">
                  {/* Restaurant Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={`https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_508,h_320,c_fill/${restaurant.info.cloudinaryImageId}`}
                      alt={restaurant.info.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        parent.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white">
                            <div class="text-center">
                              <div class="text-4xl mb-2">🍽️</div>
                              <div class="font-bold text-lg">${restaurant.info.name}</div>
                            </div>
                          </div>
                        `;
                      }}
                    />
                    
                    {/* Offer Badge */}
                    {restaurant.info.aggregatedDiscountInfoV3?.header && (
                      <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {restaurant.info.aggregatedDiscountInfoV3.header}
                      </div>
                    )}

                    {/* Veg Badge */}
                    {restaurant.info.veg && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        VEG
                      </div>
                    )}
                  </div>

                  {/* Restaurant Details */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2 group-hover:text-orange-600 transition-colors duration-300 line-clamp-1">
                      {restaurant.info.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 text-sm">
                        <FaStar className="text-yellow-500" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {restaurant.info.avgRating || "N/A"}
                        </span>
                      </div>
                      <span className="text-gray-400 dark:text-gray-500">•</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {restaurant.info.sla?.deliveryTime || "N/A"} mins
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                      {restaurant.info.cuisines?.join(', ') || "Various cuisines"}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {restaurant.info.areaName || "Location"}
                      </p>
                      {restaurant.info.costForTwo && (
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {restaurant.info.costForTwo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              No restaurants found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We couldn't find any restaurants matching "{query}". Try searching for something else.
            </p>
            <Link
              to="/home"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              <FaSearch />
              Browse All Restaurants
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
