import { CDN_URL } from "../utils/constants";
import { FaStar } from "react-icons/fa"; // Import star icon

const RestaurantCard = ({ resData }) => {
  const { cloudinaryImageId, name, cuisines, avgRating, costForTwo, sla } = resData?.info;

  return (
    <div className="m-6 p-4 w-[280px] h-[380px] bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200 relative overflow-hidden">
      
      {/* Image Section with Gradient Overlay */}
      <div className="relative w-full h-[170px] rounded-xl overflow-hidden">
        <img
          className="w-full h-full object-cover rounded-xl"
          src={CDN_URL + cloudinaryImageId}
          alt={name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl"></div>
      </div>

      {/* Restaurant Info */}
      <div className="p-3">
        <h3 className="font-extrabold text-lg text-gray-800">{name}</h3>
        <p className="text-gray-600 text-sm truncate">{cuisines.join(", ")}</p>

        {/* Rating & Price */}
        <div className="flex items-center justify-between mt-3">
          <span className="flex items-center text-yellow-500 font-semibold text-sm bg-yellow-100 px-2 py-1 rounded-md shadow">
            <FaStar className="mr-1 text-yellow-500" />
            {avgRating}
          </span>
          <span className="text-sm font-medium text-gray-700">{costForTwo}</span>
        </div>

        {/* Delivery Time */}
        <div className="mt-3 flex justify-center">
          <span className="text-xs font-semibold text-white bg-orange-500 px-3 py-1 rounded-full shadow-md">
            🚀 {sla.slaString} Delivery
          </span>
        </div>
      </div>
      
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-orange-100 opacity-0 hover:opacity-20 transition-all duration-300 rounded-xl"></div>
    </div>
  );
};

export default RestaurantCard;
