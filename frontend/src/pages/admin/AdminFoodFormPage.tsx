import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, UtensilsCrossed, Image as ImageIcon } from 'lucide-react';
import { Category } from '../../types';
import { adminService, foodService } from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminFoodFormPage: React.FC = () => {
  const { foodId } = useParams<{ foodId?: string }>();
  const isEditing = Boolean(foodId);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_vegetarian: true,
    is_available: true,
  });

  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeForm = async () => {
      try {
        setFetchingDetails(true);
        const cats = await foodService.getCategories();
        setCategories(cats);
        if (cats.length > 0 && !formData.category_id) {
          setFormData((prev) => ({ ...prev, category_id: String(cats[0].id) }));
        }

        if (isEditing && foodId) {
          const food = await foodService.getFoodById(Number(foodId));
          setFormData({
            name: food.name,
            description: food.description || '',
            price: String(food.price),
            category_id: String(food.category_id),
            image_url: food.image_url || '',
            is_vegetarian: food.is_vegetarian,
            is_available: food.is_available,
          });
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to initialize food form data.');
      } finally {
        setFetchingDetails(false);
      }
    };

    initializeForm();
  }, [foodId, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form boundary validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError('Food dish name must be at least 2 characters long.');
      return;
    }

    const numPrice = Number(formData.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Price must be a valid positive number greater than zero.');
      return;
    }

    if (!formData.category_id) {
      setError('Please select a valid food category.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: numPrice,
        category_id: Number(formData.category_id),
        image_url: formData.image_url.trim() || undefined,
        is_vegetarian: formData.is_vegetarian,
        is_available: formData.is_available,
      };

      if (isEditing && foodId) {
        await adminService.updateFood(Number(foodId), payload);
      } else {
        await adminService.createFood(payload);
      }

      navigate('/admin/foods');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join(', '));
      } else {
        setError('Failed to save food dish. Please check field values.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6" data-testid="admin-food-form-page">
        {/* Top Back Link */}
        <Link
          to="/admin/foods"
          className="inline-flex items-center space-x-2 text-xs font-bold text-gray-500 hover:text-orange-600 transition"
          data-testid="cancel-food-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Foods Catalog</span>
        </Link>

        {/* Form Card Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight" data-testid="food-form-title">
            {isEditing ? 'Edit Culinary Dish' : 'Add New Food Item'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Fill in the dish specifications, pricing, imagery, and dietary categorization.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center space-x-2 text-xs font-semibold" data-testid="error-message">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {fetchingDetails ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
            
            {/* Dish Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Dish Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Paneer Butter Masala"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-gray-900"
                data-testid="input-food-name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Description & Ingredients
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe flavors, aromatic herbs, and serving portions..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-gray-900"
                data-testid="input-food-description"
              />
            </div>

            {/* Price and Category in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Price in INR (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="249.00"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-gray-900"
                  data-testid="input-food-price"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category_id"
                  required
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                  data-testid="select-food-category"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image URL & Live Preview */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Food Image URL
              </label>
              <div className="flex gap-4 items-start">
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-gray-900"
                  data-testid="input-food-image"
                />
                <div className="w-16 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {formData.image_url ? (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Dietary Preference & Availability Checkboxes */}
            <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_vegetarian"
                  checked={formData.is_vegetarian}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-600 rounded-md focus:ring-emerald-500"
                  data-testid="checkbox-is-vegetarian"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Vegetarian Dish</span>
                  <span className="text-[11px] text-gray-500">Green veg dot indicator badge</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleChange}
                  className="w-5 h-5 text-orange-600 rounded-md focus:ring-orange-500"
                  data-testid="checkbox-is-available"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">In Stock & Available</span>
                  <span className="text-[11px] text-gray-500">Customers can order this dish</span>
                </div>
              </label>
            </div>

            {/* Form Action Buttons */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
              <Link
                to="/admin/foods"
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/25 flex items-center space-x-2 transition disabled:opacity-50"
                data-testid="save-food-btn"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving Dish...' : isEditing ? 'Update Dish' : 'Create Dish'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};
