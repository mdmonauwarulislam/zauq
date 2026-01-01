import React, { useEffect, useState } from 'react';
import OrderService from '@/services/orderService';
import { Button } from '@/components/ui/button';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  User,
  MapPin,
  CreditCard,
  ShoppingBag,
  Activity,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Truck,
  Download,
  Filter,
  ArrowUpDown,
  X,
  FileText,
  Phone,
  Mail,
  Hash,
} from 'lucide-react';

// Backend uses lowercase status values
const STATUS_FLOW = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
const PAYMENT_STATUS_LABELS = {
  pending: 'Pending',
  completed: 'Paid',
  failed: 'Failed',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [paymentFilter] = useState('Paid'); // Only show paid orders
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

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
      if (paymentFilter) params.paymentStatus = paymentFilter;
      if (dateFrom) params.startDate = dateFrom;
      if (dateTo) params.endDate = dateTo;
      params.sort = sortOrder === 'asc' ? 'createdAt' : '-createdAt';
      
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

  useEffect(() => { load(1); }, [filterStatus, paymentFilter, dateFrom, dateTo, sortOrder]);

  const changeStatus = async (order, nextStatus) => {
    try {
      await OrderService.updateOrderStatus(order._id, nextStatus);
      setToast({ show: true, message: `Order status updated to ${nextStatus}`, type: 'success' });
      load(page);
      if (selected && selected._id === order._id) {
        setSelected({ ...selected, status: nextStatus });
      }
    } catch (err) {
      setToast({ show: true, message: 'Failed to update status', type: 'error' });
      console.error(err);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      processing: Activity,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
    };
    return icons[status] || AlertTriangle;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
      delivered: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
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
      order.status?.toLowerCase().includes(query) ||
      order.trackingNumber?.toLowerCase().includes(query)
    );
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const clearFilters = () => {
    setFilterStatus('');
    setDateFrom('');
    setDateTo('');
    setSortOrder('desc');
    setSearchQuery('');
  };

  // Generate Invoice PDF
  const downloadInvoice = (order) => {
    const invoiceContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Invoice - ${order._id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
    .invoice-header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 3px solid #7c3aed; padding-bottom: 20px; }
    .company-name { font-size: 28px; font-weight: bold; color: #7c3aed; }
    .invoice-title { font-size: 24px; color: #666; }
    .invoice-meta { text-align: right; }
    .invoice-meta p { margin: 5px 0; font-size: 14px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 16px; font-weight: bold; color: #7c3aed; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #e5e5e5; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    .info-box { background: #f9fafb; padding: 15px; border-radius: 8px; }
    .info-box p { margin: 5px 0; font-size: 14px; }
    .info-box .label { color: #666; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #7c3aed; color: white; padding: 12px; text-align: left; font-size: 14px; }
    td { padding: 12px; border-bottom: 1px solid #e5e5e5; font-size: 14px; }
    .text-right { text-align: right; }
    .totals { margin-top: 20px; margin-left: auto; width: 300px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e5e5; }
    .totals-row.final { font-size: 18px; font-weight: bold; color: #7c3aed; border-bottom: 2px solid #7c3aed; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #e5e5e5; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .status-paid { background: #dcfce7; color: #16a34a; }
    .status-pending { background: #fef3c7; color: #d97706; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="invoice-header">
    <div>
      <div class="company-name">ZAUQ</div>
      <p style="color: #666; margin-top: 5px;">Your Fashion Destination</p>
    </div>
    <div class="invoice-meta">
      <div class="invoice-title">INVOICE</div>
      <p><strong>Invoice #:</strong> ${order._id.slice(-8).toUpperCase()}</p>
      <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
      <p><strong>Transaction ID:</strong> ${order.trackingNumber || order._id}</p>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <div class="section-title">Customer Details</div>
      <p><span class="label">Name:</span> ${order.user?.firstName || ''} ${order.user?.lastName || ''}</p>
      <p><span class="label">Email:</span> ${order.user?.email || 'N/A'}</p>
      <p><span class="label">Phone:</span> ${order.shippingAddress?.phone || 'N/A'}</p>
    </div>
    <div class="info-box">
      <div class="section-title">Shipping Address</div>
      <p>${order.shippingAddress?.name || ''}</p>
      <p>${order.shippingAddress?.address || ''}</p>
      <p>${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}</p>
      <p>PIN: ${order.shippingAddress?.postalCode || ''}</p>
    </div>
  </div>

  <div class="section" style="margin-top: 30px;">
    <div class="section-title">Order Items</div>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th class="text-right">Price</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.items?.map(item => `
          <tr>
            <td>${item.product?.name || item.name || 'Product'}</td>
            <td>${item.quantity || item.qty || 1}</td>
            <td class="text-right">₹${(item.price || 0).toLocaleString()}</td>
            <td class="text-right">₹${((item.price || 0) * (item.quantity || item.qty || 1)).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal:</span>
      <span>₹${(order.totalPrice || 0).toLocaleString()}</span>
    </div>
    ${order.discount > 0 ? `
    <div class="totals-row">
      <span>Discount:</span>
      <span style="color: #16a34a;">-₹${(order.discount || 0).toLocaleString()}</span>
    </div>
    ` : ''}
    <div class="totals-row final">
      <span>Total:</span>
      <span>₹${(order.finalPrice || order.total || 0).toLocaleString()}</span>
    </div>
  </div>

  <div style="margin-top: 30px;">
    <p><strong>Payment Method:</strong> ${order.paymentMethod === 'razorpay' ? 'Razorpay (Online Payment)' : order.paymentMethod || 'N/A'}</p>
    <p><strong>Payment Status:</strong> <span class="status-badge ${order.paymentStatus === 'completed' ? 'status-paid' : 'status-pending'}">${order.paymentStatus === 'completed' ? 'Paid' : order.paymentStatus === 'failed' ? 'Failed' : 'Pending'}</span></p>
    <p><strong>Order Status:</strong> ${STATUS_LABELS[order.status] || order.status || 'Pending'}</p>
  </div>

  <div class="footer">
    <p>Thank you for shopping with ZAUQ!</p>
    <p>For any queries, contact us at support@zauq.com</p>
  </div>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="p-6 space-y-6 w-full bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl border border-brand-primary p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-primary mb-2 flex items-center gap-2">
              <Package className="w-8 h-8" />
              Orders Management
            </h1>
            <p className="text-gray-600">View and manage customer orders (Payment Completed Only)</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              Total: <span className="text-brand-primary font-bold">{filteredOrders.length}</span> orders
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
            />
          </div>

          {/* Date From */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600 whitespace-nowrap">From:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
            />
          </div>

          {/* Date To */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600 whitespace-nowrap">To:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all cursor-pointer"
          >
            <option value="">All Status</option>
            {STATUS_FLOW.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
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
          {(filterStatus || dateFrom || dateTo || sortOrder !== 'desc' || searchQuery) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-all"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}

          {/* Orders Count */}
          <div className="ml-auto text-sm text-gray-600">
            <span className="font-bold text-brand-primary">{filteredOrders.length}</span> orders
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold text-gray-700">No orders found</p>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery ? 'Try adjusting your search criteria' : 'Orders will appear here once payment is completed'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Items</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map(order => {
                    const StatusIcon = getStatusIcon(order.status);
                    const statusColor = getStatusColor(order.status);

                    return (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        {/* Order ID */}
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-semibold text-gray-900">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                        </td>

                        {/* Transaction ID */}
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {order.trackingNumber || order._id.slice(0, 12)}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {order.user?.firstName} {order.user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{order.user?.email}</p>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {formatDate(order.createdAt)}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-brand-primary">
                            {formatCurrency(order.finalPrice || order.total)}
                          </span>
                        </td>

                        {/* Items */}
                        <td className="px-4 py-3 text-center">
                          <span className="bg-gray-100 px-2 py-1 rounded text-sm font-medium text-gray-700">
                            {order.items?.length || 0}
                          </span>
                        </td>

                        {/* Payment Status */}
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                            order.paymentStatus === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : order.paymentStatus === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            <CreditCard className="w-3 h-3" />
                            {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
                          </span>
                        </td>

                        {/* Status with Dropdown */}
                        <td className="px-4 py-3 text-center">
                          {order.status === 'delivered' || order.status === 'cancelled' ? (
                            <span className={`${statusColor.bg} ${statusColor.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {STATUS_LABELS[order.status] || order.status}
                            </span>
                          ) : (
                            <select
                              value={order.status}
                              onChange={(e) => changeStatus(order, e.target.value)}
                              className={`${statusColor.bg} ${statusColor.text} px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary`}
                            >
                              {STATUS_FLOW.map(s => (
                                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                              ))}
                            </select>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelected(order)}
                              className="p-2 rounded-lg hover:bg-brand-primary/10 text-gray-600 hover:text-brand-primary transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => downloadInvoice(order)}
                              className="p-2 rounded-lg hover:bg-green-50 text-gray-600 hover:text-green-600 transition-colors"
                              title="Download Invoice"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      {/* Order Details Modal */}
      {selected && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 overflow-y-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8 max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-brand-text-primary px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="bg-brand-primary/10 p-2 rounded-lg">
                  <FileText className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                  <p className="text-sm text-gray-600">Order #{selected._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadInvoice(selected)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download Invoice
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-brand-primary/5 rounded-xl p-4 border border-brand-primary/20">
                  <p className="text-xs font-medium text-gray-600 mb-1">Order ID</p>
                  <p className="font-mono font-bold text-gray-900">#{selected._id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-medium text-gray-600 mb-1">Transaction ID</p>
                  <p className="font-mono text-sm font-semibold text-gray-900">{selected.trackingNumber || selected._id.slice(0, 12)}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <p className="text-xs font-medium text-gray-600 mb-1">Total Amount</p>
                  <p className="text-xl font-bold text-green-700">{formatCurrency(selected.finalPrice || selected.total)}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <p className="text-xs font-medium text-gray-600 mb-1">Order Date</p>
                  <p className="font-semibold text-gray-900 text-sm">{formatDate(selected.createdAt)}</p>
                </div>
              </div>

              {/* Customer & Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-primary" />
                    Customer Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="font-semibold text-gray-900">{selected.user?.firstName} {selected.user?.lastName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-semibold text-gray-900">{selected.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-semibold text-gray-900">{selected.shippingAddress?.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-primary" />
                    Shipping Address
                  </h4>
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900">{selected.shippingAddress?.name}</p>
                    <p className="text-gray-700">{selected.shippingAddress?.address}</p>
                    <p className="text-gray-700">{selected.shippingAddress?.city}, {selected.shippingAddress?.state}</p>
                    <p className="text-gray-700">PIN: {selected.shippingAddress?.postalCode}</p>
                    <p className="text-gray-600">{selected.shippingAddress?.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-brand-primary" />
                  Order Items
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Product</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Size</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Color</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Qty</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Price</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selected.items?.map((item, idx) => (
                        <tr key={idx} className="bg-white">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.product?.images?.[0] || '/placeholder.png'}
                                alt={item.product?.name}
                                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                              />
                              <span className="font-medium text-gray-900">{item.product?.name || item.name || 'Product'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm text-gray-600">{item.size || '-'}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm text-gray-600">{item.color || '-'}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-semibold text-gray-900">{item.quantity || item.qty || 1}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-gray-900">{formatCurrency(item.price)}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-bold text-gray-900">
                              {formatCurrency((item.price || 0) * (item.quantity || item.qty || 1))}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Order Totals */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-end">
                    <div className="w-72 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(selected.totalPrice)}</span>
                      </div>
                      {selected.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Discount:</span>
                          <span className="font-medium text-green-600">-{formatCurrency(selected.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-brand-primary">{formatCurrency(selected.finalPrice || selected.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Details */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-brand-primary" />
                    Payment Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-semibold text-gray-900">{selected.paymentMethod === 'razorpay' ? 'Razorpay (Online Payment)' : selected.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selected.paymentStatus === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : selected.paymentStatus === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {PAYMENT_STATUS_LABELS[selected.paymentStatus] || selected.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-sm text-gray-900">{selected.trackingNumber || selected._id.slice(0, 12)}</span>
                    </div>
                  </div>
                </div>

                {/* Order Status */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-brand-primary" />
                    Order Status
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Status:</span>
                      {(() => {
                        const StatusIcon = getStatusIcon(selected.status);
                        const statusColor = getStatusColor(selected.status);
                        return (
                          <span className={`${statusColor.bg} ${statusColor.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {STATUS_LABELS[selected.status] || selected.status}
                          </span>
                        );
                      })()}
                    </div>
                    
                    {selected.status !== 'delivered' && selected.status !== 'cancelled' && (
                      <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-600 mb-2">Update Status:</label>
                        <select
                          value={selected.status}
                          onChange={(e) => {
                            changeStatus(selected, e.target.value);
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
                        >
                          {STATUS_FLOW.map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selected.notes && (
                <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Hash className="w-5 h-5 text-yellow-600" />
                    Order Notes
                  </h4>
                  <p className="text-gray-700">{selected.notes}</p>
                </div>
              )}
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

export default Orders;
