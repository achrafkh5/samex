/**
 * PDF Generation Utilities for DreamCars Agency
 * Supports: Certificate of Inscription, Invoice, Tracking Document
 * Languages: Arabic (RTL), French, English
 * Themes: Light & Dark
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Company Information
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

// PDF Translations
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

// Theme Colors
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
    primary: [96, 165, 250], // Light Blue
    secondary: [167, 139, 250], // Light Purple
    success: [74, 222, 128], // Light Green
    background: [17, 24, 39],
    text: [243, 244, 246],
    textSecondary: [156, 163, 175],
    border: [55, 65, 81],
    headerBg: [31, 41, 55],
  }
};

/**
 * Generate Certificate of Inscription
 */
export function generateCertificate(data, language = 'en', theme = 'light') {
  const doc = new jsPDF();
  const t = PDF_TRANSLATIONS[language];
  const company = COMPANY_INFO[language];
  const colors = THEMES[theme];
  const isRTL = language === 'ar';
  
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPos = 20;

  // Configure RTL if Arabic
  if (isRTL) {
    doc.setR2L(true);
  }

  // Header with gradient background (simulated)
  doc.setFillColor(...colors.headerBg);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Company Logo Placeholder (circle)
  doc.setFillColor(...colors.primary);
  doc.circle(pageWidth / 2, 25, 8, 'F');
  doc.setTextColor(...colors.background);
  doc.setFontSize(10);
  doc.text('DC', pageWidth / 2, 27, { align: 'center' });

  // Company Name
  doc.setTextColor(...colors.text);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  yPos = 60;
  doc.text(company.name, pageWidth / 2, yPos, { align: 'center' });

  // Document Title
  doc.setFontSize(20);
  doc.setTextColor(...colors.primary);
  yPos += 15;
  doc.text(t.certificateTitle, pageWidth / 2, yPos, { align: 'center' });

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(...colors.textSecondary);
  yPos += 8;
  doc.text(t.certificateSubtitle, pageWidth / 2, yPos, { align: 'center' });

  // Certificate Number and Date
  doc.setFontSize(9);
  doc.setTextColor(...colors.textSecondary);
  yPos += 10;
  const certNumber = `CERT-${Date.now().toString().slice(-8)}`;
  doc.text(`${t.invoiceNumber || 'Certificate No.'}: ${certNumber}`, isRTL ? pageWidth - margin : margin, yPos);
  doc.text(`${t.registrationDate}: ${data.registrationDate || new Date().toLocaleDateString()}`, isRTL ? margin : pageWidth - margin, yPos, { align: isRTL ? 'left' : 'right' });

  // Section: Client Information
  yPos += 15;
  doc.setFillColor(...colors.primary);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  doc.setTextColor(...colors.background);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t.clientInformation, isRTL ? pageWidth - margin - 5 : margin + 5, yPos + 5.5);

  doc.setFont('helvetica', 'normal');
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
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, isRTL ? pageWidth - margin - 5 : margin + 5, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, isRTL ? pageWidth - margin - 60 : margin + 60, yPos);
    yPos += 7;
  });

  // Section: Vehicle Details
  yPos += 5;
  doc.setFillColor(...colors.primary);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  doc.setTextColor(...colors.background);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t.vehicleDetails, isRTL ? pageWidth - margin - 5 : margin + 5, yPos + 5.5);

  doc.setFont('helvetica', 'normal');
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
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, isRTL ? pageWidth - margin - 5 : margin + 5, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, isRTL ? pageWidth - margin - 60 : margin + 60, yPos);
    yPos += 7;
  });

  // Section: Payment Information
  yPos += 5;
  doc.setFillColor(...colors.primary);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  doc.setTextColor(...colors.background);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t.paymentInformation, isRTL ? pageWidth - margin - 5 : margin + 5, yPos + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.text);
  doc.setFontSize(10);
  yPos += 15;

  const paymentData = [
    [t.paymentMethod, data.paymentMethod || 'N/A'],
    [t.amount, data.amountPaid || 'N/A'],
    [t.trackingCode, data.trackingCode || 'N/A'],
  ];

  paymentData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, isRTL ? pageWidth - margin - 5 : margin + 5, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, isRTL ? pageWidth - margin - 60 : margin + 60, yPos);
    yPos += 7;
  });

  // Certification Text
  yPos += 10;
  doc.setFontSize(9);
  doc.setTextColor(...colors.textSecondary);
  const splitText = doc.splitTextToSize(t.certificationText, pageWidth - 2 * margin - 10);
  doc.text(splitText, isRTL ? pageWidth - margin - 5 : margin + 5, yPos, { align: isRTL ? 'right' : 'left', maxWidth: pageWidth - 2 * margin - 10 });

  // Signature Section
  yPos = pageHeight - 50;
  doc.setDrawColor(...colors.border);
  doc.line(pageWidth - margin - 60, yPos, pageWidth - margin - 5, yPos);
  doc.setFontSize(9);
  doc.setTextColor(...colors.text);
  doc.text(t.signature, pageWidth - margin - 32.5, yPos + 5, { align: 'center' });

  // Footer
  yPos = pageHeight - 25;
  doc.setFillColor(...colors.headerBg);
  doc.rect(0, yPos, pageWidth, 25, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textSecondary);
  doc.text(company.address, pageWidth / 2, yPos + 8, { align: 'center' });
  doc.text(`${company.phone} | ${company.email}`, pageWidth / 2, yPos + 13, { align: 'center' });
  doc.text(t.digitalSignature, pageWidth / 2, yPos + 18, { align: 'center' });

  return doc;
}

