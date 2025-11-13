import React, { useMemo, useState } from "react";
import { support_data } from "../utils/constants.js";
import FAQItem from "./FAQItem.js";
import {
  FaLifeRing,
  FaHeadset,
  FaEnvelopeOpenText,
  FaPhoneAlt,
  FaSearch,
  FaChevronRight,
} from "react-icons/fa";

const Help = () => {
  const [activeTitle, setActiveTitle] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const titles = useMemo(() => support_data.map((data) => data.title), []);
  const activeSection = support_data[activeTitle] || support_data[0];
  const activeFAQs = activeSection?.data || [];

  const filteredFAQs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return activeFAQs;
    return activeFAQs.filter(
      (faq) =>
        faq.title.toLowerCase().includes(term) ||
        (faq.description && faq.description.toLowerCase().includes(term))
    );
  }, [activeFAQs, searchTerm]);

  return (
    <div className="mt-20 min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-2xl px-8 md:px-16 py-12 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mb-4">
            <FaLifeRing className="text-base" />
            We’re one tap away—24 / 7 support
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Help & Support
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Whether it’s tracking an order or partnering with us, get the answers you need faster than you can say “I’m hungry”.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl bg-white dark:bg-gray-900 shadow-xl border border-orange-100 dark:border-gray-800 p-6 flex items-start gap-4">
            <span className="p-3 rounded-2xl bg-orange-100 text-orange-600">
              <FaHeadset />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Chat Support</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tap the chat bubble in the app for instant help from a QuickBite expert.
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-white dark:bg-gray-900 shadow-xl border border-orange-100 dark:border-gray-800 p-6 flex items-start gap-4">
            <span className="p-3 rounded-2xl bg-orange-100 text-orange-600">
              <FaEnvelopeOpenText />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Assistance</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Write to <span className="font-semibold text-orange-600 dark:text-orange-400">support@quickbite.in</span> for order queries.
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-white dark:bg-gray-900 shadow-xl border border-orange-100 dark:border-gray-800 p-6 flex items-start gap-4">
            <span className="p-3 rounded-2xl bg-orange-100 text-orange-600">
              <FaPhoneAlt />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Partner Hotline</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Restaurant & delivery partners call us at <span className="font-semibold">080-67466777</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Knowledge Base */}
        <div className="mt-12 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-orange-100 dark:border-gray-800 p-6 md:p-10">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar Navigation */}
            <aside className="lg:w-72 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-5 shadow-inner">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400 mb-4">
                Browse by topic
              </h3>
              <div className="space-y-2">
                {titles.map((curr, index) => {
                  const isActive = activeTitle === index;
                  return (
                    <button
                      key={curr}
                      onClick={() => {
                        setActiveTitle(index);
                        setSearchTerm("");
                      }}
                      className={`w-full text-left px-4 py-3 rounded-2xl font-medium flex items-center justify-between gap-3 transition-all duration-300 ${
                        isActive
                          ? "bg-orange-500 text-white shadow-lg"
                          : "bg-white/70 dark:bg-gray-900/60 text-gray-700 dark:text-gray-200 hover:bg-orange-100 hover:text-orange-600"
                      }`}
                    >
                      <span className="truncate">{curr}</span>
                      <FaChevronRight
                        className={`text-xs ${isActive ? "opacity-100" : "opacity-40"}`}
                      />
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* FAQ Section */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activeSection?.title}
                  </h2>
                  {activeSection?.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
                      {activeSection.description}
                    </p>
                  )}
                </div>
                <div className="relative w-full sm:w-80">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search in this category..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 pl-10 pr-4 py-3 shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                  />
                </div>
              </div>

              <div className="mt-8 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-inner px-6 py-4">
                {filteredFAQs.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                    No results found. Try another keyword or pick a different topic.
                  </div>
                ) : (
                  filteredFAQs.map((item) => (
                    <FAQItem key={item.id} title={item.title} description={item.description} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
