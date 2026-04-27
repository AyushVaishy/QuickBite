import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useOutletContext } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { searchRestaurants } from '../services/restaurantService';
import RestaurantCard from '../components/RestaurantCard';
import Shimmer from '../components/Shimmer';

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop';

const SearchResultsPage = () => {
  const { location } = useOutletContext();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [restaurants, setRestaurants] = useState([]);
  const [allFetched, setAllFetched] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [filterBy, setFilterBy] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
    // eslint-disable-next-line
  }, [query, location?.lat, location?.lng]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    setError('');
    try {
      const res = await searchRestaurants(location.lat, location.lng, searchQuery);
      const data = res.data.restaurants || [];
      setAllFetched(data);
      setRestaurants(data);
      setSortBy('relevance');
      setFilterBy('all');
    } catch (e) {
      setError('Failed to load results. Please try again.');
      setRestaurants([]);
      setAllFetched([]);
    }
    setLoading(false);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setRestaurants((prev) => sortRestaurants(prev, newSortBy));
  };

  const handleFilterChange = (newFilterBy) => {
    setFilterBy(newFilterBy);
    const filtered = filterRestaurants(allFetched, newFilterBy);
    setRestaurants(sortRestaurants(filtered, sortBy));
  };

  const filterRestaurants = (list, fb) => {
    if (fb === 'all') return list;
    return list.filter((r) => {
      switch (fb) {
        case 'rating':
          return parseFloat(r.avgRating || 0) >= 4.0;
        case 'fast':
          return parseInt(r.deliveryTime || 60) <= 30;
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
          return parseFloat(b.avgRating || 0) - parseFloat(a.avgRating || 0);
        case 'deliveryTime':
          return parseInt(a.deliveryTime || 60) - parseInt(b.deliveryTime || 60);
        case 'costLowToHigh':
          return (a.costForTwo || 0) - (b.costForTwo || 0);
        case 'costHighToLow':
          return (b.costForTwo || 0) - (a.costForTwo || 0);
        default:
          return 0;
      }
    });
  };

  if (loading) {
    return <Shimmer />;
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
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Sort by</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'relevance', label: 'Relevance' },
                  { value: 'rating', label: 'Top Rated' },
                  { value: 'deliveryTime', label: 'Fastest' },
                  { value: 'costLowToHigh', label: 'Cost ↑' },
                  { value: 'costHighToLow', label: 'Cost ↓' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleSortChange(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                      sortBy === opt.value
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-orange-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:border-l sm:border-gray-200 sm:dark:border-gray-700 sm:pl-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Filter</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'rating', label: '⭐ 4.0+' },
                  { value: 'fast', label: '🚀 Fast Delivery' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleFilterChange(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                      filterBy === opt.value
                        ? 'bg-gray-800 dark:bg-gray-200 border-gray-800 dark:border-gray-200 text-white dark:text-gray-900'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {restaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {restaurants.map((r) => (
              <div key={r.id}>
                <RestaurantCard resData={r} />
              </div>
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

export default SearchResultsPage;
