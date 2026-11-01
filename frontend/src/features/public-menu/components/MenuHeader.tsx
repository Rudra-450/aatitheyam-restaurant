import React from 'react';
import { Clock, MapPin, Phone, Sparkles } from 'lucide-react';
import { Restaurant } from '../../../types';

interface MenuHeaderProps {
  restaurant: Restaurant;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({ restaurant }) => {
  return (
    <header className="relative overflow-hidden bg-gradient-to-b from-[#14161f] via-[#0f1118] to-[#0c0d12] border-b border-white/5 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
      {/* Subtle luxury ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-gradient-to-b from-amber-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Branding Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium tracking-widest uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Curated Digital Menu</span>
        </div>

        {/* Logo / Monogram */}
        {restaurant.logo_url ? (
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-amber-500/40 shadow-xl shadow-amber-950/20 mb-4 bg-[#181a24]">
            <img
              src={restaurant.logo_url}
              alt={restaurant.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to placeholder monogram
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-500/40 flex items-center justify-center bg-[#181a24] text-amber-400 font-serif text-2xl sm:text-3xl font-bold shadow-xl mb-4">
            {restaurant.name.charAt(0)}
          </div>
        )}

        {/* Restaurant Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight mb-3">
          {restaurant.name}
        </h1>

        {/* Details: Address, Contact, Hours */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-5 text-xs sm:text-sm text-gray-400 max-w-2xl mx-auto">
          {restaurant.address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{restaurant.address}</span>
            </div>
          )}

          {restaurant.contact_number && (
            <a
              href={`tel:${restaurant.contact_number.replace(/\s+/g, '')}`}
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{restaurant.contact_number}</span>
            </a>
          )}

          {restaurant.opening_hours && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{restaurant.opening_hours}</span>
            </div>
          )}
        </div>

        {/* Live View-Only Notice & Menu Policy */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-emerald-400 tracking-wide uppercase">
              Live Restaurant Menu • Pure Veg Dining
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            <span className="font-semibold text-amber-400 uppercase tracking-wider text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded">Note</span>
            <span>Half portions will be charged 30% extra</span>
          </div>
        </div>
      </div>
    </header>
  );
};
