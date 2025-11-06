'use client';

import { useLanguage } from './LanguageProvider';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function CarCard({ car }) {
  const { t, language } = useLanguage();
  const [imageError, setImageError] = useState(false);

  // Condition badge colors
  const conditionColors = {
    new: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    used: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    certified: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };

  // Get the first image from images array or fallback to image field
  const carImage = car.images?.[0] || car.image || null;

  // Format price
  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : 'en-US', {
      minimumFractionDigits: 0,
    }).format(price) + ' DZD';
  };

  return (
    <Link href={`/cars/${car._id}`}>
      <div className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 dark:border-gray-800 cursor-pointer h-full flex flex-col">
        {/* Image Section */}
        <div className="relative h-48 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
          {!imageError && carImage ? (
            <Image
              src={carImage}
              alt={`${car.brand} ${car.model}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {car.condition && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${conditionColors[car.condition]}`}>
                {t(car.condition)}
              </span>
            )}
            {car.isPinned && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {/* Brand & Model */}
          <div className="mb-4 flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
              {car.brand} {car.model}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{car.year}</p>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-t border-b border-gray-200 dark:border-gray-800">
            {/* Fuel Type */}
            {car.fuelType && (
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('fuelType') || 'Fuel'}</p>
                <p className="text-xs font-semibold text-gray-900 dark:text-white capitalize">{t(car.fuelType)}</p>
              </div>
            )}

            {/* Transmission */}
            {car.transmission && (
              <div className="text-center border-x border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('transmission') || 'Trans'}</p>
                <p className="text-xs font-semibold text-gray-900 dark:text-white capitalize">{t(car.transmission)}</p>
              </div>
            )}

            {/* Power */}
            {car.specs?.power && (
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('power') || 'Power'}</p>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{car.specs?.power}</p>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {car.priceType === 'range' ? t('priceRange') || 'Price Range' : t('startingPrice') || 'Price'}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {car.priceType === 'range' 
                ? `${formatPrice(car.priceMin)} - ${formatPrice(car.priceMax)}`
                : formatPrice(car.price)
              }
            </p>
          </div>

          {/* View Details Button */}
          <button className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
            <span>{t('viewDetails')}</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}
