import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOrder } from "../services/orderService";
import { FaArrowLeft, FaBoxOpen } from "react-icons/fa";

const STATUS_COLORS = {
  PLACED:           "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  CONFIRMED:        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  PREPARING:        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  DELIVERED:        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  CANCELLED:        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const STATUS_LABELS = {
  PLACED:           "Order Placed",
  CONFIRMED:        "Confirmed",
  PREPARING:        "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED:        "Delivered",
  CANCELLED:        "Cancelled",
};

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrder(orderId)
      .then((res) => setOrder(res.data.order || res.data))
      .catch(() => setError("Failed to load order details"))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading)
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400 text-lg animate-pulse">Loading order…</div>
      </div>
    );

  if (error || !order)
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 gap-4">
        <FaBoxOpen className="text-5xl text-gray-300 dark:text-gray-600" />
        <p className="text-red-500">{error || "Order not found"}</p>
        <Link to="/home/orders" className="text-orange-500 hover:underline text-sm">← Back to Orders</Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/home/orders" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm mb-6">
          <FaArrowLeft size={12} /> Back to Orders
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Order Details</h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <img
                src={order.restaurant?.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=80&h=80&fit=crop"}
                alt={order.restaurant?.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{order.restaurant?.name || "Restaurant"}</p>
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </div>

          {/* Items */}
          <div className="px-4 py-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Items Ordered</h3>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-5">{item.quantity}×</span>
                    <span className="text-sm text-gray-700 dark:text-gray-200">{item.menuItem?.name || "Item"}</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    ₹{Math.round((item.menuItem?.price || item.priceAtTime || 0) * item.quantity / 100)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800 dark:text-gray-100">Total</span>
              <span className="font-bold text-lg text-gray-800 dark:text-gray-100">₹{Math.round(order.totalAmount / 100)}</span>
            </div>
            {order.notes && (
              <p className="text-xs text-gray-400 mt-2">📍 {order.notes}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
