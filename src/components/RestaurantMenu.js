import { useState } from "react";
import { useParams } from "react-router-dom";
import useRestaurantMenu from "../utils/useRestaurantMenu";
import ShimmerMenu from "./ShimmerMenu";
import RestaurantCategory from "./RestaurantCategory";
import { FaStar } from "react-icons/fa"; // Star icon for rating

const RestaurantMenu = () => {
  const { resId } = useParams();
  const resInfo = useRestaurantMenu(resId);
  const [showIndex, setShowIndex] = useState(null);

  if (resInfo === null) return <ShimmerMenu />;

  const {
    name,
    cuisines,
    costForTwoMessage,
    cloudinaryImageId,
    avgRating,
    sla,
  } = resInfo?.cards[2]?.card?.card?.info;

  const categories =
    resInfo?.cards[5]?.groupedCard?.cardGroupMap?.REGULAR?.cards.filter(
      (c) =>
        c.card?.card?.["@type"] ===
        "type.googleapis.com/swiggy.presentation.food.v2.ItemCategory"
    );

  return (
    <div className="min-h-screen bg-gray-50 pt-[90px]">
      {/* 🔥 Hero Section (Restaurant Info) */}
      <div className="relative w-full h-[200px] flex items-center justify-center bg-gradient-to-r from-orange-500 to-yellow-400 shadow-lg">
        <div className="absolute w-full h-full bg-black bg-opacity-40 backdrop-blur-sm"></div>

        <div className="relative text-center text-white px-6 max-w-5xl">
          <h1 className="text-5xl font-extrabold drop-shadow-lg mb-2">{name}</h1>
          <p className="text-lg italic opacity-90">{cuisines.join(", ")}</p>

          {/* Restaurant Info */}
          <div className="mt-4 flex justify-center space-x-6">
            <span className="flex items-center bg-yellow-400 text-black px-6 py-2 rounded-full text-lg font-bold shadow-md">
              <FaStar className="mr-2 text-yellow-700" /> {avgRating}
            </span>
            <span className="text-lg font-semibold bg-white text-black px-6 py-2 rounded-full shadow-md">
              {costForTwoMessage}
            </span>
            <span className="text-sm bg-gray-700 text-white px-6 py-2 rounded-full">
              🚴 {sla?.slaString}
            </span>
          </div>
        </div>
      </div>

      {/* 🍽️ Unified Menu Container */}
      <div className="max-w-screen-2xl mx-auto py-12 px-16 bg-white shadow-lg rounded-xl">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-10">
          📜 Explore Our Exclusive Menu
        </h2>

        <div className="space-y-6">
          {categories.map((category, index) => (
            <RestaurantCategory key={category?.card?.card?.title} data={category?.card?.card} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantMenu;
