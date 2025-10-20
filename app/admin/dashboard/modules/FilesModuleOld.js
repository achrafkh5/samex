'use client';

import { useState } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';

export default function FilesModule() {
  const { t } = useLanguage();
  const [files, setFiles] = useState([
    { id: 1, name: 'ID Card - John Smith.pdf', client: 'John Smith', type: 'ID', size: '2.4 MB', uploadDate: '2024-10-01', status: 'verified' },
    { id: 2, name: 'License - Emma Johnson.pdf', client: 'Emma Johnson', type: 'License', size: '1.8 MB', uploadDate: '2024-10-15', status: 'pending' },
    { id: 3, name: 'Payment Proof - Michael Brown.pdf', client: 'Michael Brown', type: 'Payment', size: '3.2 MB', uploadDate: '2024-10-18', status: 'verified' },
  ]);

  const [filterType, setFilterType] = useState('all');

  const filteredFiles = filterType === 'all' ? files : files.filter(f => f.type.toLowerCase() === filterType);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('filesManagement') || 'Uploaded Files Management'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('filesDescription') || 'View and manage client uploaded files'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'id', 'license', 'payment'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFiles.map((file) => (
          <div key={file.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                file.status === 'verified'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
              }`}>
                {file.status}
              </span>
            </div>
            
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 truncate">{file.name}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{file.client}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
              <span>{file.size}</span>
              <span>{file.uploadDate}</span>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 text-sm font-medium">
                {t('view') || 'View'}
              </button>
              <button className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium">
                {t('download') || 'Download'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
