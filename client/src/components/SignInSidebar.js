import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { setCredentials } from "../store/authSlice";
import { login, signup } from "../services/authService";
import {
  FaTimes, FaUser, FaEnvelope, FaLock, FaPhone,
  FaSignInAlt, FaStore, FaUtensils,
} from "react-icons/fa";

const ROLE_REDIRECT = {
  USER: "/home",
  RESTAURANT_OWNER: "/owner",
  ADMIN: "/admin",
};

const SignInSidebar = ({ isOpen, onClose, onSignIn }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", phone: "" });
    setErrors({});
    setApiError("");
    setSelectedRole(null);
  };

  const switchTab = (tab) => { setActiveTab(tab); resetForm(); };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const validateLogin = () => {
    const e = {};
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email";
    if (!formData.password.trim()) e.password = "Password is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateSignup = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email";
    if (!formData.password) e.password = "Password is required";
    else if (formData.password.length < 8) e.password = "Min. 8 characters";
    else if (!/[A-Z]/.test(formData.password)) e.password = "Must include an uppercase letter";
    else if (!/[0-9]/.test(formData.password)) e.password = "Must include a digit";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const persistAuth = (user, accessToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("userData", JSON.stringify(user));
    dispatch(setCredentials({ user, accessToken }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setIsSubmitting(true);
    setApiError("");
    try {
      const res = await login({ email: formData.email, password: formData.password });
      const { user, accessToken } = res.data;
      persistAuth(user, accessToken);
      toast.success(`Welcome back, ${user.name}!`);
      if (onSignIn) onSignIn(user);
      onClose();
      navigate(ROLE_REDIRECT[user.role] || "/home");
    } catch (err) {
      setApiError(err?.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;
    setIsSubmitting(true);
    setApiError("");
    try {
      const payload = { role: selectedRole, name: formData.name, email: formData.email, password: formData.password };
      if (formData.phone.trim()) payload.phone = formData.phone.trim();
      const res = await signup(payload);
      const { user, accessToken } = res.data;
      persistAuth(user, accessToken);
      toast.success(`Welcome to QuickBite, ${user.name}!`);
      if (onSignIn) onSignIn(user);
      onClose();
      navigate(selectedRole === "RESTAURANT_OWNER" ? "/owner/onboard" : (ROLE_REDIRECT[user.role] || "/home"));
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors?.length) {
        const fe = {};
        data.errors.forEach(({ field, message }) => { fe[field] = message; });
        setErrors(fe);
      } else {
        setApiError(data?.message || "Signup failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-700 placeholder-gray-400 bg-white ${
      errors[field] ? "border-red-400" : "border-gray-200"
    }`;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-[9999] transition-transform duration-300 overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-orange-500 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaSignInAlt /> Welcome to QuickBite
              </h2>
              <button onClick={onClose} className="text-2xl hover:text-orange-200">
                <FaTimes />
              </button>
            </div>
            <div className="flex gap-2">
              {["login", "signup"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  className={`flex-1 py-2 rounded-lg font-semibold capitalize transition-all ${
                    activeTab === tab ? "bg-white text-orange-600" : "bg-orange-600 text-white hover:bg-orange-700"
                  }`}
                >
                  {tab === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-6">
            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {apiError}
              </div>
            )}

            {/* LOGIN FORM */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    <FaEnvelope className="inline mr-2 text-orange-500" />Email
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                    className={inputClass("email")} placeholder="you@example.com" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    <FaLock className="inline mr-2 text-orange-500" />Password
                  </label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange}
                    className={inputClass("password")} placeholder="Your password" />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {isSubmitting ? (
                    <><div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full" /> Signing in...</>
                  ) : "Sign In"}
                </button>
              </form>
            )}

            {/* SIGNUP FLOW */}
            {activeTab === "signup" && (
              <>
                {/* Step 1: Role selection */}
                {!selectedRole && (
                  <div>
                    <p className="text-gray-600 text-sm mb-4 font-medium">I want to join as a…</p>
                    <div className="grid grid-cols-1 gap-4">
                      <button onClick={() => setSelectedRole("USER")}
                        className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all text-left group">
                        <div className="bg-orange-100 group-hover:bg-orange-200 p-3 rounded-lg">
                          <FaUser className="text-orange-500 text-xl" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Customer</p>
                          <p className="text-sm text-gray-500">Order food from nearby restaurants</p>
                        </div>
                      </button>
                      <button onClick={() => setSelectedRole("RESTAURANT_OWNER")}
                        className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all text-left group">
                        <div className="bg-orange-100 group-hover:bg-orange-200 p-3 rounded-lg">
                          <FaStore className="text-orange-500 text-xl" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Restaurant Owner</p>
                          <p className="text-sm text-gray-500">List your restaurant and manage orders</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Account details */}
                {selectedRole && (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-lg">
                        {selectedRole === "USER" ? <FaUser className="text-orange-500 text-sm" /> : <FaStore className="text-orange-500 text-sm" />}
                        <span className="text-sm font-medium text-orange-700">
                          {selectedRole === "USER" ? "Customer" : "Restaurant Owner"}
                        </span>
                      </div>
                      <button type="button" onClick={() => setSelectedRole(null)}
                        className="text-xs text-gray-400 hover:text-gray-600 underline">Change</button>
                    </div>

                    {selectedRole === "RESTAURANT_OWNER" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                        <FaUtensils className="inline mr-2" />
                        After creating your account, you'll set up your restaurant details.
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <FaUser className="inline mr-2 text-orange-500" />Full Name
                      </label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                        className={inputClass("name")} placeholder="Your full name" />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <FaEnvelope className="inline mr-2 text-orange-500" />Email
                      </label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                        className={inputClass("email")} placeholder="you@example.com" />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <FaLock className="inline mr-2 text-orange-500" />Password
                      </label>
                      <input type="password" name="password" value={formData.password} onChange={handleInputChange}
                        className={inputClass("password")} placeholder="Min. 8 chars, 1 uppercase, 1 digit" />
                      {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <FaPhone className="inline mr-2 text-orange-500" />Phone
                        <span className="font-normal text-gray-400 ml-1">(optional)</span>
                      </label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                        className={inputClass("phone")} placeholder="10-digit mobile number" />
                    </div>

                    <button type="submit" disabled={isSubmitting}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                      {isSubmitting ? (
                        <><div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full" /> Creating account...</>
                      ) : selectedRole === "RESTAURANT_OWNER" ? (
                        "Create Account & Set Up Restaurant →"
                      ) : "Create Account"}
                    </button>
                  </form>
                )}
              </>
            )}

            <p className="mt-6 text-xs text-gray-400 text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInSidebar;
