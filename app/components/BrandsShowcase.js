'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';
import Image from 'next/image';
import Link from 'next/link';

export default function BrandsShowcase() {
  const { t } = useLanguage();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands');
        
        if (!response.ok) {
          console.error('Failed to fetch brands:', response.status);
          setBrands([]);
          return;
        }
        
        const data = await response.json();
        
        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setBrands(data);
        } else {
          console.error('Expected array but got:', data);
          setBrands([]);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('exploreBrands') || 'Explore Brands'}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-32"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4">
            {t('ourBrands') || 'Our Brands'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('exploreBrands') || 'Explore by Brand'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('brandsDescription') || 'Choose from premium automotive brands from around the world'}
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {brands?.map((brand) => (
            <Link
              key={brand._id}
              href={`/cars?brand=${encodeURIComponent(brand.name)}`}
              className="group"
            >
              <div className="relative bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:bg-white dark:hover:bg-gray-600 border-2 border-transparent hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-xl transform hover:-translate-y-1 cursor-pointer">
                <div className="aspect-square relative flex items-center justify-center">
                  {brand.image ? (
                    <Image
                      src={brand.image}
                      alt={brand.name}
                      width={80}
                      height={80}
                      className="object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                        {brand.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-4 text-center text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {brand.name}
                </p>
                {brand.minPrice > 0 && brand.maxPrice > 0 && (
                  <p className="mt-2 text-center text-xs text-gray-600 dark:text-gray-400">
                    {new Intl.NumberFormat('fr-DZ', { 
                      style: 'decimal',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(brand.minPrice)} - {new Intl.NumberFormat('fr-DZ', { 
                      style: 'decimal',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(brand.maxPrice)} DA
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
