/**
 * ============================================================================
 * PDF Generator Module - Complete Rewrite with Arabic Support
 * ============================================================================
 * 
 * This module generates multilingual PDFs (English, French, Arabic) using:
 * - jsPDF: PDF generation library
 * - jspdf-autotable: Table generation plugin
 * - arabic-reshaper: Properly connects Arabic letters
 * - bidi-js: Handles bidirectional text (RTL + LTR)
 * 
 * ARABIC TEXT HANDLING:
 * ---------------------
 * Arabic text requires special processing because:
 * 1. Letters change shape based on position (initial/medial/final/isolated)
 * 2. Text flows right-to-left (RTL)
 * 3. May contain embedded LTR text (numbers, English words)
 * 
 * We use:
 * - arabic-reshaper: Converts Unicode to presentation forms (connects letters)
 * - bidi-js: Applies Unicode BiDi algorithm for proper text ordering
 * - Amiri font: Professional Arabic typeface with proper glyph support
 * 
 * FONT EMBEDDING:
 * ---------------
 * Arabic fonts are embedded as base64 to avoid:
 * - Network requests (faster, offline-capable)
 * - CORS issues
 * - Loading delays
 * 
 * To add a new font:
 * 1. Get TTF file (e.g., from Google Fonts)
 * 2. Convert to base64:
 *    node -e "console.log(require('fs').readFileSync('font.ttf', 'base64'))" > font.base64.txt
 * 3. Import and register:
 *    import FontBase64 from './font.base64.js';
 *    doc.addFileToVFS('font.ttf', FontBase64);
 *    doc.addFont('font.ttf', 'FontName', 'normal');
 * 
 * ============================================================================
 */

"use client";

import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // Extends jsPDF with autoTable method
import ArabicReshaper from 'arabic-reshaper';
// @ts-ignore
import getBidiText from 'bidi-js';

import AmiriBase64 from './Amiri-Regular.base64.js';

// ============================================================================
// ARABIC TEXT PROCESSING
// ============================================================================

/**
 * Shape and reorder Arabic text for proper display in PDFs
 * 
 * Why this is needed:
 * - Arabic letters connect to each other (cursive script)
 * - Unicode stores letters in logical order, but display needs visual order
 * - Letters have 4 forms: isolated, initial, medial, final
 * 
 * Example:
 *   Input:  "سيارة" (logical order, disconnected Unicode)
 *   Output: "ةرايس" (visual order, connected presentation forms)
 * 
 * @param {string} text - Arabic text in Unicode
 * @returns {string} - Shaped and reordered text ready for display
 */
function shapeArabicText(text) {
  if (!text || typeof text !== 'string') return text;
  
  // Check if text contains Arabic characters
  const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
  if (!hasArabic) return text;
  
  try {
    // Step 1: Reshape - converts letters to their contextual forms
    const reshaped = ArabicReshaper.reshape(text);
    
    // Step 2: Apply BiDi - reorders text for visual display
    const bidiText = getBidiText(reshaped);
    
    return bidiText;
  } catch (error) {
    console.warn('Arabic text shaping error:', error);
    return text; // Return original if shaping fails
  }
}

/**
 * Embed Amiri Arabic font into jsPDF document
 * 
 * This runs once per document and embeds the font data into the PDF.
 * The font is stored in the PDF file itself, so the PDF works anywhere.
 * 
 * @param {jsPDF} doc - jsPDF document instance
 * @returns {Promise<boolean>} - True if successful
 */
async function embedArabicFont(doc) {
  try {
    // If base64 font is available, use it (fastest, offline)
    if (AmiriBase64) {
      doc.addFileToVFS('Amiri-Regular.ttf', AmiriBase64);
      doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
      return true;
    }
    
    // Fallback: Load from CDN (requires internet)
    console.warn('Base64 font not found, loading from CDN...');
    const fontUrl = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/amiri/Amiri-Regular.ttf';
    const response = await fetch(fontUrl);
    
    if (!response.ok) {
      throw new Error(`Font fetch failed: ${response.status}`);
    }
    
    const fontArrayBuffer = await response.arrayBuffer();
    const fontBase64 = arrayBufferToBase64(fontArrayBuffer);
    
    doc.addFileToVFS('Amiri-Regular.ttf', fontBase64);
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    
    return true;
  } catch (error) {
    console.error('Failed to embed Arabic font:', error);
    return false;
  }
}

/**
 * Convert ArrayBuffer to Base64 (chunked for large files)
 * 
 * Standard btoa() fails on large buffers. This version processes
 * the buffer in chunks to avoid stack overflow.
 * 
 * @param {ArrayBuffer} buffer - Font file as ArrayBuffer
 * @returns {string} - Base64 encoded string
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const CHUNK_SIZE = 0x8000; // 32KB chunks
  let binary = '';
  
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, bytes.length));
    binary += String.fromCharCode.apply(null, chunk);
  }
  
  return btoa(binary);
}

/**
 * Configure document for Arabic text rendering
 * 
 * Sets up the document with:
 * - RTL text direction
 * - Amiri font
 * - Proper text alignment defaults
 * 
 * @param {jsPDF} doc - jsPDF document instance
 */
