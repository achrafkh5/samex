'use client';

import { useLanguage } from './LanguageProvider';
import { useState, useEffect } from 'react';

export default function Hero() {
  const { t } = useLanguage();
  const [carsCount, setCarsCount] = useState(0);

  useEffect(() => {
    const fetchCarsCount = async () => {
      try {
        const response = await fetch('/api/cars');
        const data = await response.json();
        setCarsCount(data.length);
      } catch (error) {
        console.error('Error fetching cars count:', error);
      }
    };
    fetchCarsCount();
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1920')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center py-8 sm:py-0">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 animate-fade-in mt-16">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-white text-sm font-medium">
              +{carsCount} {t('carsAvailable')}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-slide-up">
            {t('heroTitle1')}{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {t('heroTitle2')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto animate-slide-up animation-delay-200">
            {t('heroSubtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-400">
            <a
              href="#cars"
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            >
              {t('browseCars')}
              <svg
                className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="#contact"
              className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-full font-semibold text-lg hover:bg-white/20 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            >
              {t('contactUs')}
            </a>
          </div>

          {/* Stats */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {[
              { label: t('vehicleTypes'), value: t('vehicleTypes').split(' ')[0] || 'Petrol' },
              { label: t('deliveryTime'), value: '35 ' + t('days') },
              { label: t('foundedYear'), value: '2024' },
              { label: t('shippingPort'), value: t('jijel') },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 sm:p-4 hover:bg-white/20 transition-all duration-300"
              >
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-300 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
