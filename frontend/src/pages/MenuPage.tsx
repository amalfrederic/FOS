import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, AlertCircle, RefreshCw, X } from 'lucide-react';
import { Category, Food } from '../types';
import { foodService } from '../services/api';
import { FoodCard } from '../components/FoodCard';

export const MenuPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state from query parameters
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') ? Number(searchParams.get('category')) : null;
  const dietaryFilter = searchParams.get('diet') || 'ALL'; // 'ALL', 'VEG', 'NON_VEG'
  const sortByPrice = searchParams.get('sort') || ''; // '', 'asc', 'desc'

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await foodService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  const loadFoods = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory) params.category_id = selectedCategory;
      if (dietaryFilter === 'VEG') params.is_vegetarian = true;
      if (dietaryFilter === 'NON_VEG') params.is_vegetarian = false;
      if (sortByPrice) {
        params.sort_by = 'price';
        params.sort_order = sortByPrice;
      }

      const data = await foodService.getFoods(params);
      setFoods(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to fetch food items. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoods();
  }, [searchQuery, selectedCategory, dietaryFilter, sortByPrice]);

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === 'ALL') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight" data-testid="menu-heading">
          Explore Our Menu
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Handcrafted dishes cooked fresh to order by certified culinary masters.
        </p>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search food by name, ingredients, or cuisine..."
            value={searchQuery}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800"
            data-testid="menu-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => updateFilter('search', null)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear Search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Tags: Categories, Diet, Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
          
          {/* Category Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => updateFilter('category', null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === null
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              data-testid="category-filter-all"
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateFilter('category', String(cat.id))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                data-testid={`category-filter-${cat.id}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Secondary Controls: Diet and Sorting */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Dietary Toggle */}
            <div className="inline-flex rounded-lg bg-gray-100 p-0.5 text-xs font-medium text-gray-700">
              <button
                onClick={() => updateFilter('diet', 'ALL')}
                className={`px-2.5 py-1 rounded-md transition ${dietaryFilter === 'ALL' ? 'bg-white shadow-xs font-bold text-gray-900' : 'text-gray-500'}`}
                data-testid="filter-all"
              >
                All
              </button>
              <button
                onClick={() => updateFilter('diet', 'VEG')}
                className={`px-2.5 py-1 rounded-md transition ${dietaryFilter === 'VEG' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-500'}`}
                data-testid="filter-veg"
              >
                Veg
              </button>
              <button
                onClick={() => updateFilter('diet', 'NON_VEG')}
                className={`px-2.5 py-1 rounded-md transition ${dietaryFilter === 'NON_VEG' ? 'bg-red-600 text-white font-bold' : 'text-gray-500'}`}
                data-testid="filter-non-veg"
              >
                Non-Veg
              </button>
            </div>

            {/* Price Sort Dropdown */}
            <select
              value={sortByPrice}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 font-medium text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
              data-testid="sort-select"
            >
              <option value="">Sort: Featured</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between text-red-800" data-testid="error-message">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={loadFoods}
            className="flex items-center space-x-1 text-xs font-bold text-red-700 underline hover:no-underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20" data-testid="loading-indicator">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
          <p className="text-gray-400 text-xs mt-3">Loading menu delicacies...</p>
        </div>
      )}

      {/* Food Items Grid */}
      {!loading && !error && foods.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="menu-food-grid">
          {foods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && foods.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-md mx-auto space-y-4" data-testid="empty-results">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto text-2xl">
            🍽️
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Food Items Found</h3>
          <p className="text-sm text-gray-500">
            We couldn't find any dishes matching your current search or filter criteria.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition"
            data-testid="reset-filters-btn"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
