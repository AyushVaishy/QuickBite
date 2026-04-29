import React, { useState } from "react";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaClock,
  FaWhatsapp,
  FaMapMarkerAlt,
} from "react-icons/fa";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mananaoj"; // replace with your own Formspree form ID

const ContactPage = () => {
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
    <div className="min-h-screen">
      <div className="w-full px-6 md:px-8 py-6 md:py-10">
        
        {/* Hero */}
        <div className="text-center pt-2 pb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF5A5F]/10 text-[#FF5A5F] text-sm font-bold mb-4">
            <FaWhatsapp className="text-base" />
            We respond within 1 business day
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Hungry for answers? Let’s connect.
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Tell us how we can help and our support team will reach out with lightning-fast solutions.
          </p>
        </div>

        {/* Status Banner */}
        <div className="mt-6 bg-[#FF5A5F] text-white rounded-3xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <div className="flex-1 text-center md:text-left space-y-2">
            <p className="uppercase tracking-wider text-xs font-bold text-white/80">
              Cravon Cloud Kitchen Update
            </p>
            <h2 className="text-xl md:text-2xl font-extrabold leading-snug">
              We’re live as a delivery-only cloud kitchen. Dine-in experience launching soon!
            </h2>
            <p className="text-sm md:text-base text-white/90 font-medium">
              Order online to enjoy handcrafted meals at home. Drop your number if you want to be notified when our
              physical kitchen opens its doors for walk-ins.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 bg-black/10 backdrop-blur-md rounded-2xl px-6 py-5 text-center">
            <span className="text-sm uppercase text-white/80 font-bold tracking-wider">Service Hours</span>
            <span className="text-2xl font-extrabold">11 AM – 11 PM</span>
            <span className="text-xs font-medium tracking-wide text-white/90">7 days a week</span>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2 rounded-3xl bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl shadow-sm border border-white/60 dark:border-white/5 p-6 sm:p-10">
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
              Send us a message
            </h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
              Share your cravings, feedback, or partnership ideas. We’ll circle back before your next meal!
            </p>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-[13px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-[#FF5A5F]/30 focus:border-[#FF5A5F] bg-white/80 dark:bg-black/20 text-gray-900 dark:text-white font-medium outline-none transition-all"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-[13px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-[#FF5A5F]/30 focus:border-[#FF5A5F] bg-white/80 dark:bg-black/20 text-gray-900 dark:text-white font-medium outline-none transition-all"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-[13px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-[#FF5A5F]/30 focus:border-[#FF5A5F] bg-white/80 dark:bg-black/20 text-gray-900 dark:text-white font-medium outline-none transition-all"
                  placeholder="+91 XXX XXX XXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="message" className="text-[13px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  How can we delight you today?
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-[#FF5A5F]/30 focus:border-[#FF5A5F] bg-white/80 dark:bg-black/20 text-gray-900 dark:text-white font-medium outline-none transition-all h-36 resize-none"
                  placeholder="Tell us about your request, feedback, or collaboration idea..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              {submitSuccess && (
                <div className="md:col-span-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-3 text-sm font-bold">
                  Thank you! We’ve received your message and will reach out shortly.
                </div>
              )}
              {submitError && (
                <div className="md:col-span-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 px-4 py-3 text-sm font-bold">
                  {submitError}
                </div>
              )}

              <div className="md:col-span-2 flex flex-wrap items-center gap-6 mt-2">
                <button
                  className="bg-[#FF5A5F] hover:bg-[#E0484D] text-white font-bold px-8 py-3 rounded-full shadow-md shadow-[#FF5A5F]/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send message"}
                </button>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Prefer WhatsApp? Ping us at <span className="font-bold text-[#FF5A5F]">+91 87879 52601</span>
                </p>
              </div>
            </form>
          </div>

          {/* Info Column */}
          <aside className="space-y-6">
            <div className="rounded-3xl bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl shadow-sm border border-white/60 dark:border-white/5 p-6">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-3">
                Concierge Team
              </h3>
              <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Our culinary experts and customer champions are on standby to make every Cravon experience memorable.
              </p>
              <div className="mt-6 space-y-5">
                <div className="flex items-center gap-4">
                  <span className="p-3 rounded-xl bg-[#FF5A5F]/10 text-[#FF5A5F]"><FaPhoneAlt size={18} /></span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Order hotline</p>
                    <p className="text-[14px] font-bold text-gray-900 dark:text-white">+91 87879 52601</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="p-3 rounded-xl bg-[#FF5A5F]/10 text-[#FF5A5F]"><FaEnvelope size={18} /></span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Email</p>
                    <p className="text-[14px] font-bold text-gray-900 dark:text-white">contact@cravon.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="p-3 rounded-xl bg-[#FF5A5F]/10 text-[#FF5A5F]"><FaClock size={18} /></span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Response window</p>
                    <p className="text-[14px] font-bold text-gray-900 dark:text-white">24 hours or sooner</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-xl shadow-sm border border-white/60 dark:border-white/5 p-6">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">
                Where we serve today
              </h3>
              <div className="flex items-start gap-4">
                <span className="p-3 rounded-xl bg-[#FF5A5F]/10 text-[#FF5A5F] shrink-0"><FaMapMarkerAlt size={18} /></span>
                <div className="text-[13px] font-medium text-gray-600 dark:text-gray-400 space-y-1 mt-1">
                  <p className="text-gray-900 dark:text-white font-bold text-[14px]">Roorkee & surrounding</p>
                  <p>We’re expanding delivery zones across Uttarakhand very soon.</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] text-white shadow-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <FaMapMarkerAlt size={80} />
              </div>
              <h3 className="text-lg font-extrabold mb-2 relative z-10">Be first to taste</h3>
              <p className="text-[13px] text-white/80 font-medium leading-relaxed relative z-10">
                Leave a note in your message if you’d like early access invites when our cloud kitchen opens its doors for guests.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
