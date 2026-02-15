'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import api from '@/lib/api/axiosConfig';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: { _id: string; username: string };
  category?: { _id: string; name: string };
  likeCount: number;
  commentCount: number;
  viewCount: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BlogsTableProps {
  blogs: Blog[];
  isLoading: boolean;
  onBlogDeleted: (id: string) => void;
}

const BlogRow = memo(({ blog, onDelete }: { blog: Blog; onDelete: (id: string, title: string) => void }) => (
  <tr className="hover:bg-gray-50 transition">
    <td className="px-6 py-4">
      <Link href={`/blogs/${blog._id}`} className="text-blue-600 hover:underline font-medium">
        {blog.title}
      </Link>
    </td>
    <td className="px-6 py-4 text-sm text-gray-600">
      {blog.category?.name || 'Uncategorized'}
    </td>
    <td className="px-6 py-4">
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${
          blog.published
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}
      >
        {blog.published ? 'Published' : 'Draft'}
      </span>
    </td>
    <td className="px-6 py-4 text-sm text-gray-600">❤️ {blog.likeCount}</td>
    <td className="px-6 py-4 text-sm text-gray-600">👁️ {blog.viewCount}</td>
    <td className="px-6 py-4 text-sm text-gray-600">
      {new Date(blog.createdAt).toLocaleDateString()}
    </td>
    <td className="px-6 py-4 text-sm">
      <div className="flex gap-3">
        <Link
          href={`/dashboard/edit/${blog._id}`}
          className="text-blue-600 hover:text-blue-700 font-medium transition"
        >
          Edit
        </Link>
        <button
          onClick={() => onDelete(blog._id, blog.title)}
          className="text-red-600 hover:text-red-700 font-medium transition"
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
));

BlogRow.displayName = 'BlogRow';

export default memo(function BlogsTable({ blogs, isLoading, onBlogDeleted }: BlogsTableProps) {
  const handleDelete = (id: string, title: string) => {
    toast.custom(
      (t) => (
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <p className="text-gray-800 font-semibold mb-2">Delete Blog?</p>
          <p className="text-gray-600 text-sm mb-4">
            Are you sure you want to delete <strong>{title}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => toast.dismiss(t)}
              className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t);
                try {
                  await api.delete(`/blogs/${id}`);
                  onBlogDeleted(id);
                  toast.success('🗑️ Blog deleted successfully');
                } catch (error: any) {
                  toast.error(error.response?.data?.message || 'Error deleting blog');
                }
              }}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No blogs yet.{' '}
        <Link href="/dashboard/create" className="text-blue-600 hover:underline font-medium">
          Create your first blog
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Likes</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Views</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {blogs.map((blog) => (
            <BlogRow
              key={blog._id}
              blog={blog}
              onDelete={handleDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});
