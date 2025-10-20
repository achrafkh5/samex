'use client';

import { useLanguage } from './LanguageProvider';

export default function DocumentCard({ document }) {
  const { t } = useLanguage();

  const getStatusColor = () => {
    switch (document.status) {
      case 'available':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'downloaded':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'notAvailable':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getIcon = () => {
    if (document.type === 'invoice') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    } else if (document.type === 'certificate') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
  };

  const handleDownload = () => {
    if (document.status === 'available' || document.status === 'downloaded') {
      // Mock download functionality
      console.log('Downloading:', document.name);
      // In production, this would trigger actual file download
      // window.open(document.url, '_blank');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        {/* Icon and Title */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t(document.name)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {document.size || 'PDF Document'}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}
        >
          {t(document.status)}
        </span>
      </div>

      {/* File Info */}
      {document.date && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {t('lastUpdate')}: {document.date}
        </p>
      )}

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={document.status === 'notAvailable'}
        className={`w-full px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
          document.status === 'notAvailable'
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl group-hover:scale-105'
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span>{t('download')}</span>
      </button>
    </div>
  );
}
