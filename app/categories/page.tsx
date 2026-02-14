'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '@/lib/slices/categorySlice';
import { AppDispatch, RootState } from '@/lib/store/store';

export default function CategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, isLoading } = useSelector((state: RootState) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">📚 Blog Categories</h1>
          <p className="text-lg">Browse articles by topic and discover content that interests you</p>
        </div>
      </div>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-48 animate-pulse" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category: any) => (
              <Link
                key={category._id}
                href={`/blogs?category=${category._id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition transform hover:scale-105"
              >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32 flex items-center justify-center">
                  <span className="text-4xl">📄</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{category.name}</h3>
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-semibold">Browse Category →</span>
                    {category.postCount && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                        {category.postCount} posts
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No categories available yet</p>
          </div>
        )}
      </section>

      {/* Back to Blogs */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Link
            href="/blogs"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition inline-block"
          >
            ← Back to All Blogs
          </Link>
        </div>
      </section>
    </div>
  );
}
