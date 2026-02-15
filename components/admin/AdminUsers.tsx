'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api/axiosConfig';

interface User {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'reader' | 'author' | 'admin';
  isVerified: boolean;
  createdAt: string;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'reader' | 'author' | 'admin';
}

const AdminUsers = memo(() => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'reader',
  });
  const [originalFormData, setOriginalFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'reader',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const validateForm = useCallback(() => {
    const errors: string[] = [];
    
    if (!formData.username.trim()) errors.push('Username is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!editingId && !formData.password.trim()) errors.push('Password is required for new users');
    if (formData.username.length < 3) errors.push('Username must be at least 3 characters');
    
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
      return false;
    }
    return true;
  }, [formData, editingId]);

  const handleCreateUser = useCallback(async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      };

      await api.post('/admin/users', payload);
      toast.success('✓ User created successfully');
      setFormData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'reader',
      });
      setShowForm(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, fetchUsers]);

  const handleUpdateUser = useCallback(async () => {
    if (!editingId) return;
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload: any = {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      };

      await api.put(`/admin/users/${editingId}`, payload);
      toast.success('✓ User updated successfully');
      setFormData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'reader',
      });
      setEditingId(null);
      setShowForm(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  }, [editingId, formData, validateForm, fetchUsers]);

  const hasUserChanges = JSON.stringify(formData) !== JSON.stringify(originalFormData);

  const handleEdit = useCallback((user: User) => {
    const userData = {
      username: user.username,
      email: user.email,
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
    };
    setFormData(userData);
    setOriginalFormData(userData);
    setEditingId(user._id);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((userId: string, username: string) => {
    toast.custom(
      (t) => (
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <p className="text-gray-800 font-semibold mb-3">Delete User?</p>
          <p className="text-gray-600 text-sm mb-4">
            Are you sure you want to delete <strong>{username}</strong>? This action cannot be undone.
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
                try {
                  setLoading(true);
                  await api.delete(`/admin/users/${userId}`);
                  toast.success('🗑️ User deleted successfully');
                  fetchUsers();
                } catch (error: any) {
                  console.error('Error deleting user:', error);
                  toast.error(error.response?.data?.message || 'Failed to delete user');
                } finally {
                  setLoading(false);
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
  }, [fetchUsers]);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'reader',
    });
  }, []);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'author':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">👥 User Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage platform users and permissions</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({
              username: '',
              email: '',
              password: '',
              firstName: '',
              lastName: '',
              role: 'reader',
            });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
        >
          ➕ Add User
        </button>
      </div>

      {/* Add/Edit User Form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-800">
            {editingId ? '✏️ Edit User' : '➕ Create New User'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {!editingId && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="reader">Reader</option>
                <option value="author">Author</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter last name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={editingId ? handleUpdateUser : handleCreateUser}
              disabled={loading || (!!editingId && !hasUserChanges)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 flex-1"
            >
              {loading ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Processing...</span>
                </>
              ) : editingId ? (
                '💾 Update User'
              ) : (
                '✨ Create User'
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition disabled:opacity-50 font-semibold flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      {loading && !showForm ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No users found. Create your first user!</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Verified</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-3 text-sm text-gray-900 font-medium">{user.username}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '—'}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    {user.isVerified ? (
                      <span className="text-green-600 font-semibold">✓ Yes</span>
                    ) : (
                      <span className="text-red-600 font-semibold">✗ No</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm space-x-2 flex">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-800 font-semibold transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id, user.username)}
                      className="text-red-600 hover:text-red-800 font-semibold transition"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Count */}
      <div className="text-sm text-gray-600 text-right">
        Total users: {users.length}
      </div>
    </div>
  );
});

AdminUsers.displayName = 'AdminUsers';

export default AdminUsers;
