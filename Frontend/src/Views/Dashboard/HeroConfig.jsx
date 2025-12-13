import React, { useEffect, useState } from "react";
import HomepageService from "@/services/homepageService";
import CategoryService from "@/services/categoryService";
import ProductService from "@/services/productService";
import ReviewService from "@/services/reviewService";
import CloudinaryService from "@/services/cloudinaryService";
import { Button } from "@/components/ui/button";

const limitSelection = (arr, id, limit) => {
  const has = arr.includes(id);
  if (has) return arr.filter((x) => x !== id);
  if (arr.length >= limit) return arr;
  return [...arr, id];
};

const HeroConfig = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [heroes, setHeroes] = useState([{ title: "", subtitle: "", ctaText: "", ctaLink: "", image: "" }]);
  const [featuredCollections, setFeaturedCollections] = useState([]); // array of category ids (4)
  const [mainCategories, setMainCategories] = useState([]); // array of category ids (7)
  const [latestProducts, setLatestProducts] = useState([]); // array of product ids
  const [selectedReviews, setSelectedReviews] = useState([]); // array of review ids

  // New navbar and banner fields
  const [navbarItems, setNavbarItems] = useState([
    { name: "HOME", href: "/", dropdown: false, isActive: true },
    { name: "COLLECTIONS", href: "/collections", dropdown: true, isActive: true },
    { name: "PRODUCTS", href: "/products", dropdown: true, isActive: true },
    { name: "CONTACT US", href: "/contact", dropdown: false, isActive: true },
  ]);
  const [marqueeMessages, setMarqueeMessages] = useState([]);
  const [navbarCouponText, setNavbarCouponText] = useState("");
  const [saleBanner, setSaleBanner] = useState({
    message: "",
    endDate: "",
    isActive: false,
  });

  const [allCategories, setAllCategories] = useState([]);
  const [latestCandidates, setLatestCandidates] = useState([]);
  const [featuredReviews, setFeaturedReviews] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await HomepageService.getHomepageConfig();
        const cfg = resp?.data?.config || resp || {};

        // map homepage fields
        const h = cfg.heroSection || [];
        setHeroes(h.length > 0 ? h : [{ title: "", subtitle: "", ctaText: "", ctaLink: "", image: "" }]);

        setFeaturedCollections((cfg.featuredCategories || []).map((c) => c._id || c));
        setMainCategories((cfg.mainCategories || []).map((c) => c._id || c).slice(0, 7));
        setLatestProducts((cfg.latestProducts || []).map((p) => p._id || p));
        setSelectedReviews((cfg.featuredReviews || []).map((r) => r._id || r));

        // New navbar and banner fields
        setNavbarItems(cfg.navbarItems || [
          { name: "HOME", href: "/", dropdown: false, isActive: true },
          { name: "COLLECTIONS", href: "/collections", dropdown: true, isActive: true },
          { name: "PRODUCTS", href: "/products", dropdown: true, isActive: true },
          { name: "CONTACT US", href: "/contact", dropdown: false, isActive: true },
        ]);
        setMarqueeMessages(cfg.marqueeMessages || []);
        setNavbarCouponText(cfg.navbarCouponText || "");
        setSaleBanner(cfg.saleBanner || { message: "", endDate: "", isActive: false });

        // load helpers
        const catResp = await CategoryService.getCategories();
        setAllCategories(catResp?.data?.categories || catResp || []);

        const latestResp = await ProductService.getLatestProducts(50);
        setLatestCandidates(latestResp?.data?.products || latestResp || []);

        const revResp = await ReviewService.getFeaturedReviews();
        setFeaturedReviews(revResp?.data?.reviews || revResp || []);
      } catch (err) {
        console.error(err);
        alert("Failed to load homepage config: " + (err.message || err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleImage = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await CloudinaryService.uploadImage(file);
      setHeroes((prev) => prev.map((h, i) => i === index ? { ...h, image: res.secure_url || res.url } : h));
    } catch (err) {
      alert("Image upload failed: " + (err.message || err));
    }
  };

  const addHero = () => {
    setHeroes((prev) => [...prev, { title: "", subtitle: "", ctaText: "", ctaLink: "", image: "" }]);
  };

  const removeHero = (index) => {
    if (heroes.length > 1) {
      setHeroes((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateHero = (index, field, value) => {
    setHeroes((prev) => prev.map((h, i) => i === index ? { ...h, [field]: value } : h));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        heroSection: heroes,
        featuredCategories: featuredCollections,
        mainCategories,
        latestProducts,
        featuredReviews: selectedReviews,
        navbarItems,
        marqueeMessages,
        navbarCouponText,
        saleBanner,
      };

      await HomepageService.updateHomepageConfig(payload);
      alert("Homepage updated successfully");
    } catch (err) {
      console.error(err);
      alert("Save failed: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading homepage config...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Hero & Home Content</h1>
        <div className="flex gap-2">
          <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 border rounded-md bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Hero Banner Slides</h3>
            <button onClick={addHero} className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">Add Slide</button>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {heroes.map((hero, index) => (
              <div key={index} className="p-3 border rounded bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Slide {index + 1}</span>
                  {heroes.length > 1 && (
                    <button onClick={() => removeHero(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                  )}
                </div>
                <div className="space-y-2">
                  <input value={hero.title} onChange={(e) => updateHero(index, 'title', e.target.value)} placeholder="Title" className="w-full p-2 border rounded text-sm" />
                  <input value={hero.subtitle} onChange={(e) => updateHero(index, 'subtitle', e.target.value)} placeholder="Subtitle" className="w-full p-2 border rounded text-sm" />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={hero.ctaText} onChange={(e) => updateHero(index, 'ctaText', e.target.value)} placeholder="Button Text" className="w-full p-2 border rounded text-sm" />
                    <input value={hero.ctaLink} onChange={(e) => updateHero(index, 'ctaLink', e.target.value)} placeholder="Button Link" className="w-full p-2 border rounded text-sm" />
                  </div>
                  <div>
                    <input type="file" accept="image/*" onChange={(e) => handleImage(e, index)} className="w-full text-sm" />
                    {hero.image && <img src={hero.image} alt={`hero ${index + 1}`} className="h-16 object-cover rounded mt-1" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border rounded-md bg-white">
          <h3 className="font-semibold mb-3">Featured Collections (select up to 4)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-auto">
            {allCategories.map((c) => {
              const id = c._id || c;
              const checked = featuredCollections.includes(id);
              return (
                <label key={id} className="flex items-center gap-2 p-2 border rounded">
                  <input type="checkbox" checked={checked} onChange={() => setFeaturedCollections((s) => limitSelection(s, id, 4))} />
                  <img src={c.images?.[0] || '/placeholder.png'} alt={c.name} className="w-12 h-12 object-cover rounded" />
                  <div className="truncate">{c.name}</div>
                </label>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 border rounded-md bg-white">
          <h3 className="font-semibold mb-3">Main Categories (select up to 7)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-auto">
            {allCategories.map((c) => {
              const id = c._id || c;
              const checked = mainCategories.includes(id);
              return (
                <label key={id} className="flex items-center gap-2 p-2 border rounded">
                  <input type="checkbox" checked={checked} onChange={() => setMainCategories((s) => limitSelection(s, id, 7))} />
                  <img src={c.images?.[0] || '/placeholder.png'} alt={c.name} className="w-10 h-10 object-cover rounded" />
                  <div className="truncate">{c.name}</div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="p-4 border rounded-md bg-white">
          <h3 className="font-semibold mb-3">Latest Products (select multiple)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-auto">
            {latestCandidates.map((p) => {
              const id = p._id || p;
              const checked = latestProducts.includes(id);
              return (
                <label key={id} className="flex items-center gap-2 p-2 border rounded">
                  <input type="checkbox" checked={checked} onChange={() => setLatestProducts((s) => s.includes(id) ? s.filter(x => x !== id) : [...s, id])} />
                  <img src={p.images?.[0] || '/placeholder.png'} alt={p.name} className="w-12 h-12 object-cover rounded" />
                  <div className="truncate">{p.name}</div>
                </label>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-6 p-4 border rounded-md bg-white">
        <h3 className="font-semibold mb-3">Featured Reviews (select for slider)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-auto">
          {featuredReviews.map((r) => {
            const id = r._id || r;
            const checked = selectedReviews.includes(id);
            return (
              <label key={id} className="flex items-start gap-2 p-2 border rounded">
                <input type="checkbox" checked={checked} onChange={() => setSelectedReviews((s) => s.includes(id) ? s.filter(x => x !== id) : [...s, id])} />
                <div className="flex-1">
                  <div className="font-semibold">{r.userName || r.user?.name || 'Anonymous'}</div>
                  <div className="text-sm text-gray-600">{r.text?.slice(0, 120)}</div>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      {/* New Navbar and Banner Configuration */}
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 border rounded-md bg-white">
          <h3 className="font-semibold mb-3">Navbar Items</h3>
          <div className="space-y-2">
            {navbarItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                <input
                  type="checkbox"
                  checked={item.isActive}
                  onChange={(e) => {
                    const newItems = [...navbarItems];
                    newItems[index].isActive = e.target.checked;
                    setNavbarItems(newItems);
                  }}
                />
                <input
                  value={item.name}
                  onChange={(e) => {
                    const newItems = [...navbarItems];
                    newItems[index].name = e.target.value;
                    setNavbarItems(newItems);
                  }}
                  placeholder="Name"
                  className="flex-1 p-1 border rounded text-sm"
                />
                <input
                  value={item.href}
                  onChange={(e) => {
                    const newItems = [...navbarItems];
                    newItems[index].href = e.target.value;
                    setNavbarItems(newItems);
                  }}
                  placeholder="URL"
                  className="flex-1 p-1 border rounded text-sm"
                />
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={item.dropdown}
                    onChange={(e) => {
                      const newItems = [...navbarItems];
                      newItems[index].dropdown = e.target.checked;
                      setNavbarItems(newItems);
                    }}
                  />
                  Dropdown
                </label>
                <button
                  onClick={() => {
                    const newItems = navbarItems.filter((_, i) => i !== index);
                    setNavbarItems(newItems);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => setNavbarItems([...navbarItems, { name: "", href: "", dropdown: false, isActive: true }])}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Add Navbar Item
            </button>
          </div>
        </div>

        <div className="p-4 border rounded-md bg-white">
          <h3 className="font-semibold mb-3">Marquee Messages</h3>
          <div className="space-y-2">
            {marqueeMessages.map((message, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  value={message}
                  onChange={(e) => {
                    const newMessages = [...marqueeMessages];
                    newMessages[index] = e.target.value;
                    setMarqueeMessages(newMessages);
                  }}
                  placeholder="Message"
                  className="flex-1 p-2 border rounded text-sm"
                />
                <button
                  onClick={() => {
                    const newMessages = marqueeMessages.filter((_, i) => i !== index);
                    setMarqueeMessages(newMessages);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => setMarqueeMessages([...marqueeMessages, ""])}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Add Message
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 border rounded-md bg-white">
          <h3 className="font-semibold mb-3">Navbar Coupon Text</h3>
          <input
            value={navbarCouponText}
            onChange={(e) => setNavbarCouponText(e.target.value)}
            placeholder="Enter coupon text for top navbar"
            className="w-full p-2 border rounded text-sm"
          />
        </div>

        <div className="p-4 border rounded-md bg-white">
          <h3 className="font-semibold mb-3">Sale Banner</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={saleBanner.isActive}
                onChange={(e) => setSaleBanner({ ...saleBanner, isActive: e.target.checked })}
              />
              Enable Sale Banner
            </label>
            <input
              value={saleBanner.message}
              onChange={(e) => setSaleBanner({ ...saleBanner, message: e.target.value })}
              placeholder="Sale message"
              className="w-full p-2 border rounded text-sm"
              disabled={!saleBanner.isActive}
            />
            <input
              type="datetime-local"
              value={saleBanner.endDate ? new Date(saleBanner.endDate).toISOString().slice(0, 16) : ""}
              onChange={(e) => setSaleBanner({ ...saleBanner, endDate: e.target.value })}
              className="w-full p-2 border rounded text-sm"
              disabled={!saleBanner.isActive}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroConfig;
