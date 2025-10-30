'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';
import FinanceFormModal from './FinanceFormModal';

export default function OnlineSalesSection({ onDataChange }) {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [financeEntries, setFinanceEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
    const [clientsMap, setClientsMap] = useState({});
    const [carsMap, setCarsMap] = useState({});
    const [clients, setClients] = useState([]);
    const [cars, setCars] = useState([]);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const [ordersResponse, clientsResponse, carsResponse] = await Promise.all([
          fetch('/api/admin/orders'),
          fetch('/api/admin/clients'),
          fetch('/api/cars'),
        ]);

        const ordersData = await ordersResponse.json();
        const clientsData = await clientsResponse.json();
        const carsData = await carsResponse.json();

        // Handle different response formats
        const ordersArray = Array.isArray(ordersData) ? ordersData : (ordersData.orders || []);
        const clientsArray = Array.isArray(clientsData) ? clientsData : [];
        const carsArray = Array.isArray(carsData) ? carsData : [];

        setOrders(ordersArray);
        setClients(clientsArray);
        setCars(carsArray);

        // Create a map of clientId -> client object for quick lookup
        const map = {};
        clientsArray.forEach(client => {
          map[client._id] = client;
        });
        setClientsMap(map);
        const carMap = {};
        carsArray.forEach(car => {
          carMap[car._id] = car;
        });
        setCarsMap(carMap);

      // Fetch all finance entries to check which orders already have finance
      const [b2bRes, algeriaRes, koreaRes] = await Promise.all([
        fetch('/api/finance?type=B2B'),
        fetch('/api/finance?type=B2C_Algeria'),
        fetch('/api/finance?type=B2C_Korea'),
      ]);

      const allFinanceEntries = [
        ...(b2bRes.ok ? await b2bRes.json() : []),
        ...(algeriaRes.ok ? await algeriaRes.json() : []),
        ...(koreaRes.ok ? await koreaRes.json() : []),
      ];
      setFinanceEntries(allFinanceEntries);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFinance = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setShowModal(false);
  };

  const handleFinanceSaved = async () => {
    await fetchData();
    onDataChange();
    handleCloseModal();
  };

  const isFinanceAdded = (orderId) => {
    return financeEntries.some(entry => entry.linkedOrderId === orderId);
  };

  const getFinanceProfit = (orderId) => {
    const entry = financeEntries.find(entry => entry.linkedOrderId === orderId);
    return entry ? entry.netProfit : null;
  };

  // Filter completed/confirmed orders
  const completedOrders = orders?.filter(order => 
    order.status === 'completed' || 
    order.status === 'paid' || 
    order.status === 'delivered'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('online_sales_title') || 'Online Sales (From Orders)'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('online_sales_description') || 'Add finance details for online orders'}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t('refresh') || 'Refresh'}
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('car_name') || 'Car'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('client') || 'Client'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('selling_price') || 'Selling Price'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('order_date') || 'Order Date'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('status') || 'Status'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('net_profit') || 'Net Profit'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('actions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500 dark:text-gray-400">
                    {t('loading') || 'Loading...'}
                  </td>
                </tr>
              ) : completedOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500 dark:text-gray-400">
                    {t('no_online_orders') || 'No completed orders available'}
                  </td>
                </tr>
              ) : (
                completedOrders.map((order) => {
                  const hasFinance = isFinanceAdded(order._id);
                  const profit = getFinanceProfit(order._id);

                  return (
                    <tr key={order._id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {carsMap[order.selectedCarId]?.brand || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {carsMap[order.selectedCarId]?.model || ''}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-900 dark:text-white">
                        {clientsMap[order.clientId]?.fullName || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-blue-600 dark:text-blue-400 font-semibold">
                        {order.paymentAmount?.toLocaleString()}DA
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                        { new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'completed' || order.status === 'delivered'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        }`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {hasFinance && profit !== null ? (
                          <span className={`font-semibold ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {profit.toLocaleString()}DA
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {hasFinance ? (
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-sm font-medium">
                            ✓ {t('finance_added') || 'Added'}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddFinance(order)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            {t('add_finance') || 'Add Finance'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Finance Form Modal */}
      {showModal && selectedOrder && (
        <FinanceFormModal
          order={selectedOrder}
          onClose={handleCloseModal}
          onSave={handleFinanceSaved}
        />
      )}
    </div>
  );
}
