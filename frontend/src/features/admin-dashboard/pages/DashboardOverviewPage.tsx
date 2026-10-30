import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  fetchDashboardStats,
  toggleFoodAvailability,
} from '../../../services/api';
import {
  Utensils,
  CheckCircle2,
  XCircle,
  FolderTree,
  Plus,
  QrCode,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const DashboardOverviewPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: fetchDashboardStats,
  });

  const availabilityMutation = useMutation({
    mutationFn: ({ id, is_available }: { id: string; is_available: boolean }) =>
      toggleFoodAvailability(id, is_available),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminFoodItems'] });
      queryClient.invalidateQueries({ queryKey: ['publicMenu'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="p-8 text-center text-gray-400">
        Failed to load dashboard overview. Please check server status.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Menu Operations Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time management of dishes, availability states, and category structures.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/foods?action=new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Food Item</span>
          </Link>
          <Link
            to="/admin/qr"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>QR Studio</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#141620] border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Total Offerings
            </p>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-white mt-1">
              {stats.total_food_items}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Utensils className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141620] border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
              Available Now
            </p>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-white mt-1">
              {stats.available_food_items}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141620] border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-rose-400 uppercase tracking-wider">
              Unavailable Items
            </p>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-white mt-1">
              {stats.unavailable_food_items}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141620] border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">
              Menu Categories
            </p>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-white mt-1">
              {stats.total_categories}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <FolderTree className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recently Updated Food Items Section */}
      <div className="bg-[#141620] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-lg font-semibold text-white">
              Recently Modified Dishes
            </h2>
          </div>
          <Link
            to="/admin/foods"
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>View All Foods</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-white/5 text-gray-400">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Dish</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Live Availability</th>
                <th className="py-3 px-4 text-right rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.recently_updated_items.map((item) => {
                const isVeg = item.food_type === 'VEG';
                return (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white flex items-center gap-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-black/40 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 shrink-0">
                          <Utensils className="w-4 h-4" />
                        </div>
                      )}
                      <span>{item.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">{item.category_name}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                          isVeg
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isVeg ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        {isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      ₹{parseFloat(String(item.price)).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      {/* Inline Quick Availability Toggle Switch */}
                      <button
                        onClick={() =>
                          availabilityMutation.mutate({
                            id: item.id,
                            is_available: !item.is_available,
                          })
                        }
                        disabled={availabilityMutation.isPending}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          item.is_available ? 'bg-emerald-600' : 'bg-gray-700'
                        }`}
                        title={item.is_available ? 'Click to mark unavailable' : 'Click to mark available'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.is_available ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/admin/foods?edit=${item.id}`}
                        className="text-xs text-amber-400 hover:underline font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
