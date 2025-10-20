'use client';

import { useState } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';

export default function PaymentsModule() {
  const { t } = useLanguage();
  const [payments, setPayments] = useState([
    { id: 1, clientName: 'John Smith', car: 'Mercedes-Benz S-Class', amount: 115000, method: 'Bank Transfer', date: '2024-10-01', status: 'paid' },
    { id: 2, clientName: 'Emma Johnson', car: 'BMW M4', amount: 76900, method: 'Credit Card', date: '2024-10-15', status: 'pending' },
    { id: 3, clientName: 'Michael Brown', car: 'Tesla Model S', amount: 89990, method: 'Cash', date: '2024-10-18', status: 'paid' },
  ]);

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('paymentsManagement') || 'Payments Management'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('paymentsDescription') || 'Track all transactions and payments'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">{t('totalRevenue') || 'Total Revenue'}</h3>
          <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">{t('pendingPayments') || 'Pending'}</h3>
          <p className="text-3xl font-bold">${pendingPayments.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">{t('totalTransactions') || 'Transactions'}</h3>
          <p className="text-3xl font-bold">{payments.length}</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">ID</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('client') || 'Client'}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('car') || 'Car'}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('amount') || 'Amount'}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('method') || 'Method'}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('date') || 'Date'}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('status') || 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">#{payment.id}</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">{payment.clientName}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{payment.car}</td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">${payment.amount.toLocaleString()}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{payment.method}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{payment.date}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      payment.status === 'paid'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {payment.status}
                    </span>
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
