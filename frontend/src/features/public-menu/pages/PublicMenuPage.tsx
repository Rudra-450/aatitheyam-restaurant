import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicMenu } from '../../../services/api';
import { FoodType } from '../../../types';
import { MenuHeader } from '../components/MenuHeader';
import { CategoryNav } from '../components/CategoryNav';
import { FilterToolbar } from '../components/FilterToolbar';
import { FoodGrid } from '../components/FoodGrid';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const PublicMenuPage: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFoodType, setSelectedFoodType] = useState<FoodType | 'ALL'>('ALL');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState<boolean>(false);

  // TanStack Query for public menu data with live synchronization
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['publicMenu'],
    queryFn: fetchPublicMenu,
    staleTime: 10000,
    refetchInterval: 15000, // Automatic 15-second synchronization
    refetchOnWindowFocus: true,
  });

  const handleResetFilters = () => {
    setSelectedCategoryId('ALL');
    setSearchQuery('');
    setSelectedFoodType('ALL');
    setShowOnlyAvailable(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c0d12] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
        <h2 className="font-serif text-xl font-bold text-white mb-1">
          Aatitheyam Cafe & Bhojnalaya
        </h2>
        <p className="text-xs text-gray-400 tracking-widest uppercase">
          Curating Fresh Digital Menu...
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[#0c0d12] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-white mb-2">
          Unable to Load Digital Menu
        </h2>
        <p className="text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
          {error instanceof Error ? error.message : 'Please check your connection and try again.'}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-semibold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0d12] text-gray-100 flex flex-col">
      {/* Restaurant Header */}
      <MenuHeader restaurant={data.restaurant} />

      {/* Sticky Category Navigation */}
      <CategoryNav
        categories={data.categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        totalItems={data.total_items}
      />

      {/* Filter and Search Toolbar */}
      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedFoodType={selectedFoodType}
        onFoodTypeChange={setSelectedFoodType}
        showOnlyAvailable={showOnlyAvailable}
        onToggleOnlyAvailable={() => setShowOnlyAvailable((prev) => !prev)}
      />

      {/* Food Items Display */}
      <main className="flex-1">
        <FoodGrid
          categories={data.categories}
          selectedCategoryId={selectedCategoryId}
          searchQuery={searchQuery}
          selectedFoodType={selectedFoodType}
          showOnlyAvailable={showOnlyAvailable}
          currency={data.restaurant.currency}
          onResetFilters={handleResetFilters}
        />
      </main>

      {/* Luxury Footer */}
      <footer className="mt-auto border-t border-white/5 bg-[#090a0f] py-8 px-4 text-center">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} {data.restaurant.name}. All culinary rights reserved.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Digital View-Only Menu Platform</span>
            </div>
            <span>•</span>
            <a href="/admin" className="hover:text-amber-400 transition-colors">
              Owner Portal
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
