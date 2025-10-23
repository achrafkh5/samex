import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedCars from './components/FeaturedCars';
import BrandLogos from './components/BrandLogos';
import About from './components/About';
import ContactCTA from './components/ContactCTA';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <Hero />
      <BrandLogos />
      <FeaturedCars />
      <About />
      <ContactCTA />
      <Footer />
    </div>
  );
}
