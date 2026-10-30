import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FoodCard } from '../features/public-menu/components/FoodCard';
import { FoodItem } from '../types';

const mockItem: FoodItem = {
  id: 'item-1',
  restaurant_id: 'rest-1',
  category_id: 'cat-1',
  category_name: 'Main Course',
  name: 'Paneer Butter Masala',
  image_url: 'https://example.com/paneer.jpg',
  image_public_id: null,
  price: 320.0,
  food_type: 'VEG',
  is_available: true,
  display_order: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('FoodCard Component', () => {
  it('renders food item name and formatted price correctly', () => {
    render(<FoodCard item={mockItem} currency="₹" />);
    expect(screen.getByText('Paneer Butter Masala')).toBeInTheDocument();
    expect(screen.getByText('320.00')).toBeInTheDocument();
    expect(screen.getByText('Pure Veg')).toBeInTheDocument();
  });

  it('renders "Currently Unavailable" badge when item is unavailable but keeps item visible', () => {
    const unavailableItem: FoodItem = {
      ...mockItem,
      name: 'Seasonal Truffle Risotto',
      is_available: false,
    };

    render(<FoodCard item={unavailableItem} currency="₹" />);
    expect(screen.getByText('Seasonal Truffle Risotto')).toBeInTheDocument();
    expect(screen.getByText('Currently Unavailable')).toBeInTheDocument();
  });

  it('strictly enforces view-only requirement with no order or cart buttons', () => {
    render(<FoodCard item={mockItem} currency="₹" />);
    expect(screen.queryByText(/add to cart/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/order now/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/buy now/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/checkout/i)).not.toBeInTheDocument();
  });
});
