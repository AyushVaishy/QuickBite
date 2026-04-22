import React, { useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { setCredentials } from "../store/authSlice";
import { login, signup } from "../services/authService";
import { FaTimes, FaUser, FaEnvelope, FaLock, FaPhone, FaSignInAlt } from "react-icons/fa";

const SignInSidebar = ({ isOpen, onClose, onSignIn }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("login"); // "login" | "signup"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setApiError("");
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrors({});
    setApiError("");
    setFormData({ name: "", email: "", password: "", phone: "" });
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    else if (!/[A-Z]/.test(formData.password)) newErrors.password = "Password must contain at least one uppercase letter";
    else if (!/[0-9]/.test(formData.password)) newErrors.password = "Password must contain at least one digit";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valid = activeTab === "login" ? validateLogin() : validateSignup();
    if (!valid) return;

    setIsSubmitting(true);
    setApiError("");
    try {
      let res;
      if (activeTab === "login") {
        res = await login({ email: formData.email, password: formData.password });
      } else {
        const payload = { name: formData.name, email: formData.email, password: formData.password };
        if (formData.phone.trim()) payload.phone = formData.phone.trim();
        res = await signup(payload);
      }

      const { user, accessToken } = res.data;

      // Save token for API calls
      localStorage.setItem("accessToken", accessToken);
      // Keep localStorage.userData for Header compatibility
      localStorage.setItem("userData", JSON.stringify({ firstName: user.name, ...user }));
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "userData",
          newValue: JSON.stringify({ firstName: user.name, ...user }),
        })
      );

      dispatch(setCredentials({ user, accessToken }));

      toast.success(activeTab === 'login' ? `Welcome back, ${user.name}!` : `Account created! Welcome, ${user.name}!`);

      if (onSignIn) onSignIn(user);
      onClose();
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors?.length) {
        const fieldErrors = {};
        data.errors.forEach(({ field, message }) => { fieldErrors[field] = message; });
        setErrors(fieldErrors);
      } else {
        setApiError(data?.message || (activeTab === "login" ? "Login failed. Check your credentials." : "Signup failed. Try again."));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 text-gray-700 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-900 ${
      errors[field] ? "border-red-500" : "border-gray-200 dark:border-gray-700"
    }`;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-white dark:bg-gray-800 shadow-2xl z-[9999] transition-transform duration-300 overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-orange-500 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <FaSignInAlt className="text-3xl" />
                Welcome to QuickBite
              </h2>
              <button
                className="text-2xl hover:text-orange-200 transition-colors duration-300"
                onClick={onClose}
              >
                <FaTimes />
              </button>
            </div>
            {/* Tabs */}
            <div className="flex gap-2 mt-2">
              <button
                className={`flex-1 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === "login"
                    ? "bg-white text-orange-600"
                    : "bg-orange-600 text-white hover:bg-orange-700"
                }`}
                onClick={() => switchTab("login")}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === "signup"
                    ? "bg-white text-orange-600"
                    : "bg-orange-600 text-white hover:bg-orange-700"
                }`}
                onClick={() => switchTab("signup")}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 p-6">
            {apiError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name — signup only */}
              {activeTab === "signup" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <FaUser className="inline mr-2 text-orange-500" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={inputClass("name")}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <FaEnvelope className="inline mr-2 text-orange-500" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={inputClass("email")}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <FaLock className="inline mr-2 text-orange-500" />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={inputClass("password")}
                  placeholder={activeTab === "signup" ? "Min. 8 chars, 1 uppercase, 1 digit" : "Enter your password"}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Phone — signup only, optional */}
              {activeTab === "signup" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <FaPhone className="inline mr-2 text-orange-500" />
                    Phone{" "}
                    <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={inputClass("phone")}
                    placeholder="Enter your phone number"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {activeTab === "login" ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="text-xl" />
                    {activeTab === "login" ? "Sign In" : "Create Account"}
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInSidebar;


