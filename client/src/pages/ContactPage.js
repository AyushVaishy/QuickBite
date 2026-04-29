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
    <div className="mt-20 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-2xl px-8 md:px-16 py-12 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <FaWhatsapp className="text-base" />
            We respond within 1 business day
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
            Hungry for answers? Let’s connect.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Tell us how we can help and our support team will reach out with lightning-fast solutions.
          </p>
        </div>

        {/* Status Banner */}
        <div className="mt-8 bg-primary/50 text-white rounded-3xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <div className="flex-1 text-center md:text-left space-y-2">
            <p className="uppercase tracking-wider text-xs font-semibold text-primary/70">
              Cravon Cloud Kitchen Update
            </p>
            <h2 className="text-2xl md:text-3xl font-bold leading-snug">
              We’re live as a delivery-only cloud kitchen. Dine-in experience launching soon!
            </h2>
            <p className="text-sm md:text-base text-primary/80">
              Order online to enjoy handcrafted meals at home. Drop your number if you want to be notified when our
              physical kitchen opens its doors for walk-ins.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 border border-white/30 rounded-2xl px-5 py-4 text-center">
            <span className="text-sm uppercase text-primary/70 font-semibold">Service Hours</span>
            <span className="text-2xl font-extrabold">11 AM – 11 PM</span>
            <span className="text-xs tracking-wide text-primary/80">7 days a week</span>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Form */}
          <div className="lg:col-span-2 bg-background rounded-3xl shadow-2xl p-6 sm:p-10 border border-border dark:border-gray-800">
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Send us a message
            </h3>
            <p className="text-muted-foreground mb-8">
              Share your cravings, feedback, or partnership ideas. We’ll circle back before your next meal!
            </p>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-semibold text-foreground dark:text-muted-foreground">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="border border-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-semibold text-foreground dark:text-muted-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="border border-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-sm font-semibold text-foreground dark:text-muted-foreground">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  className="border border-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  placeholder="+91 XXX XXX XXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="message" className="text-sm font-semibold text-foreground dark:text-muted-foreground">
                  How can we delight you today?
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="border border-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground h-36 resize-none"
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
                  className="bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send message"}
                </button>
                <p className="text-sm text-muted-foreground">
                  Prefer WhatsApp? Ping us at <span className="font-semibold text-primary">+91 87879 52601</span>
                </p>
              </div>
            </form>
          </div>

          {/* Info Column */}
          <aside className="space-y-6">
            <div className="bg-background rounded-3xl shadow-2xl p-6 border border-border dark:border-gray-800">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Concierge Team
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our culinary experts and customer champions are on standby to make every Cravon experience memorable.
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="p-3 rounded-2xl bg-primary/10 text-primary"><FaPhoneAlt /></span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Order hotline</p>
                    <p className="font-semibold text-foreground">+91 87879 52601</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="p-3 rounded-2xl bg-primary/10 text-primary"><FaEnvelope /></span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                    <p className="font-semibold text-foreground">contact@cravon.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="p-3 rounded-2xl bg-primary/10 text-primary"><FaClock /></span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Response window</p>
                    <p className="font-semibold text-foreground">24 hours or sooner</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-3xl shadow-xl p-6 border border-border dark:border-gray-800">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Where we serve today
              </h3>
              <div className="flex items-start gap-3">
                <span className="p-3 rounded-2xl bg-primary/10 text-primary"><FaMapMarkerAlt /></span>
                <div className="text-sm text-muted-foreground">
                  <p>Roorkee & surrounding neighborhoods.</p>
                  <p>We’re expanding delivery zones across Uttarakhand very soon.</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-semibold mb-3">Be first to taste the dine-in menu</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
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
