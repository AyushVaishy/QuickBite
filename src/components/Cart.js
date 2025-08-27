import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../utils/cartSlice";
import { FaShoppingCart, FaUtensils, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const Cart = () => {
  const cartItems = useSelector((store) => store.cart.items);
  const dispatch = useDispatch();
  const [noContactDelivery, setNoContactDelivery] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [suggestion, setSuggestion] = useState("");

  // Calculate Total Price
  const itemTotal = cartItems.reduce((acc, item) => acc + (item.card?.info?.price || item.card?.info?.defaultPrice || 0) * (item.quantity || 1) / 100, 0);
  const deliveryFee = cartItems.length > 0 ? 17 : 0;
  const extraDiscount = cartItems.length > 0 ? 25 : 0;
  const gst = cartItems.length > 0 ? 57.2 : 0;
  const toPay = itemTotal + deliveryFee + gst - extraDiscount;

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  // Beautiful Empty Cart UI
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 pt-24 pb-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Empty Cart Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-white rounded-full shadow-lg mx-auto flex items-center justify-center mb-6">
              <FaShoppingCart className="text-6xl text-orange-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
            <p className="text-lg text-gray-600 mb-8">
              Looks like you haven't added any delicious food to your cart yet!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 mb-12">
            <Link
              to="/"
              className="inline-flex items-center gap-3 bg-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaUtensils className="text-xl" />
              Explore Restaurants
            </Link>
            <div className="text-sm text-gray-500">
              Discover amazing restaurants and add your favorite dishes
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Fast Delivery</h3>
              <p className="text-sm text-gray-600">Get your food delivered in minutes</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍕</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Fresh Food</h3>
              <p className="text-sm text-gray-600">Quality ingredients from top restaurants</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Easy Payment</h3>
              <p className="text-sm text-gray-600">Secure payment options available</p>
            </div>
          </div>

          
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row justify-center items-start min-h-screen bg-gray-100 pt-24 pb-10 px-2 md:px-10">
      {/* Left Section: Address & Payment */}
      <div className="w-full md:w-2/3 max-w-2xl bg-white rounded-lg shadow-lg p-8 mb-8 md:mb-0 md:mr-8">
        {/* Delivery Address */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <span className="inline-block bg-black text-white rounded-full p-2 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.5-7.5 11.25-7.5 11.25S4.5 18 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </span>
            <h2 className="text-xl font-bold">Delivery address <span className="ml-2 text-green-600">✔</span></h2>
            <span className="ml-auto text-orange-500 font-bold cursor-pointer">CHANGE</span>
          </div>
          <div className="ml-12">
            <div className="font-bold text-lg">Home</div>
            <div className="text-gray-600 text-sm">Shri Ram Pg Near Shiv Dairy Chappan Bhog, Maktulpuri, Mathura Vihar Colony, Nehru Nagar, Roorkee, Uttarakhand 247667, India</div>
            <div className="text-xs font-semibold text-gray-500 mt-1">34 MINS</div>
          </div>
        </div>
        {/* Payment Method */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <span className="inline-block bg-black text-white rounded-full p-2 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 17.25V6.75z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5" />
              </svg>
            </span>
            <h2 className="text-xl font-bold">Choose payment method</h2>
          </div>
          <button className="w-full bg-green-500 text-white py-4 rounded-lg font-bold text-lg mt-4 hover:bg-green-600 transition">PROCEED TO PAY</button>
        </div>
      </div>
      {/* Right Section: Cart Summary */}
      <div className="w-full md:w-1/3 max-w-md bg-white rounded-lg shadow-lg p-8 sticky top-24">
        {/* Restaurant Info */}
        <div className="flex items-center mb-4">
          <img src={cartItems[0]?.card?.info?.imageId ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_100,h_100,c_fill/${cartItems[0]?.card?.info?.imageId}` : "https://via.placeholder.com/100"} alt="Restaurant" className="w-16 h-16 rounded-lg object-cover mr-4" />
          <div>
            <div className="font-bold text-lg">{cartItems[0]?.card?.info?.restaurantName || "Pizza Hut"}</div>
            <div className="text-xs text-blue-700 font-semibold">IIT_Roorkee</div>
          </div>
        </div>
        {/* Cart Items */}
        <div className="mb-4">
          {cartItems.map((item, idx) => (
            <div key={item.card?.info?.id || idx} className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="font-semibold">{item.card?.info?.name}</span>
                <span className="ml-2 text-gray-500 text-sm">x{item.quantity || 1}</span>
              </div>
              <div className="font-bold">₹{((item.card?.info?.price || item.card?.info?.defaultPrice || 0) / 100).toFixed(0)}</div>
            </div>
          ))}
        </div>
        {/* Suggestion Box */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Any suggestions? We will pass it on..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-2"
            value={suggestion}
            onChange={e => setSuggestion(e.target.value)}
          />
        </div>
        {/* No-contact Delivery */}
        <div className="mb-4 border p-3 rounded-md">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              className="mr-2 mt-1"
              checked={noContactDelivery}
              onChange={() => setNoContactDelivery(!noContactDelivery)}
            />
            <span>
              <span className="font-bold">Opt in for No-contact Delivery</span>
              <span className="block text-xs text-gray-600">Unwell, or avoiding contact? Please select no-contact delivery. Partner will safely place the order outside your door (not for COD)</span>
            </span>
          </label>
        </div>
        {/* Coupon Box */}
        <div className="mb-4 border p-3 rounded-md">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Apply Coupon"
              className="w-full border-none outline-none text-sm"
              value={coupon}
              onChange={e => setCoupon(e.target.value)}
            />
            <button className="ml-2 bg-orange-500 text-white px-3 py-1 rounded-md font-semibold hover:bg-orange-600 transition">Apply</button>
          </div>
        </div>
        {/* Bill Details */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Item Total</span>
            <span>₹{itemTotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span>Delivery Fee | 5.0 kms</span>
            <span>₹{deliveryFee}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span>Extra discount for you</span>
            <span className="text-green-600">-₹{extraDiscount}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span>GST & Other Charges</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>
          <div className="border-t border-dashed my-2"></div>
          <div className="flex justify-between text-lg font-bold">
            <span>TO PAY</span>
            <span>₹{toPay.toFixed(0)}</span>
          </div>
        </div>
        {/* Clear Cart Button */}
        <div className="flex justify-end mt-6">
          <button
            className="bg-red-500 text-white py-2 px-4 rounded-md font-medium hover:bg-red-400 transition-all"
            onClick={handleClearCart}
          >
            Clear Cart 🧹
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
