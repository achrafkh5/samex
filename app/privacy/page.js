import PrivacyContent from './PrivacyContent';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Privacy Policy - DreamCars Agency',
  description: 'Learn how DreamCars protects your privacy and handles your personal information.',
};

export default function PrivacyPage() {
  return (
  <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <PrivacyContent />
      </div>
);
}
