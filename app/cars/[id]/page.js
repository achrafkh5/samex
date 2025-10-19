import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CarDetailsContent from '../../components/CarDetailsContent';
import { getCarById } from '../../data/carsData';

export default function CarDetailsPage({ params }) {
  const car = getCarById(params.id);

  return (
    <>
      <Navbar />
      <CarDetailsContent car={car} />
      <Footer />
    </>
  );
}

export async function generateMetadata({ params }) {
  const car = getCarById(params.id);
  
  if (!car) {
    return {
      title: 'Car Not Found | DreamCars',
    };
  }

  return {
    title: `${car.brand} ${car.model} ${car.year} | DreamCars`,
    description: `View details for ${car.brand} ${car.model} ${car.year}. ${car.condition === 'new' ? 'Brand new' : car.condition === 'certified' ? 'Certified pre-owned' : 'Pre-owned'} ${car.fuelType} vehicle with ${car.specs.power}. Price: $${car.price.toLocaleString()}.`,
  };
}
