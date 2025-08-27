import React from "react";
import ReactDOM from "react-dom/client"; // ✅ Corrected import
import { RouterProvider } from "react-router-dom";
import appRouter from "./App"; // ✅ Import router from App.js
import "./index.css"; // ✅ Ensure styles are loaded

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <RouterProvider router={appRouter} />
  </React.StrictMode>
);
