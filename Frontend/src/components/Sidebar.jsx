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
      active: isActive("/dashboard"),
      gradient: "from-brand-primary to-brand-primary"
    },
    { 
      title: "Categories", 
      icon: FileText, 
      href: "/dashboard/categories", 
      active: isActive("/dashboard/categories"),
      gradient: "from-purple-500 to-pink-500"
    },
    { 
      title: "Products", 
      icon: ShoppingBag, 
      href: "/dashboard/products", 
      active: isActive("/dashboard/products"),
      gradient: "from-green-500 to-emerald-500"
    },
    { 
      title: "Orders", 
      icon: Package, 
      href: "/dashboard/orders", 
      active: isActive("/dashboard/orders"),
      gradient: "from-purple-500 to-indigo-500"
    },
    { 
      title: "Users", 
      icon: Users, 
      href: "/dashboard/users", 
      active: isActive("/dashboard/users"),
      gradient: "from-indigo-500 to-blue-500"
    },
    { 
      title: "Reviews", 
      icon: Star, 
      href: "/dashboard/reviews", 
      active: isActive("/dashboard/reviews"),
      gradient: "from-amber-500 to-orange-500"
    },
    { 
      title: "Coupons", 
      icon: Tag, 
      href: "/dashboard/coupons", 
      active: isActive("/dashboard/coupons"),
      gradient: "from-pink-500 to-rose-500"
    },
    { 
      title: "Hero Config", 
      icon: Sparkles, 
      href: "/dashboard/hero", 
      active: isActive("/dashboard/hero"),
      gradient: "from-orange-500 to-amber-500"
    },
    { 
      title: "Navbar Config", 
      icon: Settings, 
      href: "/dashboard/navbar", 
      active: isActive("/dashboard/navbar"),
      gradient: "from-teal-500 to-cyan-500"
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
        "bg-linear-to-br from-slate-50 to-gray-100 border-r-2 border-gray-200 h-screen flex flex-col transition-all duration-300 ease-in-out overflow-y-scroll shadow-xl",
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
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg border-2 border-white">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
              "h-9 w-9 rounded-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white transition-all duration-200 shadow-sm border border-gray-200",
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
        <div className={cn("bg-linear-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-100 shadow-sm", collapsed ? "p-2" : "p-4")}>
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md border-2 border-white">
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
        {!collapsed && (
          <div className="mb-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">
              Navigation
            </h3>
            <div className="w-12 h-0.5 bg-linear-to-r from-blue-500 to-purple-500 rounded-full ml-3"></div>
          </div>
        )}
        
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
                    ? `bg-linear-to-r ${item.gradient} text-white shadow-lg border-2 border-white hover:shadow-xl transform hover:scale-105`
                    : "text-gray-700 hover:bg-white hover:text-gray-900 border-2 border-transparent hover:border-gray-200 hover:shadow-md"
                )}
                onClick={() => navigate(item.href)}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", !collapsed && "mr-3")} />
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
          <div className="mt-4 p-3 bg-linear-to-br from-gray-50 to-slate-100 rounded-xl border-2 border-gray-200 shadow-sm">
            <div className="text-xs text-center space-y-0.5">
              <p className="font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                © 2025 ZAUQ Store
              </p>
              <p className="text-gray-500 font-medium">Version 1.0.0</p>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-md rounded-2xl border-2 border-gray-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-3 bg-linear-to-br from-red-100 to-rose-100 rounded-xl border-2 border-red-200">
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
            <div className="p-4 bg-linear-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
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
              className="bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-semibold shadow-md"
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
