"use client";
import { useState, useEffect } from "react";


export async function getCarById(id) {
  const carId = parseInt(id);
  if (!car) return null;
  
  // Add extended details for the car details page
  return {
    ...car,
    images: [
      car.image,
      `https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=800`,
      `https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800`,
      `https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800`,
      `https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=800`,
    ],
    version: car.model,
    doors: car.brand === 'Tesla' || car.brand === 'Ferrari' || car.brand === 'Lamborghini' || car.brand === 'McLaren' ? '2' : '4',
    seats: car.brand === 'Ferrari' || car.brand === 'Lamborghini' || car.brand === 'McLaren' ? '2' : car.brand === 'Range Rover' ? '7' : '5',
    engineCapacity: car.fuelType === 'electric' ? 'Electric Motor' : 
                   car.brand === 'Ferrari' || car.brand === 'Lamborghini' ? '6.5L V12' :
                   car.brand === 'Porsche' || car.brand === 'BMW' ? '3.0L Turbo' : '4.0L V8',
    vin: `VIN${car._id}${car.brand.slice(0,3).toUpperCase()}${car.year}${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    availability: car.condition === 'new' ? 'available' : Math.random() > 0.3 ? 'available' : 'reserved',
    discount: car.price > 100000 && Math.random() > 0.5 ? 5000 : 0,
    features: [
      'Premium Sound System',
      'Leather Interior',
      'Navigation System',
      'Parking Sensors',
      'Backup Camera',
      'Bluetooth Connectivity',
      'Keyless Entry',
      'Climate Control',
      'Cruise Control',
      'Sunroof/Moonroof',
      'Heated Seats',
      'LED Headlights',
      'Apple CarPlay & Android Auto',
      'Lane Departure Warning',
      'Blind Spot Monitoring',
      'Adaptive Cruise Control'
    ]
  };
}

export const carsData = [
  {
    id: 1,
    brand: 'Tesla',
    model: 'Model S',
    year: 2024,
    price: 89990,
    condition: 'new',
    fuelType: 'electric',
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800',
    specs: {
      power: '1,020 HP',
      speed: '200 mph',
      range: '405 mi',
      color: 'Midnight Silver',
      mileage: '0 miles'
    }
  },
  {
    id: 2,
    brand: 'BMW',
    model: 'M4 Competition',
    year: 2024,
    price: 76900,
    condition: 'new',
    fuelType: 'gasoline',
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800',
    specs: {
      power: '503 HP',
      speed: '180 mph',
      range: '450 mi',
      color: 'Alpine White',
      mileage: '0 miles'
    }
  },
  {
    id: 3,
    brand: 'Mercedes-Benz',
    model: 'S-Class',
    year: 2024,
    price: 115000,
    condition: 'new',
    fuelType: 'hybrid',
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=800',
    specs: {
      power: '429 HP',
      speed: '155 mph',
      range: '500 mi',
      color: 'Obsidian Black',
      mileage: '0 miles'
    }
  },
  {
    id: 4,
    brand: 'Porsche',
    model: '911 Turbo',
    year: 2024,
    price: 174300,
    condition: 'new',
    fuelType: 'gasoline',
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800',
    specs: {
      power: '640 HP',
      speed: '205 mph',
      range: '380 mi',
      color: 'Racing Yellow',
      mileage: '0 miles'
    }
  },
  {
    id: 5,
    brand: 'Audi',
    model: 'e-tron GT',
    year: 2024,
    price: 104900,
    condition: 'new',
    fuelType: 'electric',
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=800',
    specs: {
      power: '637 HP',
      speed: '152 mph',
      range: '238 mi',
      color: 'Daytona Gray',
      mileage: '0 miles'
    }
  },
  {
    id: 6,
    brand: 'Range Rover',
    model: 'Sport',
    year: 2024,
    price: 83000,
    condition: 'new',
    fuelType: 'diesel',
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=800',
    specs: {
      power: '355 HP',
      speed: '140 mph',
      range: '470 mi',
      color: 'Fuji White',
      mileage: '0 miles'
    }
  },
  {
    id: 7,
    brand: 'Lexus',
    model: 'LS 500',
    year: 2023,
    price: 68500,
    condition: 'certified',
    fuelType: 'hybrid',
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1555353540-064f8e954a1a?q=80&w=800',
    specs: {
      power: '354 HP',
      speed: '136 mph',
      range: '420 mi',
      color: 'Sonic Silver',
      mileage: '12,500 miles'
    }
  },
  {
    id: 8,
    brand: 'Ferrari',
    model: 'F8 Tributo',
    year: 2023,
    price: 289000,
    condition: 'used',
    fuelType: 'gasoline',
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800',
    specs: {
      power: '710 HP',
      speed: '211 mph',
      range: '320 mi',
      color: 'Rosso Corsa',
      mileage: '8,200 miles'
    }
  },
  {
    id: 9,
    brand: 'Lamborghini',
    model: 'Huracán',
    year: 2023,
    price: 245000,
    condition: 'certified',
    fuelType: 'gasoline',
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?q=80&w=800',
    specs: {
      power: '630 HP',
      speed: '202 mph',
      range: '300 mi',
      color: 'Verde Mantis',
      mileage: '5,800 miles'
    }
  },
  {
    id: 10,
    brand: 'Bentley',
    model: 'Continental GT',
    year: 2024,
    price: 225000,
    condition: 'new',
    fuelType: 'gasoline',
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?q=80&w=800',
    specs: {
      power: '626 HP',
      speed: '207 mph',
      range: '400 mi',
      color: 'Beluga',
      mileage: '0 miles'
    }
  },
  {
    id: 11,
    brand: 'Rolls-Royce',
    model: 'Ghost',
    year: 2024,
    price: 335000,
    condition: 'new',
    fuelType: 'gasoline',
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?q=80&w=800',
    specs: {
      power: '563 HP',
      speed: '155 mph',
      range: '380 mi',
      color: 'Arctic White',
      mileage: '0 miles'
    }
  },
  {
    id: 12,
    brand: 'Maserati',
    model: 'MC20',
    year: 2023,
    price: 215000,
    condition: 'used',
    fuelType: 'gasoline',
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1616788494707-ec722c35d027?q=80&w=800',
    specs: {
      power: '621 HP',
      speed: '202 mph',
      range: '310 mi',
      color: 'Blu Infinito',
      mileage: '3,500 miles'
    }
  },
  {
    id: 13,
    brand: 'Jaguar',
    model: 'F-TYPE R',
    year: 2023,
    price: 74500,
    condition: 'certified',
    fuelType: 'gasoline',
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=800',
    specs: {
      power: '575 HP',
      speed: '186 mph',
      range: '360 mi',
      color: 'Santorini Black',
      mileage: '9,200 miles'
    }
  },
  {
    id: 14,
    brand: 'Aston Martin',
    model: 'DB11',
    year: 2023,
    price: 195000,
    condition: 'used',
    fuelType: 'gasoline',
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=800',
    specs: {
      power: '630 HP',
      speed: '208 mph',
      range: '350 mi',
      color: 'Intense Blue',
      mileage: '6,800 miles'
    }
  },
  {
    id: 15,
    brand: 'McLaren',
    model: '720S',
    year: 2023,
    price: 289000,
    condition: 'certified',
    fuelType: 'gasoline',
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800',
    specs: {
      power: '710 HP',
      speed: '212 mph',
      range: '310 mi',
      color: 'Volcano Orange',
      mileage: '4,100 miles'
    }
  },
  {
    id: 16,
    brand: 'Cadillac',
    model: 'Escalade',
    year: 2024,
    price: 89990,
    condition: 'new',
    fuelType: 'diesel',
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?q=80&w=800',
    specs: {
      power: '420 HP',
      speed: '130 mph',
      range: '500 mi',
      color: 'Black Raven',
      mileage: '0 miles'
    }
  }
];
