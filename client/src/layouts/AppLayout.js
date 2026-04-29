import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ChatWidget from "../components/ChatWidget";

const DEFAULT_LOCATION = { lat: 12.9716, lng: 77.5946, address: "Bengaluru, Karnataka" };

const AppLayout = () => {
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('cravon_location') || localStorage.getItem('quickbite_location');
      const parsed = saved ? JSON.parse(saved) : DEFAULT_LOCATION;
      localStorage.setItem('cravon_location', JSON.stringify(parsed));
      return parsed;
    } catch { return DEFAULT_LOCATION; }
  });

  const handleSetLocation = (loc) => {
    setLocation(loc);
    try { localStorage.setItem('cravon_location', JSON.stringify(loc)); } catch {}
  };

  return (
    <>
      <div className="app min-h-screen bg-white text-gray-900 dark:bg-gray-950">
        <Header location={location} setLocation={handleSetLocation} />
        <Outlet context={{ location, setLocation: handleSetLocation }} />
      </div>
      <Footer />
      <ChatWidget />
    </>
  );
};

export default AppLayout;