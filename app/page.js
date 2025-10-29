import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BrandsShowcase from './components/BrandsShowcase';
import PopularCars from './components/PopularCars';
import RecentCars from './components/RecentCars';
import About from './components/About';
import ContactCTA from './components/ContactCTA';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <Hero />
      <BrandsShowcase />
      <PopularCars />
      <RecentCars />
      <About />
      <ContactCTA />
      <Footer />
    </div>
  );
}
