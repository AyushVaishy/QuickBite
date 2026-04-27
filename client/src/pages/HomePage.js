import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import RestaurantCard from "../components/RestaurantCard";
import Shimmer, { ShimmerCategories, ShimmerBrands, ShimmerCarousel } from "../components/Shimmer";
import FilterModal from "../components/FilterModal";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { applyFilters, clearFilters, toggleVeg } from "../store/filtersSlice";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { FaChevronLeft, FaChevronRight, FaLeaf, FaSlidersH, FaClock } from "react-icons/fa";
import { MdOutlineStarPurple500 } from "react-icons/md";
import { getRestaurants } from "../services/restaurantService";

const RADIUS = 50;
const LIMIT = 20;

const FOOD_CATEGORIES = [
  { id: 1,  name: "Biryani",      query: "Biryani",      imageUrl: "https://images.unsplash.com/photo-1563379091339-3b21bbd4c4e3?w=200&h=200&fit=crop" },
  { id: 2,  name: "Pizza",        query: "Pizza",         imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=200&fit=crop" },
  { id: 3,  name: "Burgers",      query: "Burger",        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop" },
  { id: 4,  name: "South Indian", query: "South Indian",  imageUrl: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=200&h=200&fit=crop" },
  { id: 5,  name: "Chinese",      query: "Chinese",       imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop" },
  { id: 6,  name: "North Indian", query: "North Indian",  imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop" },
  { id: 7,  name: "Desserts",     query: "Desserts",      imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop" },
  { id: 8,  name: "Rolls",        query: "Rolls",         imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200&h=200&fit=crop" },
  { id: 9,  name: "Ice Cream",    query: "Ice Cream",     imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop" },
  { id: 10, name: "Sandwiches",   query: "Sandwich",      imageUrl: "https://images.unsplash.com/photo-1528735602780-2ba8f1ee5a02?w=200&h=200&fit=crop" },
  { id: 11, name: "Healthy",      query: "Healthy",       imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop" },
  { id: 12, name: "Cakes",        query: "Cake",          imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop" },
];

// ── Reusable carousel arrow button ───────────────────────────────────────────
const ArrowBtn = ({ direction, onClick, className = "" }) => (
  <button
    onClick={onClick}
    aria-label={`Scroll ${direction}`}
    className={`w-9 h-9 sm:w-10 sm:h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all ${className}`}
  >
    {direction === "left"
      ? <FaChevronLeft className="text-gray-600 dark:text-gray-300" size={12} />
      : <FaChevronRight className="text-gray-600 dark:text-gray-300" size={12} />}
  </button>
);

// ── useCarousel: manages a scroll container ref + arrow visibility ─────────
const useCarousel = () => {
  const ref = useRef(null);
  const [canLeft, setCanLeft]   = useState(false);
  const [canRight, setCanRight] = useState(true);

  const update = useCallback(() => {
    const c = ref.current;
    if (!c) return;
    setCanLeft(c.scrollLeft > 2);
    setCanRight(c.scrollLeft < c.scrollWidth - c.clientWidth - 2);
  }, []);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    update();
    c.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      c.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scroll = useCallback((dir) => {
    const c = ref.current;
    if (c) c.scrollTo({ left: c.scrollLeft + (dir === "left" ? -320 : 320), behavior: "smooth" });
  }, []);

  return { ref, canLeft, canRight, scroll, update };
};

// ── Section wrapper (consistent padding + heading) ────────────────────────
const Section = ({ bg = "bg-white dark:bg-gray-900", children }) => (
  <div className={`${bg} py-8 sm:py-10`}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">{children}</div>
  </div>
);

const SectionHeader = ({ title, subtitle, left, right }) => (
  <div className="flex items-end justify-between mb-5 sm:mb-6">
    <div>
      {left || (
        <>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </>
      )}
    </div>
    {right && <div className="hidden sm:flex gap-2">{right}</div>}
  </div>
);

// ── Brand card (circular, for "Top brands" section) ───────────────────────
const BrandCard = ({ restaurant }) => {
  const navigate = useNavigate();
  const PLACEHOLDER = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop";
  return (
    <button
      onClick={() => navigate(`/home/restaurants/${restaurant.id}`)}
      className="flex flex-col items-center min-w-[110px] sm:min-w-[130px] group focus:outline-none"
    >
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md mb-2.5 group-hover:shadow-xl transition-all duration-300 ring-2 ring-transparent group-hover:ring-orange-400">
        <img
          src={restaurant.imageUrl || PLACEHOLDER}
          alt={restaurant.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        {/* subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 text-center leading-tight line-clamp-1 group-hover:text-orange-500 transition-colors w-full px-1">
        {restaurant.name}
      </p>
      <p className="flex items-center gap-0.5 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
        <FaClock size={9} />
        {restaurant.deliveryTime ?? 30} min
      </p>
    </button>
  );
};

// ── Active filter tag pill (appears in the filter bar) ────────────────────
const FilterTag = ({ label, onRemove }) => (
  <span className="flex items-center gap-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700 px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
    {label}
    <button onClick={onRemove} aria-label={`Remove ${label} filter`} className="ml-0.5 hover:text-orange-900 dark:hover:text-orange-100">
      ✕
    </button>
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
const HomePage = () => {
  const { location }  = useOutletContext();
  const { user }      = useSelector((s) => s.auth);
  const filters       = useSelector((s) => s.filters);
  const dispatch      = useDispatch();
  const navigate      = useNavigate();

  const [fetchedRestaurants, setFetchedRestaurants] = useState([]);
  const [total, setTotal]                           = useState(0);
  const [page, setPage]                             = useState(1);
  const [loading, setLoading]                       = useState(false);
  const [loadingMore, setLoadingMore]               = useState(false);
  const [error, setError]                           = useState("");
  const [filterModalOpen, setFilterModalOpen]       = useState(false);

  // Carousel hooks (each manages its own ref + arrow state)
  const categoryCarousel     = useCarousel();
  const topBrandsCarousel    = useCarousel();
  const topRestaurantsCarousel = useCarousel();

  // Re-evaluate arrow visibility after data loads
  useEffect(() => {
    topBrandsCarousel.update();
    topRestaurantsCarousel.update();
    // eslint-disable-next-line
  }, [fetchedRestaurants]);

  useEffect(() => {
    setPage(1);
    setFetchedRestaurants([]);
    fetchPage(1, true);
    // eslint-disable-next-line
  }, [location]);

  const fetchPage = async (pageNum, reset = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError("");
    try {
      const { data } = await getRestaurants(location.lat, location.lng, {
        radius: RADIUS,
        limit: LIMIT,
        page: pageNum,
      });
      const restaurants = data.restaurants ?? [];
      const serverTotal = data.total ?? 0;
      setFetchedRestaurants((prev) => (reset || pageNum === 1 ? restaurants : [...prev, ...restaurants]));
      setTotal(serverTotal);
      setPage(pageNum);
    } catch {
      setError("Failed to load restaurants. Please try again.");
    }
    setLoading(false);
    setLoadingMore(false);
  };

  // ── Derived data ────────────────────────────────────────────────────────

  // Top 10 highest-rated restaurants for "Top brands" carousel
  const topBrands = useMemo(
    () =>
      [...fetchedRestaurants]
        .filter((r) => r.avgRating)
        .sort((a, b) => parseFloat(b.avgRating) - parseFloat(a.avgRating))
        .slice(0, 10),
    [fetchedRestaurants]
  );

  // Top 10 for "Top restaurants" carousel (same logic, different display)
  const topRestaurants = useMemo(
    () =>
      [...fetchedRestaurants]
        .filter((r) => r.avgRating)
        .sort((a, b) => parseFloat(b.avgRating) - parseFloat(a.avgRating))
        .slice(0, 10),
    [fetchedRestaurants]
  );

  // Unique cuisines (exact, normalized, sorted) — fed to FilterModal
  const allCuisines = useMemo(() => {
    const set = new Set();
    fetchedRestaurants.forEach((r) => {
      (Array.isArray(r.cuisines) ? r.cuisines : []).forEach((c) => {
        const trimmed = c?.trim();
        if (trimmed) set.add(trimmed);
      });
    });
    return Array.from(set).sort();
  }, [fetchedRestaurants]);

  // Filtered + sorted restaurant list — note: operates only on loaded pages
  const filteredRestaurants = useMemo(() => {
    let list = [...fetchedRestaurants];

    if (filters.vegOnly) {
      list = list.filter((r) => {
        const cuisines = Array.isArray(r.cuisines) ? r.cuisines : [];
        return cuisines.some((c) =>
          c.toLowerCase().includes("veg") || c.toLowerCase().includes("vegetarian")
        );
      });
    }

    if (filters.cuisines.length > 0) {
      // Exact normalized match against restaurant's cuisines array
      const selectedSet = new Set(filters.cuisines.map((c) => c.toLowerCase().trim()));
      list = list.filter((r) => {
        const cuisines = (Array.isArray(r.cuisines) ? r.cuisines : []).map((c) => c.toLowerCase().trim());
        return cuisines.some((c) => selectedSet.has(c));
      });
    }

    if (filters.rating !== null) {
      list = list.filter((r) => parseFloat(r.avgRating || 0) >= filters.rating);
    }

    if (filters.costRange !== null) {
      list = list.filter((r) => {
        const cost = r.costForTwo || 0; // in paise
        if (filters.costRange === "low")  return cost < 20000;          // < ₹200 for two
        if (filters.costRange === "mid")  return cost >= 20000 && cost <= 50000; // ₹200–₹500
        if (filters.costRange === "high") return cost > 50000;           // > ₹500
        return true;
      });
    }

    if (filters.deliveryTimeMax !== null) {
      list = list.filter((r) => {
        const dt = parseInt(r.deliveryTime || 45, 10);
        return dt <= filters.deliveryTimeMax;
      });
    }

    // Sort — always on a copy (list is already a copy via [...fetchedRestaurants])
    if (filters.sortBy === "rating_desc") {
      list.sort((a, b) => parseFloat(b.avgRating || 0) - parseFloat(a.avgRating || 0));
    } else if (filters.sortBy === "cost_asc") {
      list.sort((a, b) => (a.costForTwo || 0) - (b.costForTwo || 0));
    } else if (filters.sortBy === "cost_desc") {
      list.sort((a, b) => (b.costForTwo || 0) - (a.costForTwo || 0));
    }

    return list;
  }, [fetchedRestaurants, filters]);

  // How many non-default filter values are active (excluding vegOnly — shown separately)
  const modalFilterCount = [
    filters.sortBy !== "popularity" ? 1 : 0,
    filters.cuisines.length > 0 ? 1 : 0,
    filters.rating !== null ? 1 : 0,
    filters.costRange !== null ? 1 : 0,
    filters.deliveryTimeMax !== null ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const anyFilterActive = filters.vegOnly || modalFilterCount > 0;
  const hasMore = fetchedRestaurants.length < total;

  const handleApplyFilters = useCallback((pending) => {
    dispatch(applyFilters(pending));
  }, [dispatch]);

  const handleClearAllFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // ── Guards ──────────────────────────────────────────────────────────────
  const onlineStatus = useOnlineStatus();
  if (!onlineStatus) {
    return (
      <h1 className="text-center mt-24 text-xl font-semibold text-red-500">
        🚨 You're offline! Please check your internet connection.
      </h1>
    );
  }

  if (loading) return <Shimmer />;

  if (fetchedRestaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] mt-24 px-6">
        <img
          src={require("../assets/location_unserviceable.webp")}
          alt="Service not available"
          className="w-56 h-56 object-contain opacity-90 mb-6"
        />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          We'll be there soon!
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-xl text-center mb-6">
          {error || "QuickBite is not serving this location yet. We're expanding rapidly and hope to serve your area soon."}
        </p>
        <button
          onClick={() => window.dispatchEvent(new Event("openLocationSidebar"))}
          className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors shadow"
        >
          Choose a different location
        </button>
      </div>
    );
  }

  // Friendly location name for headings
  const locationName = location.address ? location.address.split(",")[0] : "your area";

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-[70px]">

      {/* ── 1. WHAT'S ON YOUR MIND ───────────────────────────── */}
      <Section bg="bg-white dark:bg-gray-900">
        <SectionHeader
          title={user ? `${user.name.split(" ")[0]}, what's on your mind?` : "What's on your mind?"}
          subtitle="Tap a category to explore"
          right={
            <>
              {categoryCarousel.canLeft && <ArrowBtn direction="left" onClick={() => categoryCarousel.scroll("left")} />}
              {categoryCarousel.canRight && <ArrowBtn direction="right" onClick={() => categoryCarousel.scroll("right")} />}
            </>
          }
        />
        <div
          ref={categoryCarousel.ref}
          className="flex gap-5 sm:gap-8 overflow-x-auto scrollbar-hide pb-3"
        >
          {FOOD_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/home/search?q=${encodeURIComponent(cat.query)}`)}
              className="flex flex-col items-center min-w-[90px] sm:min-w-[110px] group focus:outline-none"
            >
              {/* Circular image */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-md mb-2.5 ring-2 ring-transparent group-hover:ring-orange-400 group-hover:shadow-lg transition-all duration-300">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop"; }}
                />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 text-center group-hover:text-orange-500 transition-colors leading-tight">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </Section>

      <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />

      {/* ── 2. TOP BRANDS FOR YOU ─────────────────────────────── */}
      <Section bg="bg-white dark:bg-gray-900">
        <SectionHeader
          title="Top brands for you"
          subtitle="Most loved restaurants near you"
          right={
            <>
              {topBrandsCarousel.canLeft && <ArrowBtn direction="left" onClick={() => topBrandsCarousel.scroll("left")} />}
              {topBrandsCarousel.canRight && <ArrowBtn direction="right" onClick={() => topBrandsCarousel.scroll("right")} />}
            </>
          }
        />
        {topBrands.length === 0 ? (
          <ShimmerBrands />
        ) : (
          <div
            ref={topBrandsCarousel.ref}
            className="flex gap-5 sm:gap-7 overflow-x-auto scrollbar-hide pb-3"
          >
            {topBrands.map((r) => (
              <BrandCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </Section>

      <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />

      {/* ── 3. TOP RESTAURANTS CAROUSEL ──────────────────────── */}
      <Section bg="bg-white dark:bg-gray-900">
        <SectionHeader
          title={`Top restaurants in ${locationName}`}
          subtitle="Best rated places to order from"
          right={
            <>
              {topRestaurantsCarousel.canLeft && <ArrowBtn direction="left" onClick={() => topRestaurantsCarousel.scroll("left")} />}
              {topRestaurantsCarousel.canRight && <ArrowBtn direction="right" onClick={() => topRestaurantsCarousel.scroll("right")} />}
            </>
          }
        />
        {topRestaurants.length === 0 ? (
          <ShimmerCarousel />
        ) : (
          <div
            ref={topRestaurantsCarousel.ref}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-3"
          >
            {topRestaurants.map((r) => (
              <div key={r.id} className="min-w-[230px] sm:min-w-[260px]">
                <RestaurantCard resData={r} />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── DIVIDER ───────────────────────────────────────────── */}
      <div className="w-full h-2 bg-gray-100 dark:bg-gray-800" />

      {/* ── 4. ALL RESTAURANTS + FILTER BAR ──────────────────── */}
      <Section bg="bg-gray-50 dark:bg-gray-950">
        {/* Section heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
              All Restaurants Near Me
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {total} restaurants in {locationName}
              {anyFilterActive && (
                <span className="ml-2 text-orange-500 font-medium">
                  · filtered from {fetchedRestaurants.length} loaded
                </span>
              )}
            </p>
          </div>
        </div>

        {/* ── Filter bar ────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {/* Pure Veg quick pill */}
          <button
            onClick={() => dispatch(toggleVeg())}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-semibold whitespace-nowrap transition-all ${
              filters.vegOnly
                ? "bg-green-600 border-green-600 text-white shadow-md"
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-green-400"
            }`}
          >
            <FaLeaf className={filters.vegOnly ? "text-white" : "text-green-500"} size={11} />
            Pure Veg
          </button>

          {/* Filters button */}
          <button
            onClick={() => setFilterModalOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-semibold whitespace-nowrap transition-all ${
              modalFilterCount > 0
                ? "bg-orange-500 border-orange-500 text-white shadow-md"
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-orange-400"
            }`}
          >
            <FaSlidersH size={13} />
            Filters
            {modalFilterCount > 0 && (
              <span className="ml-0.5 bg-white text-orange-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                {modalFilterCount}
              </span>
            )}
          </button>

          {/* Active filter tags */}
          {filters.sortBy !== "popularity" && (
            <FilterTag
              label={{ rating_desc: "Rating ↓", cost_asc: "Cost ↑", cost_desc: "Cost ↓" }[filters.sortBy]}
              onRemove={() => dispatch(applyFilters({ sortBy: "popularity" }))}
            />
          )}
          {filters.rating !== null && (
            <FilterTag
              label={`⭐ ${filters.rating}+`}
              onRemove={() => dispatch(applyFilters({ rating: null }))}
            />
          )}
          {filters.cuisines.map((c) => (
            <FilterTag
              key={c}
              label={c}
              onRemove={() =>
                dispatch(applyFilters({ cuisines: filters.cuisines.filter((x) => x !== c) }))
              }
            />
          ))}
          {filters.costRange !== null && (
            <FilterTag
              label={{ low: "₹", mid: "₹₹", high: "₹₹₹" }[filters.costRange]}
              onRemove={() => dispatch(applyFilters({ costRange: null }))}
            />
          )}

          {/* Clear all (only when any active) */}
          {anyFilterActive && (
            <button
              onClick={handleClearAllFilters}
              className="text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline underline-offset-2 font-medium whitespace-nowrap"
            >
              Clear all
            </button>
          )}
        </div>

        {/* ── Restaurant grid ───────────────────────────────── */}
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No restaurants match your filters
            </p>
            <p className="text-sm text-gray-400 mb-5">
              Try adjusting or clearing filters to see more options.
            </p>
            <button
              onClick={handleClearAllFilters}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition shadow text-sm"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredRestaurants.map((r) => (
                <RestaurantCard key={r.id} resData={r} />
              ))}
            </div>

            {/* Load more — always available, even with filters active */}
            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={() => fetchPage(page + 1)}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-white dark:bg-gray-800 border-2 border-gray-800 dark:border-gray-500 text-gray-800 dark:text-gray-200 font-semibold rounded-full hover:bg-gray-900 hover:text-white dark:hover:bg-gray-200 dark:hover:text-gray-900 transition-all disabled:opacity-50 text-sm"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Loading…
                    </span>
                  ) : (
                    `Show more · ${total - fetchedRestaurants.length} remaining`
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </Section>

      {/* ── Filter Modal ─────────────────────────────────────── */}
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={handleApplyFilters}
        current={filters}
        allCuisines={allCuisines}
      />
    </div>
  );
};

export default HomePage;