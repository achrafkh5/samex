'use client';

import { useState,useEffect } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';
import { 
  viewCloudinaryPDF, 
  downloadCloudinaryFile, 
  getCloudinaryFileType 
} from '../../../utils/cloudinaryHelper';

/* eslint-disable @next/next/no-img-element */

export default function OrdersModule() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [cars, setCars] = useState([]);
  const [clientsMap, setClientsMap] = useState({});
  const [carsMap, setCarsMap] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch both orders and clients
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch orders and clients in parallel
        const [ordersResponse, clientsResponse, carsResponse] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/clients'),
          fetch('/api/cars'),
        ]);

        const ordersData = await ordersResponse.json();
        const clientsData = await clientsResponse.json();
        const carsData = await carsResponse.json();

        setOrders(ordersData.orders);
        setClients(clientsData);
        setCars(carsData);

        // Create a map of clientId -> client object for quick lookup
        const map = {};
        (clientsData || []).forEach(client => {
          map[client._id] = client;
        });
        setClientsMap(map);
        const carMap = {};
        (carsData || []).forEach(car => {
          carMap[car._id] = car;
        });
        setCarsMap(carMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to get client name by ID
  const getClientName = (clientId) => {
    return clientsMap[clientId]?.fullName || 'Unknown Client';
  };

  // Helper function to detect file type from URL (using cloudinaryHelper)
  const getFileType = (url) => {
    return getCloudinaryFileType(url);
  };

  // Helper function to view PDF in browser
  const viewFile = (url, filename) => {
    const fileType = getFileType(url);
    if (fileType === 'pdf') {
      viewCloudinaryPDF(url, filename);
      showToastMessage(`Opening ${filename} in new tab`);
    } else {
      // For images, open in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
      showToastMessage(`Opening ${filename}`);
    }
  };

  // Helper function to download file (using cloudinaryHelper)
  const downloadFile = (url, filename) => {
    try {
      downloadCloudinaryFile(url, filename);
      showToastMessage(`${filename} download started`);
    } catch (error) {
      console.error('Download error:', error);
      showToastMessage('Failed to download file');
    }
  };

  const getCarName = (carId) => {
    return `${carsMap[carId]?.brand || 'Unknown brand'} ${carsMap[carId]?.model || 'Unknown model'}`;
  };

  let filteredOrders = [];
  if(orders?.length > 0) {
   filteredOrders = orders?.filter(order => {
     const clientName = getClientName(order?.clientId);
     const carName = getCarName(order?.selectedCarId);
     return (
       order?.trackingCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       carName?.toLowerCase().includes(searchTerm.toLowerCase())
     );
   });
  }
  const updateStatus = async(id, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const data = await response.json();
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === id ? { ...order, status: newStatus } : order
        )
      );
      showToastMessage(`${t('statusUpdated') || 'Status updated'}: ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      showToastMessage('Failed to update order status');
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'canceled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };
let totalRevenue = 0;
let pendingOrders = 0;
let deliveredOrders = 0;
if(orders?.length > 0) {
   totalRevenue = orders?.reduce(
  (sum, order) => sum + Number(order?.paymentAmount || 0),
  0
);
   pendingOrders = orders?.filter(o => o?.status === 'pending')?.length;
  deliveredOrders = orders?.filter(o => o?.status === 'delivered')?.length;
}


  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('ordersManagement') || 'Orders Management'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('ordersDescription') || 'View and manage client orders'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={t('searchOrders') || 'Search orders by tracking code, client name, or car...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Orders</p>
              <p className="text-3xl font-bold">{orders?.length}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium mb-1">Pending</p>
              <p className="text-3xl font-bold">{pendingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Delivered</p>
              <p className="text-3xl font-bold">{deliveredOrders}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Total Revenue</p>
              <p className="text-3xl font-bold">${(totalRevenue / 1000).toFixed(0)}K</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('trackingCode') || 'Tracking Code'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('client') || 'Client'}
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
              {filteredOrders.map((order) => (
                <tr key={order._id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white font-mono">{order.trackingCode}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {getClientName(order.clientId)}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900 dark:text-white font-medium">
                    {getCarName(order.selectedCarId)}
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                    ${order?.paymentAmount?.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)} border-0 cursor-pointer`}
                    >
                      <option value="pending" className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)} border-0 cursor-pointer`}>{t('pending') || 'Pending'}</option>
                      <option value="paid" className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)} border-0 cursor-pointer`}>{t('paid') || 'Paid'}</option>
                      <option value="delivered" className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)} border-0 cursor-pointer`}>{t('delivered') || 'Delivered'}</option>
                      <option value="canceled" className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)} border-0 cursor-pointer`}>{t('canceled') || 'Canceled'}</option>
                    </select>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => setSelectedOrder(order)}
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('orderDetails') || 'Order Details'}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  {t('orderInfo') || 'Order Information'}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('trackingCode') || 'Tracking Code'}
                    </label>
                    <p className="text-gray-900 dark:text-white font-mono font-bold">{selectedOrder.trackingCode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('client') || 'Client'}
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {getClientName(selectedOrder.clientId)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('orderDate') || 'Order Date'}
                    </label>
                    <p className="text-gray-900 dark:text-white">
                        {new Date(selectedOrder?.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('status') || 'Status'}
                    </label>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('carOrdered') || 'Car Ordered'}
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">{getCarName(selectedOrder.selectedCarId)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('paymentMethod') || 'Payment Method'}
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('amount') || 'Amount'}
                    </label>
                    <p className="text-gray-900 dark:text-white font-bold text-lg">
                      ${selectedOrder.paymentAmount?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Files */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  {t('uploadedDocuments') || 'Uploaded Documents'}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {selectedOrder.idCardUrl && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <svg className="w-8 h-8 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">ID Card</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {getFileType(selectedOrder.idCardUrl) === 'image' ? 'Image' : 'PDF Document'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {getFileType(selectedOrder.idCardUrl) === 'pdf' && (
                            <button
                              onClick={() => viewFile(selectedOrder.idCardUrl, 'id-card.pdf')}
                              className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                          )}
                          <button
                            onClick={() => downloadFile(selectedOrder.idCardUrl, 'id-card.' + selectedOrder.idCardUrl.split('.').pop().split('?')[0])}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </button>
                        </div>
                      </div>
                      {getFileType(selectedOrder.idCardUrl) === 'image' && (
                        <div className="mt-2">
                          <img 
                            src={selectedOrder.idCardUrl} 
                            alt="ID Card" 
                            className="w-full h-48 object-contain bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {selectedOrder.driversLicenseUrl && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <svg className="w-8 h-8 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Driver License</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {getFileType(selectedOrder.driversLicenseUrl) === 'image' ? 'Image' : 'PDF Document'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {getFileType(selectedOrder.driversLicenseUrl) === 'pdf' && (
                            <button
                              onClick={() => viewFile(selectedOrder.driversLicenseUrl, 'drivers-license.pdf')}
                              className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                          )}
                          <button
                            onClick={() => downloadFile(selectedOrder.driversLicenseUrl, 'drivers-license.' + selectedOrder.driversLicenseUrl.split('.').pop().split('?')[0])}
                            className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </button>
                        </div>
                      </div>
                      {getFileType(selectedOrder.driversLicenseUrl) === 'image' && (
                        <div className="mt-2">
                          <img 
                            src={selectedOrder.driversLicenseUrl} 
                            alt="Driver License" 
                            className="w-full h-48 object-contain bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {selectedOrder.paymentProofUrl && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <svg className="w-8 h-8 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Payment Proof</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {getFileType(selectedOrder.paymentProofUrl) === 'image' ? 'Image' : 'PDF Document'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {getFileType(selectedOrder.paymentProofUrl) === 'pdf' && (
                            <button
                              onClick={() => viewFile(selectedOrder.paymentProofUrl, 'payment-proof.pdf')}
                              className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                          )}
                          <button
                            onClick={() => downloadFile(selectedOrder.paymentProofUrl, 'payment-proof.' + selectedOrder.paymentProofUrl.split('.').pop().split('?')[0])}
                            className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </button>
                        </div>
                      </div>
                      {getFileType(selectedOrder.paymentProofUrl) === 'image' && (
                        <div className="mt-2">
                          <img 
                            src={selectedOrder.paymentProofUrl} 
                            alt="Payment Proof" 
                            className="w-full h-48 object-contain bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {selectedOrder.proofOfResidenceUrl && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-8 h-8 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Payment Proof</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">PDF Document</p>
                        </div>
                      </div>
                      <a
                        href={selectedOrder.proofOfResidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50"
                      >
                        View
                      </a>
                    </div>
                  )}
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
        </>
      )}
    </div>
  );
}
