import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: { _id: string; username: string; profileImage?: string };
  category?: { _id: string; name: string };
  featuredImage?: string;
  tags: string[];
  likes: string[];
  likeCount: number;
  commentCount: number;
  viewers: string[];
  viewCount: number;
  published: boolean;
  readTime: number;
  createdAt: string;
  updatedAt: string;
}

interface BlogState {
  blogs: Blog[];
  selectedBlog: Blog | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  pages: number;
  currentPage: number;
}

const initialState: BlogState = {
  blogs: [],
  selectedBlog: null,
  isLoading: false,
  error: null,
  total: 0,
  pages: 0,
  currentPage: 1,
};

export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async (
    params: { page?: number; limit?: number; category?: string; author?: string; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/blogs', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blogs');
    }
  }
);

export const fetchBlogById = createAsyncThunk(
  'blogs/fetchBlogById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/blogs/${id}`);
      return response.data.blog;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blog');
    }
  }
);

export const createBlog = createAsyncThunk(
  'blogs/createBlog',
  async (
    data: {
      title: string;
      content: string;
      category?: string;
      featuredImage?: string;
      tags?: string[];
      excerpt?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/blogs', data);
      return response.data.blog;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create blog');
    }
  }
);

export const updateBlog = createAsyncThunk(
  'blogs/updateBlog',
  async (
    { id, data }: { id: string; data: Partial<Blog> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/blogs/${id}`, data);
      return response.data.blog;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update blog');
    }
  }
);

export const deleteBlog = createAsyncThunk(
  'blogs/deleteBlog',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/blogs/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete blog');
    }
  }
);

const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedBlog: (state) => {
      state.selectedBlog = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Blogs
    builder.addCase(fetchBlogs.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBlogs.fulfilled, (state, action) => {
      state.isLoading = false;
      state.blogs = action.payload.blogs;
      state.total = action.payload.total;
      state.pages = action.payload.pages;
      state.currentPage = action.payload.currentPage;
    });
    builder.addCase(fetchBlogs.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Blog By ID
    builder.addCase(fetchBlogById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBlogById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedBlog = action.payload;
    });
    builder.addCase(fetchBlogById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create Blog
    builder.addCase(createBlog.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createBlog.fulfilled, (state, action) => {
      state.isLoading = false;
      state.blogs.unshift(action.payload);
    });
    builder.addCase(createBlog.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update Blog
    builder.addCase(updateBlog.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateBlog.fulfilled, (state, action) => {
      state.isLoading = false;
      const index = state.blogs.findIndex(b => b._id === action.payload._id);
      if (index !== -1) {
        state.blogs[index] = action.payload;
      }
      if (state.selectedBlog?._id === action.payload._id) {
        state.selectedBlog = action.payload;
      }
    });
    builder.addCase(updateBlog.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete Blog
    builder.addCase(deleteBlog.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteBlog.fulfilled, (state, action) => {
      state.isLoading = false;
      state.blogs = state.blogs.filter(b => b._id !== action.payload);
    });
    builder.addCase(deleteBlog.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, clearSelectedBlog } = blogSlice.actions;
export default blogSlice.reducer;
