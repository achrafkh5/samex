'use client';

import { useState } from 'react';
import { useLanguage } from './LanguageProvider';
import Link from 'next/link';
import FileUploader from './FileUploader';
import { carsData } from '../data/carsData';

export default function InscriptionPageContent() {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');

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
    selectedCarId: '',
    
    // Payment Info
    paymentMethod: '',
    paymentAmount: '',
    referenceNumber: '',
    
    // Documents
    idCard: null,
    driversLicense: null,
    proofOfResidence: null,
    paymentProof: null,
    
    // Terms
    acceptTerms: false,
    signature: ''
  });

  const [errors, setErrors] = useState({});

  const totalSteps = 4;

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
      // Car Selection validation
      if (!formData.selectedCarId) newErrors.selectedCarId = t('required');
    }

    if (step === 3) {
      // Payment Info validation
      if (!formData.paymentMethod) newErrors.paymentMethod = t('required');
      if (!formData.paymentAmount.trim()) newErrors.paymentAmount = t('required');
    }

    if (step === 4) {
      // Documents and Terms validation
      if (!formData.idCard) newErrors.idCard = t('required');
      if (!formData.driversLicense) newErrors.driversLicense = t('required');
      if (!formData.acceptTerms) newErrors.acceptTerms = t('required');
      if (!formData.signature.trim()) newErrors.signature = t('required');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate tracking code
      const code = `DC${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setTrackingCode(code);
      
      console.log('Registration submitted:', formData);
      
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Submit error:', error);
      setErrors({ submit: t('registrationError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCar = formData.selectedCarId 
    ? carsData.find(car => car.id === parseInt(formData.selectedCarId))
    : null;

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
                {t('certificateGenerated')}
              </p>

              {/* Tracking Code */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-8 border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('trackingCode')}
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                  {trackingCode}
                </p>
              </div>

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
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>{t('downloadCertificate')}</span>
                </button>
                <Link href="/" className="flex-1">
                  <button className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold transition-all">
                    {t('backToHome')}
                  </button>
                </Link>
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
                        <option value="">{t('preferNotToSay')}</option>
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

              {/* Step 2: Car Selection */}
              {currentStep === 2 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {t('carSelection')}
                  </h2>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('selectCar')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="selectedCarId"
                      value={formData.selectedCarId}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border ${
                        errors.selectedCarId ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                      } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">{t('selectCar')}</option>
                      {carsData.map(car => (
                        <option key={car.id} value={car.id}>
                          {car.brand} {car.model} {car.year} - ${car.price.toLocaleString()}
                        </option>
                      ))}
                    </select>
                    {errors.selectedCarId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.selectedCarId}</p>}
                  </div>

                  {selectedCar && (
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        {t('selectedCar')}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
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
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t('carPrice')}</p>
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            ${selectedCar.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
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

                  {/* Payment Method */}
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
                      <option value="">{t('paymentMethod')}</option>
                      <option value="cash">{t('cash')}</option>
                      <option value="bankTransfer">{t('bankTransfer')}</option>
                      <option value="creditCard">{t('creditCard')}</option>
                      <option value="financing">{t('financing')}</option>
                    </select>
                    {errors.paymentMethod && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.paymentMethod}</p>}
                  </div>

                  {/* Payment Amount and Reference */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('paymentAmount')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="paymentAmount"
                        value={formData.paymentAmount}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border ${
                          errors.paymentAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                        } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="$5,000"
                      />
                      {errors.paymentAmount && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.paymentAmount}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('referenceNumber')}
                      </label>
                      <input
                        type="text"
                        name="referenceNumber"
                        value={formData.referenceNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="REF123456"
                      />
                    </div>
                  </div>

                  {selectedCar && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('carPrice')}</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${selectedCar.price.toLocaleString()}
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

                    {/* Digital Signature */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('signature')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="signature"
                        value={formData.signature}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border ${
                          errors.signature ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                        } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-cursive text-2xl`}
                        placeholder={t('typeYourName')}
                        style={{ fontFamily: 'cursive' }}
                      />
                      {errors.signature && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.signature}</p>}
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {t('typeYourName')}
                      </p>
                    </div>
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
