import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Package, MapPin, Receipt, Clock } from 'lucide-react';
import { Order } from '../types';
import { orderService } from '../services/api';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await orderService.getOrderById(Number(id));
        setOrder(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to retrieve order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]" data-testid="loading-indicator">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-red-600 text-3xl font-bold">⚠️ Error</div>
        <p className="text-gray-600 text-sm">{error || 'Order could not be located.'}</p>
        <Link to="/orders" className="text-orange-600 font-semibold underline text-sm">
          Return to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8" data-testid="order-confirmation">
      {/* Success Banner */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Order Placed Successfully
        </span>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Thank you! Your order is being prepared.
        </h1>
        <p className="text-sm text-gray-500 max-w-lg mx-auto">
          We have received your order and the kitchen has begun preparation. Estimated delivery time is approximately 30 minutes.
        </p>
        <div className="pt-2 text-sm text-gray-700">
          Order Reference ID: <span className="font-mono font-bold text-orange-600 text-base" data-testid="order-id">#{order.id}</span>
        </div>
      </div>

      {/* Order Status Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="w-5 h-5 text-orange-600" />
            <div>
              <span className="text-xs text-gray-400 block font-medium">Order Status</span>
              <span className="text-sm font-bold text-gray-900" data-testid="order-status">
                {order.status}
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700">
            {order.status === 'CONFIRMED' || order.status === 'PLACED' ? 'In Progress' : order.status}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="text-xs text-gray-400 block font-medium">Payment Status</span>
              <span className="text-sm font-bold text-gray-900" data-testid="payment-status">
                {order.payment_status}
              </span>
            </div>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
              order.payment_status === 'PAID'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {order.payment_status}
          </span>
        </div>
      </div>

      {/* Details breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
          <span>Items Ordered</span>
        </h2>

        {/* Items List */}
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-3.5 flex justify-between items-center text-sm">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-orange-600 text-xs bg-orange-50 w-6 h-6 rounded flex items-center justify-center">
                  {item.quantity}x
                </span>
                <span className="font-semibold text-gray-900">{item.food_name_snapshot}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block font-normal">
                  ₹{Number(item.unit_price).toFixed(2)} each
                </span>
                <span className="font-bold text-gray-900">
                  ₹{Number(item.line_total).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary pricing */}
        <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-900">₹{Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-semibold text-gray-900">
              {Number(order.delivery_fee) === 0 ? 'FREE' : `₹${Number(order.delivery_fee).toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>GST Tax (5%)</span>
            <span className="font-semibold text-gray-900">₹{Number(order.tax_amount).toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-black text-gray-900">
            <span>Total Paid</span>
            <span className="text-xl text-orange-600" data-testid="order-final-amount">₹{Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="border-t border-gray-100 pt-4 text-xs text-gray-600 flex items-start space-x-3 bg-gray-50/60 p-4 rounded-xl">
          <MapPin className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-gray-900 block mb-0.5">Delivery Destination</span>
            <p>{order.delivery_address}, {order.city}, {order.state} - {order.pin_code}</p>
            <p className="mt-1 font-medium">Contact: {order.contact_number}</p>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to="/orders"
          className="w-full sm:w-auto px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-600/20 text-center transition"
          data-testid="view-orders-btn"
        >
          View in My Orders
        </Link>
        <Link
          to="/menu"
          className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl font-bold text-sm text-center transition"
          data-testid="back-to-menu-btn"
        >
          Order More Food
        </Link>
      </div>
    </div>
  );
};
