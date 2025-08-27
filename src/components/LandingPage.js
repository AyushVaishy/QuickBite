import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaSearch, FaUtensils, FaShoppingCart } from "react-icons/fa";
import LOGO from "../utils/android-chrome-192x192.png";
import SignInSidebar from "./SignInSidebar";

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [signInSidebarOpen, setSignInSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Check if user is already signed in and redirect to home
  useEffect(() => {
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
      navigate('/home');
    }
  }, [navigate]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSignInClick = () => {
    setSignInSidebarOpen(true);
  };

  const handleSignIn = (userData) => {
    // Navigate to home page after successful sign in
    navigate("/home");
  };

  const features = [
    {
      icon: "🚚",
      title: "Lightning Fast Delivery",
      description: "Get your food delivered in 30 minutes or less"
    },
    {
      icon: "🍕",
      title: "Best Restaurants",
      description: "Curated selection of top-rated restaurants"
    },
    {
      icon: "💳",
      title: "Secure Payments",
      description: "Multiple payment options with complete security"
    },
    {
      icon: "⭐",
      title: "Quality Assured",
      description: "Fresh ingredients and quality food guaranteed"
    }
  ];

  const popularCategories = [
    { name: "Pizza", image: "🍕", color: "from-red-400 to-red-600" },
    { name: "Burgers", image: "🍔", color: "from-yellow-400 to-orange-500" },
    { name: "Biryani", image: "🍚", color: "from-orange-400 to-red-500" },
    { name: "Desserts", image: "🍰", color: "from-pink-400 to-purple-500" },
    { name: "Chinese", image: "🥢", color: "from-red-500 to-red-700" },
    { name: "South Indian", image: "🍛", color: "from-yellow-500 to-orange-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <SignInSidebar 
        isOpen={signInSidebarOpen}
        onClose={() => setSignInSidebarOpen(false)}
        onSignIn={handleSignIn}
      />
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/home" className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src={LOGO}
                  alt="QuickBite Logo"
                  className="w-12 h-12 rounded-full group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400 group-hover:text-orange-700 transition-colors">
                  QuickBite
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Food Delivery</p>
              </div>
            </Link>

                         {/* Sign In Button */}
             <button
               onClick={handleSignInClick}
               className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
             >
               Sign In
             </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Heading */}
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 dark:text-gray-100 mb-6 leading-tight">
              Order Delicious Food
              <span className="block text-orange-600 dark:text-orange-400">Delivered to Your Door</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover the best restaurants in your area. Quick delivery, great prices, and amazing food!
            </p>
          </div>

          {/* Search Section */}
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Location Input */}
                <div className="flex-1 relative">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500 text-xl" />
                  <input
                    type="text"
                    placeholder="Enter your delivery location"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 text-gray-700 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-900"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                
                {/* Search Input */}
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="text"
                    placeholder="Search for restaurants, cuisines, or dishes..."
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 text-gray-700 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                                 {/* Find Food Button */}
                 <button
                   onClick={handleSignInClick}
                   className="bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                 >
                   <FaUtensils className="text-xl" />
                   Find Food
                 </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">
              Why Choose QuickBite?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-700 dark:to-gray-800 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 px-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className={`transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">
              Popular Food Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {popularCategories.map((category, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group"
                                     onClick={handleSignInClick}
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {category.image}
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                    {category.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className={`transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="p-6">
                <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">500+</div>
                <div className="text-gray-600 dark:text-gray-300">Restaurants</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">50+</div>
                <div className="text-gray-600 dark:text-gray-300">Cities</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">1M+</div>
                <div className="text-gray-600 dark:text-gray-300">Happy Customers</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">30min</div>
                <div className="text-gray-600 dark:text-gray-300">Average Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`transition-all duration-1000 delay-1200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Order Delicious Food?
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Join thousands of satisfied customers who trust QuickBite for their food delivery needs.
            </p>
                             <button
                   onClick={handleSignInClick}
                   className="bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
                 >
                   <FaShoppingCart className="text-xl" />
                   Start Ordering Now
                 </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={LOGO} alt="QuickBite Logo" className="w-8 h-8 rounded-full" />
            <span className="text-xl font-bold">QuickBite</span>
          </div>
          <p className="text-gray-400 mb-4">
            India's most loved food delivery platform
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <span>© 2024 QuickBite. All rights reserved.</span>
            <span>Made with ❤️ by Ayush</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