function configureArabicDocument(doc) {
  // Enable RTL mode
  doc.setR2L(true);
  
  // Set Amiri as active font
  doc.setFont('Amiri', 'normal');
}

// ============================================================================
// COMPANY INFORMATION
// ============================================================================

const COMPANY_INFO = {
  en: {
    name: 'DreamCars Premium Agency',
    address: '123 Luxury Avenue, Downtown',
    city: 'Casablanca, Morocco',
    phone: '+212 5 22 XX XX XX',
    email: 'contact@dreamcars.ma',
    website: 'www.dreamcars.ma',
    taxId: 'TAX-MA-123456789',
  },
  fr: {
    name: 'Agence Premium DreamCars',
    address: '123 Avenue du Luxe, Centre-ville',
    city: 'Casablanca, Maroc',
    phone: '+212 5 22 XX XX XX',
    email: 'contact@dreamcars.ma',
    website: 'www.dreamcars.ma',
    taxId: 'N° FISCAL: MA-123456789',
  },
  ar: {
    name: 'وكالة دريم كارز الفاخرة',
    address: '١٢٣ شارع الرفاهية، وسط المدينة',
    city: 'الدار البيضاء، المغرب',
    phone: '+٢١٢ ٥ ٢٢ XX XX XX',
    email: 'contact@dreamcars.ma',
    website: 'www.dreamcars.ma',
    taxId: 'الرقم الضريبي: MA-123456789',
  }
};

// ============================================================================
// PDF TRANSLATIONS
// ============================================================================

