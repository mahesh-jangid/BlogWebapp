import { configureStore, PreloadedState } from '@reduxjs/toolkit';
import authReducer, { type AuthState } from '../slices/authSlice';
import blogReducer, { type BlogState } from '../slices/blogSlice';
import categoryReducer from '../slices/categorySlice';
import commentReducer from '../slices/commentSlice';
import likeReducer from '../slices/likeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    blogs: blogReducer,
    categories: categoryReducer,
    comments: commentReducer,
    likes: likeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export state types for better TypeScript support
export interface AppState {
  auth: AuthState;
  blogs: BlogState;
}
