import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  reorderAdminCategories,
  updateAdminCategory,
} from '../../../services/api';
import { Category } from '../../../types';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  AlertCircle,
  FolderTree,
  CheckCircle2,
} from 'lucide-react';

export const CategoryManagementPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: fetchAdminCategories,
  });

  const createMutation = useMutation({
    mutationFn: createAdminCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['publicMenu'] });
      handleCloseModal();
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.detail || 'Failed to create category.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      updateAdminCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['publicMenu'] });
      handleCloseModal();
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.detail || 'Failed to update category.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['publicMenu'] });
      setDeleteConfirmCat(null);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.detail || 'Cannot delete category.');
      setDeleteConfirmCat(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: reorderAdminCategories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['publicMenu'] });
    },
  });

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setIsActive(true);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIsActive(cat.is_active);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter a category name.');
      return;
    }

    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory.id,
        data: { name: name.trim(), is_active: isActive },
      });
    } else {
      createMutation.mutate({
        name: name.trim(),
        is_active: isActive,
      });
    }
  };

  const handleMove = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const reorderedList = [...categories];
    const [moved] = reorderedList.splice(index, 1);
    reorderedList.splice(targetIndex, 0, moved);

    const payload = reorderedList.map((cat, idx) => ({
      id: cat.id,
      display_order: idx + 1,
    }));

    reorderMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Menu Categories
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Organize the menu structure, customize display orders, and manage visibility.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold shadow-lg shadow-amber-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Global alert error if any */}
      {errorMessage && !isModalOpen && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
          <button onClick={() => setErrorMessage(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-[#141620] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-white/5 text-gray-400">
              <tr>
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Food Items</th>
                <th className="py-3.5 px-4">Public Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    Loading menu categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No categories found. Create your first category above.
                  </td>
                </tr>
              ) : (
                categories.map((cat, index) => (
                  <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs font-semibold text-amber-400 w-6">
                          #{cat.display_order}
                        </span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleMove(index, 'UP')}
                            disabled={index === 0}
                            className="p-1 text-gray-500 hover:text-white disabled:opacity-20"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMove(index, 'DOWN')}
                            disabled={index === categories.length - 1}
                            className="p-1 text-gray-500 hover:text-white disabled:opacity-20"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white text-sm">
                      <div className="flex items-center gap-2">
                        <FolderTree className="w-4 h-4 text-amber-400/70" />
                        <span>{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-white/5 border border-white/10 text-gray-200">
                        {cat.item_count ?? 0} items
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${
                          cat.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-gray-700/30 text-gray-400 border border-gray-600/30'
                        }`}
                      >
                        {cat.is_active ? 'Active on Menu' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          title="Edit Category"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-white/5 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmCat(cat)}
                          title="Delete Category"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#151720] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
              <h3 className="font-serif text-xl font-bold text-white">
                {editingCategory ? 'Edit Menu Category' : 'Create Menu Category'}
              </h3>
              <button onClick={handleCloseModal} className="p-1.5 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Traditional Starters"
                  required
                  className="w-full bg-[#1b1e2a] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Menu Visibility
                </label>
                <button
                  type="button"
                  onClick={() => setIsActive((prev) => !prev)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-colors ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-gray-800 text-gray-400 border-white/10'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isActive ? 'Category Active on Digital Menu' : 'Hidden from Digital Menu'}</span>
                </button>
              </div>

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
                    : editingCategory
                    ? 'Save Changes'
                    : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Safe Modal */}
      {deleteConfirmCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#151720] border border-white/10 rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white mb-2">
              Delete "{deleteConfirmCat.name}"?
            </h3>
            {deleteConfirmCat.item_count && deleteConfirmCat.item_count > 0 ? (
              <div className="p-3 mb-4 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-200 text-xs text-left">
                <p className="font-semibold mb-1">Protected Category</p>
                <p>
                  This category contains <strong>{deleteConfirmCat.item_count}</strong> active food item(s).
                  The system prevents accidental deletion until these items are reassigned or removed first.
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                Are you sure you want to delete this category? This operation is permanent.
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmCat(null)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 text-gray-300 text-xs font-medium hover:bg-white/10"
              >
                Cancel
              </button>
              {(!deleteConfirmCat.item_count || deleteConfirmCat.item_count === 0) && (
                <button
                  onClick={() => deleteMutation.mutate(deleteConfirmCat.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
