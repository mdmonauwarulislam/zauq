import React, { useEffect, useState } from 'react';
import ProductService from '@/services/productService';
import CloudinaryService from '@/services/cloudinaryService';
import CategoryService from '@/services/categoryService';
import { Button } from '@/components/ui/button';

const ProductForm = ({ initial = {}, onSubmit, onCancel }) => {
  const [name, setName] = useState(initial.name || '');
  const [description, setDescription] = useState(initial.description || '');
  const [brand, setBrand] = useState(initial.brand || '');
  const [category, setCategory] = useState(initial.category || '');
  const [price, setPrice] = useState(initial.price || 0);
  const [discount, setDiscount] = useState(initial.discount || 0);
  const [stock, setStock] = useState(initial.stock || 0);
  const [images, setImages] = useState(initial.images || []);
  const [tags, setTags] = useState(initial.tags?.join(',') || '');
  const [isLatest, setIsLatest] = useState(initial.isLatest || false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await CategoryService.getCategories();
        setCategories(res.data?.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Set category value when initial data changes (for editing)
  useEffect(() => {
    if (initial.category) {
      // Handle both object and string category formats
      const categoryId = typeof initial.category === 'object' ? initial.category._id : initial.category;
      setCategory(categoryId);
    }
  }, [initial.category]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await CloudinaryService.uploadImage(file);
      setImages((prev) => [...prev, res.secure_url || res.url]);
    } catch (err) {
      alert('Upload failed: ' + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  const submit = (ev) => {
    ev.preventDefault();
    onSubmit({ name, description, brand, category, price, discount, stock, images, tags: tags.split(',').map(t => t.trim()).filter(Boolean), isLatest });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 p-2 border rounded-md" />
        </div>
        <div>
          <label className="text-sm font-medium">Brand</label>
          <input value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full mt-1 p-2 border rounded-md"
            disabled={loadingCategories}
            required
          >
            <option value="">
              {loadingCategories ? 'Loading categories...' : 'Select a category'}
            </option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Price</label>
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full mt-1 p-2 border rounded-md" />
        </div>
        <div>
          <label className="text-sm font-medium">Stock</label>
          <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="w-full mt-1 p-2 border rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium">Discount (%)</label>
          <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-full mt-1 p-2 border rounded-md" />
        </div>
        <div>
          <label className="text-sm font-medium">Tags (comma separated)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isLatest} onChange={(e) => setIsLatest(e.target.checked)} />
            <span className="text-sm">Mark as Latest</span>
          </label>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Images</label>
        <div className="flex items-center gap-3 mt-1">
          <input type="file" accept="image/*" onChange={handleFile} />
          {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
        </div>
        <div className="mt-2 flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <img key={i} src={img} alt={`img-${i}`} className="h-20 object-cover rounded-md" />
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Product</Button>
      </div>
    </form>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await ProductService.getProducts({ limit: 100 });
      const productsData = res.data?.products || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error("Failed to load products:", err);
      alert('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (payload) => {
    try {
      await ProductService.createProduct(payload);
      setShowNew(false);
      load();
    } catch (err) {
      alert('Create failed: ' + (err.message || err));
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      await ProductService.updateProduct(id, payload);
      setEditing(null);
      load();
    } catch (err) {
      alert('Update failed: ' + (err.message || err));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete product?')) return;
    try {
      await ProductService.deleteProduct(id);
      load();
    } catch (err) {
      alert('Delete failed: ' + (err.message || err));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowNew(true)}>New Product</Button>
        </div>
      </div>

      {loading && <div>Loading...</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p._id} className="p-4 border rounded-md shadow-sm bg-white">
            <div className="flex items-center gap-4">
              <img src={p.images?.[0] || '/placeholder.png'} alt={p.name} className="w-20 h-20 object-cover rounded-md" />
              <div className="flex-1">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-gray-500">{p.brand} • {p.category?.name || 'No category'}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-semibold">₹{p.price}</span>
                  {p.discount > 0 && <span className="text-xs px-2 py-1 bg-yellow-100 rounded">-{p.discount}%</span>}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditing(p)}>Edit</Button>
              <Button onClick={() => handleDelete(p._id)} className="bg-red-600 text-white">Delete</Button>
            </div>
          </div>
        ))}
      </div>

      {showNew && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-md w-full max-w-3xl">
            <h3 className="text-lg font-semibold mb-4">New Product</h3>
            <ProductForm onSubmit={handleCreate} onCancel={() => setShowNew(false)} />
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-md w-full max-w-3xl">
            <h3 className="text-lg font-semibold mb-4">Edit Product</h3>
            <ProductForm initial={editing} onSubmit={(payload) => handleUpdate(editing._id, payload)} onCancel={() => setEditing(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
