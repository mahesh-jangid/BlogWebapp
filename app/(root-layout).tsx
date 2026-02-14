'use client';

import { ReactNode, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile, logout } from '@/lib/slices/authSlice';
import { AppDispatch, RootState } from '@/lib/store/store';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

export default function RootLayout({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(getProfile());
    }
  }, [token, isAuthenticated, dispatch]);

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Navbar />
        <main className="min-h-screen pt-20 pb-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
