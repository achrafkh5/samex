'use client';

import { useLanguage } from './LanguageProvider';

export default function ContactInfo() {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4">
              {t('getInTouch')}
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('getInTouchDesc')}
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Side - Contact Cards */}
            <div className="space-y-6">
              {/* Phone */}
              <div className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {t('callUs')}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      <a href="tel:+213550399115" >
                      +213 550 399 115
                      </a>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      <a href="tel:+821030861401" >
                      +82 10-3086-1401
                      </a>
                    </p>

                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-purple-600 dark:bg-purple-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {t('emailUs')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {t('emailResponseTime')}
                    </p>
                    <a href="mailto:info@alkocars.com" className="text-xl font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                      info@alkocars.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="group bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-green-600 dark:bg-green-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {t('visitUs')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {t('companyAddress')}
                    </p>
                    <a href="https://www.google.com/maps/place/ALKO+Cars/@36.7589376,2.9685207,17z/data=!3m1!4b1!4m6!3m5!1s0x128fb10072ed2c31:0x10c7e10a36cbac9b!8m2!3d36.7589333!4d2.9710956!16s%2Fg%2F11ykn8xg1t?entry=ttu&g_ep=EgoyMDI1MTAyMi4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-green-600 dark:text-green-400 font-semibold hover:text-green-700 dark:hover:text-green-300 transition-colors">
                      {t('viewOnMap')}
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('callingHours')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{t('mondayFriday')}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{t('saturday')}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{t('sunday')}</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">Closed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Map */}
            <div className="relative h-[600px] lg:h-full min-h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3236.008105152316!2d2.9685207!3d36.7589376!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fb10072ed2c31%3A0x10c7e10a36cbac9b!2sALKO%20Cars!5e0!3m2!1sen!2sdz!4v1730092200000!5m2!1sen!2sdz"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="ALKO Cars Location - Algiers, Algeria"
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
