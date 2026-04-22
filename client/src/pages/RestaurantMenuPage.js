import { useParams } from "react-router-dom";
import useRestaurantMenu from "../hooks/useRestaurantMenu";
import ShimmerMenu from "../components/ShimmerMenu";
import RestaurantCategory from "../components/RestaurantCategory";
import { FaStar } from "react-icons/fa";

const RestaurantMenuPage = () => {
  const { resId } = useParams();
  const { restaurant, menu, loading, error } = useRestaurantMenu(resId);

  if (loading) return <ShimmerMenu />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 pt-24">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Failed to load menu
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!restaurant) return <ShimmerMenu />;

  const categories = menu ? Object.entries(menu) : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-[90px]">
      {/* 🔥 Hero Section (Restaurant Info) */}
      <div className="relative w-full h-[200px] flex items-center justify-center bg-gradient-to-r from-orange-500 to-yellow-400 shadow-lg">
        <div className="absolute w-full h-full bg-black bg-opacity-40 backdrop-blur-sm"></div>

        <div className="relative text-center text-white px-6 max-w-5xl">
          <h1 className="text-5xl font-extrabold drop-shadow-lg mb-2">{restaurant.name}</h1>
          <p className="text-lg italic opacity-90">
            {Array.isArray(restaurant.cuisines)
              ? restaurant.cuisines.join(", ")
              : restaurant.cuisines}
          </p>

          {/* Restaurant Info */}
          <div className="mt-4 flex justify-center space-x-6">
            <span className="flex items-center bg-yellow-400 text-black px-6 py-2 rounded-full text-lg font-bold shadow-md">
              <FaStar className="mr-2 text-yellow-700" /> {restaurant.avgRating}
            </span>
            <span className="text-lg font-semibold bg-white text-black px-6 py-2 rounded-full shadow-md">
              ₹{restaurant.costForTwo} for two
            </span>
            <span className="text-sm bg-gray-700 text-white px-6 py-2 rounded-full">
              🚴 {restaurant.deliveryTime} mins
            </span>
          </div>
        </div>
      </div>

      {/* 🍽️ Unified Menu Container */}
      <div className="max-w-screen-2xl mx-auto py-12 px-16 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
        <h2 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-10">
          📜 Explore Our Exclusive Menu
        </h2>

        {categories.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 text-lg">
            No menu items available.
          </p>
        ) : (
          <div className="space-y-6">
            {categories.map(([title, items]) => (
              <RestaurantCategory
                key={title}
                title={title}
                items={items}
                restaurantName={restaurant.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenuPage;
