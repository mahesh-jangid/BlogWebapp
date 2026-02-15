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

  // Initialize auth state on app load - runs only ONCE
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        await dispatch(getProfile()).unwrap();
        if (isMounted) console.log('✅ Auth restored from cookie');
      } catch (err) {
        if (isMounted) console.warn('⚠️ Auth cookie invalid or expired');
      } finally {
        if (isMounted) setIsInitialized(true);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - runs only once on mount

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
