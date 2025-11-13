import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useOutletContext } from 'react-router-dom';
import { FaSearch, FaFilter, FaStar } from 'react-icons/fa';
import { SEARCH_API } from '../utils/constants';

const SearchResults = () => {
  const { location } = useOutletContext();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [restaurants, setRestaurants] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [filterBy, setFilterBy] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, location?.lat, location?.lng]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    setError('');
    try {
      const url = SEARCH_API(location.lat, location.lng, searchQuery);
      const res = await fetch(url);
      const data = await res.json();

      // Extract restaurants from RESTAURANT group
      const cards = data?.data?.cards || [];
      let restaurantCards = [];
      for (const c of cards) {
        const groups = c?.groupedCard?.cardGroupMap;
        if (groups?.RESTAURANT?.cards) {
          restaurantCards = restaurantCards.concat(groups.RESTAURANT.cards);
        }
        // If only DISH results, try to map to their parent restaurants
        if (groups?.DISH?.cards) {
          for (const dc of groups.DISH.cards) {
            const rInfo = dc?.card?.card?.restaurant?.info;
            if (rInfo) {
              restaurantCards.push({ card: { card: { info: rInfo } } });
            }
          }
        }
      }

      const extracted = restaurantCards
        .map((rc) => rc?.card?.card?.info)
        .filter(Boolean);

      setRestaurants(extracted);
    } catch (e) {
      setError('Failed to load results. Please try again.');
      setRestaurants([]);
    }
    setLoading(false);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    // sort locally
    setRestaurants((prev) => sortRestaurants(prev, newSortBy));
  };

  const handleFilterChange = (newFilterBy) => {
    setFilterBy(newFilterBy);
    setRestaurants((prev) => filterRestaurants(prev, newFilterBy));
  };

  const filterRestaurants = (list, fb) => {
    if (fb === 'all') return list;
    return list.filter((restaurant) => {
      switch (fb) {
        case 'veg':
          return restaurant?.veg === true;
        case 'rating':
          return parseFloat(restaurant?.avgRating || 0) >= 4.0;
        case 'fast':
          return parseInt(restaurant?.sla?.deliveryTime || 60) <= 30;
        default:
          return true;
      }
    });
  };

  const sortRestaurants = (list, sb) => {
    const copy = [...list];
    return copy.sort((a, b) => {
      switch (sb) {
        case 'rating':
          return parseFloat(b?.avgRating || 0) - parseFloat(a?.avgRating || 0);
        case 'deliveryTime':
          return parseInt(a?.sla?.deliveryTime || 60) - parseInt(b?.sla?.deliveryTime || 60);
        case 'costLowToHigh':
          return parseInt(a?.costForTwo?.replace(/[^\d]/g, '') || 0) - parseInt(b?.costForTwo?.replace(/[^\d]/g, '') || 0);
        case 'costHighToLow':
          return parseInt(b?.costForTwo?.replace(/[^\d]/g, '') || 0) - parseInt(a?.costForTwo?.replace(/[^\d]/g, '') || 0);
        default:
          return 0;
      }
    });
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
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FaSearch className="text-orange-500 text-xl" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Search Results for "{query}"
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Found {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}
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
        {restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((info) => (
              <Link to={`/home/restaurants/${info.id}`} key={info.id}>
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden group cursor-pointer border border-transparent dark:border-gray-700">
                  {/* Restaurant Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={`https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_508,h_320,c_fill/${info.cloudinaryImageId}`}
                      alt={info.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        parent.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white">
                            <div class="text-center">
                              <div class="text-4xl mb-2">🍽️</div>
                              <div class="font-bold text-lg">${info.name}</div>
                            </div>
                          </div>
                        `;
                      }}
                    />
                    
                    {/* Offer Badge */}
                    {info.aggregatedDiscountInfoV3?.header && (
                      <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {info.aggregatedDiscountInfoV3.header}
                      </div>
                    )}

                    {/* Veg Badge */}
                    {info.veg && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        VEG
                      </div>
                    )}
                  </div>

                  {/* Restaurant Details */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2 group-hover:text-orange-600 transition-colors duration-300 line-clamp-1">
                      {info.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 text-sm">
                        <FaStar className="text-yellow-500" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {info.avgRating || "N/A"}
                        </span>
                      </div>
                      <span className="text-gray-400 dark:text-gray-500">•</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {info.sla?.deliveryTime || "N/A"} mins
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                      {info.cuisines?.join(', ') || "Various cuisines"}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {info.areaName || "Location"}
                      </p>
                      {info.costForTwo && (
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {info.costForTwo}
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
