import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

interface Comment {
  _id: string;
  content: string;
  author: { _id: string; username: string; profileImage?: string };
  blog: string;
  likes: string[];
  likeCount: number;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
}

interface CommentState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CommentState = {
  comments: [],
  isLoading: false,
  error: null,
};

export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (
    { blogId, page, limit }: { blogId: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(`/comments/${blogId}`, {
        params: { page, limit },
      });
      return response.data.comments;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

export const createComment = createAsyncThunk(
  'comments/createComment',
  async (
    data: { content: string; blogId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/comments', data);
      return response.data.comment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/comments/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchComments.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchComments.fulfilled, (state, action) => {
      state.isLoading = false;
      state.comments = action.payload;
    });
    builder.addCase(fetchComments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createComment.fulfilled, (state, action) => {
      state.comments.unshift(action.payload);
    });

    builder.addCase(deleteComment.fulfilled, (state, action) => {
      state.comments = state.comments.filter(c => c._id !== action.payload);
    });
  },
});

export const { clearError } = commentSlice.actions;
export default commentSlice.reducer;
