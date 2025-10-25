import AdminDashboardContent from './AdminDashboardContent';
import { Suspense } from 'react';
export const metadata = {
  title: 'Dashboard - DreamCars Admin',
  description: 'Admin dashboard for managing the car agency',
};

function DashboardLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          {/* Animated gradient ring */}
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-blue-600 border-r-purple-600 animate-spin"></div>
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loading Dashboard
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Please wait...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardLoadingSpinner />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
