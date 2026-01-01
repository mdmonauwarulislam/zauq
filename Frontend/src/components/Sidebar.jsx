import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "@/redux/slices/authSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FileText,
  ShoppingBag,
  Home,
  Settings,
  Tag,
  Package,
  Users,
  Star,
  LogOut,
  Sparkles,
  Menu,
  X,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const menuItems = [
    { 
      title: "Dashboard", 
      icon: LayoutDashboard, 
      href: "/dashboard", 
      active: isActive("/dashboard")
    },
    { 
      title: "Categories", 
      icon: FileText, 
      href: "/dashboard/categories", 
      active: isActive("/dashboard/categories")
    },
    { 
      title: "Products", 
      icon: ShoppingBag, 
      href: "/dashboard/products", 
      active: isActive("/dashboard/products")
    },
    { 
      title: "Orders", 
      icon: Package, 
      href: "/dashboard/orders", 
      active: isActive("/dashboard/orders")
    },
    { 
      title: "Users", 
      icon: Users, 
      href: "/dashboard/users", 
      active: isActive("/dashboard/users")
    },
    { 
      title: "Reviews", 
      icon: Star, 
      href: "/dashboard/reviews", 
      active: isActive("/dashboard/reviews")
    },
    { 
      title: "Wishlist", 
      icon: Heart, 
      href: "/dashboard/wishlist", 
      active: isActive("/dashboard/wishlist")
    },
    { 
      title: "Coupons", 
      icon: Tag, 
      href: "/dashboard/coupons", 
      active: isActive("/dashboard/coupons")
    },
    { 
      title: "Hero Config", 
      icon: Sparkles, 
      href: "/dashboard/hero", 
      active: isActive("/dashboard/hero")
    },
    { 
      title: "Navbar Config", 
      icon: Settings, 
      href: "/dashboard/navbar", 
      active: isActive("/dashboard/navbar")
    },
  ];

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
    localStorage.clear();
    navigate("/login");
    setShowLogoutDialog(false);
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <div
      className={cn(
        "bg-white border-r-2 border-gray-200 h-screen flex flex-col transition-all duration-300 ease-in-out overflow-y-scroll shadow-xl",
        collapsed ? "w-20" : "w-72"
      )}
      style={{
        scrollbarWidth: "none",
      }}
    >
      {/* Header */}
      <div className="p-5 border-b-2 border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-primary flex items-center justify-center shadow-lg border-2 border-white">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-brand-primary">
                  ZAUQ
                </h2>
                <p className="text-xs text-gray-500 font-medium">Admin Panel</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-lg hover:bg-brand-primary hover:text-white transition-all duration-200 shadow-sm border border-gray-200",
              collapsed && "mx-auto"
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* User Profile */}
      <div className={cn("bg-white/80 backdrop-blur-sm border-b-2 border-gray-200", collapsed ? "p-2" : "p-5")}>
        <div className={cn("bg-brand-primary/10 rounded-xl border-2 border-brand-primary/20 shadow-sm", collapsed ? "p-2" : "p-4")}>
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-lg bg-brand-primary flex items-center justify-center shadow-md border-2 border-white">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.firstName || "Admin"} {user?.lastName || "User"}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user?.email || "admin@zauq.com"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-5 space-y-2 bg-white/50 backdrop-blur-sm">
        
        
        <div className="space-y-1.5">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-11 px-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                  collapsed && "justify-center px-0 w-11 h-11 mx-auto",
                  item.active
                    ? "bg-brand-primary text-white shadow-lg border-2 border-white hover:shadow-xl transform hover:scale-105"
                    : "text-gray-700 hover:bg-brand-primary/10 hover:text-brand-primary border-2 border-transparent hover:border-brand-primary/20 hover:shadow-md"
                )}
                onClick={() => navigate(item.href)}
              >
                <Icon className={cn("h-5 w-5 shrink-0", !collapsed && "mr-3")} />
                {!collapsed && (
                  <span className="flex-1 text-left font-semibold text-sm">
                    {item.title}
                  </span>
                )}
                {!collapsed && item.active && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full"></div>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer with Logout */}
      <div className="p-5 border-t-2 border-gray-200 bg-white/80 backdrop-blur-sm">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-11 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl border-2 border-transparent hover:border-red-200 hover:shadow-md transition-all duration-200 font-bold",
            collapsed && "justify-center px-0 w-11 h-11 mx-auto"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("h-5 w-5", !collapsed && "mr-3")} />
          {!collapsed && <span>Logout</span>}
        </Button>

        {!collapsed && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl border-2 border-gray-200 shadow-sm">
            <div className="text-xs text-center space-y-0.5">
              <p className="font-bold text-brand-text-primary">
                © 2025 ZAUQ Store
              </p>
              <p className="text-gray-500 font-medium">Version 1.0.0</p>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-md rounded-2xl border-2 border-gray-200 shadow-2xl bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl border-2 border-red-200">
                <LogOut className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                Confirm Logout
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <p className="text-gray-700 text-center font-medium">
              Are you sure you want to logout from your account?
            </p>
            <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
              <p className="text-sm text-amber-900">
                <span className="font-bold">Note:</span> You will need to login again to access your dashboard.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              onClick={cancelLogout}
              variant="outline"
              className="rounded-xl border-2 border-gray-300 hover:bg-gray-50 font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmLogout}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-md"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Yes, Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sidebar;
