/* eslint-disable no-unused-vars */
import React, { useEffect, useState, } from "react";
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
  Eye,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  Phone,
  MapPin,
  ShieldCheck,
  ShieldX,
  UserCog,
  Filter,
} from "lucide-react";

const PAGE_LIMIT = 15;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, active: 0, blocked: 0, admins: 0 });
  
  // Filter states
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // UI states
  const [selected, setSelected] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, user: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: 'error' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const params = { 
        page: p, 
        limit: PAGE_LIMIT,
        sort: sortOrder === 'asc' ? 'createdAt' : '-createdAt',
      };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      
      const res = await AuthService.getAllUsers(params);
      const data = res?.data || res || {};
      setUsers(data.users || []);
      setPage(data.pagination?.page || p);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Failed to load users', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [roleFilter, statusFilter, sortOrder]);

  const handleSearch = (ev) => {
    ev?.preventDefault();
    load(1);
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setSortOrder("desc");
    load(1);
  };

  const toggleBlock = async (user) => {
    setConfirmModal({ show: false, action: null, user: null });
    try {
      await AuthService.updateUserByAdmin({ userId: user._id, isBlocked: !user.isBlocked });
      setToast({ show: true, message: `User ${user.isBlocked ? 'unblocked' : 'blocked'} successfully`, type: 'success' });
      load(page);
      if (selected && selected._id === user._id) {
        setSelected({ ...selected, isBlocked: !user.isBlocked });
      }
    } catch (err) {
      setToast({ show: true, message: 'Failed to update user', type: 'error' });
    }
  };

  const toggleRole = async (user) => {
    setConfirmModal({ show: false, action: null, user: null });
    try {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      await AuthService.updateUserByAdmin({ userId: user._id, role: newRole });
      setToast({ show: true, message: `User role changed to ${newRole}`, type: 'success' });
      load(page);
      if (selected && selected._id === user._id) {
        setSelected({ ...selected, role: newRole });
      }
    } catch (err) {
      setToast({ show: true, message: 'Failed to update user role', type: 'error' });
    }
  };

  const handleDelete = async (user) => {
    setConfirmModal({ show: false, action: null, user: null });
    try {
      await AuthService.deleteUser(user._id);
      setToast({ show: true, message: 'User deleted successfully', type: 'success' });
      load(page);
      if (selected && selected._id === user._id) {
        setSelected(null);
      }
    } catch (err) {
      setToast({ show: true, message: 'Failed to delete user', type: 'error' });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6 w-full bg-gray-50 min-h-screen">
      {/* Header with Stats */}
      <div className="bg-white rounded-xl border border-brand-primary p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-primary mb-2 flex items-center gap-2">
              <UsersIcon className="w-8 h-8" />
              User Management
            </h1>
            <p className="text-gray-600">View, manage, and moderate user accounts</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-50 rounded-lg px-4 py-2 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium">Total Users</p>
              <p className="text-xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <div className="bg-green-50 rounded-lg px-4 py-2 border border-green-100">
              <p className="text-xs text-green-600 font-medium">Active</p>
              <p className="text-xl font-bold text-green-700">{stats.active}</p>
            </div>
            <div className="bg-red-50 rounded-lg px-4 py-2 border border-red-100">
              <p className="text-xs text-red-600 font-medium">Blocked</p>
              <p className="text-xl font-bold text-red-700">{stats.blocked}</p>
            </div>
            <div className="bg-purple-50 rounded-lg px-4 py-2 border border-purple-100">
              <p className="text-xs text-purple-600 font-medium">Admins</p>
              <p className="text-xl font-bold text-purple-700">{stats.admins}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
            />
          </form>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>

          {/* Sort Order */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setSortOrder('desc')}
              className={`px-3 py-2 text-sm font-medium transition-all flex items-center gap-1 ${
                sortOrder === 'desc'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Newest
            </button>
            <button
              onClick={() => setSortOrder('asc')}
              className={`px-3 py-2 text-sm font-medium transition-all flex items-center gap-1 border-l border-gray-200 ${
                sortOrder === 'asc'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Oldest
            </button>
          </div>

          {/* Clear Filters */}
          {(search || roleFilter || statusFilter || sortOrder !== 'desc') && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-all"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}

          {/* Users Count */}
          <div className="ml-auto text-sm text-gray-600">
            <span className="font-bold text-brand-primary">{total}</span> users found
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <UsersIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold text-gray-700">No users found</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Addresses</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      {/* User Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                            {user.profileImage ? (
                              <img src={user.profileImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <span className="text-brand-primary font-bold text-sm">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-gray-500">ID: {user._id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {user.email}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          <Shield className="w-3 h-3" />
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.isBlocked
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {user.isBlocked ? (
                            <>
                              <UserX className="w-3 h-3" />
                              Blocked
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3" />
                              Active
                            </>
                          )}
                        </span>
                      </td>

                      {/* Addresses */}
                      <td className="px-4 py-3 text-center">
                        <span className="bg-gray-100 px-2 py-1 rounded text-sm font-medium text-gray-700">
                          {user.addresses?.length || 0}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelected(user)}
                            className="p-2 rounded-lg hover:bg-brand-primary/10 text-gray-600 hover:text-brand-primary transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmModal({ show: true, action: 'block', user })}
                            className={`p-2 rounded-lg transition-colors ${
                              user.isBlocked
                                ? 'hover:bg-green-50 text-gray-600 hover:text-green-600'
                                : 'hover:bg-amber-50 text-gray-600 hover:text-amber-600'
                            }`}
                            title={user.isBlocked ? 'Unblock User' : 'Block User'}
                          >
                            {user.isBlocked ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setConfirmModal({ show: true, action: 'role', user })}
                            className="p-2 rounded-lg hover:bg-purple-50 text-gray-600 hover:text-purple-600 transition-colors"
                            title={user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                          >
                            <UserCog className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmModal({ show: true, action: 'delete', user })}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => load(page - 1)}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => load(page + 1)}
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

      {/* User Details Modal */}
      {selected && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 overflow-y-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-brand-text-primary px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="bg-brand-primary/10 p-2 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                  <p className="text-sm text-gray-600">ID: {selected._id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Profile */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                  {selected.profileImage ? (
                    <img src={selected.profileImage} alt="" className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <span className="text-brand-primary font-bold text-2xl">
                      {selected.firstName?.[0]}{selected.lastName?.[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900">{selected.firstName} {selected.lastName}</h4>
                  <p className="text-gray-600">{selected.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      selected.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <Shield className="w-3 h-3" />
                      {selected.role}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      selected.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {selected.isBlocked ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                      {selected.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-primary" />
                  Account Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Joined</p>
                    <p className="font-semibold text-gray-900">{formatDateTime(selected.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                    <p className="font-semibold text-gray-900">{formatDateTime(selected.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-primary" />
                  Saved Addresses ({selected.addresses?.length || 0})
                </h4>
                {selected.addresses?.length > 0 ? (
                  <div className="space-y-3">
                    {selected.addresses.map((addr, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-gray-900">{addr.name}</p>
                          {addr.isDefault && (
                            <span className="bg-brand-primary/10 text-brand-primary text-xs px-2 py-0.5 rounded-full font-medium">Default</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                          <Phone className="w-3.5 h-3.5" />
                          {addr.phone || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-700">
                          {addr.address}, {addr.city}, {addr.state} - {addr.postalCode}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No addresses saved</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setConfirmModal({ show: true, action: 'block', user: selected });
                  }}
                  className={`flex-1 min-w-[150px] px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    selected.isBlocked
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  {selected.isBlocked ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                  {selected.isBlocked ? 'Unblock User' : 'Block User'}
                </button>
                <button
                  onClick={() => {
                    setConfirmModal({ show: true, action: 'role', user: selected });
                  }}
                  className="flex-1 min-w-[150px] px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <UserCog className="w-4 h-4" />
                  {selected.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                </button>
                <button
                  onClick={() => {
                    setConfirmModal({ show: true, action: 'delete', user: selected });
                  }}
                  className="flex-1 min-w-[150px] px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className={`p-6 border-b ${
              confirmModal.action === 'delete' 
                ? 'bg-red-50 border-red-100' 
                : confirmModal.action === 'role'
                ? 'bg-purple-50 border-purple-100'
                : confirmModal.user?.isBlocked
                ? 'bg-green-50 border-green-100'
                : 'bg-amber-50 border-amber-100'
            }`}>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {confirmModal.action === 'delete' ? (
                  <>
                    <Trash2 className="w-6 h-6 text-red-600" />
                    Delete User
                  </>
                ) : confirmModal.action === 'role' ? (
                  <>
                    <UserCog className="w-6 h-6 text-purple-600" />
                    Change Role
                  </>
                ) : (
                  <>
                    {confirmModal.user?.isBlocked ? (
                      <UserCheck className="w-6 h-6 text-green-600" />
                    ) : (
                      <Ban className="w-6 h-6 text-amber-600" />
                    )}
                    {confirmModal.user?.isBlocked ? 'Unblock User' : 'Block User'}
                  </>
                )}
              </h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                {confirmModal.action === 'delete' 
                  ? 'Are you sure you want to permanently delete this user? This action cannot be undone.' 
                  : confirmModal.action === 'role'
                  ? `Are you sure you want to ${confirmModal.user?.role === 'admin' ? 'demote this admin to user' : 'promote this user to admin'}?`
                  : `Are you sure you want to ${confirmModal.user?.isBlocked ? 'unblock' : 'block'} this user?`}
              </p>
              
              <div className={`rounded-lg p-4 mb-6 border ${
                confirmModal.action === 'delete' 
                  ? 'bg-red-50 border-red-100' 
                  : confirmModal.action === 'role'
                  ? 'bg-purple-50 border-purple-100'
                  : 'bg-gray-50 border-gray-100'
              }`}>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold text-gray-900">{confirmModal.user?.firstName} {confirmModal.user?.lastName}</span>
                </p>
                <p className="text-sm text-gray-600">{confirmModal.user?.email}</p>
                {confirmModal.action === 'role' && (
                  <p className="text-sm mt-2">
                    Current role: <span className="font-semibold capitalize">{confirmModal.user?.role}</span> → 
                    New role: <span className="font-semibold capitalize">{confirmModal.user?.role === 'admin' ? 'user' : 'admin'}</span>
                  </p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ show: false, action: null, user: null })}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirmModal.action === 'delete') {
                      handleDelete(confirmModal.user);
                    } else if (confirmModal.action === 'role') {
                      toggleRole(confirmModal.user);
                    } else {
                      toggleBlock(confirmModal.user);
                    }
                  }}
                  className={`flex-1 px-4 py-2.5 text-white rounded-lg font-semibold transition-all ${
                    confirmModal.action === 'delete'
                      ? 'bg-red-600 hover:bg-red-700'
                      : confirmModal.action === 'role'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : confirmModal.user?.isBlocked
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  Confirm
                </button>
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
              ? 'bg-green-600' 
              : 'bg-red-600'
          } text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px]`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-6 h-6 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 shrink-0" />
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
