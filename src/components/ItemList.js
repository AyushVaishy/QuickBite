import { useDispatch } from "react-redux";
import { addItem } from "../utils/cartSlice";
import { CDN_URL } from "../utils/constants";

const ItemList = ({ items }) => {
  const dispatch = useDispatch();

  const handleAddItem = (item) => {
    dispatch(addItem(item));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {items.map((item) => (
        <div
          key={item.card.info.id}
          className="flex justify-between items-center p-4 border-b border-gray-300 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          {/* Item Info Section */}
          <div className="w-8/12 pr-4">
            <h3 className="text-lg font-semibold">{item.card.info.name}</h3>
            <p className="text-gray-600 text-sm mt-1">
              {item.card.info.description}
            </p>
            <p className="text-orange-500 font-bold mt-2">
              ₹
              {item.card.info.price
                ? item.card.info.price / 100
                : item.card.info.defaultPrice / 100}
            </p>
          </div>

          {/* Image & Add Button Section */}
          <div className="w-4/12 relative flex flex-col items-center">
            <img
              src={CDN_URL + item.card.info.imageId}
              alt={item.card.info.name}
              className="w-[120px] h-[120px] rounded-lg object-cover shadow-md"
            />
            <button
              className="absolute -bottom-4 bg-black text-white px-4 py-1 rounded-lg text-sm font-semibold shadow-md hover:bg-orange-500 transition-all duration-300"
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
