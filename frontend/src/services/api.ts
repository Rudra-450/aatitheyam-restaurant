import axios from 'axios';
import {
  Category,
  DashboardStats,
  FoodItem,
  Owner,
  PublicMenuResponse,
  Restaurant,
} from '../types';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
    : '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Bearer token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401 unauthorized errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login') && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('token');
      localStorage.removeItem('owner');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- Public Endpoints ---
export const fetchPublicRestaurant = async (): Promise<Restaurant> => {
  const res = await api.get<Restaurant>('/restaurant');
  return res.data;
};

export const fetchPublicMenu = async (): Promise<PublicMenuResponse> => {
  const res = await api.get<PublicMenuResponse>('/menu');
  return res.data;
};

export const fetchPublicCategories = async (): Promise<Category[]> => {
  const res = await api.get<Category[]>('/categories');
  return res.data;
};

export const fetchPublicFoodItems = async (params?: {
  category_id?: string;
  food_type?: string;
  is_available?: boolean;
  q?: string;
}): Promise<FoodItem[]> => {
  const res = await api.get<FoodItem[]>('/food-items', { params });
  return res.data;
};

// --- Auth Endpoints ---
export const loginOwner = async (credentials: {
  username_or_email: string;
  password: string;
}): Promise<{ access_token: string; token_type: string; owner: Owner }> => {
  const res = await api.post('/auth/login', credentials);
  return res.data;
};

export const logoutOwner = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const fetchCurrentOwner = async (): Promise<Owner> => {
  const res = await api.get<Owner>('/auth/me');
  return res.data;
};

// --- Admin Dashboard & Profile ---
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get<DashboardStats>('/admin/dashboard/stats');
  return res.data;
};

export const fetchAdminRestaurant = async (): Promise<Restaurant> => {
  const res = await api.get<Restaurant>('/admin/restaurant');
  return res.data;
};

export const updateAdminRestaurant = async (data: Partial<Restaurant>): Promise<Restaurant> => {
  const res = await api.put<Restaurant>('/admin/restaurant', data);
  return res.data;
};

// --- Admin Categories ---
export const fetchAdminCategories = async (): Promise<Category[]> => {
  const res = await api.get<Category[]>('/admin/categories');
  return res.data;
};

export const createAdminCategory = async (data: {
  name: string;
  display_order?: number;
  is_active?: boolean;
}): Promise<Category> => {
  const res = await api.post<Category>('/admin/categories', data);
  return res.data;
};

export const updateAdminCategory = async (
  id: string,
  data: Partial<Category>
): Promise<Category> => {
  const res = await api.put<Category>(`/admin/categories/${id}`, data);
  return res.data;
};

export const deleteAdminCategory = async (id: string): Promise<void> => {
  await api.delete(`/admin/categories/${id}`);
};

export const reorderAdminCategories = async (
  items: { id: string; display_order: number }[]
): Promise<void> => {
  await api.patch('/admin/categories/reorder', { items });
};

// --- Admin Food Items ---
export const fetchAdminFoodItems = async (params?: {
  category_id?: string;
  food_type?: string;
  is_available?: boolean;
  q?: string;
}): Promise<FoodItem[]> => {
  const res = await api.get<FoodItem[]>('/admin/food-items', { params });
  return res.data;
};

export const createAdminFoodItem = async (data: {
  name: string;
  category_id: string;
  price: number;
  food_type: 'VEG' | 'NON_VEG';
  image_url?: string | null;
  image_public_id?: string | null;
  is_available?: boolean;
  display_order?: number;
}): Promise<FoodItem> => {
  const res = await api.post<FoodItem>('/admin/food-items', data);
  return res.data;
};

export const updateAdminFoodItem = async (
  id: string,
  data: Partial<FoodItem>
): Promise<FoodItem> => {
  const res = await api.put<FoodItem>(`/admin/food-items/${id}`, data);
  return res.data;
};

export const toggleFoodAvailability = async (
  id: string,
  is_available: boolean
): Promise<FoodItem> => {
  const res = await api.patch<FoodItem>(`/admin/food-items/${id}/availability`, {
    is_available,
  });
  return res.data;
};

export const deleteAdminFoodItem = async (id: string): Promise<void> => {
  await api.delete(`/admin/food-items/${id}`);
};

// --- Admin Uploads ---
export const uploadFoodImage = async (
  file: File
): Promise<{ url: string; public_id: string; filename: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/admin/uploads/food-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const uploadRestaurantLogo = async (
  file: File
): Promise<{ url: string; public_id: string; filename: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/admin/uploads/restaurant-logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
