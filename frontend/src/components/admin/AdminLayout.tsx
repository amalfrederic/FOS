import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  FolderTree,
  Users,
  CreditCard,
  LogOut,
  ExternalLink,
  Menu as MenuIcon,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, testId: 'admin-nav-dashboard' },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag, testId: 'admin-nav-orders' },
    { to: '/admin/foods', label: 'Food Items', icon: UtensilsCrossed, testId: 'admin-nav-foods' },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree, testId: 'admin-nav-categories' },
    { to: '/admin/customers', label: 'Customers', icon: Users, testId: 'admin-nav-customers' },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard, testId: 'admin-nav-payments' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row text-gray-800" data-testid="admin-layout">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-gray-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg text-white">
            FoodieHub <span className="text-xs text-orange-400 font-semibold uppercase">Admin</span>
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-gray-300 hover:text-white rounded-lg focus:outline-hidden"
          aria-label="Toggle Navigation"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-gray-900 text-gray-300 flex-shrink-0 flex flex-col justify-between border-r border-gray-800 fixed md:sticky top-0 h-auto md:h-screen z-40`}
      >
        <div>
          {/* Brand & Admin Badge */}
          <div className="p-6 border-b border-gray-800 hidden md:block">
            <Link to="/admin/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-600/30">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white block">
                  Foodie<span className="text-orange-500">Hub</span>
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-800/60">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                    }`
                  }
                  data-testid={item.testId}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: View Storefront & User Info */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          <Link
            to="/"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-800 text-gray-300 hover:text-white text-xs font-semibold transition"
            data-testid="link-view-storefront"
          >
            <span>View Storefront</span>
            <ExternalLink className="w-4 h-4 text-orange-400" />
          </Link>

          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center space-x-2 truncate">
              <div className="w-8 h-8 rounded-full bg-orange-600/20 text-orange-400 font-bold flex items-center justify-center text-xs border border-orange-500/30">
                A
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-white block truncate">{user?.full_name}</span>
                <span className="text-[10px] text-gray-500 block truncate">{user?.email}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition"
              title="Sign Out"
              data-testid="admin-logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">FoodieHub Portal</span>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Management</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold">Backend Authoritative Mode</span>
            </div>
            <Link
              to="/"
              className="text-xs font-bold text-gray-600 hover:text-orange-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-orange-300 transition"
            >
              Customer Store ↗
            </Link>
          </div>
        </header>

        {/* Dynamic Page Children */}
        <main className="p-6 sm:p-8 flex-1 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
