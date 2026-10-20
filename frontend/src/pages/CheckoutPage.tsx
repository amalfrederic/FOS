import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, CreditCard, Smartphone, Banknote, Building2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { orderService, paymentService } from '../services/api';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, deliveryFee, taxAmount, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  // Delivery Details Form State
  const [formData, setFormData] = useState({
    delivery_address: '42, MG Road, Koramangala 4th Block',
    city: 'Bengaluru',
    state: 'Karnataka',
    pin_code: '560034',
    contact_number: '9876543210',
  });

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'COD'>('UPI');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add food items to checkout.');
      return;
    }

    // Client-side quick checks (Backend will rigorously validate)
    if (!formData.delivery_address.trim() || formData.delivery_address.trim().length < 5) {
      setErrorMessage('Please provide a complete street delivery address.');
      return;
    }
    if (!/^[1-9][0-9]{5}$/.test(formData.pin_code.trim())) {
      setErrorMessage('Please enter a valid 6-digit Indian PIN code (cannot start with 0).');
      return;
    }
    const cleanPhone = formData.contact_number.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please provide a valid 10-digit mobile number.');
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Create order on backend
      const orderPayload = {
        items: items.map((i) => ({ food_id: i.food.id, quantity: i.quantity })),
        delivery_address: formData.delivery_address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pin_code: formData.pin_code.trim(),
        contact_number: formData.contact_number.trim(),
        idempotency_key: `IDEM_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      };

      const createdOrder = await orderService.createOrder(orderPayload);

      // 2. Process mock payment simulation
      const paymentResponse = await paymentService.processMockPayment({
        order_id: createdOrder.id,
        simulate_failure: simulateFailure,
        payment_method: paymentMethod,
      });

      if (!paymentResponse.success) {
        setErrorMessage(paymentResponse.message || 'Payment simulation failed. Order status is marked FAILED/CANCELLED.');
        setIsSubmitting(false);
        return;
      }

      // Order & payment success! Clear cart and route to confirmation
      clearCart();
      navigate(`/order-confirmation/${createdOrder.id}`);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === 'string') {
        setErrorMessage(detail);
      } else if (Array.isArray(detail)) {
        setErrorMessage(detail.map((d: any) => d.msg).join(', '));
      } else {
        setErrorMessage('Failed to place order. Please review your address details and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8" data-testid="checkout-page">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Checkout</h1>
        <p className="text-sm text-gray-500 mt-1">Provide delivery destination and select simulated payment method</p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 flex items-start space-x-3" data-testid="error-message">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm font-semibold">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Delivery & Payment Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Delivery Address */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-gray-900">1. Delivery Destination</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Street Address & Flat / House No. *
                </label>
                <input
                  type="text"
                  name="delivery_address"
                  required
                  value={formData.delivery_address}
                  onChange={handleInputChange}
                  placeholder="e.g. 42, Green Park Avenue, 2nd Floor"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  data-testid="input-address"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Bengaluru"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    data-testid="input-city"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="e.g. Karnataka"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    data-testid="input-state"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Postal PIN Code (6 Digits) *
                  </label>
                  <input
                    type="text"
                    name="pin_code"
                    required
                    maxLength={6}
                    value={formData.pin_code}
                    onChange={handleInputChange}
                    placeholder="560034"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    data-testid="input-pincode"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Contact Phone Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    name="contact_number"
                    required
                    maxLength={14}
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    data-testid="input-phone"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Simulated Payment Selection */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">2. Simulated Payment Method</h2>
              <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md">
                Academic Simulation Mode
              </span>
            </div>

            <p className="text-xs text-gray-500">
              For testing and academic demonstration only. No real banking details are collected or charged.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="payment-methods-grid">
              {[
                { id: 'UPI', label: 'Instant UPI (GPay / PhonePe)', icon: Smartphone },
                { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard },
                { id: 'NETBANKING', label: 'Net Banking', icon: Building2 },
                { id: 'COD', label: 'Cash on Delivery', icon: Banknote },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setPaymentMethod(id as any)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition ${
                    paymentMethod === id
                      ? 'border-orange-600 bg-orange-50/50 ring-1 ring-orange-500 text-orange-950 font-bold'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700 font-medium'
                  }`}
                  data-testid={`payment-method-${id}`}
                >
                  <div className={`p-2 rounded-xl ${paymentMethod === id ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>

            {/* Test Edge Case Simulation Toggle */}
            <div className="pt-4 border-t border-gray-100 bg-amber-50/50 -mx-6 -mb-6 p-6 rounded-b-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-900 block">
                    🧪 Automated Test Hook: Simulate Gateway Failure
                  </span>
                  <span className="text-xs text-amber-700">
                    Toggle ON to test how the system handles payment decline and rollback
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="simulateFailureToggle"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="w-5 h-5 text-orange-600 rounded-md focus:ring-orange-500 cursor-pointer"
                  data-testid="toggle-simulate-failure"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Order Review & Submit (1 col) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
            Order Review
          </h2>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {items.map(({ food, quantity }) => (
              <div key={food.id} className="flex justify-between items-center text-xs text-gray-700">
                <span className="truncate max-w-[180px]">
                  {quantity}x {food.name}
                </span>
                <span className="font-semibold text-gray-900">
                  ₹{(Number(food.price) * quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-gray-900">
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span className="font-semibold text-gray-900">₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between text-base font-black text-gray-900">
              <span>Amount Payable</span>
              <span className="text-xl text-orange-600" data-testid="checkout-total">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-600/30 flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
            data-testid="place-order"
          >
            {isSubmitting ? (
              <span>Processing Order...</span>
            ) : (
              <span>Confirm & Place Order (₹{totalAmount.toFixed(2)})</span>
            )}
          </button>

          <div className="text-center text-[11px] text-gray-400 flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted SSL Simulated Checkout</span>
          </div>
        </div>

      </form>
    </div>
  );
};
