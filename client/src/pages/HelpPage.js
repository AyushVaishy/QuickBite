import React, { useMemo, useState } from "react";
import { support_data } from "../utils/constants.js";
import FAQItem from "../components/FAQItem.js";
import {
  FaLifeRing,
  FaHeadset,
  FaEnvelopeOpenText,
  FaPhoneAlt,
  FaSearch,
  FaChevronRight,
} from "react-icons/fa";

const HelpPage = () => {
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
    <div className="min-h-screen">
      <div className="w-full px-6 md:px-8 py-6 md:py-10">
        
        {/* Hero */}
        <div className="text-center pt-2 pb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF5A5F]/10 text-[#FF5A5F] text-sm font-bold mb-4">
            <FaLifeRing className="text-base" />
            We’re one tap away—24 / 7 support
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Help & Support
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Whether it’s tracking an order or partnering with us, get the answers you need faster than you can say “I’m hungry”.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl shadow-sm border border-white/60 dark:border-white/5 p-6 flex items-start gap-4 transition-transform hover:-translate-y-1">
            <span className="p-3 rounded-2xl bg-[#FF5A5F]/10 text-[#FF5A5F]">
              <FaHeadset size={20} />
            </span>
            <div>
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">Live Chat Support</h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Tap the chat bubble in the app for instant help from a Cravon expert.
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl shadow-sm border border-white/60 dark:border-white/5 p-6 flex items-start gap-4 transition-transform hover:-translate-y-1">
            <span className="p-3 rounded-2xl bg-[#FF5A5F]/10 text-[#FF5A5F]">
              <FaEnvelopeOpenText size={20} />
            </span>
            <div>
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">Email Assistance</h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Write to <span className="font-bold text-[#FF5A5F]">support@cravon.in</span> for order queries.
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl shadow-sm border border-white/60 dark:border-white/5 p-6 flex items-start gap-4 transition-transform hover:-translate-y-1">
            <span className="p-3 rounded-2xl bg-[#FF5A5F]/10 text-[#FF5A5F]">
              <FaPhoneAlt size={20} />
            </span>
            <div>
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">Partner Hotline</h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Restaurant & delivery partners call us at <span className="font-bold">080-67466777</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Knowledge Base */}
        <div className="mt-10 bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl rounded-3xl shadow-sm border border-white/60 dark:border-white/5 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar Navigation */}
            <aside className="lg:w-64 shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 px-3">
                Browse by topic
              </h3>
              <div className="space-y-1.5">
                {titles.map((curr, index) => {
                  const isActive = activeTitle === index;
                  return (
                    <button
                      key={curr}
                      onClick={() => {
                        setActiveTitle(index);
                        setSearchTerm("");
                      }}
                      className={`w-full text-left px-4 py-3 rounded-2xl font-bold flex items-center justify-between gap-3 transition-all duration-300 ${
                        isActive
                           ? "bg-[#FF5A5F] text-white shadow-md shadow-[#FF5A5F]/20"
                           : "text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-white/10"
                      }`}
                    >
                      <span className="truncate text-[14px]">{curr}</span>
                      <FaChevronRight
                        className={`text-[10px] ${isActive ? "opacity-100" : "opacity-0 -translate-x-2"}`}
                      />
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* FAQ Section */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    {activeSection?.title}
                  </h2>
                  {activeSection?.description && (
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
                      {activeSection.description}
                    </p>
                  )}
                </div>
                <div className="relative w-full sm:w-72 shrink-0">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search in this category..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-black/20 text-[14px] font-semibold text-gray-900 dark:text-white pl-10 pr-4 py-2.5 outline-none transition-all focus:ring-2 focus:ring-[#FF5A5F]/30 focus:border-[#FF5A5F]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredFAQs.length === 0 ? (
                  <div className="text-center text-gray-500 font-medium py-16">
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

export default HelpPage;
