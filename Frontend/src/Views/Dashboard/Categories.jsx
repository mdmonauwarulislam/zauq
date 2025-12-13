import React, { useEffect, useState } from 'react';
import CategoryService from '@/services/categoryService';
import CloudinaryService from '@/services/cloudinaryService';
import { Button } from '@/components/ui/button';

const CategoryForm = ({ initial = {}, onSubmit, onCancel }) => {
  const [name, setName] = useState(initial.name || '');
  const [description, setDescription] = useState(initial.description || '');
  const [images, setImages] = useState(initial.images || []);
  const [isFeatured, setIsFeatured] = useState(initial.isFeatured || false);
  const [displayOrder, setDisplayOrder] = useState(initial.displayOrder || 0);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (images.length >= 2) {
      alert('Maximum 2 images allowed');
      return;
    }
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

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = (ev) => {
    ev.preventDefault();
    onSubmit({ name, description, images, isFeatured, displayOrder });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="text-sm font-medium">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 p-2 border rounded-md" />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
      </div>

      <div>
        <label className="text-sm font-medium">Images (up to 2)</label>
        <div className="flex items-center gap-3 mt-1">
          <input type="file" accept="image/*" onChange={handleFile} disabled={images.length >= 2} />
          {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
        </div>
        <div className="mt-2 flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <div key={i} className="relative">
              <img src={img} alt={`category-${i}`} className="h-24 object-cover rounded-md" />
              <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600">×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          <span className="text-sm">Featured</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm">Display Order</span>
          <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} className="w-20 p-1 border rounded-md" />
        </label>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await CategoryService.getCategories();
      setCategories(res.data?.categories || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (payload) => {
    try {
      await CategoryService.createCategory(payload);
      setShowNew(false);
      load();
    } catch (err) {
      alert('Create failed: ' + (err.message || err));
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      await CategoryService.updateCategory(id, payload);
      setEditing(null);
      load();
    } catch (err) {
      alert('Update failed: ' + (err.message || err));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete category?')) return;
    try {
      await CategoryService.deleteCategory(id);
      load();
    } catch (err) {
      alert('Delete failed: ' + (err.message || err));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowNew(true)}>New Category</Button>
        </div>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c._id} className="p-4 border rounded-md shadow-sm bg-white">
            <div className="flex items-center gap-4">
              <img src={c.images?.[0] || '/placeholder.png'} alt={c.name} className="w-20 h-20 object-cover rounded-md" />
              <div className="flex-1">
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-sm text-gray-500">{c.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">Order: {c.displayOrder}</span>
                  {c.isFeatured && <span className="text-xs px-2 py-1 bg-yellow-100 rounded">Featured</span>}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditing(c)}>Edit</Button>
              <Button onClick={() => handleDelete(c._id)} className="bg-red-600 text-white">Delete</Button>
            </div>
          </div>
        ))}
      </div>

      {/* New Modal */}
      {showNew && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-md w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">New Category</h3>
            <CategoryForm onSubmit={handleCreate} onCancel={() => setShowNew(false)} />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-md w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Edit Category</h3>
            <CategoryForm initial={editing} onSubmit={(payload) => handleUpdate(editing._id, payload)} onCancel={() => setEditing(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
