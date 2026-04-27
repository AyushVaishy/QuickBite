import { createSlice } from '@reduxjs/toolkit';

const MAX_NOTIFICATIONS = 20;

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],    // { id, title, message, type, orderId, read, createdAt }
    unreadCount: 0,
  },
  reducers: {
    addNotification(state, action) {
      const notification = {
        id: Date.now().toString(),
        read: false,
        createdAt: new Date().toISOString(),
        ...action.payload,
      };
      state.items.unshift(notification);
      if (state.items.length > MAX_NOTIFICATIONS) {
        state.items = state.items.slice(0, MAX_NOTIFICATIONS);
      }
      state.unreadCount = state.items.filter(n => !n.read).length;
    },
    markAllRead(state) {
      state.items.forEach(n => { n.read = true; });
      state.unreadCount = 0;
    },
    clearNotifications(state) {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markAllRead, clearNotifications } = notificationsSlice.actions;
export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export default notificationsSlice.reducer;
