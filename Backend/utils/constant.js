/**
 * ============================
 *  ORDER & PAYMENT CONSTANTS
 * ============================
 */

/** Order status lifecycle */
export const ORDER_STATUS = Object.freeze({
    PENDING: "pending",
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  });
  
  /** Payment status states */
  export const PAYMENT_STATUS = Object.freeze({
    PENDING: "pending",
    COMPLETED: "completed",
    FAILED: "failed",
  });
  
  /** Supported payment methods */
  export const PAYMENT_METHODS = Object.freeze({
    CREDIT_CARD: "credit-card",
    DEBIT_CARD: "debit-card",
    UPI: "upi",
    NET_BANKING: "net-banking",
    WALLET: "wallet",
  });
  
  /**
   * ============================
   *         USER CONSTANTS
   * ============================
   */
  
  /** Role-based access control */
  export const USER_ROLES = Object.freeze({
    USER: "user",
    ADMIN: "admin",
  });
  
  /**
   * ============================
   *        COUPON CONSTANTS
   * ============================
   */
  
  /** Types of discount coupons */
  export const COUPON_TYPES = Object.freeze({
    FLAT: "flat",
    PERCENTAGE: "percentage",
  });
  
  /**
   * ============================
   *     API RESPONSE MESSAGES
   * ============================
   */
  
  export const RESPONSE_MESSAGES = Object.freeze({
    SUCCESS: "Operation successful",
    ERROR: "An error occurred",
    NOT_FOUND: "Resource not found",
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "Access forbidden",
    INVALID_CREDENTIALS: "Invalid credentials",
    EMAIL_EXISTS: "Email already exists",
    WEAK_PASSWORD: "Password is too weak",
    TOKEN_EXPIRED: "Token has expired",
    INVALID_TOKEN: "Invalid token",
  });
  
  /**
   * ============================
   *        PAGINATION
   * ============================
   */
  
  export const PAGINATION_LIMIT = 10;
  export const DEFAULT_PAGE = 1;
  
  /**
   * ============================
   *    DEFAULT EXPORT (OPTIONAL)
   * ============================
   * Useful if you prefer importing all constants as a single object.
   */
  
  export default {
    ORDER_STATUS,
    PAYMENT_STATUS,
    PAYMENT_METHODS,
    USER_ROLES,
    COUPON_TYPES,
    RESPONSE_MESSAGES,
    PAGINATION_LIMIT,
    DEFAULT_PAGE,
  };
  