'use client';

import { useLanguage } from './LanguageProvider';
import Image from 'next/image';

export default function BrandLogos() {
  const { t } = useLanguage();

  const brands = [
    { 
      name: 'Renault', 
      logo: '/e9446002a57b27a27149a3a7b9a115c0.png',
      alt: 'Renault Logo'
    },
    { 
      name: 'Chevrolet', 
      logo: '/f97157040ddaa7422099359784ab566a.png',
      alt: 'Chevrolet Logo'
    },
    { 
      name: 'Dacia', 
      logo: '/18f669fbbd534df1bc1497985d4c15ce.png',
      alt: 'Dacia Logo'
    },
    { 
      name: 'Mercedes', 
      logo: 'https://cdn.worldvectorlogo.com/logos/mercedes-benz-9.svg',
      alt: 'Mercedes-Benz Logo'
    },
    { 
      name: 'BMW', 
      logo: '/[CITYPNG.COM]BMW Car Logo - 1500x1500.png',
      alt: 'BMW Logo'
    },
    { 
      name: 'Volkswagen', 
      logo: '/73df89a1d80b2d3b5926ae189547d475.png',
      alt: 'Volkswagen Logo'
    },
  ];

  // Duplicate brands for seamless infinite loop
  const duplicatedBrands = [...brands, ...brands, ...brands];

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-black dark:via-slate-900 dark:to-black overflow-hidden relative">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Glowing orbs */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-[120px] opacity-20 animate-pulse"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Premium Automotive Brands
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
      </div>
      
      {/* Animated logos container */}
      <div className="relative">
        {/* Subtle fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 md:w-40 bg-gradient-to-r from-slate-900 via-slate-900/70 via-slate-900/30 to-transparent dark:from-black dark:via-black/70 dark:via-black/30 z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 md:w-40 bg-gradient-to-l from-slate-900 via-slate-900/70 via-slate-900/30 to-transparent dark:from-black dark:via-black/70 dark:via-black/30 z-10 pointer-events-none"></div>

        {/* Animated track */}
        <div className="flex gap-16 animate-scroll-infinite items-center">
          {duplicatedBrands.map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              className="flex-shrink-0 flex items-center justify-center group"
              style={{ minWidth: '180px' }}
            >
              <div className="relative">
                {/* Glow effect behind logo */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-all duration-500 scale-150"></div>
                
                {/* Logo container */}
                <div className="relative w-32 h-32 rounded-2xl bg-white/90 dark:bg-gray-800 backdrop-blur-sm border border-white/20 shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 flex items-center justify-center group-hover:scale-110 group-hover:border-blue-400/50 cursor-pointer p-5">
                  <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={brand.logo}
                      alt={brand.alt}
                      className="w-full h-full object-contain transition-all duration-300 group-hover:drop-shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add custom CSS for animation */}
      <style jsx>{`
        @keyframes scroll-infinite {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }

        .animate-scroll-infinite {
          animation: scroll-infinite 35s linear infinite;
          width: max-content;
        }

        @media (max-width: 768px) {
          .animate-scroll-infinite {
            animation-duration: 20s;
          }
        }
      `}</style>
    </section>
  );
}
