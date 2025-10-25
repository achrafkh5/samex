'use client';

import { useState,useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '../../../components/LanguageProvider';
import { carsData } from '../../../data/carsData';

export default function CarsModule() {
  const { t } = useLanguage();
  const [cars, setCars] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    condition: 'new',
    fuelType: 'gasoline',
    transmission: 'automatic',
    power: '',
    color: '',
    vin: '',
    image: ''
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
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
    setFormData({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      price: '',
      condition: 'new',
      fuelType: 'gasoline',
      transmission: 'automatic',
      power: '',
      color: '',
      vin: '',
      image: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (car) => {
    setEditingCar(car);
    setFormData({
      brand: car.brand,
      model: car.model,
      year: car.year,
      price: car.price,
      condition: car.condition,
      fuelType: car.fuelType,
      transmission: car.transmission,
      power: car.specs?.power || '',
      color: car.specs?.color || '',
      vin: car.vin || '',
      image: car.image || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm(t('confirmDelete') || 'Are you sure you want to delete this car?')) {
      try {
        await fetch(`/api/cars/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id })
        });
        setCars(cars.filter(car => car._id !== id));
        showToastMessage(t('carDeleted') || 'Car deleted successfully');
      } catch (error) {
        console.error('Error deleting car:', error);
      }
    }
  };

  const toggleAvailability = async (id) => {
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingCar) {
        try{
          await fetch(`/api/cars/${editingCar._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...formData,
              specs: {
                power: formData.power,
                color: formData.color
              }
            })
          });
          setCars(cars.map(car =>
        car._id === editingCar._id
          ? {
              ...car,
              ...formData,
              specs: {
                ...car.specs,
                power: formData.power,
                color: formData.color
              }
            }
          : car
      ));
      showToastMessage(t('carUpdated') || 'Car updated successfully');
        }catch (error) {
          console.error('Error updating car:', error);
        }
    } else {
      const newCar = {
        ...formData,
        specs: {
          power: formData.power,
          color: formData.color,
          mileage: '0 miles'
        },
        availability: 'available'
      };
      try{
        await fetch('/api/cars', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newCar)
        });
      }catch (error) {
        console.error('Error adding car:', error);
      }
      setCars([...cars, newCar]);
      showToastMessage(t('carAdded') || 'Car added successfully');
    }
    
    setIsModalOpen(false);
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
                  ${car.price.toLocaleString()}
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
                  onClick={() => toggleAvailability(car._id)}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
                >
                  {car.availability === 'available' ? (t('markSold') || 'Mark Sold') : (t('markAvailable') || 'Mark Available')}
                </button>
                <button
                  onClick={() => handleEdit(car)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(car._id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingCar ? (t('editCar') || 'Edit Car') : (t('addCar') || 'Add Car')}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('brand') || 'Brand (Category)'}
                  </label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('selectBrand') || 'Select a brand...'}</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('model') || 'Model'}
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
                    {t('year') || 'Year'}
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('price') || 'Price'} ($)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
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
                    <option value="new">{t('new') || 'New'}</option>
                    <option value="used">{t('used') || 'Used'}</option>
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
                    <option value="gasoline">{t('gasoline') || 'Gasoline'}</option>
                    <option value="diesel">{t('diesel') || 'Diesel'}</option>
                    <option value="electric">{t('electric') || 'Electric'}</option>
                    <option value="hybrid">{t('hybrid') || 'Hybrid'}</option>
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
                    <option value="automatic">{t('automatic') || 'Automatic'}</option>
                    <option value="manual">{t('manual') || 'Manual'}</option>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('color') || 'Color'}
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('imageUrl') || 'Image URL'}
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all"
                >
                  {editingCar ? (t('update') || 'Update') : (t('add') || 'Add')}
                </button>
              </div>
            </form>
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
    </div>
  );
}
