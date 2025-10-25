'use client';

import { useContext, useEffect, useState } from 'react';
import { useLanguage } from '../components/LanguageProvider';
import Link from 'next/link';

export default function PrivacyContent() {
  const t = useLanguage();
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const isRTL = t.language === 'ar';

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      // Update active section based on scroll position
      const sections = ['introduction', 'data-collected', 'data-usage', 'data-storage', 'data-retention', 'client-rights', 'contact'];
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

  const sections = [
    { id: 'introduction', title: t?.privacy?.introduction || 'Introduction', icon: '📋' },
    { id: 'data-collected', title: t?.privacy?.dataCollected || 'Data We Collect', icon: '📊' },
    { id: 'data-usage', title: t?.privacy?.dataUsage || 'How We Use Your Data', icon: '🎯' },
    { id: 'data-storage', title: t?.privacy?.dataStorage || 'Data Storage & Security', icon: '🔒' },
    { id: 'data-retention', title: t?.privacy?.dataRetention || 'Data Retention', icon: '⏰' },
    { id: 'client-rights', title: t?.privacy?.clientRights || 'Your Rights', icon: '⚖️' },
    { id: 'contact', title: t?.privacy?.contactUs || 'Contact Us', icon: '📧' },
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t?.privacyPolicy || 'Privacy Policy'}
            </h1>
            <p className="text-xl text-blue-100 mb-4">
              {t?.privacy?.subtitle || 'Your privacy is important to us. Learn how we collect, use, and protect your personal information.'}
            </p>
            <p className="text-blue-200">
              {t?.privacy?.lastUpdated || 'Last Updated'}: {t?.privacy?.updateDate || 'January 2024'}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Table of Contents - Sidebar */}
            <div className="lg:w-1/4">
              <div className="lg:sticky lg:top-24">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    📑 {t?.privacy?.tableOfContents || 'Table of Contents'}
                  </h3>
                  <nav className="space-y-2">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                          activeSection === section.id
                            ? 'bg-blue-600 text-white shadow-md'
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
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                {/* Introduction */}
                <section id="introduction" className="p-8 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl">📋</div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {t?.privacy?.introduction || 'Introduction'}
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      {t?.privacy?.introText1 || 'At ALKO Cars, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our services.'}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {t?.privacy?.introText2 || 'By using our website and services, you agree to the collection and use of information in accordance with this policy. We encourage you to read this policy carefully to understand our practices regarding your personal data.'}
                    </p>
                  </div>
                </section>

                {/* Data We Collect */}
                <section id="data-collected" className="p-8 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl">📊</div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {t?.privacy?.dataCollected || 'Data We Collect'}
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                      {t?.privacy?.dataCollectedIntro || 'We collect the following types of information to provide and improve our services:'}
                    </p>

                    <div className="space-y-6">
                      {/* Personal Information */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border-l-4 border-blue-600">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span>👤</span>
                          {t?.privacy?.personalInfo || 'Personal Information'}
                        </h3>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                            <span>{t?.privacy?.personalInfo1 || 'Full name and contact details (email, phone number, address)'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                            <span>{t?.privacy?.personalInfo2 || 'Date of birth and nationality'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                            <span>{t?.privacy?.personalInfo3 || 'Government-issued identification numbers'}</span>
                          </li>
                        </ul>
                      </div>

                      {/* Documents */}
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border-l-4 border-green-600">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span>📄</span>
                          {t?.privacy?.documents || 'Uploaded Documents'}
                        </h3>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                            <span>{t?.privacy?.documents1 || 'National ID card or passport copies'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                            <span>{t?.privacy?.documents2 || 'Driver\'s license and related permits'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                            <span>{t?.privacy?.documents3 || 'Proof of residence (utility bills, lease agreements)'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                            <span>{t?.privacy?.documents4 || 'Payment receipts and financial documents'}</span>
                          </li>
                        </ul>
                      </div>

                      {/* Transaction Data */}
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border-l-4 border-purple-600">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span>💳</span>
                          {t?.privacy?.transactionData || 'Transaction & Service Data'}
                        </h3>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                            <span>{t?.privacy?.transactionData1 || 'Car selection and purchase details'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                            <span>{t?.privacy?.transactionData2 || 'Payment information and transaction history'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                            <span>{t?.privacy?.transactionData3 || 'Delivery tracking and shipping information'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                            <span>{t?.privacy?.transactionData4 || 'Communication history and support requests'}</span>
                          </li>
                        </ul>
                      </div>

                      {/* Technical Data */}
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border-l-4 border-orange-600">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span>🖥️</span>
                          {t?.privacy?.technicalData || 'Technical Information'}
                        </h3>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                          <li className="flex items-start gap-2">
                            <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                            <span>{t?.privacy?.technicalData1 || 'IP address, browser type, and device information'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                            <span>{t?.privacy?.technicalData2 || 'Usage data and website interaction analytics'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                            <span>{t?.privacy?.technicalData3 || 'Cookies and similar tracking technologies'}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* How We Use Your Data */}
                <section id="data-usage" className="p-8 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl">🎯</div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {t?.privacy?.dataUsage || 'How We Use Your Data'}
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                      {t?.privacy?.dataUsageIntro || 'We use your personal information for the following purposes:'}
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <span className="text-xl">📝</span>
                          {t?.privacy?.purpose1Title || 'Service Delivery'}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {t?.privacy?.purpose1 || 'Processing your registration, managing your account, and facilitating car purchases and deliveries'}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <span className="text-xl">💰</span>
                          {t?.privacy?.purpose2Title || 'Financial Processing'}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {t?.privacy?.purpose2 || 'Generating invoices, processing payments, and maintaining financial records'}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <span className="text-xl">⚖️</span>
                          {t?.privacy?.purpose3Title || 'Legal Compliance'}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {t?.privacy?.purpose3 || 'Meeting legal and regulatory requirements, including tax obligations and anti-fraud measures'}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <span className="text-xl">📞</span>
                          {t?.privacy?.purpose4Title || 'Communication'}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {t?.privacy?.purpose4 || 'Sending important updates, notifications, and responding to your inquiries'}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <span className="text-xl">🔍</span>
                          {t?.privacy?.purpose5Title || 'Service Improvement'}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {t?.privacy?.purpose5 || 'Analyzing usage patterns to enhance our platform and customer experience'}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <span className="text-xl">🛡️</span>
                          {t?.privacy?.purpose6Title || 'Security & Fraud Prevention'}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {t?.privacy?.purpose6 || 'Protecting against unauthorized access, fraud, and ensuring platform security'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border border-yellow-300 dark:border-yellow-700">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">ℹ️</span>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                            {t?.privacy?.thirdPartyTitle || 'Third-Party Sharing'}
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300">
                            {t?.privacy?.thirdPartyText || 'We do not sell or share your personal data with third parties for marketing purposes. We may share limited information with trusted service providers (payment processors, cloud storage) only as necessary to deliver our services, and under strict confidentiality agreements.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Data Storage & Security */}
                <section id="data-storage" className="p-8 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl">🔒</div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {t?.privacy?.dataStorage || 'Data Storage & Security'}
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                      {t?.privacy?.storageIntro || 'We implement industry-standard security measures to protect your information:'}
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-3xl">🗄️</div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                            {t?.privacy?.storageLocation || 'Secure Database Storage'}
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300">
                            {t?.privacy?.storageLocationText || 'All personal data is stored in secure MongoDB databases with encryption at rest. Access is restricted to authorized personnel only.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-3xl">☁️</div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                            {t?.privacy?.cloudStorage || 'Cloud File Storage'}
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300">
                            {t?.privacy?.cloudStorageText || 'Uploaded documents (ID cards, licenses, etc.) are stored on Cloudinary, a secure cloud storage platform with enterprise-grade security and redundancy.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-3xl">🔐</div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                            {t?.privacy?.encryption || 'Data Encryption'}
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300">
                            {t?.privacy?.encryptionText || 'All data transmission is encrypted using HTTPS/TLS protocols. Sensitive information is encrypted both in transit and at rest.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-3xl">👥</div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                            {t?.privacy?.accessControl || 'Access Control'}
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300">
                            {t?.privacy?.accessControlText || 'Access to your data is limited to authorized staff members who require it to perform their duties. All access is logged and monitored.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-3xl">🔄</div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                            {t?.privacy?.backups || 'Regular Backups'}
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300">
                            {t?.privacy?.backupsText || 'We perform regular encrypted backups to prevent data loss and ensure business continuity in case of system failures.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Data Retention */}
                <section id="data-retention" className="p-8 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl">⏰</div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {t?.privacy?.dataRetention || 'Data Retention'}
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                      {t?.privacy?.retentionIntro || 'We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy:'}
                    </p>

                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span className="text-xl">📅</span>
                          {t?.privacy?.retentionPeriod || 'Retention Period'}
                        </h4>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                            <span>{t?.privacy?.retention1 || 'Active account data: Retained while your account is active'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                            <span>{t?.privacy?.retention2 || 'Transaction records: Retained for 7 years for tax and legal compliance'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                            <span>{t?.privacy?.retention3 || 'Uploaded documents: Retained until car delivery completion or as required by law'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                            <span>{t?.privacy?.retention4 || 'Marketing communications: Until you unsubscribe or request removal'}</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-300 dark:border-blue-700">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">🗑️</span>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                              {t?.privacy?.datadeletion || 'Data Deletion'}
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300">
                              {t?.privacy?.dataDeletionText || 'After the retention period expires, or upon your request (subject to legal obligations), we will securely delete or anonymize your personal information. Deleted data cannot be recovered.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Your Rights */}
                <section id="client-rights" className="p-8 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl">⚖️</div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {t?.privacy?.clientRights || 'Your Rights'}
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                      {t?.privacy?.rightsIntro || 'As a client, you have the following rights regarding your personal data:'}
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
                        <div className="text-3xl mb-3">👁️</div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                          {t?.privacy?.rightAccess || 'Right to Access'}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {t?.privacy?.rightAccessText || 'Request a copy of all personal data we hold about you'}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
                        <div className="text-3xl mb-3">✏️</div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                          {t?.privacy?.rightCorrection || 'Right to Correction'}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {t?.privacy?.rightCorrectionText || 'Request correction of inaccurate or incomplete information'}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-6 border border-red-200 dark:border-red-700">
                        <div className="text-3xl mb-3">🗑️</div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                          {t?.privacy?.rightDeletion || 'Right to Deletion'}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {t?.privacy?.rightDeletionText || 'Request deletion of your personal data (subject to legal requirements)'}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
                        <div className="text-3xl mb-3">📥</div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                          {t?.privacy?.rightPortability || 'Right to Portability'}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {t?.privacy?.rightPortabilityText || 'Receive your data in a structured, machine-readable format'}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-700">
                        <div className="text-3xl mb-3">🚫</div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                          {t?.privacy?.rightObject || 'Right to Object'}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {t?.privacy?.rightObjectText || 'Object to processing of your data for certain purposes'}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-700">
                        <div className="text-3xl mb-3">⏸️</div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                          {t?.privacy?.rightRestrict || 'Right to Restrict'}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {t?.privacy?.rightRestrictText || 'Request restriction of processing under certain circumstances'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-300 dark:border-green-700">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <span className="text-xl">📝</span>
                        {t?.privacy?.exerciseRights || 'How to Exercise Your Rights'}
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {t?.privacy?.exerciseRightsText || 'To exercise any of these rights, please contact us using the information provided in the "Contact Us" section below. We will respond to your request within 30 days.'}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Contact Us */}
                <section id="contact" className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-4xl">📧</div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {t?.privacy?.contactUs || 'Contact Us'}
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                      {t?.privacy?.contactIntro || 'If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us:'}
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <span className="text-xl">✉️</span>
                          {t?.privacy?.emailContact || 'Email Contact'}
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                          {t?.privacy?.privacyEmail || 'Privacy Team'}:
                        </p>
                        <a href="mailto:privacy@alkocars.com" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                          privacy@alkocars.com
                        </a>
                      </div>

                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <span className="text-xl">📝</span>
                          {t?.privacy?.contactForm || 'Contact Form'}
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          {t?.privacy?.contactFormText || 'For general inquiries or privacy requests:'}
                        </p>
                        <Link
                          href="/contact"
                          className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                          {t?.privacy?.visitContactPage || 'Visit Contact Page'} →
                        </Link>
                      </div>
                    </div>

                    <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                        {t?.privacy?.responseTime || 'Response Time'}
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {t?.privacy?.responseTimeText || 'We aim to respond to all privacy-related inquiries within 30 days. For urgent matters, please mark your email as "URGENT - Privacy Request".'}
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Policy Updates Notice */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-700">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🔔</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {t?.privacy?.policyUpdates || 'Policy Updates'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      {t?.privacy?.policyUpdatesText || 'We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any significant changes by email or through a prominent notice on our website.'}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>{t?.privacy?.lastReviewed || 'Last Reviewed'}:</strong> {t?.privacy?.reviewDate || 'January 2024'}
                    </p>
                  </div>
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
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all transform hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
}
