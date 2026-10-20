import React, { useState } from 'react';
import { Plus, Check, AlertCircle } from 'lucide-react';
import { Food } from '../types';
import { useCart } from '../context/CartContext';

interface FoodCardProps {
  food: Food;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food }) => {
  const { addToCart, items } = useCart();
  const [imgSrc, setImgSrc] = useState(food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');
  const [isAdded, setIsAdded] = useState(false);

  const cartItem = items.find((item) => item.food.id === food.id);
  const currentQuantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    if (!food.is_available) return;
    addToCart(food, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between ${
        !food.is_available ? 'opacity-75' : ''
      }`}
      data-testid="food-card"
      data-food-id={food.id}
    >
      <div>
        {/* Food Image Container */}
        <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
          <img
            src={imgSrc}
            alt={food.name}
            onError={() => setImgSrc(fallbackImage)}
            className="w-full h-full object-cover transform hover:scale-105 transition duration-300"
            loading="lazy"
          />

          {/* Veg / Non-Veg Indicator */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-md shadow-xs flex items-center space-x-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                food.is_vegetarian ? 'bg-emerald-600' : 'bg-red-600'
              }`}
              title={food.is_vegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
            />
            <span className="text-[11px] font-semibold text-gray-700">
              {food.is_vegetarian ? 'VEG' : 'NON-VEG'}
            </span>
          </div>

          {/* Availability Badge if Sold Out */}
          {!food.is_available && (
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center"
              data-testid="unavailable-badge"
            >
              <span className="bg-red-600 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-full tracking-wide shadow-md flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                Currently Unavailable
              </span>
            </div>
          )}

          {/* Category Tag */}
          {food.category_name && (
            <span className="absolute bottom-3 right-3 bg-gray-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full">
              {food.category_name}
            </span>
          )}
        </div>

        {/* Food Details */}
        <div className="p-4 sm:p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1" data-testid="food-title">
            {food.name}
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-3 h-9">
            {food.description || 'Delicious culinary preparation crafted with fresh, hand-picked ingredients.'}
          </p>
        </div>
      </div>

      {/* Card Footer: Price & Add Button */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 flex items-center justify-between border-t border-gray-50 mt-2">
        <div>
          <span className="text-xs text-gray-400 block font-medium">Price</span>
          <span className="text-lg font-black text-gray-900" data-testid="food-price">
            ₹{Number(food.price).toFixed(2)}
          </span>
        </div>

        {food.is_available ? (
          <button
            onClick={handleAddToCart}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center space-x-1.5 transition shadow-xs ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20'
            }`}
            data-testid="add-to-cart"
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>{currentQuantityInCart > 0 ? `Add (${currentQuantityInCart})` : 'Add to Cart'}</span>
              </>
            )}
          </button>
        ) : (
          <button
            disabled
            className="px-3.5 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-400 cursor-not-allowed"
            data-testid="add-to-cart-disabled"
          >
            Sold Out
          </button>
        )}
      </div>
    </div>
  );
};
