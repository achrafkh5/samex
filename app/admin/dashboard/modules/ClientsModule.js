'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';

export default function ClientsModule() {
  const { t } = useLanguage();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data);
    };

    fetchClients();
  }, []);

  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');



  const filteredClients = clients.filter(client =>
    client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('clientsManagement') || 'Clients Management'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('clientsDescription') || 'View and manage client information'}
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={t('searchClients') || 'Search clients...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('client') || 'Client'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('contact') || 'Contact'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('location') || 'Location'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('actions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client._id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-gray-900 dark:text-white">{client.fullName}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                    {client.email}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                    {client.city}, {client.country}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm"
                    >
                      {t('viewDetails') || 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('clientDetails') || 'Client Details'}
              </h2>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {t('personalInfo') || 'Personal Information'}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('fullName') || 'Full Name'}
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedClient.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('email') || 'Email'}
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedClient.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('phone') || 'Phone'}
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedClient.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('dateOfBirth') || 'Date of Birth'}
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedClient.dateOfBirth}</p>
                  </div>
                  {selectedClient.gender && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {t('gender') || 'Gender'}
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedClient.gender}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('nationality') || 'Nationality'}
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedClient.nationality}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('nationalId') || 'National ID'}
                    </label>
                    <p className="text-gray-900 dark:text-white font-mono">{selectedClient.nationalId}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {t('address') || 'Address Information'}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('streetAddress') || 'Street Address'}
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedClient.streetAddress}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('city') || 'City'}
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedClient.city}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('country') || 'Country'}
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedClient.country}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('zipCode') || 'ZIP Code'}
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedClient.zipCode}</p>
                  </div>
                  {selectedClient.registeredDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {t('registeredDate') || 'Registered Date'}
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(selectedClient.registeredDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedClient._id && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {t('clientId') || 'Client ID'}
                      </label>
                      <p className="text-gray-900 dark:text-white font-mono text-xs">{selectedClient._id}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
              >
                {t('close') || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
