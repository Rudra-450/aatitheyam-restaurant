import { Search, X, Eye } from 'lucide-react';
import { FoodType } from '../../../types';

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFoodType: FoodType | 'ALL';
  onFoodTypeChange: (type: FoodType | 'ALL') => void;
  showOnlyAvailable: boolean;
  onToggleOnlyAvailable: () => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedFoodType,
  onFoodTypeChange,
  showOnlyAvailable,
  onToggleOnlyAvailable,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-2">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search our culinary creations..."
            className="w-full bg-[#161822] border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dietary & Availability Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* All Food Types */}
          <button
            onClick={() => onFoodTypeChange('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
              selectedFoodType === 'ALL'
                ? 'bg-white/15 text-white border-white/30'
                : 'bg-[#161822] text-gray-400 border-white/5 hover:text-gray-200'
            }`}
          >
            All Types
          </button>

          {/* Vegetarian Filter */}
          <button
            onClick={() => onFoodTypeChange('VEG')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
              selectedFoodType === 'VEG'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-[#161822] text-gray-400 border-white/5 hover:text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Pure Veg</span>
          </button>

          {/* Non-Vegetarian Filter */}
          <button
            onClick={() => onFoodTypeChange('NON_VEG')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
              selectedFoodType === 'NON_VEG'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : 'bg-[#161822] text-gray-400 border-white/5 hover:text-rose-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Non-Veg</span>
          </button>

          {/* Available Only Toggle */}
          <button
            onClick={onToggleOnlyAvailable}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
              showOnlyAvailable
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-[#161822] text-gray-400 border-white/5 hover:text-gray-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Available Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
