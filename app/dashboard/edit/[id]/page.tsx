'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { RootState } from '@/lib/store/store';
import api from '@/lib/api/axiosConfig';
import { validateBlogForm, getFormProgress, isFieldComplete } from '@/lib/validations';

interface Category {
  _id: string;
  name: string;
  slug: string;
  color: string;
}

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    featuredImage: '',
    tags: '',
    published: true,
  });
  const [originalFormData, setOriginalFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    featuredImage: '',
    tags: '',
    published: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'author' && user?.role !== 'admin')) {
      router.push('/login');
    } else {
      fetchBlogAndCategories();
    }
  }, [isAuthenticated, user, router, blogId]);

  const fetchBlogAndCategories = async () => {
    try {
      const [blogResponse, categoriesResponse] = await Promise.all([
        api.get(`/blogs/${blogId}`),
        api.get('/categories'),
      ]);

      const blog = blogResponse.data.blog;

      // Check if user is author or admin
      if (blog.author._id !== user?._id && user?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      const initialFormData = {
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt || '',
        category: blog.category?._id || '',
        featuredImage: blog.featuredImage || '',
        tags: blog.tags?.join(', ') || '',
        published: blog.published,
      };

      setFormData(initialFormData);
      setOriginalFormData(initialFormData);

      setCategories(categoriesResponse.data.categories);
    } catch (error: any) {
      console.error('Error fetching blog:', error);
      setErrorMessage(error.response?.data?.message || 'Error loading blog');
      setTimeout(() => router.push('/dashboard'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
      
      setFormData((prev) => ({
        ...prev,
        [name]: finalValue,
      }));

      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }
    },
    [errors]
  );

  const validateForm = useCallback(() => {
    return validateBlogForm(formData);
  }, [formData]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  }, [formData, originalFormData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      // Show toast with validation errors
      const errorMessages = Object.values(newErrors);
      toast.error(
        <div className="max-h-40 overflow-y-auto">
          <p className="font-semibold mb-2">⚠️ Please fix the errors:</p>
          <ul className="space-y-1 text-sm">
            {errorMessages.map((msg, idx) => (
              <li key={idx}>• {msg}</li>
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
        tags: formData.tags.split(',').map((t) => t.trim()).filter((t) => t),
        published: formData.published,
      };

      await api.put(`/blogs/${blogId}`, payload);
      setSuccessMessage('Blog updated successfully! Redirecting...');
      toast.success('✨ Blog updated successfully! Redirecting...');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      // setTimeout(() => {
      //   router.push('/dashboard');
      // }, 1500);
    } catch (error: any) {
      console.error('Error updating blog:', error);
      const message = error.response?.data?.message || error.message || 'Error updating blog';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [formData, blogId, router, validateForm]);

  const insertMarkdown = useCallback((before: string, after: string = '') => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end) || 'text';
    const newContent =
      formData.content.substring(0, start) +
      before +
      selectedText +
      after +
      formData.content.substring(end);

    setFormData((prev) => ({
      ...prev,
      content: newContent,
    }));

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selectedText.length;
    }, 0);
  }, [formData.content]);

  const formProgress = useMemo(() => {
    return getFormProgress(formData);
  }, [formData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading blog...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Edit Blog</h1>
          <p className="text-gray-600">Update your blog post</p>
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
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Form Progress</span>
                  <span className={`text-sm font-bold ${formProgress === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                    {formProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
                    style={{ width: `${formProgress}%` }}
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Title *</label>
                  <span className="text-xs text-gray-500">
                    {formData.title.length}/200
                  </span>
                </div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter an engaging title (3-200 characters)"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    {errors.title}
                  </p>
                )}
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Featured Image URL</label>
                  <input
                    type="url"
                    name="featuredImage"
                    value={formData.featuredImage}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                      errors.featuredImage ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.featuredImage && (
                    <p className="text-red-500 text-sm mt-2">{errors.featuredImage}</p>
                  )}
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Excerpt (Brief Summary)
                  </label>
                  <span className="text-xs text-gray-500">
                    {formData.excerpt.length}/500
                  </span>
                </div>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={2}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                    errors.excerpt ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="A short summary of your blog post (will be auto-generated if left empty)"
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.excerpt && (
                    <p className="text-red-500 text-sm">{errors.excerpt}</p>
                  )}
                  <p className="text-xs text-gray-500 ml-auto">{formData.excerpt.length}/500</p>
                </div>
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Content * (Markdown Supported)
                  </label>
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
                        H
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('**', '**')}
                        title="Bold"
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-bold"
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('*', '*')}
                        title="Italic"
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm italic"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('\n- ')}
                        title="List"
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                      >
                        • List
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('[', '](url)')}
                        title="Link"
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                      >
                        🔗 Link
                      </button>
                    </div>

                    {/* Textarea with Character Count */}
                    <div className={`border rounded-b-lg overflow-hidden ${
                      errors.content ? 'border-red-500' : 'border-gray-300'
                    }`}>
                      <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        rows={12}
                        className="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset resize-none font-mono"
                        placeholder="Write your blog content here... (Markdown supported)"
                      />
                      <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 flex justify-between text-xs text-gray-600">
                        <span>{formData.content.length} / 50000 characters</span>
                        <span className={`font-semibold ${
                          formData.content.trim().length >= 50 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {formData.content.trim().length < 50
                            ? `${50 - formData.content.trim().length} more characters needed`
                            : '✓ Minimum length met'
                          }
                        </span>
                      </div>
                    </div>
                    {errors.content && (
                      <p className="text-red-500 text-sm mt-2">{errors.content}</p>
                    )}
                  </>
                ) : (
                  <div className="border border-gray-300 rounded-b-lg p-4 bg-white min-h-96">
                    <div
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: formData.content
                          .replace(/^### (.*?)$/gm, '<h3 className="text-lg font-bold">$1</h3>')
                          .replace(/^## (.*?)$/gm, '<h2 className="text-2xl font-bold">$1</h2>')
                          .replace(/^# (.*?)$/gm, '<h1 className="text-3xl font-bold">$1</h1>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/\n/g, '<br />'),
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tags (comma-separated, max 10)
                  </label>
                  <span className="text-xs text-gray-500">
                    {formData.tags.split(',').filter(t => t.trim()).length}/10
                  </span>
                </div>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.tags ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="e.g., javascript, react, web development"
                />
                {errors.tags && (
                  <p className="text-red-500 text-sm mt-2">{errors.tags}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  💡 Tip: Separate tags with commas. Each tag max 50 characters, max 10 tags total
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Publish this blog (uncheck to save as draft)
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !hasChanges}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : '💾 Update Blog'}
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Help Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
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
                  <span className="font-semibold">
                    {formData.content.split(/\s+/).filter((w) => w).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Read Time:</span>
                  <span className="font-semibold">
                    {Math.max(
                      1,
                      Math.ceil(
                        formData.content.split(/\s+/).filter((w) => w).length / 200
                      )
                    )}{' '}
                    min
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500">✅ Minimum 50 characters required</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
