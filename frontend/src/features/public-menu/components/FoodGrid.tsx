import React from 'react';
import { FoodItem, PublicCategoryWithItems } from '../../../types';
import { FoodCard } from './FoodCard';
import { UtensilsCrossed, RefreshCw } from 'lucide-react';

interface FoodGridProps {
  categories: PublicCategoryWithItems[];
  selectedCategoryId: string;
  searchQuery: string;
  selectedFoodType: string;
  showOnlyAvailable: boolean;
  currency: string;
  onResetFilters: () => void;
}

export const FoodGrid: React.FC<FoodGridProps> = ({
  categories,
  selectedCategoryId,
  searchQuery,
  selectedFoodType,
  showOnlyAvailable,
  currency,
  onResetFilters,
}) => {
  // Filter logic
  const filterItem = (item: FoodItem): boolean => {
    // 1. Dietary filter
    if (selectedFoodType !== 'ALL' && item.food_type !== selectedFoodType) {
      return false;
    }
    // 2. Availability filter
    if (showOnlyAvailable && !item.is_available) {
      return false;
    }
    // 3. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCat = item.category_name?.toLowerCase().includes(q);
      if (!matchName && !matchCat) {
        return false;
      }
    }
    return true;
  };

  // Determine categories to render
  const categoriesToRender = categories
    .filter((cat) => selectedCategoryId === 'ALL' || cat.id === selectedCategoryId)
    .map((cat) => ({
      ...cat,
      filteredItems: cat.items.filter(filterItem),
    }))
    .filter((cat) => cat.filteredItems.length > 0);

  const totalFilteredItems = categoriesToRender.reduce(
    (acc, cat) => acc + cat.filteredItems.length,
    0
  );

  if (totalFilteredItems === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-[#151720] border border-white/5 rounded-3xl shadow-xl">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <UtensilsCrossed className="w-7 h-7" />
        </div>
        <h3 className="font-serif text-xl font-semibold text-white mb-2">
          No Culinary Offerings Found
        </h3>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          We couldn't find any dishes matching your current selection. Try adjusting your search or filters.
        </p>
        <button
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-semibold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-12 pb-24">
      {categoriesToRender.map((cat) => (
        <section key={cat.id} id={`category-${cat.id}`} className="scroll-mt-20">
          {/* Category Section Header */}
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-white/5">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {cat.name}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400 font-mono">
              {cat.filteredItems.length}
            </span>
          </div>

          {/* Food Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {cat.filteredItems.map((item) => (
              <FoodCard key={item.id} item={item} currency={currency} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
