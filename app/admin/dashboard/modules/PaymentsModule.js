'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';

export default function PaymentsModule() {
  const { t } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [cars, setCars] = useState([]);
  const [clientsMap, setClientsMap] = useState({});
  const [carsMap, setCarsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersResponse, clientsResponse, carsResponse] = await Promise.all([
          fetch('/api/admin/orders'),
          fetch('/api/admin/clients'),
          fetch('/api/cars'),
        ]);

        const ordersData = await ordersResponse.json();
        const clientsData = await clientsResponse.json();
        const carsData = await carsResponse.json();

        setPayments(ordersData.orders);
        setPayments(prevPayments => prevPayments?.filter(p => p.status !== 'canceled'));
        setClients(clientsData);
        setCars(carsData);
        if (clientsData.length > 0) {
          const map = {};
          (clientsData || [])?.forEach(client => {
            map[client._id] = client;
          });
          setClientsMap(map);
        }
        if (carsData.length > 0) {
          const map = {};
          (carsData || [])?.forEach(car => {
            map[car._id] = car;
          });
          setCarsMap(map);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  const totalRevenue = payments
  ?.filter(p => p.status === 'paid')
  .reduce((sum, p) => sum + Number(p.paymentAmount), 0);

const pendingPayments = payments
  ?.filter(p => p.status === 'pending')
  .reduce((sum, p) => sum + Number(p.paymentAmount), 0);


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
          <p className="text-3xl font-bold">{totalRevenue?.toLocaleString()} DZD</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">{t('pendingPayments') || 'Pending'}</h3>
          <p className="text-3xl font-bold">{pendingPayments?.toLocaleString()} DZD</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">{t('totalTransactions') || 'Transactions'}</h3>
          <p className="text-3xl font-bold">{payments?.length}</p>
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
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-500 dark:text-gray-400">{t('loading') || 'Loading payments...'}</p>
                    </div>
                  </td>
                </tr>
              ) : payments?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500 dark:text-gray-400">
                    {t('noPayments') || 'No payments found'}
                  </td>
                </tr>
              ) : (
                payments?.map((payment) => (
                <tr key={payment._id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">#{payment._id}</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">{clientsMap[payment.clientId].fullName}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{carsMap[payment.selectedCarId].brand} {carsMap[payment.selectedCarId].model}</td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">{payment.paymentAmount?.toLocaleString()} DZD</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{payment.paymentMethod}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{new Date(payment.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      payment.status === 'paid'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : payment.status === 'delivered'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : payment.status === 'canceled'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
