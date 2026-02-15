'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from '@/lib/store/store';
import { getProfile } from '@/lib/slices/authSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

function AppInitializer({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isCheckingAuth } = useSelector((state: RootState) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state on app load and handle hydration
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // This will check the backend using the HttpOnly cookie
        // If valid, it sets the Redux state
        // getProfile sets isCheckingAuth to false when done
        await dispatch(getProfile()).unwrap();
        console.log('✅ Auth restored from cookie');
      } catch (err) {
        // Cookie expired or invalid - user needs to log in again
        console.warn('⚠️ Auth cookie invalid or expired');
      } finally {
        setIsInitialized(true);
      }
    };

    // Always check auth on initial load
    initializeAuth();
  }, [dispatch]);

  // Show loading while auth is being checked
  if (isCheckingAuth && !isInitialized) {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-16" />
        <Footer />
      </>
    );
  }

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
