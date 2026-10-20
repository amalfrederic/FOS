import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Users,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  IndianRupee,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { DashboardStats } from '../../types';
import { adminService } from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8" data-testid="admin-dashboard-page">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight" data-testid="admin-dashboard-title">
              System Overview & Analytics
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Live operational metrics computed directly from PostgreSQL database records.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchStats}
              className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-orange-600 rounded-xl hover:border-orange-300 transition shadow-2xs"
              title="Refresh Analytics"
              data-testid="refresh-stats-btn"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to="/admin/foods/new"
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold tracking-wide flex items-center space-x-2 shadow-sm transition"
              data-testid="quick-add-food-btn"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Dish</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 flex items-center space-x-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20" data-testid="dashboard-loading">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
          </div>
        )}

        {!loading && stats && (
          <>
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="dashboard-stat-cards">
              
              {/* Card 1: Total Revenue */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Paid Revenue
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-gray-900 block" data-testid="stat-revenue">
                    ₹{stats.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                    Strictly paid orders (PAID status)
                  </span>
                </div>
              </div>

              {/* Card 2: Total Orders */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Total Orders
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-gray-900 block" data-testid="stat-total-orders">
                    {stats.total_orders}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium mt-1 block">
                    Across all customer accounts
                  </span>
                </div>
              </div>

              {/* Card 3: Registered Customers */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Registered Customers
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-gray-900 block" data-testid="stat-total-customers">
                    {stats.total_customers}
                  </span>
                  <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
                    Customer role accounts
                  </span>
                </div>
              </div>

              {/* Card 4: Total Food Dishes */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Food Catalog
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-gray-900 block" data-testid="stat-total-foods">
                    {stats.total_foods}
                  </span>
                  <span className="text-[11px] text-amber-700 font-semibold mt-1 block" data-testid="stat-available-foods">
                    {stats.available_foods} in stock • {stats.total_foods - stats.available_foods} unavailable
                  </span>
                </div>
              </div>

              {/* Card 5: In-Flight Orders */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Active In-Flight
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-purple-900 block" data-testid="stat-pending-orders">
                    {stats.pending_orders}
                  </span>
                  <span className="text-[11px] text-purple-600 font-semibold mt-1 block">
                    Placed / Preparing / On delivery
                  </span>
                </div>
              </div>

              {/* Card 6: Completed Deliveries */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Fulfilled Orders
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-emerald-700 block" data-testid="stat-completed-orders">
                    {stats.completed_orders}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                    Delivered successfully
                  </span>
                </div>
              </div>

            </div>

            {/* Quick Navigation Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Link
                to="/admin/orders"
                className="bg-white p-4 rounded-xl border border-gray-200 hover:border-orange-500 shadow-2xs hover:shadow-xs transition flex items-center justify-between text-xs font-bold text-gray-800"
              >
                <span>Manage Customer Orders</span>
                <ArrowRight className="w-4 h-4 text-orange-600" />
              </Link>
              <Link
                to="/admin/foods"
                className="bg-white p-4 rounded-xl border border-gray-200 hover:border-orange-500 shadow-2xs hover:shadow-xs transition flex items-center justify-between text-xs font-bold text-gray-800"
              >
                <span>Edit Food Catalog</span>
                <ArrowRight className="w-4 h-4 text-orange-600" />
              </Link>
              <Link
                to="/admin/categories"
                className="bg-white p-4 rounded-xl border border-gray-200 hover:border-orange-500 shadow-2xs hover:shadow-xs transition flex items-center justify-between text-xs font-bold text-gray-800"
              >
                <span>Manage Categories</span>
                <ArrowRight className="w-4 h-4 text-orange-600" />
              </Link>
              <Link
                to="/admin/payments"
                className="bg-white p-4 rounded-xl border border-gray-200 hover:border-orange-500 shadow-2xs hover:shadow-xs transition flex items-center justify-between text-xs font-bold text-gray-800"
              >
                <span>View Payment Ledger</span>
                <ArrowRight className="w-4 h-4 text-orange-600" />
              </Link>
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Recent Customer Orders</h3>
                  <p className="text-xs text-gray-500">Live order activity across the platform</p>
                </div>
                <Link
                  to="/admin/orders"
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
                >
                  <span>View All Orders</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {stats.recent_orders.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">No orders placed yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3">Order ID</th>
                        <th className="px-6 py-3">Customer</th>
                        <th className="px-6 py-3">Items</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Payment</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {stats.recent_orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4 font-mono font-bold text-orange-600">
                            #{order.id}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-900 block">{order.customer_name}</span>
                            <span className="text-[10px] text-gray-400">{order.customer_email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-800">
                              {order.items.map((i) => `${i.quantity}x ${i.food_name_snapshot}`).join(', ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">
                            ₹{order.total_amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                order.payment_status === 'PAID'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {order.payment_status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700">
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              to="/admin/orders"
                              className="text-xs font-bold text-orange-600 hover:text-orange-700 underline"
                            >
                              Manage
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};
