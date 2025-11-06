'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';
import CarCard from './CarCard';

export default function PopularCars() {
  const { t } = useLanguage();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularCars = async () => {
      try {
        const response = await fetch('/api/cars?pinned=true&limit=4');
        
        if (!response.ok) {
          console.error('Failed to fetch popular cars:', response.status);
          setCars([]);
          return;
        }
        
        const data = await response.json();
        
        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setCars(data);
        } else {
          console.error('Expected array but got:', data);
          setCars([]);
        }
      } catch (error) {
        console.error('Error fetching popular cars:', error);
        setCars([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPopularCars();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('popularCars') || 'Popular Cars'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
    <section id="cars" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4">
            {t('featured') || 'Featured'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('popularCars') || 'Popular Cars'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('popularCarsDescription') || 'Our most sought-after vehicles, handpicked for you'}
          </p>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cars.map((car) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>
      </div>
    </section>
  );
}
