'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/app/context/AdminAuthContext';
import { useLanguage } from '@/app/components/LanguageProvider';
import { useTheme } from 'next-themes';

export default function AdminSignupPage() {
  const router = useRouter();
  const { signup, admin } = useAdminAuth();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isRTL = language === 'ar';

  const [isChecking, setIsChecking] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check if user is authenticated admin
  useEffect(() => {
    const checkAuth = async () => {
      if (!admin) {
        // Not authenticated, redirect to login
        router.push('/admin/login');
      } else {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [admin, router]);

  // Show loading while checking authentication
  if (isChecking || !admin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('fullNameRequired');
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = t('fullNameMinLength');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalidEmail');
    }

    if (!formData.password) {
      newErrors.password = t('passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('passwordMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await signup(
        formData.fullName,
        formData.email,
        formData.password
      );

      if (result.success) {
        setMessage(t('adminCreated'));
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 2000);
      } else {
        setErrors({ form: result.error });
      }
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('adminSignup')}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('adminSignupDescription')}
          </p>
          <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
            {t('registeredBy')}: {admin?.name || admin?.email}
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
          {/* Success Message */}
          {message && (
            <div className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-400 p-4 rounded-lg">
              {message}
            </div>
          )}

          {/* Form Error */}
          {errors.form && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-400 p-4 rounded-lg">
              {errors.form}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('fullName')} *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder={t('fullNamePlaceholder')}
              className={`w-full px-4 py-3 border ${errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('email')} *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('emailPlaceholder')}
              className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('password')} *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('passwordPlaceholder')}
              className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? t('loading') : t('createAccount')}
          </button>

          {/* Back to Dashboard */}
          <div className="text-center">
            <Link href="/admin/dashboard" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              {t('backToDashboard') || 'Back to Dashboard'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
