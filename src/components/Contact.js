import React from "react";

const Contact = () => {
  return (
    <div className="mt-20 min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 px-4 py-10">
      <h1 className="font-bold text-4xl text-orange-500 mb-6">Contact Us</h1>

      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <p className="text-gray-600 dark:text-gray-300 text-lg text-center mb-6">
          Have any questions or feedback? Get in touch with us!
        </p>

        {/* Contact Form */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            className="border border-gray-300 dark:border-gray-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
            placeholder="Your Name"
            required
          />
          <input
            type="email"
            className="border border-gray-300 dark:border-gray-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
            placeholder="Your Email"
            required
          />
          <input
            type="tel"
            className="border border-gray-300 dark:border-gray-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
            placeholder="Your Phone"
            required
          />
          <textarea
            className="border border-gray-300 dark:border-gray-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 col-span-1 md:col-span-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
            placeholder="Your Message"
            rows="4"
            required
          ></textarea>

          <button className="col-span-1 md:col-span-2 bg-orange-500 text-white font-semibold py-3 rounded-md hover:bg-orange-600 transition-all duration-300">
            Send Message
          </button>
        </form>
      </div>

      {/* Contact Info */}
      <div className="w-full max-w-4xl mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          QuickBite - Have a Bite
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-2">📍 Roorkee, Uttarakhand</p>
        <p className="text-gray-600 dark:text-gray-300 mb-2">📞 +91-8787952601</p>
        <p className="text-gray-600 dark:text-gray-300">📧 contact@quickbite.com</p>
      </div>

      {/* Google Map (Embed Option) */}
      <div className="w-full max-w-4xl mt-8">
      <iframe
       title="QuickBite Location - Roorkee"
       className="w-full h-64 rounded-lg shadow-lg"
       src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3463.8704693650023!2d77.8788529753662!3d29.854263974004355!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390eb3534f8b8e07%3A0x6908457c0f9dfb6d!2sRoorkee%2C%20Uttarakhand%2C%20India!5e0!3m2!1sen!2sin!4v1710412345678!5m2!1sen!2sin"
       allowFullScreen
       loading="lazy">
      </iframe>

      </div>
    </div>
  );
};

export default Contact;
