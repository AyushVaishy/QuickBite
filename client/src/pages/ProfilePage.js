import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { setCredentials, logout as logoutAction } from "../store/authSlice";
import { clearCart } from "../store/cartSlice";
import { updateProfile, changePassword, getProfile } from "../services/authService";
import { getOrders } from "../services/orderService";
import { Link } from "react-router-dom";
import {
  FaUserCircle, FaEnvelope, FaPhone, FaLock, FaStar,
  FaBoxOpen, FaMoon, FaSun, FaSignOutAlt,
} from "react-icons/fa";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import { getAddresses, addAddress, deleteAddress } from "../services/addressService";
import { selectFavourites } from "../store/favoritesSlice";
import RestaurantCard from "../components/RestaurantCard";
import { FaHeart, FaMapMarkerAlt, FaHome, FaBriefcase, FaMapPin, FaTrash, FaPlus } from "react-icons/fa";
import api from "../services/api";

const TABS = [
  { id: "profile",    label: "My Profile",    icon: "👤" },
  { id: "orders",     label: "My Orders",     icon: "📦" },
  { id: "favourites", label: "Favourites",    icon: "❤️" },
  { id: "reviews",    label: "My Reviews",    icon: "⭐" },
  { id: "addresses",  label: "Addresses",     icon: "📍" },
  { id: "settings",   label: "Settings",      icon: "⚙️" },
];

