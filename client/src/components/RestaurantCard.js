import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";
import { toggleFavourite, selectIsFavourite } from "../store/favoritesSlice";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop";

const RestaurantCard = ({ resData }) => {
  const dispatch = useDispatch();
  const isFav = useSelector(selectIsFavourite(resData.id));
  const { id, name, cuisines, avgRating, costForTwo, deliveryTime, imageUrl, isOpen } = resData;

  const cuisineList = Array.isArray(cuisines) ? cuisines : (cuisines || "").split(",").map((c) => c.trim());
  const displayCuisines = cuisineList.slice(0, 2);
  const extraCount = cuisineList.length - displayCuisines.length;

  const handleFavClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleFavourite(resData));
  };

  return (
    <Link to={`/home/restaurants/${id}`} className="block">
      <div className="m-2 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Image */}
        <div className="relative w-full h-[160px] overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={imageUrl || PLACEHOLDER_IMG}
            alt={name}
            onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {/* Open/closed badge */}
          {isOpen === false && (
            <span className="absolute top-2 left-2 bg-black/70 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
              CLOSED
            </span>
          )}
          {/* Delivery time pill on image */}
          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded-md">
            🚀 {deliveryTime ?? "30"} min
          </span>
          {/* Favourite heart button */}
          <button
            onClick={handleFavClick}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
            aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
          >
            {isFav
              ? <FaHeart className="text-red-500" size={14} />
              : <FaRegHeart className="text-gray-500" size={14} />
            }
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-bold text-base text-gray-800 dark:text-gray-100 line-clamp-1 mb-1">{name}</h3>

          {/* Cuisine chips */}
          <div className="flex flex-wrap gap-1 mb-2">
            {displayCuisines.map((c) => (
              <span key={c} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">
                {c}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">+{extraCount} more</span>
            )}
          </div>

          {/* Rating & price */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-sm font-semibold text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded">
              <FaStar className="text-green-600 dark:text-green-400" size={11} />
              {avgRating || "New"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ₹{Math.round(costForTwo / 100)} for two
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
