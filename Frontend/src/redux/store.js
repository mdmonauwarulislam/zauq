import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import homepageSlice from "./slices/homepageSlice";
import wishlistSlice from "./slices/wishlistSlice";
import cartSlice from "./slices/cartSlice";

const store = configureStore({
  reducer: {
    auth: authSlice,
    homepage: homepageSlice,
    wishlist: wishlistSlice,
    cart: cartSlice,
  },
});

export default store;
