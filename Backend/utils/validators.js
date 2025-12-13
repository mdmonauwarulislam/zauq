
import {
    ORDER_STATUS,
    COUPON_TYPES,
    PAYMENT_METHODS,
  } from "./constant.js";
  
  /**
   * Validate email format using a robust regex.
   */
  export const validateEmail = (email = "") => {
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(String(email).trim());
  };
  
  /**
   * Validate password strength.
   * Minimum: 6 characters.
   */
  export const validatePassword = (password = "") => {
    return typeof password === "string" && password.length >= 6;
  };
  
  /**
   * Validate product price.
   * Must be a positive number.
   */
  export const validatePrice = (price) => {
    const num = Number(price);
    return Number.isFinite(num) && num > 0;
  };
  
  /**
   * Validate product discount percentage.
   * Must be between 0 and 100.
   */
  export const validateDiscount = (discount) => {
    const num = Number(discount);
    return Number.isFinite(num) && num >= 0 && num <= 100;
  };
  
  /**
   * Validate stock quantity.
   * Must be an integer ≥ 0.
   */
  export const validateStock = (stock) => {
    const num = Number(stock);
    return Number.isInteger(num) && num >= 0;
  };
  
  /**
   * Validate rating.
   * Must be between 1 and 5.
   */
  export const validateRating = (rating) => {
    const num = Number(rating);
    return Number.isFinite(num) && num >= 1 && num <= 5;
  };
  
  /**
   * Validate order status using centralized constants.
   */
  export const validateOrderStatus = (status = "") => {
    return Object.values(ORDER_STATUS).includes(status);
  };
  
  /**
   * Validate coupon type.
   */
  export const validateCouponType = (type = "") => {
    return Object.values(COUPON_TYPES).includes(type);
  };
  
  /**
   * Validate payment method.
   */
  export const validatePaymentMethod = (method = "") => {
    return Object.values(PAYMENT_METHODS).includes(method);
  };
  
  /**
   * Optionally export everything as a single object.
   */
  export default {
    validateEmail,
    validatePassword,
    validatePrice,
    validateDiscount,
    validateStock,
    validateRating,
    validateOrderStatus,
    validateCouponType,
    validatePaymentMethod,
  };
  