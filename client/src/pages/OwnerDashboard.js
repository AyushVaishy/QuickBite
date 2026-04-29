import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  getMyRestaurants, toggleRestaurantOpen,
  updateRestaurant, getMenuAll, addMenuItem, updateMenuItem, deleteMenuItem,
  getRestaurantOrders, updateOwnerOrderStatus,
} from "../services/adminService";
import {
  FaStore, FaUtensils, FaClipboardList, FaChartBar,
  FaToggleOn, FaToggleOff, FaEdit, FaTrash, FaPlus,
  FaSave, FaTimes, FaPlus as FaAdd, FaArrowLeft,
} from "react-icons/fa";

const STATUS_COLORS = {
  PLACED: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-primary/10 text-primary",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const ALLOWED_TRANSITIONS = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const CUISINE_OPTIONS = [
  "North Indian","South Indian","Chinese","Pizza","Burgers","Biryani",
  "Desserts","Italian","Mexican","Sushi","Thai","Continental","Seafood","Vegan","Fast Food",
];

const fmt = (paise) => "₹" + ((paise || 0) / 100).toLocaleString("en-IN");

// ─── Dish Modal ───────────────────────────────────────────────────────────────
const DishModal = ({ open, onClose, onSave, initial }) => {
  const [form, setForm] = useState({ name:"",price:"",description:"",category:"",imageUrl:"",isVeg:true });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || "",
        price: initial.price ? (initial.price / 100).toString() : "",
        description: initial.description || "",
        category: initial.category || "",
        imageUrl: initial.imageUrl || "",
        isVeg: initial.isVeg ?? true,
      });
    } else {
      setForm({ name:"",price:"",description:"",category:"",imageUrl:"",isVeg:true });
    }
    setErrors({});
  }, [initial, open]);

  const set = (k,v) => { setForm(p=>({...p,[k]:v})); if(errors[k]) setErrors(p=>({...p,[k]:""})); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.price || isNaN(parseFloat(form.price))) e.price = "Valid price required";
    if (!form.category.trim()) e.category = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({ name:form.name, price:Math.round(parseFloat(form.price)*100), description:form.description||undefined, category:form.category, imageUrl:form.imageUrl||undefined, isVeg:form.isVeg });
  };

  if (!open) return null;
  const inp = (k) => `w-full px-3 py-2.5 border-2 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-foreground ${errors[k]?"border-red-400":"border-border"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">{initial ? "Edit Dish" : "Add New Dish"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-muted-foreground text-xl"><FaTimes /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Name *</label>
            <input value={form.name} onChange={e=>set("name",e.target.value)} className={inp("name")} placeholder="Dish name" />
            {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Price (₹) *</label>
              <input type="number" value={form.price} onChange={e=>set("price",e.target.value)} className={inp("price")} placeholder="199" />
              {errors.price && <p className="text-red-500 text-xs mt-0.5">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Category *</label>
              <input value={form.category} onChange={e=>set("category",e.target.value)} className={inp("category")} placeholder="Starters" />
              {errors.category && <p className="text-red-500 text-xs mt-0.5">{errors.category}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Description</label>
            <textarea value={form.description} onChange={e=>set("description",e.target.value)} className={inp("description")+" resize-none"} rows={2} placeholder="Short description…" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Image URL</label>
            <input value={form.imageUrl} onChange={e=>set("imageUrl",e.target.value)} className={inp("imageUrl")} placeholder="https://…" />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-foreground">Type</label>
            <button type="button" onClick={()=>set("isVeg",true)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${form.isVeg?"bg-green-500 border-green-500 text-white":"border-border text-muted-foreground"}`}>
              🟢 Veg
            </button>
            <button type="button" onClick={()=>set("isVeg",false)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${!form.isVeg?"bg-red-500 border-red-500 text-white":"border-border text-muted-foreground"}`}>
              🔴 Non-Veg
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 border-2 border-border rounded-xl text-muted-foreground font-semibold hover:bg-muted transition-all">Cancel</button>
            <button onClick={submit} className="flex-1 py-2.5 bg-primary/50 hover:bg-primary-hover text-white rounded-xl font-semibold transition-all">
              {initial ? "Save Changes" : "Add Dish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const OwnerDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // Per-tab data
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [editRestaurant, setEditRestaurant] = useState(null);
  const [dishModal, setDishModal] = useState({ open: false, item: null });

  // UI states
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(null);

  const selected = restaurants.find((r) => r.id === selectedId);

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyRestaurants();
      const list = res.data.restaurants || [];
      setRestaurants(list);
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0].id);
        setEditRestaurant({ ...list[0] });
      }
    } catch { toast.error("Failed to load restaurants"); }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { loadRestaurants(); }, [loadRestaurants]);

  // Reload tab data when selection or tab changes
  useEffect(() => {
    if (!selectedId) return;
    if (activeTab === "orders") {
      getRestaurantOrders(selectedId).then(r => setOrders(r.data.orders || [])).catch(() => toast.error("Failed to load orders"));
    }
    if (activeTab === "menu") {
      getMenuAll(selectedId).then(r => setMenuItems(r.data.items || [])).catch(() => toast.error("Failed to load menu"));
    }
    if (activeTab === "restaurant" && selected) {
      setEditRestaurant({ ...selected, cuisines: selected.cuisines || [] });
    }
  }, [selectedId, activeTab]); // eslint-disable-line

  const handleSelectRestaurant = (id) => {
    setSelectedId(id);
    const r = restaurants.find((x) => x.id === id);
    if (r) setEditRestaurant({ ...r, cuisines: r.cuisines || [] });
  };

  const handleToggle = async () => {
    if (!selected) return;
    setToggling(true);
    try {
      await toggleRestaurantOpen(selected.id);
      await loadRestaurants();
      toast.success(`Restaurant is now ${selected.isOpen ? "closed" : "open"}`);
    } catch { toast.error("Failed to toggle status"); }
    finally { setToggling(false); }
  };

  const handleSaveRestaurant = async () => {
    setSaving(true);
    try {
      const payload = { ...editRestaurant };
      delete payload.id; delete payload.ownerId; delete payload.isApproved;
      delete payload._count; delete payload.avgRating; delete payload.createdAt; delete payload.updatedAt;
      await updateRestaurant(selected.id, payload);
      toast.success("Restaurant updated!");
      await loadRestaurants();
    } catch { toast.error("Failed to save changes"); }
    finally { setSaving(false); }
  };

  const handleAddDish = async (data) => {
    try {
      await addMenuItem(selectedId, data);
      toast.success("Dish added!");
      const res = await getMenuAll(selectedId);
      setMenuItems(res.data.items || []);
      setDishModal({ open: false, item: null });
    } catch { toast.error("Failed to add dish"); }
  };

  const handleEditDish = async (data) => {
    try {
      await updateMenuItem(selectedId, dishModal.item.id, data);
      toast.success("Dish updated!");
      const res = await getMenuAll(selectedId);
      setMenuItems(res.data.items || []);
      setDishModal({ open: false, item: null });
    } catch { toast.error("Failed to update dish"); }
  };

  const handleDeleteDish = async (itemId) => {
    if (!window.confirm("Remove this dish from the menu?")) return;
    try {
      await deleteMenuItem(selectedId, itemId);
      toast.success("Dish removed");
      setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch { toast.error("Failed to remove dish"); }
  };

  const handleStatusUpdate = async (orderId, status) => {
    setStatusUpdating(orderId);
    try {
      await updateOwnerOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
      toast.success(`Order marked as ${status}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally { setStatusUpdating(null); }
  };

  const totalOrders = restaurants.reduce((s, r) => s + (r._count?.orders || 0), 0);
  const totalMenuItems = menuItems.length;
  const revenue = orders.filter(o => o.status === "DELIVERED").reduce((s, o) => s + (o.totalAmount || 0), 0);

  const TABS = [
    { id: "overview", label: "Overview", icon: <FaChartBar /> },
    { id: "restaurant", label: "Restaurant", icon: <FaStore /> },
    { id: "menu", label: "Menu", icon: <FaUtensils /> },
    { id: "orders", label: "Orders", icon: <FaClipboardList /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="bg-card shadow-sm border-b px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/home" className="text-primary hover:text-primary flex items-center gap-1.5 text-sm font-medium">
            <FaArrowLeft /> Home
          </Link>
          <h1 className="text-xl font-bold text-foreground">🍽️ Owner Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          {restaurants.length > 1 && (
            <select value={selectedId || ""} onChange={(e) => handleSelectRestaurant(e.target.value)}
              className="border-2 border-border rounded-lg px-3 py-1.5 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none">
              {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          )}
          <span className="text-muted-foreground text-sm font-medium hidden sm:block">{user?.name}</span>
        </div>
      </div>

      {/* No restaurant notice */}
      {restaurants.length === 0 ? (
        <div className="max-w-lg mx-auto mt-20 text-center px-4">
          <FaStore className="text-primary/80 text-6xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">No restaurant yet</h2>
          <p className="text-muted-foreground mb-6">Set up your restaurant to start managing orders.</p>
          <button onClick={() => navigate("/owner/onboard")}
            className="bg-primary/50 hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Set Up Restaurant
          </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Selected restaurant header */}
          {selected && (
            <div className="bg-card rounded-xl shadow-sm border p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {selected.imageUrl && (
                  <img src={selected.imageUrl} alt={selected.name} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div>
                  <h2 className="font-bold text-foreground">{selected.name}</h2>
                  <p className="text-sm text-muted-foreground">{selected.city} • {selected.cuisines?.join(", ")}</p>
                </div>
              </div>
              <button onClick={handleToggle} disabled={toggling}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  selected.isOpen ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}>
                {selected.isOpen ? <FaToggleOn className="text-lg" /> : <FaToggleOff className="text-lg" />}
                {toggling ? "Updating…" : selected.isOpen ? "Open" : "Closed"}
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex overflow-x-auto gap-1 mb-6 bg-card rounded-xl shadow-sm border p-1">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap transition-all flex-1 justify-center ${
                  activeTab === t.id ? "bg-primary/50 text-white" : "text-muted-foreground hover:bg-muted"
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* ── Overview Tab ── */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "My Restaurants", value: restaurants.length, color: "from-primary to-primary-hover" },
                { label: "Total Orders", value: totalOrders, color: "from-blue-400 to-blue-600" },
                { label: "Menu Items", value: selected?._count?.menuItems ?? "—", color: "from-purple-400 to-purple-600" },
                { label: "Revenue (delivered)", value: fmt(revenue), color: "from-green-400 to-green-600" },
              ].map((card) => (
                <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-xl p-5 text-white shadow-md`}>
                  <p className="text-white text-opacity-80 text-sm font-medium">{card.label}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
              ))}
              <div className="col-span-2 md:col-span-4">
                <button onClick={() => navigate("/owner/onboard")}
                  className="flex items-center gap-2 bg-primary/50 hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-semibold transition-all text-sm">
                  <FaPlus /> Add Another Restaurant
                </button>
              </div>
            </div>
          )}

          {/* ── Restaurant Tab ── */}
          {activeTab === "restaurant" && editRestaurant && (
            <div className="bg-card rounded-xl shadow-sm border p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { label:"Restaurant Name", key:"name", type:"text" },
                  { label:"City", key:"city", type:"text" },
                  { label:"Address", key:"address", type:"text" },
                  { label:"Image URL", key:"imageUrl", type:"text" },
                  { label:"Latitude", key:"lat", type:"number" },
                  { label:"Longitude", key:"lng", type:"number" },
                  { label:"Opening Time", key:"openingTime", type:"time" },
                  { label:"Closing Time", key:"closingTime", type:"time" },
                  { label:"FSSAI Number", key:"fssaiNumber", type:"text" },
                  { label:"Phone", key:"phone", type:"text" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-foreground mb-1">{label}</label>
                    <input type={type} value={editRestaurant[key] || ""}
                      onChange={(e) => setEditRestaurant((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-3 py-2.5 border-2 border-border rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-foreground" />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
                  <textarea value={editRestaurant.description || ""}
                    onChange={(e) => setEditRestaurant((p) => ({ ...p, description: e.target.value }))}
                    className="w-full px-3 py-2.5 border-2 border-border rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-foreground resize-none"
                    rows={3} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-2">Cuisines</label>
                  <div className="flex flex-wrap gap-2">
                    {CUISINE_OPTIONS.map((c) => (
                      <button key={c} type="button"
                        onClick={() => setEditRestaurant((p) => ({
                          ...p,
                          cuisines: (p.cuisines || []).includes(c)
                            ? p.cuisines.filter((x) => x !== c)
                            : [...(p.cuisines || []), c],
                        }))}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                          (editRestaurant.cuisines || []).includes(c)
                            ? "bg-primary/50 border-primary text-white"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >{c}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2 border-t border-border">
                <button onClick={handleSaveRestaurant} disabled={saving}
                  className="flex items-center gap-2 bg-primary/50 hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-60">
                  {saving ? <><div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" /> Saving…</> : <><FaSave /> Save Changes</>}
                </button>
              </div>
            </div>
          )}

          {/* ── Menu Tab ── */}
          {activeTab === "menu" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-foreground text-lg">{menuItems.length} Items</h3>
                <button onClick={() => setDishModal({ open: true, item: null })}
                  className="flex items-center gap-2 bg-primary/50 hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-semibold transition-all text-sm">
                  <FaAdd /> Add Dish
                </button>
              </div>
              <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
                {menuItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FaUtensils className="text-4xl mx-auto mb-3 opacity-40" />
                    <p>No menu items yet. Add your first dish!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted border-b">
                        <tr>
                          {["Dish","Category","Price","Type","Status","Actions"].map(h=>(
                            <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {menuItems.map((item) => (
                          <tr key={item.id} className="hover:bg-muted">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-8 h-8 rounded object-cover" />}
                                <div>
                                  <p className="font-semibold text-foreground">{item.name}</p>
                                  {item.description && <p className="text-xs text-muted-foreground truncate max-w-[160px]">{item.description}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                            <td className="px-4 py-3 font-semibold text-foreground">{fmt(item.price)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isVeg ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {item.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isAvailable ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"}`}>
                                {item.isAvailable ? "Available" : "Hidden"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button onClick={() => setDishModal({ open:true, item })}
                                  className="text-blue-500 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded transition-all"><FaEdit /></button>
                                <button onClick={() => handleDeleteDish(item.id)}
                                  className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition-all"><FaTrash /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Orders Tab ── */}
          {activeTab === "orders" && (
            <div>
              <h3 className="font-bold text-foreground text-lg mb-4">{orders.length} Orders</h3>
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <div className="bg-card rounded-xl shadow-sm border text-center py-12 text-muted-foreground">
                    <FaClipboardList className="text-4xl mx-auto mb-3 opacity-40" />
                    <p>No orders yet for this restaurant.</p>
                  </div>
                ) : orders.map((order) => {
                  const nextStatuses = ALLOWED_TRANSITIONS[order.status] || [];
                  return (
                    <div key={order.id} className="bg-card rounded-xl shadow-sm border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-semibold text-foreground">#{order.id.slice(-6).toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">{order.user?.name} • {new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || "bg-muted text-foreground"}`}>
                            {order.status}
                          </span>
                          <p className="font-bold text-foreground">{fmt(order.totalAmount)}</p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        {order.items?.map((i) => `${i.menuItem?.name || "Item"} ×${i.quantity}`).join(", ")}
                      </div>
                      {nextStatuses.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {nextStatuses.map((s) => (
                            <button key={s} onClick={() => handleStatusUpdate(order.id, s)}
                              disabled={statusUpdating === order.id}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border-2 ${
                                s === "CANCELLED" ? "border-red-300 text-red-600 hover:bg-red-50" : "border-primary/40 text-primary hover:bg-primary/5"
                              } disabled:opacity-50`}>
                              {statusUpdating === order.id ? "…" : `→ ${s}`}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <DishModal
        open={dishModal.open}
        onClose={() => setDishModal({ open: false, item: null })}
        onSave={dishModal.item ? handleEditDish : handleAddDish}
        initial={dishModal.item}
      />
    </div>
  );
};

export default OwnerDashboard;
