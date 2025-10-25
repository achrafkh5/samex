'use client';

import { useContext, useEffect, useState } from 'react';
import { useLanguage } from '../components/LanguageProvider';
import Link from 'next/link';

export default function TermsContent() {
  const t = useLanguage();
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const isRTL = t.language === 'ar';

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      // Update active section based on scroll position
      const sections = [
        'introduction',
        'definitions',
        'user-obligations',
        'orders-payments',
        'delivery-tracking',
        'documents-files',
        'liability-disclaimer',
        'privacy-data',
        'governing-law',
        'changes-terms',
        'contact'
      ];
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(!termsAccepted);
    // Store acceptance in localStorage for use in registration
    if (typeof window !== 'undefined') {
      localStorage.setItem('termsAccepted', JSON.stringify({
        accepted: !termsAccepted,
        timestamp: new Date().toISOString()
      }));
    }
  };

  const sections = [
    { id: 'introduction', title: t?.terms?.introduction || 'Introduction', icon: '📋' },
    { id: 'definitions', title: t?.terms?.definitions || 'Definitions', icon: '📖' },
    { id: 'user-obligations', title: t?.terms?.userObligations || 'User Obligations', icon: '✅' },
    { id: 'orders-payments', title: t?.terms?.ordersPayments || 'Orders & Payments', icon: '💳' },
    { id: 'delivery-tracking', title: t?.terms?.deliveryTracking || 'Delivery & Tracking', icon: '🚚' },
    { id: 'documents-files', title: t?.terms?.documentsFiles || 'Documents & Files', icon: '📁' },
    { id: 'liability-disclaimer', title: t?.terms?.liabilityDisclaimer || 'Liability & Disclaimer', icon: '⚠️' },
    { id: 'privacy-data', title: t?.terms?.privacyData || 'Privacy & Data Protection', icon: '🔒' },
    { id: 'governing-law', title: t?.terms?.governingLaw || 'Governing Law', icon: '⚖️' },
    { id: 'changes-terms', title: t?.terms?.changesTerms || 'Changes to Terms', icon: '🔄' },
    { id: 'contact', title: t?.terms?.contactUs || 'Contact Us', icon: '📧' },
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-800 dark:from-indigo-900 dark:to-gray-900 text-white py-20 print:bg-white print:text-black print:py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6 print:hidden">📜</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 print:text-3xl print:text-black">
              {t?.termsAndConditions || 'Terms & Conditions'}
            </h1>
            <p className="text-xl text-indigo-100 mb-4 print:text-gray-700">
              {t?.terms?.subtitle || 'Please read these terms carefully before using our services.'}
            </p>
            <p className="text-indigo-200 print:text-gray-600">
              {t?.terms?.effectiveDate || 'Effective Date'}: {t?.terms?.effectiveDateValue || 'January 1, 2024'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-4">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <span>🖨️</span>
                <span>{t?.terms?.printTerms || 'Print Terms'}</span>
              </button>
            </div>
            
            {/* Accept Terms Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={handleAcceptTerms}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {t?.terms?.acceptTerms || 'I accept these Terms & Conditions'}
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 print:py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Table of Contents - Sidebar */}
            <div className="lg:w-1/4 print:hidden">
              <div className="lg:sticky lg:top-24">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    📑 {t?.terms?.tableOfContents || 'Table of Contents'}
                  </h3>
                  <nav className="space-y-2">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                          activeSection === section.id
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className={`${isRTL ? 'ml-2' : 'mr-2'}`}>{section.icon}</span>
                        {section.title}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 print:shadow-none print:border-0">
                
                {/* 1. Introduction */}
                <section id="introduction" className="p-8 border-b border-gray-200 dark:border-gray-700 print:break-inside-avoid">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl print:text-2xl">📋</div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white print:text-2xl">
                      1. {t?.terms?.introduction || 'Introduction'}
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {t?.terms?.purposeTitle || 'Purpose of Terms'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      {t?.terms?.purposeText1 || 'These Terms and Conditions ("Terms") govern your use of the ALKO Cars website and services. By accessing or using our platform, you agree to be bound by these Terms.'}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      {t?.terms?.purposeText2 || 'If you do not agree with any part of these Terms, you must not use our services.'}
                    </p>
                    
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                      {t?.terms?.scopeTitle || 'Scope'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {t?.terms?.scopeText || 'These Terms apply to all users of the website, including clients, browsers, and any other parties accessing our services.'}
                    </p>
                  </div>
                </section>

                {/* 2. Definitions */}
                <section id="definitions" className="p-8 border-b border-gray-200 dark:border-gray-700 print:break-inside-avoid">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl print:text-2xl">📖</div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white print:text-2xl">
                      2. {t?.terms?.definitions || 'Definitions'}
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                      {t?.terms?.definitionsIntro || 'For the purposes of these Terms, the following definitions apply:'}
                    </p>
                    
                    <div className="space-y-4">
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border-l-4 border-indigo-600">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                          {t?.terms?.defAgency || '"Agency"'}
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t?.terms?.defAgencyText || 'Refers to ALKO Cars, the Korean car export and delivery agency operating this website and providing the services.'}
                        </p>
                      </div>

                      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border-l-4 border-indigo-600">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                          {t?.terms?.defClient || '"Client" or "User"'}
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t?.terms?.defClientText || 'Any person or entity that registers on the platform, places an order, or uses our services.'}
                        </p>
                      </div>

                      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border-l-4 border-indigo-600">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                          {t?.terms?.defOrder || '"Order"'}
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t?.terms?.defOrderText || 'A confirmed request to purchase and import a vehicle through our agency.'}
                        </p>
                      </div>

                      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border-l-4 border-indigo-600">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                          {t?.terms?.defTracking || '"Tracking Code" or "Itinerary"'}
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t?.terms?.defTrackingText || 'A unique identifier assigned to each order that allows clients to monitor the progress and location of their vehicle during transit.'}
                        </p>
                      </div>

                      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border-l-4 border-indigo-600">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                          {t?.terms?.defServices || '"Services"'}
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t?.terms?.defServicesText || 'All services provided by the Agency, including vehicle sourcing, purchase, shipping, customs clearance, and delivery.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 3. User Obligations */}
                <section id="user-obligations" className="p-8 border-b border-gray-200 dark:border-gray-700 print:break-inside-avoid">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl print:text-2xl">✅</div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white print:text-2xl">
                      3. {t?.terms?.userObligations || 'User Obligations'}
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                      {t?.terms?.userObligationsIntro || 'As a user of our services, you agree to:'}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold mt-1">3.1</span>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">{t?.terms?.obligation1Title || 'Accurate Information:'}</span> {t?.terms?.obligation1 || 'Provide accurate, complete, and up-to-date information during registration and throughout your use of our services.'}
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold mt-1">3.2</span>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">{t?.terms?.obligation2Title || 'Lawful Documentation:'}</span> {t?.terms?.obligation2 || 'Submit only genuine, valid, and legally obtained documents (IDs, licenses, proofs of residence, etc.).'}
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold mt-1">3.3</span>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">{t?.terms?.obligation3Title || 'Compliance:'}</span> {t?.terms?.obligation3 || 'Comply with all applicable laws and regulations in your jurisdiction regarding vehicle importation and ownership.'}
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold mt-1">3.4</span>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">{t?.terms?.obligation4Title || 'Account Security:'}</span> {t?.terms?.obligation4 || 'Maintain the confidentiality of your account credentials and notify us immediately of any unauthorized access.'}
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold mt-1">3.5</span>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">{t?.terms?.obligation5Title || 'Prohibited Activities:'}</span> {t?.terms?.obligation5 || 'Not engage in fraudulent activities, misrepresentation, or any conduct that could harm the Agency or other users.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 4. Orders & Payments */}
                <section id="orders-payments" className="p-8 border-b border-gray-200 dark:border-gray-700 print:break-inside-avoid">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl print:text-2xl">💳</div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white print:text-2xl">
                      4. {t?.terms?.ordersPayments || 'Orders & Payments'}
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="space-y-6">
                      {/* Order Confirmation */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">4.1</span>
                          <span>{t?.terms?.orderConfirmationTitle || 'Order Confirmation'}</span>
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {t?.terms?.orderConfirmation || 'When you place an order, you will receive a confirmation email with order details. The order is binding once confirmed by both parties.'}
                        </p>
                      </div>

                      {/* Payment Methods */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">4.2</span>
                          <span>{t?.terms?.paymentMethodsTitle || 'Accepted Payment Methods'}</span>
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                          {t?.terms?.paymentMethodsIntro || 'We accept the following payment methods:'}
                        </p>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                            <span>{t?.terms?.payment1 || 'Bank transfer (wire transfer)'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                            <span>{t?.terms?.payment2 || 'Credit/Debit cards (Visa, Mastercard)'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                            <span>{t?.terms?.payment3 || 'Online payment platforms (as specified)'}</span>
                          </li>
                        </ul>
                      </div>

                      {/* Payment Verification */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">4.3</span>
                          <span>{t?.terms?.paymentVerificationTitle || 'Payment Verification'}</span>
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {t?.terms?.paymentVerification || 'All payments must be verified and cleared before the order is processed. The Agency reserves the right to request additional documentation to verify payment authenticity.'}
                        </p>
                      </div>

                      {/* Refunds & Cancellations */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">4.4</span>
                          <span>{t?.terms?.refundsCancellationsTitle || 'Refunds & Cancellations'}</span>
                        </h3>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-l-4 border-yellow-600">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                            {t?.terms?.refundsPolicy || 'Cancellation and refund policies depend on the order stage:'}
                          </p>
                          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
                              <span><strong>{t?.terms?.refund1Title || 'Before Vehicle Purchase:'}</strong> {t?.terms?.refund1 || 'Full refund minus administrative fees (5-10%)'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
                              <span><strong>{t?.terms?.refund2Title || 'After Purchase, Before Shipping:'}</strong> {t?.terms?.refund2 || 'Partial refund (70-80%) after deducting purchase costs'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
                              <span><strong>{t?.terms?.refund3Title || 'During Transit:'}</strong> {t?.terms?.refund3 || 'No refund; order cannot be cancelled'}</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">4.5</span>
                          <span>{t?.terms?.pricingTitle || 'Pricing & Fees'}</span>
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {t?.terms?.pricing || 'All prices are quoted in the agreed currency and include applicable service fees. Additional costs (shipping, customs, taxes) will be itemized separately. Prices are subject to change until the order is confirmed.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 5. Delivery & Tracking */}
                <section id="delivery-tracking" className="p-8 border-b border-gray-200 dark:border-gray-700 print:break-inside-avoid">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl print:text-2xl">🚚</div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white print:text-2xl">
                      5. {t?.terms?.deliveryTracking || 'Delivery & Tracking'}
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="space-y-6">
                      {/* Tracking Code Assignment */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">5.1</span>
                          <span>{t?.terms?.trackingCodeTitle || 'Tracking Code Assignment'}</span>
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {t?.terms?.trackingCode || 'Once your vehicle is shipped, you will receive a unique tracking code via email and SMS. This code allows you to monitor the real-time location and status of your vehicle.'}
                        </p>
                      </div>

                      {/* Estimated Delivery */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">5.2</span>
                          <span>{t?.terms?.estimatedDeliveryTitle || 'Estimated Delivery Times (ETA)'}</span>
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                          {t?.terms?.estimatedDelivery || 'Delivery times are estimates and may vary based on:'}
                        </p>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                            <span>{t?.terms?.eta1 || 'Shipping route and distance'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                            <span>{t?.terms?.eta2 || 'Customs clearance processing times'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                            <span>{t?.terms?.eta3 || 'Weather conditions and force majeure events'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                            <span>{t?.terms?.eta4 || 'Port congestion and carrier schedules'}</span>
                          </li>
                        </ul>
                      </div>

                      {/* Delays */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">5.3</span>
                          <span>{t?.terms?.delaysTitle || 'Delays & Notifications'}</span>
                        </h3>
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border-l-4 border-orange-600">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {t?.terms?.delays || 'The Agency is not liable for delays caused by factors beyond our control. We will notify you promptly of any significant delays and provide updated ETAs.'}
                          </p>
                        </div>
                      </div>

                      {/* Transit Responsibilities */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">5.4</span>
                          <span>{t?.terms?.transitRespTitle || 'Responsibilities During Transit'}</span>
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {t?.terms?.transitResp || 'The Agency maintains insurance coverage for vehicles during transit. Clients must inspect the vehicle upon delivery and report any damage within 48 hours.'}
                        </p>
                      </div>

                      {/* Proof of Delivery */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">5.5</span>
                          <span>{t?.terms?.proofDeliveryTitle || 'Proof of Delivery'}</span>
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {t?.terms?.proofDelivery || 'Upon delivery, you must sign a delivery confirmation document. This signature acknowledges receipt and acceptance of the vehicle in its delivered condition.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 6. Documents & Files */}
                <section id="documents-files" className="p-8 border-b border-gray-200 dark:border-gray-700 print:break-inside-avoid">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl print:text-2xl">📁</div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white print:text-2xl">
                      6. {t?.terms?.documentsFiles || 'Documents & Files'}
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="space-y-6">
                      {/* Required Documents */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">6.1</span>
                          <span>{t?.terms?.requiredDocsTitle || 'Required Documents'}</span>
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                          {t?.terms?.requiredDocsIntro || 'Clients must upload the following documents for verification:'}
                        </p>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                            <span>{t?.terms?.doc1 || 'Government-issued photo ID (passport or national ID card)'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                            <span>{t?.terms?.doc2 || 'Valid driver\'s license'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                            <span>{t?.terms?.doc3 || 'Proof of residence (utility bill, bank statement, lease agreement)'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                            <span>{t?.terms?.doc4 || 'Payment receipts and transaction confirmations'}</span>
                          </li>
                        </ul>
                      </div>

                      {/* Document Storage */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">6.2</span>
                          <span>{t?.terms?.docStorageTitle || 'Document Storage & Security'}</span>
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {t?.terms?.docStorage || 'All uploaded documents are stored securely using encrypted cloud storage (Cloudinary). Documents are retained only for the duration necessary to complete your order and comply with legal requirements.'}
                        </p>
                      </div>

                      {/* Document Verification */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">6.3</span>
                          <span>{t?.terms?.docVerificationTitle || 'Verification & Use'}</span>
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {t?.terms?.docVerification || 'Uploaded documents are used solely for identity verification, legal compliance, and order processing. We do not share your documents with third parties except as required by law.'}
                        </p>
                      </div>

                      {/* Document Authenticity */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">6.4</span>
                          <span>{t?.terms?.docAuthenticityTitle || 'Document Authenticity'}</span>
                        </h3>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border-l-4 border-red-600">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {t?.terms?.docAuthenticity || 'Submitting fraudulent, forged, or altered documents is strictly prohibited and may result in immediate termination of services, legal action, and reporting to authorities.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 7. Liability & Disclaimer */}
                <section id="liability-disclaimer" className="p-8 border-b border-gray-200 dark:border-gray-700 print:break-inside-avoid">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl print:text-2xl">⚠️</div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white print:text-2xl">
                      7. {t?.terms?.liabilityDisclaimer || 'Liability & Disclaimer'}
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="space-y-6">
                      {/* Limitation of Liability */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">7.1</span>
                          <span>{t?.terms?.limitationTitle || 'Limitation of Liability'}</span>
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {t?.terms?.limitation || 'The Agency\'s liability is limited to the value of the purchased vehicle. We are not liable for indirect, incidental, or consequential damages arising from the use of our services.'}
                        </p>
                      </div>

                      {/* Force Majeure */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">7.2</span>
                          <span>{t?.terms?.forceMajeureTitle || 'Force Majeure'}</span>
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                          {t?.terms?.forceMajeureIntro || 'The Agency is not responsible for delays or failure to perform due to circumstances beyond our control, including but not limited to:'}
                        </p>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                            <span>{t?.terms?.force1 || 'Natural disasters, extreme weather, pandemics'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                            <span>{t?.terms?.force2 || 'War, terrorism, civil unrest, government actions'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                            <span>{t?.terms?.force3 || 'Strikes, labor disputes, carrier failures'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                            <span>{t?.terms?.force4 || 'Technical failures, cyberattacks, system outages'}</span>
                          </li>
                        </ul>
                      </div>

                      {/* Product Accuracy */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">7.3</span>
                          <span>{t?.terms?.productAccuracyTitle || 'Product Descriptions & Accuracy'}</span>
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {t?.terms?.productAccuracy || 'While we strive to provide accurate vehicle descriptions and specifications, we cannot guarantee absolute accuracy. Clients should verify details independently before purchase.'}
                        </p>
                      </div>

                      {/* Warranty Disclaimer */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">7.4</span>
                          <span>{t?.terms?.warrantyDisclaimerTitle || 'Warranty Disclaimer'}</span>
                        </h3>
                        <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 border-l-4 border-gray-600">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {t?.terms?.warrantyDisclaimer || 'Vehicles are sold "as-is" unless otherwise specified. Any manufacturer warranties transfer to the client upon delivery. The Agency does not provide additional warranties beyond those provided by the manufacturer.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 8. Privacy & Data Protection */}
                <section id="privacy-data" className="p-8 border-b border-gray-200 dark:border-gray-700 print:break-inside-avoid">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl print:text-2xl">🔒</div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white print:text-2xl">
                      8. {t?.terms?.privacyData || 'Privacy & Data Protection'}
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      {t?.terms?.privacyIntro || 'Your privacy is important to us. The collection, use, and protection of your personal data are governed by our Privacy Policy.'}
                    </p>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border-l-4 border-blue-600">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        {t?.terms?.privacyReference || 'For detailed information about how we handle your personal data, please review our comprehensive Privacy Policy:'}
                      </p>
                      <Link 
                        href="/privacy"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors print:bg-blue-600"
                      >
                        <span>📋</span>
                        <span>{t?.terms?.viewPrivacyPolicy || 'View Privacy Policy'}</span>
                      </Link>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-6">
                      {t?.terms?.privacyCompliance || 'By using our services, you consent to data processing as described in our Privacy Policy. We comply with applicable data protection regulations including GDPR and other international standards.'}
                    </p>
                  </div>
                </section>

                {/* 9. Governing Law & Dispute Resolution */}
                <section id="governing-law" className="p-8 border-b border-gray-200 dark:border-gray-700 print:break-inside-avoid">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl print:text-2xl">⚖️</div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white print:text-2xl">
                      9. {t?.terms?.governingLaw || 'Governing Law & Dispute Resolution'}
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="space-y-6">
                      {/* Applicable Law */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">9.1</span>
                          <span>{t?.terms?.applicableLawTitle || 'Applicable Law'}</span>
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {t?.terms?.applicableLaw || 'These Terms are governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law provisions.'}
                        </p>
                      </div>

                      {/* Jurisdiction */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">9.2</span>
                          <span>{t?.terms?.jurisdictionTitle || 'Jurisdiction'}</span>
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {t?.terms?.jurisdiction || 'Any disputes arising from these Terms or your use of our services shall be subject to the exclusive jurisdiction of the courts of [Jurisdiction].'}
                        </p>
                      </div>

                      {/* Dispute Process */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <span className="text-indigo-600">9.3</span>
                          <span>{t?.terms?.disputeProcessTitle || 'Dispute Resolution Process'}</span>
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                          {t?.terms?.disputeProcessIntro || 'In the event of a dispute, we encourage the following resolution process:'}
                        </p>
                        <ol className="space-y-3 text-gray-700 dark:text-gray-300">
                          <li className="flex items-start gap-2">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 mt-1">1.</span>
                            <span><strong>{t?.terms?.dispute1Title || 'Informal Resolution:'}</strong> {t?.terms?.dispute1 || 'Contact our customer service team to resolve the issue amicably'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 mt-1">2.</span>
                            <span><strong>{t?.terms?.dispute2Title || 'Mediation:'}</strong> {t?.terms?.dispute2 || 'If informal resolution fails, both parties agree to attempt mediation'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 mt-1">3.</span>
                            <span><strong>{t?.terms?.dispute3Title || 'Legal Action:'}</strong> {t?.terms?.dispute3 || 'As a last resort, legal proceedings may be initiated in the specified jurisdiction'}</span>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 10. Changes to Terms */}
                <section id="changes-terms" className="p-8 border-b border-gray-200 dark:border-gray-700 print:break-inside-avoid">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl print:text-2xl">🔄</div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white print:text-2xl">
                      10. {t?.terms?.changesTerms || 'Changes to Terms'}
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      {t?.terms?.changesText1 || 'The Agency reserves the right to modify these Terms at any time. Changes will be effective immediately upon posting to the website.'}
                    </p>
                    
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6 border-l-4 border-indigo-600">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        {t?.terms?.notificationTitle || 'Notification of Changes'}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                        {t?.terms?.notificationText || 'We will notify you of significant changes through:'}
                      </p>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                          <span>{t?.terms?.notification1 || 'Email notification to registered users'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                          <span>{t?.terms?.notification2 || 'Prominent notice on our website'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                          <span>{t?.terms?.notification3 || 'In-app notifications (if applicable)'}</span>
                        </li>
                      </ul>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-6">
                      {t?.terms?.changesText2 || 'Continued use of our services after changes constitute acceptance of the modified Terms. If you do not agree with the changes, you must discontinue use of our services.'}
                    </p>
                  </div>
                </section>

                {/* 11. Contact Us */}
                <section id="contact" className="p-8 print:break-inside-avoid">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl print:text-2xl">📧</div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white print:text-2xl">
                      11. {t?.terms?.contactUs || 'Contact Us'}
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                      {t?.terms?.contactIntro || 'If you have questions about these Terms & Conditions or need legal assistance, please contact us:'}
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Email Contact */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span>📧</span>
                          {t?.terms?.emailContact || 'Email Contact'}
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              {t?.terms?.legalTeam || 'Legal Team'}
                            </p>
                            <a href="mailto:legal@alkocars.com" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                              legal@alkocars.com
                            </a>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              {t?.terms?.generalInquiries || 'General Inquiries'}
                            </p>
                            <a href="mailto:support@alkocars.com" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                              support@alkocars.com
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Contact Form */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span>📝</span>
                          {t?.terms?.contactForm || 'Contact Form'}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                          {t?.terms?.contactFormText || 'For detailed inquiries or legal matters:'}
                        </p>
                        <Link 
                          href="/contact"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm print:bg-purple-600"
                        >
                          <span>→</span>
                          <span>{t?.terms?.visitContactPage || 'Visit Contact Page'}</span>
                        </Link>
                      </div>
                    </div>

                    <div className="mt-6 bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>{t?.terms?.responseTime || 'Response Time:'}</strong> {t?.terms?.responseTimeText || 'We aim to respond to all legal inquiries within 5-7 business days.'}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Footer Note */}
                <div className="p-8 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl print:bg-white">
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {t?.terms?.lastReviewed || 'Last Reviewed'}: {t?.terms?.reviewDate || 'January 2024'}
                  </p>
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                    © {new Date().getFullYear()} ALKO Cars. {t?.terms?.allRightsReserved || 'All rights reserved.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 print:hidden"
          aria-label="Scroll to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 2cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:text-black {
            color: black !important;
          }
          .print\\:text-gray-700 {
            color: #374151 !important;
          }
          .print\\:text-gray-600 {
            color: #4B5563 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-0 {
            border: 0 !important;
          }
          .print\\:py-8 {
            padding-top: 2rem !important;
            padding-bottom: 2rem !important;
          }
          .print\\:py-4 {
            padding-top: 1rem !important;
            padding-bottom: 1rem !important;
          }
          .print\\:text-3xl {
            font-size: 1.875rem !important;
          }
          .print\\:text-2xl {
            font-size: 1.5rem !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
