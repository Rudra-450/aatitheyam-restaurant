import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  createAdminFoodItem,
  deleteAdminFoodItem,
  fetchAdminCategories,
  fetchAdminFoodItems,
  toggleFoodAvailability,
  updateAdminFoodItem,
  uploadFoodImage,
} from '../../../services/api';
import { FoodItem, FoodType } from '../../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  X,
  AlertCircle,
  Utensils,
} from 'lucide-react';

export const FoodManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedAvail, setSelectedAvail] = useState<string>('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [foodType, setFoodType] = useState<FoodType>('VEG');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePublicId, setImagePublicId] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Queries
  const { data: foodItems = [], isLoading: foodsLoading } = useQuery({
    queryKey: ['adminFoodItems', selectedCategory, selectedType, selectedAvail, search],
    queryFn: () =>
      fetchAdminFoodItems({
        category_id: selectedCategory || undefined,
        food_type: selectedType || undefined,
        is_available: selectedAvail ? selectedAvail === 'true' : undefined,
        q: search || undefined,
      }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: fetchAdminCategories,
  });

  // Check URL params for quick actions
  React.useEffect(() => {
    if (searchParams.get('action') === 'new') {
      handleOpenCreate();
      setSearchParams({});
    } else if (searchParams.get('edit') && foodItems.length > 0) {
      const targetId = searchParams.get('edit');
      const itemToEdit = foodItems.find((f) => f.id === targetId);
      if (itemToEdit) {
        handleOpenEdit(itemToEdit);
      }
      setSearchParams({});
    }
  }, [searchParams, foodItems]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createAdminFoodItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFoodItems'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['publicMenu'] });
      handleCloseModal();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.detail || 'Failed to create food item.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FoodItem> }) =>
      updateAdminFoodItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFoodItems'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['publicMenu'] });
      handleCloseModal();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.detail || 'Failed to update food item.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminFoodItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFoodItems'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['publicMenu'] });
      setDeleteConfirmId(null);
    },
  });

  const availabilityMutation = useMutation({
    mutationFn: ({ id, is_available }: { id: string; is_available: boolean }) =>
      toggleFoodAvailability(id, is_available),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFoodItems'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['publicMenu'] });
    },
  });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setPrice('');
    setFoodType('VEG');
    setImageUrl('');
    setImagePublicId('');
    setIsAvailable(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: FoodItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategoryId(item.category_id);
    setPrice(String(item.price));
    setFoodType(item.food_type);
    setImageUrl(item.image_url || '');
    setImagePublicId(item.image_public_id || '');
    setIsAvailable(item.is_available);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormError(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setFormError(null);
      const res = await uploadFoodImage(file);
      setImageUrl(res.url);
      setImagePublicId(res.public_id);
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Image upload failed. Ensure image is PNG, JPEG or WebP.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter a food item name.');
      return;
    }
    if (!categoryId) {
      setFormError('Please select a category.');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setFormError('Please enter a valid price (greater than or equal to ₹0.00).');
      return;
    }

    if (editingItem) {
      updateMutation.mutate({
        id: editingItem.id,
        data: {
          name: name.trim(),
          category_id: categoryId,
          price: numPrice,
          food_type: foodType,
          image_url: imageUrl || null,
          image_public_id: imagePublicId || null,
          is_available: isAvailable,
        },
      });
    } else {
      createMutation.mutate({
        name: name.trim(),
        category_id: categoryId,
        price: numPrice,
        food_type: foodType,
        image_url: imageUrl || null,
        image_public_id: imagePublicId || null,
        is_available: isAvailable,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Food Menu Catalog
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Configure dishes, prices, dietary classifications, and live availability.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold shadow-lg shadow-amber-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Food Item</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#141620] border border-white/5 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes by name..."
              className="w-full bg-[#1b1e2a] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#1b1e2a] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#1b1e2a] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Types</option>
              <option value="VEG">Pure Veg</option>
              <option value="NON_VEG">Non-Veg</option>
            </select>

            {/* Availability Filter */}
            <select
              value={selectedAvail}
              onChange={(e) => setSelectedAvail(e.target.value)}
              className="bg-[#1b1e2a] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Statuses</option>
              <option value="true">Available Only</option>
              <option value="false">Unavailable Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Food Items Table */}
      <div className="bg-[#141620] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-white/5 text-gray-400">
              <tr>
                <th className="py-3.5 px-4">Item Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Classification</th>
                <th className="py-3.5 px-4">Price (₹)</th>
                <th className="py-3.5 px-4">Live Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {foodsLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    Loading food catalog...
                  </td>
                </tr>
              ) : foodItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No food items found matching your criteria.
                  </td>
                </tr>
              ) : (
                foodItems.map((item) => {
                  const isVeg = item.food_type === 'VEG';
                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover bg-black/40 border border-white/5 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 shrink-0">
                              <Utensils className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white text-sm">{item.name}</p>
                            <p className="text-[11px] text-gray-500">ID: {item.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-300 text-xs">{item.category_name}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md border ${
                            isVeg
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isVeg ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          {isVeg ? 'Pure Veg' : 'Non-Veg'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                        ₹{parseFloat(String(item.price)).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              availabilityMutation.mutate({
                                id: item.id,
                                is_available: !item.is_available,
                              })
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              item.is_available ? 'bg-emerald-600' : 'bg-gray-700'
                            }`}
                            title={item.is_available ? 'Mark unavailable' : 'Mark available'}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                item.is_available ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[11px] font-medium ${
                              item.is_available ? 'text-emerald-400' : 'text-gray-500'
                            }`}
                          >
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Item"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-white/5 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            title="Delete Item"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Food Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#151720] border border-white/10 rounded-3xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
              <h3 className="font-serif text-xl font-bold text-white">
                {editingItem ? 'Edit Culinary Offering' : 'Add New Culinary Offering'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dish Name */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Food Item Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Dum Pukht Biryani"
                  required
                  className="w-full bg-[#1b1e2a] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category & Food Type Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full bg-[#1b1e2a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Dietary Classification *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFoodType('VEG')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                        foodType === 'VEG'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                          : 'bg-[#1b1e2a] text-gray-400 border-white/10'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Veg</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFoodType('NON_VEG')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                        foodType === 'NON_VEG'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                          : 'bg-[#1b1e2a] text-gray-400 border-white/10'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Non-Veg</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Price & Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Price (₹ INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 font-semibold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="350.00"
                      required
                      className="w-full bg-[#1b1e2a] border border-white/10 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Initial Availability
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAvailable((prev) => !prev)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-colors ${
                      isAvailable
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    <span>{isAvailable ? '✓ Currently Available' : '✕ Marked Unavailable'}</span>
                  </button>
                </div>
              </div>

              {/* Food Image Upload & Preview */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Food Photography (JPEG, PNG, WebP)
                </label>
                <div className="flex items-center gap-4">
                  {imageUrl ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-black/40 shrink-0">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl('');
                          setImagePublicId('');
                        }}
                        className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null}

                  <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/10 hover:border-amber-500/50 rounded-2xl cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                    <Upload className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-300 font-medium">
                      {uploadingImage ? 'Uploading Image...' : 'Click to upload photo'}
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5">Max size: 5MB</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingItem
                    ? 'Save Changes'
                    : 'Create Food Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#151720] border border-white/10 rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white mb-2">Delete Dish?</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to delete this food item? Its associated image will also be safely removed.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 text-gray-300 text-xs font-medium hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
