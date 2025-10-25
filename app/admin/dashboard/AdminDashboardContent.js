'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../components/AdminSidebar';
import { useLanguage } from '@/app/components/LanguageProvider';
// Import all module components (we'll create these next)
import OverviewModule from './modules/OverviewModule';
import CategoriesModule from './modules/CategoriesModule';
import CarsModule from './modules/CarsModule';
import ClientsModule from './modules/ClientsModule';
import OrdersModule from './modules/OrdersModule';
import PaymentsModule from './modules/PaymentsModule';
import PaymentMethodsModule from './modules/PaymentMethodsModule';
import TrackingModule from './modules/TrackingModule';
import DocumentsModule from './modules/DocumentsModule';
import FilesModule from './modules/FilesModule';
import PDFGeneratorModule from './modules/PDFGeneratorModule';

export default function AdminDashboardContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('adminAuthenticated') === 'true';
    setIsAuthenticated(auth);
    
    if (!auth) {
      router.push('/admin/login');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const renderModule = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewModule />;
      case 'categories':
        return <CategoriesModule />;
      case 'cars':
        return <CarsModule />;
      case 'clients':
        return <ClientsModule />;
      case 'orders':
        return <OrdersModule />;
      case 'payments':
        return <PaymentsModule />;
      case 'payment-methods':
        return <PaymentMethodsModule />;
      case 'tracking':
        return <TrackingModule />;
      case 'documents':
        return <DocumentsModule />;
      case 'files':
        return <FilesModule />;
      case 'pdf-generator':
        return <PDFGeneratorModule />;
      default:
        return <OverviewModule />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <AdminSidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderModule()}
      </div>
    </div>
  );
}
