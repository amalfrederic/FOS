import React, { useEffect, useState } from 'react';
import { Search, Filter, AlertCircle, CheckCircle2, ChevronRight, X, Clock, MapPin, Phone } from 'lucide-react';
import { AdminOrder } from '../../types';
import { adminService } from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';

const ALLOWED_NEXT_STATUS: Record<string, string[]> = {
  PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter controls
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('ALL');

  // Selected order modal for details
  const [inspectOrder, setInspectOrder] = useState<AdminOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAllOrders({
        search: searchTerm.trim() || undefined,
        status: selectedStatus,
        payment_status: selectedPaymentStatus,
      });
      setOrders(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to retrieve orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, selectedPaymentStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusChange = async (orderId: number, nextStatus: string) => {
    try {
      setUpdatingId(orderId);
      setError(null);
      setSuccessMsg(null);
      const updated = await adminService.updateOrderStatus(orderId, nextStatus);
      
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (inspectOrder && inspectOrder.id === orderId) {
        setInspectOrder(updated);
      }
      setSuccessMsg(`Order #${orderId} status successfully transitioned to ${nextStatus}.`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err?.response?.data?.detail || `Failed to update status for Order #${orderId}.`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="admin-orders-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight" data-testid="admin-orders-title">
              Customer Orders Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Review platform-wide customer orders and control the live kitchen fulfillment lifecycle.
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:text-orange-600 rounded-xl text-xs font-bold transition shadow-2xs self-start sm:self-auto"
          >
            Refresh List
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center space-x-2 text-xs font-semibold" data-testid="admin-error-message">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 flex items-center space-x-2 text-xs font-semibold" data-testid="admin-success-message">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Order #, customer name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-16 py-2 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-gray-800"
              data-testid="admin-orders-search-input"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[11px] font-bold"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center space-x-1.5 text-xs text-gray-600">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700"
                data-testid="filter-order-status"
              >
                <option value="ALL">All Statuses</option>
                <option value="PLACED">Placed</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PREPARING">Preparing</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-gray-600">
              <span>Payment:</span>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700"
                data-testid="filter-payment-status"
              >
                <option value="ALL">All Payments</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-20" data-testid="orders-loading">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
          </div>
        )}

        {/* Orders Table */}
        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 text-sm">
            No customer orders matching the specified filter criteria were found.
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600" data-testid="admin-orders-table">
                <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Customer Details</th>
                    <th className="px-5 py-3">Dishes</th>
                    <th className="px-5 py-3">Total Amount</th>
                    <th className="px-5 py-3">Payment</th>
                    <th className="px-5 py-3">Current Status</th>
                    <th className="px-5 py-3 text-right">Transition Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => {
                    const validTransitions = ALLOWED_NEXT_STATUS[order.status] || [];
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition" data-testid={`admin-order-row-${order.id}`}>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setInspectOrder(order)}
                            className="font-mono font-bold text-orange-600 hover:underline block text-left"
                            data-testid={`inspect-order-${order.id}`}
                          >
                            #{order.id}
                          </button>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            {new Date(order.created_at).toLocaleString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-bold text-gray-900 block">{order.customer_name}</span>
                          <span className="text-[11px] text-gray-400 block">{order.customer_email}</span>
                          <span className="text-[10px] text-gray-500 block">📞 {order.contact_number}</span>
                        </td>

                        <td className="px-5 py-4 max-w-xs truncate">
                          <span className="font-medium text-gray-800 block truncate">
                            {order.items.map((i) => `${i.quantity}x ${i.food_name_snapshot}`).join(', ')}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {order.items.length} item line(s)
                          </span>
                        </td>

                        <td className="px-5 py-4 font-black text-gray-900 text-sm">
                          ₹{order.total_amount.toFixed(2)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              order.payment_status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {order.payment_status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              order.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                            data-testid={`order-status-badge-${order.id}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          {validTransitions.length > 0 ? (
                            <div className="flex items-center justify-end space-x-1.5">
                              {validTransitions.map((target) => (
                                <button
                                  key={target}
                                  disabled={updatingId === order.id}
                                  onClick={() => handleStatusChange(order.id, target)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow-2xs disabled:opacity-50 ${
                                    target === 'CANCELLED'
                                      ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                      : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/20'
                                  }`}
                                  data-testid={`transition-${order.id}-to-${target}`}
                                >
                                  {target === 'CONFIRMED' && 'Confirm'}
                                  {target === 'PREPARING' && 'Cook/Prepare'}
                                  {target === 'OUT_FOR_DELIVERY' && 'Dispatch'}
                                  {target === 'DELIVERED' && 'Delivered'}
                                  {target === 'CANCELLED' && 'Cancel'}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-semibold italic">Terminal State</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Details Drawer / Modal */}
        {inspectOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-base font-bold text-orange-600">Order #{inspectOrder.id}</span>
                  <span className="text-xs bg-orange-50 text-orange-700 font-bold px-2 py-0.5 rounded">
                    {inspectOrder.status}
                  </span>
                </div>
                <button
                  onClick={() => setInspectOrder(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer and Delivery info */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-xs text-gray-700">
                <div className="font-bold text-gray-900 text-sm">{inspectOrder.customer_name}</div>
                <div>Email: {inspectOrder.customer_email}</div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-orange-600" />
                  <span>{inspectOrder.contact_number}</span>
                </div>
                <div className="flex items-start space-x-1 text-gray-600 pt-1 border-t border-gray-200">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                  <span>
                    {inspectOrder.delivery_address}, {inspectOrder.city}, {inspectOrder.state} - {inspectOrder.pin_code}
                  </span>
                </div>
              </div>

              {/* Ordered items list */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Items Snapshot</h4>
                <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                  {inspectOrder.items.map((item) => (
                    <div key={item.id} className="py-2 flex justify-between text-xs">
                      <span>
                        <strong className="text-orange-600">{item.quantity}x</strong> {item.food_name_snapshot}
                      </span>
                      <span className="font-semibold text-gray-900">₹{item.line_total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-3 text-xs space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{inspectOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>₹{inspectOrder.delivery_fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5% GST):</span>
                  <span>₹{inspectOrder.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-900 pt-1 border-t border-gray-100">
                  <span>Total Amount:</span>
                  <span className="text-orange-600">₹{inspectOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setInspectOrder(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
