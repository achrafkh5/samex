import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactPageContent from '../components/ContactPageContent';

export const metadata = {
  title: 'Contact Us | ALKO Cars',
  description: 'Get in touch with ALKO Cars. Contact us in Algeria or Korea, or send us a message. Our team is ready to help you import your dream Korean vehicle.',
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
