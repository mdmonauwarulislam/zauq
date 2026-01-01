import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import HomepageService from "@/services/homepageService";
import { fetchHomepageConfig } from "@/redux/slices/homepageSlice";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle, 
  MessageCircle, 
  Tag, 
  Eye,
  EyeOff,
  Sparkles,
  Clock,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  X,
  Copy,
  Megaphone,
  Timer,
  ArrowRight,
  GripVertical,
} from "lucide-react";

const NavbarConfig = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  // Marquee Messages
  const [marqueeMessages, setMarqueeMessages] = useState([]);

  // Sale/Deals Banner
  const [saleBanner, setSaleBanner] = useState({
    message: "",
    endDate: "",
    isActive: false,
  });

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: 'error' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Auto-deactivate sale banner when end date has passed
  useEffect(() => {
    if (saleBanner.isActive && saleBanner.endDate) {
      const checkExpiry = () => {
        const now = new Date();
        const endDate = new Date(saleBanner.endDate);
        if (now >= endDate) {
          setSaleBanner(prev => ({ ...prev, isActive: false }));
          showMessage("info", "Sale banner automatically deactivated - end date has passed");
        }
      };
      
      // Check immediately
      checkExpiry();
      
      // Check every minute
      const interval = setInterval(checkExpiry, 60000);
      return () => clearInterval(interval);
    }
  }, [saleBanner.isActive, saleBanner.endDate]);

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
    setToast({ show: true, message: text, type });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        marqueeMessages: marqueeMessages.filter((msg) => msg.trim() !== ""),
        saleBanner,
      };

      await HomepageService.updateHomepageConfig(payload);
      
      // Refresh the homepage config in Redux store so changes are reflected immediately on website
      dispatch(fetchHomepageConfig());
      
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

  const duplicateMessage = (index) => {
    const messageCopy = marqueeMessages[index];
    setMarqueeMessages([...marqueeMessages.slice(0, index + 1), messageCopy, ...marqueeMessages.slice(index + 1)]);
    showMessage("success", "Message duplicated!");
  };

  // Calculate countdown
  const getCountdown = () => {
    if (!saleBanner.endDate) return null;
    const end = new Date(saleBanner.endDate);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) return { expired: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes, expired: false };
  };

  const countdown = getCountdown();

  // Stats
  const stats = {
    totalMessages: marqueeMessages.length,
    activeMessages: marqueeMessages.filter((m) => m.trim()).length,
    bannerStatus: saleBanner.isActive ? 'Active' : 'Inactive',
    daysUntilEnd: countdown && !countdown.expired ? countdown.days : 0,
  };

  // Quick templates for marquee messages
  const messageTemplates = [
    "⚡ FREE SHIPPING ON ALL ORDERS",
    "🎁 Use code SAVE20 for 20% off",
    "💰 Flash Sale - Up to 70% Off",
    "🚚 Fast Delivery Nationwide",
    "✨ New Arrivals Just Dropped",
    "🔥 Limited Time Offer",
  ];

  const addTemplate = (template) => {
    setMarqueeMessages([...marqueeMessages, template]);
    showMessage("success", "Template added!");
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 w-full bg-gray-50">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading navbar configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white rounded-xl border-2 border-brand-primary p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-primary mb-1 flex items-center gap-2">
              <Settings className="w-7 h-7" />
              Navbar Configuration
            </h1>
            <p className="text-gray-600">
              Manage marquee messages and promotional sale banner
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={loadConfig}
              variant="outline"
              disabled={loading}
              className="border-gray-300 hover:border-brand-primary hover:text-brand-primary"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold px-6"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Messages</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.totalMessages}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <MessageCircle className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{stats.activeMessages} with content</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Messages</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.activeMessages}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Megaphone className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Showing in marquee</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sale Banner</p>
              <p className={`text-2xl font-bold mt-1 ${saleBanner.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                {stats.bannerStatus}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${saleBanner.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Tag className={`w-5 h-5 ${saleBanner.isActive ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{saleBanner.isActive ? 'Visible to users' : 'Hidden'}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Days Left</p>
              <p className={`text-2xl font-bold mt-1 ${countdown?.expired ? 'text-red-600' : 'text-orange-600'}`}>
                {countdown?.expired ? 'Expired' : stats.daysUntilEnd}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${countdown?.expired ? 'bg-red-100' : 'bg-orange-100'}`}>
              <Timer className={`w-5 h-5 ${countdown?.expired ? 'text-red-600' : 'text-orange-600'}`} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {countdown?.expired ? 'Sale has ended' : saleBanner.endDate ? 'Until sale ends' : 'No end date set'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Marquee Messages Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-linear-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                  Marquee Messages
                </h2>
                <p className="text-sm text-gray-500 mt-1">Scrolling messages in the navbar bar</p>
              </div>
              <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
                {stats.activeMessages} Active
              </span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Quick Templates */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Templates</p>
              <div className="flex flex-wrap gap-2">
                {messageTemplates.slice(0, 4).map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => addTemplate(template)}
                    className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors border border-purple-200"
                  >
                    {template.slice(0, 25)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Messages List */}
            {marqueeMessages.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No messages yet</p>
                <p className="text-sm text-gray-400 mt-1">Add a message or use a template</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {marqueeMessages.map((message, index) => (
                  <div
                    key={index}
                    className="group border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-sm transition-all bg-white"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex items-center gap-1 text-gray-400 cursor-move shrink-0 mt-2">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-1.5">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <textarea
                          value={message}
                          onChange={(e) => updateMarqueeMessage(index, e.target.value)}
                          placeholder="Enter marquee message..."
                          rows="2"
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => duplicateMessage(index)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeMarqueeMessage(index)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={addMarqueeMessage}
              variant="outline"
              className="w-full border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 text-purple-600 font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Message
            </Button>

            {/* Preview */}
            {stats.activeMessages > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Live Preview</span>
                </div>
                <div className="bg-purple-950 text-white overflow-hidden py-3 rounded-lg">
                  <div className="flex animate-marquee whitespace-nowrap">
                    {marqueeMessages
                      .filter((msg) => msg.trim() !== "")
                      .map((msg, idx) => (
                        <span key={idx} className="px-8 text-sm font-medium">
                          {msg}
                        </span>
                      ))}
                    {marqueeMessages
                      .filter((msg) => msg.trim() !== "")
                      .map((msg, idx) => (
                        <span key={`dup-${idx}`} className="px-8 text-sm font-medium">
                          {msg}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Deals/Sale Banner Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-linear-to-r from-orange-50 to-red-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-orange-600" />
                  Sale / Deals Banner
                </h2>
                <p className="text-sm text-gray-500 mt-1">Promotional banner with countdown</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                saleBanner.isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {saleBanner.isActive ? (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <EyeOff className="w-3 h-3" /> Inactive
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 bg-linear-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${saleBanner.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {saleBanner.isActive ? (
                    <Eye className="w-5 h-5 text-green-600" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sale Banner Status</p>
                  <p className="text-xs text-gray-500">Toggle visibility on website</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {(saleBanner.message || saleBanner.endDate) && (
                  <button
                    onClick={() => {
                      setSaleBanner({ message: "", endDate: "", isActive: false });
                      showMessage("success", "Sale banner data cleared!");
                    }}
                    className="text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear Data
                  </button>
                )}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saleBanner.isActive}
                    onChange={(e) => setSaleBanner({ ...saleBanner, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-checked:bg-green-500 rounded-full transition-all relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-7"></div>
                </label>
              </div>
            </div>

            {/* Sale Message */}
            <div className={`transition-all ${!saleBanner.isActive && "opacity-50 pointer-events-none"}`}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Message
              </label>
              <textarea
                value={saleBanner.message}
                onChange={(e) => setSaleBanner({ ...saleBanner, message: e.target.value })}
                placeholder="e.g., DON'T MISS 70% OFF ALL SALE!"
                disabled={!saleBanner.isActive}
                rows="2"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Use compelling text with urgency</p>
            </div>

            {/* End Date */}
            <div className={`transition-all ${!saleBanner.isActive && "opacity-50 pointer-events-none"}`}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale End Date & Time
              </label>
              <input
                type="datetime-local"
                value={
                  saleBanner.endDate
                    ? new Date(saleBanner.endDate).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) => setSaleBanner({ ...saleBanner, endDate: e.target.value })}
                disabled={!saleBanner.isActive}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Timer className="w-3 h-3" />
                Countdown timer displays until this date
              </p>
            </div>

            {/* Countdown Display */}
            {saleBanner.isActive && saleBanner.endDate && countdown && (
              <div className={`p-4 rounded-xl border ${countdown.expired ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
                <p className={`text-sm font-medium mb-2 ${countdown.expired ? 'text-red-700' : 'text-orange-700'}`}>
                  {countdown.expired ? '⚠️ Sale has expired!' : '⏰ Time Remaining'}
                </p>
                {!countdown.expired && (
                  <div className="flex gap-3">
                    <div className="bg-white rounded-lg px-4 py-2 text-center border border-orange-200">
                      <p className="text-2xl font-bold text-orange-600">{countdown.days}</p>
                      <p className="text-xs text-gray-500">Days</p>
                    </div>
                    <div className="bg-white rounded-lg px-4 py-2 text-center border border-orange-200">
                      <p className="text-2xl font-bold text-orange-600">{countdown.hours}</p>
                      <p className="text-xs text-gray-500">Hours</p>
                    </div>
                    <div className="bg-white rounded-lg px-4 py-2 text-center border border-orange-200">
                      <p className="text-2xl font-bold text-orange-600">{countdown.minutes}</p>
                      <p className="text-xs text-gray-500">Mins</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Preview */}
            {saleBanner.isActive && saleBanner.message && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Live Preview</span>
                </div>
                <div
                  className="relative bg-linear-to-r from-gray-900 to-gray-800 text-white p-6 rounded-xl overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-500 rounded-full blur-3xl"></div>
                  </div>
                  <div className="relative text-center">
                    <p className="text-lg font-bold mb-2">{saleBanner.message}</p>
                    {saleBanner.endDate && !countdown?.expired && (
                      <div className="flex items-center justify-center gap-2 text-sm text-yellow-300">
                        <Clock className="w-4 h-4" />
                        <span>Ends: {new Date(saleBanner.endDate).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}</span>
                      </div>
                    )}
                    <button className="mt-3 bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 mx-auto hover:bg-gray-100 transition-colors">
                      Shop Now <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-brand-primary" />
          Pro Tips for Best Results
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <MessageCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Marquee Messages</p>
              <p className="text-xs text-gray-600">Use emojis and keep messages 40-60 characters</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
            <Tag className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Sale Banner</p>
              <p className="text-xs text-gray-600">Create urgency with "Limited Time" or "Hurry"</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Mobile Friendly</p>
              <p className="text-xs text-gray-600">Keep messages short for mobile display</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Preview First</p>
              <p className="text-xs text-gray-600">Always check preview before saving</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right">
          <div className={`${
            toast.type === 'success' 
              ? 'bg-green-600' 
              : toast.type === 'info'
              ? 'bg-blue-600'
              : 'bg-red-600'
          } text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px]`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : toast.type === 'info' ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <p className="font-medium">{toast.message}</p>
            <button
              onClick={() => setToast({ show: false, message: '', type: 'error' })}
              className="ml-auto hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarConfig;
