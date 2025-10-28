'use client';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CarDetailsContent from '../../components/CarDetailsContent';
import { useState, useEffect, use } from 'react';
import React from 'react';

export default function CarDetailsPage({ params }) {
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
    const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;

  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/cars/${id}`);
        const carData = await response.json();
        setCar(carData);
      } catch (error) {
        console.error('Error fetching car:', error);
      } finally {
        setLoading(false);
      }
      };

    fetchCar();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-4 h-4 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-4 h-4 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300">
            Loading car details...
          </p>
        </div>
        <Footer />
      </>
    );
  }


  return (
    <>
      <Navbar />
      <CarDetailsContent cars={car} />
      <Footer />
    </>
  );
}


