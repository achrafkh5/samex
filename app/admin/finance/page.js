'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../components/AdminSidebar';
import { useLanguage } from '../../components/LanguageProvider';
import { useAdminAuth } from '@/app/context/AdminAuthContext';
import B2BSection from './components/B2BSection';
import B2CAlgeriaSection from './components/B2CAlgeriaSection';
import B2CKoreaSection from './components/B2CKoreaSection';
import OnlineSalesSection from './components/OnlineSalesSection';
import FinanceSummary from './components/FinanceSummary';

export default function FinancePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { admin, loading: authLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('online_sales');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, authLoading, router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!admin) {
    return null;
  }

  const tabs = [
    { id: 'online_sales', label: t('online_sales_title') || 'Online Sales' },
    { id: 'b2b', label: t('b2b_title') || 'B2B' },
    { id: 'b2c_algeria', label: t('b2c_algeria_title') || 'B2C Algeria' },
    { id: 'b2c_korea', label: t('b2c_korea_title') || 'B2C Korea' },
    
  ];

  const handleDataChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar 
        currentPage="finance" 
        onNavigate={(page) => {
          // Navigate to dashboard for module pages, or separate routes for finance/transactions
          if (page === 'finance' || page === 'transactions') {
            router.push(`/admin/${page}`);
          } else {
            router.push(`/admin/dashboard?page=${page}`);
          }
        }} 
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('finance_title') || 'Finance Management'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('finance_description') || 'Manage company finances, car transactions, and revenue'}
          </p>
        </div>

        {/* Summary Cards */}
        <FinanceSummary refreshTrigger={refreshTrigger} />

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'online_sales' && <OnlineSalesSection onDataChange={handleDataChange} />}
          {activeTab === 'b2b' && <B2BSection onDataChange={handleDataChange} />}
          {activeTab === 'b2c_algeria' && <B2CAlgeriaSection onDataChange={handleDataChange} />}
          {activeTab === 'b2c_korea' && <B2CKoreaSection onDataChange={handleDataChange} />}
          
        </div>
        </div>
      </div>
    </div>
  );
}
