'use client';

import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchBlogs } from '@/lib/slices/blogSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import BlogCard from '@/components/blog/BlogCard';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { blogs, isLoading } = useSelector((state: RootState) => state.blogs);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchBlogs({ page: 1, limit: 6 }));
  }, [dispatch]);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">📝 Welcome to BlogHub</h1>
          <p className="text-xl mb-8">
            Share your thoughts, read amazing stories, and connect with writers worldwide
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/blogs"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
            >
              Explore Blogs
            </Link>
            {!user ? (
              <Link
                href="/register"
                className="bg-blue-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-400 transition border-2 border-white"
              >
                Start Writing
              </Link>
            ) : (user.role === 'author' || user.role === 'admin') && (
              <Link
                href="/dashboard"
                className="bg-blue-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-400 transition border-2 border-white"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Recent Blogs Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Latest Articles</h2>
          <p className="text-gray-600">Discover the most recent posts from our community</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-96 animate-pulse" />
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No blogs published yet. Be the first to share!</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/blogs"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition inline-block"
          >
            View All Blogs →
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose BlogHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">✍️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Easy to Write</h3>
              <p className="text-gray-600">Rich text editor with markdown support for beautiful articles</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Global Community</h3>
              <p className="text-gray-600">Connect and collaborate with writers from around the world</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Secure & Private</h3>
              <p className="text-gray-600">Your content is protected with enterprise-grade security</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