/**
 * Generate Invoice
 */
export function generateInvoice(data, language = 'en', theme = 'light') {
  const doc = new jsPDF();
  const t = PDF_TRANSLATIONS[language];
  const company = COMPANY_INFO[language];
  const colors = THEMES[theme];
  const isRTL = language === 'ar';
  
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPos = 20;

  if (isRTL) {
    doc.setR2L(true);
  }

  // Header
  doc.setFillColor(...colors.headerBg);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Logo
  doc.setFillColor(...colors.primary);
  doc.circle(margin + 8, 22, 8, 'F');
  doc.setTextColor(...colors.background);
  doc.setFontSize(10);
  doc.text('DC', margin + 8, 24, { align: 'center' });

  // Company Info
  doc.setTextColor(...colors.text);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, isRTL ? pageWidth - margin : margin + 25, 18);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  doc.text(company.address, isRTL ? pageWidth - margin : margin + 25, 25);
  doc.text(company.city, isRTL ? pageWidth - margin : margin + 25, 30);
  doc.text(`${company.phone} | ${company.email}`, isRTL ? pageWidth - margin : margin + 25, 35);

  // Invoice Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text(t.invoiceTitle, isRTL ? margin : pageWidth - margin, 25, { align: isRTL ? 'left' : 'right' });

  // Invoice Details
  yPos = 55;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.text);
  
  const invoiceNumber = data.invoiceNumber || `INV-${Date.now().toString().slice(-8)}`;
  const invoiceDate = data.invoiceDate || new Date().toLocaleDateString();
  const dueDate = data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

  doc.setFont('helvetica', 'bold');
  doc.text(`${t.invoiceNumber}:`, isRTL ? margin : pageWidth - margin - 60, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceNumber, isRTL ? margin + 35 : pageWidth - margin, yPos, { align: isRTL ? 'left' : 'right' });
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.invoiceDate}:`, isRTL ? margin : pageWidth - margin - 60, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceDate, isRTL ? margin + 35 : pageWidth - margin, yPos, { align: isRTL ? 'left' : 'right' });
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.dueDate}:`, isRTL ? margin : pageWidth - margin - 60, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(dueDate, isRTL ? margin + 35 : pageWidth - margin, yPos, { align: isRTL ? 'left' : 'right' });

  // Bill To Section
  yPos += 15;
  doc.setFillColor(...colors.primary);
  doc.rect(margin, yPos, 80, 8, 'F');
  doc.setTextColor(...colors.background);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(t.billTo, margin + 5, yPos + 5.5);

  yPos += 12;
  doc.setTextColor(...colors.text);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(data.clientName || 'N/A', margin + 5, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  yPos += 5;
  doc.text(data.clientEmail || '', margin + 5, yPos);
  yPos += 5;
  doc.text(data.clientPhone || '', margin + 5, yPos);
  yPos += 5;
  doc.text(data.clientAddress || '', margin + 5, yPos);

  // Items Table
  yPos += 15;
  const tableData = [
    [
      `${data.carBrand || ''} ${data.carModel || ''} (${data.carYear || ''})`,
      '1',
      data.carPrice || '0',
      data.carPrice || '0'
    ]
  ];

  doc.autoTable({
    startY: yPos,
    head: [[t.description, t.quantity, t.unitPrice, t.total]],
    body: tableData,
    theme: theme === 'dark' ? 'grid' : 'striped',
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
      fillColor: theme === 'dark' ? [31, 41, 55] : [249, 250, 251],
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
  
  doc.setFont('helvetica', 'normal');
  doc.text(t.subtotal, totalsX, yPos);
  doc.text(`$${subtotal.toLocaleString()}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 7;
  doc.text(t.tax, totalsX, yPos);
  doc.text(`$${tax.toLocaleString()}`, pageWidth - margin, yPos, { align: 'right' });
  
  if (discount > 0) {
    yPos += 7;
    doc.text(t.discount, totalsX, yPos);
    doc.text(`-$${discount.toLocaleString()}`, pageWidth - margin, yPos, { align: 'right' });
  }
  
  yPos += 10;
  doc.setFillColor(...colors.primary);
  doc.rect(totalsX - 5, yPos - 6, pageWidth - totalsX - margin + 5, 10, 'F');
  doc.setTextColor(...colors.background);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(t.grandTotal, totalsX, yPos);
  doc.text(`$${grandTotal.toLocaleString()}`, pageWidth - margin, yPos, { align: 'right' });

  // Payment Status
  yPos += 15;
  doc.setTextColor(...colors.text);
  doc.setFontSize(10);
  doc.text(`${t.paymentStatus}:`, margin, yPos);
  
  const isPaid = data.paymentStatus === 'paid';
  doc.setFillColor(...(isPaid ? colors.success : [234, 179, 8]));
  doc.rect(margin + 40, yPos - 5, 30, 8, 'F');
  doc.setTextColor(...colors.background);
  doc.setFont('helvetica', 'bold');
  doc.text(isPaid ? t.paid : t.pending, margin + 55, yPos, { align: 'center' });

  // Footer
  yPos = pageHeight - 40;
  doc.setDrawColor(...colors.border);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.text);
  doc.text(t.notes, margin, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textSecondary);
  doc.text(t.invoiceNotes, margin, yPos);

  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...colors.text);
  doc.text(t.termsConditions, margin, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textSecondary);
  doc.text(t.termsText, margin, yPos);

  return doc;
}

/**
 * Generate Tracking Document
 */
export function generateTrackingDocument(data, language = 'en', theme = 'light') {
  const doc = new jsPDF();
  const t = PDF_TRANSLATIONS[language];
  const company = COMPANY_INFO[language];
  const colors = THEMES[theme];
  const isRTL = language === 'ar';
  
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPos = 20;

  if (isRTL) {
    doc.setR2L(true);
  }

  // Header
  doc.setFillColor(...colors.headerBg);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setFillColor(...colors.primary);
  doc.circle(pageWidth / 2, 25, 8, 'F');
  doc.setTextColor(...colors.background);
  doc.setFontSize(10);
  doc.text('DC', pageWidth / 2, 27, { align: 'center' });

  doc.setTextColor(...colors.text);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  yPos = 60;
  doc.text(company.name, pageWidth / 2, yPos, { align: 'center' });

  doc.setFontSize(18);
  doc.setTextColor(...colors.primary);
  yPos += 12;
  doc.text(t.trackingTitle, pageWidth / 2, yPos, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(...colors.textSecondary);
  yPos += 7;
  doc.text(t.trackingSubtitle, pageWidth / 2, yPos, { align: 'center' });

  // Tracking Code (Highlighted)
  yPos += 15;
  doc.setFillColor(...colors.primary);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 15, 3, 3, 'F');
  doc.setTextColor(...colors.background);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.trackingCode}: ${data.trackingCode || 'N/A'}`, pageWidth / 2, yPos + 10, { align: 'center' });

  // Client and Vehicle Info
  yPos += 25;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.text);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.fullName}:`, margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.clientName || 'N/A', margin + 40, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.model}:`, pageWidth - margin - 80, yPos);
  doc.setFont('helvetica', 'normal');
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
  
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.currentLocation}:`, margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.primary);
  doc.text(data.currentLocation || 'N/A', margin + 50, yPos);
  
  doc.setTextColor(...colors.text);
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.estimatedDelivery}:`, pageWidth - margin - 100, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.success);
  doc.text(data.estimatedDelivery || 'N/A', pageWidth - margin, yPos, { align: 'right' });

  // Itinerary Table
  yPos += 15;
  const stations = data.stations || [
    { name: 'Origin Station', status: 'completed', timestamp: '2024-10-15 09:00' },
    { name: 'Transit Hub 1', status: 'completed', timestamp: '2024-10-16 14:30' },
    { name: 'Regional Center', status: 'inProgress', timestamp: '2024-10-18 10:00' },
    { name: 'Final Destination', status: 'pending', timestamp: 'Pending' },
  ];

  const stationsData = stations.map(station => [
    station.name,
    station.status === 'completed' ? t.completed : station.status === 'inProgress' ? t.inProgress : t.pending,
    station.timestamp
  ]);

  doc.autoTable({
    startY: yPos,
    head: [[t.station, t.status, t.timestamp]],
    body: stationsData,
    theme: theme === 'dark' ? 'grid' : 'striped',
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
      fillColor: theme === 'dark' ? [31, 41, 55] : [249, 250, 251],
    },
    margin: { left: margin, right: margin },
    didParseCell: function(data) {
      if (data.column.index === 1 && data.section === 'body') {
        const status = stations[data.row.index].status;
        if (status === 'completed') {
          data.cell.styles.textColor = colors.success;
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'inProgress') {
          data.cell.styles.textColor = colors.primary;
          data.cell.styles.fontStyle = 'bold';
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
  doc.text(t.contactSupport, pageWidth / 2, yPos + 8, { align: 'center' });
  doc.text(`${company.phone} | ${company.email}`, pageWidth / 2, yPos + 13, { align: 'center' });
  doc.text(company.address, pageWidth / 2, yPos + 18, { align: 'center' });
  doc.setFontSize(7);
  doc.text(t.digitalSignature, pageWidth / 2, yPos + 23, { align: 'center' });

  return doc;
}

/**
 * Download PDF
 */
export function downloadPDF(doc, filename) {
  doc.save(filename);
}

/**
 * Get PDF as Blob (for upload to Cloudinary)
 */
export function getPDFBlob(doc) {
  return doc.output('blob');
}

/**
 * Get PDF as Base64
 */
export function getPDFBase64(doc) {
  return doc.output('datauristring');
}
