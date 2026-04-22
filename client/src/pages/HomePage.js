import { useEffect, useState, useRef } from "react";
import RestaurantCard from "../components/RestaurantCard";
import Shimmer from "../components/Shimmer";
import { Link, useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getRestaurants } from "../services/restaurantService";

const HomePage = () => {
  const { location } = useOutletContext();
  const { user } = useSelector((state) => state.auth);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // WhatsOnYourMind section refs
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Top Restaurants section ref
  const topRestaurantsRef = useRef(null);

  // Food categories data
  const foodCategories = [
    {
      id: 1,
      name: "Cakes",
      imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=112&h=112&fit=crop&crop=center",
      description: "Sweet delights"
    },
    {
      id: 2,
      name: "Pizzas",
      imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=112&h=112&fit=crop&crop=center",
      description: "Italian favorites"
    },
    {
      id: 3,
      name: "Burgers",
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=112&h=112&fit=crop&crop=center",
      description: "Classic comfort"
    },
    {
      id: 4,
      name: "Desserts",
      imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=112&h=112&fit=crop&crop=center",
      description: "Sweet endings"
    },
    {
      id: 5,
      name: "Pure Veg",
      imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=112&h=112&fit=crop&crop=center",
      description: "Healthy choices"
    },
    {
      id: 6,
      name: "Rolls",
      imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=112&h=112&fit=crop&crop=center",
      description: "Quick bites"
    },
    {
      id: 7,
      name: "Noodles",
      imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=112&h=112&fit=crop&crop=center",
      description: "Asian flavors"
    },
    {
      id: 8,
      name: "Biryani",
      imageUrl: "https://images.unsplash.com/photo-1563379091339-3b21bbd4c4e3?w=112&h=112&fit=crop&crop=center",
      description: "Aromatic rice"
    },
    {
      id: 9,
      name: "Ice Cream",
      imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=112&h=112&fit=crop&crop=center",
      description: "Cool treats"
    },
    {
      id: 10,
      name: "Sandwiches",
      imageUrl: "https://images.unsplash.com/photo-1528735602780-2ba8f1ee5a02?w=112&h=112&fit=crop&crop=center",
      description: "Light meals"
    }
  ];

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [location]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getRestaurants(location.lat, location.lng);
      const restaurants = response.data.restaurants || [];
      const top = [...restaurants]
        .filter((r) => r.avgRating)
        .sort((a, b) => parseFloat(b.avgRating) - parseFloat(a.avgRating))
        .slice(0, 10);
      setTopRestaurants(top);
      setAllRestaurants(restaurants);
    } catch (err) {
      setError("Failed to load restaurants");
      setTopRestaurants([]);
      setAllRestaurants([]);
    }
    setLoading(false);
  };

  // WhatsOnYourMind scroll functions
  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollTo({
        left: container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount),
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth);
    }
  };

  const scrollTopRestaurants = (direction) => {
    const container = topRestaurantsRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollTo({
        left: container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount),
        behavior: 'smooth'
      });
    }
  };

  const onlineStatus = useOnlineStatus();

  if (!onlineStatus)
    return (
      <h1 className="text-center mt-24 text-xl font-semibold text-red-500">
        🚨 You're offline! Please check your internet connection.
      </h1>
    );

  if (loading) return <Shimmer />;

  return allRestaurants.length === 0 ? (
    <div className="flex flex-col items-center justify-center min-h-[60vh] mt-24 px-6">
      <img
        src={require("../assets/location_unserviceable.webp")}
        alt="Service not available"
        className="w-56 h-56 object-contain opacity-90 mb-6"
      />
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">We'll be there soon!</h2>
      <p className="text-gray-600 dark:text-gray-300 max-w-xl text-center mb-6">
        {error || "QuickBite is not serving this location yet. We're expanding rapidly and hope to serve your area soon."}
      </p>
      <button
        onClick={() => window.dispatchEvent(new Event('openLocationSidebar'))}
        className="px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
      >
        Choose a different location
      </button>
    </div>
  ) : (
    <div className="body bg-gray-100 dark:bg-gray-950 min-h-screen">
      {/* WhatsOnYourMind Section */}
      <div className="bg-gray-100 dark:bg-gray-900 py-8 mt-[70px]">
        <div className="max-w-6xl mx-auto px-12">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {user ? `${user.name}, what's on your mind?` : "What's on your mind?"}
              </h2>
              <p className="text-gray-500 dark:text-gray-300 text-lg">Explore delicious food categories</p>
            </div>

            {/* Navigation Arrows */}
            <div className="flex gap-3">
              {showLeftArrow && (
                <button
                  onClick={() => scroll('left')}
                  className="w-12 h-12 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label="Scroll left"
                >
                  <FaChevronLeft className="text-gray-600 dark:text-gray-300 text-lg" />
                </button>
              )}
              {showRightArrow && (
                <button
                  onClick={() => scroll('right')}
                  className="w-12 h-12 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label="Scroll right"
                >
                  <FaChevronRight className="text-gray-600 dark:text-gray-300 text-lg" />
                </button>
              )}
            </div>
          </div>

          {/* Food Categories Carousel */}
          <div className="relative">
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex gap-10 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {foodCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col items-center min-w-[160px] group cursor-pointer hover:scale-105 transition-all duration-300"
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden shadow-xl mb-5 group-hover:shadow-2xl transition-all duration-300">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        parent.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-4xl">
                            ${category.name.charAt(0)}
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 text-center group-hover:text-orange-600 transition-colors duration-300 mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {category.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Restaurants Section */}
      <div className="bg-white dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-12 mt-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Top restaurants in {location.address ? location.address.split(',')[0] : 'your area'}
              </h2>
              <p className="text-gray-500 dark:text-gray-300 text-lg">Best rated places to order from</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => scrollTopRestaurants('left')}
                className="w-12 h-12 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Scroll left"
              >
                <FaChevronLeft className="text-gray-600 dark:text-gray-300 text-lg" />
              </button>
              <button
                onClick={() => scrollTopRestaurants('right')}
                className="w-12 h-12 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                aria-label="Scroll right"
              >
                <FaChevronRight className="text-gray-600 dark:text-gray-300 text-lg" />
              </button>
            </div>
          </div>

          {/* Top Restaurants Carousel */}
          <div
            ref={topRestaurantsRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {topRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="min-w-[280px]">
                <RestaurantCard resData={restaurant} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Separator Line */}
      <div className="w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent h-px"></div>

      {/* All Restaurants Near Me Section */}
      <div className="bg-gray-100 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-12">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              All Restaurants Near Me
            </h2>
            <p className="text-gray-500 dark:text-gray-300 text-lg mb-3">
              Discover amazing places to eat in {location.address ? location.address.split(',')[0] : 'your area'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} resData={restaurant} />
            ))}
          </div>

          {allRestaurants.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 text-lg">
                No restaurants found in your area. Please try a different location.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

// Helper: fetch a single page from Swiggy list API (supports pagination via nextOffset)