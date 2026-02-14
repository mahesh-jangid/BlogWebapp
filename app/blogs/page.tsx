'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs } from '@/lib/slices/blogSlice';
import { fetchCategories } from '@/lib/slices/categorySlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import BlogCard from '@/components/blog/BlogCard';

export default function BlogsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { blogs, isLoading, currentPage, pages } = useSelector((state: RootState) => state.blogs);
  const { categories, isLoading: categoriesLoading } = useSelector((state: RootState) => state.categories);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [allBlogs, setAllBlogs] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    setAllBlogs([]);
    setPage(1);
    setHasMore(true);
  }, [debouncedSearch, selectedCategory]);

  // Debounce search - delay API call while user is typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); 

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch blogs when page changes
  useEffect(() => {
    if (page === 1) {
      setIsLoadingMore(isLoading);
      setAllBlogs(blogs);
      setHasMore(page < pages);
    } else {
      setIsLoadingMore(isLoading);
      // Filter out duplicate blogs by ID when appending
      const existingIds = new Set(allBlogs.map(b => b._id));
      const newBlogs = blogs.filter(b => !existingIds.has(b._id));
      setAllBlogs((prev) => [...prev, ...newBlogs]);
      setHasMore(page < pages);
    }
  }, [blogs, pages, page, isLoading]);

  useEffect(() => {
    dispatch(fetchBlogs({
      page,
      limit: 12,
      search: debouncedSearch || undefined,
      category: selectedCategory || undefined,
    }));
  }, [page, debouncedSearch, selectedCategory, dispatch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  }; 

  return (
    <div className="h-screen flex flex-col bg-gray-50 mx-8">
      {/* Header - fixed */}
      <div className="bg-white border-blue-700 border-b py-8 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Discover Amazing Stories</h1>
          <p className="text-gray-600">Explore articles from our community of writers</p>
        </div>
      </div>

      {/* Search and Filter - sticky below navbar */}
      <div className="bg-white border-blue-700 border-b sticky top-14 z-20 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search blogs..."
                value={search}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {search !== debouncedSearch && (
                <div className="absolute right-3 top-2.5 text-gray-400">
                  <div className="animate-spin">⟳</div>
                </div>
              )}
            </div>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              disabled={categoriesLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">
                {categoriesLoading ? 'Loading categories...' : 'All Categories'}
              </option>
              {categories.map((cat: any) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scrollable blog content area */}
      <div className="flex-grow overflow-y-auto">
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            {/* Results Info */}
            {(search || selectedCategory) && allBlogs.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">
                  Found <strong>{allBlogs.length}</strong> result{allBlogs.length !== 1 ? 's' : ''}
                  {search && ` matching "${search}"`}
                  {selectedCategory && ` in selected category`}
                </p>
              </div>
            )}

            {/* Initial Loading State */}
            {page === 1 && isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-lg h-96 animate-pulse" />
                ))}
              </div>
            ) : allBlogs.length > 0 ? (
              <>
                {/* Blogs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allBlogs.map((blog) => (
                    <BlogCard key={blog._id} blog={blog} />
                  ))}
                </div>

                {/* Load More Button or End Message */}
                <div className="flex flex-col items-center justify-center py-12 mt-8">
                  {hasMore ? (
                    <div className="w-full max-w-xs">
                      {isLoadingMore ? (
                        <div className="flex flex-col items-center gap-3 py-6">
                          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                          <span className="text-gray-600 text-sm font-medium">Fetching more blogs...</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setPage((prev) => prev + 1)}
                          className="w-full px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-md hover:shadow-lg"
                        >
                          📖 Load More Blogs
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-5xl mb-4">🎉</div>
                      <p className="text-gray-700 text-lg font-semibold mb-2">You've reached the end!</p>
                      <p className="text-gray-500 text-sm">No more blogs to load</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 text-lg">No blogs found. Try different filters!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
