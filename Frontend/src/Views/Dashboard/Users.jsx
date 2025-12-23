import React, { useEffect, useState, useRef } from "react";
import AuthService from "@/services/AuthService";
import { Button } from "@/components/ui/button";
import {
  Users as UsersIcon,
  Search,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  MoreVertical,
  Eye,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_LIMIT = 12;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, user: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const menuRef = useRef(null);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: 'error' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const load = async (p = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const res = await AuthService.getAllUsers({ page: p, limit: PAGE_LIMIT, searchTerm });
      const data = res || res.data || {};
      setUsers(data.users || []);
      setPage(data.pagination?.page || p);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Failed to load users', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, "");
  }, []);

  const handleSearch = (ev) => {
    ev.preventDefault();
    load(1, search);
  };

  const toggleBlock = async (user) => {
    setConfirmModal({ show: false, action: null, user: null });
    try {
      await AuthService.updateUserByAdmin({ userId: user._id, isBlocked: !user.isBlocked });
      setToast({ show: true, message: `User ${user.isBlocked ? 'unblocked' : 'blocked'} successfully`, type: 'success' });
      load(page, search);
      if (selected && selected._id === user._id) {
        setSelected({ ...selected, isBlocked: !user.isBlocked });
      }
    } catch (err) {
      setToast({ show: true, message: 'Failed to update user', type: 'error' },err);
    }
  };

  const handleDelete = async (user) => {
    setConfirmModal({ show: false, action: null, user: null });
    try {
      await AuthService.deleteUser(user._id);
      setToast({ show: true, message: 'User deleted successfully', type: 'success' });
      load(page, search);
      if (selected && selected._id === user._id) {
        setSelected(null);
      }
    } catch (err) {
      setToast({ show: true, message: 'Failed to delete user', type: 'error' }, err);
    }
  };

  return (
    <div className="p-6 space-y-6 w-full bg-linear-to-br from-gray-50 to-indigo-50/30">
      {/* Header */}
      <div className="bg-linear-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent mb-2 flex items-center gap-2">
              <UsersIcon className="w-8 h-8 text-indigo-600" />
              User Management
            </h1>
            <p className="text-gray-600">View, manage, and moderate user accounts</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              Total: <span className="text-indigo-700 font-bold">{users.length}</span> users
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-indigo-100 p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-linear-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700">
              Search
            </Button>
            <Button variant="outline" onClick={() => { setSearch(""); load(1, ""); }}>
              Reset
            </Button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-indigo-100 p-12 text-center shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-indigo-100 p-12 text-center shadow-sm">
          <UsersIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold text-gray-700">No users found</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your search criteria</p>
        </div>
      ) : (
        <>
          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <div key={user._id} className="bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                        <UsersIcon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{user.firstName} {user.lastName}</h3>
                        <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                    
                    {/* Three-dot menu */}
                    <div className="relative" ref={openMenu === user._id ? menuRef : null}>
                      <button
                        onClick={() => setOpenMenu(openMenu === user._id ? null : user._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                      
                      {openMenu === user._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border-2 border-gray-200 py-2 z-10">
                          <button
                            onClick={() => {
                              setSelected(user);
                              setOpenMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-indigo-50 flex items-center gap-2 text-gray-700"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({ show: true, action: 'block', user });
                              setOpenMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-amber-50 flex items-center gap-2 text-gray-700"
                          >
                            <Ban className="w-4 h-4" />
                            {user.isBlocked ? 'Unblock' : 'Block'} User
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({ show: true, action: 'delete', user });
                              setOpenMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete User
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <Shield className="w-4 h-4" />
                        Role
                      </span>
                      <span className={`font-semibold px-3 py-1 rounded-full text-xs ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        Joined
                      </span>
                      <span className="font-medium text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="pt-4 border-t border-gray-100">
                    {user.isBlocked ? (
                      <div className="bg-linear-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-lg p-3 flex items-center gap-2">
                        <UserX className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-semibold text-red-700">Blocked</span>
                      </div>
                    ) : (
                      <div className="bg-linear-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-3 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-semibold text-green-700">Active</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="bg-white rounded-xl border border-indigo-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => load(page - 1, search)}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => load(page + 1, search)}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border-2 border-indigo-200">
            <div className={`${
              confirmModal.action === 'delete' 
                ? 'bg-linear-to-r from-red-50 to-rose-50' 
                : 'bg-linear-to-r from-amber-50 to-orange-50'
            } p-6 border-b ${
              confirmModal.action === 'delete' ? 'border-red-100' : 'border-amber-100'
            }`}>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {confirmModal.action === 'delete' ? (
                  <>
                    <Trash2 className="w-6 h-6 text-red-600" />
                    Delete User
                  </>
                ) : (
                  <>
                    <Ban className="w-6 h-6 text-amber-600" />
                    {confirmModal.user?.isBlocked ? 'Unblock' : 'Block'} User
                  </>
                )}
              </h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                {confirmModal.action === 'delete' 
                  ? 'Are you sure you want to permanently delete this user? This action cannot be undone.' 
                  : `Are you sure you want to ${confirmModal.user?.isBlocked ? 'unblock' : 'block'} this user?`}
              </p>
              
              <div className={`${
                confirmModal.action === 'delete' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
              } rounded-lg p-4 mb-6 border`}>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold text-gray-900">{confirmModal.user?.firstName} {confirmModal.user?.lastName}</span>
                </p>
                <p className="text-sm text-gray-600">{confirmModal.user?.email}</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ show: false, action: null, user: null })}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmModal.action === 'delete' ? handleDelete(confirmModal.user) : toggleBlock(confirmModal.user)}
                  className={`flex-1 px-4 py-2.5 ${
                    confirmModal.action === 'delete'
                      ? 'bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                      : 'bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
                  } text-white rounded-lg font-semibold transition-all shadow-sm`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selected && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border-2 border-indigo-200">
            <div className="bg-linear-to-r from-indigo-50 to-blue-50 p-6 border-b border-indigo-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                    <UsersIcon className="w-7 h-7 text-indigo-600" />
                    User Details
                  </h3>
                </div>
                <button 
                  onClick={() => setSelected(null)} 
                  className="text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg p-2 transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-100">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-bold text-gray-900 text-lg">{selected.firstName} {selected.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-semibold text-gray-900 break-all">{selected.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-200">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Role</p>
                      <p className={`font-semibold px-3 py-1 rounded-full text-xs inline-block ${
                        selected.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {selected.role}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <p className={`font-semibold px-3 py-1 rounded-full text-xs inline-block ${
                        selected.isBlocked 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {selected.isBlocked ? 'Blocked' : 'Active'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Joined</p>
                    <p className="font-semibold text-gray-900">{new Date(selected.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelected(null)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => { 
                    setConfirmModal({ show: true, action: 'block', user: selected });
                    setSelected(null);
                  }}
                  className={`flex-1 ${
                    selected.isBlocked
                      ? 'bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      : 'bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
                  } text-white`}
                >
                  {selected.isBlocked ? 'Unblock' : 'Block'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right">
          <div className={`${
            toast.type === 'success' 
              ? 'bg-linear-to-r from-green-500 to-emerald-600' 
              : 'bg-linear-to-r from-red-500 to-rose-600'
          } text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] border-2 border-white/20`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-6 h-6 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6shrink-0" />
            )}
            <p className="font-semibold">{toast.message}</p>
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

export default Users;
