'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store/store';
import { fetchCategories } from '@/lib/slices/categorySlice';
import { createBlog } from '@/lib/slices/blogSlice';
import api from '@/lib/api/axiosConfig';
import { validateBlogForm, getFormProgress } from '@/lib/validations';
import { uploadImageToFirebase } from '@/lib/firebase/storage';
import { toast } from 'sonner';
import Image from 'next/image';

interface Category {
  _id: string;
  name: string;
  slug: string;
  color: string;
}

export default function CreateBlogPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { categories } = useSelector((state: RootState) => state.categories);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    featuredImage: '',
    tags: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'author' && user?.role !== 'admin')) {
      router.push('/login');
    } else {
      // Fetch categories if not already in Redux
      if (categories.length === 0) {
        dispatch(fetchCategories());
      }
    }
  }, [isAuthenticated, user, router, dispatch, categories.length]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Firebase
      const url = await uploadImageToFirebase(file, 'blogs');
      setFormData(prev => ({
        ...prev,
        featuredImage: url,
      }));
      setUploadProgress(100);
      toast.success('✓ Image uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
      setImagePreview('');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      featuredImage: '',
    }));
    setImagePreview('');
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    return validateBlogForm(formData);
  }, [formData]);

  const formProgress = useMemo(() => {
    return getFormProgress(formData);
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Format error messages for toast
      const errorMessages = Object.values(newErrors).map(err => err).join('\n');
      toast.error(
        <div className="space-y-1">
          <p className="font-semibold">⚠️ Please fix the errors:</p>
          <ul className="list-disc list-inside text-sm space-y-0.5">
            {Object.values(newErrors).map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      );
      return;
    }
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || formData.content.substring(0, 150),
        category: formData.category || null,
        featuredImage: formData.featuredImage,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      };

      const result = await dispatch(createBlog(payload)).unwrap();
      toast.success('✓ Blog created successfully! Redirecting...');
      setTimeout(() => {
        router.push(`/blogs/${result._id}`);
      }, 1000);
    } catch (error: any) {
      console.error('Error creating blog:', error);
      const message = error || 'Error creating blog';
      setErrorMessage(message);
      toast.error(message);
      if (error === 'Unauthorized') {
        setErrorMessage('Your session has expired. Please log in again.');
        setTimeout(() => router.push('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [validateForm, formData, router]);

  const insertMarkdown = useCallback((before: string, after: string = '') => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end) || 'text';
    const newContent = 
      formData.content.substring(0, start) +
      before + selectedText + after +
      formData.content.substring(end);

    setFormData(prev => ({
      ...prev,
      content: newContent,
    }));

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selectedText.length;
    }, 0);
  }, [formData.content]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Create New Blog</h1>
          <p className="text-gray-600">Share your thoughts with the community</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-semibold">⚠️ Error</p>
                <p className="text-red-600 text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Success Alert */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-semibold">✓ Success</p>
                <p className="text-green-600 text-sm">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
              {/* Form Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Form Progress</p>
                  <span className="text-sm text-gray-600">{Math.round(formProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      formProgress === 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${formProgress}%` }}
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter an engaging title"
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                  <span className="text-xs text-gray-500 ml-auto">{formData.title.length}/200</span>
                </div>
              </div>

              {/* Category & Featured Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Featured Image</label>
                  {uploading ? (
                    <div className="relative w-full border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 p-8 flex flex-col items-center justify-center">
                      {/* Spinner */}
                      <div className="mb-4">
                        <div className="inline-flex items-center justify-center">
                          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                      </div>
                      {/* Upload Progress */}
                      <p className="text-sm font-semibold text-blue-700 mb-3">Uploading to Firebase...</p>
                      {/* Progress Bar */}
                      <div className="w-48 bg-blue-200 rounded-full h-2 overflow-hidden mb-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-blue-600 font-semibold">{uploadProgress}%</p>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                      <div className="text-center">
                        <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-8-12l-3.172-3.172a4 4 0 00-5.656 0L28 20m0 0l4 4m-4-4v16m4-16l4-4m4 4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="text-sm text-gray-600">Click to upload image</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  )}
                  {errors.featuredImage && (
                    <p className="text-red-500 text-sm mt-1">{errors.featuredImage}</p>
                  )}
                </div>
              </div>

              {/* Image Preview */}
              {(imagePreview || formData.featuredImage) && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={imagePreview || formData.featuredImage}
                    alt="Featured image preview"
                    fill
                    className="object-cover"
                  />
                  {!uploading && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Excerpt (Brief Summary)</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={2}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors ${
                    errors.excerpt ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="A short summary of your blog post (will be auto-generated if left empty)"
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.excerpt && <p className="text-red-500 text-sm">{errors.excerpt}</p>}
                  <span className="text-xs text-gray-500 ml-auto">{formData.excerpt.length}/500</span>
                </div>
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700">Content * (Markdown Supported)</label>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {showPreview ? '✏️ Edit' : '👁️ Preview'}
                  </button>
                </div>

                {!showPreview ? (
                  <>
                    {/* Markdown Toolbar */}
                    <div className="bg-gray-100 border border-gray-300 rounded-t-lg p-3 flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => insertMarkdown('# ')}
                        title="Heading"
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-bold"
                      >
                        H1
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('## ')}
                        title="Subheading"
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-bold"
                      >
                        H2
                      </button>
                      <div className="border-l border-gray-300" />
                      <button
                        type="button"
                        onClick={() => insertMarkdown('**', '**')}
                        title="Bold"
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('*', '*')}
                        title="Italic"
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 italic"
                      >
                        I
                      </button>
                      <div className="border-l border-gray-300" />
                      <button
                        type="button"
                        onClick={() => insertMarkdown('[', '](url)')}
                        title="Link"
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                      >
                        🔗 Link
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('- ')}
                        title="List"
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                      >
                        • List
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('> ')}
                        title="Quote"
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                      >
                        ❝ Quote
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('```\n', '\n```')}
                        title="Code"
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-mono"
                      >
                        {'<>'}
                      </button>
                    </div>

                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      rows={15}
                      className={`w-full px-4 py-3 border border-t-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm transition-colors ${
                        errors.content ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Write your blog content here using Markdown..."
                    />
                    {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {formData.content.length < 50 ? (
                            <span className="text-red-500">❌ {50 - formData.content.length} more characters needed</span>
                          ) : (
                            <span className="text-green-600">✓ Minimum length met</span>
                          )}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{formData.content.length}/50000</span>
                    </div>
                  </>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-6 bg-white prose prose-sm max-w-none">
                    <div className="text-gray-600 whitespace-pre-wrap">
                      {formData.content.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
                        if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-3 mb-2">{line.substring(3)}</h2>;
                        if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-blue-500 pl-4 italic text-gray-700">{line.substring(2)}</blockquote>;
                        if (line.startsWith('- ')) return <li key={i} className="ml-4">{line.substring(2)}</li>;
                        if (line.startsWith('**') && line.endsWith('**')) return <strong key={i}>{line.substring(2, line.length - 2)}</strong>;
                        return line.trim() && <p key={i} className="mb-2">{line}</p>;
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.tags ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="javascript, react, nextjs"
                />
                {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.tags.split(',').filter(t => t.trim()).length}/10 tags • Letters, numbers, hyphens and underscores only
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.split(',').map((tag, i) => (
                    tag.trim() && (
                      <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {tag.trim()}
                      </span>
                    )
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-semibold"
                >
                  {uploading ? `📤 Uploading image ${uploadProgress}%...` : loading ? '📤 Publishing...' : '🚀 Publish Blog'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Help Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4">📝 Markdown Guide</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <code className="bg-gray-100 px-2 py-1 rounded"># Heading</code>
                  <p className="text-xs mt-1">Large title</p>
                </div>
                <div>
                  <code className="bg-gray-100 px-2 py-1 rounded">**bold**</code>
                  <p className="text-xs mt-1">Bold text</p>
                </div>
                <div>
                  <code className="bg-gray-100 px-2 py-1 rounded">*italic*</code>
                  <p className="text-xs mt-1">Italic text</p>
                </div>
                <div>
                  <code className="bg-gray-100 px-2 py-1 rounded">[link](url)</code>
                  <p className="text-xs mt-1">Hyperlink</p>
                </div>
                <div>
                  <code className="bg-gray-100 px-2 py-1 rounded">- item</code>
                  <p className="text-xs mt-1">Bullet list</p>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-800 mb-4">📊 Stats</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Characters:</span>
                  <span className="font-semibold">{formData.content.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Words:</span>
                  <span className="font-semibold">{formData.content.split(/\s+/).filter(w => w).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Read Time:</span>
                  <span className="font-semibold">{Math.max(1, Math.ceil(formData.content.split(/\s+/).filter(w => w).length / 200))} min</span>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    ✅ Minimum 50 characters required
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
