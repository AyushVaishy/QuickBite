import React, { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Body from "./components/Body";
import Contact from "./components/Contact";
import Error from "./components/Error";
import Help from "./components/Help";
import RestaurantMenu from './components/RestaurantMenu';
import SearchResults from './components/SearchResults';
import LandingPage from "./components/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";
import Cart from './components/Cart';

const Applayout = () => {
  // Location state for restaurants
  const [location, setLocation] = useState({
    lat: 29.8542626,
    lng: 77.8880002,
    address: "Shri Ram Pg Near Shiv Dairy Chappan Bhog, Maktulpuri, Mathura Vihar Colony, Nehru Nagar, Roorkee, Uttarakhand 247667, India",
  });

  return (
    <Provider store={appStore}>
      <div className="app min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <Header
          location={location}
          setLocation={setLocation}
        />
        <Outlet context={{ location, setLocation }} />
      </div>
      <Footer />
    </Provider>
  );
};

// ✅ Define Routes
const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/home",
    element: <ProtectedRoute><Applayout /></ProtectedRoute>,
    children:[
      {
        path: "",
        element: <Body />,
      },
      {
        path: "help",
        element: <Help />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: 'restaurants/:resId',
        element: <RestaurantMenu />,
      },
      {
        path: 'cart',
        element: <Cart />,
      },
      {
        path: 'search',
        element: <SearchResults />,
      },
    ],
    errorElement: <Error />,
  },
]);

// ✅ Export `appRouter` so it can be used in `index.js`
export default appRouter;