const PDF_TRANSLATIONS = {
  en: {
    // Certificate
    certificateTitle: 'CERTIFICATE OF INSCRIPTION',
    certificateSubtitle: 'Official Vehicle Registration Document',
    clientInformation: 'Client Information',
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    idPassport: 'ID/Passport',
    address: 'Address',
    vehicleDetails: 'Vehicle Details',
    brand: 'Brand',
    model: 'Model',
    version: 'Version',
    year: 'Year',
    price: 'Price',
    color: 'Color',
    vin: 'VIN Number',
    paymentInformation: 'Payment Information',
    paymentMethod: 'Payment Method',
    amount: 'Amount Paid',
    trackingCode: 'Tracking Code',
    registrationDate: 'Registration Date',
    certificationText: 'This document certifies that the above-mentioned client has successfully completed the registration process for the specified vehicle with DreamCars Premium Agency.',
    signature: 'Authorized Signature',
    digitalSignature: 'This is a digitally generated document',
    
    // Invoice
    invoiceTitle: 'INVOICE',
    invoiceNumber: 'Invoice Number',
    invoiceDate: 'Invoice Date',
    dueDate: 'Due Date',
    billTo: 'Bill To',
    description: 'Description',
    quantity: 'Qty',
    unitPrice: 'Unit Price',
    total: 'Total',
    vehiclePurchase: 'Vehicle Purchase',
    subtotal: 'Subtotal',
    tax: 'Tax (20%)',
    discount: 'Discount',
    grandTotal: 'Grand Total',
    paymentStatus: 'Payment Status',
    paid: 'PAID',
    pending: 'PENDING',
    notes: 'Notes',
    invoiceNotes: 'Thank you for your business. Please keep this invoice for your records.',
    termsConditions: 'Terms & Conditions',
    termsText: 'Payment is due within 30 days. Late payments may incur additional fees.',
    
    // Tracking
    trackingTitle: 'DELIVERY TRACKING DOCUMENT',
    trackingSubtitle: 'Vehicle Delivery Itinerary',
    itinerary: 'Delivery Itinerary',
    station: 'Station',
    status: 'Status',
    timestamp: 'Timestamp',
    completed: 'Completed',
    inProgress: 'In Progress',
    pending: 'Pending',
    currentLocation: 'Current Location',
    estimatedDelivery: 'Estimated Delivery',
    progress: 'Delivery Progress',
    contactSupport: 'For inquiries, contact our support team',
  },
  fr: {
    // Certificat
    certificateTitle: 'CERTIFICAT D\'INSCRIPTION',
    certificateSubtitle: 'Document Officiel d\'Enregistrement de Véhicule',
    clientInformation: 'Informations Client',
    fullName: 'Nom Complet',
    email: 'Adresse Email',
    phone: 'Numéro de Téléphone',
    idPassport: 'ID/Passeport',
    address: 'Adresse',
    vehicleDetails: 'Détails du Véhicule',
    brand: 'Marque',
    model: 'Modèle',
    version: 'Version',
    year: 'Année',
    price: 'Prix',
    color: 'Couleur',
    vin: 'Numéro VIN',
    paymentInformation: 'Informations de Paiement',
    paymentMethod: 'Mode de Paiement',
    amount: 'Montant Payé',
    trackingCode: 'Code de Suivi',
    registrationDate: 'Date d\'Inscription',
    certificationText: 'Ce document certifie que le client mentionné ci-dessus a terminé avec succès le processus d\'inscription pour le véhicule spécifié auprès de l\'Agence Premium DreamCars.',
    signature: 'Signature Autorisée',
    digitalSignature: 'Ceci est un document généré numériquement',
    
    // Facture
    invoiceTitle: 'FACTURE',
    invoiceNumber: 'Numéro de Facture',
    invoiceDate: 'Date de Facture',
    dueDate: 'Date d\'Échéance',
    billTo: 'Facturer À',
    description: 'Description',
    quantity: 'Qté',
    unitPrice: 'Prix Unitaire',
    total: 'Total',
    vehiclePurchase: 'Achat de Véhicule',
    subtotal: 'Sous-total',
    tax: 'TVA (20%)',
    discount: 'Remise',
    grandTotal: 'Total Général',
    paymentStatus: 'Statut de Paiement',
    paid: 'PAYÉ',
    pending: 'EN ATTENTE',
    notes: 'Notes',
    invoiceNotes: 'Merci pour votre confiance. Veuillez conserver cette facture pour vos dossiers.',
    termsConditions: 'Termes & Conditions',
    termsText: 'Le paiement est dû dans les 30 jours. Les retards peuvent entraîner des frais supplémentaires.',
    
    // Suivi
    trackingTitle: 'DOCUMENT DE SUIVI DE LIVRAISON',
    trackingSubtitle: 'Itinéraire de Livraison du Véhicule',
    itinerary: 'Itinéraire de Livraison',
    station: 'Station',
    status: 'Statut',
    timestamp: 'Horodatage',
    completed: 'Terminé',
    inProgress: 'En Cours',
    pending: 'En Attente',
    currentLocation: 'Position Actuelle',
    estimatedDelivery: 'Livraison Estimée',
    progress: 'Progrès de Livraison',
    contactSupport: 'Pour toute question, contactez notre équipe de support',
  },
  ar: {
    // الشهادة
    certificateTitle: 'شهادة التسجيل',
    certificateSubtitle: 'وثيقة تسجيل المركبة الرسمية',
    clientInformation: 'معلومات العميل',
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    idPassport: 'رقم الهوية/جواز السفر',
    address: 'العنوان',
    vehicleDetails: 'تفاصيل المركبة',
    brand: 'الماركة',
    model: 'الموديل',
    version: 'الإصدار',
    year: 'السنة',
    price: 'السعر',
    color: 'اللون',
    vin: 'رقم الهيكل VIN',
    paymentInformation: 'معلومات الدفع',
    paymentMethod: 'طريقة الدفع',
    amount: 'المبلغ المدفوع',
    trackingCode: 'رمز التتبع',
    registrationDate: 'تاريخ التسجيل',
    certificationText: 'تشهد هذه الوثيقة بأن العميل المذكور أعلاه قد أكمل بنجاح عملية تسجيل المركبة المحددة لدى وكالة دريم كارز الفاخرة.',
    signature: 'التوقيع المعتمد',
    digitalSignature: 'هذه وثيقة مُنشأة رقمياً',
    
    // الفاتورة
    invoiceTitle: 'فاتورة',
    invoiceNumber: 'رقم الفاتورة',
    invoiceDate: 'تاريخ الفاتورة',
    dueDate: 'تاريخ الاستحقاق',
    billTo: 'الفاتورة إلى',
    description: 'الوصف',
    quantity: 'الكمية',
    unitPrice: 'السعر',
    total: 'المجموع',
    vehiclePurchase: 'شراء مركبة',
    subtotal: 'المجموع الفرعي',
    tax: 'الضريبة (٢٠٪)',
    discount: 'الخصم',
    grandTotal: 'المجموع الإجمالي',
    paymentStatus: 'حالة الدفع',
    paid: 'مدفوع',
    pending: 'قيد الانتظار',
    notes: 'ملاحظات',
    invoiceNotes: 'شكراً لثقتكم. يرجى الاحتفاظ بهذه الفاتورة لسجلاتكم.',
    termsConditions: 'الشروط والأحكام',
    termsText: 'الدفع مستحق خلال ٣٠ يوماً. التأخير في الدفع قد يؤدي إلى رسوم إضافية.',
    
    // التتبع
    trackingTitle: 'وثيقة تتبع التوصيل',
    trackingSubtitle: 'مسار توصيل المركبة',
    itinerary: 'مسار التوصيل',
    station: 'المحطة',
    status: 'الحالة',
    timestamp: 'التوقيت',
    completed: 'مكتمل',
    inProgress: 'قيد التنفيذ',
    pending: 'قيد الانتظار',
    currentLocation: 'الموقع الحالي',
    estimatedDelivery: 'التوصيل المتوقع',
    progress: 'تقدم التوصيل',
    contactSupport: 'للاستفسارات، تواصل مع فريق الدعم لدينا',
  }
};

// ============================================================================
// THEME COLORS
// ============================================================================

