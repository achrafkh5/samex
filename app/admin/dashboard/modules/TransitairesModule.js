'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';

export default function TransitairesModule() {
  const { t } = useLanguage();
  const [transitaires, setTransitaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransitaire, setEditingTransitaire] = useState(null);
  
  const [formData, setFormData] = useState({
    num_agrement: '',
    nom_ou_raison_sociale: '',
    represente_par: '',
    nif: '',
    wilaya: '',
  });
  
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [transitaireToDelete, setTransitaireToDelete] = useState(null);

  // Algerian wilayas
  const wilayas = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 
    'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 
    'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 
    'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', 
    'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 
    'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela', 
    'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 
    'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 
    'Béni Abbès', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair', 
    'El Meniaa'
  ];

  useEffect(() => {
    fetchTransitaires();
  }, []);

  const fetchTransitaires = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/transitaires');
      const data = await response.json();
      setTransitaires(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching transitaires:', error);
      showToastMessage(t('errorFetchingData') || 'Error fetching data', 'error');
      setTransitaires([]);
    } finally {
      setLoading(false);
    }
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const openModal = (transitaire = null) => {
    if (transitaire) {
      setEditingTransitaire(transitaire);
      setFormData({
        num_agrement: transitaire.num_agrement,
        nom_ou_raison_sociale: transitaire.nom_ou_raison_sociale,
        represente_par: transitaire.represente_par || '',
        nif: transitaire.nif,
        wilaya: transitaire.wilaya,
      });
    } else {
      setEditingTransitaire(null);
      setFormData({
        num_agrement: '',
        nom_ou_raison_sociale: '',
        represente_par: '',
        nif: '',
        wilaya: '',
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransitaire(null);
    setFormData({
      num_agrement: '',
      nom_ou_raison_sociale: '',
      represente_par: '',
      nif: '',
      wilaya: '',
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.num_agrement.trim()) newErrors.num_agrement = t('required');
    if (!formData.nom_ou_raison_sociale.trim()) newErrors.nom_ou_raison_sociale = t('required');
    if (!formData.nif.trim()) newErrors.nif = t('required');
    if (!formData.wilaya.trim()) newErrors.wilaya = t('required');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setProcessing(true);
    try {
      const url = editingTransitaire 
        ? `/api/transitaires/${editingTransitaire._id}`
        : '/api/transitaires';
      
      const method = editingTransitaire ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save transitaire');
      }

      showToastMessage(
        editingTransitaire 
          ? t('transitaireUpdated') 
          : t('transitaireCreated'),
        'success'
      );
      
      closeModal();
      fetchTransitaires();
    } catch (error) {
      console.error('Error saving transitaire:', error);
      showToastMessage(error.message || t('errorSavingData'), 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/transitaires/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete transitaire');
      }

      showToastMessage(t('transitaireDeleted'), 'success');
      fetchTransitaires();
    } catch (error) {
      console.error('Error deleting transitaire:', error);
      showToastMessage(t('errorDeletingData'), 'error');
    } finally {
      setProcessing(false);
      setDeleteConfirmOpen(false);
      setTransitaireToDelete(null);
    }
  };

  const openDeleteConfirm = (transitaire) => {
    setTransitaireToDelete(transitaire);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setTransitaireToDelete(null);
  };

  const handleDownload = async (transitaire) => {
    try {
      // Check if PDF URL exists in database
      if (transitaire.pdfUrl) {
        // Open PDF in new tab only (don't trigger download in same tab)
        window.open(transitaire.pdfUrl, '_blank');
      } else {
        // If no PDF URL exists, generate it
        showToastMessage(t('generatingPDF'), 'success');
        setProcessing(true);

        const response = await fetch('/api/generate-mandat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            num_agrement: transitaire.num_agrement,
            nom_ou_raison_sociale: transitaire.nom_ou_raison_sociale,
            represente_par: transitaire.represente_par,
            nif: transitaire.nif,
            wilaya: transitaire.wilaya,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate PDF');
        }

        const data = await response.json();
        
        // Update transitaire with new PDF URL
        await fetch(`/api/transitaires/${transitaire._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            num_agrement: transitaire.num_agrement,
            nom_ou_raison_sociale: transitaire.nom_ou_raison_sociale,
            represente_par: transitaire.represente_par,
            nif: transitaire.nif,
            wilaya: transitaire.wilaya,
            pdfUrl: data.url,
          }),
        });
        
        // Open PDF in new tab only
        window.open(data.url, '_blank');

        showToastMessage(t('pdfGenerated'), 'success');
        
        // Refresh the list to get updated PDF URL
        fetchTransitaires();
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showToastMessage(t('errorGeneratingPDF'), 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Filter transitaires based on search query
  const filteredTransitaires = Array.isArray(transitaires) ? transitaires.filter(t => 
    t.nom_ou_raison_sociale?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.num_agrement?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.wilaya?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.nif?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('transitairesManagement')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('manageTransitaires')}
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('addTransitaire')}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder={t('searchTransitaires')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
          />
          <svg
            className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Transitaires Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">{t('loading')}</p>
        </div>
      ) : filteredTransitaires.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <svg className="w-20 h-20 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-6 text-gray-600 dark:text-gray-400 text-lg">{t('noTransitairesFound')}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('agreementNumber')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('nameOrCompany')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('nif')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('wilaya')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransitaires.map((transitaire) => (
                  <tr key={transitaire._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {transitaire.num_agrement}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-300">
                      <div className="max-w-xs">
                        {transitaire.nom_ou_raison_sociale}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {transitaire.nif}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {transitaire.wilaya}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleDownload(transitaire)}
                          className={`p-2 rounded-lg transition-all ${
                            transitaire.pdfUrl 
                              ? 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20' 
                              : 'text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20'
                          }`}
                          disabled={processing}
                          title={transitaire.pdfUrl ? t('downloadMandat') : t('generateAndDownload')}
                        >
                          {transitaire.pdfUrl ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => openModal(transitaire)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          title={t('edit')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(transitaire)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          disabled={processing}
                          title={t('delete')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={closeModal}>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

            {/* Modal panel */}
            <div 
              className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit}>
                <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingTransitaire ? t('editTransitaire') : t('addTransitaire')}
                  </h3>
                </div>

                <div className="px-8 py-6 space-y-6">
                  {/* Agreement Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('agreementNumber')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="num_agrement"
                      value={formData.num_agrement}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all ${
                        errors.num_agrement ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="e.g., AG-2024-001"
                    />
                    {errors.num_agrement && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.num_agrement}
                      </p>
                    )}
                  </div>

                  {/* Name or Company */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('nameOrCompany')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nom_ou_raison_sociale"
                      value={formData.nom_ou_raison_sociale}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all ${
                        errors.nom_ou_raison_sociale ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder={t('enterNameOrCompany')}
                    />
                    {errors.nom_ou_raison_sociale && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.nom_ou_raison_sociale}
                      </p>
                    )}
                  </div>

                  {/* Represented By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('representedBy')}
                    </label>
                    <input
                      type="text"
                      name="represente_par"
                      value={formData.represente_par}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                      placeholder={t('enterRepresentedBy')}
                    />
                  </div>

                  {/* NIF */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('nif')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nif"
                      value={formData.nif}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all ${
                        errors.nif ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder={t('enterNIF')}
                    />
                    {errors.nif && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.nif}
                      </p>
                    )}
                  </div>

                  {/* Wilaya */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('wilaya')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="wilaya"
                      value={formData.wilaya}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all ${
                        errors.wilaya ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">{t('selectWilaya')}</option>
                      {wilayas.map((wilaya) => (
                        <option key={wilaya} value={wilaya}>
                          {wilaya}
                        </option>
                      ))}
                    </select>
                    {errors.wilaya && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.wilaya}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-8 py-6 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-lg hover:shadow-xl"
                  >
                    {processing ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('saving')}
                      </span>
                    ) : t('save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && transitaireToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={closeDeleteConfirm}>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

            {/* Dialog panel */}
            <div 
              className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-8 py-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {t('confirmDeleteTransitaire')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {t('deleteTransitaireWarning') || 'Are you sure you want to delete this transitaire? This action cannot be undone.'}
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                      <p className="text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('agreementNumber')}:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{transitaireToDelete.num_agrement}</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('nameOrCompany')}:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{transitaireToDelete.nom_ou_raison_sociale}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeDeleteConfirm}
                  disabled={processing}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(transitaireToDelete._id)}
                  disabled={processing}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-lg hover:shadow-xl"
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('deleting') || 'Deleting...'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {t('delete')}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className={`px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 ${
            toastType === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {toastType === 'success' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
