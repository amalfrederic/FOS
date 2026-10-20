import React, { useEffect, useState } from 'react';
import { Search, Users, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import { CustomerAdmin } from '../../types';
import { adminService } from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getCustomers();
      setCustomers(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load customer list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="admin-customers-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight" data-testid="admin-customers-title">
              Customer Registry
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Registered customers directory with lifetime order counts and completed spending history.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Credentials & Tokens Protected</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center space-x-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by customer name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-gray-800"
              data-testid="admin-customer-search"
            />
          </div>
          <span className="text-xs font-bold text-gray-400">
            Showing {filtered.length} customer(s)
          </span>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-20" data-testid="customers-loading">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
          </div>
        )}

        {/* Customers Table */}
        {!loading && filtered.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600" data-testid="admin-customers-table">
                <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Customer Name</th>
                    <th className="px-6 py-3">Email Address</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Registered Date</th>
                    <th className="px-6 py-3">Lifetime Orders</th>
                    <th className="px-6 py-3 text-right">Total Spent (Paid)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50/50 transition" data-testid={`customer-row-${customer.id}`}>
                      <td className="px-6 py-4 font-mono font-bold text-gray-500">
                        #{customer.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 text-sm">
                        {customer.full_name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                          {customer.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-[11px]">
                        {new Date(customer.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-800 font-bold rounded-lg text-xs">
                          {customer.orders_count} order(s)
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-emerald-600 text-sm">
                        ₹{customer.total_spent.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
