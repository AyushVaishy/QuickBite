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
    <div className="mt-20 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-2xl px-8 md:px-16 py-12 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <FaLifeRing className="text-base" />
            We’re one tap away—24 / 7 support
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
            Help & Support
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether it’s tracking an order or partnering with us, get the answers you need faster than you can say “I’m hungry”.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl bg-background shadow-xl border border-border dark:border-gray-800 p-6 flex items-start gap-4">
            <span className="p-3 rounded-2xl bg-primary/10 text-primary">
              <FaHeadset />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Live Chat Support</h3>
              <p className="text-sm text-muted-foreground">
                Tap the chat bubble in the app for instant help from a Cravon expert.
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-background shadow-xl border border-border dark:border-gray-800 p-6 flex items-start gap-4">
            <span className="p-3 rounded-2xl bg-primary/10 text-primary">
              <FaEnvelopeOpenText />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Email Assistance</h3>
              <p className="text-sm text-muted-foreground">
                Write to <span className="font-semibold text-primary">support@cravon.in</span> for order queries.
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-background shadow-xl border border-border dark:border-gray-800 p-6 flex items-start gap-4">
            <span className="p-3 rounded-2xl bg-primary/10 text-primary">
              <FaPhoneAlt />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Partner Hotline</h3>
              <p className="text-sm text-muted-foreground">
                Restaurant & delivery partners call us at <span className="font-semibold">080-67466777</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Knowledge Base */}
        <div className="mt-12 bg-background rounded-3xl shadow-2xl border border-border dark:border-gray-800 p-6 md:p-10">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar Navigation */}
            <aside className="lg:w-72 bg-muted rounded-3xl p-5 shadow-inner">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-primary mb-4">
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
                          ? "bg-primary/50 text-white shadow-lg"
                          : "bg-white/70 dark:bg-gray-900/60 text-foreground hover:bg-primary/10 hover:text-primary"
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
                  <h2 className="text-2xl font-bold text-foreground">
                    {activeSection?.title}
                  </h2>
                  {activeSection?.description && (
                    <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                      {activeSection.description}
                    </p>
                  )}
                </div>
                <div className="relative w-full sm:w-80">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search in this category..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full rounded-xl border border-border bg-background text-foreground pl-10 pr-4 py-3 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="mt-8 bg-section border border-border dark:border-gray-800 rounded-3xl shadow-inner px-6 py-4">
                {filteredFAQs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-16">
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
