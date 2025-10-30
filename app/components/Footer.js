'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Footer() {
  const { t } = useLanguage();
  const [currentYear, setCurrentYear] = useState(2025);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const footerLinks = {
    company: [
      { name: t('aboutUs') || 'About Us', href: '/about' },
      { name: t('cars') || 'Cars', href: '/cars' },
      { name: t('contact') || 'Contact', href: '/contact' },
    ],
    legal: [
      { name: t('privacyPolicy') || 'Privacy Policy', href: '/privacy' },
      { name: t('termsOfService') || 'Terms & Conditions', href: '/terms' },
    ],
  };

  const socialLinks = [
    {
      name: 'Facebook',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      href: 'https://www.facebook.com/alko.ca.2025',
    },
    {
      name: 'TikTok',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      ),
      href: 'https://www.tiktok.com/@alko.cars',
    },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-25 h-15 relative rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                <Image src="/logo.png" alt="Logo" height={80} width={80} className="object-contain" />
              </div>
              <span className="text-2xl font-bold text-white">{t('companyName') || 'ALKO Cars'}</span>
            </Link>
          </div>
            <p className="text-gray-400 mb-4">
              {t('companyMission')}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              <span className="block font-semibold text-gray-300 mb-1">{t('address') || 'Address'}:</span>
              {t('companyAddress')}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {t('foundedYear')} • {t('deliveryTime')}
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 dark:bg-gray-900 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-110"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">{t('contact') || 'Contact'}</h3>
            
            {/* Algeria Phones */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">{t('algeriaPhones')}:</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <a href="tel:+213550399115" className="hover:text-blue-400 transition-colors">
                    +213 550 399 115
                  </a>
                </li>
                <li>
                  <a href="tel:+213549006132" className="hover:text-blue-400 transition-colors">
                    +213 549 006 132
                  </a>
                </li>
                <li>
                  <a href="tel:+213542899478" className="hover:text-blue-400 transition-colors">
                    +213 542 899 478
                  </a>
                </li>
              </ul>
            </div>

            {/* Korea Phones */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">{t('koreaPhones')}:</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <a href="tel:+821030861401" className="hover:text-blue-400 transition-colors">
                    +82 10-3086-1401
                  </a>
                </li>
                <li>
                  <a href="tel:+821068904366" className="hover:text-blue-400 transition-colors">
                    +82 10-6890-4366
                  </a>
                </li>
              </ul>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              {t('availabilityText')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">{t('company') || 'Company'}</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-white font-semibold text-lg mb-4 mt-6">{t('legal') || 'Legal'}</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 dark:border-gray-900 pt-8 flex flex-col md:flex-row items-center justify-between text-sm">
          <p className="text-gray-400 mb-4 md:mb-0">
            © {currentYear} {t('companyName') || 'ALKO Cars'}. {t('allRightsReserved')}.
          </p>
          <div className="flex items-center space-x-6">
            <Link href="/" className="hover:text-blue-400 transition-colors">
              {t('home')}
            </Link>
            <Link href="/contact" className="hover:text-blue-400 transition-colors">
              {t('contact')}
            </Link>
            <Link href="/privacy" className="hover:text-blue-400 transition-colors">
              {t('privacyPolicy')}
            </Link>
            <Link href="/terms" className="hover:text-blue-400 transition-colors">
              {t('termsOfService')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
