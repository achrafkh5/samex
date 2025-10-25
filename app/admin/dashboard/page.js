import AdminDashboardContent from './AdminDashboardContent';
import { Suspense } from 'react';
export const metadata = {
  title: 'Dashboard - DreamCars Admin',
  description: 'Admin dashboard for managing the car agency',
};

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
