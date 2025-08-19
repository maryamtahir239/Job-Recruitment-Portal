import { createSlice, nanoid } from "@reduxjs/toolkit";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem("notifications");
    if (!raw) return { items: [], unreadCount: 0 };
    const items = JSON.parse(raw);
    const unreadCount = items.filter((n) => !n.read).length;
    return { items, unreadCount };
  } catch (e) {
    return { items: [], unreadCount: 0 };
  }
}

function saveToStorage(items) {
  try {
    localStorage.setItem("notifications", JSON.stringify(items));
  } catch (e) {
    // ignore
  }
}

const initialState = loadFromStorage();

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: {
      reducer(state, action) {
        state.items.unshift(action.payload);
        state.unreadCount = state.items.filter((n) => !n.read).length;
        saveToStorage(state.items);
      },
      prepare({ title, message, meta }) {
        return {
          payload: {
            id: nanoid(),
            title: title || "Notification",
            message,
            read: false,
            time: new Date().toISOString(),
            meta: meta || {},
          },
        };
      },
    },
    markAsRead(state, action) {
      const id = action.payload;
      const n = state.items.find((i) => i.id === id);
      if (n) n.read = true;
      state.unreadCount = state.items.filter((i) => !i.read).length;
      saveToStorage(state.items);
    },
    markAllAsRead(state) {
      state.items.forEach((i) => (i.read = true));
      state.unreadCount = 0;
      saveToStorage(state.items);
    },
    deleteAll(state) {
      state.items = [];
      state.unreadCount = 0;
      saveToStorage(state.items);
    },
  },
});

export const { addNotification, markAsRead, markAllAsRead, deleteAll } = notificationsSlice.actions;

export default notificationsSlice.reducer;


