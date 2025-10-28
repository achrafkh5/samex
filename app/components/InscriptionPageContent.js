'use client';

import { useState ,useEffect} from 'react';
import { useLanguage } from './LanguageProvider';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import FileUploader from './FileUploader';
import jsPDF from 'jspdf';

export default function InscriptionPageContent({ id }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [certificateUrl, setCertificateUrl] = useState(null);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    nationalId: '',
    streetAddress: '',
    city: '',
    country: '',
    zipCode: '',
    
    // Car Selection
    selectedCarId: id || '',
    
    // Payment Info
    paymentMethod: '',
    paymentAmount: '',
    
    // Documents
    idCard: null,
    driversLicense: null,
    proofOfResidence: null,
    paymentProof: null,
    
    // Terms
    acceptTerms: false
  });

  const [errors, setErrors] = useState({});
  
  const totalSteps = 4;

  // Function to generate inscription PDF certificate as Blob
  const generateCertificatePDFBlob = async (certNumber, clientId, orderId) => {
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPos = 20;

    // Add logo
    try {
      const logoImg = new window.Image();
      logoImg.src = '/logo.png';
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
      });
      doc.addImage(logoImg, 'PNG', margin, yPos, 40, 20);
    } catch (error) {
      console.log('Logo not loaded:', error);
    }

    // Header with gradient background simulation
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Document Title in French
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    yPos = 35;
    doc.text('CERTIFICAT D\'INSCRIPTION', pageWidth / 2, yPos, { align: 'center' });

    // Subtitle
    doc.setFontSize(12);
    yPos += 8;
    doc.text('Confirmation de réservation de véhicule', pageWidth / 2, yPos, { align: 'center' });

    // Certificate Info
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    yPos = 60;
    doc.text(`Numéro de certificat: ${certNumber}`, margin, yPos);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin, yPos, { align: 'right' });

    // Client Information Section
    yPos += 15;
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS CLIENT', margin + 5, yPos + 7);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    yPos += 20;

    const clientInfo = [
      ['Nom complet:', formData.fullName],
      ['Email:', formData.email],
      ['Téléphone:', formData.phone],
      ['Date de naissance:', formData.dateOfBirth],
      ['Nationalité:', formData.nationality],
      ['N° ID National:', formData.nationalId],
      ['Adresse:', formData.streetAddress],
      ['Ville:', formData.city],
      ['Pays:', formData.country],
      ['Code postal:', formData.zipCode || 'N/A'],
    ];

    clientInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value || 'N/A', margin + 60, yPos);
      yPos += 8;
    });

    // Vehicle Details Section
    if (selectedCar) {
      yPos += 10;
      doc.setFillColor(37, 99, 235);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('DÉTAILS DU VÉHICULE', margin + 5, yPos + 7);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      yPos += 20;

      const vehicleInfo = [
        ['Marque:', selectedCar.brand],
        ['Modèle:', selectedCar.model],
        ['Année:', selectedCar.year?.toString()],
        ['Couleur:', selectedCar.specs?.colors?.join(', ') || selectedCar.specs?.color || 'N/A'],
        ['Type de carburant:', selectedCar.fuelType],
        ['Transmission:', selectedCar.transmission],
        ['N° VIN:', selectedCar.vin || 'N/A'],
        ['Prix:', `${selectedCar.price?.toLocaleString()} DZD`],
      ];

      vehicleInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin + 5, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value || 'N/A', margin + 60, yPos);
        yPos += 8;
      });
    }

    // Payment Information Section
    yPos += 10;
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS DE PAIEMENT', margin + 5, yPos + 7);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    yPos += 20;

    const paymentInfo = [
      ['Méthode de paiement:', formData.paymentMethod],
      ['Montant:', `${formData.paymentAmount || selectedCar?.price?.toLocaleString()} DZD`],
      ['Statut:', 'En attente'],
    ];

    paymentInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value || 'N/A', margin + 60, yPos);
      yPos += 8;
    });

    // Footer
    yPos = pageHeight - 30;
    doc.setFillColor(240, 240, 240);
    doc.rect(0, yPos, pageWidth, 30, 'F');
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    yPos += 10;
    doc.text('Ce document certifie l\'inscription et la réservation du véhicule mentionné ci-dessus.', pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    doc.text('Pour toute question, veuillez nous contacter à contact@samex.com', pageWidth / 2, yPos, { align: 'center' });

    // Signature placeholder
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('_____________________', pageWidth - margin - 40, yPos);
    yPos += 5;
    doc.text('Signature autorisée', pageWidth - margin - 40, yPos);

    // Return PDF as Blob
    return doc.output('blob');
  };

  // Function to upload certificate PDF to Cloudinary
  const uploadCertificateToCloudinary = async (pdfBlob, certNumber) => {
    try {
      const formData = new FormData();
      const fileName = `Inscription_${certNumber}_${Date.now()}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      formData.append('file', file);
      formData.append('folder', 'certificates/inscriptions');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload certificate to Cloudinary');
      }

      const data = await response.json();
      return {
        url: data.url,
        publicId: data.public_id,
        resourceType: data.resource_type
      };
    } catch (error) {
      console.error('Certificate upload error:', error);
      throw error;
    }
  };

  // Function to save document record to database
  const saveDocumentToDatabase = async (docData) => {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docData),
      });

      if (!response.ok) {
        throw new Error('Failed to save document to database');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Document save error:', error);
      throw error;
    }
  };

  // Function to download certificate from URL
  const downloadCertificate = () => {
    if (certificateUrl) {
      window.open(certificateUrl, '_blank');
    }
  };

  // Function to generate inscription PDF in French (for direct download)
  const generateInscriptionPDF = async () => {
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPos = 20;

    // Add logo
    try {
      const logoImg = new window.Image();
      logoImg.src = '/logo.png';
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
      });
      // Add logo at top left
      doc.addImage(logoImg, 'PNG', margin, yPos, 40, 20);
    } catch (error) {
      console.log('Logo not loaded:', error);
    }

    // Header with gradient background simulation
    doc.setFillColor(37, 99, 235); // Blue
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Document Title in French
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    yPos = 35;
    doc.text('CERTIFICAT D\'INSCRIPTION', pageWidth / 2, yPos, { align: 'center' });

    // Subtitle
    doc.setFontSize(12);
    yPos += 8;
    doc.text('Confirmation de réservation de véhicule', pageWidth / 2, yPos, { align: 'center' });

    // Certificate Info
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    yPos = 60;
    const certNumber = `CERT-${Date.now().toString().slice(-8)}`;
    doc.text(`Numéro de certificat: ${certNumber}`, margin, yPos);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin, yPos, { align: 'right' });

    // Client Information Section
    yPos += 15;
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS CLIENT', margin + 5, yPos + 7);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    yPos += 20;

    const clientInfo = [
      ['Nom complet:', formData.fullName],
      ['Email:', formData.email],
      ['Téléphone:', formData.phone],
      ['Date de naissance:', formData.dateOfBirth],
      ['Nationalité:', formData.nationality],
      ['N° ID National:', formData.nationalId],
      ['Adresse:', formData.streetAddress],
      ['Ville:', formData.city],
      ['Pays:', formData.country],
      ['Code postal:', formData.zipCode || 'N/A'],
    ];

    clientInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value || 'N/A', margin + 60, yPos);
      yPos += 8;
    });

    // Vehicle Details Section
    if (selectedCar) {
      yPos += 10;
      doc.setFillColor(37, 99, 235);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('DÉTAILS DU VÉHICULE', margin + 5, yPos + 7);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      yPos += 20;

      const vehicleInfo = [
        ['Marque:', selectedCar.brand],
        ['Modèle:', selectedCar.model],
        ['Année:', selectedCar.year?.toString()],
        ['Couleur:', selectedCar.specs?.colors?.join(', ') || selectedCar.specs?.color || 'N/A'],
        ['Type de carburant:', selectedCar.fuelType],
        ['Transmission:', selectedCar.transmission],
        ['N° VIN:', selectedCar.vin || 'N/A'],
        ['Prix:', `${selectedCar.price?.toLocaleString()} DZD`],
      ];

      vehicleInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin + 5, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value || 'N/A', margin + 60, yPos);
        yPos += 8;
      });
    }

    // Payment Information Section
    yPos += 10;
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS DE PAIEMENT', margin + 5, yPos + 7);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    yPos += 20;

    const paymentInfo = [
      ['Méthode de paiement:', formData.paymentMethod],
      ['Montant:', `${formData.paymentAmount || selectedCar?.price?.toLocaleString()} DZD`],
      ['Statut:', 'En attente'],
    ];

    paymentInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value || 'N/A', margin + 60, yPos);
      yPos += 8;
    });

    // Footer
    yPos = pageHeight - 30;
    doc.setFillColor(240, 240, 240);
    doc.rect(0, yPos, pageWidth, 30, 'F');
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    yPos += 10;
    doc.text('Ce document certifie l\'inscription et la réservation du véhicule mentionné ci-dessus.', pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    doc.text('Pour toute question, veuillez nous contacter à contact@samex.com', pageWidth / 2, yPos, { align: 'center' });

    // Signature placeholder
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('_____________________', pageWidth - margin - 40, yPos);
    yPos += 5;
    doc.text('Signature autorisée', pageWidth - margin - 40, yPos);

    // Download the PDF
    doc.save(`Inscription_${certNumber}_${formData.fullName.replace(/\s+/g, '_')}.pdf`);
  };

  useEffect(() => {
    const fetchCarOptions = async () => {
      const res = await fetch(`/api/cars/${id}`);
      const data = await res.json();
      setSelectedCar(data);
    };

    fetchCarOptions();
  }, [id]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const res = await fetch('/api/payments');
      const data = await res.json();
      const enabledMethods = data.filter(method => method.enabled === true);
      setPaymentMethods(enabledMethods);
      setFormData(prev => ({
        ...prev,
        paymentMethod: enabledMethods.length > 0 ? enabledMethods[0].name : ''
      }));
    };
    
    fetchPaymentMethods();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (name, file) => {
    setFormData(prev => ({ ...prev, [name]: file }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      // Personal Info validation
      if (!formData.fullName.trim()) newErrors.fullName = t('required');
      if (!formData.email.trim()) {
        newErrors.email = t('required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = t('invalidEmail');
      }
      if (!formData.phone.trim()) {
        newErrors.phone = t('required');
      } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
        newErrors.phone = t('invalidPhone');
      }
      if (!formData.dateOfBirth) newErrors.dateOfBirth = t('required');
      if (!formData.nationality.trim()) newErrors.nationality = t('required');
      if (!formData.nationalId.trim()) newErrors.nationalId = t('required');
      if (!formData.streetAddress.trim()) newErrors.streetAddress = t('required');
      if (!formData.city.trim()) newErrors.city = t('required');
      if (!formData.country.trim()) newErrors.country = t('required');
    }

    if (step === 2) {

    }

    if (step === 3) {
      // Payment Info validation
      formData.paymentAmount = selectedCar ? selectedCar.price.toString() : '';
      if (!formData.paymentMethod) newErrors.paymentMethod = t('required');
      if (!formData.paymentAmount.trim()) newErrors.paymentAmount = t('required');
    }

    if (step === 4) {
      // Documents and Terms validation
      if (!formData.idCard) newErrors.idCard = t('required');
      if (!formData.driversLicense) newErrors.driversLicense = t('required');
      if (!formData.acceptTerms) newErrors.acceptTerms = t('required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const uploadFileToCloudinary = async (file, folder = 'documents') => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload all documents to Cloudinary
      console.log('Uploading documents to Cloudinary...');
      const [idCardUrl, driversLicenseUrl, proofOfResidenceUrl, paymentProofUrl] = await Promise.all([
        uploadFileToCloudinary(formData.idCard, 'clients/id-cards'),
        uploadFileToCloudinary(formData.driversLicense, 'clients/licenses'),
        uploadFileToCloudinary(formData.proofOfResidence, 'clients/residence'),
        uploadFileToCloudinary(formData.paymentProof, 'clients/payments'),
      ]);

      console.log('Documents uploaded successfully');

      // Step 2: Create client with personal information only
      const clientData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        nationality: formData.nationality,
        nationalId: formData.nationalId,
        streetAddress: formData.streetAddress,
        city: formData.city,
        country: formData.country,
        zipCode: formData.zipCode,
        userId: user?._id || user?.id,
      };

      const clientResponse = await fetch(`/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (!clientResponse.ok) {
        throw new Error('Failed to create client');
      }

      const clientResult = await clientResponse.json();
      const clientId = clientResult.id;

      console.log('Client created:', clientResult);

    
      // Step 3: Create order with car, payment, document URLs, and tracking info
      const orderData = {
        clientId: clientId,
        trackingCode: "",
        selectedCarId: formData.selectedCarId,
        paymentMethod: formData.paymentMethod,
        paymentAmount: formData.paymentAmount,
        idCardUrl: idCardUrl,
        driversLicenseUrl: driversLicenseUrl,
        proofOfResidenceUrl: proofOfResidenceUrl,
        paymentProofUrl: paymentProofUrl,
        acceptTerms: formData.acceptTerms,
        status: 'pending',
        userId: user?._id || user?.id,
        createdAt: new Date().toISOString(),
      };

      const orderResponse = await fetch(`/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderResult = await orderResponse.json();
      const orderId = orderResult.orderId;

      // Step 4: Generate and upload inscription certificate
      console.log('Generating inscription certificate...');
      setUploadingCertificate(true);

      try {
        const certNumber = `CERT-${Date.now().toString().slice(-8)}`;
        
        // Generate PDF as Blob
        const pdfBlob = await generateCertificatePDFBlob(certNumber, clientId, orderId);
        
        // Upload to Cloudinary
        console.log('Uploading certificate to Cloudinary...');
        const cloudinaryData = await uploadCertificateToCloudinary(pdfBlob, certNumber);
        setCertificateUrl(cloudinaryData.url);
        
        console.log('Certificate uploaded successfully:', cloudinaryData.url);

        // Save document record to database
        console.log('Saving document record to database...');
        const documentData = {
          type: 'inscription',
          clientId: clientId,
          carId: formData.selectedCarId,
          orderId: orderId,
          userId: user?._id || user?.id,
          clientName: formData.fullName,
          url: cloudinaryData.url,
          cloudinaryPublicId: cloudinaryData.publicId,
          cloudinaryResourceType: cloudinaryData.resourceType,
        };

        await saveDocumentToDatabase(documentData);
        console.log('Document record saved successfully');

      } catch (certError) {
        console.error('Certificate generation/upload error:', certError);
        // Don't fail the entire process if certificate generation fails
        setErrors({ 
          submit: t('certificateGenerationWarning') || 'Registration successful, but certificate generation had an issue. You can download it later from your dashboard.' 
        });
      } finally {
        setUploadingCertificate(false);
      }
      
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Submit error:', error);
      setErrors({ submit: t('registrationError') || 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Success Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('registrationSuccess')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                {certificateUrl ? t('certificateGenerated') : t('registrationComplete')}
              </p>

              {/* Certificate Status */}
              {uploadingCertificate && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-center space-x-3">
                    <svg className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {t('generatingCertificate') || 'Generating your certificate...'}
                    </span>
                  </div>
                </div>
              )}

              {certificateUrl && !uploadingCertificate && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">
                      {t('certificateReady') || 'Certificate ready for download!'}
                    </span>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8 text-left">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('registrationSummary')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('fullName')}:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('email')}:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formData.email}</span>
                  </div>
                  {selectedCar && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('selectedCar')}:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {selectedCar.brand} {selectedCar.model}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('paymentMethod')}:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{t(formData.paymentMethod)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard" className="flex-1">
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>{t('myDashboard')}</span>
                  </button>
                </Link>
                
                {certificateUrl ? (
                  <button 
                    onClick={downloadCertificate}
                    disabled={uploadingCertificate}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                      uploadingCertificate 
                        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>{t('downloadCertificate')}</span>
                  </button>
                ) : (
                  <button 
                    onClick={generateInscriptionPDF}
                    disabled={uploadingCertificate}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                      uploadingCertificate
                        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>{t('downloadCertificate')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
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
            <span className="text-white font-medium">{t('clientRegistration')}</span>
          </nav>

          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('clientRegistration')}
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              {t('registrationDescription')}
            </p>

            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      step === currentStep
                        ? 'bg-white text-blue-600'
                        : step < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {step < currentStep ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  {step < 4 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        step < currentStep ? 'bg-green-500' : 'bg-white/20'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {t('personalInfo')}
                  </h2>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('fullName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                      } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="John Doe"
                    />
                    {errors.fullName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>}
                  </div>

                  {/* Email and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('email')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border ${
                          errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                        } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('phone')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border ${
                          errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                        } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="+1 (555) 123-4567"
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Date of Birth and Gender */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('dateOfBirth')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border ${
                          errors.dateOfBirth ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                        } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dateOfBirth}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('gender')}
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">{t('selectGender')}</option>
                        <option value="male">{t('male')}</option>
                        <option value="female">{t('female')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Nationality and National ID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('nationality')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border ${
                          errors.nationality ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                        } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="United States"
                      />
                      {errors.nationality && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nationality}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('nationalId')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nationalId"
                        value={formData.nationalId}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border ${
                          errors.nationalId ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                        } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="ABC123456"
                      />
                      {errors.nationalId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nationalId}</p>}
                    </div>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('streetAddress')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="streetAddress"
                      value={formData.streetAddress}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border ${
                        errors.streetAddress ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                      } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="123 Main Street"
                    />
                    {errors.streetAddress && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.streetAddress}</p>}
                  </div>

                  {/* City, Country, ZIP */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('city')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border ${
                          errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                        } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="New York"
                      />
                      {errors.city && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('country')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border ${
                          errors.country ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                        } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="USA"
                      />
                      {errors.country && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.country}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('zipCode')}
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Car Confirmation */}
              {currentStep === 2 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {t('carSelection')}
                  </h2>

                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {t('confirmYourSelection')}
                  </p>

                  {selectedCar ? (
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      {/* Car Image */}
                      {selectedCar.image && (
                        <div className="mb-6 rounded-lg overflow-hidden relative h-64">
                          <Image 
                            src={selectedCar.image} 
                            alt={`${selectedCar.brand} ${selectedCar.model}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        {selectedCar.brand} {selectedCar.model} {selectedCar.year}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t('brand')}</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedCar.brand}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t('model')}</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedCar.model}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t('year')}</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedCar.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t('mileage')}</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {selectedCar.mileage?.toLocaleString() || 'N/A'} km
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t('transmission')}</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {selectedCar.transmission || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t('fuelType')}</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {selectedCar.fuelType || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-blue-200 dark:border-blue-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('carPrice')}</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {selectedCar.price?.toLocaleString()} DZD
                        </p>
                      </div>

                      {/* Success indicator */}
                      <div className="mt-6 flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">{t('carConfirmed')}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                      <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-red-600 dark:text-red-400 font-semibold">
                        {t('carNotFound')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {t('pleaseSelectCarFromCatalog')}
                      </p>
                      <Link href="/cars" className="mt-4 inline-block">
                        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                          {t('browseCars')}
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Payment Information */}
              {currentStep === 3 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {t('paymentInfo')}
                  </h2>

                  <div>
  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
    {t('paymentMethod')} <span className="text-red-500">*</span>
  </label>

  <select
    name="paymentMethod"
    value={formData.paymentMethod}
    onChange={handleChange}
    className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border ${
      errors.paymentMethod ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
    } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
  >
    <option value="">{t('select_payment_method')}</option>
    {paymentMethods?.length ? (
      paymentMethods.map((method) => (
        <option key={method._id} value={method.name}>
          {t(method.name) || method.name}
        </option>
      ))
    ) : (
      <option disabled>{t('loading')}</option>
    )}
  </select>

  {errors.paymentMethod && (
    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
      {errors.paymentMethod}
    </p>
  )}
</div>


                  {selectedCar && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('carPrice')}</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedCar.price.toLocaleString()} DZD
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Documents and Terms */}
              {currentStep === 4 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {t('documentUpload')}
                  </h2>

                  <div className="space-y-6">
                    {/* ID Card */}
                    <FileUploader
                      label={t('idCard')}
                      name="idCard"
                      onChange={(file) => handleFileChange('idCard', file)}
                      error={errors.idCard}
                      required={true}
                    />

                    {/* Driver's License */}
                    <FileUploader
                      label={t('driversLicense')}
                      name="driversLicense"
                      onChange={(file) => handleFileChange('driversLicense', file)}
                      error={errors.driversLicense}
                      required={true}
                    />

                    {/* Proof of Residence */}
                    <FileUploader
                      label={t('proofOfResidence')}
                      name="proofOfResidence"
                      onChange={(file) => handleFileChange('proofOfResidence', file)}
                      error={errors.proofOfResidence}
                      required={false}
                    />

                    {/* Payment Proof */}
                    <FileUploader
                      label={t('paymentProof')}
                      name="paymentProof"
                      onChange={(file) => handleFileChange('paymentProof', file)}
                      error={errors.paymentProof}
                      required={false}
                    />
                  </div>

                  {/* Terms and Signature */}
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t('termsAndConditions')}
                    </h3>

                    {/* Terms Checkbox */}
                    <div className={`flex items-start space-x-3 p-4 rounded-xl ${
                      errors.acceptTerms ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800'
                    }`}>
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="text-sm text-gray-700 dark:text-gray-300">
                        {t('acceptTerms')} <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.acceptTerms && <p className="text-sm text-red-600 dark:text-red-400">{errors.acceptTerms}</p>}

                  </div>

                  {errors.submit && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                      <p className="text-red-600 dark:text-red-400 text-center">{errors.submit}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold transition-all flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>{t('previous')}</span>
                  </button>
                )}

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="ml-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <span>{t('next')}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`ml-auto px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 ${
                      isSubmitting
                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{t('processing')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('confirmRegistration')}</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
