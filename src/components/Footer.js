import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaApple, FaGooglePlay } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-br from-orange-600 via-red-600 to-orange-700 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info & Logo */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl text-orange-600 font-bold">🍕</span>
              </div>
              <h3 className="text-2xl font-bold text-white">QuickBite</h3>
            </div>
            <p className="text-orange-100 text-sm leading-relaxed">
              India's most loved food delivery platform. Order from your favorite restaurants and get it delivered at your doorstep.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-orange-200 hover:text-white transition-colors duration-300">
                <FaFacebook className="text-xl" />
              </a>
              <a href="#" className="text-orange-200 hover:text-white transition-colors duration-300">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="text-orange-200 hover:text-white transition-colors duration-300">
                <FaInstagram className="text-xl" />
              </a>
              <a href="#" className="text-orange-200 hover:text-white transition-colors duration-300">
                <FaLinkedin className="text-xl" />
              </a>
              <a href="#" className="text-orange-200 hover:text-white transition-colors duration-300">
                <FaYoutube className="text-xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white border-b-2 border-orange-400 pb-2">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-orange-100 hover:text-white transition-colors duration-300 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-orange-100 hover:text-white transition-colors duration-300 text-sm">
                  Help & Support
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-orange-100 hover:text-white transition-colors duration-300 text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-orange-100 hover:text-white transition-colors duration-300 text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-orange-100 hover:text-white transition-colors duration-300 text-sm">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-orange-100 hover:text-white transition-colors duration-300 text-sm">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white border-b-2 border-orange-400 pb-2">Services</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-orange-100 hover:text-white transition-colors duration-300 text-sm">
                  Food Delivery
                </a>
              </li>
              <li>
                <a href="#" className="text-orange-100 hover:text-white transition-colors duration-300 text-sm">
                  Grocery Delivery
                </a>
              </li>
              <li>
                <a href="#" className="text-orange-100 hover:text-white transition-colors duration-300 text-sm">
                  Restaurant Partners
                </a>
              </li>
              <li>
                <a href="#" className="text-orange-100 hover:text-white transition-colors duration-300 text-sm">
                  Corporate Orders
                </a>
              </li>
              <li>
                <a href="#" className="text-orange-100 hover:text-white transition-colors duration-300 text-sm">
                  Catering Services
                </a>
              </li>
              <li>
                <a href="#" className="text-orange-100 hover:text-white transition-colors duration-300 text-sm">
                  QuickBite Pro
                </a>
              </li>
            </ul>
          </div>

          {/* Download App & Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white border-b-2 border-orange-400 pb-2">Download App</h4>
            <div className="space-y-3">
              <a href="#" className="flex items-center space-x-3 bg-black bg-opacity-20 rounded-lg p-3 hover:bg-black hover:bg-opacity-30 transition-all duration-300">
                <FaApple className="text-2xl" />
                <div className="text-left">
                  <div className="text-xs text-orange-200">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </a>
              <a href="#" className="flex items-center space-x-3 bg-black bg-opacity-20 rounded-lg p-3 hover:bg-black hover:bg-opacity-30 transition-all duration-300">
                <FaGooglePlay className="text-2xl" />
                <div className="text-left">
                  <div className="text-xs text-orange-200">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </a>
            </div>
            <div className="pt-4">
              <h5 className="font-semibold text-white mb-2">Contact Info</h5>
              <p className="text-orange-100 text-sm">📧 support@quickbite.com</p>
              <p className="text-orange-100 text-sm">📞 1800-123-4567</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-orange-400 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-orange-100 text-sm">
              © {new Date().getFullYear()} QuickBite. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-orange-100 hover:text-white transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-orange-100 hover:text-white transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-orange-100 hover:text-white transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
            <div className="text-orange-100 text-sm">
              Made with ❤️ by <strong className="text-white">Ayush</strong>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