const THEMES = {
  light: {
    primary: [41, 98, 255], // Blue
    secondary: [139, 92, 246], // Purple
    success: [34, 197, 94], // Green
    background: [255, 255, 255],
    text: [17, 24, 39],
    textSecondary: [107, 114, 128],
    border: [229, 231, 235],
    headerBg: [249, 250, 251],
  },
  dark: {
    primary: [96, 165, 250],
    secondary: [167, 139, 250],
    success: [74, 222, 128], 
    background: [17, 24, 39],
    text: [243, 244, 246],
    textSecondary: [156, 163, 175],
    border: [55, 65, 81],
    headerBg: [31, 41, 55],
  }
};

// ============================================================================
// PDF GENERATORS
// ============================================================================

/**
 * Generate Certificate of Inscription
 * 
 * @param {Object} data - Client and vehicle data
 * @param {string} language - 'en', 'fr', or 'ar'
 * @param {string} theme - 'light' or 'dark'
 * @returns {Promise<jsPDF>} - PDF document instance
 */
export async function generateCertificate(data, language = 'en', theme = 'light') {
  const doc = new jsPDF();
  const t = PDF_TRANSLATIONS[language];
  const company = COMPANY_INFO[language];
  const colors = THEMES[theme];
  const isRTL = language === 'ar';
  
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPos = 20;

  // Set page background for dark mode
  if (theme === 'dark') {
    doc.setFillColor(...colors.background);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  }

  // Configure Arabic if needed
  if (isRTL) {
    await embedArabicFont(doc);
    configureArabicDocument(doc);
  } else {
    doc.setFont('helvetica', 'normal');
  }

  // Helper function to add text (handles Arabic shaping automatically)
  const addText = (text, x, y, options = {}) => {
    const processedText = isRTL ? shapeArabicText(text) : text;
    doc.text(processedText, x, y, options);
  };

  // Header with gradient background (simulated)
  doc.setFillColor(...colors.headerBg);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Company Logo Placeholder (circle)
  doc.setFillColor(...colors.primary);
  doc.circle(pageWidth / 2, 25, 8, 'F');
  doc.setTextColor(...colors.background);
  doc.setFontSize(10);
  addText('DC', pageWidth / 2, 27, { align: 'center' });

  // Company Name
  doc.setTextColor(...colors.text);
  doc.setFontSize(16);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  yPos = 60;
  addText(company.name, pageWidth / 2, yPos, { align: 'center' });

  // Document Title
  doc.setFontSize(20);
  doc.setTextColor(...colors.primary);
  yPos += 15;
  addText(t.certificateTitle, pageWidth / 2, yPos, { align: 'center' });

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(...colors.textSecondary);
  yPos += 8;
  addText(t.certificateSubtitle, pageWidth / 2, yPos, { align: 'center' });

  // Certificate Number and Date
  doc.setFontSize(9);
  doc.setTextColor(...colors.textSecondary);
  yPos += 10;
  const certNumber = `CERT-${Date.now().toString().slice(-8)}`;
  const leftX = isRTL ? pageWidth - margin : margin;
  const rightX = isRTL ? margin : pageWidth - margin;
  addText(`${t.invoiceNumber || 'Certificate No.'}: ${certNumber}`, leftX, yPos);
  addText(`${t.registrationDate}: ${data.registrationDate || new Date().toLocaleDateString()}`, 
          rightX, yPos, { align: isRTL ? 'left' : 'right' });

  // Section: Client Information
  yPos += 15;
  doc.setFillColor(...colors.primary);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  doc.setTextColor(...colors.background);
  doc.setFontSize(12);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  const sectionX = isRTL ? pageWidth - margin - 5 : margin + 5;
  addText(t.clientInformation, sectionX, yPos + 5.5);

  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
  doc.setTextColor(...colors.text);
  doc.setFontSize(10);
  yPos += 15;

  const clientData = [
    [t.fullName, data.clientName || 'N/A'],
    [t.email, data.clientEmail || 'N/A'],
    [t.phone, data.clientPhone || 'N/A'],
    [t.idPassport, data.clientId || 'N/A'],
    [t.address, data.clientAddress || 'N/A'],
  ];

  clientData.forEach(([label, value]) => {
    doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
    addText(`${label}:`, sectionX, yPos);
    doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
    const valueX = isRTL ? pageWidth - margin - 60 : margin + 60;
    addText(value, valueX, yPos);
    yPos += 7;
  });

  // Section: Vehicle Details
  yPos += 5;
  doc.setFillColor(...colors.primary);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  doc.setTextColor(...colors.background);
  doc.setFontSize(12);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  addText(t.vehicleDetails, sectionX, yPos + 5.5);

  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
  doc.setTextColor(...colors.text);
  doc.setFontSize(10);
  yPos += 15;

  const vehicleData = [
    [t.brand, data.carBrand || 'N/A'],
    [t.model, data.carModel || 'N/A'],
    [t.year, data.carYear || 'N/A'],
    [t.color, data.carColor || 'N/A'],
    [t.vin, data.carVin || 'N/A'],
    [t.price, data.carPrice || 'N/A'],
  ];

  vehicleData.forEach(([label, value]) => {
    doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
    addText(`${label}:`, sectionX, yPos);
    doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
    const valueX = isRTL ? pageWidth - margin - 60 : margin + 60;
    addText(value, valueX, yPos);
    yPos += 7;
  });

  // Section: Payment Information
  yPos += 5;
  doc.setFillColor(...colors.primary);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  doc.setTextColor(...colors.background);
  doc.setFontSize(12);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  addText(t.paymentInformation, sectionX, yPos + 5.5);

  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
  doc.setTextColor(...colors.text);
  doc.setFontSize(10);
  yPos += 15;

  const paymentData = [
    [t.paymentMethod, data.paymentMethod || 'N/A'],
    [t.amount, data.amountPaid || 'N/A'],
    [t.trackingCode, data.trackingCode || 'N/A'],
  ];

  paymentData.forEach(([label, value]) => {
    doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
    addText(`${label}:`, sectionX, yPos);
    doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
    const valueX = isRTL ? pageWidth - margin - 60 : margin + 60;
    addText(value, valueX, yPos);
    yPos += 7;
  });

  // Certification Text
  yPos += 10;
  doc.setFontSize(9);
  doc.setTextColor(...colors.textSecondary);
  const certText = isRTL ? shapeArabicText(t.certificationText) : t.certificationText;
  const splitText = doc.splitTextToSize(certText, pageWidth - 2 * margin - 10);
  doc.text(splitText, sectionX, yPos, { 
    align: isRTL ? 'right' : 'left', 
    maxWidth: pageWidth - 2 * margin - 10 
  });

  // Signature Section
  yPos = pageHeight - 50;
  doc.setDrawColor(...colors.border);
  doc.line(pageWidth - margin - 60, yPos, pageWidth - margin - 5, yPos);
  doc.setFontSize(9);
  doc.setTextColor(...colors.text);
  addText(t.signature, pageWidth - margin - 32.5, yPos + 5, { align: 'center' });

  // Footer
  yPos = pageHeight - 25;
  doc.setFillColor(...colors.headerBg);
  doc.rect(0, yPos, pageWidth, 25, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textSecondary);
  addText(company.address, pageWidth / 2, yPos + 8, { align: 'center' });
  addText(`${company.phone} | ${company.email}`, pageWidth / 2, yPos + 13, { align: 'center' });
  addText(t.digitalSignature, pageWidth / 2, yPos + 18, { align: 'center' });

  return doc;
}

