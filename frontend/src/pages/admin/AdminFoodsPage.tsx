import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, AlertCircle, CheckCircle2, UtensilsCrossed } from 'lucide-react';
import { Food, Category } from '../../types';
import { adminService, foodService } from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminFoodsPage: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [foodsData, catsData] = await Promise.all([
        adminService.getFoods({
          search: search.trim() || undefined,
          category_id: selectedCategory ? Number(selectedCategory) : undefined,
        }),
        foodService.getCategories(),
      ]);
      setFoods(foodsData);
      setCategories(catsData);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load food catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleToggleAvailability = async (food: Food) => {
    try {
      const updated = await adminService.toggleFoodAvailability(food.id, !food.is_available);
      setFoods((prev) => prev.map((f) => (f.id === food.id ? updated : f)));
      setSuccessMsg(`"${food.name}" availability set to ${!food.is_available ? 'Available' : 'Unavailable'}.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to update availability.');
    }
  };

  const handleDeleteFood = async (food: Food) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${food.name}"? Historical order records will be preserved.`)) {
      return;
    }
    try {
      await adminService.deleteFood(food.id);
      setFoods((prev) => prev.filter((f) => f.id !== food.id));
      setSuccessMsg(`"${food.name}" was successfully deleted from catalog.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to delete food item.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="admin-foods-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight" data-testid="admin-foods-title">
              Food Menu Catalog
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Add new dishes, update prices, manage stock availability, and update photography.
            </p>
          </div>

          <Link
            to="/admin/foods/new"
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold tracking-wide flex items-center space-x-2 shadow-sm transition self-start sm:self-auto"
            data-testid="add-food-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </Link>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center space-x-2 text-xs font-semibold" data-testid="admin-food-error">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 flex items-center space-x-2 text-xs font-semibold" data-testid="admin-food-success">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Search & Category Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by food name or ingredient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-16 py-2 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-gray-800"
              data-testid="admin-food-search"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[11px] font-bold"
            >
              Search
            </button>
          </form>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-gray-500 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : '')}
              className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700"
              data-testid="admin-category-select"
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-20" data-testid="foods-loading">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
          </div>
        )}

        {/* Food Table */}
        {!loading && foods.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 text-sm">
            No dishes found in catalog matching the query.
          </div>
        )}

        {!loading && foods.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600" data-testid="admin-foods-table">
                <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3">Dish</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Diet</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Stock Availability</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {foods.map((food) => (
                    <tr key={food.id} className="hover:bg-gray-50/50 transition" data-testid={`food-row-${food.id}`}>
                      {/* Dish Thumbnail & Name */}
                      <td className="px-5 py-3.5 flex items-center space-x-3">
                        <img
                          src={food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                          alt={food.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 bg-gray-100"
                        />
                        <div>
                          <span className="font-bold text-gray-900 text-sm block" data-testid={`food-name-${food.id}`}>
                            {food.name}
                          </span>
                          <span className="text-[11px] text-gray-400 line-clamp-1 max-w-xs block">
                            {food.description || 'No description provided.'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-[11px] font-semibold">
                          {food.category_name || 'General'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            food.is_vegetarian
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${food.is_vegetarian ? 'bg-emerald-600' : 'bg-red-600'}`} />
                          <span>{food.is_vegetarian ? 'VEG' : 'NON-VEG'}</span>
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-black text-gray-900 text-sm">
                        ₹{Number(food.price).toFixed(2)}
                      </td>

                      {/* Availability Toggle Switch */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleAvailability(food)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold transition shadow-2xs ${
                            food.is_available
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                          data-testid={`toggle-avail-${food.id}`}
                        >
                          <span className={`w-2 h-2 rounded-full mr-1.5 ${food.is_available ? 'bg-emerald-600' : 'bg-red-600'}`} />
                          <span>{food.is_available ? 'In Stock' : 'Sold Out'}</span>
                        </button>
                      </td>

                      {/* Edit & Delete Action Buttons */}
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <Link
                          to={`/admin/foods/${food.id}/edit`}
                          className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg inline-block transition"
                          title="Edit Dish"
                          data-testid={`edit-food-${food.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteFood(food)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Dish"
                          data-testid={`delete-food-${food.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
