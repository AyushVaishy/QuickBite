import { useState } from "react";
import ItemList from "./ItemList";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const RestaurantCategory = ({ title, items, restaurantName }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-bold text-base sm:text-lg text-gray-800 dark:text-gray-100">
          {title}
          <span className="ml-2 text-sm font-normal text-gray-400">({items.length})</span>
        </span>
        {open ? (
          <FaChevronUp className="text-gray-400 flex-shrink-0" size={14} />
        ) : (
          <FaChevronDown className="text-gray-400 flex-shrink-0" size={14} />
        )}
      </button>
      {open && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2">
          <ItemList items={items} restaurantName={restaurantName} />
        </div>
      )}
    </div>
  );
};

export default RestaurantCategory;