/**
 * Generate Invoice
 * 
 * @param {Object} data - Invoice data
 * @param {string} language - 'en', 'fr', or 'ar'
 * @param {string} theme - 'light' or 'dark'
 * @returns {Promise<jsPDF>} - PDF document instance
 */
export async function generateInvoice(data, language = 'en', theme = 'light') {
  const doc = new jsPDF();
  const t = PDF_TRANSLATIONS[language];
  const company = COMPANY_INFO[language];
  const colors = THEMES[theme];
  const isRTL = language === 'ar';
  
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPos = 20;

  // Set page background for dark mode
  if (theme === 'dark') {
    doc.setFillColor(...colors.background);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  }

  // Configure Arabic if needed
  if (isRTL) {
    await embedArabicFont(doc);
    configureArabicDocument(doc);
  } else {
    doc.setFont('helvetica', 'normal');
  }

  // Helper function to add text
  const addText = (text, x, y, options = {}) => {
    const processedText = isRTL ? shapeArabicText(text) : text;
    doc.text(processedText, x, y, options);
  };

  // Header
  doc.setFillColor(...colors.headerBg);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Logo
  doc.setFillColor(...colors.primary);
  const logoX = isRTL ? pageWidth - margin - 8 : margin + 8;
  doc.circle(logoX, 22, 8, 'F');
  doc.setTextColor(...colors.background);
  doc.setFontSize(10);
  addText('DC', logoX, 24, { align: 'center' });

  // Company Info
  doc.setTextColor(...colors.text);
  doc.setFontSize(14);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  const companyX = isRTL ? pageWidth - margin - 25 : margin + 25;
  addText(company.name, companyX, 18);
  doc.setFontSize(8);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  addText(company.address, companyX, 25);
  addText(company.city, companyX, 30);
  addText(`${company.phone} | ${company.email}`, companyX, 35);

  // Invoice Title
  doc.setFontSize(24);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  const titleX = isRTL ? margin : pageWidth - margin;
  addText(t.invoiceTitle, titleX, 25, { align: isRTL ? 'left' : 'right' });

  // Invoice Details
  yPos = 55;
  doc.setFontSize(9);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
  doc.setTextColor(...colors.text);
  
  const invoiceNumber = data.invoiceNumber || `INV-${Date.now().toString().slice(-8)}`;
  const invoiceDate = data.invoiceDate || new Date().toLocaleDateString();
  const dueDate = data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

  const detailsLabelX = isRTL ? margin : pageWidth - margin - 60;
  const detailsValueX = isRTL ? margin + 35 : pageWidth - margin;
  const detailsAlign = isRTL ? 'left' : 'right';

  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  addText(`${t.invoiceNumber}:`, detailsLabelX, yPos);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
  addText(invoiceNumber, detailsValueX, yPos, { align: detailsAlign });
  
  yPos += 6;
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  addText(`${t.invoiceDate}:`, detailsLabelX, yPos);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
  addText(invoiceDate, detailsValueX, yPos, { align: detailsAlign });
  
  yPos += 6;
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  addText(`${t.dueDate}:`, detailsLabelX, yPos);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
  addText(dueDate, detailsValueX, yPos, { align: detailsAlign });

  // Bill To Section
  yPos += 15;
  doc.setFillColor(...colors.primary);
  doc.rect(margin, yPos, 80, 8, 'F');
  doc.setTextColor(...colors.background);
  doc.setFontSize(11);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  addText(t.billTo, margin + 5, yPos + 5.5);

  yPos += 12;
  doc.setTextColor(...colors.text);
  doc.setFontSize(10);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  addText(data.clientName || 'N/A', margin + 5, yPos);
  
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
  doc.setFontSize(9);
  yPos += 5;
  addText(data.clientEmail || '', margin + 5, yPos);
  yPos += 5;
  addText(data.clientPhone || '', margin + 5, yPos);
  yPos += 5;
  addText(data.clientAddress || '', margin + 5, yPos);

  // Items Table
  yPos += 15;
  const tableData = [
    [
      isRTL ? shapeArabicText(`${data.carBrand || ''} ${data.carModel || ''} (${data.carYear || ''})`) 
            : `${data.carBrand || ''} ${data.carModel || ''} (${data.carYear || ''})`,
      '1',
      data.carPrice || '0',
      data.carPrice || '0'
    ]
  ];

  const tableHead = [[
    isRTL ? shapeArabicText(t.description) : t.description,
    isRTL ? shapeArabicText(t.quantity) : t.quantity,
    isRTL ? shapeArabicText(t.unitPrice) : t.unitPrice,
    isRTL ? shapeArabicText(t.total) : t.total
  ]];

  doc.autoTable({
    startY: yPos,
    head: tableHead,
    body: tableData,
    theme: theme === 'dark' ? 'grid' : 'striped',
    styles: {
      font: isRTL ? 'Amiri' : 'helvetica',
      halign: isRTL ? 'right' : 'left',
    },
    headStyles: {
      fillColor: colors.primary,
      textColor: colors.background,
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: colors.text,
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: colors.headerBg,
    },
    margin: { left: margin, right: margin },
  });

  // Totals
  yPos = doc.lastAutoTable.finalY + 15;
  const subtotal = parseFloat(data.carPrice?.replace(/[^0-9.-]+/g, '') || 0);
  const taxRate = 0.20;
  const tax = subtotal * taxRate;
  const discount = parseFloat(data.discount || 0);
  const grandTotal = subtotal + tax - discount;

  const totalsX = pageWidth - margin - 60;
  doc.setFontSize(10);
  
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
  addText(t.subtotal, totalsX, yPos);
  doc.text(`$${subtotal.toLocaleString()}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 7;
  addText(t.tax, totalsX, yPos);
  doc.text(`$${tax.toLocaleString()}`, pageWidth - margin, yPos, { align: 'right' });
  
  if (discount > 0) {
    yPos += 7;
    addText(t.discount, totalsX, yPos);
    doc.text(`-$${discount.toLocaleString()}`, pageWidth - margin, yPos, { align: 'right' });
  }
  
  yPos += 10;
  doc.setFillColor(...colors.primary);
  doc.rect(totalsX - 5, yPos - 6, pageWidth - totalsX - margin + 5, 10, 'F');
  doc.setTextColor(...colors.background);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  doc.setFontSize(12);
  addText(t.grandTotal, totalsX, yPos);
  doc.text(`$${grandTotal.toLocaleString()}`, pageWidth - margin, yPos, { align: 'right' });

  // Payment Status
  yPos += 15;
  doc.setTextColor(...colors.text);
  doc.setFontSize(10);
  addText(`${t.paymentStatus}:`, margin, yPos);
  
  const isPaid = data.paymentStatus === 'paid';
  doc.setFillColor(...(isPaid ? colors.success : [234, 179, 8]));
  doc.rect(margin + 40, yPos - 5, 30, 8, 'F');
  doc.setTextColor(...colors.background);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  addText(isPaid ? t.paid : t.pending, margin + 55, yPos, { align: 'center' });

  // Footer
  yPos = pageHeight - 40;
  doc.setDrawColor(...colors.border);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  doc.setTextColor(...colors.text);
  addText(t.notes, margin, yPos);
  
  yPos += 5;
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textSecondary);
  addText(t.invoiceNotes, margin, yPos);

  yPos += 10;
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...colors.text);
  addText(t.termsConditions, margin, yPos);
  
  yPos += 5;
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textSecondary);
  addText(t.termsText, margin, yPos);

  return doc;
}

/**
 * Generate Tracking Document
 * 
 * @param {Object} data - Tracking data
 * @param {string} language - 'en', 'fr', or 'ar'
 * @param {string} theme - 'light' or 'dark'
 * @returns {Promise<jsPDF>} - PDF document instance
 */
export async function generateTrackingDocument(data, language = 'en', theme = 'light') {
  const doc = new jsPDF();
  const t = PDF_TRANSLATIONS[language];
  const company = COMPANY_INFO[language];
  const colors = THEMES[theme];
  const isRTL = language === 'ar';
  
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPos = 20;

  // Set page background for dark mode
  if (theme === 'dark') {
    doc.setFillColor(...colors.background);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  }

  // Configure Arabic if needed
  if (isRTL) {
    await embedArabicFont(doc);
    configureArabicDocument(doc);
  } else {
    doc.setFont('helvetica', 'normal');
  }

  // Helper function to add text
  const addText = (text, x, y, options = {}) => {
    const processedText = isRTL ? shapeArabicText(text) : text;
    doc.text(processedText, x, y, options);
  };

  // Header
  doc.setFillColor(...colors.headerBg);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setFillColor(...colors.primary);
  doc.circle(pageWidth / 2, 25, 8, 'F');
  doc.setTextColor(...colors.background);
  doc.setFontSize(10);
  addText('DC', pageWidth / 2, 27, { align: 'center' });

  doc.setTextColor(...colors.text);
  doc.setFontSize(16);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  yPos = 60;
  addText(company.name, pageWidth / 2, yPos, { align: 'center' });

  doc.setFontSize(18);
  doc.setTextColor(...colors.primary);
  yPos += 12;
  addText(t.trackingTitle, pageWidth / 2, yPos, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(...colors.textSecondary);
  yPos += 7;
  addText(t.trackingSubtitle, pageWidth / 2, yPos, { align: 'center' });

  // Tracking Code (Highlighted)
  yPos += 15;
  doc.setFillColor(...colors.primary);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 15, 3, 3, 'F');
  doc.setTextColor(...colors.background);
  doc.setFontSize(14);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  addText(`${t.trackingCode}: ${data.trackingCode || 'N/A'}`, pageWidth / 2, yPos + 10, { align: 'center' });

  // Client and Vehicle Info
  yPos += 25;
  doc.setFontSize(10);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
  doc.setTextColor(...colors.text);
  
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  addText(`${t.fullName}:`, margin, yPos);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
  addText(data.clientName || 'N/A', margin + 40, yPos);
  
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  addText(`${t.model}:`, pageWidth - margin - 80, yPos);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
  doc.text(`${data.carBrand || ''} ${data.carModel || ''}`, pageWidth - margin, yPos, { align: 'right' });

  // Progress Bar
  yPos += 15;
  const progressPercent = data.progressPercent || 0;
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 10, 2, 2, 'S');
  
  if (progressPercent > 0) {
    const progressWidth = ((pageWidth - 2 * margin) * progressPercent) / 100;
    doc.setFillColor(...colors.success);
    doc.roundedRect(margin, yPos, progressWidth, 10, 2, 2, 'F');
  }
  
  doc.setFontSize(9);
  doc.setTextColor(...colors.background);
  doc.text(`${progressPercent}%`, pageWidth / 2, yPos + 7, { align: 'center' });

  // Current Location & Estimated Delivery
  yPos += 20;
  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  addText(`${t.currentLocation}:`, margin, yPos);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
  doc.setTextColor(...colors.primary);
  addText(data.currentLocation || 'N/A', margin + 50, yPos);
  
  doc.setTextColor(...colors.text);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'bold');
  addText(`${t.estimatedDelivery}:`, pageWidth - margin - 100, yPos);
  doc.setFont(isRTL ? 'Amiri' : 'helvetica', 'normal');
  doc.setTextColor(...colors.success);
  addText(data.estimatedDelivery || 'N/A', pageWidth - margin, yPos, { align: 'right' });

  // Itinerary Table
  yPos += 15;
  const stations = data.stations || [
    { name: 'Origin Station', status: 'completed', timestamp: '2024-10-15 09:00' },
    { name: 'Transit Hub 1', status: 'completed', timestamp: '2024-10-16 14:30' },
    { name: 'Regional Center', status: 'inProgress', timestamp: '2024-10-18 10:00' },
    { name: 'Final Destination', status: 'pending', timestamp: 'Pending' },
  ];

  const stationsData = stations.map(station => {
    const statusText = station.status === 'completed' ? t.completed 
                     : station.status === 'inProgress' ? t.inProgress 
                     : t.pending;
    return [
      isRTL ? shapeArabicText(station.name) : station.name,
      isRTL ? shapeArabicText(statusText) : statusText,
      station.timestamp
    ];
  });

  const tableHead = [[
    isRTL ? shapeArabicText(t.station) : t.station,
    isRTL ? shapeArabicText(t.status) : t.status,
    isRTL ? shapeArabicText(t.timestamp) : t.timestamp
  ]];

  doc.autoTable({
    startY: yPos,
    head: tableHead,
    body: stationsData,
    theme: theme === 'dark' ? 'grid' : 'striped',
    styles: {
      font: isRTL ? 'Amiri' : 'helvetica',
      halign: isRTL ? 'right' : 'left',
    },
    headStyles: {
      fillColor: colors.primary,
      textColor: colors.background,
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: colors.text,
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: colors.headerBg,
    },
    margin: { left: margin, right: margin },
    didParseCell: function(cellData) {
      if (cellData.column.index === 1 && cellData.section === 'body') {
        const status = stations[cellData.row.index].status;
        if (status === 'completed') {
          cellData.cell.styles.textColor = colors.success;
          cellData.cell.styles.fontStyle = 'bold';
        } else if (status === 'inProgress') {
          cellData.cell.styles.textColor = colors.primary;
          cellData.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  // Footer
  yPos = pageHeight - 30;
  doc.setFillColor(...colors.headerBg);
  doc.rect(0, yPos, pageWidth, 30, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(...colors.textSecondary);
  addText(t.contactSupport, pageWidth / 2, yPos + 8, { align: 'center' });
  addText(`${company.phone} | ${company.email}`, pageWidth / 2, yPos + 13, { align: 'center' });
  addText(company.address, pageWidth / 2, yPos + 18, { align: 'center' });
  doc.setFontSize(7);
  addText(t.digitalSignature, pageWidth / 2, yPos + 23, { align: 'center' });

  return doc;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Download PDF to user's device
 * 
 * Validates that doc is a proper jsPDF instance before calling save.
 * This prevents "doc.save is not a function" errors.
 * 
 * @param {jsPDF} doc - PDF document instance
 * @param {string} filename - Name for downloaded file
 */
export function downloadPDF(doc, filename) {
  if (!doc || typeof doc.save !== 'function') {
    console.error('Invalid jsPDF instance passed to downloadPDF');
    throw new Error('Cannot download PDF: Invalid document instance');
  }
  
  doc.save(filename);
}

/**
 * Get PDF as Blob (for uploads)
 * 
 * @param {jsPDF} doc - PDF document instance
 * @returns {Blob} - PDF as Blob
 */
export function getPDFBlob(doc) {
  if (!doc || typeof doc.output !== 'function') {
    console.error('Invalid jsPDF instance passed to getPDFBlob');
    throw new Error('Cannot create PDF Blob: Invalid document instance');
  }
  
  return doc.output('blob');
}

/**
 * Get PDF as Base64 data URI
 * 
 * @param {jsPDF} doc - PDF document instance
 * @returns {string} - Base64 data URI
 */
export function getPDFBase64(doc) {
  if (!doc || typeof doc.output !== 'function') {
    console.error('Invalid jsPDF instance passed to getPDFBase64');
    throw new Error('Cannot create PDF Base64: Invalid document instance');
  }
  
  return doc.output('datauristring');
}

// ============================================================================
// USAGE EXAMPLES & INSTALLATION INSTRUCTIONS
// ============================================================================

/**
 * NPM INSTALLATION:
 * -----------------
 * Run these commands to install all dependencies:
 * 
 *   npm install jspdf jspdf-autotable arabic-reshaper bidi-js
 * 
 * 
 * GENERATE BASE64 FONT FILE:
 * ---------------------------
 * After downloading Amiri-Regular.ttf, convert it to base64:
 * 
 *   node -e "const fs = require('fs'); const b64 = fs.readFileSync('Amiri-Regular.ttf', 'base64'); fs.writeFileSync('Amiri-Regular.base64.js', 'export default \\'' + b64 + '\\';');"
 * 
 * 
 * USAGE EXAMPLE:
 * --------------
 * 
 *   import { generateCertificate, downloadPDF } from './pdfGenerator';
 * 
 *   async function createArabicPDF() {
 *     const data = {
 *       clientName: 'أحمد محمد',
 *       clientEmail: 'ahmed@example.com',
 *       carBrand: 'مرسيدس',
 *       carModel: 'S-Class',
 *       carYear: '2024'
 *     };
 * 
 *     // Generate PDF (note: now async!)
 *     const doc = await generateCertificate(data, 'ar', 'dark');
 * 
 *     // Download it
 *     downloadPDF(doc, 'certificate-arabic.pdf');
 *   }
 * 
 * 
 * FONT SOURCES:
 * -------------
 * - Amiri: https://github.com/aliftype/amiri/releases
 * - Cairo: https://fonts.google.com/specimen/Cairo
 * - Tajawal: https://fonts.google.com/specimen/Tajawal
 * - Scheherazade: https://software.sil.org/scheherazade/
 * 
 * 
 * TROUBLESHOOTING:
 * ----------------
 * 1. "doc.save is not a function"
 *    → Make sure you're using `await` when calling generators
 *    → Correct: const doc = await generateCertificate(...)
 *    → Wrong: const doc = generateCertificate(...)
 * 
 * 2. Arabic text still appears as gibberish
 *    → Ensure arabic-reshaper and bidi-js are installed
 *    → Check that Amiri font is properly embedded
 *    → Verify language parameter is 'ar' (lowercase)
 * 
 * 3. autoTable not working
 *    → Make sure you import 'jspdf-autotable' (with quotes)
 *    → This extends jsPDF prototype with autoTable method
 *    → Use doc.autoTable({...}), not autoTable(doc, {...})
 */
