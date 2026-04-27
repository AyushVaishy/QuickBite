import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { clearCart, updateQuantity, removeItem } from "../store/cartSlice";
import { createOrder } from "../services/orderService";
import { getAddresses, addAddress as addAddressAPI } from "../services/addressService";
import { FaShoppingCart, FaUtensils, FaMapMarkerAlt, FaCheckCircle, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

const CartPage = () => {
  const cartItems = useSelector((store) => store.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "Home", street: "", city: "", state: "", pincode: "" });
  const [savingAddress, setSavingAddress] = useState(false);
  const [address, setAddress] = useState(""); // fallback plain text
  const [placing, setPlacing] = useState(false);
  const [suggestion, setSuggestion] = useState("");

  useEffect(() => {
    getAddresses()
      .then((res) => {
        const addrs = res.data.addresses || [];
        setSavedAddresses(addrs);
        const def = addrs.find((a) => a.isDefault) || addrs[0];
        if (def) setSelectedAddressId(def.id);
        else setShowNewForm(true);
      })
      .catch(() => setShowNewForm(true));
  }, []);

  const handleSaveNewAddress = async () => {
    if (!newAddress.street.trim() || !newAddress.city.trim()) {
      toast.error("Street and city are required");
      return;
    }
    setSavingAddress(true);
    try {
      const res = await addAddressAPI({
        label: newAddress.label || "Home",
        street: newAddress.street.trim(),
        city: newAddress.city.trim(),
        state: newAddress.state.trim() || "India",
        pincode: newAddress.pincode.trim() || "000000",
        lat: 0,
        lng: 0,
        isDefault: savedAddresses.length === 0,
      });
      const added = res.data.address;
      setSavedAddresses((prev) => [...prev, added]);
      setSelectedAddressId(added.id);
      setShowNewForm(false);
      setNewAddress({ label: "Home", street: "", city: "", state: "", pincode: "" });
      toast.success("Address saved!");
    } catch {
      toast.error("Failed to save address");
    }
    setSavingAddress(false);
  };

  // Prices are stored in paise → divide by 100
  const itemTotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0) / 100;
  const deliveryFee = 29;
  const gstRate = 0.05;
  const gst = Math.round(itemTotal * gstRate);
  const toPay = itemTotal + deliveryFee + gst;

  const getDeliveryAddress = () => {
    if (selectedAddressId) {
      const addr = savedAddresses.find((a) => a.id === selectedAddressId);
      if (addr) return `${addr.street}, ${addr.city}, ${addr.state} ${addr.pincode}`.trim();
    }
    return address.trim();
  };

  const handlePlaceOrder = async () => {
    const deliveryAddr = getDeliveryAddress();
    if (!deliveryAddr) {
      toast.error("Please select or enter a delivery address");
      return;
    }
    if (cartItems.length === 0) return;

    setPlacing(true);
    try {
      const restaurantId = cartItems[0].restaurantId;
      const items = cartItems.map((i) => ({ menuItemId: i.id, quantity: i.quantity }));
      await createOrder({
        items,
        restaurantId,
        deliveryAddress: deliveryAddr + (suggestion.trim() ? ` | Note: ${suggestion.trim()}` : ""),
      });
      dispatch(clearCart());
      toast.success("🎉 Order placed successfully!");
      navigate("/home/orders");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to place order. Please try again.");
    }
    setPlacing(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-950 pt-24 pb-10 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-28 h-28 bg-white dark:bg-gray-800 rounded-full shadow-lg mx-auto flex items-center justify-center mb-6">
            <FaShoppingCart className="text-5xl text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">Your Cart is Empty</h1>
          <p className="text-gray-500 dark:text-gray-300 mb-8">Add some delicious food to get started!</p>
          <Link
            to="/home"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition shadow"
          >
            <FaUtensils /> Explore Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6">

        {/* ── Left: Address + Payment ─────────────────────────── */}
        <div className="flex-1 space-y-4">

          {/* Delivery Address */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <FaMapMarkerAlt className="text-orange-500" size={14} />
                </span>
                <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">Delivery Address</h2>
              </div>
              <button
                onClick={() => setShowNewForm((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 font-semibold"
              >
                <FaPlus size={10} /> Add New
              </button>
            </div>

            {/* Saved addresses */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2 mb-3">
                {savedAddresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? "border-orange-400 bg-orange-50 dark:bg-orange-900/10"
                        : "border-gray-200 dark:border-gray-700 hover:border-orange-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery-address"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => { setSelectedAddressId(addr.id); setShowNewForm(false); }}
                      className="mt-0.5 accent-orange-500"
                    />
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{addr.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{addr.street}, {addr.city}, {addr.state} {addr.pincode}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Add new address form */}
            {showNewForm && (
              <div className="border border-dashed border-orange-300 rounded-lg p-3 space-y-2">
                <div className="flex gap-2">
                  {["Home", "Work", "Other"].map((l) => (
                    <button
                      key={l}
                      onClick={() => setNewAddress((p) => ({ ...p, label: l }))}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                        newAddress.label === l
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white dark:bg-gray-900 border-gray-300 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Street / Area *"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress((p) => ({ ...p, street: e.target.value }))}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="City *"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}
                    className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress((p) => ({ ...p, pincode: e.target.value }))}
                    className="w-28 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <button
                  onClick={handleSaveNewAddress}
                  disabled={savingAddress}
                  className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-60"
                >
                  {savingAddress ? "Saving…" : "Save Address"}
                </button>
              </div>
            )}

            {/* Fallback: no saved addresses and form hidden */}
            {savedAddresses.length === 0 && !showNewForm && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No saved addresses.{" "}
                <button onClick={() => setShowNewForm(true)} className="text-orange-500 hover:underline">Add one</button>
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 text-sm">Cooking instructions (optional)</h3>
            <input
              type="text"
              placeholder="e.g. Less spicy, no onion…"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
            />
          </div>

          {/* Payment */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4">Payment</h2>
            <div className="flex items-center gap-3 p-3 border-2 border-orange-400 rounded-lg bg-orange-50 dark:bg-orange-900/10">
              <div className="w-4 h-4 rounded-full border-2 border-orange-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
              </div>
              <span className="font-medium text-gray-800 dark:text-gray-100">Cash on Delivery</span>
            </div>
            <button
              className="mt-4 w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-3 rounded-xl font-bold text-base transition shadow"
              onClick={handlePlaceOrder}
              disabled={placing || (!selectedAddressId && !address.trim())}
            >
              {placing ? "Placing Order…" : `Place Order · ₹${toPay}`}
            </button>
          </div>
        </div>

        {/* ── Right: Cart Summary ──────────────────────────────── */}
        <div className="w-full md:w-[360px] flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 sticky top-24">
            {/* Restaurant name */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
              <img
                src={cartItems[0]?.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=80&h=80&fit=crop"}
                alt="Restaurant"
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <div className="font-bold text-gray-800 dark:text-gray-100">{cartItems[0]?.restaurantName || "Restaurant"}</div>
                <div className="text-xs text-gray-400">Your order</div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-800 dark:text-gray-100 flex-1 line-clamp-1">{item.name}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => {
                        if (item.quantity <= 1) dispatch(removeItem(item.id));
                        else dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }));
                      }}
                      className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 font-bold hover:bg-gray-200 transition flex items-center justify-center text-sm"
                    >−</button>
                    <span className="w-5 text-center text-sm font-semibold text-gray-800 dark:text-gray-100">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                      className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 transition flex items-center justify-center text-sm"
                    >+</button>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 w-14 text-right">
                      ₹{Math.round((item.price * item.quantity) / 100)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Item total</span><span>₹{itemTotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Delivery fee</span><span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>GST (5%)</span><span>₹{gst}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-gray-800 dark:text-gray-100 pt-2 border-t border-gray-100 dark:border-gray-700">
                <span>To Pay</span><span>₹{toPay}</span>
              </div>
            </div>

            <button
              onClick={() => dispatch(clearCart())}
              className="mt-4 w-full text-xs text-red-400 hover:text-red-600 transition"
            >
              🗑 Clear cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
