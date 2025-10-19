import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactPageContent from '../components/ContactPageContent';

export const metadata = {
  title: 'Contact Us | DreamCars',
  description: 'Get in touch with DreamCars. Visit our showroom, schedule a test drive, or send us a message. Our team is ready to help you find your dream car.',
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <ContactPageContent />
      <Footer />
    </>
  );
}
