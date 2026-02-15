'use client';

import { ReactNode } from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

export default function RootLayout({ children }: { children: ReactNode }) {
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
