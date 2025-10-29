'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';
import Link from 'next/link';
import CarCard from './CarCard';

export default function RecentCars() {
  const { t } = useLanguage();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentCars = async () => {
      try {
        const response = await fetch('/api/cars?recent=true&limit=6');
        const data = await response.json();
        setCars(data);
      } catch (error) {
        console.error('Error fetching recent cars:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentCars();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {t('recentCars') || 'Recent Arrivals'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-96"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!cars || cars.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div>
            <span className="inline-block px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-semibold mb-4">
              {t('newArrivals') || 'New Arrivals'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {t('recentCars') || 'Recently Added'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t('recentCarsDescription') || 'Latest vehicles added to our inventory'}
            </p>
          </div>
          <Link
            href="/cars"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors whitespace-nowrap"
          >
            {t('viewAllCars') || 'View All'}
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Cars Grid - Mobile: 2 cols, Tablet+: 3 cols */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>
      </div>
    </section>
  );
}
