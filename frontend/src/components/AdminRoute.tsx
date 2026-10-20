import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]" data-testid="admin-auth-loading">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Not logged in -> send to login with redirect back
  if (!isAuthenticated || !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} state={{ from: location }} replace />;
  }

  // Logged in as customer -> access denied
  if (user.role.toUpperCase() !== 'ADMIN') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4" data-testid="admin-access-denied">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-100 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Access Denied</h2>
          <p className="text-sm text-gray-600">
            You are logged in as <span className="font-semibold text-gray-900">{user.email}</span> with role <span className="font-bold text-orange-600">{user.role}</span>. Administrator privileges are required to access this area.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 transition"
              data-testid="back-to-storefront-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
