import { Suspense } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CarsPageContent from '../components/CarsPageContent';

export const metadata = {
  title: "Available Cars - ALKO Cars",
  description: "Browse our extensive collection of premium vehicles. Find your perfect car from our inventory of new, used, and certified pre-owned vehicles.",
};

export default function CarsPage() {
  return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading cars...</p>
            </div>
          </div>
        }>
          <CarsPageContent />
        </Suspense>
        <Footer />
      </div>
  );
}
