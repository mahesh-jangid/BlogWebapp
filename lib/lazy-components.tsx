'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Lazy load heavy components
export const LazyAdminCategories = dynamic(
  () => import('@/components/admin/AdminCategories'),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    ),
  }
);

export const LazyBlogsTable = dynamic(
  () => import('@/components/dashboard/BlogsTable'),
  {
    loading: () => (
      <div className="space-y-4 p-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    ),
  }
);

export const LazyCommentSection = dynamic(
  () => import('@/components/blog/CommentSection'),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    ),
  }
);
