
export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default',
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  folder: 'dreamcars-uploads',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'pdf', 'webp'],
};


export function validateFile(file) {
  const errors = [];
  
 
  if (file.size > cloudinaryConfig.maxFileSize) {
    errors.push(`File size must be less than ${cloudinaryConfig.maxFileSize / (1024 * 1024)}MB`);
  }
  
  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (!cloudinaryConfig.allowedFormats.includes(fileExtension)) {
    errors.push(`File type must be one of: ${cloudinaryConfig.allowedFormats.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}


export async function uploadToCloudinary(file, options = {}) {
  const {
    folder = cloudinaryConfig.folder,
    resourceType = 'auto',
    onProgress = () => {},
  } = options;

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', folder);
    
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(Math.round(percentComplete));
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          success: true,
          url: response.secure_url,
          publicId: response.public_id,
          format: response.format,
          resourceType: response.resource_type,
          bytes: response.bytes,
        });
      } else {
        reject(new Error('Upload failed'));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });
    
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`);
    xhr.send(formData);
  });
}


export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}


export function getFileTypeIcon(fileType) {
  const type = fileType?.toLowerCase() || '';
  
  if (type.includes('pdf')) {
    return '📄';
  } else if (type.includes('image') || type.includes('jpg') || type.includes('png')) {
    return '🖼️';
  } else if (type.includes('doc')) {
    return '📝';
  }
  
  return '📎';
}


export function isImageFile(filename) {
  const ext = filename?.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext);
}


export function isPDFFile(filename) {
  const ext = filename?.split('.').pop()?.toLowerCase();
  return ext === 'pdf';
}

/**
 * Opens a Cloudinary PDF URL in a new browser tab for inline viewing
 * @param {string} url - The Cloudinary secure_url
 * @param {string} filename - Optional filename for the download attribute
 */
export function viewCloudinaryPDF(url, filename = 'document.pdf') {
  if (!url) {
    console.error('No URL provided to viewCloudinaryPDF');
    return;
  }
  
  console.log('🔍 Opening PDF in new tab:', url);
  
  // Open PDF in new tab - browser will display inline viewer
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  
  if (!newWindow) {
    console.warn('⚠️ Popup blocked. Please allow popups for this site.');
  } else {
    console.log('✅ PDF opened successfully in new tab');
  }
}/**
 * Downloads a Cloudinary file by fetching and creating a blob
 * @param {string} url - The Cloudinary secure_url
 * @param {string} filename - The desired filename for download
 */
export async function downloadCloudinaryFile(url, filename = 'document') {
  if (!url) {
    console.error('No URL provided to downloadCloudinaryFile');
    return;
  }

  console.log('⬇️ Downloading file:', filename);
  
  try {
    // Fetch the file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch file');
    }
    
    // Convert to blob
    const blob = await response.blob();
    
    // Create object URL
    const blobUrl = URL.createObjectURL(blob);
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up object URL
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    
    console.log('✅ Download initiated');
  } catch (error) {
    console.error('❌ Download error:', error);
    
    // Fallback: try direct link method
    console.log('⚠️ Trying fallback method...');
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Gets the file type from a Cloudinary URL or filename
 * @param {string} url - The Cloudinary URL or filename
 * @returns {string} - File type: 'image', 'pdf', 'video', or 'other'
 */
export function getCloudinaryFileType(url) {
  if (!url) return 'other';
  
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('.pdf') || lowerUrl.includes('/raw/upload/')) {
    return 'pdf';
  } else if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)/)) {
    return 'image';
  } else if (lowerUrl.match(/\.(mp4|webm|mov|avi|mkv)/)) {
    return 'video';
  }
  
  return 'other';
}

/**
 * Uploads a PDF Blob to Cloudinary via API route
 * @param {Blob} blob - PDF Blob from jsPDF
 * @param {string} filename - Desired filename
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<Object>} - Upload result with secure_url
 */
export async function uploadPDFToCloudinary(blob, filename, folder = 'documents') {
  try {
    const formData = new FormData();
    formData.append('file', blob, filename);
    formData.append('folder', folder);

    console.log('📤 Uploading PDF to Cloudinary:', filename);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    const result = await response.json();
    console.log('✅ PDF uploaded successfully:', result.url);

    return result;
  } catch (error) {
    console.error('❌ PDF upload error:', error);
    throw error;
  }
}

/**
 * Generates and uploads a PDF from jsPDF document
 * @param {Object} doc - jsPDF document instance
 * @param {string} filename - Desired filename
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<Object>} - Upload result with secure_url
 */
export async function generateAndUploadPDF(doc, filename, folder = 'documents') {
  if (!doc || typeof doc.output !== 'function') {
    throw new Error('Invalid jsPDF document provided');
  }

  console.log('📝 Generating PDF blob from jsPDF document...');
  
  // Get PDF as Blob
  const pdfBlob = doc.output('blob');
  
  console.log(`📦 PDF Blob created: ${formatFileSize(pdfBlob.size)}`);
  
  // Upload to Cloudinary
  return await uploadPDFToCloudinary(pdfBlob, filename, folder);
}
