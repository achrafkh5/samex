'use client';

import { useState,useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '../../../components/LanguageProvider';
import { carsData } from '../../../data/carsData';

export default function CarsModule() {
  const { t } = useLanguage();
  const [cars, setCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Images, 2: Info, 3: Features
  
  // Image upload state
  const [carImages, setCarImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    priceType: 'fixed', // 'fixed' or 'range'
    priceMin: '',
    priceMax: '',
    condition: 'new',
    fuelType: 'gasoline',
    transmission: 'automatic',
    power: '',
    colors: [], // Changed to array
    vin: '',
    images: [] // Changed to array
  });
  
  // Features state
  const [features, setFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState('');
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Available colors
  const availableColors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Red', hex: '#DC2626' },
    { name: 'Blue', hex: '#2563EB' },
    { name: 'Green', hex: '#16A34A' },
    { name: 'Yellow', hex: '#EAB308' },
    { name: 'Orange', hex: '#EA580C' },
    { name: 'Brown', hex: '#92400E' },
    { name: 'Beige', hex: '#D4AF37' },
    { name: 'Gold', hex: '#FFD700' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [carsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/cars'),
          fetch('/api/brands')
        ]);
        const carsData = await carsResponse.json();
        const categoriesData = await categoriesResponse.json();
        setCars(carsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  let filteredCars = [
    ...cars
  ];
if(cars?.length>0){
   filteredCars = cars?.filter(car => {
    const matchesStatus = filterStatus === 'all' || car.availability === filterStatus;
    const matchesSearch = car.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         car.model?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });
}
  const handleAdd = () => {
    setEditingCar(null);
    setCurrentStep(1);
    setCarImages([]);
    setFeatures([]);
    setFormData({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      price: '',
      priceType: 'fixed',
      priceMin: '',
      priceMax: '',
      condition: 'new',
      fuelType: 'gasoline',
      transmission: 'automatic',
      power: '',
      colors: [],
      vin: '',
      images: []
    });
    setIsModalOpen(true);
  };

  // Handle image upload to Cloudinary
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (carImages.length + files.length > 5) {
      showToastMessage('Maximum 5 images allowed');
      return;
    }

    setUploadingImages(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setCarImages([...carImages, ...uploadedUrls]);
      showToastMessage(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading images:', error);
      showToastMessage('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  // Remove image
  const removeImage = async (index) => {
    const imageUrl = carImages[index];
    
    // Delete from Cloudinary
    try {
      const response = await fetch('/api/upload/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: imageUrl }),
      });

      if (response.ok) {
        console.log('✅ Image deleted from Cloudinary');
      } else {
        console.warn('⚠️ Failed to delete image from Cloudinary');
      }
    } catch (error) {
      console.error('❌ Error deleting image:', error);
    }

    // Remove from local state
    setCarImages(carImages.filter((_, i) => i !== index));
    showToastMessage('Image removed');
  };

  // Toggle color selection
  const toggleColor = (colorName) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(colorName)
        ? prev.colors.filter(c => c !== colorName)
        : [...prev.colors, colorName]
    }));
  };

  // Add feature
  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  // Remove feature
  const removeFeature = (feature) => {
    setFeatures(features.filter(f => f !== feature));
  };

  // Handle step navigation
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (carImages.length === 0) {
        showToastMessage('Please upload at least one image');
        return;
      }
      setFormData(prev => ({ ...prev, images: carImages }));
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate basic fields
      if (!formData.brand || !formData.model) {
        showToastMessage('Please fill all required fields');
        return;
      }
      
      // Validate price based on price type
      if (formData.priceType === 'fixed') {
        if (!formData.price || formData.price <= 0) {
          showToastMessage('Please enter a valid price');
          return;
        }
      } else if (formData.priceType === 'range') {
        if (!formData.priceMin || !formData.priceMax) {
          showToastMessage('Please enter both minimum and maximum prices');
          return;
        }
        if (parseInt(formData.priceMin) <= 0 || parseInt(formData.priceMax) <= 0) {
          showToastMessage('Prices must be greater than 0');
          return;
        }
        if (parseInt(formData.priceMin) >= parseInt(formData.priceMax)) {
          showToastMessage('Minimum price must be less than maximum price');
          return;
        }
      }
      
      if (formData.colors.length === 0) {
        showToastMessage('Please select at least one color');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleEdit = (car) => {
    setEditingCar(car);
    setCurrentStep(1);
    
    // Load existing images
    const existingImages = car.images || (car.image ? [car.image] : []);
    setCarImages(existingImages);
    
    // Load existing features
    const existingFeatures = car.specs?.features || [];
    setFeatures(existingFeatures);
    
    // Load existing colors
    const existingColors = car.specs?.colors || (car.specs?.color ? [car.specs.color] : []);
    
    // Determine price type and values
    const hasPriceRange = car.priceMin && car.priceMax;
    
    setFormData({
      brand: car.brand,
      model: car.model,
      year: car.year,
      price: hasPriceRange ? '' : (car.price || ''),
      priceType: hasPriceRange ? 'range' : 'fixed',
      priceMin: car.priceMin || '',
      priceMax: car.priceMax || '',
      condition: car.condition,
      fuelType: car.fuelType,
      transmission: car.transmission,
      power: car.specs?.power || '',
      colors: existingColors,
      vin: car.vin || '',
      images: existingImages
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm(t('confirmDelete') || 'Are you sure you want to delete this car?')) {
      setProcessing(true);
      try {
        const car = cars.find(c => c._id === id);
        
        // Delete car from database
        await fetch(`/api/cars/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id })
        });
        
        // Delete all car images from Cloudinary
        const imagesToDelete = car?.images || (car?.image ? [car.image] : []);
        
        if (imagesToDelete.length > 0) {
          for (const imageUrl of imagesToDelete) {
            try {
              await fetch('/api/upload/delete', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: imageUrl }),
              });
              console.log('✅ Car image deleted from Cloudinary:', imageUrl);
            } catch (error) {
              console.error('⚠️ Failed to delete car image from Cloudinary:', error);
            }
          }
        }
        
        setCars(cars.filter(car => car._id !== id));
        showToastMessage(t('carDeleted') || 'Car deleted successfully');
      } catch (error) {
        console.error('Error deleting car:', error);
      } finally {
        setProcessing(false);
      }
    }
  };

  const toggleAvailability = async (id) => {
    setProcessing(true);
    try {
      await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          availability: cars.find(car => car._id === id).availability === 'available' ? 'sold' : 'available'
        })
      });
      setCars(cars.map(car =>
      car._id === id
        ? { ...car, availability: car.availability === 'available' ? 'sold' : 'available' }
        : car
    ));
    showToastMessage(t('statusUpdated') || 'Status updated successfully');
    }catch (error) {
      console.error('Error updating car availability:', error);
    } finally {
      setProcessing(false);
    }
  };

  const togglePin = async (id) => {
    setProcessing(true);
    try {
      const car = cars.find(c => c._id === id);
      const currentlyPinned = cars.filter(c => c.isPinned).length;
      
      // Check if trying to pin more than 4 cars
      if (!car.isPinned && currentlyPinned >= 4) {
        showToastMessage(t('maxPinnedReached') || 'Maximum 4 cars can be pinned');
        setProcessing(false);
        return;
      }
      
      await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isPinned: !car.isPinned
        })
      });
      
      setCars(cars.map(c =>
        c._id === id
          ? { ...c, isPinned: !c.isPinned }
          : c
      ));
      
      showToastMessage(car.isPinned ? (t('carUnpinned') || 'Car unpinned from homepage') : (t('carPinned') || 'Car pinned to homepage'));
    } catch (error) {
      console.error('Error toggling pin status:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    if (editingCar) {
        try{
          // Delete removed images from Cloudinary
          const originalImages = editingCar.images || (editingCar.image ? [editingCar.image] : []);
          const removedImages = originalImages.filter(img => !carImages.includes(img));
          
          // Delete each removed image from Cloudinary
          for (const imageUrl of removedImages) {
            try {
              await fetch('/api/upload/delete', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: imageUrl }),
              });
              console.log('✅ Deleted removed image from Cloudinary:', imageUrl);
            } catch (error) {
              console.error('❌ Error deleting image:', error);
            }
          }
          
          // Prepare car data based on price type
          const carData = {
            brand: formData.brand,
            model: formData.model,
            year: formData.year,
            condition: formData.condition,
            fuelType: formData.fuelType,
            transmission: formData.transmission,
            vin: formData.vin,
            images: carImages,
            image: carImages[0] || '',
            specs: {
              power: formData.power,
              colors: formData.colors,
              features: features
            }
          };

          // Add price fields based on type
          if (formData.priceType === 'range') {
            carData.priceType = 'range';
            carData.priceMin = parseInt(formData.priceMin);
            carData.priceMax = parseInt(formData.priceMax);
            carData.price = null; // Clear fixed price
          } else {
            carData.priceType = 'fixed';
            carData.price = parseInt(formData.price);
            carData.priceMin = null; // Clear range
            carData.priceMax = null;
          }
          
          await fetch(`/api/cars/${editingCar._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(carData)
          });
          
          setCars(cars.map(car =>
            car._id === editingCar._id
              ? {
                  ...car,
                  ...carData,
                  specs: {
                    ...car.specs,
                    power: formData.power,
                    colors: formData.colors,
                    features: features
                  }
                }
              : car
          ));
          showToastMessage(t('carUpdated') || 'Car updated successfully');
        }catch (error) {
          console.error('Error updating car:', error);
          showToastMessage('Failed to update car');
        }
    } else {
      // Prepare new car data based on price type
      const newCarData = {
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        condition: formData.condition,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        vin: formData.vin,
        images: carImages,
        image: carImages[0] || '',
        specs: {
          power: formData.power,
          colors: formData.colors,
          features: features,
          mileage: '0 miles'
        },
        availability: 'available'
      };

      // Add price fields based on price type
      if (formData.priceType === 'range') {
        newCarData.priceType = 'range';
        newCarData.priceMin = parseInt(formData.priceMin);
        newCarData.priceMax = parseInt(formData.priceMax);
        newCarData.price = null;
      } else {
        newCarData.priceType = 'fixed';
        newCarData.price = parseInt(formData.price);
        newCarData.priceMin = null;
        newCarData.priceMax = null;
      }

      try{
        const response = await fetch('/api/cars', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newCarData)
        });
        const addedCar = await response.json();
        setCars([...cars, addedCar]);
      }catch (error) {
        console.error('Error adding car:', error);
      }
      showToastMessage(t('carAdded') || 'Car added successfully');
    }
    
    setIsModalOpen(false);
    setCurrentStep(1);
    setCarImages([]);
    setFeatures([]);
    setProcessing(false);
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('carsManagement') || 'Cars Management'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('carsManagementDescription') || 'Manage your car inventory'}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>{t('addCar') || 'Add Car'}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder={t('searchCars') || 'Search cars...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex space-x-2">
          {['all', 'available', 'sold'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t(status) || status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Cars Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('loading') || 'Loading cars...'}</p>
        </div>
      ) : filteredCars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('noCars') || 'No cars found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
          <div key={car._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={car.image}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  car.availability === 'available'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {car.availability === 'available' ? (t('available') || 'Available') : (t('sold') || 'Sold')}
                </span>
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {car.brand} {car.model}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {car.year} • {car.condition}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {car.priceType === 'range' 
                    ? `${car.priceMin?.toLocaleString()} - ${car.priceMax?.toLocaleString()} DZD`
                    : `${car.price?.toLocaleString()} DZD`
                  }
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{t('fuel') || 'Fuel'}:</span>
                  <span className="ml-1">{car.fuelType}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{t('transmission') || 'Trans'}:</span>
                  <span className="ml-1">{car.transmission}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => togglePin(car._id)}
                  disabled={processing}
                  className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    car.isPinned
                      ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  title={car.isPinned ? 'Unpin from homepage' : 'Pin to homepage'}
                >
                  <svg className="w-5 h-5" fill={car.isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
                <button
                  onClick={() => toggleAvailability(car._id)}
                  disabled={processing}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {car.availability === 'available' ? (t('markSold') || 'Mark Sold') : (t('markAvailable') || 'Mark Available')}
                </button>
                <button
                  onClick={() => handleEdit(car)}
                  disabled={processing}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(car._id)}
                  disabled={processing}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Add/Edit Modal - Multi-Step */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingCar ? (t('editCar') || 'Edit Car') : (t('addCar') || 'Add New Car')}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Step {currentStep} of 3
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentStep(1);
                    setCarImages([]);
                    setFeatures([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                  1
                </div>
                <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              </div>
              <div className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                  2
                </div>
                <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              </div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                3
              </div>
            </div>

            {/* Step 1: Image Upload */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Upload Car Photos (Max 5)
                  </h3>
                  
                  {/* Image Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {carImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Car ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                    
                    {/* Add Photo Button */}
                    {carImages.length < 5 && (
                      <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-600 dark:hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          disabled={uploadingImages}
                          className="hidden"
                        />
                        {uploadingImages ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Uploading...</span>
                          </div>
                        ) : (
                          <>
                            <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Add Photo</span>
                          </>
                        )}
                      </label>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {carImages.length} of 5 photos uploaded. First photo will be the primary display image.
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setCurrentStep(1);
                      setCarImages([]);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={carImages.length === 0}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Info
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Car Information & Colors */}
            {currentStep === 2 && (
              <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Car Information
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('brand') || 'Brand'} *
                      </label>
                      <select
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a brand...</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('model') || 'Model'} *
                      </label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('year') || 'Year'} *
                      </label>
                      <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        required
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {/* Price Type Selection */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        {t('priceType') || 'Price Type'} *
                      </label>
                      <div className="flex space-x-4 mb-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="priceType"
                            value="fixed"
                            checked={formData.priceType === 'fixed'}
                            onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-900 dark:text-white">{t('fixedPrice') || 'Fixed Price'}</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="priceType"
                            value="range"
                            checked={formData.priceType === 'range'}
                            onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-900 dark:text-white">{t('priceRange') || 'Price Range'}</span>
                        </label>
                      </div>

                      {/* Conditional Price Inputs */}
                      {formData.priceType === 'fixed' ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('price') || 'Price'} (DZD) *
                          </label>
                          <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                            min="0"
                            placeholder="e.g., 2000000"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t('minPrice') || 'Minimum Price'} (DZD) *
                            </label>
                            <input
                              type="number"
                              value={formData.priceMin}
                              onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                              required
                              min="0"
                              placeholder="e.g., 2000000"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t('maxPrice') || 'Maximum Price'} (DZD) *
                            </label>
                            <input
                              type="number"
                              value={formData.priceMax}
                              onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                              required
                              min="0"
                              placeholder="e.g., 2500000"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('condition') || 'Condition'}
                      </label>
                      <select
                        value={formData.condition}
                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="new">New</option>
                        <option value="used">Used</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('fuelType') || 'Fuel Type'}
                      </label>
                      <select
                        value={formData.fuelType}
                        onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="gasoline">Gasoline</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Electric</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('transmission') || 'Transmission'}
                      </label>
                      <select
                        value={formData.transmission}
                        onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="automatic">Automatic</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('power') || 'Power'}
                      </label>
                      <input
                        type="text"
                        value={formData.power}
                        onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                        placeholder="e.g., 503 HP"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('vin') || 'VIN'}
                      </label>
                      <input
                        type="text"
                        value={formData.vin}
                        onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Available Colors *
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Select all colors available for this car
                  </p>
                  
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {availableColors.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => toggleColor(color.name)}
                        className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                          formData.colors.includes(color.name)
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: color.hex }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {color.name}
                        </span>
                        {formData.colors.includes(color.name) && (
                          <svg className="w-5 h-5 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {formData.colors.length > 0 && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-3">
                      {formData.colors.length} color(s) selected
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                  >
                    Back to Photos
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all"
                  >
                    Continue to Features
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Features */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Car Features
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Add features manually. Examples: Sunroof, Leather Seats, Navigation System, etc.
                  </p>
                  
                  {/* Add Feature Input */}
                  <div className="flex space-x-2 mb-4">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      placeholder="Enter a feature..."
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Features List */}
                  {features.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-900 dark:text-white font-medium">{feature}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFeature(feature)}
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <svg className="w-16 h-16 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p>No features added yet</p>
                      <p className="text-sm mt-1">Start adding features to describe your car</p>
                    </div>
                  )}
                  
                  {features.length > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                      {features.length} feature(s) added
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                  >
                    Back to Info
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{editingCar ? 'Update Car' : 'Add Car'}</span>
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 z-50">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Processing Spinner Overlay */}
      {processing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">
                {t('processing') || 'Processing...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
