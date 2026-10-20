import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, AlertCircle, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client validation
    if (!email.trim() || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    try {
      const authRes = await login({ email: email.trim(), password });
      const userRole = authRes.user.role.toUpperCase();

      if (userRole === 'ADMIN') {
        if (redirectPath && redirectPath.startsWith('/admin')) {
          navigate(redirectPath, { replace: true });
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      } else {
        if (redirectPath && !redirectPath.startsWith('/admin') && redirectPath !== '/login') {
          navigate(redirectPath, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join(', '));
      } else {
        setError('Login failed. Please verify credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12" data-testid="login-page">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-md p-8 sm:p-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-orange-600/30">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-gray-500">Sign in to track orders, reorder favorites, and checkout easily</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 flex items-center space-x-2 text-xs font-semibold" data-testid="error-message">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-gray-800"
                data-testid="login-email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-gray-800"
                data-testid="login-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-600/30 flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
            data-testid="login-submit"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to FoodieHub</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Helpers */}
        <div className="pt-3 border-t border-gray-100 text-center">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
            Quick Demo Autofill (Academic Testing)
          </span>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials('customer@foodiehub.com', 'Password123!')}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition"
              data-testid="demo-customer-btn"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin@foodiehub.com', 'Admin123!')}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              data-testid="demo-admin-btn"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center text-xs text-gray-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-orange-600 font-bold hover:underline" data-testid="link-to-register">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
