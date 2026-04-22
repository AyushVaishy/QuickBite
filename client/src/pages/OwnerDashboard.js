import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyRestaurants, toggleRestaurantOpen, getRestaurantOrders } from '../services/adminService';
import toast from 'react-hot-toast';
import { FaStore, FaClipboardList, FaToggleOn, FaToggleOff, FaChartBar } from 'react-icons/fa';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  PREPARING: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const formatCurrency = (paise) =>
  '₹' + (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 });

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) {
      navigate('/');
      return;
    }
    const user = JSON.parse(stored);
    setUserData(user);
    if (user.role !== 'RESTAURANT_OWNER' && user.role !== 'ADMIN') {
      toast.error('Access denied');
      navigate('/home');
      return;
    }
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const res = await getMyRestaurants();
      setRestaurants(res.data.restaurants || []);
    } catch (err) {
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (restaurant) => {
    setToggling(restaurant.id);
    try {
      await toggleRestaurantOpen(restaurant.id);
      toast.success(`${restaurant.name} is now ${restaurant.isOpen ? 'closed' : 'open'}`);
      await fetchRestaurants();
      if (selectedRestaurant?.id === restaurant.id) {
        setSelectedRestaurant((prev) => prev ? { ...prev, isOpen: !prev.isOpen } : prev);
      }
    } catch (err) {
      toast.error('Failed to update restaurant status');
    } finally {
      setToggling(null);
    }
  };

  const handleViewOrders = async (restaurant) => {
    if (selectedRestaurant?.id === restaurant.id) {
      setSelectedRestaurant(null);
      setOrders([]);
      return;
    }
    setSelectedRestaurant(restaurant);
    setOrdersLoading(true);
    try {
      const res = await getRestaurantOrders(restaurant.id);
      setOrders(res.data.orders || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const totalOrders = restaurants.reduce((sum, r) => sum + (r._count?.orders || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-0">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/home" className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
            ← Back to App
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">🍽️ Owner Dashboard</h1>
        </div>
        {userData && (
          <span className="text-gray-600 dark:text-gray-300 font-medium">{userData.firstName || userData.name}</span>
        )}
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">My Restaurants</p>
                <p className="text-4xl font-bold mt-1">{restaurants.length}</p>
              </div>
              <FaStore className="text-5xl text-orange-200 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Orders</p>
                <p className="text-4xl font-bold mt-1">{totalOrders}</p>
              </div>
              <FaClipboardList className="text-5xl text-orange-200 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Active Restaurants</p>
                <p className="text-4xl font-bold mt-1">{restaurants.filter((r) => r.isOpen).length}</p>
              </div>
              <FaChartBar className="text-5xl text-amber-200 opacity-80" />
            </div>
          </div>
        </div>

        {/* My Restaurants */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <FaStore className="text-orange-500" /> My Restaurants
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <FaStore className="text-5xl mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">You don't own any restaurants yet</p>
              <p className="text-sm mt-1">Create a restaurant to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-600 dark:text-gray-300 font-medium">Restaurant</th>
                    <th className="text-left px-6 py-3 text-gray-600 dark:text-gray-300 font-medium">City</th>
                    <th className="text-left px-6 py-3 text-gray-600 dark:text-gray-300 font-medium">Status</th>
                    <th className="text-left px-6 py-3 text-gray-600 dark:text-gray-300 font-medium">Orders</th>
                    <th className="text-left px-6 py-3 text-gray-600 dark:text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {restaurants.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{r.name}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{r.city}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${r.isOpen ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                          {r.isOpen ? 'Open' : 'Closed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{r._count?.orders || 0}</td>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <button
                          onClick={() => handleToggle(r)}
                          disabled={toggling === r.id}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${r.isOpen ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'} disabled:opacity-50`}
                        >
                          {toggling === r.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          ) : r.isOpen ? (
                            <FaToggleOn className="text-base" />
                          ) : (
                            <FaToggleOff className="text-base" />
                          )}
                          {r.isOpen ? 'Close' : 'Open'}
                        </button>
                        <button
                          onClick={() => handleViewOrders(r)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 transition-colors"
                        >
                          <FaClipboardList />
                          {selectedRestaurant?.id === r.id ? 'Hide Orders' : 'View Orders'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Orders Panel */}
        {selectedRestaurant && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <FaClipboardList className="text-orange-500" />
                Orders — {selectedRestaurant.name}
              </h2>
              <button
                onClick={() => { setSelectedRestaurant(null); setOrders([]); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No orders yet for this restaurant
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="text-left px-6 py-3 text-gray-600 dark:text-gray-300 font-medium">Order ID</th>
                      <th className="text-left px-6 py-3 text-gray-600 dark:text-gray-300 font-medium">Customer</th>
                      <th className="text-left px-6 py-3 text-gray-600 dark:text-gray-300 font-medium">Items</th>
                      <th className="text-left px-6 py-3 text-gray-600 dark:text-gray-300 font-medium">Total</th>
                      <th className="text-left px-6 py-3 text-gray-600 dark:text-gray-300 font-medium">Status</th>
                      <th className="text-left px-6 py-3 text-gray-600 dark:text-gray-300 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-400">{o.id.slice(0, 8)}</td>
                        <td className="px-6 py-4 text-gray-800 dark:text-gray-200">{o.user?.name || '—'}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                          {o.items?.map((i) => `${i.menuItem?.name} ×${i.quantity}`).join(', ')}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{formatCurrency(o.totalAmount)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                          {new Date(o.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
