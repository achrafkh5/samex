'use client';

import { useState } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';

export default function DocumentsModule() {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState([
    { id: 1, type: 'Invoice', client: 'John Smith', car: 'Mercedes-Benz S-Class', date: '2024-10-01', status: 'generated' },
    { id: 2, type: 'Certificate', client: 'Emma Johnson', car: 'BMW M4', date: '2024-10-15', status: 'pending' },
    { id: 3, type: 'Tracking Report', client: 'Michael Brown', car: 'Tesla Model S', date: '2024-10-18', status: 'generated' },
  ]);

  const generateDocument = (type) => {
    alert(`${t('generating') || 'Generating'} ${type}...`);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('documentsManagement') || 'Documents Management'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('documentsDescription') || 'Generate and manage PDF documents'}
        </p>
      </div>

      {/* Generate Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => generateDocument('Invoice')}
          className="bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-600 rounded-xl p-6 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <svg className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('generateInvoice') || 'Generate Invoice'}</h3>
        </button>
        <button
          onClick={() => generateDocument('Certificate')}
          className="bg-white dark:bg-gray-800 border-2 border-green-500 dark:border-green-600 rounded-xl p-6 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
        >
          <svg className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('generateCertificate') || 'Generate Certificate'}</h3>
        </button>
        <button
          onClick={() => generateDocument('Report')}
          className="bg-white dark:bg-gray-800 border-2 border-purple-500 dark:border-purple-600 rounded-xl p-6 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
        >
          <svg className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('generateReport') || 'Generate Report'}</h3>
        </button>
      </div>

      {/* Documents Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('type') || 'Type'}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('client') || 'Client'}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('car') || 'Car'}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('date') || 'Date'}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('status') || 'Status'}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('actions') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">{doc.type}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{doc.client}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{doc.car}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{doc.date}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      doc.status === 'generated'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 text-sm font-medium">
                      {t('download') || 'Download'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
