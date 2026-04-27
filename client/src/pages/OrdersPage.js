import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getOrders, cancelOrder } from "../services/orderService";
import { addItem, clearCart } from "../store/cartSlice";
import { FaBoxOpen, FaUtensils } from "react-icons/fa";
import toast from "react-hot-toast";

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

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    getOrders()
      .then((res) => setOrders(res.data.orders || []))
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const handleReorder = (order) => {
    dispatch(clearCart());
    order.items.forEach((item) => {
      if (item.menuItem) {
        dispatch(addItem({
          id: item.menuItemId,
          name: item.menuItem.name,
          price: item.menuItem.price || item.priceAtTime,
          isVeg: item.menuItem.isVeg ?? true,
          restaurantId: order.restaurantId,
          restaurantName: order.restaurant?.name || '',
          imageUrl: item.menuItem.imageUrl || '',
          quantity: item.quantity,
        }));
      }
    });
    toast.success('Items added to cart!');
    navigate('/home/cart');
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(orderId);
    try {
      await cancelOrder(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel order');
    }
    setCancelling(null);
  };

  if (loading)
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400 text-lg animate-pulse">Loading orders…</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-red-500">{error}</p>
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 flex flex-col items-center justify-center px-4">
        <FaBoxOpen className="text-6xl text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">No orders yet</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Place your first order and track it here.</p>
        <Link to="/home" className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition flex items-center gap-2">
          <FaUtensils /> Browse Restaurants
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Your Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      order.restaurant?.imageUrl ||
                      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=80&h=80&fit=crop"
                    }
                    alt={order.restaurant?.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                      {order.restaurant?.name || "Restaurant"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>

              {/* Items */}
              <div className="px-4 py-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {order.items
                    .map((i) => `${i.menuItem?.name || "Item"} × ${i.quantity}`)
                    .join(", ")}
                </p>
                {order.notes && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">📍 {order.notes}</p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-750">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  ₹{Math.round(order.totalAmount / 100)}
                </span>
                <div className="flex items-center gap-2">
                  {['PLACED', 'CONFIRMED'].includes(order.status) && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={cancelling === order.id}
                      className="text-xs text-red-500 hover:text-red-700 border border-red-300 hover:border-red-500 px-3 py-1.5 rounded-lg font-semibold transition disabled:opacity-50"
                    >
                      {cancelling === order.id ? 'Cancelling…' : 'Cancel'}
                    </button>
                  )}
                  <Link
                    to={`/home/orders/${order.id}`}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleReorder(order)}
                    className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-semibold transition"
                  >
                    Reorder
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
