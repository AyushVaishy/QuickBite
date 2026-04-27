import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { addItem, removeItem, updateQuantity } from "../store/cartSlice";
import ItemCustomizationModal from "./ItemCustomizationModal";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop";

const isBestseller = (id = "") => {
  const sum = id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return sum % 3 === 0;
};

const ItemList = ({ items, restaurantName }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((s) => s.cart.items);
  const [customizingItem, setCustomizingItem] = useState(null);

  const getCartQty = (id) => {
    const found = cartItems.find((i) => i.id === id);
    return found ? found.quantity : 0;
  };

  const handleAdd = (item) => {
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
      toast("🔄 Cart cleared — items from previous restaurant removed", { icon: "⚠️" });
    } else {
      toast.success(`${item.name} added to cart 🛒`, { duration: 1500 });
    }
  };

  const handleDecrement = (item) => {
    const qty = getCartQty(item.id);
    if (qty <= 1) {
      dispatch(removeItem(item.id));
    } else {
      dispatch(updateQuantity({ id: item.id, quantity: qty - 1 }));
    }
  };

  return (
    <>
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {items.map((item) => {
        const qty = getCartQty(item.id);
        return (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 py-4"
          >
            {/* Left: info */}
            <div className="flex-1 min-w-0">
              {/* Bestseller badge */}
              {isBestseller(item.id) && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20 px-2 py-0.5 rounded-full mb-1">
                  🔥 Bestseller
                </span>
              )}
              {/* Veg/non-veg dot + name */}
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={`w-3.5 h-3.5 rounded-sm border-2 flex-shrink-0 flex items-center justify-center ${
                    item.isVeg ? "border-green-600" : "border-red-500"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.isVeg ? "bg-green-600" : "bg-red-500"
                    }`}
                  />
                </span>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm sm:text-base line-clamp-1">
                  {item.name}
                </h3>
              </div>
              <p className="text-orange-500 font-bold text-sm mb-1">
                ₹{(item.price / 100).toFixed(0)}
              </p>
              {item.description && (
                <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2">{item.description}</p>
              )}
            </div>

            {/* Right: image + add/qty control */}
            <div className="flex flex-col items-center flex-shrink-0 relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-md bg-gray-100 dark:bg-gray-700">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                )}
              </div>

              {/* Add / qty control */}
              {qty === 0 ? (
                <button
                  onClick={() => setCustomizingItem(item)}
                  className="absolute -bottom-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-green-600 dark:text-green-400 font-bold text-sm px-5 py-1 rounded-lg shadow hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                >
                  ADD
                </button>
              ) : (
                <div className="absolute -bottom-3 flex items-center bg-green-600 text-white rounded-lg shadow overflow-hidden text-sm font-bold">
                  <button
                    onClick={() => handleDecrement(item)}
                    className="px-2.5 py-1 hover:bg-green-700 transition"
                  >
                    −
                  </button>
                  <span className="px-2 py-1 bg-white text-green-700 min-w-[24px] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => handleAdd(item)}
                    className="px-2.5 py-1 hover:bg-green-700 transition"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
    {customizingItem && (
      <ItemCustomizationModal
        item={customizingItem}
        restaurantName={restaurantName}
        onClose={() => setCustomizingItem(null)}
        onConfirm={(item, qty, customizations) => {
          for (let i = 0; i < qty; i++) handleAdd(item);
          setCustomizingItem(null);
        }}
      />
    )}
    </>
  );
};

export default ItemList;
