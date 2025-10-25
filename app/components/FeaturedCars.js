'use client';

import { useLanguage } from './LanguageProvider';
import Link from 'next/link';
import Image from 'next/image';

export default function FeaturedCars() {
  const { t } = useLanguage();
  
  const cars = [
    {
      id: 1,
      name: 'Tesla Model S',
      year: 2024,
      price: '$89,990',
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800',
      category: 'Electric',
      specs: { power: '1,020 HP', speed: '200 mph', range: '405 mi' },
    },
    {
      id: 2,
      name: 'BMW M4 Competition',
      year: 2024,
      price: '$76,900',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800',
      category: 'Sport',
      specs: { power: '503 HP', speed: '180 mph', range: '450 mi' },
    },
    {
      id: 3,
      name: 'Mercedes-Benz S-Class',
      year: 2024,
      price: '$115,000',
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=800',
      category: 'Luxury',
      specs: { power: '429 HP', speed: '155 mph', range: '500 mi' },
    },
    {
      id: 4,
      name: 'Porsche 911 Turbo',
      year: 2024,
      price: '$174,300',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800',
      category: 'Sport',
      specs: { power: '640 HP', speed: '205 mph', range: '380 mi' },
    },
    {
      id: 5,
      name: 'Audi e-tron GT',
      year: 2024,
      price: '$104,900',
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=800',
      category: 'Electric',
      specs: { power: '637 HP', speed: '152 mph', range: '238 mi' },
    },
    {
      id: 6,
      name: 'Range Rover Sport',
      year: 2024,
      price: '$83,000',
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=800',
      category: 'SUV',
      specs: { power: '355 HP', speed: '140 mph', range: '470 mi' },
    },
  ];

  return (
    <section id="cars" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4">
            {t('ourCollection')}
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('featuredCars')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('featuredDesc')}
          </p>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => (
            <div
              key={car.id}
              className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={car.image}
                  alt={car.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                    {car.category}
                  </span>
                </div>
                <div className="absolute top-4 left-4">
                  <button className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors">
                    <svg
                      className="w-5 h-5 text-gray-700 hover:text-red-500 transition-colors"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {car.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {car.year}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {car.price}
                    </p>
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 mb-4 py-4 border-y border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t('power')}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {car.specs.power}
                    </p>
                  </div>
                  <div className="text-center border-x border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t('topSpeed')}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {car.specs.speed}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t('range')}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {car.specs.range}
                    </p>
                  </div>
                </div>

                {/* Button */}
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transform hover:scale-[1.02] transition-all duration-300">
                  {t('viewDetails')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/cars"><button className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            {t('viewAllCars')}
            <svg
              className="inline-block ml-2 w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button></Link>
        </div>
      </div>
    </section>
  );
}
