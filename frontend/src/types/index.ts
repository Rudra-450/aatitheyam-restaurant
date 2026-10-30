export type FoodType = 'VEG' | 'NON_VEG';

export interface Restaurant {
  id: string;
  name: string;
  logo_url: string | null;
  contact_number: string | null;
  address: string | null;
  opening_hours: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  item_count?: number;
  created_at: string;
  updated_at: string;
}

export interface FoodItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  category_name?: string;
  name: string;
  image_url: string | null;
  image_public_id: string | null;
  price: number | string;
  food_type: FoodType;
  is_available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PublicCategoryWithItems extends Category {
  items: FoodItem[];
}

export interface PublicMenuResponse {
  restaurant: Restaurant;
  categories: PublicCategoryWithItems[];
  total_items: number;
}

export interface Owner {
  id: string;
  restaurant_id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_food_items: number;
  available_food_items: number;
  unavailable_food_items: number;
  total_categories: number;
  recently_updated_items: FoodItem[];
}
