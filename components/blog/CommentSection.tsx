'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '@/lib/api/axiosConfig';
import { fetchComments, createComment } from '@/lib/slices/commentSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import { toast } from 'sonner';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  likes: string[];
  likeCount: number;
  isEdited: boolean;
  edits?: number;
  createdAt: string;
  updatedAt?: string;
}

export default function CommentSection({ blogId }: { blogId: string }) {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { comments, isLoading } = useSelector((state: RootState) => state.comments);
  const [newComment, setNewComment] = useState('');
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchComments({ blogId }));
  }, [blogId, dispatch]);

  // Check which comments are liked by current user
  useEffect(() => {
    if (isAuthenticated && user && comments.length > 0) {
      const liked = new Set(
        comments
          .filter((comment) => comment.likes?.includes(user._id))
          .map((comment) => comment._id)
      );
      setLikedComments(liked);
    }
  }, [comments, user, isAuthenticated]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    if (!user) {
      toast.error('User information is not available. Please login again');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(createComment({ content: newComment, blogId })).unwrap();
      setNewComment('');
      toast.success('📝 Comment posted successfully!');
    } catch (error: any) {
      if (error === 'Please login to comment' || error.includes('401')) {
        toast.error('Authentication failed. Please login again');
      } else if (error.includes('403')) {
        toast.error('You do not have permission to comment');
      } else {
        toast.error(error || 'Failed to post comment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to like comments');
      return;
    }

    if (!user) {
      toast.error('User information is not available. Please login again');
      return;
    }

    try {
      const isLiked = likedComments.has(commentId);
      await api.post(`/comments/${commentId}/like`);
      
      if (isLiked) {
        likedComments.delete(commentId);
      } else {
        likedComments.add(commentId);
      }
      setLikedComments(new Set(likedComments));
      toast.success(isLiked ? '💔 Like removed' : '❤️ Comment liked!');
    } catch (error: any) {
      console.error('Error liking comment:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to like comments');
      } else {
        toast.error('Failed to update like');
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await api.delete(`/comments/${commentId}`);
      dispatch(fetchComments({ blogId }));
      toast.success('✂️ Comment deleted successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete comment');
    }
  };

  const canDeleteComment = (authorId: string) => {
    return isAuthenticated && user && (user._id === authorId || user.role === 'admin');
  };

  return (
    <section className="mt-12 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Comments ({comments?.length || 0})</h2>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
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
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-gray-700">
            Please{' '}
            <a href="/login" className="text-blue-600 font-semibold hover:underline">
              login
            </a>{' '}
            to comment
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block mb-3">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-500 text-sm font-medium">Loading comments...</p>
            </div>
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment: Comment) => (
            <div key={comment._id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Image
                  src={comment.author.profileImage || `https://ui-avatars.com/api/?name=${comment.author.username}`}
                  alt={comment.author.username}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800">{comment.author.username}</p>
                    {comment.isEdited && (
                      <span className="text-xs text-gray-500 italic">(edited)</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {new Date(comment.createdAt).toLocaleDateString()} at{' '}
                    {new Date(comment.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-gray-700 mb-3">{comment.content}</p>

                  {/* Like Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLikeComment(comment._id)}
                      className={`flex items-center gap-1 text-sm px-3 py-1 rounded-lg transition-all ${
                        likedComments.has(comment._id)
                          ? 'bg-red-50 text-red-600 font-semibold'
                          : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      <span>{likedComments.has(comment._id) ? '❤️' : '🤍'}</span>
                      <span>{comment.likeCount || 0}</span>
                    </button>

                    {/* Delete Button - Only for comment owner or admin */}
                    {canDeleteComment(comment.author._id) && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="flex items-center gap-1 text-sm px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                        title="Delete comment"
                      >
                        <span>🗑️</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </section>
  );
}
