'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';
import { useTheme } from 'next-themes';
import {
  generateCertificate,
  generateInvoice,
  downloadPDF,
  getPDFBlob
} from '../../../utils/pdfGenerator';

export default function PDFGeneratorModule() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('certificate');
  const [pdfTheme, setPdfTheme] = useState('light');
  const [pdfLanguage, setPdfLanguage] = useState('fr'); // FR as default
  const [showPreview, setShowPreview] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState([]);
  const [toast, setToast] = useState(null);
  
  // Data Loading States
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Selected Order State
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch Orders, Clients, and Cars
  const fetchData = useCallback(async () => {
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

      setOrders(ordersData.orders || []);
      setClients(clientsData || []);
      setCars(carsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast(t('errorLoadingData') || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    setMounted(true);
    // Set language to EN only (no AR support)
    setPdfLanguage(language === 'ar' ? 'en' : language);
    fetchData();
  }, [language, fetchData]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Get selected order with client and car details
  const getSelectedOrder = () => {
    const order = orders.find(o => o._id === selectedOrderId);
    if (!order) return null;

    const client = clients.find(c => c._id === order.clientId);
    const car = cars.find(c => c._id === order.selectedCarId);

    return { order, client, car };
  };

  // Upload PDF to Cloudinary
  const uploadToCloudinary = async (pdfBlob, filename) => {
    const formData = new FormData();
    formData.append('file', pdfBlob, filename);
    formData.append('folder', 'certificates');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload to Cloudinary');
    }

    const data = await response.json();
    return {
      url: data.url,
      publicId: data.public_id,
      resourceType: data.resource_type
    };
  };

  // Save document metadata to database
  const saveDocumentMetadata = async (documentData) => {
    const response = await fetch('/api/admin/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(documentData),
    });

    if (!response.ok) {
      throw new Error('Failed to save document metadata');
    }

    return await response.json();
  };

  const handleGeneratePDF = async (type) => {
    // Validation
    if (!selectedOrderId) {
      showToast(t('pleaseSelectOrder') || 'Please select an order', 'error');
      return;
    }

    if (type === 'invoice' && (!amountReceived || parseFloat(amountReceived) <= 0)) {
      showToast(t('pleaseEnterAmount') || 'Please enter a valid amount received', 'error');
      return;
    }

    setGenerating(true);

    try {
      let doc;
      let filename;
      let documentType;

      const orderData = getSelectedOrder();
      if (!orderData || !orderData.order || !orderData.client || !orderData.car) {
        throw new Error('Missing order, client, or car data');
      }

      switch (type) {
        case 'certificate': {
          const { order, client, car } = orderData;
          
          // Prepare certificate data
          const pdfData = {
            clientName: client.fullName,
            clientEmail: client.email,
            clientPhone: client.phone,
            clientId: client.nationalId || 'N/A',
            clientPassport: client.passportNumber || 'N/A',
            clientAddress: `${client.streetAddress || ''}, ${client.city || ''}, ${client.country || ''}`.trim(),
            carBrand: car.brand,
            carModel: car.model,
            carYear: car.year,
            carColor: order.selectedColor || 'N/A',
            carVin: car.vin || 'N/A',
            carPrice: `$${car.price?.toLocaleString('en-US')}`,
            paymentMethod: order.paymentMethod || 'N/A',
            amountPaid: `$${order.finalPrice?.toLocaleString('en-US')}`,
            trackingCode: order.trackingCode || 'N/A',
            registrationDate: new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
          };

          doc = await generateCertificate(pdfData, pdfLanguage, pdfTheme);
          filename = `inscription_certificate_${order._id}.pdf`;
          documentType = 'inscription';

          // Upload to Cloudinary
          const pdfBlob = getPDFBlob(doc);
          const cloudinaryData = await uploadToCloudinary(pdfBlob, filename);

          // Save metadata to database
          await saveDocumentMetadata({
            type: documentType,
            clientId: order.clientId,
            carId: order.selectedCarId,
            orderId: order._id,
            userId: order.userId,
            clientName: client.fullName,
            url: cloudinaryData.url,
            cloudinaryPublicId: cloudinaryData.publicId,
            cloudinaryResourceType: cloudinaryData.resourceType,
          });

          showToast(t('certificateGeneratedUploaded') || 'Inscription certificate generated and uploaded successfully!', 'success');
          break;
        }

        case 'invoice': {
          const { order, client, car } = orderData;
          const finalPrice = car.price || 0;
          const received = parseFloat(amountReceived);

          // Calculate credit (remaining balance)
          const credit = Math.max(0, finalPrice - received);

          // Prepare invoice data
          const pdfData = {
            clientName: client.fullName,
            clientEmail: client.email,
            clientPhone: client.phone,
            clientAddress: `${client.streetAddress || ''}, ${client.city || ''}, ${client.country || ''}`.trim(),
            carBrand: car.brand,
            carModel: car.model,
            carYear: car.year,
            carPrice: finalPrice,
            amountReceived: received,
            invoiceNumber: `INV-${order._id.slice(-8).toUpperCase()}`,
            invoiceDate: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            paymentStatus: received >= finalPrice ? 'paid' : 'pending',
            discount: 0,
          };

          doc = await generateInvoice(pdfData, pdfLanguage, pdfTheme);
          filename = `invoice_certificate_${order._id}.pdf`;
          documentType = 'invoice';

          // Upload to Cloudinary
          const pdfBlob = getPDFBlob(doc);
          const cloudinaryData = await uploadToCloudinary(pdfBlob, filename);

          // Save metadata to database
          await saveDocumentMetadata({
            type: documentType,
            clientId: order.clientId,
            carId: order.selectedCarId,
            orderId: order._id,
            userId: order.userId,
            clientName: client.fullName,
            url: cloudinaryData.url,
            cloudinaryPublicId: cloudinaryData.publicId,
            cloudinaryResourceType: cloudinaryData.resourceType,
          });

          // Update client credit
          await fetch('/api/admin/clients', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: order.clientId,
              credit: credit,
              lastPaymentDate: new Date(),
              lastPaymentAmount: received,
            }),
          });

          showToast(t('invoiceGeneratedUploaded') || 'Invoice certificate generated and uploaded successfully!', 'success');
          
          // Reset amount field
          setAmountReceived('');
          break;
        }

        default:
          return;
      }

      // Download PDF
      downloadPDF(doc, filename);

      // Save to generated docs list
      const newDoc = {
        id: Date.now(),
        type: documentType.charAt(0).toUpperCase() + documentType.slice(1),
        filename,
        clientName: orderData.client.fullName,
        generatedDate: new Date().toLocaleString(),
        language: pdfLanguage,
        theme: pdfTheme,
      };

      const updated = [newDoc, ...generatedDocs].slice(0, 20);
      setGeneratedDocs(updated);

    } catch (error) {
      console.error('PDF Generation Error:', error);
      showToast(`${t('error') || 'Error'}: ${error.message}`, 'error');
    } finally {
      setGenerating(false);
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
              {['en', 'fr'].map((lang) => (
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
          {['certificate', 'invoice'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {tab === t('certificate') && '📜 '}
              {tab === t('invoice') && '🧾 '}
              {t(tab) || (tab.charAt(0).toUpperCase() + tab.slice(1))}
            </button>
          ))}
        </div>

        {/* Certificate Form */}
        {activeTab === 'certificate' && (
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('certificateOfInscription') || 'Certificate of Inscription'}
            </h3>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Search Bar */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('searchClient') || 'Search Client'}
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('searchByClientName') || 'Search by client name...'}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('selectOrder') || 'Select Order'}
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t('selectAnOrder') || 'Select an order...'}</option>
                    {orders
                      .filter((order) => {
                        const client = clients.find(c => c._id === order.clientId);
                        return !searchTerm || client?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
                      })
                      .map((order) => {
                        const client = clients.find(c => c._id === order.clientId);
                        const car = cars.find(c => c._id === order.selectedCarId);
                        return (
                          <option key={order._id} value={order._id}>
                            {client?.fullName || 'Unknown'} - {car?.brand} {car?.model} - {order.createdAt.slice(0,10)}
                          </option>
                        );
                      })}
                  </select>
                </div>

                {selectedOrderId && (() => {
                  const orderData = getSelectedOrder();
                  if (!orderData) return null;
                  const { order, client, car } = orderData;
                  
                  return (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        {t('orderDetails') || 'Order Details'}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{t('client') || 'Client'}:</span>{' '}
                          <span className="text-gray-900 dark:text-white font-medium">{client.fullName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{t('email') || 'Email'}:</span>{' '}
                          <span className="text-gray-900 dark:text-white font-medium">{client.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{t('car') || 'Car'}:</span>{' '}
                          <span className="text-gray-900 dark:text-white font-medium">{car.brand} {car.model} ({car.year})</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{t('price') || 'Price'}:</span>{' '}
                          <span className="text-gray-900 dark:text-white font-medium">{car.price?.toLocaleString('en-US')} DZD</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{t('trackingCode') || 'Tracking'}:</span>{' '}
                          <span className="text-gray-900 dark:text-white font-medium">{order.trackingCode}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{t('date') || 'Date'}:</span>{' '}
                          <span className="text-gray-900 dark:text-white font-medium">
                            {new Date(order.createdAt).toLocaleDateString('en-US')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <button
                  onClick={() => handleGeneratePDF('certificate')}
                  disabled={!selectedOrderId || generating}
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('generating') || 'Generating...'}
                    </span>
                  ) : (
                    <>📄 {t('generateCertificate') || 'Generate Certificate'}</>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {/* Invoice Form */}
        {activeTab === 'invoice' && (
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('invoiceGeneration') || 'Invoice Generation'}
            </h3>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Search Bar */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('searchClient') || 'Search Client'}
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('searchByClientName') || 'Search by client name...'}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('selectOrder') || 'Select Order'} ({t('paidOrdersOnly') || 'Paid orders only'})
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t('selectAnOrder') || 'Select an order...'}</option>
                    {orders
                      .filter((order) => {
                        // Filter for paid orders only (paymentStatus === 'paid')
                        if (order.status !== 'paid') return false;
                        
                        // Filter by search term
                        const client = clients.find(c => c._id === order.clientId);
                        return !searchTerm || client?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
                      })
                      .map((order) => {
                        const client = clients.find(c => c._id === order.clientId);
                        const car = cars.find(c => c._id === order.selectedCarId);
                        return (
                          <option key={order._id} value={order._id}>
                            {client?.fullName || 'Unknown'} - {car?.brand} {car?.model} - {order.createdAt.slice(0,10)}
                          </option>
                        );
                      })}
                  </select>
                </div>

                {selectedOrderId && (() => {
                  const orderData = getSelectedOrder();
                  if (!orderData) return null;
                  const { order, client, car } = orderData;
                  const finalPrice = car.price || 0;
                  const received = parseFloat(amountReceived) || 0;
                  
                  return (
                    <>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          {t('orderDetails') || 'Order Details'}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">{t('client') || 'Client'}:</span>{' '}
                            <span className="text-gray-900 dark:text-white font-medium">{client.fullName}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">{t('email') || 'Email'}:</span>{' '}
                            <span className="text-gray-900 dark:text-white font-medium">{client.email}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">{t('car') || 'Car'}:</span>{' '}
                            <span className="text-gray-900 dark:text-white font-medium">{car.brand} {car.model} ({car.year})</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">{t('finalPrice') || 'Final Price'}:</span>{' '}
                            <span className="text-gray-900 dark:text-white font-medium">{finalPrice.toLocaleString('en-US')} DZD</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('amountReceived') || 'Amount Received (DZD)'}
                        </label>
                        <input
                          type="number"
                          value={amountReceived}
                          onChange={(e) => setAmountReceived(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        {received > 0 && (
                          <p className="mt-2 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{t('paymentStatus') || 'Status'}:</span>{' '}
                            <span className={`font-medium ${received >= finalPrice ? 'text-green-600' : 'text-yellow-600'}`}>
                              {received.toLocaleString('en-US')} DZD / {finalPrice.toLocaleString('en-US')} DZD
                              {received >= finalPrice ? ' ✓ ' + (t('paid') || 'Paid') : ' ⏳ ' + (t('pending') || 'Pending')}
                            </span>
                          </p>
                        )}
                      </div>
                    </>
                  );
                })()}

                <button
                  onClick={() => handleGeneratePDF('invoice')}
                  disabled={!selectedOrderId || !amountReceived || generating}
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('generating') || 'Generating...'}
                    </span>
                  ) : (
                    <>🧾 {t('generateInvoice') || 'Generate Invoice'}</>
                  )}
                </button>
              </>
            )}
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

      {/* Generating Spinner Overlay */}
      {generating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">
                {t('generatingDocument') || 'Generating document...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
