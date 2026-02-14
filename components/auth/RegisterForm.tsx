'use client';

import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { register } from '@/lib/slices/authSlice';
import { AppDispatch, RootState } from '@/lib/store/store';

export default function RegisterForm() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;
    return strength;
  }, [formData.password]);

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return { label: 'Very Weak', color: 'bg-red-500' };
    if (passwordStrength <= 2) return { label: 'Weak', color: 'bg-orange-500' };
    if (passwordStrength <= 3) return { label: 'Fair', color: 'bg-yellow-500' };
    if (passwordStrength <= 4) return { label: 'Good', color: 'bg-blue-500' };
    return { label: 'Strong', color: 'bg-green-500' };
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email))
      newErrors.email = 'Invalid email format';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    else if (passwordStrength < 2) newErrors.password = 'Password is too weak. Add uppercase, numbers, or special characters.';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await dispatch(register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      })).unwrap();
      
      if (result) {
        toast.success('🎉 Account created successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 500);
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      toast.error(err?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Create Account</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="johndoe"
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full transition-colors ${
                        i < passwordStrength
                          ? getPasswordStrengthLabel().color
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${
                  passwordStrength < 2 ? 'text-red-500' : 
                  passwordStrength < 3 ? 'text-orange-500' : 
                  passwordStrength < 4 ? 'text-yellow-600' : 
                  passwordStrength < 5 ? 'text-blue-600' : 
                  'text-green-600'
                }`}>
                  Password Strength: {getPasswordStrengthLabel().label}
                </p>
                <div className="mt-2 text-xs text-gray-600">
                  <p className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                    ✓ At least one lowercase letter
                  </p>
                  <p className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                    ✓ At least one uppercase letter
                  </p>
                  <p className={/\d/.test(formData.password) ? 'text-green-600' : ''}>
                    ✓ At least one number
                  </p>
                  <p className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                    ✓ At least 8 characters
                  </p>
                </div>
              </div>
            )}
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-800"
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {formData.password && formData.confirmPassword && (
              <p className={`text-xs mt-2 ${
                formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'
              }`}>
                {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
