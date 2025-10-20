'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';
import { useTheme } from 'next-themes';
import {
  generateCertificate,
  generateInvoice,
  generateTrackingDocument,
  downloadPDF,
  getPDFBlob
} from '../../../utils/pdfGenerator';

export default function PDFGeneratorModule() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('certificate');
  const [pdfTheme, setPdfTheme] = useState('light');
  const [pdfLanguage, setPdfLanguage] = useState('en');
  const [showPreview, setShowPreview] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState([]);
  const [toast, setToast] = useState(null);
  
  // Form Data States
  const [certificateData, setCertificateData] = useState({
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
    registrationDate: new Date().toLocaleDateString(),
  });

  const [invoiceData, setInvoiceData] = useState({
    clientName: 'Sarah Johnson',
    clientEmail: 'sarah.j@example.com',
    clientPhone: '+1 555 123 4567',
    clientAddress: '789 Luxury Ave, New York, USA',
    carBrand: 'BMW',
    carModel: 'M4 Competition',
    carYear: '2024',
    carPrice: '$95,000',
    paymentStatus: 'paid',
    discount: '5000',
    invoiceNumber: `INV-${Date.now().toString().slice(-8)}`,
    invoiceDate: new Date().toLocaleDateString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  });

  const [trackingData, setTrackingData] = useState({
    trackingCode: 'TRK-20241019-XYZ789',
    clientName: 'Mohamed Benchrif',
    carBrand: 'Tesla',
    carModel: 'Model S',
    currentLocation: 'Regional Distribution Center - Casablanca',
    estimatedDelivery: '2024-10-22',
    progressPercent: 65,
    stations: [
      { name: 'Origin - Factory Stuttgart', status: 'completed', timestamp: '2024-10-15 09:00' },
      { name: 'Port of Tangier', status: 'completed', timestamp: '2024-10-16 14:30' },
      { name: 'Regional Center Casablanca', status: 'inProgress', timestamp: '2024-10-18 10:00' },
      { name: 'Final Delivery - Rabat', status: 'pending', timestamp: 'Pending' },
    ],
  });

  useEffect(() => {
    setMounted(true);
    setPdfLanguage(language);
    // Load saved documents from localStorage
    const saved = localStorage.getItem('generatedPDFs');
    if (saved) {
      setGeneratedDocs(JSON.parse(saved));
    }
  }, [language]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleGeneratePDF = (type) => {
    try {
      let doc;
      let filename;
      let data;

      switch (type) {
        case 'certificate':
          doc = generateCertificate(certificateData, pdfLanguage, pdfTheme);
          filename = `Certificate_${certificateData.clientName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
          data = certificateData;
          break;
        case 'invoice':
          doc = generateInvoice(invoiceData, pdfLanguage, pdfTheme);
          filename = `Invoice_${invoiceData.invoiceNumber}_${Date.now()}.pdf`;
          data = invoiceData;
          break;
        case 'tracking':
          doc = generateTrackingDocument(trackingData, pdfLanguage, pdfTheme);
          filename = `Tracking_${trackingData.trackingCode}_${Date.now()}.pdf`;
          data = trackingData;
          break;
        default:
          return;
      }

      // Download PDF
      downloadPDF(doc, filename);

      // Save to generated docs list
      const newDoc = {
        id: Date.now(),
        type: type.charAt(0).toUpperCase() + type.slice(1),
        filename,
        clientName: data.clientName,
        generatedDate: new Date().toLocaleString(),
        language: pdfLanguage,
        theme: pdfTheme,
      };

      const updated = [newDoc, ...generatedDocs].slice(0, 20); // Keep last 20
      setGeneratedDocs(updated);
      localStorage.setItem('generatedPDFs', JSON.stringify(updated));

      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} PDF ${t('generated') || 'generated'} successfully!`, 'success');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      showToast(t('error') || 'Error generating PDF', 'error');
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-6 lg:p-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('pdfGenerator') || 'PDF Documents Generator'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('pdfGeneratorDescription') || 'Generate professional PDF documents for certificates, invoices, and tracking'}
        </p>
      </div>

      {/* Global Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {t('pdfSettings') || 'PDF Settings'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('pdfLanguage') || 'PDF Language'}
            </label>
            <div className="flex gap-2">
              {['en', 'fr', 'ar'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setPdfLanguage(lang)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    pdfLanguage === lang
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('pdfTheme') || 'PDF Theme'}
            </label>
            <div className="flex gap-2">
              {['light', 'dark'].map((themeOption) => (
                <button
                  key={themeOption}
                  onClick={() => setPdfTheme(themeOption)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    pdfTheme === themeOption
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {themeOption === 'light' ? '☀️ Light' : '🌙 Dark'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Document Type Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {['certificate', 'invoice', 'tracking'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {tab === 'certificate' && '📜 '}
              {tab === 'invoice' && '🧾 '}
              {tab === 'tracking' && '📦 '}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Certificate Form */}
        {activeTab === 'certificate' && (
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('certificateOfInscription') || 'Certificate of Inscription'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('clientName') || 'Client Name'}
                </label>
                <input
                  type="text"
                  value={certificateData.clientName}
                  onChange={(e) => setCertificateData({...certificateData, clientName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('email') || 'Email'}
                </label>
                <input
                  type="email"
                  value={certificateData.clientEmail}
                  onChange={(e) => setCertificateData({...certificateData, clientEmail: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('phone') || 'Phone'}
                </label>
                <input
                  type="text"
                  value={certificateData.clientPhone}
                  onChange={(e) => setCertificateData({...certificateData, clientPhone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('idPassport') || 'ID/Passport'}
                </label>
                <input
                  type="text"
                  value={certificateData.clientId}
                  onChange={(e) => setCertificateData({...certificateData, clientId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('address') || 'Address'}
                </label>
                <input
                  type="text"
                  value={certificateData.clientAddress}
                  onChange={(e) => setCertificateData({...certificateData, clientAddress: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('carBrand') || 'Car Brand'}
                </label>
                <input
                  type="text"
                  value={certificateData.carBrand}
                  onChange={(e) => setCertificateData({...certificateData, carBrand: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('carModel') || 'Car Model'}
                </label>
                <input
                  type="text"
                  value={certificateData.carModel}
                  onChange={(e) => setCertificateData({...certificateData, carModel: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('year') || 'Year'}
                </label>
                <input
                  type="text"
                  value={certificateData.carYear}
                  onChange={(e) => setCertificateData({...certificateData, carYear: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('price') || 'Price'}
                </label>
                <input
                  type="text"
                  value={certificateData.carPrice}
                  onChange={(e) => setCertificateData({...certificateData, carPrice: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('trackingCode') || 'Tracking Code'}
                </label>
                <input
                  type="text"
                  value={certificateData.trackingCode}
                  onChange={(e) => setCertificateData({...certificateData, trackingCode: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('paymentMethod') || 'Payment Method'}
                </label>
                <select
                  value={certificateData.paymentMethod}
                  onChange={(e) => setCertificateData({...certificateData, paymentMethod: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>Credit Card</option>
                  <option>PayPal</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => handleGeneratePDF('certificate')}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              📜 {t('generateCertificate') || 'Generate Certificate'}
            </button>
          </div>
        )}

        {/* Invoice Form */}
        {activeTab === 'invoice' && (
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('invoiceGeneration') || 'Invoice Generation'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('invoiceNumber') || 'Invoice Number'}
                </label>
                <input
                  type="text"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('paymentStatus') || 'Payment Status'}
                </label>
                <select
                  value={invoiceData.paymentStatus}
                  onChange={(e) => setInvoiceData({...invoiceData, paymentStatus: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('clientName') || 'Client Name'}
                </label>
                <input
                  type="text"
                  value={invoiceData.clientName}
                  onChange={(e) => setInvoiceData({...invoiceData, clientName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('email') || 'Email'}
                </label>
                <input
                  type="email"
                  value={invoiceData.clientEmail}
                  onChange={(e) => setInvoiceData({...invoiceData, clientEmail: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('carBrand') || 'Car Brand'}
                </label>
                <input
                  type="text"
                  value={invoiceData.carBrand}
                  onChange={(e) => setInvoiceData({...invoiceData, carBrand: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('carModel') || 'Car Model'}
                </label>
                <input
                  type="text"
                  value={invoiceData.carModel}
                  onChange={(e) => setInvoiceData({...invoiceData, carModel: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('price') || 'Price'}
                </label>
                <input
                  type="text"
                  value={invoiceData.carPrice}
                  onChange={(e) => setInvoiceData({...invoiceData, carPrice: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('discount') || 'Discount'}
                </label>
                <input
                  type="text"
                  value={invoiceData.discount}
                  onChange={(e) => setInvoiceData({...invoiceData, discount: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={() => handleGeneratePDF('invoice')}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              🧾 {t('generateInvoice') || 'Generate Invoice'}
            </button>
          </div>
        )}

        {/* Tracking Form */}
        {activeTab === 'tracking' && (
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('trackingDocument') || 'Tracking Document'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('trackingCode') || 'Tracking Code'}
                </label>
                <input
                  type="text"
                  value={trackingData.trackingCode}
                  onChange={(e) => setTrackingData({...trackingData, trackingCode: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('clientName') || 'Client Name'}
                </label>
                <input
                  type="text"
                  value={trackingData.clientName}
                  onChange={(e) => setTrackingData({...trackingData, clientName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('carBrand') || 'Car Brand'}
                </label>
                <input
                  type="text"
                  value={trackingData.carBrand}
                  onChange={(e) => setTrackingData({...trackingData, carBrand: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('carModel') || 'Car Model'}
                </label>
                <input
                  type="text"
                  value={trackingData.carModel}
                  onChange={(e) => setTrackingData({...trackingData, carModel: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('currentLocation') || 'Current Location'}
                </label>
                <input
                  type="text"
                  value={trackingData.currentLocation}
                  onChange={(e) => setTrackingData({...trackingData, currentLocation: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('estimatedDelivery') || 'Estimated Delivery'}
                </label>
                <input
                  type="date"
                  value={trackingData.estimatedDelivery}
                  onChange={(e) => setTrackingData({...trackingData, estimatedDelivery: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('progress') || 'Progress'} ({trackingData.progressPercent}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={trackingData.progressPercent}
                  onChange={(e) => setTrackingData({...trackingData, progressPercent: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>
            </div>

            <button
              onClick={() => handleGeneratePDF('tracking')}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              📦 {t('generateTracking') || 'Generate Tracking Document'}
            </button>
          </div>
        )}
      </div>

      {/* Generated Documents History */}
      {generatedDocs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('generatedDocuments') || 'Generated Documents'}
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('type') || 'Type'}</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('client') || 'Client'}</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('filename') || 'Filename'}</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('language') || 'Language'}</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('theme') || 'Theme'}</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('date') || 'Date'}</th>
                </tr>
              </thead>
              <tbody>
                {generatedDocs.map((doc) => (
                  <tr key={doc.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        {doc.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 dark:text-white font-medium">{doc.clientName}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 font-mono text-xs">{doc.filename}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{doc.language.toUpperCase()}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                      {doc.theme === 'light' ? '☀️' : '🌙'} {doc.theme}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{doc.generatedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
