import React, { useState } from 'react';
import { FoodItem } from '../../../types';
import { AlertCircle, Utensils } from 'lucide-react';

interface FoodCardProps {
  item: FoodItem;
  currency: string;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, currency }) => {
  const [imageError, setImageError] = useState(false);
  const isVeg = item.food_type === 'VEG';
  const numericPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
  const formattedPrice = numericPrice.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div
      className={`group relative flex flex-col rounded-2xl overflow-hidden bg-[#151720] border transition-all duration-300 ${
        item.is_available
          ? 'border-white/10 hover:border-amber-500/40 hover:shadow-xl hover:shadow-black/50'
          : 'border-white/5 opacity-75'
      }`}
    >
      {/* Food Image Container */}
      <div className="relative w-full aspect-[4/3] bg-[#1a1d28] overflow-hidden">
        {item.image_url && !imageError ? (
          <img
            src={item.image_url}
            alt={item.name}
            onError={() => setImageError(true)}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
              !item.is_available ? 'grayscale contrast-75' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-gradient-to-br from-[#1a1c26] to-[#12131a]">
            <Utensils className="w-10 h-10 mb-1 opacity-30" />
            <span className="text-[11px] font-medium tracking-wider uppercase text-gray-500">
              {item.category_name || 'Chef Specialty'}
            </span>
          </div>
        )}

        {/* Dietary Veg / Non-Veg Indicator Badge */}
        <div className="absolute top-3 left-3 z-10">
          <div
            className={`w-6 h-6 rounded flex items-center justify-center bg-black/70 backdrop-blur-md border ${
              isVeg ? 'border-emerald-500/80' : 'border-rose-500/80'
            }`}
            title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isVeg ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </div>
        </div>

        {/* Unavailable Overlay & Badge */}
        {!item.is_available && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-3 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-950/90 border border-rose-500/50 text-rose-300 text-xs font-semibold tracking-wide shadow-lg">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Currently Unavailable</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Area: Name & Price */}
      <div className="flex flex-col flex-1 p-4 justify-between">
        <h3
          className={`font-serif text-base sm:text-lg font-semibold leading-snug tracking-tight mb-2 ${
            item.is_available ? 'text-gray-100 group-hover:text-amber-300' : 'text-gray-400'
          } transition-colors`}
        >
          {item.name}
        </h3>

        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-amber-400 font-semibold text-sm">{currency}</span>
            <span
              className={`text-lg sm:text-xl font-bold font-mono tracking-tight ${
                item.is_available ? 'text-white' : 'text-gray-400 line-through'
              }`}
            >
              {formattedPrice}
            </span>
          </div>

          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
            {isVeg ? 'Pure Veg' : 'Non-Veg'}
          </span>
        </div>
      </div>
    </div>
  );
};
