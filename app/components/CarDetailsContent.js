'use client';

import { useLanguage } from './LanguageProvider';
import Link from 'next/link';
import ImageGallery from './ImageGallery';
import { useState } from 'react';

export default function CarDetailsContent({ cars }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  if (!cars || cars.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-20 h-20 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Car Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The car you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/cars">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all">
              Back to Cars
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Use the car data with proper fallbacks
  const car = {
    ...cars,
    images: cars.images && cars.images.length > 0 
      ? cars.images 
      : cars.image 
        ? [cars.image] 
        : [],
    version: cars.model,
  };

  const finalPrice = car.priceType === 'range' 
    ? null // No discount logic for range prices
    : (car.discount > 0 ? car.price - car.discount : car.price);
  const availabilityColors = {
    available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    reserved: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    sold: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const conditionColors = {
    new: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    used: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    certified: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section with Breadcrumb */}
      <section className="relative pt-32 pb-8 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center mb-6 text-sm">
            <Link href="/" className="text-blue-100 hover:text-white transition-colors">
              {t('home')}
            </Link>
            <svg className="w-4 h-4 mx-2 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <Link href="/cars" className="text-blue-100 hover:text-white transition-colors">
              {t('cars')}
            </Link>
            <svg className="w-4 h-4 mx-2 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-white font-medium">{car.brand} {car.model}</span>
          </nav>

          {/* Page Title */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {car.brand} {car.model}
              </h1>
              <p className="text-xl text-blue-100">{car.year} • {t(car.condition)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
                <ImageGallery images={car.images} carName={`${car.brand} ${car.model}`} />
              </div>

              {/* Tabs */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Tab Headers */}
                <div className="flex border-b border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                      activeTab === 'overview'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {t('overview')}
                  </button>
                  <button
                    onClick={() => setActiveTab('specifications')}
                    className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                      activeTab === 'specifications'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {t('specifications')}
                  </button>
                  <button
                    onClick={() => setActiveTab('features')}
                    className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                      activeTab === 'features'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {t('features')}
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                          {t('luxuryPerformance')}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                           {car.brand} {car.model} {car.year}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{car.specs?.power}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('power')}</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{car.specs?.speed || car.specs?.range }</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{car.specs?.speed ? t('topSpeed') : t('range')}</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{car.specs?.doors}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('doors')}</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{car.specs?.seats}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('seats')}</div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('premiumFeatures')}</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300">{t('exceptionalComfort')}</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300">{t('advancedTech')}</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300">{t('primiumLeather')}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Specifications Tab */}
                  {activeTab === 'specifications' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: t('brand'), value: car.brand },
                          { label: t('model'), value: car.model },
                          { label: t('year'), value: car.year },
                          { label: t('condition'), value: t(car.condition) },
                          { label: t('version'), value: car.version },
                          { label: t('fuelType'), value: t(car.fuelType) },
                          { label: t('transmission'), value: t(car.transmission) },
                          { label: t('engineCapacity'), value: t(car.fuelType) },
                          { label: t('power'), value: car.specs?.power },
                          { label: car.specs?.speed ? t('topSpeed') : t('range'), value: car.specs?.speed || car.specs?.range },
                          { label: t('mileage'), value: car.specs?.mileage },
                          { label: t('doors'), value: car.specs?.doors },
                          { label: t('seats'), value: car.specs?.seats },
                          { label: t('vinNumber'), value: car.vin },
                        ].map((spec, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{spec.label}</span>
                            <span className="text-gray-900 dark:text-white">{spec.value}</span>
                          </div>
                        ))}
                        
                        {/* Colors - Full width */}
                        {car.specs?.colors && car.specs.colors.length > 0 && (
                          <div className="md:col-span-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-3">{t('availableColors')}</span>
                            <div className="flex flex-wrap gap-2">
                              {car.specs.colors.map((color, idx) => (
                                <span 
                                  key={idx}
                                  className="px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-600"
                                >
                                  {t(color)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Features Tab */}
                  {activeTab === 'features' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {car.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Price and CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Price Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 ${availabilityColors[car.availability]}`}>
                      {t(car.availability)}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ml-2 ${conditionColors[car.condition]}`}>
                      {t(car.condition)}
                    </span>
                  </div>

                  {car.priceType === 'range' ? (
                    <>
                      <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        {t('priceRange') || 'Price Range'}
                      </div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                        {car.priceMin?.toLocaleString()} - {car.priceMax?.toLocaleString()} DZD
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        {t('negotiablePrice') || 'Price will be finalized during reservation'}
                      </p>
                    </>
                  ) : (
                    <>
                      {car.discount > 0 && (
                        <div className="mb-2">
                          <span className="text-gray-500 dark:text-gray-400 line-through text-lg">
                            {car.price?.toLocaleString()} DZD
                          </span>
                          <span className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-sm font-bold rounded">
                            -{((car.discount / car.price) * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}

                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                        {finalPrice?.toLocaleString()} DZD
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t('finalPrice')}</p>
                    </>
                  )}

                  {car.availability === 'available' ? (
                    <>
                      <Link href={`/inscription/${car._id}`}>
                        <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl mb-3">
                          {t('reserveNow')}
                        </button>
                      </Link>
                    </>
                  ) : (
                    <button className="w-full px-6 py-4 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl font-bold text-lg cursor-not-allowed" disabled>
                      {car.availability === 'reserved' ? t('reserved') : t('sold')}
                    </button>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-3">
                    <button className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{t('financing')}</span>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{t('tradeIn')}</span>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{t('warranty')}</span>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Contact Card */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                  <h3 className="text-xl font-bold mb-2">{t('contactDealer')}</h3>
                  <p className="text-blue-100 mb-4">{t('haveQuestions')}</p>
                  <Link href={`/contact`}>
                    <button className="w-full px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-semibold transition-all">
                      {t('contact')}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
