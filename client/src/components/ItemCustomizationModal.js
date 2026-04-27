import { useState, useEffect } from "react";

const getCustomizations = (item) => {
  const name = (item.name || "").toLowerCase();
  const cat = (item.category || "").toLowerCase();
  const groups = [];

  if (["pizza", "burger", "sandwich", "wrap", "roll", "sub"].some((k) => name.includes(k) || cat.includes(k))) {
    groups.push({
      id: "size",
      title: "Choose Size",
      type: "radio",
      required: true,
      options: [
        { id: "regular", label: "Regular", extraPrice: 0 },
        { id: "medium", label: "Medium", extraPrice: 2000 },
        { id: "large", label: "Large", extraPrice: 4000 },
      ],
      default: "regular",
    });
  }

  if (["biryani", "curry", "masala", "chicken", "paneer", "dal", "rice", "gravy"].some((k) => name.includes(k) || cat.includes(k))) {
    groups.push({
      id: "spice",
      title: "Spice Level",
      type: "radio",
      required: false,
      options: [
        { id: "mild", label: "Mild 🌶️", extraPrice: 0 },
        { id: "medium", label: "Medium 🌶️🌶️", extraPrice: 0 },
        { id: "spicy", label: "Spicy 🌶️🌶️🌶️", extraPrice: 0 },
      ],
      default: "medium",
    });
  }

  if (["pizza", "burger", "sandwich"].some((k) => name.includes(k) || cat.includes(k))) {
    groups.push({
      id: "addons",
      title: "Add-ons",
      type: "checkbox",
      required: false,
      options: [
        { id: "cheese", label: "Extra Cheese", extraPrice: 2000 },
        { id: "sauce", label: "Extra Sauce", extraPrice: 1000 },
        { id: "veggies", label: "Extra Veggies", extraPrice: 1500 },
      ],
    });
  }

  return groups;
};

const buildDefaultSelections = (groups) => {
  const sel = {};
  groups.forEach((g) => {
    if (g.type === "radio" && g.default) sel[g.id] = g.default;
    if (g.type === "checkbox") sel[g.id] = [];
  });
  return sel;
};

const calcExtraPrice = (groups, selections) => {
  let extra = 0;
  groups.forEach((g) => {
    if (g.type === "radio") {
      const selId = selections[g.id];
      const opt = g.options.find((o) => o.id === selId);
      if (opt) extra += opt.extraPrice;
    } else if (g.type === "checkbox") {
      const selIds = selections[g.id] || [];
      selIds.forEach((sid) => {
        const opt = g.options.find((o) => o.id === sid);
        if (opt) extra += opt.extraPrice;
      });
    }
  });
  return extra;
};

const ItemCustomizationModal = ({ item, restaurantName, onClose, onConfirm }) => {
  const groups = getCustomizations(item);
  const [qty, setQty] = useState(1);
  const [selections, setSelections] = useState(() => buildDefaultSelections(groups));

  // Trap scroll on mount
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const extraPrice = calcExtraPrice(groups, selections);
  const total = (item.price + extraPrice) * qty;

  const handleRadioChange = (groupId, optionId) => {
    setSelections((prev) => ({ ...prev, [groupId]: optionId }));
  };

  const handleCheckboxChange = (groupId, optionId) => {
    setSelections((prev) => {
      const current = prev[groupId] || [];
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [groupId]: next };
    });
  };

  const handleConfirm = () => {
    onConfirm(item, qty, selections);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-2xl p-5 pb-8 animate-slide-up"
        style={{ transform: "translateY(0)", transition: "transform 0.3s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          ×
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-5 pr-8">
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className={`w-3.5 h-3.5 rounded-sm border-2 flex-shrink-0 flex items-center justify-center ${
                  item.isVeg ? "border-green-600" : "border-red-500"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-green-600" : "bg-red-500"}`} />
              </span>
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base line-clamp-1">{item.name}</h2>
            </div>
            <p className="text-orange-500 font-bold text-sm">₹{(item.price / 100).toFixed(0)}</p>
            {restaurantName && (
              <p className="text-xs text-gray-400 mt-0.5">{restaurantName}</p>
            )}
          </div>
        </div>

        {/* Customization groups */}
        {groups.length > 0 && (
          <div className="space-y-4 mb-5 max-h-64 overflow-y-auto">
            {groups.map((group) => (
              <div key={group.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{group.title}</h3>
                  {group.required && (
                    <span className="text-[10px] font-bold text-white bg-orange-500 px-1.5 py-0.5 rounded-full">Required</span>
                  )}
                </div>

                {group.type === "radio" && (
                  <div className="space-y-1.5">
                    {group.options.map((opt) => {
                      const selected = selections[group.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleRadioChange(group.id, opt.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition ${
                            selected
                              ? "border-orange-400 bg-orange-50 dark:bg-orange-900/20"
                              : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                selected ? "border-orange-500" : "border-gray-300 dark:border-gray-500"
                              }`}
                            >
                              {selected && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                            </span>
                            <span className={`font-medium ${selected ? "text-orange-700 dark:text-orange-300" : "text-gray-700 dark:text-gray-300"}`}>
                              {opt.label}
                            </span>
                          </div>
                          {opt.extraPrice > 0 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">+₹{opt.extraPrice / 100}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {group.type === "checkbox" && (
                  <div className="space-y-1.5">
                    {group.options.map((opt) => {
                      const checked = (selections[group.id] || []).includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleCheckboxChange(group.id, opt.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition ${
                            checked
                              ? "border-orange-400 bg-orange-50 dark:bg-orange-900/20"
                              : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                checked ? "border-orange-500 bg-orange-500" : "border-gray-300 dark:border-gray-500"
                              }`}
                            >
                              {checked && <span className="text-white text-[10px] font-bold">✓</span>}
                            </span>
                            <span className={`font-medium ${checked ? "text-orange-700 dark:text-orange-300" : "text-gray-700 dark:text-gray-300"}`}>
                              {opt.label}
                            </span>
                          </div>
                          {opt.extraPrice > 0 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">+₹{opt.extraPrice / 100}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quantity selector */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Quantity</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full border-2 border-orange-400 text-orange-500 font-bold flex items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
            >
              −
            </button>
            <span className="w-8 text-center font-bold text-gray-800 dark:text-gray-100 text-base">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(10, q + 1))}
              className="w-8 h-8 rounded-full border-2 border-orange-400 text-orange-500 font-bold flex items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleConfirm}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-base transition shadow-md shadow-orange-200 dark:shadow-orange-900/30"
        >
          Add item · ₹{(total / 100).toFixed(0)}
        </button>
      </div>
    </div>
  );
};

export default ItemCustomizationModal;
