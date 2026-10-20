export interface User {
  id: number;
  full_name: string;
  email: string;
  role: string; // 'CUSTOMER' | 'ADMIN'
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface CategoryAdmin extends Category {
  foods_count: number;
}

export interface Food {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id: number;
  is_vegetarian: boolean;
  is_available: boolean;
  created_at: string;
  category_name?: string;
}

export interface FoodCreatePayload {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id: number;
  is_vegetarian: boolean;
  is_available: boolean;
}

export interface FoodUpdatePayload {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  category_id?: number;
  is_vegetarian?: boolean;
  is_available?: boolean;
}

export interface CartItem {
  food: Food;
  quantity: number;
}

export interface OrderItem {
  id: number;
  food_id: number | null;
  food_name_snapshot: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: number;
  user_id: number;
  subtotal: number;
  delivery_fee: number;
  tax_amount: number;
  total_amount: number;
  delivery_address: string;
  city: string;
  state: string;
  pin_code: string;
  contact_number: string;
  status: string;
  payment_status: string;
  idempotency_key?: string;
  created_at: string;
  items: OrderItem[];
}

export interface AdminOrder extends Order {
  customer_name: string;
  customer_email: string;
}

export interface OrderCreatePayload {
  items: { food_id: number; quantity: number }[];
  delivery_address: string;
  city: string;
  state: string;
  pin_code: string;
  contact_number: string;
  idempotency_key?: string;
}

export interface PaymentMockPayload {
  order_id: number;
  simulate_failure: boolean;
  payment_method: string;
}

export interface PaymentMockResponse {
  success: boolean;
  message: string;
  transaction_id?: string;
  order_id: number;
  payment_status: string;
  order_status: string;
}

export interface CustomerAdmin {
  id: number;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  orders_count: number;
  total_spent: number;
}

export interface PaymentAdmin {
  order_id: number;
  customer_name: string;
  customer_email: string;
  amount: number;
  payment_status: string;
  payment_method: string;
  transaction_id?: string;
  created_at: string;
}

export interface DashboardStats {
  total_orders: number;
  total_customers: number;
  total_foods: number;
  available_foods: number;
  completed_orders: number;
  pending_orders: number;
  total_revenue: number;
  recent_orders: AdminOrder[];
}
