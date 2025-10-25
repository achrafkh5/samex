'use client';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CarDetailsContent from '../../components/CarDetailsContent';
import { useState, useEffect, use } from 'react';
import React from 'react';

export default function CarDetailsPage({ params }) {
  const [car, setCar] = useState(null);
    const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;

  useEffect(() => {
    const fetchCar = async () => {
      const response = await fetch(`/api/cars/${id}`);
      const carData = await response.json();
      setCar(carData);
      };

    fetchCar();
  }, [id]);



  return (
    <>
      <Navbar />
      <CarDetailsContent cars={car} />
      <Footer />
    </>
  );
}


