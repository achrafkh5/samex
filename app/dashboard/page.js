import Navbar from '../components/Navbar';
import DashboardContent from '../components/DashboardContent';
import Footer from '../components/Footer';

export const metadata = {
  title: 'My Dashboard - Dream Cars',
  description: 'Track your order status, download documents, and manage your car purchase.',
};

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <DashboardContent />
      <Footer />
    </>
  );
}
