'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/lib/slices/categorySlice';
import { AppDispatch, RootState } from '@/lib/store/store';

interface EditingCategory {
  _id: string;
  name: string;
  description: string;
  icon?: string;
  color: string;
}

function AdminCategories() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, isLoading } = useSelector((state: RootState) => state.categories);

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '📚',
  });
  const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null);
  const [originalCategory, setOriginalCategory] = useState<EditingCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleCreateCategory = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    
    if (!newCategory.name.trim()) errors.push('Category name is required');
    
    if (errors.length > 0) {
      toast.error(
        <div className="space-y-1">
          <p className="font-semibold">⚠️ Please fix the errors:</p>
          <ul className="list-disc list-inside text-sm space-y-0.5">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      );
      return;
    }

    setSubmitLoading(true);
    const result = await dispatch(createCategory(newCategory));

    if (createCategory.fulfilled.match(result)) {
      toast.success('✨ Category created successfully!');
      setNewCategory({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: '📚',
      });
      dispatch(fetchCategories());
    } else {
      toast.error(
        <div>
          <p className="font-semibold">❌ Failed to create category</p>
          <p className="text-sm mt-1">{result.payload as string || 'Please try again'}</p>
        </div>
      );
    }
    setSubmitLoading(false);
  }, [newCategory, dispatch]);

  const handleEditCategory = useCallback((category: any) => {
    setEditingCategory(category);
    setOriginalCategory(category);
    setIsModalOpen(true);
  }, []);

  const handleUpdateCategory = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    
    if (!editingCategory || !editingCategory.name.trim()) {
      errors.push('Category name is required');
    }
    
    if (errors.length > 0) {
      toast.error(
        <div className="space-y-1">
          <p className="font-semibold">⚠️ Please fix the errors:</p>
          <ul className="list-disc list-inside text-sm space-y-0.5">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      );
      return;
    }

    if (!editingCategory) return;

    setSubmitLoading(true);
    const result = await dispatch(
      updateCategory({
        id: editingCategory._id,
        data: {
          name: editingCategory.name,
          description: editingCategory.description,
          icon: editingCategory.icon,
          color: editingCategory.color,
        },
      })
    );

    if (updateCategory.fulfilled.match(result)) {
      toast.success('✨ Category updated successfully!');
      setIsModalOpen(false);
      setEditingCategory(null);
      setOriginalCategory(null);
      dispatch(fetchCategories());
    } else {
      toast.error(
        <div>
          <p className="font-semibold">❌ Failed to update category</p>
          <p className="text-sm mt-1">{result.payload as string || 'Please try again'}</p>
        </div>
      );
    }
    setSubmitLoading(false);
  }, [editingCategory, dispatch]);

  const handleDeleteCategory = useCallback(async (id: string, name: string) => {
    toast.custom(
      (t) => (
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <p className="text-gray-800 font-semibold mb-3">Delete Category?</p>
          <p className="text-gray-600 text-sm mb-4">
            Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => toast.dismiss(t)}
              className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t);
                const result = await dispatch(deleteCategory(id));
                if (deleteCategory.fulfilled.match(result)) {
                  toast.success('🗑️ Category deleted successfully!');
                  dispatch(fetchCategories());
                } else {
                  toast.error(result.payload as string || 'Failed to delete category');
                }
              }}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  }, [dispatch]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Categories</h2>

      {/* Create Category Form */}
      <form onSubmit={handleCreateCategory} className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl mb-8 border border-blue-200 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">➕</span> Create New Category
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <input
              type="text"
              maxLength={2}
              value={newCategory.icon}
              onChange={(e) =>
                setNewCategory({ ...newCategory, icon: e.target.value })
              }
              className="w-full px-4 py-2 text-2xl text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="📚"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="e.g., Technology"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              type="text"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <input
              type="color"
              value={newCategory.color}
              onChange={(e) =>
                setNewCategory({ ...newCategory, color: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer h-10"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:from-gray-400 disabled:to-gray-400 font-semibold shadow-md"
            >
              {submitLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </form>

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Icon</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Color</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category: any) => (
                  <tr key={category._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="text-2xl">{category.icon || '📚'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{category.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 text-sm">{category.description || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg border-2 border-gray-300"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm text-gray-500">{category.color}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium text-sm shadow-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id, category.name)}
                          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium text-sm shadow-sm"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg mb-2">📭 No categories yet</p>
            <p className="text-gray-400 text-sm">Create your first category using the form above</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.1)'}}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>✏️</span> Edit Category
              </h3>
            </div>

            <form onSubmit={handleUpdateCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <input
                  type="text"
                  maxLength={2}
                  value={editingCategory.icon || ''}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, icon: e.target.value })
                  }
                  className="w-full px-4 py-2 text-2xl text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="📚"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={editingCategory.description}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <input
                  type="color"
                  value={editingCategory.color}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, color: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer h-10"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                    setOriginalCategory(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || JSON.stringify(editingCategory) === JSON.stringify(originalCategory)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {submitLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(AdminCategories);
