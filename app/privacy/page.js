import PrivacyContent from './PrivacyContent';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
export const metadata = {
  title: 'Privacy Policy - ALKO Cars',
  description: 'Learn how ALKO Cars protects your privacy and handles your personal information.',
};

export default function PrivacyPage() {
  return (
  <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <PrivacyContent />
        <Footer />
      </div>
);
}
