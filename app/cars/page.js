import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CarsPageContent from '../components/CarsPageContent';

export const metadata = {
  title: "Available Cars - DreamCars",
  description: "Browse our extensive collection of premium vehicles. Find your perfect car from our inventory of new, used, and certified pre-owned vehicles.",
};

export default function CarsPage() {
  return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <CarsPageContent />
        <Footer />
      </div>
  );
}
