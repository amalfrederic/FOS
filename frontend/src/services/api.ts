import axios from 'axios';
import {
  AuthResponse,
  Category,
  CategoryAdmin,
  Food,
  FoodCreatePayload,
  FoodUpdatePayload,
  Order,
  AdminOrder,
  OrderCreatePayload,
  PaymentMockPayload,
  PaymentMockResponse,
  User,
  DashboardStats,
  CustomerAdmin,
  PaymentAdmin,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodiehub_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async register(data: { full_name: string; email: string; password: string; confirm_password: string }): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};

export const foodService = {
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  },

  async getFoods(params?: {
    search?: string;
    category_id?: number;
    is_vegetarian?: boolean;
    is_available?: boolean;
    sort_by?: string;
    sort_order?: string;
  }): Promise<Food[]> {
    const response = await apiClient.get<Food[]>('/foods', { params });
    return response.data;
  },

  async getFoodById(id: number): Promise<Food> {
    const response = await apiClient.get<Food>(`/foods/${id}`);
    return response.data;
  },
};

export const orderService = {
  async createOrder(payload: OrderCreatePayload): Promise<Order> {
    const response = await apiClient.post<Order>('/orders', payload);
    return response.data;
  },

  async getOrders(): Promise<Order[]> {
    const response = await apiClient.get<Order[]>('/orders');
    return response.data;
  },

  async getOrderById(id: number): Promise<Order> {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const response = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },
};

export const paymentService = {
  async processMockPayment(payload: PaymentMockPayload): Promise<PaymentMockResponse> {
    const response = await apiClient.post<PaymentMockResponse>('/payments/mock', payload);
    return response.data;
  },
};

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/admin/dashboard');
    return response.data;
  },

  async getAllOrders(params?: { search?: string; status?: string; payment_status?: string }): Promise<AdminOrder[]> {
    const response = await apiClient.get<AdminOrder[]>('/admin/orders', { params });
    return response.data;
  },

  async updateOrderStatus(orderId: number, status: string): Promise<AdminOrder> {
    const response = await apiClient.patch<AdminOrder>(`/admin/orders/${orderId}/status`, { status });
    return response.data;
  },

  async getFoods(params?: { search?: string; category_id?: number }): Promise<Food[]> {
    const response = await apiClient.get<Food[]>('/admin/foods', { params });
    return response.data;
  },

  async createFood(payload: FoodCreatePayload): Promise<Food> {
    const response = await apiClient.post<Food>('/admin/foods', payload);
    return response.data;
  },

  async updateFood(foodId: number, payload: FoodUpdatePayload): Promise<Food> {
    const response = await apiClient.put<Food>(`/admin/foods/${foodId}`, payload);
    return response.data;
  },

  async toggleFoodAvailability(foodId: number, isAvailable: boolean): Promise<Food> {
    const response = await apiClient.patch<Food>(`/admin/foods/${foodId}/availability`, { is_available: isAvailable });
    return response.data;
  },

  async deleteFood(foodId: number): Promise<{ message: string; food_id: number }> {
    const response = await apiClient.delete<{ message: string; food_id: number }>(`/admin/foods/${foodId}`);
    return response.data;
  },

  async getCategories(): Promise<CategoryAdmin[]> {
    const response = await apiClient.get<CategoryAdmin[]>('/admin/categories');
    return response.data;
  },

  async createCategory(payload: { name: string; description?: string }): Promise<CategoryAdmin> {
    const response = await apiClient.post<CategoryAdmin>('/admin/categories', payload);
    return response.data;
  },

  async updateCategory(categoryId: number, payload: { name?: string; description?: string }): Promise<CategoryAdmin> {
    const response = await apiClient.put<CategoryAdmin>(`/admin/categories/${categoryId}`, payload);
    return response.data;
  },

  async deleteCategory(categoryId: number): Promise<{ message: string; category_id: number }> {
    const response = await apiClient.delete<{ message: string; category_id: number }>(`/admin/categories/${categoryId}`);
    return response.data;
  },

  async getCustomers(): Promise<CustomerAdmin[]> {
    const response = await apiClient.get<CustomerAdmin[]>('/admin/customers');
    return response.data;
  },

  async getPayments(): Promise<PaymentAdmin[]> {
    const response = await apiClient.get<PaymentAdmin[]>('/admin/payments');
    return response.data;
  },
};
