import React, { useEffect, useState } from 'react';
import OrderService from '@/services/orderService';
import { Button } from '@/components/ui/button';

const STATUS_FLOW = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

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
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [filterStatus]);

  const changeStatus = async (order, nextStatus) => {
    if (!confirm(`Change status to ${nextStatus}?`)) return;
    try {
      await OrderService.updateOrderStatus(order._id, nextStatus);
      load(page);
      if (selected && selected._id === order._id) {
        setSelected({ ...selected, status: nextStatus });
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="mt-1 text-sm text-gray-600">View and manage orders.</p>
        </div>
        <div className="flex gap-2">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="p-2 border rounded-md">
            <option value="">All</option>
            {STATUS_FLOW.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div>Loading orders...</div>
      ) : (
        <div className="bg-white border rounded-md overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left">
                <th className="p-3 border-b">Order #</th>
                <th className="p-3 border-b">User</th>
                <th className="p-3 border-b">Total</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b">Created</th>
                <th className="p-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{o._id}</td>
                  <td className="p-3 border-b">{o.user?.firstName} {o.user?.lastName}</td>
                  <td className="p-3 border-b">₹{o.total?.toFixed(2)}</td>
                  <td className="p-3 border-b">{o.status}</td>
                  <td className="p-3 border-b">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="p-3 border-b">
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setSelected(o)}>View</Button>
                      {o.status !== 'Delivered' && o.status !== 'Cancelled' && (
                        <Button size="sm" variant="outline" onClick={() => changeStatus(o, STATUS_FLOW[Math.min(STATUS_FLOW.indexOf(o.status) + 1, STATUS_FLOW.length - 1)])}>Next</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 flex items-center justify-between">
            <div>Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => load(page - 1)}>Prev</Button>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => load(page + 1)}>Next</Button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-md p-6 w-full max-w-3xl">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">Order {selected._id}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500">Close</button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold">Customer</h4>
                <div>{selected.user?.firstName} {selected.user?.lastName}</div>
                <div className="text-sm text-gray-600">{selected.user?.email}</div>

                <h4 className="font-semibold mt-4">Shipping Address</h4>
                <div>{selected.shippingAddress?.address}</div>
                <div>{selected.shippingAddress?.city}, {selected.shippingAddress?.state} - {selected.shippingAddress?.postalCode}</div>
              </div>

              <div>
                <h4 className="font-semibold">Items</h4>
                <div className="space-y-2">
                  {selected.items?.map(it => (
                    <div key={it.product?._id || it.product} className="flex items-center gap-3">
                      <img src={it.product?.images?.[0] || '/placeholder.png'} alt={it.product?.name} className="w-14 h-14 object-cover rounded" />
                      <div>
                        <div className="font-medium">{it.product?.name || it.name}</div>
                        <div className="text-sm text-gray-600">Qty: {it.qty} • ₹{it.price}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <h4 className="font-semibold mt-4">Payment</h4>
                <div>Status: {selected.paymentStatus}</div>
                <div className="mt-2 font-semibold">Total: ₹{selected.total?.toFixed(2)}</div>

                <div className="mt-4 flex gap-2">
                  {selected.status !== 'Delivered' && selected.status !== 'Cancelled' && (
                    STATUS_FLOW.map(s => (
                      s !== selected.status && <Button key={s} variant="outline" onClick={() => changeStatus(selected, s)}>{s}</Button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
