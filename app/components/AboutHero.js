'use client';

import { useLanguage } from './LanguageProvider';
import Image from 'next/image';
export default function AboutHero() {
  const { t } = useLanguage();

  return (
    <section className="relative pt-32 pb-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center mb-8">
            <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-2xl p-4">
              <Image src="/logo.png" alt="Logo" width={120} height={120} className="object-contain" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
            {t('aboutPageTitle')}
          </h1>

          {/* Slogan */}
          <p className="text-2xl sm:text-3xl text-blue-100 dark:text-blue-200 font-medium mb-8 animate-slide-up">
            {t('aboutPageSlogan')}
          </p>

          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-3 animate-slide-up animation-delay-200">
            <div className="h-1 w-16 bg-white/30 rounded"></div>
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <div className="h-1 w-16 bg-white/30 rounded"></div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
                fill="currentColor" 
                className="text-white dark:text-gray-900"/>
        </svg>
      </div>
    </section>
  );
}
