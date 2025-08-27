import LOGO from "../utils/android-chrome-192x192.png";
import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaShoppingCart, FaTrash, FaEdit, FaPlus, FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import { FiLogIn, FiLogOut } from "react-icons/fi";

const GET_LOCATION_API_URL =
  "https://india-pincode-with-latitude-and-longitude.p.rapidapi.com/api/v1/pincode/";
const apiKey = "3e4e471433mshb90d2fd16ca0a7ep12ca07jsnf69a5e6732d7";

const DEFAULT_ADDRESSES = [
  {
    label: "Home",
    address:
      "Shri Ram Pg Near Shiv Dairy Chappan Bhog, Maktulpuri, Mathura Vihar Colony, Nehru Nagar, Roorkee, Uttarakhand 247667, India",
    lat: 29.8542626,
    lng: 77.8880002,
  },
  {
    label: "Work",
    address: "Ff, Pocket E, Sarita Vihar, New Delhi, Delhi 110076, India",
    lat: 28.546568,
    lng: 77.291870,
  },
];

const Header = ({ location, setLocation }) => {
  const [btnNameReact, setBtnNameReact] = useState("Login");
  const cartItems = useSelector((store) => store.cart.items);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchAddress, setSearchAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState(DEFAULT_ADDRESSES);
  const [editIdx, setEditIdx] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  
  const searchInputRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    async (query) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([]);
        setError("");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(query)}&format=json&limit=8`
        );
        const data = await response.json();
        if (!data || data.length === 0) {
          setError("No results found for this location.");
          setSearchResults([]);
        } else {
          setSearchResults(data);
          setError("");
        }
      } catch (err) {
        setError("Failed to fetch location. Try again.");
        setSearchResults([]);
      }
      setLoading(false);
    },
    []
  );

  // Effect for debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedSearch(searchAddress);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchAddress, debouncedSearch]);

  // Focus search input when sidebar opens
  useEffect(() => {
    if (sidebarOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, [sidebarOpen]);

  // Add to recent searches (avoid duplicates, most recent first)
  const addToRecentSearches = (result) => {
    setRecentSearches((prev) => {
      const exists = prev.find((r) => r.display_name === result.display_name);
      if (exists) {
        return [result, ...prev.filter((r) => r.display_name !== result.display_name)];
      }
      return [result, ...prev.slice(0, 4)];
    });
  };

  // Add current location to saved addresses
  const addCurrentToSaved = () => {
    if (!location.address) return;
    setSavedAddresses((prev) => {
      if (prev.find((a) => a.address === location.address)) return prev;
      return [
        ...prev,
        {
          label: `Saved ${prev.length + 1}`,
          address: location.address,
          lat: location.lat,
          lng: location.lng,
        },
      ];
    });
  };

  // Remove saved address
  const removeSavedAddress = (idx) => {
    setSavedAddresses((prev) => prev.filter((_, i) => i !== idx));
  };

  // Start editing label
  const startEditLabel = (idx, label) => {
    setEditIdx(idx);
    setEditLabel(label);
  };

  // Save edited label
  const saveEditLabel = (idx) => {
    setSavedAddresses((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, label: editLabel } : a))
    );
    setEditIdx(null);
    setEditLabel("");
  };

  // Handle address selection
  const handleAddressSelect = async (result) => {
    setSidebarOpen(false);
    setSearchAddress("");
    setSearchResults([]);
    setLoading(true);
    setError("");
    setLocation({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
    });
    addToRecentSearches(result);
    setLoading(false);
  };

  // Sidebar for address selection
  const AddressSidebar = () => (
    <div className={`fixed top-0 left-0 h-full w-[400px] bg-white shadow-2xl z-[9999] transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-orange-500 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <FaMapMarkerAlt className="text-3xl" />
              Choose Location
            </h2>
            <button
              className="text-2xl hover:text-orange-200 transition-colors duration-300"
              onClick={() => setSidebarOpen(false)}
            >
              &times;
            </button>
          </div>
          <p className="text-orange-100 text-sm">Select your delivery address to see available restaurants</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search Input */}
          <div className="mb-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for area, city, landmark..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 text-gray-700 placeholder-gray-500"
                value={searchAddress}
                onChange={e => setSearchAddress(e.target.value)}
              />
            </div>
            {loading && (
              <div className="text-center text-orange-500 text-sm mt-3 flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                Searching for locations...
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          )}
          
          {/* Show search results */}
          {searchResults.length > 0 && (
            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaSearch className="text-orange-500" />
                SEARCH RESULTS ({searchResults.length})
              </div>
              <div className="space-y-2">
                {searchResults.map((result, idx) => (
                  <div
                    key={result.place_id}
                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 group"
                    onClick={() => handleAddressSelect(result)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FaMapMarkerAlt className="text-orange-500 text-sm" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                          {result.display_name.split(",")[0]}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {result.display_name}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Addresses */}
          <div className="mb-6">
            <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaMapMarkerAlt className="text-orange-500" />
              SAVED ADDRESSES ({savedAddresses.length})
            </div>
            <div className="space-y-2">
              {savedAddresses.map((addr, idx) => (
                <div
                  key={addr.label + idx}
                  className={`border-2 rounded-lg p-4 transition-all duration-300 ${
                    location.address === addr.address 
                      ? "border-orange-500 bg-orange-50 shadow-md" 
                      : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        setLocation({ lat: addr.lat, lng: addr.lng, address: addr.address });
                        setSidebarOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          addr.label === "Home" ? "bg-blue-100" : 
                          addr.label === "Work" ? "bg-green-100" : "bg-orange-100"
                        }`}>
                          {addr.label === "Home" ? (
                            <span className="text-blue-600 text-sm">🏠</span>
                          ) : addr.label === "Work" ? (
                            <span className="text-green-600 text-sm">💼</span>
                          ) : (
                            <span className="text-orange-600 text-sm">📍</span>
                          )}
                        </div>
                        {editIdx === idx ? (
                          <input
                            className="border px-2 py-1 rounded text-sm font-semibold w-24 bg-white"
                            value={editLabel}
                            onChange={e => setEditLabel(e.target.value)}
                            onBlur={() => saveEditLabel(idx)}
                            onKeyDown={e => e.key === "Enter" && saveEditLabel(idx)}
                            autoFocus
                          />
                        ) : (
                          <span className="font-semibold text-gray-800">{addr.label}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 leading-relaxed ml-11">
                        {addr.address}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <button
                        className="text-orange-500 hover:text-orange-700 p-2 hover:bg-orange-100 rounded-full transition-all duration-300"
                        title="Edit label"
                        onClick={() => startEditLabel(idx, addr.label)}
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-100 rounded-full transition-all duration-300"
                        title="Delete address"
                        onClick={() => removeSavedAddress(idx)}
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Add current location to saved addresses */}
          <button
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-all duration-300 text-sm font-semibold mb-6"
            onClick={addCurrentToSaved}
          >
            <FaPlus className="text-sm" /> 
            Add current address to saved
          </button>
          
          {/* Recent Searches */}
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaMapMarkerAlt className="text-orange-500" />
              RECENT SEARCHES ({recentSearches.length})
            </div>
            {recentSearches.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">
                <FaMapMarkerAlt className="text-4xl mx-auto mb-2 text-gray-300" />
                <p>No recent searches yet</p>
                <p className="text-xs">Your recent location searches will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentSearches.map((result, idx) => (
                  <div
                    key={result.place_id + idx}
                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 group"
                    onClick={() => handleAddressSelect(result)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <FaMapMarkerAlt className="text-gray-500 text-sm" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                          {result.display_name.split(",")[0]}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {result.display_name}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Overlay for sidebar
  const SidebarOverlay = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      onClick={() => setSidebarOpen(false)}
    ></div>
  );

  return (
    <>
      {sidebarOpen && <SidebarOverlay />}
      <AddressSidebar />
      
      {/* Simple & Beautiful Header */}
      <header className="bg-white shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo & Address Section */}
            <div className="flex items-center gap-6">
              {/* Simple Logo */}
              <Link to="/" className="flex items-center gap-3">
                <img
                  src={LOGO}
                  alt="QuickBite Logo"
                  className="w-12 h-12 rounded-full"
                />
                <div className="hidden md:block">
                  <h1 className="text-2xl font-bold text-orange-600">QuickBite</h1>
                  {/* <p className="text-sm text-gray-500">Food Delivery</p> */}
                </div>
              </Link>

              {/* Simple & Beautiful Address Selector */}
              <button
                className="flex items-center gap-3 bg-orange-50 hover:bg-orange-100 text-orange-700 px-4 py-3 rounded-lg border border-orange-200 hover:border-orange-300 transition-all duration-300 min-w-[280px] max-w-[350px]"
                onClick={() => setSidebarOpen(true)}
              >
                <FaMapMarkerAlt className="text-orange-500 text-lg flex-shrink-0" />
                <div className="text-left flex-1 min-w-0">
                  <div className="font-semibold text-orange-700 truncate">
                    {location.address ? location.address.split(",")[0] : "Select Location"}
                  </div>
                  <div className="text-xs text-orange-600 truncate">
                    {location.address || "Choose your delivery address"}
                  </div>
                </div>
                <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Navigation Links */}
              <nav className="hidden lg:flex items-center gap-4">
                <Link
                  to="/help"
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-orange-600 transition-colors duration-300"
                >
                  <span>❓</span>
                  <span className="font-medium">Help</span>
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-orange-600 transition-colors duration-300"
                >
                  <span>📞</span>
                  <span className="font-medium">Contact</span>
                </Link>
              </nav>

              {/* Simple Cart Icon */}
              <Link to="/cart" className="relative">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors duration-300">
                  <FaShoppingCart className="text-xl text-orange-600" />
                </div>
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {cartItems.length}
                  </span>
                )}
              </Link>

              {/* Simple Login/Logout Button */}
              <button
                className="flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-300"
                onClick={() => setBtnNameReact(btnNameReact === "Login" ? "Logout" : "Login")}
              >
                {btnNameReact === "Login" ? (
                  <>
                    <FiLogIn className="text-lg" />
                    <span>Login</span>
                  </>
                ) : (
                  <>
                    <FiLogOut className="text-lg" />
                    <span>Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
