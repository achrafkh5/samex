export async function generateMetadata({ params }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/cars/${params.id}`,
      { cache: 'no-store' } // avoid cached metadata
    );

    if (!response.ok) {
      return { title: 'Car Not Found | DreamCars' };
    }

    const car = await response.json();

    return {
      title: `${car.brand} ${car.model} ${car.year} | DreamCars`,
      description: `View details for ${car.brand} ${car.model} ${car.year}. ${
        car.condition === 'new'
          ? 'Brand new'
          : car.condition === 'certified'
          ? 'Certified pre-owned'
          : 'Pre-owned'
      } ${car.fuelType} vehicle with ${car.specs?.power || 'unknown power'}. Price: $${car.price?.toLocaleString()}.`,
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    return {
      title: 'Car Not Found | DreamCars',
    };
  }
}