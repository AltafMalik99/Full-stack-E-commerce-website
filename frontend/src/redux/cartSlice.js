import { createSlice } from "@reduxjs/toolkit";

function loadCartFromStorage() {
  try {
    const data = localStorage.getItem("cart");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items) {
  localStorage.setItem("cart", JSON.stringify(items));
}

const initialState = {
  items: loadCartFromStorage(), // [{ id, name, price, image, quantity, stock }]
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const { id, name, price, image, stock, quantity = 1 } = action.payload;
      const existing = state.items.find((item) => item.id === id);

      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, stock ?? 99);
      } else {
        state.items.push({ id, name, price, image, stock, quantity });
      }
      saveCartToStorage(state.items);
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveCartToStorage(state.items);
    },
    increaseQuantity(state, action) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        item.quantity = Math.min(item.quantity + 1, item.stock ?? 99);
        saveCartToStorage(state.items);
      }
    },
    decreaseQuantity(state, action) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        item.quantity = Math.max(item.quantity - 1, 1);
        saveCartToStorage(state.items);
      }
    },
    clearCart(state) {
      state.items = [];
      saveCartToStorage(state.items);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export default cartSlice.reducer;
