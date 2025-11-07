'use client';

import { useLanguage } from './LanguageProvider';
import Image from 'next/image';

export default function Mission() {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Side - Image */}
          <div className="relative">
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1562519819-019d3d5d36f6?q=80&w=800"
                alt="Luxury Car Showroom"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              {/* Stats Overlay */}
              <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-4">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2024</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{t('foundedYear')}</div>
                </div>
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">35</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{t('deliveryTime')}</div>
                </div>
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{t('ourSiteAlg')}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">QX5C+H5M, Chéraga</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-8">
            {/* Mission */}
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
                {t('ourMission')}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('aboutTitle1')} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('aboutTitle2')}</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('missionText')}
              </p>
            </div>

            {/* Vision */}
            <div className="pl-6 border-l-4 border-blue-600 dark:border-blue-400">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {t('ourVision')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('visionText')}
              </p>
            </div>

            {/* History */}
            <div className="pl-6 border-l-4 border-purple-600 dark:border-purple-400">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {t('ourHistory')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('historyText')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
