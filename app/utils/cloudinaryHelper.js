/**
 * Cloudinary Configuration
 * Environment variables should be set in .env.local:
 * NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
 * CLOUDINARY_API_KEY=your_api_key
 * CLOUDINARY_API_SECRET=your_api_secret
 */

// For demo purposes, using public configuration
// In production, use environment variables
export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default',
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  folder: 'dreamcars-uploads',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'pdf', 'webp'],
};

/**
 * Validate file before upload
 */
export function validateFile(file) {
  const errors = [];
  
  // Check file size
  if (file.size > cloudinaryConfig.maxFileSize) {
    errors.push(`File size must be less than ${cloudinaryConfig.maxFileSize / (1024 * 1024)}MB`);
  }
  
  // Check file type
  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (!cloudinaryConfig.allowedFormats.includes(fileExtension)) {
    errors.push(`File type must be one of: ${cloudinaryConfig.allowedFormats.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Upload file to Cloudinary (client-side)
 */
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

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file type icon
 */
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

/**
 * Check if file is image
 */
export function isImageFile(filename) {
  const ext = filename?.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext);
}

/**
 * Check if file is PDF
 */
export function isPDFFile(filename) {
  const ext = filename?.split('.').pop()?.toLowerCase();
  return ext === 'pdf';
}
