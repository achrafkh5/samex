import TermsContent from './TermsContent';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
export const metadata = {
  title: 'Terms & Conditions - ALKO Cars',
  description: 'Read the terms and conditions governing the use of ALKO Cars services, including orders, payments, delivery, and legal policies.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <TermsContent />
      <Footer />
    </div>
  );
}
