'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminUsers from '@/components/admin/AdminUsers';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
            🛠️ Admin Panel
          </h1>
          <p className="text-gray-600 text-lg">Manage your blog platform</p>
        </div>

        {/* Admin Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <AdminUsers />
          </div>

          {/* Categories Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <AdminCategories />
          </div>
        </div>
      </div>
    </div>
  );
}
