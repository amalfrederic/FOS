import React, { useEffect, useState } from 'react';
import { CreditCard, IndianRupee, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { PaymentAdmin } from '../../types';
import { adminService } from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getPayments();
      setPayments(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load payments ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalPaidRevenue = payments
    .filter((p) => p.payment_status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalSuccessful = payments.filter((p) => p.payment_status === 'PAID').length;
  const totalFailed = payments.filter((p) => p.payment_status === 'FAILED').length;

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="admin-payments-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight" data-testid="admin-payments-title">
              Payment & Settlement Ledger
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Audit trail of simulated checkout payments, authorization status, and revenue settlements.
            </p>
          </div>
          <button
            onClick={fetchPayments}
            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:text-orange-600 rounded-xl text-xs font-bold transition shadow-2xs self-start sm:self-auto"
          >
            Refresh Ledger
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center space-x-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Payment Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total Paid Revenue
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-gray-900" data-testid="stat-paid-revenue">
                ₹{totalPaidRevenue.toFixed(2)}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                Completed & Settled Funds
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Authorized Transactions
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-gray-900">
                {totalSuccessful}
              </span>
              <span className="text-[11px] text-blue-600 font-semibold block mt-1">
                Successful Payment Captures
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Declined / Failed
              </span>
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-gray-900">
                {totalFailed}
              </span>
              <span className="text-[11px] text-red-600 font-semibold block mt-1">
                Simulated Gateway Declines
              </span>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-20" data-testid="payments-loading">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
          </div>
        )}

        {/* Ledger Table */}
        {!loading && payments.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600" data-testid="admin-payments-table">
                <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3">Order</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Payment Status</th>
                    <th className="px-6 py-3">Method</th>
                    <th className="px-6 py-3">Transaction ID</th>
                    <th className="px-6 py-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((p) => (
                    <tr key={p.order_id} className="hover:bg-gray-50/50 transition" data-testid={`payment-row-${p.order_id}`}>
                      <td className="px-6 py-4 font-mono font-bold text-orange-600">
                        #{p.order_id}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900 block">{p.customer_name}</span>
                        <span className="text-[10px] text-gray-400">{p.customer_email}</span>
                      </td>
                      <td className="px-6 py-4 font-black text-gray-900 text-sm">
                        ₹{p.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            p.payment_status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700'
                              : p.payment_status === 'FAILED'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {p.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {p.payment_method}
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-gray-500">
                        {p.transaction_id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right text-[11px] text-gray-400">
                        {new Date(p.created_at).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
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
