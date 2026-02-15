'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchBlogById } from '@/lib/slices/blogSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import CommentSection from '@/components/blog/CommentSection';
import api from '@/lib/api/axiosConfig';

export default function BlogDetailPage() {
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedBlog, isLoading, error } = useSelector((state: RootState) => state.blogs);
  const { user } = useSelector((state: RootState) => state.auth);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (params?.id) {
      const blogId = Array.isArray(params.id) ? params.id[0] : params.id;
      dispatch(fetchBlogById(blogId));
      
      // Increment view count when blog is viewed
      const trackView = async () => {
        try {
          // For guests: check if they've already viewed this blog
          const viewedBlogsKey = 'viewedBlogs';
          const viewedBlogs = JSON.parse(localStorage.getItem(viewedBlogsKey) || '[]');
          const hasGuestViewed = viewedBlogs.includes(blogId);
          
          // Track view - backend will handle authenticated vs guest logic
          const isGuestFirstView = !user && !hasGuestViewed;

          const response = await api.post(`/blogs/${blogId}/view`, {
            isGuestFirstView,
          });

          // Track guest view in localStorage
          if (isGuestFirstView) {
            viewedBlogs.push(blogId);
            localStorage.setItem(viewedBlogsKey, JSON.stringify(viewedBlogs));
          }
          
          console.log('✅ View tracked:', response.data);
        } catch (err) {
          console.error('Error tracking view:', err);
        }
      };

      trackView();
    }
  }, [params?.id, dispatch, user]);

  const handleLike = async () => {
    try {
      const blogId = Array.isArray(params.id) ? params.id[0] : params.id;
      const response = await api.post('/likes', { blogId });
      setLiked(response.data.liked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error: {error}</div>
          <Link href="/blogs" className="text-blue-600 hover:text-blue-800">
            Back to blogs
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !selectedBlog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-500 font-medium">Loading blog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto min-h-screen bg-gray-50">
      {/* Modern Back Button */}
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100 transition"
          >
            <span>←</span> Back to Blogs
          </Link>
        </div>

      <article className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex gap-2 mb-4">
            {selectedBlog.category && (
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                {selectedBlog.category.name}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">{selectedBlog.title}</h1>
          <div className="flex items-center justify-between mb-6 pb-6 border-b">
            <div className="flex items-center gap-4">
              <img
                src={selectedBlog.author.profileImage || `https://ui-avatars.com/api/?name=${selectedBlog.author.username}`}
                alt={selectedBlog.author.username}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-800">
                  <Link href={`/author/${selectedBlog.author._id}`} className="hover:text-blue-600">
                    {selectedBlog.author.username}
                  </Link>
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(selectedBlog.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-sm text-gray-500">
              <span>📖 {selectedBlog.readTime} min read</span>
              <span>👁️ {selectedBlog.viewCount || 0} views</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {selectedBlog.featuredImage && (
          <div className="w-full h-96 relative bg-gray-200 rounded-lg overflow-hidden mb-8">
            <Image
              src={selectedBlog.featuredImage}
              alt={selectedBlog.title}
              fill
              className="object-cover"
              priority={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
            />
          </div>
        )}

        {/* Content */}
        <div className="bg-white p-8 rounded-lg mb-8 prose prose-lg max-w-none">
          <div
            dangerouslySetInnerHTML={{
              __html: selectedBlog.content.replace(/\n/g, '<br />'),
            }}
            className="text-gray-800 leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-lg mb-8 flex items-center gap-4 border-t border-b">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              liked
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
            }`}
          >
            ❤️ {selectedBlog.likeCount}
          </button>
          <span className="text-gray-500">💬 {selectedBlog.commentCount} Comments</span>
          <span className="text-gray-500">👁️ {selectedBlog.viewCount} Views</span>
        </div>

        {/* Tags */}
        {selectedBlog.tags.length > 0 && (
          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-700 mb-2">Tags:</p>
            <div className="flex gap-2 flex-wrap">
              {selectedBlog.tags.map((tag: string) => (
                <span key={tag} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <CommentSection blogId={Array.isArray(params.id) ? params.id[0] : (params.id as string)} />
      </article>
    </div>
  );
}
