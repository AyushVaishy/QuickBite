import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import RestaurantMenuPage from "./pages/RestaurantMenuPage";
import CartPage from "./pages/CartPage";
import ContactPage from "./pages/ContactPage";
import HelpPage from "./pages/HelpPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Error from "./components/Error";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminPanel from "./pages/AdminPanel";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/owner",
    element: <OwnerDashboard />,
  },
  {
    path: "/admin",
    element: <AdminPanel />,
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <Error />,
    children: [
      { path: "", element: <HomePage /> },
      { path: "help", element: <HelpPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "restaurants/:resId", element: <RestaurantMenuPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "search", element: <SearchResultsPage /> },
    ],
  },
]);

export default appRouter;
