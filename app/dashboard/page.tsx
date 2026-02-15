'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import api from '@/lib/api/axiosConfig';
import BlogsTable from '@/components/dashboard/BlogsTable';
import StatsCard from '@/components/dashboard/StatsCard';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: { _id: string; username: string };
  likeCount: number;
  commentCount: number;
  viewCount: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isCheckingAuth } = useSelector((state: RootState) => state.auth);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Wait for auth checking to complete
    if (!isHydrated || isCheckingAuth) return;

    if (!isAuthenticated || (user?.role !== 'author' && user?.role !== 'admin')) {
      router.push('/login');
    } else {
      fetchUserBlogs();
    }
  }, [isHydrated, isCheckingAuth, isAuthenticated, user, router]);

  const fetchUserBlogs = useCallback(async () => {
    try {
      const response = await api.get(`/blogs/author/${user?._id}`);
      setBlogs(response.data.blogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  const handleBlogDeleted = useCallback((id: string) => {
    setBlogs((prevBlogs) => prevBlogs.filter((b) => b._id !== id));
  }, []);

  // Memoized stats calculations
  const stats = useMemo(() => {
    const totalLikes = blogs.reduce((sum, b) => sum + (b.likeCount || 0), 0);
    const totalViews = blogs.reduce((sum, b) => sum + (b.viewCount || 0), 0);
    return { totalLikes, totalViews, totalCount: blogs.length };
  }, [blogs]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.username}!</p>
          </div>
          <Link
            href="/dashboard/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            ✍️ Write New Blog
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard 
            label="Total Blogs" 
            value={stats.totalCount}
            icon="📝"
            color="text-blue-600" 
          />
          <StatsCard 
            label="Total Likes" 
            value={stats.totalLikes}
            icon="❤️"
            color="text-green-600" 
          />
          <StatsCard 
            label="Total Views" 
            value={stats.totalViews}
            icon="👁️"
            color="text-purple-600" 
          />
        </div>

        {/* Blogs Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">Your Blogs</h2>
          </div>
          <BlogsTable 
            blogs={blogs} 
            isLoading={isLoading} 
            onBlogDeleted={handleBlogDeleted}
          />
        </div>
      </div>
    </div>
  );
}
