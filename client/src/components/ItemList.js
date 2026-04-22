import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { addItem } from "../store/cartSlice";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop";

const ItemList = ({ items, restaurantName }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(store => store.cart.items);

  const handleAddItem = (item) => {
    const willClear = cartItems.length > 0 && cartItems[0].restaurantId !== item.restaurantId;
    dispatch(
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        isVeg: item.isVeg,
        restaurantId: item.restaurantId,
        restaurantName: restaurantName || "",
        imageUrl: item.imageUrl,
        quantity: 1,
      })
    );
    if (willClear) {
      toast('🔄 Cart cleared — items from previous restaurant removed', { icon: '⚠️' });
    } else {
      toast.success(`${item.name} added to cart 🛒`, { duration: 1800 });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          {/* Item Info Section */}
          <div className="w-8/12 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-block w-3 h-3 rounded-full flex-shrink-0 ${
                  item.isVeg ? "bg-green-500" : "bg-red-500"
                }`}
                title={item.isVeg ? "Veg" : "Non-veg"}
              />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {item.name}
              </h3>
            </div>
            {item.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                {item.description}
              </p>
            )}
            <p className="text-orange-500 font-bold mt-2">
              ₹{(item.price / 100).toFixed(0)}
            </p>
          </div>

          {/* Image & Add Button Section */}
          <div className="w-4/12 relative flex flex-col items-center">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-[120px] h-[120px] rounded-lg object-cover shadow-md"
                onError={(e) => {
                  e.target.src = PLACEHOLDER_IMG;
                }}
              />
            ) : (
              <div className="w-[120px] h-[120px] rounded-lg bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white text-3xl shadow-md">
                🍽️
              </div>
            )}
            <button
              className="absolute -bottom-4 bg-black dark:bg-gray-900 text-white px-4 py-1 rounded-lg text-sm font-semibold shadow-md hover:bg-orange-500 transition-all duration-300"
              onClick={() => handleAddItem(item)}
            >
              Add +
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ItemList;
