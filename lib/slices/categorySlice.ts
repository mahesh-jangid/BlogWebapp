import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color: string;
  createdBy: { _id: string; username: string };
}

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/categories');
      return response.data.categories;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (
    data: { name: string; description?: string; icon?: string; color?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/categories', data);
      return response.data.category;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async (
    { id, data }: { id: string; data: { name?: string; description?: string; icon?: string; color?: string } },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/categories/${id}`, data);
      return response.data.category;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCategories.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.isLoading = false;
      state.categories = action.payload;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createCategory.pending, (state) => {
      state.error = null;
    });
    builder.addCase(createCategory.fulfilled, (state, action) => {
      state.categories.push(action.payload);
    });
    builder.addCase(createCategory.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(updateCategory.pending, (state) => {
      state.error = null;
    });
    builder.addCase(updateCategory.fulfilled, (state, action) => {
      const index = state.categories.findIndex((cat) => cat._id === action.payload._id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    });
    builder.addCase(updateCategory.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(deleteCategory.pending, (state) => {
      state.error = null;
    });
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      state.categories = state.categories.filter((cat) => cat._id !== action.payload);
    });
    builder.addCase(deleteCategory.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;
