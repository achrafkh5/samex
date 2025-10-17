'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Navbar
    home: 'Home',
    cars: 'Cars',
    about: 'About',
    contact: 'Contact',
    brand: 'DreamCars',
    
    // Hero
    herobadge: 'Over 500+ Premium Cars Available',
    heroTitle1: 'Find Your',
    heroTitle2: 'Dream Car',
    heroSubtitle: 'Discover the perfect vehicle from our curated collection of premium cars. Quality, luxury, and reliability in every choice.',
    browseCars: 'Browse Cars',
    contactUs: 'Contact Us',
    
    // Stats
    carsAvailable: 'Cars Available',
    happyCustomers: 'Happy Customers',
    yearsExperience: 'Years Experience',
    expertTeam: 'Expert Team',
    
    // Featured Cars
    ourCollection: 'Our Collection',
    featuredCars: 'Featured Cars',
    featuredDesc: 'Browse our handpicked selection of premium vehicles. Each car is thoroughly inspected and ready for delivery.',
    viewDetails: 'View Details',
    viewAllCars: 'View All Cars',
    power: 'Power',
    topSpeed: 'Top Speed',
    range: 'Range',
    
    // About
    aboutUs: 'About Us',
    aboutTitle1: 'Your Trusted Partner in',
    aboutTitle2: 'Premium Cars',
    aboutText1: 'With over 15 years of experience in the automotive industry, we have helped thousands of customers find their perfect vehicle. Our commitment to quality, transparency, and customer satisfaction sets us apart.',
    aboutText2: 'Whether you are looking for a luxury sedan, a powerful sports car, or an eco-friendly electric vehicle, our expert team is here to guide you through every step of the journey.',
    qualityAssured: 'Quality Assured',
    qualityDesc: 'Every vehicle undergoes rigorous inspection',
    bestPrices: 'Best Prices',
    bestPricesDesc: 'Competitive pricing with flexible financing',
    expertTeamTitle: 'Expert Team',
    expertTeamDesc: 'Professional guidance every step of the way',
    fastDelivery: 'Fast Delivery',
    fastDeliveryDesc: 'Quick processing and delivery to your door',
    learnMore: 'Learn More About Us',
    
    // Contact
    readyToFind: 'Ready to Find Your Dream Car?',
    contactDesc: 'Visit our showroom or get in touch with our expert team. We are here to help you find the perfect vehicle that matches your style and budget.',
    callUs: 'Call Us',
    emailUs: 'Email Us',
    visitUs: 'Visit Us',
    scheduleVisit: 'Schedule a Visit',
    getQuote: 'Get a Quote',
    
    // Footer
    footerDesc: 'Your trusted partner in finding the perfect vehicle. Quality, luxury, and reliability in every choice.',
    company: 'Company',
    services: 'Services',
    support: 'Support',
    legal: 'Legal',
    newsletter: 'Subscribe to Our Newsletter',
    newsleterDesc: 'Get the latest updates on new cars and exclusive offers.',
    emailPlaceholder: 'Enter your email',
    subscribe: 'Subscribe',
    allRightsReserved: 'All rights reserved',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    sitemap: 'Sitemap',
  },
  fr: {
    // Navbar
    home: 'Accueil',
    cars: 'Voitures',
    about: 'À Propos',
    contact: 'Contact',
    brand: 'DreamCars',
    
    // Hero
    heroTitle1: 'Trouvez Votre',
    heroTitle2: 'Voiture de Rêve',
    heroSubtitle: 'Découvrez le véhicule parfait parmi notre collection de voitures premium. Qualité, luxe et fiabilité dans chaque choix.',
    browseCars: 'Parcourir les Voitures',
    contactUs: 'Contactez-nous',
    herobadge: 'Plus de 500 voitures premium disponibles',
    
    // Stats
    carsAvailable: 'Voitures Disponibles',
    happyCustomers: 'Clients Satisfaits',
    yearsExperience: 'Années d\'Expérience',
    expertTeam: 'Équipe d\'Experts',
    
    // Featured Cars
    ourCollection: 'Notre Collection',
    featuredCars: 'Voitures en Vedette',
    featuredDesc: 'Parcourez notre sélection de véhicules premium. Chaque voiture est soigneusement inspectée et prête à être livrée.',
    viewDetails: 'Voir Détails',
    viewAllCars: 'Voir Toutes les Voitures',
    power: 'Puissance',
    topSpeed: 'Vitesse Max',
    range: 'Autonomie',
    
    // About
    aboutUs: 'À Propos',
    aboutTitle1: 'Votre Partenaire de Confiance en',
    aboutTitle2: 'Voitures Premium',
    aboutText1: 'Avec plus de 15 ans d\'expérience dans l\'industrie automobile, nous avons aidé des milliers de clients à trouver leur véhicule parfait. Notre engagement envers la qualité, la transparence et la satisfaction client nous distingue.',
    aboutText2: 'Que vous recherchiez une berline de luxe, une voiture de sport puissante ou un véhicule électrique écologique, notre équipe d\'experts est là pour vous guider à chaque étape.',
    qualityAssured: 'Qualité Garantie',
    qualityDesc: 'Chaque véhicule subit une inspection rigoureuse',
    bestPrices: 'Meilleurs Prix',
    bestPricesDesc: 'Prix compétitifs avec financement flexible',
    expertTeamTitle: 'Équipe d\'Experts',
    expertTeamDesc: 'Conseils professionnels à chaque étape',
    fastDelivery: 'Livraison Rapide',
    fastDeliveryDesc: 'Traitement et livraison rapides à votre porte',
    learnMore: 'En Savoir Plus',
    
    // Contact
    readyToFind: 'Prêt à Trouver Votre Voiture de Rêve?',
    contactDesc: 'Visitez notre salle d\'exposition ou contactez notre équipe d\'experts. Nous sommes là pour vous aider à trouver le véhicule parfait qui correspond à votre style et votre budget.',
    callUs: 'Appelez-nous',
    emailUs: 'Envoyez-nous un Email',
    visitUs: 'Visitez-nous',
    scheduleVisit: 'Planifier une Visite',
    getQuote: 'Obtenir un Devis',
    
    // Footer
    footerDesc: 'Votre partenaire de confiance pour trouver le véhicule parfait. Qualité, luxe et fiabilité dans chaque choix.',
    company: 'Entreprise',
    services: 'Services',
    support: 'Support',
    legal: 'Légal',
    newsletter: 'Abonnez-vous à Notre Newsletter',
    newsleterDesc: 'Recevez les dernières mises à jour sur les nouvelles voitures et offres exclusives.',
    emailPlaceholder: 'Entrez votre email',
    subscribe: 'S\'abonner',
    allRightsReserved: 'Tous droits réservés',
    privacyPolicy: 'Politique de Confidentialité',
    termsOfService: 'Conditions d\'Utilisation',
    sitemap: 'Plan du Site',
  },
  ar: {
    // Navbar
    home: 'الرئيسية',
    cars: 'السيارات',
    about: 'معلومات عنا',
    contact: 'اتصل بنا',
    brand: 'دريم كارز',
    
    // Hero
    heroTitle1: 'اعثر على',
    heroTitle2: 'سيارة أحلامك',
    heroSubtitle: 'اكتشف السيارة المثالية من مجموعتنا المنتقاة من السيارات الفاخرة. الجودة والفخامة والموثوقية في كل اختيار.',
    browseCars: 'تصفح السيارات',
    contactUs: 'اتصل بنا',
    herobadge: 'أكثر من 500 سيارة فاخرة متوفرة',
    
    // Stats
    carsAvailable: 'سيارات متوفرة',
    happyCustomers: 'عملاء سعداء',
    yearsExperience: 'سنوات خبرة',
    expertTeam: 'فريق خبراء',
    
    // Featured Cars
    ourCollection: 'مجموعتنا',
    featuredCars: 'السيارات المميزة',
    featuredDesc: 'تصفح مجموعتنا المختارة من السيارات الفاخرة. كل سيارة تم فحصها بدقة وجاهزة للتسليم.',
    viewDetails: 'عرض التفاصيل',
    viewAllCars: 'عرض جميع السيارات',
    power: 'القوة',
    topSpeed: 'السرعة القصوى',
    range: 'المدى',
    
    // About
    aboutUs: 'معلومات عنا',
    aboutTitle1: 'شريكك الموثوق في',
    aboutTitle2: 'السيارات الفاخرة',
    aboutText1: 'مع أكثر من 15 عامًا من الخبرة في صناعة السيارات، ساعدنا آلاف العملاء في العثور على سيارتهم المثالية. التزامنا بالجودة والشفافية ورضا العملاء يميزنا.',
    aboutText2: 'سواء كنت تبحث عن سيارة سيدان فاخرة أو سيارة رياضية قوية أو سيارة كهربائية صديقة للبيئة، فريقنا من الخبراء هنا لإرشادك في كل خطوة.',
    qualityAssured: 'الجودة مضمونة',
    qualityDesc: 'كل سيارة تخضع لفحص دقيق',
    bestPrices: 'أفضل الأسعار',
    bestPricesDesc: 'أسعار تنافسية مع تمويل مرن',
    expertTeamTitle: 'فريق الخبراء',
    expertTeamDesc: 'إرشاد مهني في كل خطوة',
    fastDelivery: 'تسليم سريع',
    fastDeliveryDesc: 'معالجة وتسليم سريع إلى بابك',
    learnMore: 'اعرف المزيد عنا',
    
    // Contact
    readyToFind: 'هل أنت مستعد للعثور على سيارة أحلامك؟',
    contactDesc: 'قم بزيارة صالة العرض الخاصة بنا أو تواصل مع فريق الخبراء لدينا. نحن هنا لمساعدتك في العثور على السيارة المثالية التي تناسب أسلوبك وميزانيتك.',
    callUs: 'اتصل بنا',
    emailUs: 'راسلنا عبر البريد',
    visitUs: 'قم بزيارتنا',
    scheduleVisit: 'حدد موعد زيارة',
    getQuote: 'احصل على عرض سعر',
    
    // Footer
    footerDesc: 'شريكك الموثوق في العثور على السيارة المثالية. الجودة والفخامة والموثوقية في كل اختيار.',
    company: 'الشركة',
    services: 'الخدمات',
    support: 'الدعم',
    legal: 'قانوني',
    newsletter: 'اشترك في نشرتنا الإخبارية',
    newsleterDesc: 'احصل على آخر التحديثات حول السيارات الجديدة والعروض الحصرية.',
    emailPlaceholder: 'أدخل بريدك الإلكتروني',
    subscribe: 'اشترك',
    allRightsReserved: 'جميع الحقوق محفوظة',
    privacyPolicy: 'سياسة الخصوصية',
    termsOfService: 'شروط الخدمة',
    sitemap: 'خريطة الموقع',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
    document.documentElement.lang = savedLanguage;
    document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key) => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
