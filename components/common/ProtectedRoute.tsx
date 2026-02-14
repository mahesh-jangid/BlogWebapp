'use client';

import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/store/store';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: ('reader' | 'author' | 'admin')[];
  fallback?: ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredRoles = ['reader', 'author', 'admin'],
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Check authentication
  if (!isAuthenticated || !user) {
    router.push('/login');
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  // Check role authorization
  if (!requiredRoles.includes(user.role)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Unauthorized</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this resource.
          </p>
          <p className="text-sm text-gray-500">
            Required role: {requiredRoles.join(', ')}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
