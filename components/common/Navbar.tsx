'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { logoutAsync } from '@/lib/slices/authSlice';
import { AppDispatch, RootState } from '@/lib/store/store';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const getLinkClass = (href: string, isActive: boolean) => {
    const baseClass = 'transition';
    return isActive
      ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1'
      : 'text-gray-700 hover:text-blue-600';
  };

  const getMobileLinkClass = (href: string, isActive: boolean) => {
    return isActive
      ? 'block py-2 text-blue-600 font-semibold bg-blue-50 px-2 rounded'
      : 'block py-2 text-gray-700 hover:text-blue-600';
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      toast.success('👋 Logged out successfully!');
      router.push('/');
    } catch (err) {
      toast.error('Logout failed');
      console.error('Logout error:', err);
    }
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            📝 BlogHub
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/blogs" className={getLinkClass('/blogs', isActive('/blogs'))}>
              Blogs
            </Link>
            <Link href="/categories" className={getLinkClass('/categories', isActive('/categories'))}>
              Categories
            </Link>

            {isAuthenticated && user ? (
              <>
                {(user.role === 'author' || user.role === 'admin') && (
                  <Link href="/dashboard" className={getLinkClass('/dashboard', isActive('/dashboard'))}>
                    Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link href="/admin" className={getLinkClass('/admin', isActive('/admin'))}>
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-4">
                  <img
                    src={user.profileImage || `https://ui-avatars.com/api/?name=${user.username}`}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-gray-700">{user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-4">
                <Link
                  href="/login"
                  className="text-blue-600 border border-blue-600 px-4 py-2 rounded hover:bg-blue-600 hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t">
            <Link href="/blogs" onClick={() => setMenuOpen(false)} className={getMobileLinkClass('/blogs', isActive('/blogs'))}>
              Blogs
            </Link>
            <Link href="/categories" onClick={() => setMenuOpen(false)} className={getMobileLinkClass('/categories', isActive('/categories'))}>
              Categories
            </Link>
            {isAuthenticated && user ? (
              <>
                {(user.role === 'author' || user.role === 'admin') && (
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className={getMobileLinkClass('/dashboard', isActive('/dashboard'))}>
                    Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)} className={getMobileLinkClass('/admin', isActive('/admin'))}>
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left py-2 text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className={getMobileLinkClass('/login', isActive('/login'))}>
                  Login
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className={getMobileLinkClass('/register', isActive('/register'))}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
