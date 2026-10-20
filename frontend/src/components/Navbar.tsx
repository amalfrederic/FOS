import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User as UserIcon, LogOut, Menu as MenuIcon, X, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group" data-testid="brand-logo">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/30 group-hover:bg-orange-700 transition">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-orange-600 transition">
                Foodie<span className="text-orange-600">Hub</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-700">
            <Link
              to="/"
              className="hover:text-orange-600 transition-colors py-1"
              data-testid="nav-home"
            >
              Home
            </Link>
            <Link
              to="/menu"
              className="hover:text-orange-600 transition-colors py-1"
              data-testid="nav-menu"
            >
              Menu
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                className="hover:text-orange-600 transition-colors py-1"
                data-testid="nav-orders"
              >
                My Orders
              </Link>
            )}
          </nav>

          {/* Desktop Actions (Cart + Auth) */}
          <div className="hidden md:flex items-center space-x-5">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition"
              aria-label="View Cart"
              data-testid="cart-icon"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center shadow-sm"
                  data-testid="cart-count"
                >
                  {totalItemCount}
                </span>
              )}
            </Link>

            {/* User Profile / Auth Links */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-gray-200">
                {user?.role?.toUpperCase() === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold tracking-wide flex items-center space-x-1 shadow-sm transition"
                    data-testid="nav-admin-console"
                  >
                    <span>Admin Panel</span>
                  </Link>
                )}
                <div className="flex items-center space-x-2 text-sm text-gray-800">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-semibold flex items-center justify-center text-xs">
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-gray-800 truncate max-w-32" data-testid="user-name">
                    {user?.full_name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Logout"
                  data-testid="nav-logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-orange-600 transition"
                  data-testid="nav-login"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm shadow-orange-600/30 transition"
                  data-testid="nav-register"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu & Cart Button */}
          <div className="flex md:hidden items-center space-x-3">
            <Link
              to="/cart"
              className="relative p-2 text-gray-700"
              data-testid="cart-icon-mobile"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center"
                  data-testid="cart-count-mobile"
                >
                  {totalItemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Toggle Navigation Menu"
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-gray-800 hover:bg-orange-50 hover:text-orange-600"
            >
              Home
            </Link>
            <Link
              to="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-gray-800 hover:bg-orange-50 hover:text-orange-600"
            >
              Menu
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md font-medium text-gray-800 hover:bg-orange-50 hover:text-orange-600"
                >
                  My Orders
                </Link>
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between px-3">
                  <span className="text-sm font-semibold text-gray-700">{user?.full_name}</span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium text-red-600 flex items-center space-x-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-3 border-t border-gray-100 flex space-x-3 px-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 text-center py-2 text-sm font-semibold border border-gray-300 rounded-lg text-gray-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 text-center py-2 text-sm font-semibold bg-orange-600 text-white rounded-lg shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
