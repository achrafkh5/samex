'use client';

import { useState } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';

export default function TrackingModule() {
  const { t } = useLanguage();
  const [trackings, setTrackings] = useState([
    {
      id: 1,
      trackingCode: 'DC6T5K2H9P',
      car: 'Mercedes-Benz S-Class',
      client: 'John Smith',
      currentStation: 'Final Destination',
      status: 'delivered',
      progress: 100,
      estimatedDelivery: '2024-10-25'
    },
    {
      id: 2,
      trackingCode: 'BM4W8X3L2Y',
      car: 'BMW M4',
      client: 'Emma Johnson',
      currentStation: 'Port of Newark',
      status: 'in-transit',
      progress: 60,
      estimatedDelivery: '2024-10-30'
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState(null);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('trackingManagement') || 'Tracking & Itinerary Management'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('trackingDescription') || 'Manage delivery routes and track shipments'}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>{t('createRoute') || 'Create Route'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trackings.map((tracking) => (
          <div key={tracking.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{tracking.car}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{tracking.client}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                tracking.status === 'delivered'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              }`}>
                {tracking.status === 'delivered' ? (t('delivered') || 'Delivered') : (t('inTransit') || 'In Transit')}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('trackingCode') || 'Tracking Code'}</span>
                  <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{tracking.trackingCode}</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('currentStation') || 'Current Station'}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{tracking.currentStation}</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-600 dark:text-gray-400">{t('estimatedDelivery') || 'Est. Delivery'}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{tracking.estimatedDelivery}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('progress') || 'Progress'}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{tracking.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${tracking.progress}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setSelectedTracking(tracking)}
                className="w-full mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
              >
                {t('viewRoute') || 'View Route Details'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Route Details Modal */}
      {selectedTracking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('routeDetails') || 'Route Details'}</h2>
              <button onClick={() => setSelectedTracking(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">{t('trackingCode') || 'Tracking Code'}: <span className="font-mono font-semibold text-blue-600">{selectedTracking.trackingCode}</span></p>
              <p className="text-gray-600 dark:text-gray-400">{t('car') || 'Car'}: <span className="font-semibold text-gray-900 dark:text-white">{selectedTracking.car}</span></p>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('stations') || 'Stations'}</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Manufacturing Plant</p>
                      <p className="text-xs text-gray-500">Stuttgart, Germany</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Current: {selectedTracking.currentStation}</p>
                      <p className="text-xs text-gray-500">In Progress</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
