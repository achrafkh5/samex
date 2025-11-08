'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';

export default function PaymentMethodsModule() {
  const { t } = useLanguage();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', enabled: true });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState(null);

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments');
      if (!response.ok) {
        console.error('Error fetching payment methods:', response.statusText);
        setMethods([]);
        return;
      }
      const data = await response.json();
      setMethods(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMethod = async (id) => {
    const method = methods.find(m => m._id === id);
    if (!method) return;

    setProcessing(true);
    const response = await fetch(`/api/payments`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, enabled: !method.enabled }),
    });

    if (response.ok) {
      setMethods(methods.map(m => m._id === id ? { ...m, enabled: !m.enabled } : m));
      showToastMessage(t('methodUpdated') || 'Payment method updated');
    } else {
      console.error('Error updating payment method:', response.statusText);
    }
    setProcessing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setProcessing(true);
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      // Refetch all methods to get the new one with proper _id from database
      await fetchPaymentMethods();
      setFormData({ name: '', description: '', enabled: true });
      setIsModalOpen(false);
      showToastMessage(t('methodAdded') || 'Payment method added');
    } else {
      console.error('Error adding payment method:', response.statusText);
    }
    setProcessing(false);
  };

  const openDeleteConfirm = (method) => {
    setMethodToDelete(method);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setMethodToDelete(null);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);

    const response = await fetch('/api/payments', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      setMethods(methods.filter(m => m._id !== id));
      showToastMessage(t('methodDeleted') || 'Payment method deleted');
    } else {
      console.error('Error deleting payment method:', response.statusText);
    }

    setDeletingId(null);
    closeDeleteConfirm();
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('paymentMethodsManagement') || 'Payment Methods'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('paymentMethodsDescription') || 'Configure accepted payment methods'}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>{t('addMethod') || 'Add Method'}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('loading') || 'Loading payment methods...'}</p>
        </div>
      ) : methods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('noPaymentMethods') || 'No payment methods found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map((method) => (
          <div key={method._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 relative">
            {/* Delete Button */}
            <button
              onClick={() => openDeleteConfirm(method)}
              disabled={deletingId === method._id || processing}
              className="absolute top-4 right-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={t('delete') || 'Delete'}
            >
              {deletingId === method._id ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>

            <div className="flex items-center justify-between mb-4 pr-8">
              <span className="text-4xl">💳</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={method.enabled}
                  onChange={() => toggleMethod(method._id)}
                  disabled={processing}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{method.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{method.description}</p>
          </div>
        ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('addMethod') || 'Add Method'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('name') || 'Name'}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('description') || 'Description'}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={processing}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('add') || 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 z-50">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deleteConfirmOpen && methodToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
              {t('confirmDeleteMethod') || 'Delete Payment Method?'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              {t('delete_warning') || 'This action cannot be undone. The payment method will be permanently removed.'}
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl">💳</span>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 dark:text-white">{methodToDelete.name}</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">{methodToDelete.description}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeDeleteConfirm}
                disabled={deletingId}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={() => handleDelete(methodToDelete._id)}
                disabled={deletingId}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId === methodToDelete._id ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('deleting') || 'Deleting...'}
                  </>
                ) : (
                  t('delete') || 'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Spinner Overlay */}
      {(processing || deletingId) && (
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
