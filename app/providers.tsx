'use client';

import { ReactNode, useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from '@/lib/store/store';
import { getProfile } from '@/lib/slices/authSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

function AppInitializer({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  // Initialize auth state on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      dispatch(getProfile());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AppInitializer>{children}</AppInitializer>
      <Toaster position="top-center" richColors closeButton />
    </Provider>
  );
}
