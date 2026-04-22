import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop";

const RestaurantCard = ({ resData }) => {
  const { id, name, cuisines, avgRating, costForTwo, deliveryTime, imageUrl } = resData;

  return (
    <Link to={`/home/restaurants/${id}`} className="block">
      <div className="m-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700 relative overflow-hidden">
        {/* Image Section with Gradient Overlay */}
        <div className="relative w-full h-[170px] overflow-hidden">
          <img
            className="w-full h-full object-cover rounded-t-xl"
            src={imageUrl || PLACEHOLDER_IMG}
            alt={name}
            onError={(e) => {
              e.target.src = PLACEHOLDER_IMG;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

        {/* Restaurant Info */}
        <div className="p-3">
          <h3 className="font-extrabold text-lg text-gray-800 dark:text-gray-100 line-clamp-1">{name}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm truncate">
            {Array.isArray(cuisines) ? cuisines.join(", ") : cuisines}
          </p>

          {/* Rating & Price */}
          <div className="flex items-center justify-between mt-3">
            <span className="flex items-center text-yellow-500 font-semibold text-sm bg-yellow-100 px-2 py-1 rounded-md shadow">
              <FaStar className="mr-1 text-yellow-500" />
              {avgRating || "N/A"}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              ₹{costForTwo} for two
            </span>
          </div>

          {/* Delivery Time */}
          <div className="mt-3 flex justify-center">
            <span className="text-xs font-semibold text-white bg-orange-500 px-3 py-1 rounded-full shadow-md">
              🚀 {deliveryTime} mins Delivery
            </span>
          </div>
        </div>

        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 bg-orange-100 opacity-0 hover:opacity-20 transition-all duration-300 rounded-xl pointer-events-none"></div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
