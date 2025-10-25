/**
 * Example usage of PDF Generator with proper Arabic font support
 * 
 * All generator functions are now async and will automatically:
 * 1. Load and embed Amiri Arabic font from CDN
 * 2. Configure RTL text direction
 * 3. Display Arabic text correctly without gibberish
 */

import { 
  generateCertificate, 
  generateInvoice, 
  generateTrackingDocument,
  downloadPDF,
  getPDFBlob,
  getPDFBase64
} from './pdfGenerator';

/**
 * Example 1: Generate Arabic Certificate
 */
export async function generateArabicCertificate() {
  const carData = {
    clientName: 'أحمد راشد',
    clientEmail: 'ahmed.rashed@example.com',
    clientPhone: '123456789',
    clientId: 'AM987654321',
    clientAddress: 'الرباط، المغرب',
    carBrand: 'Mercedes-Benz',
    carModel: 'S-Class',
    carYear: '2024',
    carColor: 'أسود',
    carVin: 'WDD2221991A123456',
    carPrice: '250,000 MAD',
    registrationDate: '01/12/2025',
    paymentMethod: 'تحويل بنكي',
    amountPaid: '250,000 MAD',
    trackingCode: 'TREC-78665608'
  };

  // Generate the PDF (now async!)
  const doc = await generateCertificate(carData, 'ar', 'dark');
  
  // Download it
  downloadPDF(doc, 'certificate-arabic.pdf');
  
  return doc;
}

/**
 * Example 2: Generate Arabic Invoice
 */
export async function generateArabicInvoice() {
  const invoiceData = {
    clientName: 'محمد علي',
    clientEmail: 'mohamed.ali@example.com',
    clientPhone: '+212 6 12 34 56 78',
    clientAddress: 'الدار البيضاء، المغرب',
    carBrand: 'BMW',
    carModel: 'X5',
    carYear: '2024',
    carPrice: '450,000 MAD',
    invoiceNumber: 'INV-001234',
    invoiceDate: '21/10/2025',
    dueDate: '20/11/2025',
    discount: '10,000 MAD'
  };

  const doc = await generateInvoice(invoiceData, 'ar', 'dark');
  downloadPDF(doc, 'invoice-arabic.pdf');
  
  return doc;
}

/**
 * Example 3: Generate Arabic Tracking Document
 */
export async function generateArabicTracking() {
  const trackingData = {
    trackingCode: 'TRACK-567890',
    clientName: 'فاطمة حسن',
    clientEmail: 'fatima.hassan@example.com',
    clientPhone: '+212 6 98 76 54 32',
    carBrand: 'Audi',
    carModel: 'A6',
    currentLocation: 'مركز التوزيع الإقليمي',
    estimatedDelivery: '25/10/2025'
  };

  const doc = await generateTrackingDocument(trackingData, 'ar', 'dark');
  downloadPDF(doc, 'tracking-arabic.pdf');
  
  return doc;
}

/**
 * Example 4: Generate and Upload to Server
 */
export async function generateAndUploadPDF() {
  const carData = {
    clientName: 'عمر خالد',
    clientEmail: 'omar.khaled@example.com',
    carBrand: 'Toyota',
    carModel: 'Land Cruiser',
    carYear: '2024',
    carPrice: '380,000 MAD'
  };

  // Generate PDF
  const doc = await generateCertificate(carData, 'ar', 'light');
  
  // Get as Blob for upload
  const pdfBlob = getPDFBlob(doc);
  
  // Upload to server
  const formData = new FormData();
  formData.append('pdf', pdfBlob, 'certificate.pdf');
  
  const response = await fetch('/api/upload-pdf', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
}

/**
 * Example 5: Get PDF as Base64 for embedding
 */
export async function getPDFAsBase64() {
  const carData = {
    clientName: 'سارة أحمد',
    carBrand: 'Lexus',
    carModel: 'RX',
    carYear: '2024'
  };

  const doc = await generateCertificate(carData, 'ar', 'dark');
  
  // Get as base64 data URI
  const base64PDF = getPDFBase64(doc);
  
  // Can be used in iframe or img tag
  // <iframe src={base64PDF} />
  
  return base64PDF;
}

/**
 * Example 6: Button Click Handler (React)
 */
export const handleDownloadArabicPDF = async (carData) => {
  try {
    // Show loading state
    console.log('Generating Arabic PDF...');
    
    // Generate PDF with Arabic font
    const doc = await generateCertificate(carData, 'ar', 'dark');
    
    // Download
    downloadPDF(doc, `certificate-${carData.clientName}.pdf`);
    
    console.log('PDF generated successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};

/**
 * Example 7: Generate Multiple Languages
 */
export async function generateMultilingualPDFs(carData) {
  const pdfs = {};
  
  // English version
  const docEN = await generateCertificate(carData, 'en', 'light');
  pdfs.english = getPDFBlob(docEN);
  
  // French version
  const docFR = await generateCertificate(carData, 'fr', 'light');
  pdfs.french = getPDFBlob(docFR);
  
  // Arabic version with proper font
  const docAR = await generateCertificate(carData, 'ar', 'dark');
  pdfs.arabic = getPDFBlob(docAR);
  
  return pdfs;
}

/**
 * IMPORTANT NOTES:
 * 
 * 1. All generator functions are now ASYNC - you must use await:
 *    ✅ const doc = await generateCertificate(data, 'ar', 'dark');
 *    ❌ const doc = generateCertificate(data, 'ar', 'dark'); // Wrong!
 * 
 * 2. Arabic font (Amiri) is loaded from CDN on first use
 *    - Requires internet connection
 *    - Takes ~500ms to 1s on first load
 *    - Font is cached by browser
 * 
 * 3. The font automatically handles:
 *    - Connecting Arabic letters (no more gibberish!)
 *    - RTL text direction
 *    - Proper glyph shaping
 * 
 * 4. Dark mode works perfectly with Arabic text
 * 
 * 5. For offline use, you can embed the font as base64:
 *    - Download Amiri-Regular.ttf
 *    - Convert to base64
 *    - Replace the fetch URL with base64 string
 */
