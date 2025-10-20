'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';
import Link from 'next/link';
import StationList from './StationList';

export default function TrackingContent({ initialTrackingCode = '' }) {
  const { t } = useLanguage();
  const [trackingCode, setTrackingCode] = useState(initialTrackingCode);
  const [searchCode, setSearchCode] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  useEffect(() => {
    if (initialTrackingCode) {
      handleSearch(initialTrackingCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTrackingCode]);

  const handleSearch = async (code = searchCode) => {
    if (!code || code.trim().length === 0) {
      setError(t('invalidTrackingCode'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock tracking data
      const mockData = {
        trackingCode: code.toUpperCase(),
        status: 'inTransit',
        car: {
          brand: 'Mercedes-Benz',
          model: 'C-Class',
          year: 2024,
          version: 'C 300 4MATIC',
          color: 'Obsidian Black',
          vin: '1HGBH41JXMN109186',
          price: 45000,
          image: '/cars/mercedes-c-class.jpg'
        },
        delivery: {
          estimatedDate: '2024-10-25',
          estimatedTime: '15:00',
          address: '123 Main Street, New York, NY 10001',
          instructions: 'Please call upon arrival'
        },
        progress: {
          currentStationIndex: 2,
          percentComplete: 60,
          lastUpdated: '2024-10-19T14:30:00'
        },
        stations: [
          {
            id: 1,
            name: 'Manufacturing Plant',
            location: 'Stuttgart, Germany',
            estimatedArrival: '2024-10-10T09:00:00',
            estimatedDeparture: '2024-10-11T14:00:00',
            actualArrival: '2024-10-10T08:45:00',
            actualDeparture: '2024-10-11T13:30:00'
          },
          {
            id: 2,
            name: 'Port of Hamburg',
            location: 'Hamburg, Germany',
            estimatedArrival: '2024-10-12T16:00:00',
            estimatedDeparture: '2024-10-14T10:00:00',
            actualArrival: '2024-10-12T15:20:00',
            actualDeparture: '2024-10-14T09:45:00'
          },
          {
            id: 3,
            name: 'Port of Newark',
            location: 'Newark, NJ, USA',
            estimatedArrival: '2024-10-20T11:00:00',
            estimatedDeparture: '2024-10-21T08:00:00',
            actualArrival: null,
            actualDeparture: null
          },
          {
            id: 4,
            name: 'Distribution Center',
            location: 'Edison, NJ, USA',
            estimatedArrival: '2024-10-22T14:00:00',
            estimatedDeparture: '2024-10-24T09:00:00',
            actualArrival: null,
            actualDeparture: null
          },
          {
            id: 5,
            name: 'Final Destination',
            location: 'New York, NY, USA',
            estimatedArrival: '2024-10-25T15:00:00',
            estimatedDeparture: null,
            actualArrival: null,
            actualDeparture: null
          }
        ]
      };

      setTrackingData(mockData);
      setTrackingCode(code.toUpperCase());
    } catch (err) {
      setError(t('trackingError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (trackingCode) {
      handleSearch(trackingCode);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'processing':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'inTransit':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };

  const formatDate = (date, time) => {
    if (!date) return '-';
    const d = new Date(date);
    const dateStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return time ? `${dateStr}, ${time}` : dateStr;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Header */}
      <section className="relative pt-32 pb-12 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center mb-6 text-sm">
            <Link href="/" className="text-blue-100 hover:text-white transition-colors">
              {t('home')}
            </Link>
            <svg className="w-4 h-4 mx-2 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-white font-medium">{t('trackYourCar')}</span>
          </nav>

          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('trackYourCar')}
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              {t('trackingPageDescription')}
            </p>

            {/* Search Box */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={t('trackingCodePlaceholder')}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => handleSearch()}
                  disabled={isLoading}
                  className={`px-8 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center space-x-2 ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{t('processing')}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>{t('searchTracking')}</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      {trackingData ? (
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Car Info & Progress */}
              <div className="lg:col-span-2 space-y-8">
                {/* Tracking Summary Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {t('trackingSummary')}
                    </h2>
                    <button
                      onClick={handleRefresh}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-gray-900 dark:text-white font-semibold transition-all flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>{t('refreshTracking')}</span>
                    </button>
                  </div>

                  {/* Car Details */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {trackingData.car.brand} {trackingData.car.model}
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                          {trackingData.car.year} • {trackingData.car.version}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(trackingData.status)}`}>
                        {t(trackingData.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('color')}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{trackingData.car.color}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('vin')}</p>
                        <p className="font-semibold text-gray-900 dark:text-white font-mono text-xs">
                          {trackingData.car.vin}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('price')}</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          ${trackingData.car.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t('deliveryProgress')}
                      </p>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {trackingData.progress.percentComplete}{t('percentComplete')}
                      </p>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000"
                        style={{ width: `${trackingData.progress.percentComplete}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('completedStations')}</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {trackingData.progress.currentStationIndex}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('currentStation')}</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {trackingData.stations[trackingData.progress.currentStationIndex]?.name || '-'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('remainingStations')}</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {trackingData.stations.length - trackingData.progress.currentStationIndex - 1}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stations List */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {t('deliveryRoute')}
                  </h2>
                  <StationList
                    stations={trackingData.stations}
                    currentStationIndex={trackingData.progress.currentStationIndex}
                  />
                </div>
              </div>

              {/* Right Column - Delivery Info */}
              <div className="space-y-8">
                {/* Estimated Delivery Card */}
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-8 shadow-lg text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-2xl font-bold">{t('estimatedDelivery')}</h3>
                  </div>
                  <p className="text-3xl font-bold mb-2">
                    {formatDate(trackingData.delivery.estimatedDate, trackingData.delivery.estimatedTime)}
                  </p>
                  <p className="text-green-100">
                    {t('lastUpdated')}: {new Date(trackingData.progress.lastUpdated).toLocaleString()}
                  </p>
                </div>

                {/* Delivery Address Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{t('deliveryAddress')}</span>
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {trackingData.delivery.address}
                  </p>
                </div>

                {/* Tracking Code Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    {t('trackingCode')}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {trackingData.trackingCode}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                  </h3>
                  <Link href="/contact">
                    <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{t('contactUs')}</span>
                    </button>
                  </Link>
                  <Link href="/dashboard">
                    <button className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold transition-all flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>{t('myDashboard')}</span>
                    </button>
                  </Link>
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {t('trackingHelp')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('trackingPageDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : !isLoading && (
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <svg className="w-24 h-24 text-gray-300 dark:text-gray-700 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {t('enterCodeToTrack')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('trackingPageDescription')}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
