import { useEffect, useState } from 'react';
import { getRestaurant, getRestaurantMenu } from '../services/restaurantService';

const useRestaurantMenu = (resId) => {
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!resId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [resRes, menuRes] = await Promise.all([
          getRestaurant(resId),
          getRestaurantMenu(resId),
        ]);
        setRestaurant(resRes.data.restaurant || resRes.data);
        setMenu(menuRes.data.menu);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resId]);

  return { restaurant, menu, loading, error };
};

export default useRestaurantMenu;
