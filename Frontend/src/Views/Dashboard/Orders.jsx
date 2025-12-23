import React, { useEffect, useState, useRef } from 'react';
import OrderService from '@/services/orderService';
import { Button } from '@/components/ui/button';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  MoreVertical,
  User,
  MapPin,
  CreditCard,
  ShoppingBag,
  Activity,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Truck,
} from 'lucide-react';
import { FaRupeeSign } from 'react-icons/fa';

const STATUS_FLOW = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [statusChangeModal, setStatusChangeModal] = useState({ show: false, order: null, newStatus: null });
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

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit };
      if (filterStatus) params.status = filterStatus;
      const res = await OrderService.getAllOrders(params);
      const data = res?.data || res || {};
      setOrders(data.orders || []);
      setPage(data.pagination?.page || p);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Failed to load orders', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [filterStatus]);

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

  const changeStatus = async (order, nextStatus) => {
    setStatusChangeModal({ show: false, order: null, newStatus: null });
    try {
      await OrderService.updateOrderStatus(order._id, nextStatus);
      setToast({ show: true, message: `Order status updated to ${nextStatus}`, type: 'success' });
      load(page);
      if (selected && selected._id === order._id) {
        setSelected({ ...selected, status: nextStatus });
      }
    } catch (err) {
      setToast({ show: true, message: 'Failed to update status', type: 'error' }, err);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: Clock,
      Processing: Activity,
      Shipped: Truck,
      Delivered: CheckCircle,
      Cancelled: XCircle,
    };
    return icons[status] || AlertTriangle;
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
      Processing: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      Shipped: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
      Delivered: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
      Cancelled: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    };
    return colors[status] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order._id?.toLowerCase().includes(query) ||
      `${order.user?.firstName} ${order.user?.lastName}`.toLowerCase().includes(query) ||
      order.user?.email?.toLowerCase().includes(query) ||
      order.status?.toLowerCase().includes(query)
    );
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6 w-full bg-linear-to-br from-gray-50 to-purple-50/30">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent mb-2 flex items-center gap-2">
              <Package className="w-8 h-8 text-purple-600" />
              Orders Management
            </h1>
            <p className="text-gray-600">View and manage all customer orders</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              Total: <span className="text-purple-700 font-bold">{orders.length}</span> orders
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-purple-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 pr-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer font-medium"
            >
              <option value="">All Status</option>
              {STATUS_FLOW.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <Activity className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-purple-100 p-12 text-center shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-purple-100 p-12 text-center shadow-sm">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold text-gray-700">No orders found</p>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery ? 'Try adjusting your search criteria' : 'Orders will appear here once customers place them'}
          </p>
        </div>
      ) : (
        <>
          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const StatusIcon = getStatusIcon(order.status);
              const statusColor = getStatusColor(order.status);
              
              return (
                <div key={order._id} className="bg-white rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">Order #{order._id.slice(-8)}</h3>
                          <span className={`${statusColor.bg} ${statusColor.text} ${statusColor.border} border-2 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            {order.user?.firstName} {order.user?.lastName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      {/* Three-dot menu */}
                      <div className="relative" ref={openMenu === order._id ? menuRef : null}>
                        <button
                          onClick={() => setOpenMenu(openMenu === order._id ? null : order._id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                        
                        {openMenu === order._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border-2 border-gray-200 py-2 z-10">
                            <button
                              onClick={() => {
                                setSelected(order);
                                setOpenMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-purple-50 flex items-center gap-2 text-gray-700"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                              <button
                                onClick={() => {
                                  const nextIndex = Math.min(STATUS_FLOW.indexOf(order.status) + 1, STATUS_FLOW.length - 1);
                                  setStatusChangeModal({ show: true, order, newStatus: STATUS_FLOW[nextIndex] });
                                  setOpenMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-green-50 flex items-center gap-2 text-gray-700"
                              >
                                <Activity className="w-4 h-4" />
                                Update Status
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Order Summary */}
                    <div className="bg-linear-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">Total Amount</p>
                          <p className="text-xl font-bold text-gray-900 flex items-center gap-1">
                            <FaRupeeSign className="w-4 h-4" />
                            {formatCurrency(order.total)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">Payment Status</p>
                          <p className={`text-sm font-semibold ${order.paymentStatus === 'Paid' ? 'text-green-700' : 'text-amber-700'}`}>
                            {order.paymentStatus}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">Items</p>
                          <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                            <ShoppingBag className="w-4 h-4" />
                            {order.items?.length || 0} item(s)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="bg-white rounded-xl border border-purple-100 p-4 shadow-sm">
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

      {/* Status Change Confirmation Modal */}
      {statusChangeModal.show && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border-2 border-purple-200">
            <div className="bg-linear-to-r from-purple-50 to-blue-50 p-6 border-b border-purple-100">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-6 h-6 text-purple-600" />
                Update Order Status
              </h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to change the status to <span className="font-bold text-purple-700">{statusChangeModal.newStatus}</span>?
              </p>
              
              <div className="bg-purple-50 rounded-lg p-4 mb-6 border border-purple-100">
                <p className="text-sm text-gray-600 mb-2">Order: <span className="font-semibold text-gray-900">#{statusChangeModal.order?._id.slice(-8)}</span></p>
                <p className="text-sm text-gray-600 mb-2">Current Status: <span className="font-semibold text-gray-900">{statusChangeModal.order?.status}</span></p>
                <p className="text-sm text-gray-600">New Status: <span className="font-semibold text-purple-700">{statusChangeModal.newStatus}</span></p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setStatusChangeModal({ show: false, order: null, newStatus: null })}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => changeStatus(statusChangeModal.order, statusChangeModal.newStatus)}
                  className="flex-1 px-4 py-2.5 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-semibold transition-all shadow-sm"
                >
                  Confirm Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selected && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4 overflow-y-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border-2 border-purple-200 my-8">
            <div className="bg-linear-to-r from-purple-50 to-blue-50 p-6 border-b border-purple-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                    <Package className="w-7 h-7 text-purple-600" />
                    Order Details
                  </h3>
                  <p className="text-sm text-gray-600">Order ID: <span className="font-semibold text-gray-900">#{selected._id}</span></p>
                </div>
                <button 
                  onClick={() => setSelected(null)} 
                  className="text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg p-2 transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-xl p-5 border-2 border-blue-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Customer Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold text-gray-900">{selected.user?.firstName} {selected.user?.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{selected.user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Shipping Address
                  </h4>
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900">{selected.shippingAddress?.address}</p>
                    <p className="text-gray-700">{selected.shippingAddress?.city}, {selected.shippingAddress?.state}</p>
                    <p className="text-gray-700">PIN: {selected.shippingAddress?.postalCode}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-purple-600" />
                  Order Items
                </h4>
                <div className="space-y-3">
                  {selected.items?.map(it => (
                    <div key={it.product?._id || it.product} className="flex items-center gap-4 bg-white rounded-lg p-3 border border-purple-200">
                      <img 
                        src={it.product?.images?.[0] || '/placeholder.png'} 
                        alt={it.product?.name} 
                        className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{it.product?.name || it.name}</p>
                        <p className="text-sm text-gray-600">Quantity: <span className="font-semibold">{it.qty}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 flex items-center gap-1">
                          <FaRupeeSign className="w-3 h-3" />
                          {formatCurrency(it.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-600" />
                    Payment Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-semibold ${selected.paymentStatus === 'Paid' ? 'text-green-700' : 'text-amber-700'}`}>
                        {selected.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-amber-200">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                        <FaRupeeSign className="w-5 h-5" />
                        {formatCurrency(selected.total)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-linear-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border-2 border-indigo-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Update Status
                  </h4>
                  <div className="space-y-2">
                    {selected.status !== 'Delivered' && selected.status !== 'Cancelled' ? (
                      STATUS_FLOW.filter(s => s !== selected.status).map(s => {
                        const StatusIcon = getStatusIcon(s);
                        return (
                          <button
                            key={s}
                            onClick={() => setStatusChangeModal({ show: true, order: selected, newStatus: s })}
                            className="w-full px-4 py-2.5 bg-white border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-lg font-semibold text-gray-900 transition-all flex items-center justify-center gap-2"
                          >
                            <StatusIcon className="w-4 h-4" />
                            {s}
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-center py-4 text-gray-600">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm font-medium">Order status cannot be changed</p>
                      </div>
                    )}
                  </div>
                </div>
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
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
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

export default Orders;
