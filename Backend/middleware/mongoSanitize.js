/**
 * Recursively remove keys starting with '$' or containing '.' from an object.
 * This is a standard defense against MongoDB query selector injection.
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  // If it's an array, sanitize each element
  if (Array.isArray(obj)) {
    obj.forEach((item) => sanitizeObject(item));
    return obj;
  }

  // If it's a plain object, iterate keys
  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    const illegalKey = key.startsWith("$") || key.includes(".");

    if (illegalKey) {
      delete obj[key];
      return;
    }

    if (value && typeof value === "object") {
      sanitizeObject(value);
    }
  });

  return obj;
};

/**
 * Express middleware: sanitize req.body, req.query, req.params IN PLACE.
 * Important: we do NOT reassign req.query/req.body; we only mutate.
 */
export const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  return next();
};
