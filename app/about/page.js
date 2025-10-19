import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AboutHero from '../components/AboutHero';
import Mission from '../components/Mission';
import WhyChooseUs from '../components/WhyChooseUs';
import Services from '../components/Services';
import Team from '../components/Team';
import ContactInfo from '../components/ContactInfo';

export const metadata = {
  title: "About Us - DreamCars",
  description: "Learn about DreamCars, your trusted automotive partner since 2009. Quality vehicles, transparent pricing, and exceptional service.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <AboutHero />
      <Mission />
      <WhyChooseUs />
      <Services />
      <Team />
      <ContactInfo />
      <Footer />
    </div>
  );
}
