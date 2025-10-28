'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageProvider';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import {
  generateCertificate,
  generateInvoice,
  downloadPDF
} from '../utils/pdfGenerator';

export default function DocumentsContent() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [clientData, setClientData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sample client data (would come from API in production)
  const sampleClientData = {
    'TRK-20241019-ABC123': {
      clientName: 'Ahmed Al-Rashid',
      clientEmail: 'ahmed.rashid@example.com',
      clientPhone: '+212 6 XX XX XX XX',
      clientId: 'MA123456789',
      clientAddress: '456 Palm Street, Rabat, Morocco',
      carBrand: 'Mercedes-Benz',
      carModel: 'S-Class',
      carYear: '2024',
      carColor: 'Black',
      carVin: 'WDDUG8CB7KA123456',
      carPrice: '$125,000',
      paymentMethod: 'Bank Transfer',
      amountPaid: '$125,000',
      trackingCode: 'TRK-20241019-ABC123',
      registrationDate: '2024-10-15',
      invoiceNumber: 'INV-20241015',
      invoiceDate: '2024-10-15',
      dueDate: '2024-11-15',
      paymentStatus: 'paid',
      discount: '0',
      currentLocation: 'Regional Distribution Center - Casablanca',
      estimatedDelivery: '2024-10-22',
      progressPercent: 65,
      stations: [
        { name: 'Origin - Factory Stuttgart', status: 'completed', timestamp: '2024-10-15 09:00' },
        { name: 'Port of Tangier', status: 'completed', timestamp: '2024-10-16 14:30' },
        { name: 'Regional Center Casablanca', status: 'inProgress', timestamp: '2024-10-18 10:00' },
        { name: 'Final Delivery - Rabat', status: 'pending', timestamp: 'Pending' },
      ],
    },
    'TRK-20241019-XYZ789': {
      clientName: 'Sarah Johnson',
      clientEmail: 'sarah.j@example.com',
      clientPhone: '+1 555 123 4567',
      clientId: 'US987654321',
      clientAddress: '789 Luxury Ave, New York, USA',
      carBrand: 'BMW',
      carModel: 'M4 Competition',
      carYear: '2024',
      carColor: 'Blue',
      carVin: 'WBS3T9C57KP123456',
      carPrice: '$95,000',
      paymentMethod: 'Credit Card',
      amountPaid: '$95,000',
      trackingCode: 'TRK-20241019-XYZ789',
      registrationDate: '2024-10-16',
      invoiceNumber: 'INV-20241016',
      invoiceDate: '2024-10-16',
      dueDate: '2024-11-16',
      paymentStatus: 'paid',
      discount: '5000',
      currentLocation: 'Final Destination - Delivery Hub',
      estimatedDelivery: '2024-10-20',
      progressPercent: 90,
      stations: [
        { name: 'Origin - BMW Factory Munich', status: 'completed', timestamp: '2024-10-16 08:00' },
        { name: 'Transit Hub Frankfurt', status: 'completed', timestamp: '2024-10-17 12:00' },
        { name: 'Port of Hamburg', status: 'completed', timestamp: '2024-10-18 16:00' },
        { name: 'Final Delivery - New York', status: 'inProgress', timestamp: '2024-10-19 10:00' },
      ],
    }
  };

  const handleLookup = () => {
    setError('');
    setClientData(null);
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const data = sampleClientData[trackingCode.toUpperCase()];
      if (data) {
        setClientData(data);
      } else {
        setError(t('trackingNotFound') || 'Tracking code not found. Please check and try again.');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleDownload = async (type) => {
    if (!clientData) return;

    try {
      let doc;
      let filename;

      switch (type) {
        case 'certificate':
          doc = await generateCertificate(clientData, language, theme || 'light');
          filename = `Certificate_${clientData.clientName.replace(/\s+/g, '_')}.pdf`;
          break;
        case 'invoice':
          doc = await generateInvoice(clientData, language, theme || 'light');
          filename = `Invoice_${clientData.invoiceNumber}.pdf`;
          break;
        case 'tracking':
          // TODO: Implement tracking document generator
          setError(t('trackingNotImplemented') || 'Tracking document generation is not yet implemented');
          return;
        default:
          return;
      }

      downloadPDF(doc, filename);
    } catch (error) {
      console.error('Download error:', error);
      setError(t('downloadError') || 'Error downloading document');
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('myDocuments') || 'My Documents'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('documentsSubtitle') || 'Access and download your vehicle documents'}
          </p>
        </div>

        {/* Lookup Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('accessDocuments') || 'Access Your Documents'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('enterTrackingCode') || 'Enter your tracking code to view and download your documents'}
          </p>

          <div className="flex gap-4">
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder={t('trackingCodePlaceholder') || 'e.g., TRK-20241019-ABC123'}
              className="flex-1 px-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors"
              onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
            />
            <button
              onClick={handleLookup}
              disabled={isLoading || !trackingCode}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
              ) : (
                t('lookup') || 'Lookup'
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Sample Codes */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-400 font-medium mb-2">
              {t('sampleCodes') || 'Sample Tracking Codes (for demo):'}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTrackingCode('TRK-20241019-ABC123')}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-md text-sm font-mono hover:bg-blue-200 dark:hover:bg-blue-700"
              >
                TRK-20241019-ABC123
              </button>
              <button
                onClick={() => setTrackingCode('TRK-20241019-XYZ789')}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-md text-sm font-mono hover:bg-blue-200 dark:hover:bg-blue-700"
              >
                TRK-20241019-XYZ789
              </button>
            </div>
          </div>
        </div>

        {/* Documents Display */}
        {clientData && (
          <div className="space-y-6">
            {/* Client Info Card */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">{t('welcome') || 'Welcome'}, {clientData.clientName}!</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-blue-100 text-sm">{t('vehicle') || 'Vehicle'}</p>
                  <p className="text-xl font-bold">{clientData.carBrand} {clientData.carModel}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">{t('trackingCode') || 'Tracking Code'}</p>
                  <p className="text-xl font-bold font-mono">{clientData.trackingCode}</p>
                </div>
              </div>
            </div>

            {/* Available Documents */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('availableDocuments') || 'Available Documents'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Certificate */}
                <div className="border-2 border-green-200 dark:border-green-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {t('certificateOfInscription') || 'Certificate of Inscription'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t('certificateDesc') || 'Official registration certificate'}
                  </p>
                  <button
                    onClick={() => handleDownload('certificate')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    📄 {t('download') || 'Download'}
                  </button>
                </div>

                {/* Invoice */}
                <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {t('invoice') || 'Invoice'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t('invoiceDesc') || 'Purchase invoice and receipt'}
                  </p>
                  <button
                    onClick={() => handleDownload('invoice')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    🧾 {t('download') || 'Download'}
                  </button>
                </div>

                {/* Tracking */}
                <div className="border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {t('trackingDocument') || 'Tracking Document'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t('trackingDesc') || 'Delivery itinerary and progress'}
                  </p>
                  <button
                    onClick={() => handleDownload('tracking')}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    📦 {t('download') || 'Download'}
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                  {t('documentInfo') || 'Document Information'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">{t('registrationDate') || 'Registration Date'}:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{clientData.registrationDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">{t('paymentMethod') || 'Payment Method'}:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{clientData.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">{t('vehicleVIN') || 'Vehicle VIN'}:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white font-mono text-xs">{clientData.carVin}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">{t('deliveryStatus') || 'Delivery Status'}:</span>
                    <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">{clientData.progressPercent}% {t('complete') || 'Complete'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                    {t('needHelp') || 'Need Help?'}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {t('documentHelpText') || 'If you have any questions about your documents or need assistance, please contact our support team.'}
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    {t('contactSupport') || 'Contact Support'}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('backToHome') || 'Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}
