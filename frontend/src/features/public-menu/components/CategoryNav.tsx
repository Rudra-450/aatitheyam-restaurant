import React, { useRef } from 'react';
import { PublicCategoryWithItems } from '../../../types';

interface CategoryNavProps {
  categories: PublicCategoryWithItems[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  totalItems: number;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  totalItems,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="sticky top-0 z-30 bg-[#0c0d12]/95 backdrop-blur-md border-b border-white/5 py-3 shadow-lg shadow-black/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {/* All Items Pill */}
          <button
            onClick={() => onSelectCategory('ALL')}
            className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 flex items-center gap-2 ${
              selectedCategoryId === 'ALL'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-semibold'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            <span>All Offerings</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedCategoryId === 'ALL'
                  ? 'bg-black/20 text-black'
                  : 'bg-white/10 text-gray-400'
              }`}
            >
              {totalItems}
            </span>
          </button>

          {/* Dynamic Categories */}
          {categories.map((category) => {
            const isSelected = selectedCategoryId === category.id;
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 flex items-center gap-2 ${
                  isSelected
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-semibold'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                <span>{category.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-black/20 text-black'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {category.items.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
