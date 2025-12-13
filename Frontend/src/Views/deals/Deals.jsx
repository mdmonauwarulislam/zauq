import React, { useEffect, useState } from "react";
import ProductsService from "@/services/productService";

const Deals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        setLoading(true);
        const res = await ProductsService.getDeals({ page: 1, limit: 24 });
        setProducts(res?.data?.products || []);
      } catch (err) {
        console.error("Failed to load deals", err);
      } finally {
        setLoading(false);
      }
    };
    loadDeals();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Deals & Offers</h1>
      {loading ? <p>Loading...</p> : products.length === 0 ? (
        <p>No deals right now. Check back later!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p._id} className="border rounded p-2">
              <img src={p.images?.[0]} alt={p.name} className="w-full h-40 object-cover rounded" />
              <h3 className="text-sm font-semibold mt-2">{p.name}</h3>
              <div className="text-xs text-gray-600">₹{p.discountedPrice ?? p.price}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Deals;
