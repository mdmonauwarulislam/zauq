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
// import Logo from "@/assets/images/logo.png";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Home,
  BarChart3,
  Bell,
  User,
  Building,
  Notebook,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FaCertificate } from "react-icons/fa";

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
    { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: isActive("/dashboard") },
    { title: "Categories", icon: FileText, href: "/dashboard/categories", active: isActive("/dashboard/categories") },
    { title: "Products", icon: BookOpen, href: "/dashboard/products", active: isActive("/dashboard/products") },
    { title: "Hero & Home", icon: Home, href: "/dashboard/hero", active: isActive("/dashboard/hero") },
    { title: "Coupons", icon: Bell, href: "/dashboard/coupons", active: isActive("/dashboard/coupons") },
    { title: "Orders", icon: BarChart3, href: "/dashboard/orders", active: isActive("/dashboard/orders") },
    { title: "Users", icon: User, href: "/dashboard/users", active: isActive("/dashboard/users") },
    { title: "Reviews", icon: BookOpen, href: "/dashboard/reviews", active: isActive("/dashboard/reviews") },
  ];

  const bottomMenuItems = [
    {
      title: "Notifications",
      icon: Bell,
      href: "/notifications",
      badge: "3",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
    {
      title: "Help & Support",
      icon: HelpCircle,
      href: "/help",
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
        "bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ease-in-out overflow-y-scroll shadow-lg",
        collapsed ? "w-24" : "w-64"
      )}
      style={{
        scrollbarWidth: "none",
      }}
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-22  rounded-3xl flex items-center justify-center shadow-md border-2 border-gray-200">
                {/* <img
                  src={Logo}
                  alt="Logo"
                  className="w-full h-full rounded-2xl"
                /> */}
                ZUAQ
              </div>
              <div className="w-full flex items-center justify-center">
                <h2 className="text-sm font-semibold text-gray-900 text-center">
                  Grow More Safety
                </h2>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-gray-600 hover:bg-[#1B941C] hover:text-white rounded-3xl border border-gray-200 transition-all duration-200 shadow-sm"
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
      <div className="px-6 pb-6">
        <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-3xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={
                  user?.profile_image ||
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                }
                alt="profile"
                className="w-10 h-10 rounded-2xl object-cover border-2 border-[#1B941C] shadow-md"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#1B941C] rounded-full border-2 border-white shadow-sm"></div>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "admin@mmch.edu"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-6 pb-6 space-y-2">
        <div className="space-y-2">
          {!collapsed && (
            <div className="px-3 mb-3">
              <p className="text-xs font-bold text-[#1B941C] uppercase tracking-wider">
                Main Menu
              </p>
              <div className="w-8 h-0.5 bg-[#1B941C] rounded-full mt-1"></div>
            </div>
          )}
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 px-4 rounded-3xl transition-all duration-200",
                  collapsed && "justify-center px-0 w-12 h-12 mx-auto",
                  item.active
                    ? "bg-[#1B941C] text-white hover:bg-[#16a319] shadow-md border border-[#1B941C]"
                    : "text-gray-700 hover:bg-green-50 hover:text-[#1B941C] border border-transparent hover:border-gray-200 hover:shadow-sm"
                )}
                onClick={() => navigate(item.href)}
              >
                <Icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left font-medium">
                      {item.title}
                    </span>
                    {item.badge && (
                      <span className="ml-auto text-xs bg-red-500 text-white px-2 py-1 rounded-2xl">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          {!collapsed && (
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 py-1 text-[#1B941C] font-bold tracking-wider rounded-2xl border border-gray-200 shadow-sm">
                Quick Actions
              </span>
            </div>
          )}
        </div>

        {/* Bottom Menu Items */}
        <div className="space-y-2">
          {bottomMenuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-11 px-4 text-gray-700 hover:bg-green-50 hover:text-[#1B941C] rounded-3xl border border-transparent hover:border-gray-200 hover:shadow-sm transition-all duration-200",
                  collapsed && "justify-center px-0 w-11 h-11 mx-auto"
                )}
              >
                <Icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left font-medium">
                      {item.title}
                    </span>
                    {item.badge && (
                      <span className="ml-auto text-xs bg-[#1B941C] text-white px-2 py-1 rounded-2xl shadow-sm border border-gray-200">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer with Logout */}
      <div className="px-6 pb-6 border-t border-gray-200 pt-6">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-11 px-4 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-3xl border border-transparent hover:border-red-200 hover:shadow-sm transition-all duration-200 font-semibold",
            collapsed && "justify-center px-0 w-11 h-11 mx-auto"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-3")} />
          {!collapsed && <span>Logout</span>}
        </Button>

        {!collapsed && (
          <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-green-50 rounded-3xl border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p className="font-semibold text-[#1B941C]">
                © 2025 Grow More Safety
              </p>
              <p className="text-gray-400">Version 1.0.0</p>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-2xl">
                <LogOut className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-xl font-semibold text-gray-900">
                Confirm Logout
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-600 text-center">
              Are you sure you want to logout from your account?
            </p>
            <div className="mt-4 p-3 bg-yellow-50 rounded-2xl border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Note:</span> You will need to
                login again to access your dashboard.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              onClick={cancelLogout}
              variant="outline"
              className="rounded-2xl border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmLogout}
              className="bg-red-600 hover:bg-red-700 text-white rounded-2xl"
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
