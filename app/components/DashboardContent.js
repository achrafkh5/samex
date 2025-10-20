'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';
import Link from 'next/link';
import Image from 'next/image';
import ProgressStepper from './ProgressStepper';
import DocumentCard from './DocumentCard';

export default function DashboardContent() {
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    // Mock API call - replace with actual API in production
    const fetchDashboardData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setDashboardData({
        client: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          trackingCode: 'DC6T5K2H9P'
        },
        order: {
          id: 'ORD-2024-001',
          date: '2024-10-15',
          status: 'inTransit',
          car: {
            brand: 'Mercedes-Benz',
            model: 'C-Class',
            year: 2024,
            price: 45000,
            image: '/cars/mercedes-c-class.jpg'
          },
          payment: {
            status: 'paid',
            totalAmount: 45000,
            amountPaid: 45000,
            remainingBalance: 0,
            method: 'Bank Transfer'
          },
          delivery: {
            estimatedDate: '2024-10-25',
            currentLocation: 'Distribution Center - New York',
            lastUpdate: '2024-10-19 10:30 AM'
          }
        },
        documents: [
          {
            id: 1,
            name: 'certificateOfInscription',
            type: 'certificate',
            status: 'available',
            size: '2.4 MB',
            date: '2024-10-15',
            url: '/documents/certificate.pdf'
          },
          {
            id: 2,
            name: 'invoice',
            type: 'invoice',
            status: 'available',
            size: '1.8 MB',
            date: '2024-10-15',
            url: '/documents/invoice.pdf'
          },
          {
            id: 3,
            name: 'trackingDocument',
            type: 'tracking',
            status: 'available',
            size: '3.2 MB',
            date: '2024-10-19',
            url: '/documents/tracking.pdf'
          }
        ],
        notifications: [
          {
            id: 1,
            title: 'Order Status Updated',
            message: 'Your vehicle is now in transit and will arrive soon.',
            date: '2024-10-19',
            time: '10:30 AM',
            read: false
          },
          {
            id: 2,
            title: 'Documents Ready',
            message: 'All your documents are now available for download.',
            date: '2024-10-18',
            time: '3:45 PM',
            read: false
          },
          {
            id: 3,
            title: 'Payment Confirmed',
            message: 'Your payment has been successfully processed.',
            date: '2024-10-15',
            time: '2:15 PM',
            read: true
          }
        ]
      });
      
      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'processing':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'inTransit':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 dark:text-green-400';
      case 'unpaid':
        return 'text-red-600 dark:text-red-400';
      case 'partiallyPaid':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('processing')}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Header */}
      <section className="relative pt-32 pb-12 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center mb-6 text-sm">
            <Link href="/" className="text-blue-100 hover:text-white transition-colors">
              {t('home')}
            </Link>
            <svg className="w-4 h-4 mx-2 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-white font-medium">{t('myDashboard')}</span>
          </nav>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {t('myDashboard')}
              </h1>
              <p className="text-xl text-blue-100">
                {t('welcomeBack')}, <span className="font-semibold">{dashboardData.client.name}</span>!
              </p>
            </div>

            {/* Tracking Code Card */}
            <Link href={`/tracking/${dashboardData.client.trackingCode}`}>
              <div className="mt-6 md:mt-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 hover:bg-white/20 transition-all cursor-pointer group">
                <p className="text-sm text-blue-100 mb-1">{t('trackingCode')}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-white font-mono">
                    {dashboardData.client.trackingCode}
                  </p>
                  <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Summary & Tracking */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Summary Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('orderSummary')}
                  </h2>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(dashboardData.order.status)}`}>
                    {t(dashboardData.order.status)}
                  </span>
                </div>

                {/* Car Details */}
                <div className="flex flex-col sm:flex-row gap-6 mb-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  {/* Car Image Placeholder */}
                  <div className="w-full sm:w-48 h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                  </div>

                  {/* Car Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {dashboardData.order.car.brand} {dashboardData.order.car.model}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('year')}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{dashboardData.order.car.year}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('price')}</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          ${dashboardData.order.car.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
                        Order #{dashboardData.order.id}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold">
                        {dashboardData.order.date}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Payment Status */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('paymentStatus')}</p>
                    <p className={`text-lg font-bold ${getPaymentStatusColor(dashboardData.order.payment.status)}`}>
                      {t(dashboardData.order.payment.status)}
                    </p>
                  </div>

                  {/* Estimated Delivery */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('estimatedDelivery')}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {dashboardData.order.delivery.estimatedDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tracking Progress Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('trackingProgress')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t('trackYourOrder')}
                </p>

                <ProgressStepper currentStatus={dashboardData.order.status} />

                {/* Current Location */}
                <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        {t('currentLocation')}
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {dashboardData.order.delivery.currentLocation}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('lastUpdate')}: {dashboardData.order.delivery.lastUpdate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Documents & Notifications */}
            <div className="space-y-8">
              {/* Documents Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {t('documents')}
                </h2>

                <div className="space-y-4">
                  {dashboardData.documents.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </div>
              </div>

              {/* Notifications Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('notifications')}
                  </h2>
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-bold">
                    {dashboardData.notifications.filter(n => !n.read).length}
                  </span>
                </div>

                <div className="space-y-4">
                  {dashboardData.notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                        notification.read
                          ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {notification.date} • {notification.time}
                      </p>
                    </div>
                  ))}
                </div>

                {dashboardData.notifications.length === 0 && (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">{t('noNotifications')}</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
                <h3 className="text-xl font-bold mb-4">Need Help?</h3>
                <p className="text-blue-100 mb-4">
                  Contact our support team if you have any questions about your order.
                </p>
                <Link href="/contact">
                  <button className="w-full px-4 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all">
                    {t('contactUs')}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
