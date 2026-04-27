import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import useRestaurantMenu from "../hooks/useRestaurantMenu";
import ShimmerMenu from "../components/ShimmerMenu";
import RestaurantCategory from "../components/RestaurantCategory";
import { FaStar, FaArrowLeft, FaMapMarkerAlt, FaClock, FaSearch } from "react-icons/fa";
import { MdTwoWheeler } from "react-icons/md";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { MdShoppingCart } from "react-icons/md";

const RestaurantMenuPage = () => {
  const { resId } = useParams();
  const navigate = useNavigate();
  const { restaurant, menu, loading, error } = useRestaurantMenu(resId);
  const cartItems = useSelector((s) => s.cart.items);
  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const [scrolled, setScrolled] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 180);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) return <ShimmerMenu />;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 pt-24">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Failed to load menu</h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  if (!restaurant) return <ShimmerMenu />;

  const categories = menu ? Object.entries(menu) : [];

  const filteredCategories = useMemo(() => {
    return categories
      .map(([title, items]) => {
        let filtered = items;
        if (vegOnly) filtered = filtered.filter(i => i.isVeg);
        if (menuSearch.trim()) {
          const q = menuSearch.toLowerCase();
          filtered = filtered.filter(i =>
            i.name.toLowerCase().includes(q) ||
            (i.description || '').toLowerCase().includes(q)
          );
        }
        return [title, filtered];
      })
      .filter(([, items]) => items.length > 0);
  }, [categories, menuSearch, vegOnly]);
  const PLACEHOLDER =
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ── Sticky mini-header (appears on scroll) ── */}
      {scrolled && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <FaArrowLeft className="text-gray-600 dark:text-gray-300" />
            </button>
            <span className="font-bold text-gray-800 dark:text-gray-100 truncate max-w-[200px]">{restaurant.name}</span>
          </div>
          {cartCount > 0 && (
            <Link
              to="/home/cart"
              className="flex items-center gap-2 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-orange-600 transition"
            >
              <MdShoppingCart size={16} />
              {cartCount} item{cartCount > 1 ? "s" : ""}
            </Link>
          )}
        </div>
      )}

      {/* ── Hero ── */}
      <div className="relative w-full h-[240px] sm:h-[300px] pt-[70px] overflow-hidden">
        <img
          src={restaurant.imageUrl || PLACEHOLDER}
          alt={restaurant.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-[80px] left-4 z-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full transition"
        >
          <FaArrowLeft />
        </button>

        {/* Restaurant info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
          <h1 className="text-2xl sm:text-4xl font-extrabold drop-shadow mb-1">{restaurant.name}</h1>
          <p className="text-sm sm:text-base opacity-90 mb-3 line-clamp-1">
            {Array.isArray(restaurant.cuisines) ? restaurant.cuisines.join(" • ") : restaurant.cuisines}
          </p>

          {/* Info pills */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 bg-green-600 text-white text-xs sm:text-sm font-bold px-3 py-1 rounded-full">
              <FaStar size={11} /> {restaurant.avgRating || "New"}
            </span>
            <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm px-3 py-1 rounded-full">
              <MdTwoWheeler size={14} /> {restaurant.deliveryTime ?? 30} mins
            </span>
            <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm px-3 py-1 rounded-full">
              ₹{Math.round(restaurant.costForTwo / 100)} for two
            </span>
            {(restaurant.address || restaurant.city) && (
              <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm px-3 py-1 rounded-full max-w-[260px] truncate">
                <FaMapMarkerAlt size={11} />
                {restaurant.address || restaurant.city}
              </span>
            )}
            {restaurant.openingTime && restaurant.closingTime && (
              <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm px-3 py-1 rounded-full">
                <FaClock size={11} /> {restaurant.openingTime} – {restaurant.closingTime}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Menu ── */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Menu
          {categories.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({categories.reduce((s, [, items]) => s + items.length, 0)} items)
            </span>
          )}
        </h2>

        {/* Search + Veg filter */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Search in menu…"
              value={menuSearch}
              onChange={e => setMenuSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {menuSearch && (
              <button onClick={() => setMenuSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
            )}
          </div>
          <button
            onClick={() => setVegOnly(v => !v)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all flex-shrink-0 ${
              vegOnly
                ? 'bg-green-600 border-green-600 text-white'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-green-400'
            }`}
          >
            <span className={`w-3 h-3 rounded-sm border-2 flex items-center justify-center ${vegOnly ? 'border-white' : 'border-green-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${vegOnly ? 'bg-white' : 'bg-green-600'}`} />
            </span>
            Veg Only
          </button>
          {(menuSearch || vegOnly) && (
            <span className="text-xs text-gray-500">
              {filteredCategories.reduce((s, [, items]) => s + items.length, 0)} items found
            </span>
          )}
        </div>

        {categories.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">No menu items available.</p>
        ) : (
          <div className="space-y-2">
            {filteredCategories.map(([title, items]) => (
              <RestaurantCategory
                key={title}
                title={title}
                items={items}
                restaurantName={restaurant.name}
              />
            ))}
            {filteredCategories.length === 0 && (menuSearch || vegOnly) && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-2">No items match your search</p>
                <button onClick={() => { setMenuSearch(''); setVegOnly(false); }} className="text-orange-500 hover:underline text-sm">Clear filters</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Floating cart bar ── */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
          <Link
            to="/home/cart"
            className="flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full shadow-xl font-semibold text-sm transition"
          >
            <MdShoppingCart size={18} />
            {cartCount} item{cartCount > 1 ? "s" : ""} in cart · View Cart →
          </Link>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenuPage;
