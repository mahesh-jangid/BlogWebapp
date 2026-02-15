'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchBlogs } from '@/lib/slices/blogSlice';
import { toggleLike } from '@/lib/slices/likeSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import { toast } from 'sonner';
import api from '@/lib/api/axiosConfig';

interface Comment {
  _id: string;
  content: string;
  author: { _id: string; username: string; profileImage?: string };
  likes: string[];
  likeCount: number;
  isEdited: boolean;
  createdAt: string;
}

function CommentsModal({ blogId, onClose, onCommentAdded }: { blogId: string; onClose: () => void; onCommentAdded?: (commentCount: number) => void }) {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  useEffect(() => {
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/comments/${blogId}`);
      setComments(response.data.comments || []);

      if (isAuthenticated && user) {
        const liked = new Set<string>(
          response.data.comments
            .filter((comment: Comment) => comment.likes?.includes(user._id))
            .map((comment: Comment) => comment._id)
        );
        setLikedComments(liked);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/comments', { content: newComment, blogId });
      setComments([response.data.comment, ...comments]);
      setNewComment('');
      toast.success('📝 Comment posted successfully!');
      // Notify parent component of new comment count
      if (onCommentAdded) {
        onCommentAdded(comments.length + 1);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const isLiked = likedComments.has(commentId);
      await api.post(`/comments/${commentId}/like`);

      if (isLiked) {
        likedComments.delete(commentId);
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId && user
              ? { ...comment, likeCount: Math.max(0, comment.likeCount - 1), likes: comment.likes.filter((id) => id !== user._id) }
              : comment
          )
        );
      } else {
        likedComments.add(commentId);
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId && user
              ? { ...comment, likeCount: comment.likeCount + 1, likes: [...comment.likes, user._id] }
              : comment
          )
        );
      }
      setLikedComments(new Set(likedComments));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to like comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));
      toast.success('✂️ Comment deleted successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete comment');
    }
  };

  const canDeleteComment = (authorId: string) => {
    return isAuthenticated && user && (user._id === authorId || user.role === 'admin');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.1)'}}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Comments ({comments.length})</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 text-2xl leading-none cursor-pointer">
            ✕
          </button>
        </div>

        {/* Comments List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block mb-3">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">Loading comments...</p>
                </div>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment: Comment) => (
                <div key={comment._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100">
                  <div className="flex gap-3">
                    <img
                      src={comment.author.profileImage || `https://ui-avatars.com/api/?name=${comment.author.username}`}
                      alt={comment.author.username}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{comment.author.username}</p>
                      <p className="text-xs text-gray-500 mb-2">
                        {new Date(comment.createdAt).toLocaleDateString()} at{' '}
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleLikeComment(comment._id)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded h-fit ${
                          likedComments.has(comment._id)
                            ? 'bg-red-100 text-red-600 font-semibold'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-red-50'
                        }`}
                      >
                        <span>{likedComments.has(comment._id) ? '❤️' : '🤍'}</span>
                        <span>{comment.likeCount || 0}</span>
                      </button>

                      {canDeleteComment(comment.author._id) && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="flex items-center text-xs px-2 py-1 rounded transition-all bg-red-50 text-red-600 hover:bg-red-100 h-fit"
                          title="Delete comment"
                        >
                          <span>🗑️</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8 text-sm">No comments yet!</p>
            )}
          </div>
        </div>

        {/* Form - Fixed at Bottom */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmitComment} className="border-t border-gray-200 p-4 bg-blue-50 flex-shrink-0">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              rows={3}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 text-sm font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Posting...</span>
                </>
              ) : (
                'Post Comment'
              )}
            </button>
          </form>
        ) : (
          <div className="border-t border-gray-200 p-4 bg-yellow-50 flex-shrink-0">
            <p className="text-sm text-gray-700 text-center">
              Please <a href="/login" className="text-blue-600 font-semibold hover:underline">login</a> to comment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BlogCard({ blog }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { likedBlogs, loadingBlogs } = useSelector((state: RootState) => state.likes);
  const isLoading = loadingBlogs[blog._id] || false;
  const [isLiked, setIsLiked] = useState(blog.isLikedByUser || false);
  const [likeCount, setLikeCount] = useState(blog.likeCount || 0);
  const [commentCount, setCommentCount] = useState(blog.commentCount || 0);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  // Update isLiked when blog data changes
  useEffect(() => {
    if (blog.isLikedByUser !== undefined) {
      setIsLiked(blog.isLikedByUser);
    }
  }, [blog.isLikedByUser, blog._id]);

  // Update isLiked from Redux state when user toggles like
  useEffect(() => {
    if (likedBlogs[blog._id] !== undefined) {
      setIsLiked(likedBlogs[blog._id]);
    }
  }, [likedBlogs, blog._id]);

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      const result = await dispatch(toggleLike(blog._id)).unwrap();
      setIsLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch (error: any) {
      toast.error(error || 'Failed to update like');
    }
  };

  const handleCommentAdded = (newCommentCount: number) => {
    setCommentCount(newCommentCount);
  };

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      {/* Image - Fixed height with better sizing */}
      {blog.featuredImage ? (
        <div className="w-full h-48 relative bg-gray-200 overflow-hidden flex-shrink-0">
          <Image
            src={blog.featuredImage}
            alt={blog.title}
            fill
            className="object-cover"
            priority={false}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            quality={75}
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
          <div className="text-center">
            <span className="text-4xl mb-2">📷</span>
            <p className="text-gray-500 text-xs">No Image</p>
          </div>
        </div>
      )}

      {/* Content - Fixed layout with flex-grow */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category and Read Time - Fixed height */}
        <div className="flex gap-2 mb-2 h-6 items-center">
          {blog.category && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
              {blog.category.name}
            </span>
          )}
          {blog.readTime && (
            <span className="text-xs text-gray-500 whitespace-nowrap">📖 {blog.readTime} min read</span>
          )}
        </div>

        {/* Title - Fixed 2 lines */}
        <Link href={`/blogs/${blog._id}`}>
          <h3 className="text-base font-bold text-gray-800 hover:text-blue-600 transition mb-2 line-clamp-2 min-h-[3rem]">
            {blog.title}
          </h3>
        </Link>

        {/* Excerpt - Fixed 2 lines */}
        <p className="text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem] text-sm flex-grow">
          {blog.excerpt}
        </p>

        {/* Author and Stats - Fixed at bottom */}
        <div className="border-t pt-3 mt-auto">
          {/* Author */}
          <div className="flex items-center gap-2 mb-3">
            <img
              src={blog.author.profileImage || `https://ui-avatars.com/api/?name=${blog.author.username}`}
              alt={blog.author.username}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-700 font-medium truncate">{blog.author.username}</span>
          </div>

          {/* Stats - Consistent layout */}
          <div className="flex justify-between gap-2 text-xs">
            {/* Like Button - Interactive */}
            <button
              onClick={handleLikeToggle}
              disabled={isLoading}
              className={`flex items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-all ${
                isLiked
                  ? 'bg-red-50 text-red-600 font-semibold'
                  : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600'
              } ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  <span>...</span>
                </>
              ) : (
                <>
                  <span>{isLiked ? '❤️' : '🤍'}</span>
                  <span>{likeCount}</span>
                </>
              )}
            </button>

            {/* Comments */}
            <button
              onClick={() => setShowCommentsModal(true)}
              className="flex items-center justify-center gap-1 flex-1 py-2 rounded-lg bg-gray-50 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <span>💬</span>
              <span>{commentCount}</span>
            </button>

            {/* Views */}
            <div className="flex items-center justify-center gap-1 flex-1 py-2 rounded-lg bg-gray-50 text-gray-600">
              <span>👁️</span>
              <span>{blog.viewCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      {showCommentsModal && (
        <CommentsModal blogId={blog._id} onClose={() => setShowCommentsModal(false)} onCommentAdded={handleCommentAdded} />
      )}
    </article>
  );
}
