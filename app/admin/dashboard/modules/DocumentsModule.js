'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';

export default function DocumentsModule() {
  const { t } = useLanguage();
  
  const [documents, setDocuments] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [carsMap, setCarsMap] = useState({});
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          
          // Fetch orders and clients in parallel
          const [documentsResponse, carsResponse] = await Promise.all([
            fetch('/api/admin/documents'),
            fetch('/api/cars'),
          ]);
          const documentsData = await documentsResponse.json();
          const carsData = await carsResponse.json();
          setDocuments(documentsData);
          setCars(carsData);
          if (carsData.length > 0) {
            const map = {};
            (carsData || [])?.forEach(car => {
              map[car._id] = car;
            });
            setCarsMap(map);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

  const getCarName = (carId) => {
    return `${carsMap[carId]?.brand || 'Unknown brand'} ${carsMap[carId]?.model || 'Unknown model'}`;
  };
  const handleDeleteDocument = async (id) => {
    setDocumentToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    const id = documentToDelete;
    setShowDeleteConfirm(false);
    setDocumentToDelete(null);
    setDeleting(true);

    try {
      // First, get the document details to extract the Cloudinary URL
      const doc = documents.find(d => d._id === id);
      if (!doc) {
        showToast(t('documentNotFound') || 'Document not found', 'error');
        return;
      }

      // Delete from Cloudinary first if URL exists
      let cloudinaryDeleted = false;
      let cloudinaryWarning = null;
      
      if (doc.url) {
        try {
          const deletePayload = { url: doc.url };
          
          // If we have the public_id and resource_type stored, use them for more reliable deletion
          if (doc.cloudinaryPublicId) {
            deletePayload.publicId = doc.cloudinaryPublicId;
            deletePayload.resourceType = doc.cloudinaryResourceType || 'raw';
            console.log('🎯 Using stored Cloudinary public_id for deletion:', doc.cloudinaryPublicId);
          }
          
          const cloudinaryResponse = await fetch('/api/upload/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deletePayload),
          });

          const cloudinaryData = await cloudinaryResponse.json();
          
          if (cloudinaryResponse.ok && cloudinaryData.success) {
            cloudinaryDeleted = true;
            console.log('Successfully deleted from Cloudinary');
          } else if (cloudinaryData.warning) {
            cloudinaryWarning = cloudinaryData.warning;
            console.warn('Cloudinary deletion warning:', cloudinaryWarning);
          } else {
            console.error('Failed to delete from Cloudinary');
          }
        } catch (cloudinaryError) {
          console.error('Error deleting from Cloudinary:', cloudinaryError);
          // Continue with database deletion
        }
      }

      // Delete from database
      const response = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (response.ok) {
        // Update local state by removing the deleted document
        setDocuments(prevDocs => prevDocs.filter(d => d._id !== id));
        
        if (cloudinaryWarning) {
          showToast(
            t('documentDeletedWithWarning') || 'Document removed from database, but file may still exist in cloud storage. Please check Cloudinary console.',
            'warning'
          );
        } else if (!cloudinaryDeleted && doc.url) {
          showToast(
            t('documentDeletedCloudinaryFailed') || 'Document removed from database, but cloud file deletion failed',
            'warning'
          );
        } else {
          showToast(t('documentDeleted') || 'Document deleted successfully', 'success');
        }
      } else {
        showToast(t('deleteFailed') || 'Failed to delete document from database', 'error');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      showToast(t('deleteFailed') || 'Failed to delete document', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDocumentToDelete(null);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('documentsManagement') || 'Documents Management'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('documentsDescription') || 'Generate and manage PDF documents'}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-gray-500 dark:text-gray-400">{t('noDocumentsFound') || 'No documents yet'}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('type') || 'Type'}</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('client') || 'Client'}</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('car') || 'Car'}</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('date') || 'Date'}</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('status') || 'Status'}</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">{t('actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc._id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        doc.type === 'invoice' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : doc.type === 'certificate'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                      }`}>
                        {doc.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{doc.clientName}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{getCarName(doc.carId)}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        doc.status === 'generated'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 text-sm font-medium"
                        >
                          {t('download') || 'Download'}
                        </a>
                        <button
                          onClick={() => handleDeleteDocument(doc._id)}
                          disabled={deleting}
                          className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t('delete') || 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg max-w-md ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : toast.type === 'warning'
            ? 'bg-yellow-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('confirmDelete') || 'Confirm Delete'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('confirmDeleteDocument') || 'Are you sure you want to delete this document? This action cannot be undone.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('delete') || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deleting Spinner Overlay */}
      {deleting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">
                {t('deletingDocument') || 'Deleting document...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
