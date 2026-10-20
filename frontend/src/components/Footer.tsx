import React from 'react';
import { UtensilsCrossed, Heart, ShieldCheck, Clock, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Foodie<span className="text-orange-500">Hub</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Good Food. Great Mood. Premium cloud kitchen delivery bringing delicious culinary crafts straight to your doorstep.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-base">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-orange-400 transition">Home</a></li>
              <li><a href="/menu" className="hover:text-orange-400 transition">Full Menu</a></li>
              <li><a href="/cart" className="hover:text-orange-400 transition">My Cart</a></li>
              <li><a href="/orders" className="hover:text-orange-400 transition">Order History</a></li>
            </ul>
          </div>

          {/* Our Promise */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-base">Quality Assurance</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                <span>100% Hygienic Preparation</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>Express 30-Minute Delivery</span>
              </li>
              <li className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-orange-500" />
                <span>Fresh & Authentic Ingredients</span>
              </li>
            </ul>
          </div>

          {/* Academic Context Notice */}
          <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/60">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block mb-1">
              Academic Project DA3
            </span>
            <p className="text-xs text-gray-300 leading-normal">
              FoodieHub Full-Stack Food Ordering System built for Design Assignment (DA3) on Automated Software Testing (Selenium, Pytest, API testing, Edge cases).
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} FoodieHub. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Engineered with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>for Software Testing Automation</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
