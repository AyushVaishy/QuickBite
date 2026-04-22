import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import { getProfile } from "../services/authService";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AppLayout = () => {
  const dispatch = useDispatch();
  const [location, setLocation] = useState({
    lat: 29.8542626,
    lng: 77.8880002,
    address:
      "Shri Ram Pg Near Shiv Dairy Chappan Bhog, Maktulpuri, Mathura Vihar Colony, Nehru Nagar, Roorkee, Uttarakhand 247667, India",
  });

  // Restore auth session on page refresh
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getProfile()
        .then((res) => {
          const user = res.data.user || res.data;
          dispatch(setCredentials({ user, accessToken: token }));
          // Keep localStorage.userData in sync for Header compatibility
          localStorage.setItem(
            "userData",
            JSON.stringify({ firstName: user.name, ...user })
          );
        })
        .catch(() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userData");
        });
    }
  }, [dispatch]);

  return (
    <>
      <div className="app min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <Header location={location} setLocation={setLocation} />
        <Outlet context={{ location, setLocation }} />
      </div>
      <Footer />
    </>
  );
};

export default AppLayout;
