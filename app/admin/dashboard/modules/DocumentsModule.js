'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';
import { generateInvoice, generateCertificate, generateTrackingDocument, getPDFBlob } from '../../../utils/pdfGenerator';

export default function DocumentsModule() {
  const { t } = useLanguage();
  
  const [documents, setDocuments] = useState([]);
  const [clients, setClients] = useState([]);
  const [cars, setCars] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const [invoiceData, setInvoiceData] = useState({ clientId: '', carId: '', orderId: '' });
  const [certificateData, setCertificateData] = useState({ clientId: '', carId: '', orderId: '' });
  const [reportData, setReportData] = useState({ clientId: '', carId: '', orderId: '', trackingCode: '' });

  useEffect(() => {
    fetchDocuments();
    fetchClients();
    fetchCars();
    fetchOrders();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars');
      if (response.ok) {
        const data = await response.json();
        setCars(data);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const uploadToCloudinary = async (pdfBlob, fileName, folder) => {
    const formData = new FormData();
    formData.append('file', pdfBlob, fileName);
    formData.append('folder', `documents/${folder}`);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Upload error:', errorData);
      throw new Error(`Upload failed: ${errorData.message || response.statusText}`);
    }
    
    const result = await response.json();
    return { secure_url: result.url };
  };

  const saveDocumentToDatabase = async (documentData) => {
    const response = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(documentData),
    });

    if (!response.ok) throw new Error('Failed to save document');
    return await response.json();
  };

  const handleDeleteDocument = async (id) => {
    if (!confirm(t('confirmDelete') || 'Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchDocuments();
        alert(t('documentDeleted') || 'Document deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert(t('deleteFailed') || 'Failed to delete document');
    }
  };

  const handleGenerateInvoice = async () => {
    if (!invoiceData.clientId || !invoiceData.carId || !invoiceData.orderId) {
      alert(t('pleaseFillAllFields') || 'Please fill all fields');
      return;
    }

    setGenerating(true);
    try {
      const client = clients.find(c => c._id === invoiceData.clientId);
      const car = cars.find(c => c._id === invoiceData.carId);
      const order = orders.find(o => o._id === invoiceData.orderId);

      const pdfDoc = await generateInvoice({
        orderId: order._id,
        clientName: client.fullName,
        clientEmail: client.email,
        clientPhone: client.phone,
        carModel: car.model,
        carPrice: car.price,
        orderDate: order.createdAt,
        totalAmount: order.totalAmount,
      });

      const pdfBlob = getPDFBlob(pdfDoc);

      const cloudinaryResult = await uploadToCloudinary(
        pdfBlob,
        `invoice_${order._id}_${Date.now()}.pdf`,
        'invoices'
      );

      await saveDocumentToDatabase({
        type: 'invoice',
        clientId: client._id,
        carId: car._id,
        orderId: order._id,
        clientName: client.fullName,
        carModel: car.model,
        url: cloudinaryResult.secure_url,
        status: 'generated',
      });

      await fetchDocuments();
      setShowInvoiceModal(false);
      setInvoiceData({ clientId: '', carId: '', orderId: '' });
      alert(t('documentGeneratedSuccess') || 'Invoice generated successfully!');
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert(t('documentGenerationFailed') || 'Failed to generate invoice');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateCertificate = async () => {
    if (!certificateData.clientId || !certificateData.carId || !certificateData.orderId) {
      alert(t('pleaseFillAllFields') || 'Please fill all fields');
      return;
    }

    setGenerating(true);
    try {
      const client = clients.find(c => c._id === certificateData.clientId);
      const car = cars.find(c => c._id === certificateData.carId);
      const order = orders.find(o => o._id === certificateData.orderId);

      const pdfDoc = await generateCertificate({
        certificateNumber: `CERT-${Date.now()}`,
        clientName: client.fullName,
        carModel: car.model,
        carYear: car.year,
        vin: car.vin || 'N/A',
        issueDate: new Date().toISOString(),
      });

      const pdfBlob = getPDFBlob(pdfDoc);

      const cloudinaryResult = await uploadToCloudinary(
        pdfBlob,
        `certificate_${order._id}_${Date.now()}.pdf`,
        'certificates'
      );

      await saveDocumentToDatabase({
        type: 'certificate',
        clientId: client._id,
        carId: car._id,
        orderId: order._id,
        clientName: client.fullName,
        carModel: car.model,
        url: cloudinaryResult.secure_url,
        status: 'generated',
      });

      await fetchDocuments();
      setShowCertificateModal(false);
      setCertificateData({ clientId: '', carId: '', orderId: '' });
      alert(t('documentGeneratedSuccess') || 'Certificate generated successfully!');
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert(t('documentGenerationFailed') || 'Failed to generate certificate');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!reportData.clientId || !reportData.carId || !reportData.orderId || !reportData.trackingCode) {
      alert(t('pleaseFillAllFields') || 'Please fill all fields');
      return;
    }

    setGenerating(true);
    try {
      const client = clients.find(c => c._id === reportData.clientId);
      const car = cars.find(c => c._id === reportData.carId);
      const order = orders.find(o => o._id === reportData.orderId);

      const pdfDoc = await generateTrackingDocument({
        trackingNumber: reportData.trackingCode,
        clientName: client.fullName,
        carModel: car.model,
        origin: order.origin || 'Korea',
        destination: order.destination || 'Algeria',
        status: order.status,
        estimatedArrival: order.estimatedArrival,
      });

      const pdfBlob = getPDFBlob(pdfDoc);

      const cloudinaryResult = await uploadToCloudinary(
        pdfBlob,
        `report_${order._id}_${Date.now()}.pdf`,
        'reports'
      );

      await saveDocumentToDatabase({
        type: 'report',
        clientId: client._id,
        carId: car._id,
        orderId: order._id,
        clientName: client.fullName,
        carModel: car.model,
        url: cloudinaryResult.secure_url,
        status: 'generated',
      });

      await fetchDocuments();
      setShowReportModal(false);
      setReportData({ clientId: '', carId: '', orderId: '', trackingCode: '' });
      alert(t('documentGeneratedSuccess') || 'Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert(t('documentGenerationFailed') || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('documentsManagement') || 'Documents Management'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('documentsDescription') || 'Generate and manage PDF documents'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => setShowInvoiceModal(true)}
          className="bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-600 rounded-xl p-6 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <svg className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('generateInvoice') || 'Generate Invoice'}</h3>
        </button>
        
        <button
          onClick={() => setShowCertificateModal(true)}
          className="bg-white dark:bg-gray-800 border-2 border-green-500 dark:border-green-600 rounded-xl p-6 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
        >
          <svg className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('generateCertificate') || 'Generate Certificate'}</h3>
        </button>
        
        <button
          onClick={() => setShowReportModal(true)}
          className="bg-white dark:bg-gray-800 border-2 border-purple-500 dark:border-purple-600 rounded-xl p-6 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
        >
          <svg className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('generateReport') || 'Generate Report'}</h3>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-gray-500 dark:text-gray-400">{t('noDocumentsFound') || 'No documents yet'}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('type') || 'Type'}</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('client') || 'Client'}</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('car') || 'Car'}</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('date') || 'Date'}</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('status') || 'Status'}</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc._id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        doc.type === 'invoice' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : doc.type === 'certificate'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                      }`}>
                        {doc.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{doc.clientName}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{doc.carModel}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        doc.status === 'generated'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 text-sm font-medium"
                        >
                          {t('download') || 'Download'}
                        </a>
                        <button
                          onClick={() => handleDeleteDocument(doc._id)}
                          className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-sm font-medium"
                        >
                          {t('delete') || 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('generateInvoice') || 'Generate Invoice'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('selectClient') || 'Select Client'}
                </label>
                <select
                  value={invoiceData.clientId}
                  onChange={(e) => setInvoiceData({ ...invoiceData, clientId: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="">{t('selectClient') || 'Select Client'}</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>{client.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('selectCar') || 'Select Car'}
                </label>
                <select
                  value={invoiceData.carId}
                  onChange={(e) => setInvoiceData({ ...invoiceData, carId: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="">{t('selectCar') || 'Select Car'}</option>
                  {cars.map((car) => (
                    <option key={car._id} value={car._id}>{car.model}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('selectOrder') || 'Select Order'}
                </label>
                <select
                  value={invoiceData.orderId}
                  onChange={(e) => setInvoiceData({ ...invoiceData, orderId: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="">{t('selectOrder') || 'Select Order'}</option>
                  {orders.map((order) => (
                    <option key={order._id} value={order._id}>Order #{order._id.slice(-6)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleGenerateInvoice}
                disabled={generating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (t('generatingPDF') || 'Generating...') : (t('generate') || 'Generate')}
              </button>
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setInvoiceData({ clientId: '', carId: '', orderId: '' });
                }}
                disabled={generating}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {t('cancel') || 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('generateCertificate') || 'Generate Certificate'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('selectClient') || 'Select Client'}
                </label>
                <select
                  value={certificateData.clientId}
                  onChange={(e) => setCertificateData({ ...certificateData, clientId: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="">{t('selectClient') || 'Select Client'}</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>{client.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('selectCar') || 'Select Car'}
                </label>
                <select
                  value={certificateData.carId}
                  onChange={(e) => setCertificateData({ ...certificateData, carId: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="">{t('selectCar') || 'Select Car'}</option>
                  {cars.map((car) => (
                    <option key={car._id} value={car._id}>{car.model}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('selectOrder') || 'Select Order'}
                </label>
                <select
                  value={certificateData.orderId}
                  onChange={(e) => setCertificateData({ ...certificateData, orderId: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="">{t('selectOrder') || 'Select Order'}</option>
                  {orders.map((order) => (
                    <option key={order._id} value={order._id}>Order #{order._id.slice(-6)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleGenerateCertificate}
                disabled={generating}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (t('generatingPDF') || 'Generating...') : (t('generate') || 'Generate')}
              </button>
              <button
                onClick={() => {
                  setShowCertificateModal(false);
                  setCertificateData({ clientId: '', carId: '', orderId: '' });
                }}
                disabled={generating}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {t('cancel') || 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('generateReport') || 'Generate Tracking Report'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('selectClient') || 'Select Client'}
                </label>
                <select
                  value={reportData.clientId}
                  onChange={(e) => setReportData({ ...reportData, clientId: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="">{t('selectClient') || 'Select Client'}</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>{client.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('selectCar') || 'Select Car'}
                </label>
                <select
                  value={reportData.carId}
                  onChange={(e) => setReportData({ ...reportData, carId: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="">{t('selectCar') || 'Select Car'}</option>
                  {cars.map((car) => (
                    <option key={car._id} value={car._id}>{car.model}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('selectOrder') || 'Select Order'}
                </label>
                <select
                  value={reportData.orderId}
                  onChange={(e) => setReportData({ ...reportData, orderId: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="">{t('selectOrder') || 'Select Order'}</option>
                  {orders.map((order) => (
                    <option key={order._id} value={order._id}>Order #{order._id.slice(-6)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('trackingCodeLabel') || 'Tracking Code'}
                </label>
                <input
                  type="text"
                  value={reportData.trackingCode}
                  onChange={(e) => setReportData({ ...reportData, trackingCode: e.target.value })}
                  placeholder={t('enterContainerNumber') || 'Enter tracking code'}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleGenerateReport}
                disabled={generating}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (t('generatingPDF') || 'Generating...') : (t('generate') || 'Generate')}
              </button>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportData({ clientId: '', carId: '', orderId: '', trackingCode: '' });
                }}
                disabled={generating}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {t('cancel') || 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
