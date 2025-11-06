'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '@/app/components/LanguageProvider';
import { useTheme } from 'next-themes';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isRTL = language === 'ar';

  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [cars, setCars] = useState([]);
  const [carsMap, setCarsMap] = useState({});
  const [clientsMap, setClientsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'profile'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch orders and client info
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
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

        const carMap = {};
        (carsData || []).forEach(car => {
          carMap[car._id] = car;
        });
        setCarsMap(carMap);

        const map = {};
        (clientsData || []).forEach(client => {
          map[client._id] = client;
        });
        setClientsMap(map);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = async (order) => {
    setSelectedOrder(order);
    setShowModal(true);
    setLoadingCertificates(true);
    setCertificates([]);

    try {
      const res = await fetch(`/api/documents?orderId=${order._id}`);
      const data = await res.json();

      // Filter documents that are certificates (type: 'invoice' or 'inscription')
      const certs = Array.isArray(data) 
        ? data.filter(doc => doc.type === 'invoice' || doc.type === 'inscription') 
        : [];
      setCertificates(certs);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setCertificates([]);
    } finally {
      setLoadingCertificates(false);
    }
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setCertificates([]);
  };

  const handleDownloadCertificate = (certificateUrl, certificateName) => {
    window.open(certificateUrl, '_blank');
  };

  const getCarName = (carId) => {
    return `${carsMap[carId]?.brand || 'N/A'} ${carsMap[carId]?.model || 'N/A'}`;
  };

  const getClientName = (clientId) => {
    return clientsMap[clientId].fullName || {};
  };
  const getClientEmail = (clientId) => {
    return clientsMap[clientId].email || 'N/A';
  };
  const getClientPhone = (clientId) => {
    return clientsMap[clientId].phone || 'N/A';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('fr', {
      style: 'currency',
      currency: 'DZD'
    }).format(amount);
  };

  // Show loading while checking auth
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('welcome')}, {user.name || user.email}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('dashboardWelcome')}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('orders')}
              className={`${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {t('myOrders')}
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {t('clientInfo')}
            </button>
          </nav>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center shadow-lg">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <p className="text-gray-600 dark:text-gray-400">{t('noOrders')}</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {t('orderNumber')}: #{order._id.slice(-8)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {t(order.status || 'pending')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">{t('date')}:</span> {formatDate(order.createdAt)}
                        </div>
                        <div>
                          <span className="font-medium">{t('amount')}:</span> {formatAmount(order.paymentAmount)}
                        </div>
                        <div>
                          <span className="font-medium">{t('car')}:</span> {getCarName(order.selectedCarId)}
                        </div>
                      </div>

                      {/* Client Info */}
                      {order.clientId && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {getClientName(order.clientId)}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  📧 {getClientEmail(order.clientId)}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  📞 {getClientPhone(order.clientId)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tracking Code */}
                      <div className="mt-3">
                        {order.trackingCode ? (
                          <a
                            href={`https://www.searates.com/container/tracking/?container=${order.trackingCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                            {t('trackOrder')}: {order.trackingCode}
                          </a>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-500 text-sm">
                            {t('noTrackingCode')}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewCertificate(order)}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      {t('viewMore')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Client Info Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {clients.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center shadow-lg">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <p className="text-gray-600 dark:text-gray-400">{t('noClientInfo')}</p>
              </div>
            ) : (
              clients.map((client) => (
                <div
                  key={client._id}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {client.fullName || 'N/A'}
                      </h3>
                      {client.gender && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          client.gender === 'male' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          client.gender === 'female' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {client.gender}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                          {t('email')}
                        </label>
                        <p className="text-gray-900 dark:text-white">{client.email || 'N/A'}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                          {t('phone')}
                        </label>
                        <p className="text-gray-900 dark:text-white">{client.phone || 'N/A'}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                          {t('dateOfBirth')}
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {formatDate(client.dateOfBirth)}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                          {t('nationality')}
                        </label>
                        <p className="text-gray-900 dark:text-white">{client.nationality || 'N/A'}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                          {t('nationalIdNumber')}
                        </label>
                        <p className="text-gray-900 dark:text-white">{client.nationalId || 'N/A'}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                          {t('passportNumber')}
                        </label>
                        <p className="text-gray-900 dark:text-white">{client.passportNumber || 'N/A'}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                          {t('city')}
                        </label>
                        <p className="text-gray-900 dark:text-white">{client.city || 'N/A'}</p>
                      </div>

                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                          {t('address')}
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {client.streetAddress || ''}, {client.city || ''}, {client.country || ''} {client.zipCode || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Certificate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div 
            className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('orderCertificates')} - #{selectedOrder?._id.slice(-8)}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-auto">
              {loadingCertificates ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">{t('loadingCertificate')}</p>
                  </div>
                </div>
              ) : certificates?.length > 0 ? (
                <div className="space-y-4">
                  {certificates.map((cert, index) => (
                    <div 
                      key={cert._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {cert.clientName || `Certificate ${index + 1}`}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('generatedOn')}: {formatDate(cert.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadCertificate(cert.url, cert.clientName)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          {t('downloadCertificate')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400">{t('noCertificate')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
