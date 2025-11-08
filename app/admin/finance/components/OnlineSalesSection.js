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
  const [dateFilter, setDateFilter] = useState('all');
  const [financeFilter, setFinanceFilter] = useState('all'); // 'all', 'added', 'not_added'


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

  // Date filtering function
  const filterByDate = (date) => {
    if (!date) return true;
    
    const itemDate = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case 'today':
        return itemDate >= today;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return itemDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return itemDate >= monthAgo;
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return itemDate >= yearAgo;
      case 'all':
      default:
        return true;
    }
  };

  // Filter by finance status
  const filterByFinanceStatus = (orderId) => {
    const hasFinance = isFinanceAdded(orderId);
    
    switch (financeFilter) {
      case 'added':
        return hasFinance;
      case 'not_added':
        return !hasFinance;
      case 'all':
      default:
        return true;
    }
  };

  // Filter completed/confirmed orders
  const completedOrders = orders?.filter(order => {
    const isCompleted = order.status === 'completed' || 
                        order.status === 'paid' || 
                        order.status === 'delivered';
    const matchesDate = filterByDate(order?.createdAt);
    const matchesFinanceStatus = filterByFinanceStatus(order._id);
    
    return isCompleted && matchesDate && matchesFinanceStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">{t('loading') || 'Loading online sales data...'}</p>
      </div>
    );
  }

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

      {/* Date Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mr-2">
          {t('date_filter') || 'Date'}:
        </div>
        {[
          { value: 'all', label: t('all') || 'All' },
          { value: 'today', label: t('today') || 'Today' },
          { value: 'week', label: t('this_week') || 'This Week' },
          { value: 'month', label: t('this_month') || 'This Month' },
          { value: 'year', label: t('this_year') || 'This Year' },
        ].map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setDateFilter(filter.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              dateFilter === filter.value
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Finance Status Filter */}
      <div className="flex flex-wrap gap-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mr-2">
          {t('finance_status') || 'Finance'}:
        </div>
        {[
          { value: 'all', label: t('all') || 'All' },
          { value: 'added', label: t('finance_added') || 'Added' },
          { value: 'not_added', label: t('finance_not_added') || 'Not Added' },
        ].map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setFinanceFilter(filter.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              financeFilter === filter.value
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {filter.label}
          </button>
        ))}
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
