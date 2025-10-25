/**
 * Example: Using Cloudinary PDF Upload & View Functions
 * 
 * This file demonstrates how to:
 * 1. Generate a PDF using jsPDF
 * 2. Upload it to Cloudinary
 * 3. View it in the browser
 * 4. Download it with proper filename
 */

import { useState } from 'react';
import { 
  generateCertificate, 
  generateInvoice, 
  generateTrackingDocument 
} from '@/app/utils/pdfGenerator';
import { 
  generateAndUploadPDF, 
  viewCloudinaryPDF, 
  downloadCloudinaryFile 
} from '@/app/utils/cloudinaryHelper';

export default function PDFUploadExample() {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Example 1: Generate Certificate and Upload
   */
  const handleGenerateAndUploadCertificate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Sample data
      const clientData = {
        clientName: 'John Smith',
        clientEmail: 'john@example.com',
        carBrand: 'BMW',
        carModel: 'X5',
        carYear: '2024',
        carPrice: '$85,000',
        registrationDate: '2024-10-22',
      };

      // Generate PDF
      console.log('📝 Generating certificate...');
      const doc = await generateCertificate(clientData, 'en', 'light');

      // Upload to Cloudinary
      console.log('☁️ Uploading to Cloudinary...');
      const result = await generateAndUploadPDF(
        doc,
        `certificate-${clientData.clientName.replace(/\s+/g, '-')}.pdf`,
        'certificates'
      );

      console.log('✅ Success! URL:', result.url);
      setPdfUrl(result.url);

      // Optionally open in browser immediately
      viewCloudinaryPDF(result.url, 'certificate.pdf');

    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Example 2: Generate Invoice and Upload
   */
  const handleGenerateAndUploadInvoice = async () => {
    try {
      setLoading(true);
      setError(null);

      const orderData = {
        clientName: 'Sarah Johnson',
        clientEmail: 'sarah@example.com',
        carBrand: 'Mercedes',
        carModel: 'S-Class',
        carYear: '2024',
        carPrice: '$120,000',
        invoiceNumber: 'INV-2024-001',
        invoiceDate: '2024-10-22',
        dueDate: '2024-11-22',
        paymentStatus: 'pending',
        amountPaid: '$60,000',
        discount: '$5,000',
      };

      const doc = await generateInvoice(orderData, 'en', 'light');
      
      const result = await generateAndUploadPDF(
        doc,
        `invoice-${orderData.invoiceNumber}.pdf`,
        'invoices'
      );

      setPdfUrl(result.url);
      
      alert(`Invoice uploaded! URL: ${result.url}`);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Example 3: Generate Tracking Document and Upload
   */
  const handleGenerateAndUploadTracking = async () => {
    try {
      setLoading(true);
      setError(null);

      const trackingData = {
        clientName: 'Ahmed Al-Rashid',
        trackingCode: 'TRK-2024-XYZ123',
        carBrand: 'Audi',
        carModel: 'Q7',
        currentLocation: 'Distribution Center - New York',
        estimatedDelivery: '2024-10-30',
        progressPercent: 75,
        stations: [
          { name: 'Factory - Germany', status: 'completed', timestamp: '2024-10-15' },
          { name: 'Port - Hamburg', status: 'completed', timestamp: '2024-10-18' },
          { name: 'Distribution Center - NY', status: 'inProgress', timestamp: '2024-10-22' },
          { name: 'Final Delivery', status: 'pending', timestamp: 'Pending' },
        ],
      };

      const doc = await generateTrackingDocument(trackingData, 'en', 'light');
      
      const result = await generateAndUploadPDF(
        doc,
        `tracking-${trackingData.trackingCode}.pdf`,
        'tracking'
      );

      setPdfUrl(result.url);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Example 4: View PDF in Browser
   */
  const handleViewPDF = () => {
    if (pdfUrl) {
      viewCloudinaryPDF(pdfUrl, 'document.pdf');
    } else {
      alert('Please upload a PDF first');
    }
  };

  /**
   * Example 5: Download PDF
   */
  const handleDownloadPDF = () => {
    if (pdfUrl) {
      downloadCloudinaryFile(pdfUrl, 'document.pdf');
    } else {
      alert('Please upload a PDF first');
    }
  };

  /**
   * Example 6: Upload User File (from file input)
   */
  const handleUserFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'user-documents');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setPdfUrl(result.url);

      console.log('✅ User file uploaded:', result.url);
      alert(`File uploaded successfully!\n\nURL: ${result.url}`);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Cloudinary PDF Upload Examples</h1>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700"></div>
            <span>Processing...</span>
          </div>
        </div>
      )}

      {/* PDF URL Display */}
      {pdfUrl && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-semibold text-green-700 mb-2">PDF Uploaded Successfully!</p>
          <p className="text-xs text-green-600 break-all">{pdfUrl}</p>
        </div>
      )}

      {/* Example Buttons */}
      <div className="space-y-6">
        {/* Section 1: Generate & Upload */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Generate & Upload PDFs</h2>
          <div className="space-y-3">
            <button
              onClick={handleGenerateAndUploadCertificate}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              📜 Generate & Upload Certificate
            </button>

            <button
              onClick={handleGenerateAndUploadInvoice}
              disabled={loading}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🧾 Generate & Upload Invoice
            </button>

            <button
              onClick={handleGenerateAndUploadTracking}
              disabled={loading}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              📦 Generate & Upload Tracking Document
            </button>
          </div>
        </div>

        {/* Section 2: View & Download */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">View & Download PDF</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleViewPDF}
              disabled={!pdfUrl}
              className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              👁️ View PDF in Browser
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={!pdfUrl}
              className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ⬇️ Download PDF
            </button>
          </div>
        </div>

        {/* Section 3: Upload User File */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upload User File</h2>
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">
                Select a PDF or image file:
              </span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleUserFileUpload}
                disabled={loading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="mt-8 border border-gray-200 rounded-lg p-6 bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Code Examples</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. Generate & Upload:</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`const doc = await generateCertificate(data, 'en', 'light');
const result = await generateAndUploadPDF(
  doc, 
  'certificate.pdf', 
  'certificates'
);
console.log('URL:', result.url);`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. View in Browser:</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`viewCloudinaryPDF(pdfUrl, 'document.pdf');`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Download File:</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`downloadCloudinaryFile(pdfUrl, 'invoice.pdf');`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
