import Navbar from '../components/Navbar';
import TrackingContent from '../components/TrackingContent';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Track Your Car - Dream Cars',
  description: 'Track the real-time delivery status and location of your purchased vehicle.',
};

export default function TrackingPage() {
  return (
    <>
      <Navbar />
      <TrackingContent />
      <Footer />
    </>
  );
}
