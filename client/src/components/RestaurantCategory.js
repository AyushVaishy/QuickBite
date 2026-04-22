import { useState } from 'react';
import ItemList from './ItemList';

const RestaurantCategory = ({ title, items, restaurantName }) => {
  const [showItems, setShowItems] = useState(true);

  return (
    <div>
      {/* Accordion Header */}
      <div className="w-6/12 mx-auto my-4 bg-gray-50 dark:bg-gray-800 shadow-lg p-4">
        <div
          className="flex justify-between cursor-pointer"
          onClick={() => setShowItems(!showItems)}
        >
          <span className="font-bold text-lg dark:text-gray-100">
            {title} ({items.length})
          </span>
          <span>{showItems ? "🔼" : "🔽"}</span>
        </div>
        {/* Accordion Body */}
        {showItems && <ItemList items={items} restaurantName={restaurantName} />}
      </div>
    </div>
  );
};

export default RestaurantCategory;
