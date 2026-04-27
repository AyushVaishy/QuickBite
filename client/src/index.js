import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import appStore from "./store/appStore";
import appRouter from "./App";
import { setCredentials } from "./store/authSlice";
import { getProfile } from "./services/authService";
import "./index.css";

// Restore auth session before first render so role-based routes have user info
const token = localStorage.getItem("accessToken");
if (token) {
  getProfile()
    .then((res) => {
      const user = res.data.user || res.data;
      appStore.dispatch(setCredentials({ user, accessToken: token }));
      localStorage.setItem("userData", JSON.stringify({ firstName: user.name, ...user }));
    })
    .catch(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
    });
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
    <Provider store={appStore}>
      <RouterProvider router={appRouter} />
    </Provider>
  </React.StrictMode>
);
