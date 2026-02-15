'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminUsers from '@/components/admin/AdminUsers';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isCheckingAuth } = useSelector((state: RootState) => state.auth);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Mark as hydrated - component is now running on client
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Wait for BOTH hydration AND auth checking to complete
    if (!isHydrated || isCheckingAuth) return;

    // Now we can safely check authentication
    if (!isAuthenticated) {
      console.warn('⚠️ User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    if (!user || user.role !== 'admin') {
      console.warn('⚠️ User is not admin, redirecting to home');
      router.push('/');
      return;
    }

    // User is authorized
    setIsAuthorized(true);
  }, [isHydrated, isCheckingAuth, isAuthenticated, user, router]);

  // Show loading state during hydration/auth check
  if (!isHydrated || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Verifying permissions...</p>
        </div>
      </div>
    );
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
