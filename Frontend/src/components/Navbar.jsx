import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Star,
  ShoppingBag,
  X,
  TextAlignStart,
  User,
  ChevronDown,
  DeleteIcon,
  PlusIcon,
  MinusIcon,
  Delete,
  Trash2,
} from "lucide-react";
import { FaLongArrowAltRight } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import MarqueeBar from "./MarqueeBar";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/redux/slices/authSlice";
import { selectNavbarItems, selectMarqueeMessages, selectSaleBanner, fetchHomepageConfig } from "@/redux/slices/homepageSlice";
import { fetchWishlist, removeFromWishlist } from "@/redux/slices/wishlistSlice";
import { fetchCart, removeFromCart, updateCartItem } from "@/redux/slices/cartSlice";
import HomepageService from "@/services/homepageService";

// --- Configuration Data ---
// navItems now come from Redux via selectNavbarItems

// Default messages in case backend is empty
const DEFAULT_MARQUEE_MESSAGES = [""
];

const TimerSegment = ({ value, label }) => (
  <div className="flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-white shadow-sm rounded-full">
    <span className="text-[10px] sm:text-xs lg:text-lg font-extrabold text-black leading-none">
      {value}
    </span>
    <span className="text-[7px] sm:text-[9px] lg:text-[10px] font-medium text-gray-700 uppercase leading-none mt-0.5">
      {label}
    </span>
  </div>
);

