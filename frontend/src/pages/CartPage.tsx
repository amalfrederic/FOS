import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, deliveryFee, taxAmount, totalAmount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center" data-testid="empty-cart">
        <div className="max-w-md mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-xs space-y-5">
          <div className="w-20 h-20 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Your Cart is Empty</h2>
          <p className="text-gray-500 text-sm">
            Looks like you haven't added anything to your cart yet. Explore our delicious menu and satisfy your cravings!
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-600/20 transition"
            data-testid="browse-menu-btn"
          >
            <span>Browse Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8" data-testid="cart-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Food Cart</h1>
          <p className="text-sm text-gray-500 mt-1">Review your selections and customize quantities before checkout</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
          data-testid="clear-cart-btn"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ food, quantity }) => (
            <div
              key={food.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
              data-testid={`cart-item-${food.id}`}
            >
              {/* Item Info */}
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <img
                  src={food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                  alt={food.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2 h-2 rounded-full ${food.is_vegetarian ? 'bg-emerald-600' : 'bg-red-600'}`}
                    />
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">{food.name}</h3>
                  </div>
                  <span className="text-xs text-gray-500 mt-0.5 block">
                    Unit Price: ₹{Number(food.price).toFixed(2)}
                  </span>
                  <span className="text-sm font-black text-orange-600 mt-1 block">
                    ₹{(Number(food.price) * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Quantity Selector & Remove Button */}
              <div className="flex items-center justify-between sm:justify-end space-x-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(food.id, quantity - 1)}
                    className="p-1 rounded-lg text-gray-600 hover:bg-white hover:text-orange-600 transition"
                    aria-label="Decrease Quantity"
                    data-testid={`qty-minus-${food.id}`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span
                    className="w-8 text-center text-sm font-bold text-gray-800"
                    data-testid={`cart-quantity-${food.id}`}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(food.id, quantity + 1)}
                    disabled={quantity >= 50}
                    className="p-1 rounded-lg text-gray-600 hover:bg-white hover:text-orange-600 transition disabled:opacity-40"
                    aria-label="Increase Quantity"
                    data-testid={`qty-plus-${food.id}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(food.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                  title="Remove Item"
                  data-testid={`remove-item-${food.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Bill Summary */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
            Bill Summary
          </h2>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="font-semibold text-gray-900" data-testid="cart-subtotal">₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span>Delivery Fee</span>
                {deliveryFee === 0 && (
                  <span className="ml-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    FREE
                  </span>
                )}
              </div>
              <span className="font-semibold text-gray-900" data-testid="cart-delivery-fee">
                {deliveryFee === 0 ? '₹0.00' : `₹${deliveryFee.toFixed(2)}`}
              </span>
            </div>

            {deliveryFee > 0 && (
              <div className="text-[11px] text-orange-600 bg-orange-50 p-2 rounded-lg">
                Add items worth ₹{(500 - subtotal).toFixed(2)} more to unlock FREE delivery!
              </div>
            )}

            <div className="flex justify-between">
              <span>GST Tax (5%)</span>
              <span className="font-semibold text-gray-900" data-testid="cart-tax">₹{taxAmount.toFixed(2)}</span>
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-black text-gray-900">
              <span>Final Total</span>
              <span className="text-xl text-orange-600" data-testid="cart-total">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleProceedToCheckout}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-600/30 flex items-center justify-center space-x-2 transition cursor-pointer"
            data-testid="checkout-button"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center space-x-2 text-xs text-gray-400 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Prices verified strictly by backend database</span>
          </div>
        </div>
      </div>
    </div>
  );
};
