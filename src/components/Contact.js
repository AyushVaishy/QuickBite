import React, { useState } from "react";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaClock,
  FaWhatsapp,
  FaMapMarkerAlt,
} from "react-icons/fa";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mananaoj"; // replace with your own Formspree form ID

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!FORMSPREE_ENDPOINT) {
      setSubmitError("Form submission endpoint is not configured.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to submit the form right now. Please try again later.");
      }

      setSubmitSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      setSubmitError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-20 min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-2xl px-8 md:px-16 py-12 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mb-4">
            <FaWhatsapp className="text-base" />
            We respond within 1 business day
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Hungry for answers? Let’s connect.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Tell us how we can help and our support team will reach out with lightning-fast solutions.
          </p>
        </div>

        {/* Status Banner */}
        <div className="mt-8 bg-orange-500 text-white rounded-3xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <div className="flex-1 text-center md:text-left space-y-2">
            <p className="uppercase tracking-wider text-xs font-semibold text-orange-200">
              QuickBite Cloud Kitchen Update
            </p>
            <h2 className="text-2xl md:text-3xl font-bold leading-snug">
              We’re live as a delivery-only cloud kitchen. Dine-in experience launching soon!
            </h2>
            <p className="text-sm md:text-base text-orange-100">
              Order online to enjoy handcrafted meals at home. Drop your number if you want to be notified when our
              physical kitchen opens its doors for walk-ins.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 border border-white/30 rounded-2xl px-5 py-4 text-center">
            <span className="text-sm uppercase text-orange-200 font-semibold">Service Hours</span>
            <span className="text-2xl font-extrabold">11 AM – 11 PM</span>
            <span className="text-xs tracking-wide text-orange-100">7 days a week</span>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 sm:p-10 border border-orange-100 dark:border-gray-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Send us a message
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Share your cravings, feedback, or partnership ideas. We’ll circle back before your next meal!
            </p>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                  placeholder="+91 XXX XXX XXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="message" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  How can we delight you today?
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 h-36 resize-none"
                  placeholder="Tell us about your request, feedback, or collaboration idea..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              {submitSuccess && (
                <div className="md:col-span-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-3 text-sm font-medium">
                  Thank you! We’ve received your message and will reach out shortly.
                </div>
              )}
              {submitError && (
                <div className="md:col-span-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 px-4 py-3 text-sm font-medium">
                  {submitError}
                </div>
              )}

              <div className="md:col-span-2 flex flex-wrap items-center gap-4">
                <button
                  className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send message"}
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Prefer WhatsApp? Ping us at <span className="font-semibold text-orange-600 dark:text-orange-400">+91 87879 52601</span>
                </p>
              </div>
            </form>
          </div>

          {/* Info Column */}
          <aside className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 border border-orange-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Concierge Team
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Our culinary experts and customer champions are on standby to make every QuickBite experience memorable.
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="p-3 rounded-2xl bg-orange-100 text-orange-600"><FaPhoneAlt /></span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Order hotline</p>
                    <p className="font-semibold text-gray-900 dark:text-white">+91 87879 52601</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="p-3 rounded-2xl bg-orange-100 text-orange-600"><FaEnvelope /></span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900 dark:text-white">contact@quickbite.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="p-3 rounded-2xl bg-orange-100 text-orange-600"><FaClock /></span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Response window</p>
                    <p className="font-semibold text-gray-900 dark:text-white">24 hours or sooner</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 border border-orange-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Where we serve today
              </h3>
              <div className="flex items-start gap-3">
                <span className="p-3 rounded-2xl bg-orange-100 text-orange-600"><FaMapMarkerAlt /></span>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>Roorkee & surrounding neighborhoods.</p>
                  <p>We’re expanding delivery zones across Uttarakhand very soon.</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-semibold mb-3">Be first to taste the dine-in menu</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Leave a note in your message if you’d like early access invites when our cloud kitchen opens its doors for guests.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Contact;
