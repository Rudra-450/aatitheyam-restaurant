import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterToolbar } from '../features/public-menu/components/FilterToolbar';

describe('FilterToolbar Component', () => {
  it('renders search input and triggers onSearchChange', () => {
    const handleSearch = vi.fn();
    render(
      <FilterToolbar
        searchQuery=""
        onSearchChange={handleSearch}
        selectedFoodType="ALL"
        onFoodTypeChange={vi.fn()}
        showOnlyAvailable={false}
        onToggleOnlyAvailable={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/search our culinary creations/i);
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Biryani' } });
    expect(handleSearch).toHaveBeenCalledWith('Biryani');
  });

  it('triggers dietary toggle when Veg button clicked', () => {
    const handleTypeChange = vi.fn();
    render(
      <FilterToolbar
        searchQuery=""
        onSearchChange={vi.fn()}
        selectedFoodType="ALL"
        onFoodTypeChange={handleTypeChange}
        showOnlyAvailable={false}
        onToggleOnlyAvailable={vi.fn()}
      />
    );

    const vegButton = screen.getByRole('button', { name: /pure veg/i });
    fireEvent.click(vegButton);
    expect(handleTypeChange).toHaveBeenCalledWith('VEG');
  });
});
