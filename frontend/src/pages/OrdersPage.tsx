import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, ArrowRight, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Order } from '../types';
import { orderService } from '../services/api';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm(`Are you sure you want to cancel Order #${orderId}?`)) return;
    try {
      await orderService.updateOrderStatus(orderId, 'CANCELLED');
      fetchOrders();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to cancel order.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center space-x-1"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Delivered</span>;
      case 'CANCELLED':
        return <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center space-x-1"><XCircle className="w-3.5 h-3.5 mr-1" /> Cancelled</span>;
      case 'CONFIRMED':
      case 'PREPARING':
        return <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center space-x-1"><Clock className="w-3.5 h-3.5 mr-1" /> {status}</span>;
      default:
        return <span className="bg-orange-50 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-md">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8" data-testid="orders-page">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order History</h1>
        <p className="text-sm text-gray-500 mt-1">Track current food deliveries and review past delicious meals</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 flex items-center space-x-3" data-testid="error-message">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-20" data-testid="loading-indicator">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs" data-testid="no-orders">
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">No Orders Yet</h2>
          <p className="text-sm text-gray-500">
            You haven't placed any food orders yet. Browse through our menu and place your first tasty order today!
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 hover:bg-orange-700 transition"
          >
            <span>Start Ordering</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4" data-testid="orders-list">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition space-y-4"
              data-testid={`order-card-${order.id}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                    #{order.id}
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-medium">
                      {new Date(order.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-base font-black text-gray-900">
                      ₹{Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {getStatusBadge(order.status)}
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                    Payment: {order.payment_status}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div className="text-xs text-gray-600 space-y-1">
                {order.items.map((it) => (
                  <div key={it.id} className="flex justify-between py-0.5">
                    <span>
                      <strong className="text-orange-600">{it.quantity}x</strong> {it.food_name_snapshot}
                    </span>
                    <span className="font-medium text-gray-900">
                      ₹{Number(it.line_total).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Destination & Action */}
              <div className="pt-2 border-t border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-500 gap-3">
                <p className="truncate max-w-md">
                  📍 {order.delivery_address}, {order.city} ({order.pin_code})
                </p>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  {order.status === 'PLACED' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                      data-testid={`cancel-order-${order.id}`}
                    >
                      Cancel Order
                    </button>
                  )}
                  <Link
                    to={`/order-confirmation/${order.id}`}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition"
                  >
                    View Receipt
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
