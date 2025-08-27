import { useEffect, useState, useRef } from "react";
import RestaurantCard from "./RestaurantCard";
import Shimmer from "./Shimmer";
import { Link, useOutletContext } from "react-router-dom";
import useOnlineStatus from "../utils/useOnlineStatus";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// Helper: fetch with pagination to get 30-32 restaurants (including duplicates from top restaurants)
async function fetchAllRestaurants(lat, lng) {
  const MIN_RESTAURANTS = 30;
  const MAX_RESTAURANTS = 32;
  let allRestaurants = [];
  let seenIds = new Set(); // Track unique IDs to avoid exact duplicates
  let offset = "";
  let hasMore = true;
  let pageCount = 0;
  const MAX_PAGES = 8; // Limit pages to avoid infinite loops

  while (hasMore && allRestaurants.length < MAX_RESTAURANTS && pageCount < MAX_PAGES) {
    const url = `https://www.swiggy.com/dapi/restaurants/list/v5?lat=${lat}&lng=${lng}&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING${offset ? `&offset=${encodeURIComponent(offset)}` : ""}`;
    
    const res = await fetch(url);
    if (!res.ok) break;
    
    const data = await res.json();
    const restaurantsCard = data?.data?.cards?.find(
      (c) => c?.card?.card?.gridElements?.infoWithStyle?.restaurants
    );
    const restaurants = restaurantsCard?.card?.card?.gridElements?.infoWithStyle?.restaurants || [];

    for (const rest of restaurants) {
      if (rest?.info?.id && !seenIds.has(rest.info.id)) {
        seenIds.add(rest.info.id);
        allRestaurants.push(rest);
        if (allRestaurants.length >= MAX_RESTAURANTS) break;
      }
    }

    if (allRestaurants.length >= MAX_RESTAURANTS) break;
    
    offset = data?.data?.pageOffset?.nextOffset;
    hasMore = !!offset;
    pageCount++;
    
    // Small delay between requests
    if (hasMore && allRestaurants.length < MIN_RESTAURANTS) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return allRestaurants;
}

const Body = () => {
  const { location } = useOutletContext();
  const [userData, setUserData] = useState(null);
  const [listOfRestaurants, setListOfRestaurants] = useState([]);
  const [filteredRestaurant, setFilteredRestaurant] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // All Restaurants section state
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [allRestaurantsLoading, setAllRestaurantsLoading] = useState(false);
  const [allRestaurantsError, setAllRestaurantsError] = useState("");
  
  // WhatsOnYourMind section state and refs
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
    fetchAllRestaurantsData();
    // eslint-disable-next-line
  }, [location]);

  // Initialize user data from localStorage and listen for changes
  useEffect(() => {
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    }

    // Listen for storage changes (when user signs in from another tab/window)
    const handleStorageChange = (e) => {
      if (e.key === 'userData') {
        if (e.newValue) {
          setUserData(JSON.parse(e.newValue));
        } else {
          setUserData(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchAllRestaurantsData = async () => {
    setAllRestaurantsLoading(true);
    setAllRestaurantsError("");
    try {
      const restaurants = await fetchAllRestaurants(location.lat, location.lng);
      setAllRestaurants(restaurants);
    } catch (error) {
      // Don't show error, just set empty array to show shimmer
      setAllRestaurants([]);
      console.error("Error fetching all restaurants:", error);
    }
    setAllRestaurantsLoading(false);
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://www.swiggy.com/dapi/restaurants/list/v5?lat=${location.lat}&lng=${location.lng}&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const json = await response.json();
      // Use only the specified path for Top Restaurants
      let restaurants =
      json.data.cards[1].card.card.gridElements.infoWithStyle.restaurants;

      setListOfRestaurants(restaurants || []);
      setFilteredRestaurant(restaurants || []);
    } catch (error) {
      setError("No restaurants found for this location or Swiggy is not available here.");
      setListOfRestaurants([]);
      setFilteredRestaurant([]);
    }
    setLoading(false);
  };

  // WhatsOnYourMind scroll functions
  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      const newScrollLeft = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      
      container.scrollTo({
        left: newScrollLeft,
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

  // Top Restaurants scroll function
  const scrollTopRestaurants = (direction) => {
    const container = topRestaurantsRef.current;
    if (container) {
      const scrollAmount = 300;
      const newScrollLeft = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      
      container.scrollTo({
        left: newScrollLeft,
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
  if (error) return <div className="text-center mt-24 text-xl font-semibold text-red-500">{error}</div>;

  return listOfRestaurants && listOfRestaurants.length === 0 ? (
    <Shimmer />
  ) : (
          <div className="body bg-gray-100 dark:bg-gray-950 min-h-screen">
                {/* WhatsOnYourMind Section */}
        <div className="bg-gray-100 dark:bg-gray-900 py-8 mt-[70px]">
          <div className="max-w-6xl mx-auto px-12">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
              <div>
                                 <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                   {userData ? `${userData.firstName}, what's on your mind?` : "What's on your mind?"}
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
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {foodCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col items-center min-w-[160px] group cursor-pointer hover:scale-105 transition-all duration-300"
                >
                  {/* Food Image */}
                  <div className="w-32 h-32 rounded-full overflow-hidden shadow-xl mb-5 group-hover:shadow-2xl transition-all duration-300">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback to a colored background with text if image fails to load
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
                  
                  {/* Category Name */}
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 text-center group-hover:text-orange-600 transition-colors duration-300 mb-1">
                    {category.name}
                  </h3>
                  
                  {/* Description */}
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
        <div className="max-w-6xl mx-auto px-12">
          {/* Section Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Top restaurants in {location.address ? location.address.split(',')[0] : 'your area'}
              </h2>
              <p className="text-gray-500 dark:text-gray-300 text-lg">Best rated places to order from</p>
            </div>
            
            {/* Navigation Arrows */}
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
          <div className="relative">
            <div
              ref={topRestaurantsRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {listOfRestaurants && listOfRestaurants.length > 0 ? (
                listOfRestaurants
                  .filter(restaurant => restaurant?.info && restaurant.info.id)
                  .map((restaurant) => (
                  <Link to={`restaurants/${restaurant.info.id}`} key={restaurant.info.id}>
                  <div
                    className="min-w-[280px] bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer border border-transparent dark:border-gray-700"
                  >
                                         {/* Restaurant Image */}
                     <div className="relative h-48 rounded-t-xl overflow-hidden">
                       <img
                         src={`https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_508,h_320,c_fill/${restaurant.info.cloudinaryImageId}`}
                         alt={restaurant.info.name}
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                         onError={(e) => {
                           // Better fallback handling
                           e.target.style.display = 'none';
                           const parent = e.target.parentElement;
                           parent.innerHTML = `
                             <div class="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white">
                               <div class="text-center">
                                                            <div class="text-4xl mb-2">🍽️</div>
                                 <div class="font-bold text-lg">${restaurant.info.name}</div>
                               </div>
                             </div>
                           `;
                         }}
                       />
                      
                                             {/* Offer Badge */}
                       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                         <div className="text-white font-semibold text-sm">
                           {restaurant.info.aggregatedDiscountInfoV3?.header || "ITEMS AT ₹99"}
                         </div>
                       </div>
                     </div>
                     
                     {/* Restaurant Details */}
                     <div className="p-4">
                       <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                         {restaurant.info.name || "Restaurant"}
                       </h3>
                       
                       <div className="flex items-center gap-2 mb-2">
                         <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                           <span className="text-yellow-500">★</span>
                           {restaurant.info.avgRating || "N/A"}
                         </span>
                         <span className="text-gray-400 dark:text-gray-500">•</span>
                         <span className="text-sm text-gray-600 dark:text-gray-300">
                           {restaurant.info.sla?.deliveryTime || "N/A"} mins
                         </span>
                       </div>
                       
                       <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                         {restaurant.info.cuisines?.slice(0, 2).join(', ') || "Various cuisines"}
                       </p>
                       
                       <p className="text-sm text-gray-500 dark:text-gray-400">
                         {restaurant.info.areaName || "Location"}
                       </p>
                     </div>
                  </div>
                  </Link>
                ))
              ) : loading ? (
                <div className="text-center text-gray-500 py-8">
                  Loading top restaurants...
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  {error || "No restaurants found. Please try again later."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Separator Line */}
      <div className="w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent h-px"></div>

      {/* All Restaurants Near Me Section */}
      <div className="bg-gray-100 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-12">
          {/* Section Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              All Restaurants Near Me
            </h2>
            <p className="text-gray-500 dark:text-gray-300 text-lg mb-3">
              Discover amazing places to eat in your area
            </p>
            {/* Total count hidden as requested */}
          </div>

          {/* Loading State */}
          {allRestaurantsLoading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                <span className="text-lg">Loading all restaurants...</span>
              </div>
            </div>
          )}

          {/* Error State - Show shimmer instead of error */}
          {allRestaurantsError && !allRestaurantsLoading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                <span className="text-lg">Loading all restaurants...</span>
              </div>
            </div>
          )}

          {/* Restaurants Grid */}
          {!allRestaurantsLoading && !allRestaurantsError && allRestaurants.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {allRestaurants.slice(0, 32).map((restaurant) => (
                  <Link to={`restaurants/${restaurant.info.id}`} key={restaurant.info.id}>
                  <div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden group cursor-pointer border border-transparent dark:border-gray-700"
                  >
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
                    </div>

                    {/* Restaurant Details */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2 group-hover:text-orange-600 transition-colors duration-300 line-clamp-1">
                        {restaurant.info.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <span className="text-yellow-500">★</span>
                          {restaurant.info.avgRating || "N/A"}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {restaurant.info.sla?.deliveryTime || "N/A"} mins
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                        {restaurant.info.cuisines?.join(', ') || "Various cuisines"}
                      </p>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {restaurant.info.areaName || "Location"}
                      </p>

                      {/* Cost for Two */}
                      {restaurant.info.costForTwo && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {restaurant.info.costForTwo}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            for two people
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  </Link>
                ))}
              </div>
              
              {/* Count message hidden as requested */}
            </>
          )}

          {/* Empty State */}
          {!allRestaurantsLoading && !allRestaurantsError && allRestaurants.length === 0 && (
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

export default Body;
