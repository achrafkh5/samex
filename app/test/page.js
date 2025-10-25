'use client';

import { useState } from 'react';

export default function UploadTestPage() {
  const [files, setFiles] = useState({
    idCard: null,
    driversLicense: null,
    proofOfResidence: null,
    paymentProof: null,
  });

  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    setFiles(prev => ({ ...prev, [fieldName]: file }));
  };

  const uploadFile = async (file, folder) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return await response.json();
  };

  const handleUploadAll = async () => {
    setUploading(true);
    setResults([]);
    setErrors([]);

    const uploadPromises = [
      { file: files.idCard, folder: 'test/id-cards', name: 'ID Card' },
      { file: files.driversLicense, folder: 'test/licenses', name: 'Driver\'s License' },
      { file: files.proofOfResidence, folder: 'test/residence', name: 'Proof of Residence' },
      { file: files.paymentProof, folder: 'test/payments', name: 'Payment Proof' },
    ];

    const uploadResults = [];
    const uploadErrors = [];

    for (const { file, folder, name } of uploadPromises) {
      if (file) {
        try {
          console.log(`Uploading ${name}...`);
          const result = await uploadFile(file, folder);
          uploadResults.push({ name, ...result });
          console.log(`✅ ${name} uploaded:`, result.url);
        } catch (error) {
          console.error(`❌ ${name} failed:`, error);
          uploadErrors.push({ name, error: error.message });
        }
      }
    }

    setResults(uploadResults);
    setErrors(uploadErrors);
    setUploading(false);
  };

  const handleUploadSequential = async () => {
    setUploading(true);
    setResults([]);
    setErrors([]);

    const uploads = [
      { file: files.idCard, folder: 'test/id-cards', name: 'ID Card' },
      { file: files.driversLicense, folder: 'test/licenses', name: 'Driver\'s License' },
      { file: files.proofOfResidence, folder: 'test/residence', name: 'Proof of Residence' },
      { file: files.paymentProof, folder: 'test/payments', name: 'Payment Proof' },
    ];

    const uploadResults = [];
    const uploadErrors = [];

    for (const { file, folder, name } of uploads) {
      if (file) {
        try {
          console.log(`Uploading ${name}...`);
          const result = await uploadFile(file, folder);
          uploadResults.push({ name, ...result });
          setResults([...uploadResults]); // Update UI after each upload
          console.log(`✅ ${name} uploaded:`, result.url);
        } catch (error) {
          console.error(`❌ ${name} failed:`, error);
          uploadErrors.push({ name, error: error.message });
          setErrors([...uploadErrors]);
        }
      }
    }

    setUploading(false);
  };

  const handleUploadParallel = async () => {
    setUploading(true);
    setResults([]);
    setErrors([]);

    try {
      console.log('Starting parallel uploads...');
      
      const [idCardResult, licenseResult, residenceResult, paymentResult] = await Promise.all([
        files.idCard ? uploadFile(files.idCard, 'test/id-cards') : Promise.resolve(null),
        files.driversLicense ? uploadFile(files.driversLicense, 'test/licenses') : Promise.resolve(null),
        files.proofOfResidence ? uploadFile(files.proofOfResidence, 'test/residence') : Promise.resolve(null),
        files.paymentProof ? uploadFile(files.paymentProof, 'test/payments') : Promise.resolve(null),
      ]);

      const uploadResults = [];
      if (idCardResult) uploadResults.push({ name: 'ID Card', ...idCardResult });
      if (licenseResult) uploadResults.push({ name: 'Driver\'s License', ...licenseResult });
      if (residenceResult) uploadResults.push({ name: 'Proof of Residence', ...residenceResult });
      if (paymentResult) uploadResults.push({ name: 'Payment Proof', ...paymentResult });

      setResults(uploadResults);
      console.log('✅ All uploads completed');
    } catch (error) {
      console.error('❌ Parallel upload failed:', error);
      setErrors([{ name: 'Parallel Upload', error: error.message }]);
    }

    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              📤 Cloudinary Upload Test
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Test uploading multiple files to Cloudinary with different strategies
            </p>
          </div>

          {/* File Upload Form */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Select Files to Upload
            </h2>

            <div className="space-y-6">
              {/* ID Card */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  ID Card (Image or PDF)
                </label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, 'idCard')}
                  accept="image/*,application/pdf"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {files.idCard && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    ✓ {files.idCard.name} ({(files.idCard.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              {/* Driver's License */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Driver&apos;s License (Image or PDF)
                </label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, 'driversLicense')}
                  accept="image/*,application/pdf"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {files.driversLicense && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    ✓ {files.driversLicense.name} ({(files.driversLicense.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              {/* Proof of Residence */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Proof of Residence (Any document)
                </label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, 'proofOfResidence')}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {files.proofOfResidence && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    ✓ {files.proofOfResidence.name} ({(files.proofOfResidence.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              {/* Payment Proof */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Payment Proof (Any document)
                </label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, 'paymentProof')}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {files.paymentProof && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    ✓ {files.paymentProof.name} ({(files.paymentProof.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
            </div>

            {/* Upload Buttons */}
            <div className="mt-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleUploadSequential}
                  disabled={uploading || !Object.values(files).some(f => f)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    uploading || !Object.values(files).some(f => f)
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  📝 Sequential Upload
                </button>

                <button
                  onClick={handleUploadParallel}
                  disabled={uploading || !Object.values(files).some(f => f)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    uploading || !Object.values(files).some(f => f)
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  ⚡ Parallel Upload
                </button>

                <button
                  onClick={handleUploadAll}
                  disabled={uploading || !Object.values(files).some(f => f)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    uploading || !Object.values(files).some(f => f)
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  🔄 Upload All
                </button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-2">Upload Strategies:</p>
                <ul className="space-y-1 ml-4">
                  <li>• <strong>Sequential:</strong> Uploads one by one (slower but stable)</li>
                  <li>• <strong>Parallel:</strong> All at once using Promise.all (fastest)</li>
                  <li>• <strong>Upload All:</strong> Sequential with live progress updates</li>
                </ul>
              </div>
            </div>

            {/* Loading State */}
            {uploading && (
              <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center space-x-3">
                  <svg className="animate-spin h-5 w-5 text-yellow-600 dark:text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-yellow-800 dark:text-yellow-200 font-semibold">
                    Uploading files... Check console for details
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 mb-8">
              <h2 className="text-xl font-bold text-green-600 dark:text-green-400 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Upload Successful ({results.length} files)
              </h2>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">
                          {result.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {result.public_id}
                          </span>
                        </p>
                        <a 
                          href={result.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                        >
                          {result.url}
                        </a>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          Type: {result.resource_type} | Format: {result.format}
                        </p>
                      </div>
                      {result.resource_type === 'image' && (
                        <img 
                          src={result.url} 
                          alt={result.name}
                          className="w-20 h-20 object-cover rounded-lg ml-4"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Upload Errors ({errors.length})
              </h2>
              <div className="space-y-4">
                {errors.map((error, index) => (
                  <div key={index} className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                    <p className="font-semibold text-red-900 dark:text-red-100 mb-1">
                      {error.name}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {error.error}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
