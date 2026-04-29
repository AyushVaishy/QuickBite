import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createRestaurant } from "../services/adminService";
import {
  FaStore, FaMapMarkerAlt, FaClock, FaArrowRight,
  FaArrowLeft, FaCheck, FaUtensils,
} from "react-icons/fa";

const CUISINE_OPTIONS = [
  "North Indian", "South Indian", "Chinese", "Pizza", "Burgers",
  "Biryani", "Desserts", "Italian", "Mexican", "Sushi",
  "Thai", "Continental", "Seafood", "Vegan", "Fast Food",
];

const STEPS = ["Restaurant Info", "Location & Hours", "Review & Submit"];

const empty = {
  name: "", description: "", cuisines: [], imageUrl: "",
  address: "", city: "", lat: "", lng: "",
  openingTime: "09:00", closingTime: "23:00",
  fssaiNumber: "", costForTwo: "", phone: "",
};

const OwnerOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const toggleCuisine = (c) => {
    setForm((p) => ({
      ...p,
      cuisines: p.cuisines.includes(c) ? p.cuisines.filter((x) => x !== c) : [...p.cuisines, c],
    }));
    if (errors.cuisines) setErrors((p) => ({ ...p, cuisines: "" }));
  };

  const validateStep0 = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Restaurant name is required";
    if (form.cuisines.length === 0) e.cuisines = "Select at least one cuisine";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (form.lat && isNaN(parseFloat(form.lat))) e.lat = "Must be a number";
    if (form.lng && isNaN(parseFloat(form.lng))) e.lng = "Must be a number";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const next = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep((s) => s + 1);
  };

  const back = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        cuisines: form.cuisines,
        imageUrl: form.imageUrl || undefined,
        address: form.address,
        city: form.city,
        lat: form.lat ? parseFloat(form.lat) : 0,
        lng: form.lng ? parseFloat(form.lng) : 0,
        openingTime: form.openingTime,
        closingTime: form.closingTime,
        fssaiNumber: form.fssaiNumber || undefined,
        costForTwo: form.costForTwo ? parseInt(form.costForTwo) * 100 : undefined,
        phone: form.phone || undefined,
      };
      await createRestaurant(payload);
      toast.success("Restaurant created successfully!");
      navigate("/owner");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create restaurant");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-foreground placeholder-gray-400 bg-card ${
      errors[field] ? "border-red-400" : "border-border"
    }`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card shadow-sm border-b px-6 py-4 flex items-center gap-3">
        <FaStore className="text-primary text-2xl" />
        <div>
          <h1 className="text-xl font-bold text-foreground">Set Up Your Restaurant</h1>
          <p className="text-sm text-muted-foreground">Complete your restaurant profile to start receiving orders</p>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < step ? "bg-green-500 text-white" : i === step ? "bg-primary/50 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {i < step ? <FaCheck /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${i === step ? "text-primary" : "text-muted-foreground"}`}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${i < step ? "bg-green-400" : "bg-muted"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-card rounded-2xl shadow-md p-6 sm:p-8">
          {/* STEP 0: Restaurant Info */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FaUtensils className="text-primary" /> Restaurant Details
              </h2>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Restaurant Name *</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)}
                  className={inputClass("name")} placeholder="e.g. Spice Garden" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                  className={inputClass("description") + " resize-none"} rows={3}
                  placeholder="Tell customers about your restaurant…" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Cuisines * {form.cuisines.length > 0 && <span className="text-primary">({form.cuisines.length} selected)</span>}
                </label>
                <div className="flex flex-wrap gap-2">
                  {CUISINE_OPTIONS.map((c) => (
                    <button key={c} type="button" onClick={() => toggleCuisine(c)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                        form.cuisines.includes(c)
                          ? "bg-primary/50 border-primary text-white"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >{c}</button>
                  ))}
                </div>
                {errors.cuisines && <p className="text-red-500 text-xs mt-1">{errors.cuisines}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Restaurant Image URL</label>
                <input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)}
                  className={inputClass("imageUrl")} placeholder="https://…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Cost for Two (₹)</label>
                  <input type="number" value={form.costForTwo} onChange={(e) => set("costForTwo", e.target.value)}
                    className={inputClass("costForTwo")} placeholder="350" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Phone</label>
                  <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                    className={inputClass("phone")} placeholder="9876543210" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Location & Hours */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FaMapMarkerAlt className="text-primary" /> Location & Hours
              </h2>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Street Address *</label>
                <input value={form.address} onChange={(e) => set("address", e.target.value)}
                  className={inputClass("address")} placeholder="123, MG Road" />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">City *</label>
                <input value={form.city} onChange={(e) => set("city", e.target.value)}
                  className={inputClass("city")} placeholder="Bangalore" />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Latitude</label>
                  <input value={form.lat} onChange={(e) => set("lat", e.target.value)}
                    className={inputClass("lat")} placeholder="12.9716" />
                  {errors.lat && <p className="text-red-500 text-xs mt-1">{errors.lat}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Longitude</label>
                  <input value={form.lng} onChange={(e) => set("lng", e.target.value)}
                    className={inputClass("lng")} placeholder="77.5946" />
                  {errors.lng && <p className="text-red-500 text-xs mt-1">{errors.lng}</p>}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                Tip: Find your restaurant's coordinates on Google Maps → right-click → "What's here?"
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    <FaClock className="inline mr-1 text-primary" />Opening Time
                  </label>
                  <input type="time" value={form.openingTime} onChange={(e) => set("openingTime", e.target.value)}
                    className={inputClass("openingTime")} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    <FaClock className="inline mr-1 text-primary" />Closing Time
                  </label>
                  <input type="time" value={form.closingTime} onChange={(e) => set("closingTime", e.target.value)}
                    className={inputClass("closingTime")} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">FSSAI License Number</label>
                <input value={form.fssaiNumber} onChange={(e) => set("fssaiNumber", e.target.value)}
                  className={inputClass("fssaiNumber")} placeholder="12345678901234" />
              </div>
            </div>
          )}

          {/* STEP 2: Review */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FaCheck className="text-green-500" /> Review & Submit
              </h2>
              <div className="divide-y divide-border">
                {[
                  ["Restaurant Name", form.name],
                  ["Description", form.description || "—"],
                  ["Cuisines", form.cuisines.join(", ") || "—"],
                  ["Address", `${form.address}, ${form.city}`],
                  ["Coordinates", form.lat && form.lng ? `${form.lat}, ${form.lng}` : "Not set"],
                  ["Hours", `${form.openingTime} – ${form.closingTime}`],
                  ["Cost for Two", form.costForTwo ? `₹${form.costForTwo}` : "—"],
                  ["FSSAI", form.fssaiNumber || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="py-3 flex justify-between gap-4">
                    <span className="text-sm text-muted-foreground font-medium">{label}</span>
                    <span className="text-sm text-foreground font-semibold text-right">{value}</span>
                  </div>
                ))}
              </div>
              {form.imageUrl && (
                <div className="mt-2">
                  <img src={form.imageUrl} alt="preview" className="w-full h-40 object-cover rounded-xl"
                    onError={(e) => { e.target.style.display = "none"; }} />
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-border">
            {step > 0 ? (
              <button onClick={back}
                className="flex items-center gap-2 px-5 py-2.5 border-2 border-border rounded-xl text-muted-foreground font-semibold hover:border-border transition-all">
                <FaArrowLeft /> Back
              </button>
            ) : (
              <button onClick={() => navigate("/owner")}
                className="px-5 py-2.5 border-2 border-border rounded-xl text-muted-foreground font-semibold hover:border-border transition-all">
                Skip for now
              </button>
            )}
            {step < 2 ? (
              <button onClick={next}
                className="flex items-center gap-2 bg-primary/50 hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-semibold transition-all">
                Next <FaArrowRight />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-60">
                {submitting ? (
                  <><div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" /> Creating…</>
                ) : (
                  <><FaCheck /> Create Restaurant</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerOnboarding;
