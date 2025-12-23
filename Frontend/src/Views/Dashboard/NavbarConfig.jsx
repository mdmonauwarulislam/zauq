import React, { useEffect, useState } from "react";
import HomepageService from "@/services/homepageService";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle, 
  MessageCircle, 
  Tag, 
  Calendar,
  Eye,
  EyeOff,
  Sparkles,
  Clock,
  TrendingUp
} from "lucide-react";

const NavbarConfig = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Marquee Messages
  const [marqueeMessages, setMarqueeMessages] = useState([]);

  // Sale/Deals Banner
  const [saleBanner, setSaleBanner] = useState({
    message: "",
    endDate: "",
    isActive: false,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const resp = await HomepageService.getHomepageConfig();
      const cfg = resp?.data?.config || resp || {};

      setMarqueeMessages(cfg.marqueeMessages || []);
      setSaleBanner(
        cfg.saleBanner || { message: "", endDate: "", isActive: false }
      );
    } catch (err) {
      console.error(err);
      showMessage("error", "Failed to load configuration: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        marqueeMessages: marqueeMessages.filter((msg) => msg.trim() !== ""),
        saleBanner,
      };

      await HomepageService.updateHomepageConfig(payload);
      showMessage("success", "Navbar configuration updated successfully!");
    } catch (err) {
      console.error(err);
      showMessage("error", "Save failed: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const addMarqueeMessage = () => {
    setMarqueeMessages([...marqueeMessages, ""]);
  };

  const updateMarqueeMessage = (index, value) => {
    const newMessages = [...marqueeMessages];
    newMessages[index] = value;
    setMarqueeMessages(newMessages);
  };

  const removeMarqueeMessage = (index) => {
    const newMessages = marqueeMessages.filter((_, i) => i !== index);
    setMarqueeMessages(newMessages);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading configuration...</div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="bg-linear-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            Navbar Configuration
          </h1>
          <p className="text-gray-600 mt-2 text-base">
            Manage marquee messages and deals banner for your navbar
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-6 text-base font-semibold bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 cursor-pointer"
        >
          <Save className="w-5 h-5" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border-2 border-green-200"
              : "bg-red-50 text-red-800 border-2 border-red-200"
          }`}
        >
          <AlertCircle className="w-6 h-6" />
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Marquee Messages Section */}
        <section className="bg-white border-2 rounded-xl shadow-lg">
          <div className="p-6 border-b bg-linear-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Marquee Messages
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              Scrolling messages in the purple bar below navbar
            </p>
            <div className="mt-3">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {marqueeMessages.filter((m) => m.trim()).length} Active Messages
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {marqueeMessages.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No messages yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Click "Add Message" to create one
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {marqueeMessages.map((message, index) => (
                  <div
                    key={index}
                    className="group relative bg-linear-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0 mt-1">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={message}
                          onChange={(e) => updateMarqueeMessage(index, e.target.value)}
                          placeholder="Enter marquee message (e.g., ⚡ FREE SHIPPING ON ALL ORDERS)"
                          rows="2"
                          className="w-full p-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none font-medium"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeMarqueeMessage(index)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={addMarqueeMessage}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 mt-4 py-6 border-2 border-purple-300 hover:bg-purple-50 hover:border-purple-400 text-purple-600 font-semibold cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Add Marquee Message
            </Button>

            {/* Preview */}
            {marqueeMessages.filter((m) => m.trim()).length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Live Preview
                  </h3>
                </div>
                <div className="bg-purple-950 text-white overflow-hidden py-4 rounded-lg shadow-inner">
                  <div className="flex animate-marquee whitespace-nowrap">
                    {marqueeMessages
                      .filter((msg) => msg.trim() !== "")
                      .map((msg, idx) => (
                        <span key={idx} className="px-8 text-sm font-medium">
                          {msg}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Deals/Sale Banner Section */}
        <section className="bg-white border-2 rounded-xl shadow-lg">
          <div className="p-6 border-b bg-linear-to-r from-orange-50 to-red-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Tag className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Deals / Sale Banner
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              Promotional banner with countdown timer
            </p>
            <div className="mt-3">
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
                  saleBanner.isActive
                    ? "text-green-700 bg-green-100"
                    : "text-gray-600 bg-gray-100"
                }`}
              >
                {saleBanner.isActive ? (
                  <>
                    <Eye className="w-3 h-3" />
                    Active
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3 h-3" />
                    Inactive
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center gap-3 p-4 bg-linear-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-200">
              <div className="relative">
                <input
                  type="checkbox"
                  id="saleActive"
                  checked={saleBanner.isActive}
                  onChange={(e) =>
                    setSaleBanner({ ...saleBanner, isActive: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <label
                  htmlFor="saleActive"
                  className="w-14 h-7 bg-gray-300 peer-checked:bg-green-500 rounded-full cursor-pointer transition-all relative block peer-focus:ring-2 peer-focus:ring-green-400"
                >
                  <span className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-7" />
                </label>
              </div>
              <label htmlFor="saleActive" className="font-bold text-gray-800 cursor-pointer">
                Enable Sale Banner
              </label>
            </div>

            {/* Sale Message */}
            <div className={`transition-all ${!saleBanner.isActive && "opacity-50"}`}>
              <label className="block text-sm font-bold text-gray-700 mb-2 items-center gap-2">
                <MessageCircle className="w-4 h-4 text-orange-600" />
                Sale Message
              </label>
              <textarea
                value={saleBanner.message}
                onChange={(e) =>
                  setSaleBanner({ ...saleBanner, message: e.target.value })
                }
                placeholder="Enter sale message (e.g., DON'T MISS 70% OFF ALL SALE!)"
                disabled={!saleBanner.isActive}
                rows="3"
                className="w-full p-4 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed font-medium resize-none"
              />
            </div>

            {/* End Date */}
            <div className={`transition-all ${!saleBanner.isActive && "opacity-50"}`}>
              <label className="block text-sm font-bold text-gray-700 mb-2 items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-600" />
                Sale End Date & Time
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={
                    saleBanner.endDate
                      ? new Date(saleBanner.endDate).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setSaleBanner({ ...saleBanner, endDate: e.target.value })
                  }
                  disabled={!saleBanner.isActive}
                  className="w-full p-4 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed font-medium"
                />
                {/* <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" /> */}
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Countdown timer will display until this date
              </p>
            </div>

            {/* Preview */}
            {saleBanner.isActive && saleBanner.message && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Live Preview
                </h3>
                <div
                  className="bg-black text-white p-8 rounded-xl shadow-lg"
                  style={{
                    backgroundImage:
                      'url("https://imgs.search.brave.com/2oNgA6Q7ynZOmLW_LQPcMwX4QefVm29VzZWeSPzzmo8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/dGhlZmFzaGlvbnN0/YXRpb24uaW4vd3At/Y29udGVudC91cGxv/YWRzLzIwMjUvMTEv/emFyYS1zaGFoamFo/YW4tMTYwMHg2MjUu/d2VicA")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="text-center backdrop-blur-sm bg-black/30 p-4 rounded-lg">
                    <p className="text-base font-bold mb-2">{saleBanner.message}</p>
                    {saleBanner.endDate && (
                      <div className="flex items-center justify-center gap-2 text-xs text-yellow-300 font-medium">
                        <Clock className="w-3 h-3" />
                        Ends:{" "}
                        {new Date(saleBanner.endDate).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Tips Section */}
      <section className="mt-6 bg-linear-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg">
          <div className="bg-blue-200 p-2 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-700" />
          </div>
          Pro Tips for Best Results
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-900 mb-2">📢 Marquee Messages</p>
            <p className="text-sm text-blue-800">
              Use emojis (⚡💰🎁) and keep messages concise. Aim for 40-60 characters for optimal readability.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-900 mb-2">🏷️ Sale Banner</p>
            <p className="text-sm text-blue-800">
              Create urgency with clear messaging and countdown timers. Use action words like "Limited Time" or "Hurry".
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-900 mb-2">📱 Mobile View</p>
            <p className="text-sm text-blue-800">
              Keep messages short enough to display well on mobile devices. Test on different screen sizes.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-900 mb-2">✅ Testing</p>
            <p className="text-sm text-blue-800">
              Always preview your changes before saving. Check how they appear on the actual website.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NavbarConfig;