// --- NavButtonToggle (unauthenticated desktop) ---
const NavButtonToggle = () => {
  const [active, setActive] = useState("login");
  const [position, setPosition] = useState({ left: 0, width: 0 });
  const loginRef = useRef(null);
  const registerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (loginRef.current) {
      const timer = setTimeout(() => {
        setPosition({
          left: loginRef.current.offsetLeft - 4,
          width: loginRef.current.offsetWidth,
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const targetRef = active === "login" ? loginRef : registerRef;
    if (targetRef.current && containerRef.current) {
      const targetElement = targetRef.current;
      const containerLeft = containerRef.current.getBoundingClientRect().left;
      const targetLeft = targetElement.getBoundingClientRect().left;

      setPosition({
        left: targetLeft - containerLeft,
        width: targetElement.offsetWidth,
      });
    }
  }, [active]);

  const handleMouseEnter = (button) => {
    setActive(button);
  };

  const handleMouseLeave = () => {
    // keep last hovered
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-2 bg-gray-300 rounded-full p-2"
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`absolute top-2 bottom-2 bg-white rounded-full transition-all duration-300 ease-out shadow-md ${
          active === "login" ? "shadow-lg" : ""
        }`}
        style={{ left: position.left, width: position.width }}
      ></div>

      <Button
        asChild
        ref={loginRef}
        className={`rounded-full text-sm font-semibold h-auto px-4 py-2 duration-300 z-10 transition-colors 
          ${active === "login" ? "text-black" : "text-gray-600 hover:text-black"}
          bg-transparent hover:bg-transparent`}
        onMouseEnter={() => handleMouseEnter("login")}
      >
        <Link to="/login">Login</Link>
      </Button>

      <Button
        asChild
        ref={registerRef}
        className={`rounded-full text-sm font-semibold h-auto px-4 py-2 duration-300 z-10 transition-colors 
          ${
            active === "register"
              ? "text-black"
              : "text-gray-600 hover:text-black"
          }
          bg-transparent hover:bg-transparent`}
        onMouseEnter={() => handleMouseEnter("register")}
      >
        <Link to="/signup">Register</Link>
      </Button>
    </div>
  );
};

// --- Desktop User Menu (authenticated) ---
const UserMenuDesktop = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const initials = user
    ? `${(user.firstName || "")[0] || ""}${
        (user.lastName || "")[0] || ""
      }`.toUpperCase()
    : "";

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-semibold">
          {initials || <User className="w-4 h-4" />}
        </div>
        <span className="text-xs font-semibold text-gray-800">
          {user?.firstName || "Account"}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-600" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-lg border border-gray-100 py-2 z-9999">
          <button
            className="w-full text-left px-3 py-2 text-xs text-gray-800 hover:bg-gray-100"
            onClick={() => {
              navigate("/account/profile");
              setOpen(false);
            }}
          >
            My Profile
          </button>
          <button
            className="w-full text-left px-3 py-2 text-xs text-gray-800 hover:bg-gray-100"
            onClick={() => {
              navigate("/account/orders");
              setOpen(false);
            }}
          >
            My Orders
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50"
            onClick={() => {
              onLogout();
              setOpen(false);
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

// --- Search Overlay Modal ---
const SearchOverlay = ({ isOpen, onClose }) => {
  const popularSearches = ["Women", "Men", "Shorts", "Dress", "Jacket"];
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-9999 transition-opacity duration-300 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className={`w-full bg-white shadow-lg transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="w-full py-6 px-4 border-b border-gray-200">
          <div className="w-full px-6 mx-auto lg:px-8 py-2 mt-10 sm:mt-0 flex rounded-full border items-center shadow-md relative">
            <input
              type="text"
              placeholder="Enter Your Keywords"
              className="grow h-full text-xl outline-none placeholder-gray-400 rounded-full font-normal pl-2"
              autoFocus
              style={{ background: "transparent" }}
            />
            <button className="h-14 w-14 cursor-pointer bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors duration-200 flex items-center justify-center rounded-full">
              <Search className="w-6 h-6" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-red-600 hover:text-white transition-colors duration-200 flex items-center justify-center rounded-sm"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h3 className="text-sm font-extrabold tracking-widest text-gray-800 mb-4">
            POPULAR SEARCHES :
          </h3>
          <div className="flex flex-wrap gap-3">
            {popularSearches.map((keyword) => (
              <span
                key={keyword}
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer rounded-lg transition-colors duration-200"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Cart Drawer ---
const CartDrawer = ({ isOpen, onClose }) => {
  const drawerRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems, totalAmount } = useSelector((state) => state.cart);

  const handleRemoveFromCart = (productId, e) => {
    e.stopPropagation();
    dispatch(removeFromCart(productId));
  };

  const handleUpdateQuantity = (productId, quantity, e) => {
    e.stopPropagation();
    if (quantity > 0) {
      dispatch(updateCartItem({ productId, quantity }));
    } else {
      dispatch(removeFromCart(productId));
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-9998 transition-opacity duration-300 ${
        isOpen ? "visible opacity-100" : "invisible opacity-0"
      }`}
      onClick={(e) => {
        if (e.target === drawerRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        ref={drawerRef}
        className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b-3 border-brand-primary">
          <h2 className="text-sm font-semibold tracking-wide text-gray-800 uppercase">
            Cart ({cartItems.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <p className="text-sm text-gray-600">Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div 
                  key={item.product._id} 
                  onClick={() => handleProductClick(item.product._id)}
                  className="flex items-center gap-3 border-b-2 border-brand-primary pb-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-2"
                >
                  <img
                    src={item.product.images?.[0] || "/placeholder.jpg"}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">₹{item.price}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={(e) => handleUpdateQuantity(item.product._id, item.quantity - 1, e)}
                        className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-md hover:bg-gray-300"
                      >
                        <MinusIcon/>
                      </button>
                      <span className="text-sm">{item.quantity}</span>
                      <button
                        onClick={(e) => handleUpdateQuantity(item.product._id, item.quantity + 1, e)}
                        className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-md hover:bg-gray-300"
                      >
                        <PlusIcon/>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleRemoveFromCart(item.product._id, e)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total: ₹{totalAmount}</span>
            </div>
            <Button 
              onClick={() => {
                navigate('/checkout');
                onClose();
              }}
              className="w-full rounded-full bg-brand-primary text-brand-text-primary hover:bg-brand-primary-dark text-sm font-semibold py-2.5"
            >
              Go to Checkout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Wishlist Drawer ---
const WishlistDrawer = ({ isOpen, onClose }) => {
  const drawerRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const handleRemoveFromWishlist = (productId, e) => {
    e.stopPropagation();
    dispatch(removeFromWishlist(productId));
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-9997 transition-opacity duration-300 ${
        isOpen ? "visible opacity-100" : "invisible opacity-0"
      }`}
      onClick={(e) => {
        if (e.target === drawerRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        ref={drawerRef}
        className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b-3 border-brand-primary">
          <h2 className="text-sm font-semibold tracking-wide text-gray-800 uppercase">
            Wishlist ({wishlistItems.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {wishlistItems.length === 0 ? (
            <p className="text-sm text-gray-600">Your wishlist is empty.</p>
          ) : (
            <div className="space-y-4">
              {wishlistItems.map((item) => (
                <div 
                  key={item.product._id} 
                  onClick={() => handleProductClick(item.product._id)}
                  className="flex items-center gap-3 border-b-2 border-brand-primary pb-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-2"
                >
                  <img
                    src={item.product.images?.[0] || "/placeholder.jpg"}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">₹{item.product.discountedPrice || item.product.price}</p>
                  </div>
                  <button
                    onClick={(e) => handleRemoveFromWishlist(item.product._id, e)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Mobile Menu ---
const MobileMenu = ({
  isOpen,
  onClose,
  navItems,
  isActivePath,
  isAuthenticated,
  onLogout,
}) => (
  <div
    className={`fixed inset-0 z-100 transition-transform duration-300 ease-in-out lg:hidden ${
      isOpen ? "translate-x-0" : "-translate-x-full"
    }`}
  >
    {isOpen && (
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
    )}

    <div className="absolute top-0 left-0 w-3/4 max-w-sm h-full bg-white shadow-2xl overflow-y-auto p-6 flex flex-col">
      <div className="flex justify-end mb-8">
        <button
          onClick={onClose}
          className="p-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-2 grow">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href || "#"}
            onClick={onClose}
            className={`block px-4 py-3 text-base font-semibold uppercase transition-all duration-300 rounded-lg relative overflow-hidden group ${
              isActivePath(item.href)
                ? "text-brand-primary bg-purple-50"
                : "text-gray-900 hover:bg-gray-50"
            }`}
          >
            {item.name}
            {/* Active underline */}
            {isActivePath(item.href) && (
              <span className="absolute bottom-2 left-4 right-4 h-0.5 bg-brand-primary"></span>
            )}
            {/* Hover underline from left */}
            <span className="absolute bottom-2 left-4 right-4 h-0.5 bg-brand-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
          </Link>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200 flex flex-col space-y-3">
        {!isAuthenticated ? (
          <>
            <Button
              asChild
              className="w-full rounded-lg text-white py-3 font-semibold bg-black hover:bg-gray-800"
            >
              <Link to="/login" onClick={onClose}>
                LOGIN
              </Link>
            </Button>
            <Button
              asChild
              className="w-full rounded-lg text-black py-3 font-semibold border border-gray-300 bg-white hover:bg-gray-100"
            >
              <Link to="/signup" onClick={onClose}>
                REGISTER
              </Link>
            </Button>
          </>
        ) : (
          <>
            <Button
              asChild
              className="w-full rounded-lg text-white py-3 font-semibold bg-black hover:bg-gray-800"
            >
              <Link to="/account/profile" onClick={onClose}>
                My Profile
              </Link>
            </Button>
            <Button
              asChild
              className="w-full rounded-lg text-black py-3 font-semibold border border-gray-300 bg-white hover:bg-gray-100"
            >
              <Link to="/account/orders" onClick={onClose}>
                My Orders
              </Link>
            </Button>
            <Button
              className="w-full rounded-lg text-red-600 py-3 font-semibold border border-red-200 bg-red-50 hover:bg-red-100"
              onClick={() => {
                onLogout();
                onClose();
              }}
            >
              Logout
            </Button>
          </>
        )}
      </div>
    </div>
  </div>
);

// --- Main Navbar Component ---
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // 🔗 backend-driven UI
  const [timeLeft, setTimeLeft] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navItems = useSelector(selectNavbarItems);
  const marqueeMessages = useSelector(selectMarqueeMessages);
  const saleBanner = useSelector(selectSaleBanner);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { items: cartItems } = useSelector((state) => state.cart);

  // Close dropdown when clicking outside (Desktop)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close overlays on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
    setIsSearchOpen(false);
    setIsCartOpen(false);
    setIsWishlistOpen(false);
  }, [location]);

  // Lock scroll when overlays open
  useEffect(() => {
    const isOverlayOpen =
      isSearchOpen || isMenuOpen || isCartOpen || isWishlistOpen;
    document.body.style.overflow = isOverlayOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSearchOpen, isMenuOpen, isCartOpen, isWishlistOpen]);

  const isActivePath = (href) => {
    if (!href) return false;
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const handleDropdownToggle = (itemName) => {
    setActiveDropdown(activeDropdown === itemName ? null : itemName);
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Fetch wishlist and cart when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  // Fetch homepage configuration on component mount
  useEffect(() => {
    dispatch(fetchHomepageConfig());
  }, [dispatch]);

  // 🕒 Discount timer logic based on saleBanner.endDate
  useEffect(() => {
    if (!saleBanner?.endDate) {
      setTimeLeft(null);
      return;
    }

    const endTime = new Date(saleBanner.endDate).getTime();
    if (Number.isNaN(endTime)) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft({
          days: "00",
          hours: "00",
          minutes: "00",
          seconds: "00",
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (n) => String(n).padStart(2, "0");

      setTimeLeft({
        days: pad(days),
        hours: pad(hours),
        minutes: pad(minutes),
        seconds: pad(seconds),
      });
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [saleBanner]);

  return (
    <>
      {/* Overlays */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        navItems={navItems}
        isActivePath={isActivePath}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />

      {/* Main Navbar */}
      <nav className="relative bg-white shadow-md">
        <div className="items-center sm:px-8 px-4 lg:px-10">
          <div className="flex justify-between items-center lg:h-24 h-16">
            {/* MOBILE LEFT: Menu & Search */}
            <div className="flex items-center gap-1 lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-700 hover:text-brand-primary rounded-lg transition-colors"
              >
                <TextAlignStart className="w-6 h-6" />
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 flex items-center justify-center rounded-lg text-gray-700 hover:text-brand-primary transition-colors"
              >
                <Search className="w-6 h-6" />
              </button>
            </div>

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center absolute left-2/5 transform lg:relative lg:left-auto lg:transform-none"
            >
              <span className="text-3xl font-extrabold tracking-tight text-brand-primary">
                ZAUQ
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div
              className="hidden lg:flex items-center space-x-8 justify-center"
              ref={dropdownRef}
            >
              {navItems.map((item) => (
                <div key={item.name} className="relative group">
                  <div className="relative">
                    <button
                      onClick={
                        item.dropdown
                          ? () => handleDropdownToggle(item.name)
                          : undefined
                      }
                      className={`flex items-center space-x-1 py-1 text-md font-medium uppercase transition-colors duration-200 focus:outline-none ${
                        activeDropdown === item.name || isActivePath(item.href)
                          ? "text-brand-primary"
                          : "text-gray-800 hover:text-brand-primary"
                      }`}
                    >
                      <Link to={item.href || "#"} className="block">
                        {item.name}
                      </Link>
                    </button>
                    {/* Active underline */}
                    {isActivePath(item.href) && (
                      <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-brand-primary"></span>
                    )}
                    {/* Hover underline from left */}
                    {!isActivePath(item.href) && (
                      <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-brand-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Desktop Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden lg:flex p-4 items-center justify-center rounded-full shadow-lg hover:bg-brand-primary hover:text-white cursor-pointer transition-colors duration-200"
              >
                <Search className="w-6 h-6" />
              </button>

              {/* ❤️ Wishlist Icon (now also visible on mobile) */}
              <button
                onClick={() => setIsWishlistOpen(true)}
                className="relative p-2 sm:p-4 h-10 w-10 sm:h-14 sm:w-14 flex items-center rounded-full shadow-lg hover:bg-brand-primary hover:text-white justify-center text-gray-700 transition-colors duration-200 cursor-pointer"
              >
                <Star className="w-6 h-6" />
                <span className="absolute top-0 right-0 p-2 h-4 w-4 text-xs bg-red-600 text-white rounded-full flex items-center justify-center font-bold border-2 border-white">
                  {wishlistItems.length}
                </span>
              </button>

              {/* Cart Icon */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 sm:p-4 h-10 w-10 sm:h-14 sm:w-14 flex items-center justify-center rounded-full shadow-lg hover:bg-brand-primary hover:text-white transition-colors duration-200 cursor-pointer"
              >
                <ShoppingBag className="w-6 h-6" />
                <span className="absolute top-0 right-0 p-2 h-4 w-4 text-xs bg-red-600 text-white rounded-full flex items-center justify-center font-bold border-2 border-white">
                  {cartItems.length}
                </span>
              </button>

              {/* Desktop Auth UI */}
              <div className="hidden lg:block">
                {!isAuthenticated ? (
                  <NavButtonToggle />
                ) : (
                  <UserMenuDesktop user={user} onLogout={handleLogout} />
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Deal Banner - Only shown when saleBanner is active */}
      {saleBanner?.isActive && (
        <div
          className="bg-black opacity-95 text-white relative py-4 sm:py-8 overflow-hidden"
          style={{
            backgroundImage:
              'url("https://imgs.search.brave.com/2oNgA6Q7ynZOmLW_LQPcMwX4QefVm29VzZWeSPzzmo8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/dGhlZmFzaGlvbnN0/YXRpb24uaW4vd3At/Y29udGVudC91cGxv/YWRzLzIwMjUvMTEv/emFyYS1zaGFoamFo/YW4tMTYwMHg2MjUu/d2VicA")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="px-4 sm:px-8 lg:px-10 flex flex-col sm:flex-row items-center text-center sm:text-left justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm md:text-base font-semibold">
              {saleBanner?.message || (
                <>
                  DON'T MISS{" "}
                  <span className="text-yellow-400 font-extrabold">
                    70% OFF
                  </span>{" "}
                  ALL SALE! NO CODE NEEDED!
                </>
              )}
            </div>

            {timeLeft ? (
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:gap-4">
                <TimerSegment value={timeLeft.days} label="Days" />
                <TimerSegment value={timeLeft.hours} label="Hours" />
                <TimerSegment value={timeLeft.minutes} label="Mins" />
                <TimerSegment value={timeLeft.seconds} label="Secs" />
                <Button
                  asChild
                  className="h-9 sm:h-12 md:h-14 w-auto px-3 sm:px-5 md:px-6 bg-transparent text-white border-2 border-white hover:bg-white hover:text-black rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 group"
                >
                  <Link to="/deals" className="flex items-center gap-1 sm:gap-2">
                    <span className="whitespace-nowrap">View Deals</span>
                    <FaLongArrowAltRight
                      className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-transform duration-300 transform -rotate-45 group-hover:rotate-0 group-hover:translate-x-0.5"
                    />
                  </Link>
                </Button>
              </div>
            ) : (
              // If no timer configured, just button
              <div className="flex items-center justify-center">
                <Button
                  asChild
                  className="h-9 sm:h-12 md:h-14 w-auto px-3 sm:px-5 md:px-6 bg-transparent text-white border-2 border-white hover:bg-white hover:text-black rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 group"
                >
                  <Link to="/deals" className="flex items-center gap-1 sm:gap-2">
                    <span className="whitespace-nowrap">View Deals</span>
                    <FaLongArrowAltRight
                      className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-transform duration-300 transform -rotate-45 group-hover:rotate-0 group-hover:translate-x-0.5"
                    />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Marquee Bar - Now using backend data with graceful fallback */}
      <div>
        <MarqueeBar 
          messages={marqueeMessages && marqueeMessages.length > 0 ? marqueeMessages : DEFAULT_MARQUEE_MESSAGES} 
        />
      </div>
    </>
  );
};

export default Navbar;
