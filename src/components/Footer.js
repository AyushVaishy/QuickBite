import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaApple,
  FaGooglePlay,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelopeOpenText,
  FaClock,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-950 text-gray-200">
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-red-600">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="uppercase tracking-[0.35em] text-xs text-orange-100 font-semibold">
                QuickBite Cloud Kitchen
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">
                Serving cravings across Roorkee & beyond
              </h2>
              <p className="text-orange-100 mt-3 max-w-xl">
                Late-night hunger pangs, cheat-day feasts, or office lunches—we’ve got a curated menu ready 24x7 for delivery and takeaway.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a
                href="#"
                className="inline-flex items-center gap-3 bg-black/70 hover:bg-black text-white px-6 py-3 rounded-2xl transition-all shadow-lg"
              >
                <FaApple className="text-2xl" />
                <span className="text-left text-sm">
                  Download on <span className="block font-semibold text-lg">App Store</span>
                </span>
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-3 bg-black/70 hover:bg-black text-white px-6 py-3 rounded-2xl transition-all shadow-lg"
              >
                <FaGooglePlay className="text-2xl" />
                <span className="text-left text-sm">
                  Get it on <span className="block font-semibold text-lg">Google Play</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl">
                🍲
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">QuickBite</h3>
                <p className="text-xs tracking-[0.3em] uppercase text-orange-400">Cloud Kitchen Co.</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Crafted-by-chefs, delivered with love. We partner with local favorites and global brands to cover every craving, every hour of the day.
            </p>
            <div className="flex gap-3 pt-3">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                <FaInstagram />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                <FaFacebook />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                <FaTwitter />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                <FaLinkedin />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                <FaYoutube />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-wider text-gray-400 font-semibold">Explore</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link to="/home" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/help" className="hover:text-white transition">Help & Support</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              <li><a href="#" className="hover:text-white transition">About QuickBite</a></li>
              <li><a href="#" className="hover:text-white transition">Investor Relations</a></li>
              <li><a href="#" className="hover:text-white transition">Press</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-wider text-gray-400 font-semibold">For Customers</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition">QuickBite One Membership</a></li>
              <li><a href="#" className="hover:text-white transition">Order on Instamart</a></li>
              <li><a href="#" className="hover:text-white transition">Genie Pickup & Drop</a></li>
              <li><a href="#" className="hover:text-white transition">Coupons & Offers</a></li>
              <li><a href="#" className="hover:text-white transition">Gift Cards</a></li>
              <li><a href="#" className="hover:text-white transition">QuickBite Money</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-wider text-gray-400 font-semibold">For Partners</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition">Partner with us</a></li>
              <li><a href="#" className="hover:text-white transition">Partner Onboarding</a></li>
              <li><a href="#" className="hover:text-white transition">Advertise on QuickBite</a></li>
              <li><a href="#" className="hover:text-white transition">QuickBite for Business</a></li>
              <li><a href="#" className="hover:text-white transition">Logistics Partners</a></li>
              <li><a href="#" className="hover:text-white transition">Franchise Opportunities</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm uppercase tracking-wider text-gray-400 font-semibold">Reach us</h4>
            <div className="space-y-3 text-sm">
              <p className="flex items-start gap-3 text-gray-400">
                <FaMapMarkerAlt className="text-orange-500 mt-1" />
                <span>Cloud Kitchen HQ, Roorkee, Uttarakhand – 247667</span>
              </p>
              <p className="flex items-start gap-3 text-gray-400">
                <FaPhoneAlt className="text-orange-500 mt-1" />
                <span>Order Hotline: +91 87879 52601<br />Partner Support: 080-67466777</span>
              </p>
              <p className="flex items-start gap-3 text-gray-400">
                <FaEnvelopeOpenText className="text-orange-500 mt-1" />
                <span>support@quickbite.com<br />partnersupport@quickbite.in</span>
              </p>
              <p className="flex items-start gap-3 text-gray-400">
                <FaClock className="text-orange-500 mt-1" />
                <span>Delivery Hours: 11 AM – 11 PM<br />Support: 24×7 live chat</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} QuickBite Cloud Kitchen Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Refund & Cancellation</a>
            <a href="#" className="hover:text-white transition">Security</a>
          </div>
          <p className="text-gray-500">
            Made with ❤️ by <span className="text-gray-300 font-semibold">Ayush</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