const STATUS_COLORS = {
  PLACED:           "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  CONFIRMED:        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  PREPARING:        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  DELIVERED:        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  CANCELLED:        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};
const STATUS_LABELS = {
  PLACED: "Order Placed", CONFIRMED: "Confirmed", PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery", DELIVERED: "Delivered", CANCELLED: "Cancelled",
};

// ─── My Profile Tab ───────────────────────────────────────────────────────────
const ProfileTab = ({ user, onUpdated }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ name: user?.name || "", phone: user?.phone || "" });
  }, [user]);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const res = await updateProfile({ name: form.name.trim(), phone: form.phone });
      onUpdated(res.data.user);
      setEditing(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl font-bold shadow-md">
          {(user?.name || "U").charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{user?.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          <span className="inline-block mt-1 text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full font-medium">
            {user?.role === "USER" ? "Customer" : user?.role?.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Full Name</label>
          {editing ? (
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 outline-none"
            />
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <FaUserCircle className="text-gray-400" size={14} />
              <span className="text-sm text-gray-800 dark:text-gray-100">{user?.name || "—"}</span>
            </div>
          )}
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Email</label>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <FaEnvelope className="text-gray-400" size={14} />
            <span className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</span>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Phone</label>
          {editing ? (
            <input
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+91 XXXXX XXXXX"
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 outline-none"
            />
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <FaPhone className="text-gray-400" size={14} />
              <span className="text-sm text-gray-800 dark:text-gray-100">{user?.phone || "Not set"}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {editing ? (
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-sm transition disabled:opacity-60"
            >
              <FiSave size={14} /> {saving ? "Saving…" : "Save Changes"}
            </button>
            <button onClick={() => { setEditing(false); setForm({ name: user?.name||"", phone: user?.phone||"" }); }}
              className="flex items-center gap-2 px-5 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <FiX size={14} /> Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-5 py-2 border border-orange-400 text-orange-600 rounded-lg font-semibold text-sm hover:bg-orange-50 transition"
          >
            <FiEdit2 size={14} /> Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Orders Tab ───────────────────────────────────────────────────────────────
const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then((res) => setOrders(res.data.orders || []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 animate-pulse py-8">Loading orders…</div>;
  if (orders.length === 0)
    return (
      <div className="flex flex-col items-center py-16 text-gray-400">
        <FaBoxOpen size={48} className="mb-4 text-gray-300" />
        <p className="font-medium">No orders yet</p>
        <Link to="/home" className="mt-4 text-orange-500 hover:underline text-sm">Browse restaurants →</Link>
      </div>
    );

  return (
    <div className="space-y-3 max-w-2xl">
      {orders.map((order) => (
        <Link to={`/home/orders/${order.id}`} key={order.id}
          className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <img
                src={order.restaurant?.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=60&h=60&fit=crop"}
                alt="" className="w-9 h-9 rounded-lg object-cover"
              />
              <div>
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{order.restaurant?.name}</p>
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                </p>
              </div>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </div>
          <div className="px-4 py-2.5 flex justify-between items-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
              {order.items.map((i) => i.menuItem?.name || "Item").join(", ")}
            </p>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100 flex-shrink-0 ml-3">
              ₹{Math.round(order.totalAmount / 100)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

// ─── Favourites Tab ───────────────────────────────────────────────────────────
const FavouritesTab = () => {
  const favs = useSelector(selectFavourites);

  if (favs.length === 0)
    return (
      <div className="flex flex-col items-center py-16 text-gray-400">
        <FaHeart size={48} className="mb-4 text-gray-300" />
        <p className="font-medium">No favourites yet</p>
        <p className="text-sm mt-1">Tap the ❤️ on any restaurant to save it here.</p>
        <Link to="/home" className="mt-4 text-orange-500 hover:underline text-sm">Explore restaurants →</Link>
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {favs.map((r) => (
        <RestaurantCard key={r.id} resData={r} />
      ))}
    </div>
  );
};

// ─── Reviews Tab ──────────────────────────────────────────────────────────────
const ReviewsTab = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/restaurants/reviews/me")
      .then((res) => setReviews(res.data.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 animate-pulse py-8">Loading reviews…</div>;

  if (reviews.length === 0)
    return (
      <div className="flex flex-col items-center py-16 text-gray-400">
        <FaStar size={48} className="mb-4 text-gray-300" />
        <p className="font-medium">No reviews yet</p>
        <p className="text-sm mt-1">After ordering, you can rate restaurants from the Order Details page.</p>
        <Link to="/home/orders" className="mt-4 text-orange-500 hover:underline text-sm">View my orders →</Link>
      </div>
    );

  return (
    <div className="space-y-4 max-w-2xl">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            {review.restaurant?.imageUrl && (
              <img
                src={review.restaurant.imageUrl}
                alt={review.restaurant.name}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <Link
                  to={`/home/restaurants/${review.restaurant?.id}`}
                  className="font-semibold text-gray-800 dark:text-gray-100 hover:text-orange-500 transition-colors text-sm"
                >
                  {review.restaurant?.name || "Restaurant"}
                </Link>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={13}
                    className={star <= review.rating ? "text-yellow-400" : "text-gray-200 dark:text-gray-600"}
                  />
                ))}
                <span className="ml-1 text-xs font-semibold text-gray-600 dark:text-gray-300">{review.rating}/5</span>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{review.comment}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Addresses Tab ────────────────────────────────────────────────────────────
const LABEL_ICONS = { Home: <FaHome />, Work: <FaBriefcase />, Other: <FaMapPin /> };

const AddressesTab = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ label: "Home", street: "", city: "", state: "", pincode: "" });

  const load = useCallback(() => {
    setLoading(true);
    getAddresses()
      .then((res) => setAddresses(res.data.addresses || []))
      .catch(() => toast.error("Failed to load addresses"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.street.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      toast.error("All fields are required"); return;
    }
    setSaving(true);
    try {
      await addAddress(form);
      toast.success("Address added!");
      setShowForm(false);
      setForm({ label: "Home", street: "", city: "", state: "", pincode: "" });
      load();
    } catch {
      toast.error("Failed to add address");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAddress(id);
      toast.success("Address removed");
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast.error("Failed to delete address");
    }
  };

  if (loading) return <div className="text-gray-400 animate-pulse py-8">Loading addresses…</div>;

  return (
    <div className="max-w-lg space-y-4">
      {/* Address cards */}
      {addresses.length === 0 && !showForm && (
        <div className="flex flex-col items-center py-12 text-gray-400">
          <FaMapMarkerAlt size={40} className="mb-3 text-gray-300" />
          <p className="font-medium">No saved addresses</p>
        </div>
      )}
      {addresses.map((addr) => (
        <div key={addr.id} className="flex items-start justify-between bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 flex-shrink-0">
              {LABEL_ICONS[addr.label] || <FaMapPin />}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{addr.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                {[addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDelete(addr.id)}
            className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
            aria-label="Delete address"
          >
            <FaTrash size={13} />
          </button>
        </div>
      ))}

      {/* Add Address Form */}
      {showForm ? (
        <form onSubmit={handleAdd} className="bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-800 rounded-xl p-4 space-y-3 shadow-sm">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-2">Add New Address</h3>
          {/* Label selector */}
          <div className="flex gap-2">
            {["Home", "Work", "Other"].map((lbl) => (
              <button
                key={lbl}
                type="button"
                onClick={() => setForm((p) => ({ ...p, label: lbl }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  form.label === lbl
                    ? "bg-orange-500 text-white border-orange-500"
                    : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-orange-300"
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
          {[
            { field: "street",  placeholder: "Street / Area" },
            { field: "city",    placeholder: "City" },
            { field: "state",   placeholder: "State" },
            { field: "pincode", placeholder: "Pincode" },
          ].map(({ field, placeholder }) => (
            <input
              key={field}
              type="text"
              placeholder={placeholder}
              value={form[field]}
              onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 outline-none"
            />
          ))}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-2 rounded-lg font-semibold text-sm transition"
            >
              {saving ? "Saving…" : "Save Address"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-orange-300 dark:border-orange-700 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 font-semibold text-sm transition"
        >
          <FaPlus size={12} /> Add New Address
        </button>
      )}
    </div>
  );
};

// ─── Settings Tab ─────────────────────────────────────────────────────────────
const SettingsTab = ({ onLogout }) => {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (form.newPassword.length < 8) { toast.error("New password must be at least 8 characters"); return; }
    setSaving(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success("Password changed successfully!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-md space-y-8">
      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Appearance</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? <FaMoon className="text-indigo-400" /> : <FaSun className="text-yellow-400" />}
            <span className="text-sm text-gray-700 dark:text-gray-300">{isDark ? "Dark Mode" : "Light Mode"}</span>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-12 h-6 rounded-full transition-colors relative ${isDark ? "bg-orange-500" : "bg-gray-300"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isDark ? "translate-x-7" : "translate-x-1"}`} />
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <FaLock className="text-orange-500" size={14} /> Change Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-3">
          {["currentPassword", "newPassword", "confirmPassword"].map((field) => (
            <input
              key={field}
              type="password"
              placeholder={field === "currentPassword" ? "Current password" : field === "newPassword" ? "New password (min 8 chars)" : "Confirm new password"}
              value={form[field]}
              onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
              className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 outline-none"
            />
          ))}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-2 rounded-lg font-semibold text-sm transition"
          >
            {saving ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold text-sm transition"
      >
        <FaSignOutAlt /> Sign Out
      </button>
    </div>
  );
};

// ─── ProfilePage ──────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const reduxUser = useSelector((s) => s.auth.user);
  const [user, setUser] = useState(null);
  const activeTab = searchParams.get("tab") || "profile";

  const setTab = (id) => setSearchParams({ tab: id });

  useEffect(() => {
    getProfile()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        // Fallback to Redux/localStorage
        const stored = localStorage.getItem("userData");
        if (stored) setUser(JSON.parse(stored));
        else if (reduxUser) setUser(reduxUser);
      });
  }, []);

  const handleUpdated = useCallback((updatedUser) => {
    setUser(updatedUser);
    dispatch(setCredentials({ user: updatedUser, accessToken: localStorage.getItem("accessToken") }));
    const stored = localStorage.getItem("userData");
    if (stored) localStorage.setItem("userData", JSON.stringify({ ...JSON.parse(stored), ...updatedUser }));
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutAction());
    dispatch(clearCart());
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6">

        {/* ── Sidebar Nav ── */}
        <aside className="w-full md:w-56 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Avatar header */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 px-4 py-5 text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2 shadow">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </div>
              <p className="text-white font-semibold text-sm truncate">{user?.name || "Loading…"}</p>
              <p className="text-orange-100 text-xs truncate">{user?.email}</p>
            </div>

            {/* Tabs */}
            <nav className="p-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition mb-0.5 ${
                    activeTab === tab.id
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <FaSignOutAlt size={13} /> Logout
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-6 min-h-[400px]">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            {TABS.find((t) => t.id === activeTab)?.label}
          </h1>

          {activeTab === "profile"    && <ProfileTab user={user} onUpdated={handleUpdated} />}
          {activeTab === "orders"     && <OrdersTab />}
          {activeTab === "favourites" && <FavouritesTab />}
          {activeTab === "reviews"    && <ReviewsTab />}
          {activeTab === "addresses"  && <AddressesTab />}
          {activeTab === "settings"   && <SettingsTab onLogout={handleLogout} />}
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;