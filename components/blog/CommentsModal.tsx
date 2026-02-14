'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '@/lib/api/axiosConfig';
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
  createdAt: string;
}

interface CommentsModalProps {
  blogId: string;
  onClose: () => void;
  onCommentAdded?: (commentCount: number) => void;
}

export default function CommentsModal({ blogId, onClose, onCommentAdded }: CommentsModalProps) {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/comments/${blogId}`);
      setComments(response.data.comments || []);

      // Check liked comments
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

    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/comments', {
        content: newComment,
        blogId,
      });
      setComments([response.data.comment, ...comments]);
      setNewComment('');
      toast.success('📝 Comment posted successfully!');
      // Notify parent component of new comment count
      if (onCommentAdded) {
        onCommentAdded(comments.length + 1);
      }
    } catch (error: any) {
      console.error('Error posting comment:', error);
      toast.error(error?.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to like comments');
      return;
    }

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
      console.error('Error liking comment:', error);
      toast.error('Failed to update like');
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
      console.error('Error deleting comment:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete comment');
    }
  };

  const canDeleteComment = (authorId: string) => {
    return isAuthenticated && user && (user._id === authorId || user.role === 'admin');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100">
          <h2 className="text-xl font-bold text-gray-800">Comments ({comments.length})</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-2xl leading-none transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Comments List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading comments...</div>
            ) : comments.length > 0 ? (
              comments.map((comment: Comment) => (
                <div key={comment._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex gap-3">
                    <Image
                      src={comment.author.profileImage || `https://ui-avatars.com/api/?name=${comment.author.username}`}
                      alt={comment.author.username}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800 text-sm">{comment.author.username}</p>
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
                      <p className="text-gray-700 text-sm break-words">{comment.content}</p>
                    </div>

                    {/* Like & Delete Buttons - Right Side */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleLikeComment(comment._id)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-all h-fit ${
                          likedComments.has(comment._id)
                            ? 'bg-red-100 text-red-600 font-semibold'
                            : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200'
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
              <p className="text-center text-gray-500 py-8 text-sm">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>

        {/* Comment Form - Fixed at Bottom */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmitComment} className="border-t border-gray-200 p-4 bg-blue-50">
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
              className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div className="border-t border-gray-200 p-4 bg-yellow-50">
            <p className="text-sm text-gray-700 text-center">
              Please{' '}
              <a href="/login" className="text-blue-600 font-semibold hover:underline">
                login
              </a>{' '}
              to comment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
