'use client';

import { useLanguage } from './LanguageProvider';

export default function StationList({ stations, currentStationIndex }) {
  const { t } = useLanguage();

  const getStationStatus = (index) => {
    if (index < currentStationIndex) return 'completed';
    if (index === currentStationIndex) return 'inProgress';
    return 'upcoming';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-500';
      case 'inProgress':
        return 'bg-blue-600 border-blue-600 animate-pulse';
      case 'upcoming':
        return 'bg-gray-300 dark:bg-gray-600 border-gray-300 dark:border-gray-600';
      default:
        return 'bg-gray-300 dark:bg-gray-600 border-gray-300 dark:border-gray-600';
    }
  };

  const getStationIcon = (status) => {
    if (status === 'completed') {
      return (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    } else if (status === 'inProgress') {
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    } else {
      return (
        <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500"></div>
      );
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {stations.map((station, index) => {
        const status = getStationStatus(index);
        const isLast = index === stations.length - 1;

        return (
          <div key={station.id} className="relative">
            {/* Connecting Line */}
            {!isLast && (
              <div
                className={`absolute left-6 top-16 w-0.5 h-full ${
                  status === 'completed'
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
                style={{ height: 'calc(100% - 4rem)' }}
              ></div>
            )}

            {/* Station Card */}
            <div
              className={`relative flex items-start space-x-4 p-6 rounded-xl border-2 transition-all ${
                status === 'completed'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : status === 'inProgress'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-lg'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Station Icon */}
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full border-4 flex items-center justify-center ${getStatusColor(
                  status
                )}`}
              >
                {getStationIcon(status)}
              </div>

              {/* Station Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {station.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {station.location}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : status === 'inProgress'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {t(status)}
                  </span>
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {/* Arrival */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      {status === 'completed' ? t('actualArrival') : t('estimatedArrival')}
                    </p>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDateTime(status === 'completed' ? station.actualArrival : station.estimatedArrival)}
                      </p>
                    </div>
                  </div>

                  {/* Departure */}
                  {!isLast && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        {status === 'completed' ? t('actualDeparture') : t('estimatedDeparture')}
                      </p>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatDateTime(status === 'completed' ? station.actualDeparture : station.estimatedDeparture)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Station Number */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('stationNumber').replace('{number}', index + 1)} {isLast && `• ${t('finalDestination')}`}
                  </p>
                </div>

                {/* Current Station Indicator */}
                {status === 'inProgress' && (
                  <div className="mt-3 flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
                    <p className="text-sm font-semibold">{t('currentStation')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
