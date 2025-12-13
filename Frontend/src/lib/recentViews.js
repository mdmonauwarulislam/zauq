const KEY = "recent_views_v1";
const MAX = 8;

export const pushRecentView = (product) => {
  try {
    const raw = localStorage.getItem(KEY);
    let arr = raw ? JSON.parse(raw) : [];

    // keep only necessary fields to save space
    const item = {
      _id: product._id,
      name: product.name,
      images: product.images,
      discountedPrice: product.discountedPrice ?? product.price,
      slug: product.slug,
      ts: Date.now(),
    };

    // remove existing same id
    arr = arr.filter((p) => p._id !== item._id);
    arr.unshift(item);
    arr = arr.slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(arr));
  } catch (err) {
    // ignore localStorage errors
    console.log("recentViews push failed", err);
  }
};

export const getRecentViews = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.log("recentViews get failed", err);
    return [];
  }
};

export const clearRecentViews = () => {
  localStorage.removeItem(KEY);
};
