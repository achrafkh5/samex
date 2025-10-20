'use client';

import { useState } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';

export default function ClientsModule() {
  const { t } = useLanguage();
  const [clients, setClients] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 555-0101',
      carOrdered: 'Mercedes-Benz S-Class',
      orderDate: '2024-10-01',
      status: 'delivered',
      amount: 115000,
      files: ['ID Card', 'License', 'Payment Proof']
    },
    {
      id: 2,
      name: 'Emma Johnson',
      email: 'emma.j@example.com',
      phone: '+1 555-0102',
      carOrdered: 'BMW M4',
      orderDate: '2024-10-15',
      status: 'pending',
      amount: 76900,
      files: ['ID Card', 'License']
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael.b@example.com',
      phone: '+1 555-0103',
      carOrdered: 'Tesla Model S',
      orderDate: '2024-10-18',
      status: 'paid',
      amount: 89990,
      files: ['ID Card', 'License', 'Payment Proof']
    },
  ]);

  const [selectedClient, setSelectedClient] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const updateStatus = (id, newStatus) => {
    setClients(clients.map(client =>
      client.id === id ? { ...client, status: newStatus } : client
    ));
    showToastMessage(`${t('statusUpdated') || 'Status updated'}: ${newStatus}`);
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'paid':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('clientsManagement') || 'Clients Management'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('clientsDescription') || 'Manage client orders and information'}
        </p>
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
                  {t('carOrdered') || 'Car Ordered'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('amount') || 'Amount'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('status') || 'Status'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('actions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{client.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{client.orderDate}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="text-gray-900 dark:text-white">{client.email}</div>
                      <div className="text-gray-500 dark:text-gray-400">{client.phone}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900 dark:text-white font-medium">
                    {client.carOrdered}
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                    ${client.amount.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={client.status}
                      onChange={(e) => updateStatus(client.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(client.status)} border-0 cursor-pointer`}
                    >
                      <option value="pending">{t('pending') || 'Pending'}</option>
                      <option value="paid">{t('paid') || 'Paid'}</option>
                      <option value="delivered">{t('delivered') || 'Delivered'}</option>
                    </select>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 text-sm font-medium transition-colors"
                    >
                      {t('viewDetails') || 'View Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Details Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-6">
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

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('name') || 'Name'}
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedClient.name}</p>
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
                    {t('orderDate') || 'Order Date'}
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedClient.orderDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('carOrdered') || 'Car Ordered'}
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedClient.carOrdered}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('amount') || 'Amount'}
                  </label>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    ${selectedClient.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {t('uploadedFiles') || 'Uploaded Files'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedClient.files.map((file, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                    >
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 z-50">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
