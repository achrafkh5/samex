'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';
import Link from 'next/link';
//import { carsData } from '../data/carsData';
import CarCard from './CarCard';
import FilterBar from './FilterBar';

export default function CarsPageContent() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [carsData, setCarsData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: 'all',
    model: 'all',
    year: 'all',
    fuelType: 'all',
    transmission: 'all',
    minPrice: '',
    maxPrice: '',
    condition: 'all'
  });
  const [sortBy, setSortBy] = useState('default');
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

    // Fetch cars data on mount
    useEffect(() => {
        async function fetchCarsData() {
            setLoading(true);
            try {
                const response = await fetch('/api/cars');
                const data = await response.json();
                setCarsData(data);
            } catch (error) {
                console.error('Error fetching cars:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchCarsData();
    }, []);
  // Filter and sort cars
  const filteredCars = useMemo(() => {
    let result = [...carsData];

    // Search filter
    if (searchTerm) {
      result = result.filter(car =>
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.year.toString().includes(searchTerm)
      );
    }

    // Apply filters
    if (filters.brand !== 'all') {
      result = result.filter(car => car.brand === filters.brand);
    }
    if (filters.fuelType !== 'all') {
      result = result.filter(car => car.fuelType === filters.fuelType);
    }
    if (filters.transmission !== 'all') {
      result = result.filter(car => car.transmission === filters.transmission);
    }
    if (filters.year !== 'all') {
      result = result.filter(car => car.year.toString() === filters.year);
    }
    if (filters.condition !== 'all') {
      result = result.filter(car => car.condition === filters.condition);
    }
    if (filters.minPrice) {
      result = result.filter(car => car.price >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(car => car.price <= parseInt(filters.maxPrice));
    }

    // Sort
    switch (sortBy) {
      case 'priceLowToHigh':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceHighToLow':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'yearNewest':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'yearOldest':
        result.sort((a, b) => a.year - b.year);
        break;
      case 'brandAZ':
        result.sort((a, b) => a.brand.localeCompare(b.brand));
        break;
      case 'brandZA':
        result.sort((a, b) => b.brand.localeCompare(a.brand));
        break;
      default:
        break;
    }

    return result;
  }, [searchTerm, filters, sortBy, carsData]);

  // Pagination
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCars = filteredCars.slice(startIndex, endIndex);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      brand: 'all',
      model: 'all',
      year: 'all',
      fuelType: 'all',
      transmission: 'all',
      minPrice: '',
      maxPrice: '',
      condition: 'all'
    });
    setSearchTerm('');
    setSortBy('default');
    setCurrentPage(1);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center mb-6 text-sm">
              <Link href="/" className="text-blue-100 hover:text-white transition-colors">
                {t('home')}
              </Link>
              <svg className="w-4 h-4 mx-2 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-white font-medium">{t('cars')}</span>
            </nav>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              {t('availableCars')}
            </h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 mb-8">
              {t('carsPageDesc')}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 rounded-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-lg"
                />
                <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            // Loading Spinner
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex space-x-2">
                <div className="w-4 h-4 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-4 h-4 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-4 h-4 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300">
                {t('loadingCars') || 'Loading cars...'}
              </p>
            </div>
          ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                carsData={carsData}
              />
            </div>

            {/* Cars Grid */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="text-gray-600 dark:text-gray-400">
                  {t('showingResults')} <span className="font-bold text-gray-900 dark:text-white">{startIndex + 1}-{Math.min(endIndex, filteredCars.length)}</span> {t('of')} <span className="font-bold text-gray-900 dark:text-white">{filteredCars.length}</span> {t('results')}
                </div>

                <div className="flex items-center gap-4">
                  {/* Items per page */}
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={8}>8 {t('perPage')}</option>
                    <option value={12}>12 {t('perPage')}</option>
                    <option value={16}>16 {t('perPage')}</option>
                    <option value={24}>24 {t('perPage')}</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="default">{t('sortBy')}</option>
                    <option value="priceLowToHigh">{t('priceLowToHigh')}</option>
                    <option value="priceHighToLow">{t('priceHighToLow')}</option>
                    <option value="yearNewest">{t('yearNewest')}</option>
                    <option value="yearOldest">{t('yearOldest')}</option>
                    <option value="brandAZ">{t('brandAZ')}</option>
                    <option value="brandZA">{t('brandZA')}</option>
                  </select>
                </div>
              </div>

              {/* Cars Grid */}
              {currentCars.length > 0 ? (
                <>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {currentCars.map((car) => (
                      <CarCard key={car._id} car={car} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === i + 1
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <svg className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 20h.01M16 6v3M8 6v3M20 10a8 8 0 11-16 0 8 8 0 0116 0z" />
                  </svg>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('noResults')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {t('noResultsDesc')}
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    {t('clearFilters')}
                  </button>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </section>
    </>
  );
}
