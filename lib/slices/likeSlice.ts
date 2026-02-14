import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

interface LikeState {
  likedBlogs: { [blogId: string]: boolean };
  likesCounts: { [blogId: string]: number };
  isLoading: boolean;
  error: string | null;
}

const initialState: LikeState = {
  likedBlogs: {},
  likesCounts: {},
  isLoading: false,
  error: null,
};

export const toggleLike = createAsyncThunk(
  'likes/toggleLike',
  async (blogId: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/likes', { blogId });
      return {
        blogId,
        liked: response.data.liked,
        likeCount: response.data.likeCount,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle like');
    }
  }
);

export const checkLike = createAsyncThunk(
  'likes/checkLike',
  async (blogId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/likes/check/${blogId}`);
      return {
        blogId,
        liked: response.data.liked,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check like');
    }
  }
);

export const getLikeCount = createAsyncThunk(
  'likes/getLikeCount',
  async (blogId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/likes/count/${blogId}`);
      return {
        blogId,
        count: response.data.likeCount,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get like count');
    }
  }
);

const likeSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Toggle Like
    builder.addCase(toggleLike.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(toggleLike.fulfilled, (state, action) => {
      state.isLoading = false;
      const { blogId, liked, likeCount } = action.payload;
      state.likedBlogs[blogId] = liked;
      state.likesCounts[blogId] = likeCount;
    });
    builder.addCase(toggleLike.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Check Like
    builder.addCase(checkLike.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(checkLike.fulfilled, (state, action) => {
      state.isLoading = false;
      const { blogId, liked } = action.payload;
      state.likedBlogs[blogId] = liked;
    });
    builder.addCase(checkLike.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Get Like Count
    builder.addCase(getLikeCount.fulfilled, (state, action) => {
      const { blogId, count } = action.payload;
      state.likesCounts[blogId] = count;
    });
    builder.addCase(getLikeCount.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export default likeSlice.reducer;
