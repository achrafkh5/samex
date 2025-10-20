'use client';

import { useState, useContext, use } from 'react';
import { useLanguage } from '../components/LanguageProvider';
import { uploadToCloudinary, validateFile, formatFileSize, getFileTypeIcon } from '../utils/cloudinaryHelper';

export default function UploadContent() {
  const t = useLanguage();

  const [activeTab, setActiveTab] = useState('id_card');
  const [uploads, setUploads] = useState({
    id_card: null,
    license: null,
    residence_proof: null,
    payment_proof: null,
  });
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploading, setUploading] = useState({});
  const [dragActive, setDragActive] = useState({});
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const uploadTypes = [
    { id: 'id_card', label: t?.upload?.types?.idCard || 'National ID Card', icon: '🪪' },
    { id: 'license', label: t?.upload?.types?.license || 'Driving License', icon: '🚗' },
    { id: 'residence_proof', label: t?.upload?.types?.residenceProof || 'Residence Proof', icon: '🏠' },
    { id: 'payment_proof', label: t?.upload?.types?.paymentProof || 'Payment Proof', icon: '💳' },
  ];

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDrag = (e, uploadType) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(prev => ({ ...prev, [uploadType]: true }));
    } else if (e.type === 'dragleave') {
      setDragActive(prev => ({ ...prev, [uploadType]: false }));
    }
  };

  const handleDrop = (e, uploadType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [uploadType]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], uploadType);
    }
  };

  const handleFileSelect = (e, uploadType) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0], uploadType);
    }
  };

  const handleFileUpload = async (file, uploadType) => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, [uploadType]: validation.errors.join(', ') }));
      showToastMessage(validation.errors[0], 'error');
      return;
    }

    setErrors(prev => ({ ...prev, [uploadType]: null }));
    setUploading(prev => ({ ...prev, [uploadType]: true }));
    setUploadProgress(prev => ({ ...prev, [uploadType]: 0 }));

    try {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(file, {
        folder: `dreamcars/${uploadType}`,
        onProgress: (progress) => {
          setUploadProgress(prev => ({ ...prev, [uploadType]: progress }));
        },
      });

      // Save metadata to backend
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: result.url,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadType,
          clientId: 'current_user_id', // In production, get from auth
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUploads(prev => ({
          ...prev,
          [uploadType]: {
            file,
            url: result.url,
            ...data.file,
          },
        }));
        showToastMessage(t?.upload?.uploadSuccess || 'File uploaded successfully!', 'success');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(prev => ({ ...prev, [uploadType]: error.message }));
      showToastMessage(t?.upload?.uploadError || 'Upload failed. Please try again.', 'error');
    } finally {
      setUploading(prev => ({ ...prev, [uploadType]: false }));
    }
  };

  const removeFile = (uploadType) => {
    setUploads(prev => ({ ...prev, [uploadType]: null }));
    setUploadProgress(prev => ({ ...prev, [uploadType]: 0 }));
    setErrors(prev => ({ ...prev, [uploadType]: null }));
    showToastMessage(t?.upload?.fileRemoved || 'File removed', 'info');
  };

  const isRTL = language === 'ar';

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`}>
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
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t?.upload?.title || 'Upload Documents'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t?.upload?.subtitle || 'Upload your required documents securely'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 flex-wrap">
            {uploadTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setActiveTab(type.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === type.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className={`${isRTL ? 'ml-2' : 'mr-2'}`}>{type.icon}</span>
                {type.label}
                {uploads[type.id] && (
                  <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-green-400`}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        {uploadTypes.map(type => (
          activeTab === type.id && (
            <div key={type.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{type.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {type.label}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t?.upload?.dragDrop || 'Drag and drop or click to upload'}
                  </p>
                </div>
              </div>

              {!uploads[type.id] ? (
                <div
                  onDragEnter={(e) => handleDrag(e, type.id)}
                  onDragLeave={(e) => handleDrag(e, type.id)}
                  onDragOver={(e) => handleDrag(e, type.id)}
                  onDrop={(e) => handleDrop(e, type.id)}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                    dragActive[type.id]
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  <div className="text-6xl mb-4">📤</div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                    {dragActive[type.id] 
                      ? (t?.upload?.dropHere || 'Drop file here')
                      : (t?.upload?.dragDrop || 'Drag and drop file here')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {t?.upload?.or || 'or'}
                  </p>
                  <label className="inline-block">
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileSelect(e, type.id)}
                      disabled={uploading[type.id]}
                    />
                    <span className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer inline-block transition-colors">
                      {t?.upload?.browseFiles || 'Browse Files'}
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                    {t?.upload?.allowedFormats || 'Allowed: JPG, PNG, PDF (Max 10MB)'}
                  </p>

                  {uploading[type.id] && (
                    <div className="mt-6">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[type.id] || 0}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {t?.upload?.uploading || 'Uploading'}: {uploadProgress[type.id] || 0}%
                      </p>
                    </div>
                  )}

                  {errors[type.id] && (
                    <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                      <p className="text-red-700 dark:text-red-400 text-sm">{errors[type.id]}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-5xl">{getFileTypeIcon(uploads[type.id].fileType)}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {uploads[type.id].fileName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {formatFileSize(uploads[type.id].fileSize)}
                        </p>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm rounded-full">
                            ✓ {t?.upload?.uploaded || 'Uploaded'}
                          </span>
                          <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm rounded-full">
                            ⏳ {t?.upload?.pending || 'Pending Review'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={uploads[type.id].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        👁️ {t?.upload?.view || 'View'}
                      </a>
                      <button
                        onClick={() => removeFile(type.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        🗑️ {t?.upload?.remove || 'Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Instructions */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  📋 {t?.upload?.requirements || 'Requirements'}
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
                  <li>{t?.upload?.req1 || 'Clear and readable document'}</li>
                  <li>{t?.upload?.req2 || 'Valid and not expired'}</li>
                  <li>{t?.upload?.req3 || 'All information visible'}</li>
                  <li>{t?.upload?.req4 || 'High quality image or PDF'}</li>
                </ul>
              </div>
            </div>
          )
        ))}

        {/* Upload Summary */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📊 {t?.upload?.summary || 'Upload Summary'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {uploadTypes.map(type => (
              <div
                key={type.id}
                className={`p-4 rounded-lg border-2 ${
                  uploads[type.id]
                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{type.label}</p>
                    <p className={`font-semibold ${
                      uploads[type.id]
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-500 dark:text-gray-500'
                    }`}>
                      {uploads[type.id] 
                        ? (t?.upload?.completed || 'Completed')
                        : (t?.upload?.notUploaded || 'Not Uploaded')}
                    </p>
                  </div>
                  <div className="text-3xl">
                    {uploads[type.id] ? '✅' : '⏺️'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
