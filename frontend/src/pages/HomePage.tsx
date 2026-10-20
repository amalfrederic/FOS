import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, ShieldCheck, Zap, Award, Sparkles } from 'lucide-react';
import { Category, Food } from '../types';
import { foodService } from '../services/api';
import { FoodCard } from '../components/FoodCard';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredFoods, setFeaturedFoods] = useState<Food[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [cats, foods] = await Promise.all([
          foodService.getCategories(),
          foodService.getFoods(),
        ]);
        setCategories(cats);
        // Pick first 6 available items as featured
        setFeaturedFoods(foods.filter((f) => f.is_available).slice(0, 6));
      } catch (err) {
        console.error("Error loading home page content", err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/menu');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-orange-50/80 via-white to-transparent pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-orange-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Fastest Delivery in 30 Minutes</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-tight" data-testid="hero-headline">
              Good Food. <span className="text-orange-600">Great Mood.</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Savor chef-curated gourmet burgers, sizzling pizzas, aromatic biryanis, and decadent desserts delivered fresh and steaming hot to your door.
            </p>

            {/* Search Bar in Hero */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto relative pt-2" data-testid="hero-search-form">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search for Paneer Butter Masala, Burgers, Biryani..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-32 py-3.5 bg-white rounded-2xl border border-gray-200 shadow-md focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-800 placeholder-gray-400"
                  data-testid="hero-search-input"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
                  data-testid="hero-search-button"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick CTA */}
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Link
                to="/menu"
                className="px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-600/25 flex items-center space-x-2 transition"
                data-testid="explore-menu-btn"
              >
                <span>Explore Full Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions / Why FoodieHub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Lightning 30-Min Delivery</h4>
              <p className="text-gray-500 text-xs mt-0.5">Hot, fresh meals delivered straight from the kitchen.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">FSSAI Certified Hygiene</h4>
              <p className="text-gray-500 text-xs mt-0.5">Contactless packaging and kitchen sanitization standards.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Free Delivery on ₹500+</h4>
              <p className="text-gray-500 text-xs mt-0.5">Zero delivery fee applied automatically at checkout.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse By Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="categories-section">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Browse by Category</h2>
            <p className="text-sm text-gray-500 mt-1">Explore authentic cuisines and delectable snacks</p>
          </div>
          <Link to="/menu" className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/menu?category=${cat.id}`}
              className="bg-white hover:bg-orange-50/60 p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-orange-200 hover:shadow-md transition text-center group"
              data-testid={`category-card-${cat.id}`}
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-orange-100 group-hover:bg-orange-200 text-orange-600 flex items-center justify-center text-lg font-bold mb-3 transition">
                {cat.name.charAt(0)}
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-orange-600 text-sm transition">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured / Popular Dishes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="featured-section">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Popular Dishes</h2>
            <p className="text-sm text-gray-500 mt-1">Customer favorites prepared fresh on every single order</p>
          </div>
          <Link to="/menu" className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center space-x-1">
            <span>See Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12" data-testid="loading-indicator">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
