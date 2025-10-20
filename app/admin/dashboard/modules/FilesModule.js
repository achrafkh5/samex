'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';
import { formatFileSize, getFileTypeIcon, isImageFile, isPDFFile } from '../../../utils/cloudinaryHelper';

export default function FilesModule() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const itemsPerPage = 12;

  // File type options
  const fileTypes = [
    { id: 'all', label: t('allFiles') || 'All Files', icon: '📁' },
    { id: 'id_card', label: t('idCards') || 'ID Cards', icon: '🪪' },
    { id: 'license', label: t('licenses') || 'Licenses', icon: '🚗' },
    { id: 'residence_proof', label: t('residenceProof') || 'Residence Proof', icon: '🏠' },
    { id: 'payment_proof', label: t('paymentProof') || 'Payment Proof', icon: '💳' },
  ];

  const statusOptions = [
    { id: 'all', label: t('allStatus') || 'All Status', color: 'gray' },
    { id: 'pending', label: t('pending') || 'Pending', color: 'yellow' },
    { id: 'approved', label: t('approved') || 'Approved', color: 'green' },
    { id: 'rejected', label: t('rejected') || 'Rejected', color: 'red' },
  ];

  const sortOptions = [
    { id: 'date_desc', label: t('newestFirst') || 'Newest First' },
    { id: 'date_asc', label: t('oldestFirst') || 'Oldest First' },
    { id: 'name_asc', label: t('nameAZ') || 'Name A-Z' },
    { id: 'name_desc', label: t('nameZA') || 'Name Z-A' },
    { id: 'size_desc', label: t('largestFirst') || 'Largest First' },
    { id: 'size_asc', label: t('smallestFirst') || 'Smallest First' },
  ];

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      if (data.success) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      showToastMessage(t('loadError') || 'Failed to load files', 'error');
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

  const handleDeleteFile = async (file) => {
    setFileToDelete(file);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/files?fileId=${fileToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        setFiles(files.filter(f => f._id !== fileToDelete._id));
        showToastMessage(t('deleteSuccess') || 'File deleted successfully', 'success');
      } else {
        showToastMessage(t('deleteError') || 'Failed to delete file', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToastMessage(t('deleteError') || 'Failed to delete file', 'error');
    } finally {
      setShowDeleteModal(false);
      setFileToDelete(null);
    }
  };

  const handleStatusChange = async (fileId, newStatus) => {
    // In production, this would update the status in the database
    setFiles(files.map(f => 
      f._id === fileId ? { ...f, status: newStatus } : f
    ));
    showToastMessage(t('statusUpdated') || `File status updated to ${newStatus}`, 'success');
  };

  const handlePreview = (file) => {
    setSelectedFile(file);
    setShowPreview(true);
  };

  const handleDownload = (file) => {
    window.open(file.fileUrl, '_blank');
    showToastMessage(t('downloadStarted') || 'Download started', 'success');
  };

  // Filter and sort files
  let filteredFiles = files.filter(file => {
    const matchesType = filter === 'all' || file.uploadType === filter;
    const matchesStatus = statusFilter === 'all' || file.status === statusFilter;
    const matchesSearch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.clientId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  // Sort files
  filteredFiles.sort((a, b) => {
    switch (sortBy) {
      case 'date_desc':
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      case 'date_asc':
        return new Date(a.uploadDate) - new Date(b.uploadDate);
      case 'name_asc':
        return a.fileName.localeCompare(b.fileName);
      case 'name_desc':
        return b.fileName.localeCompare(a.fileName);
      case 'size_desc':
        return b.fileSize - a.fileSize;
      case 'size_asc':
        return a.fileSize - b.fileSize;
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFiles = filteredFiles.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 lg:p-8">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${
            toastType === 'success' ? 'bg-green-500' :
            toastType === 'error' ? 'bg-red-500' : 'bg-blue-500'
          } text-white`}>
            {toastMessage}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📁 {t('filesManagement') || 'Files Management'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('filesDescription') || 'View, manage, and download uploaded files'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalFiles') || 'Total Files'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{files.length}</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('pending') || 'Pending'}</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {files.filter(f => f.status === 'pending').length}
              </p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('approved') || 'Approved'}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {files.filter(f => f.status === 'approved').length}
              </p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalSize') || 'Total Size'}</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatFileSize(files.reduce((acc, f) => acc + f.fileSize, 0))}
              </p>
            </div>
            <div className="text-3xl">💾</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder={t('searchFiles') || '🔍 Search by filename or client...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {fileTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setFilter(type.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === type.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="mr-2">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>

        {/* Status Filter & Sort */}
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex gap-2">
            {statusOptions.map(status => (
              <button
                key={status.id}
                onClick={() => setStatusFilter(status.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === status.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">{t('loading') || 'Loading files...'}</p>
        </div>
      ) : paginatedFiles.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-600 dark:text-gray-400">{t('noFiles') || 'No files found'}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedFiles.map(file => (
              <div
                key={file._id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{getFileTypeIcon(file.fileType)}</div>
                  <div className="flex gap-1">
                    <select
                      value={file.status}
                      onChange={(e) => handleStatusChange(file._id, e.target.value)}
                      className={`px-2 py-1 text-xs rounded-full border-0 cursor-pointer ${
                        file.status === 'approved'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : file.status === 'rejected'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}
                    >
                      <option value="pending">{t('pending') || 'Pending'}</option>
                      <option value="approved">{t('approved') || 'Approved'}</option>
                      <option value="rejected">{t('rejected') || 'Rejected'}</option>
                    </select>
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 truncate" title={file.fileName}>
                  {file.fileName}
                </h3>
                
                <div className="space-y-1 mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>👤 {file.clientId}</p>
                  <p>📦 {formatFileSize(file.fileSize)}</p>
                  <p>📅 {new Date(file.uploadDate).toLocaleDateString()}</p>
                  <p className="capitalize">📋 {file.uploadType.replace('_', ' ')}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreview(file)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    👁️ {t('view') || 'View'}
                  </button>
                  <button
                    onClick={() => handleDownload(file)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ⬇️
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                ← {t('previous') || 'Previous'}
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-2 rounded-lg ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {t('next') || 'Next'} →
              </button>
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      {showPreview && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedFile.fileName}
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {isImageFile(selectedFile.fileName) ? (
                <img
                  src={selectedFile.fileUrl}
                  alt={selectedFile.fileName}
                  className="max-w-full h-auto rounded-lg"
                />
              ) : isPDFFile(selectedFile.fileName) ? (
                <iframe
                  src={selectedFile.fileUrl}
                  className="w-full h-[600px] rounded-lg"
                  title={selectedFile.fileName}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{t('previewNotAvailable') || 'Preview not available'}</p>
                  <button
                    onClick={() => handleDownload(selectedFile)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {t('downloadFile') || 'Download File'}
                  </button>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">{t('clientId') || 'Client ID'}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedFile.clientId}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">{t('uploadType') || 'Upload Type'}</p>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedFile.uploadType.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">{t('fileSize') || 'File Size'}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatFileSize(selectedFile.fileSize)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">{t('uploadDate') || 'Upload Date'}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedFile.uploadDate).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && fileToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              🗑️ {t('deleteFile') || 'Delete File?'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('deleteConfirm') || 'Are you sure you want to delete'} <strong>{fileToDelete.fileName}</strong>? {t('cannotUndo') || 'This action cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t('delete') || 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {t('cancel') || 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
