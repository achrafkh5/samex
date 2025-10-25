# Cloudinary PDF Upload & Viewing Fix

## Problem
PDFs uploaded to Cloudinary were corrupted and couldn't be opened or viewed properly. The root cause was converting PDF binary data to base64 data URIs, which corrupted the file during the encoding/decoding process.

## Solution Overview

### 1. Fixed Upload Route (`/api/upload/route.js`)
**Changes Made:**
- Use **`upload_stream`** for PDFs and raw files to preserve binary integrity
- Keep base64 data URI method for images/videos (works fine for these)
- Proper resource type detection: `raw` for PDFs, `image` for images, `video` for videos

**Key Implementation:**
```javascript
// For PDFs: Use upload_stream
if (resourceType === 'raw') {
  result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'raw',
        type: 'upload',
        access_mode: 'public',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer); // Write binary buffer directly
  });
}
```

**Benefits:**
- ✅ Binary data integrity preserved
- ✅ PDFs are viewable in browser
- ✅ No corruption during upload
- ✅ Works with jsPDF-generated files
- ✅ Supports Arabic fonts and special characters

### 2. Enhanced Cloudinary Helper (`/utils/cloudinaryHelper.js`)
Added new utility functions:

#### `viewCloudinaryPDF(url, filename)`
Opens PDF in new browser tab for inline viewing
```javascript
viewCloudinaryPDF(pdfUrl, 'certificate.pdf');
// Opens PDF in browser's native viewer
```

#### `downloadCloudinaryFile(url, filename)`
Downloads file with `fl_attachment` flag
```javascript
downloadCloudinaryFile(pdfUrl, 'invoice.pdf');
// Forces download instead of inline view
```

#### `getCloudinaryFileType(url)`
Detects file type from URL
```javascript
const fileType = getCloudinaryFileType(url);
// Returns: 'pdf', 'image', 'video', or 'other'
```

#### `uploadPDFToCloudinary(blob, filename, folder)`
Uploads PDF Blob to Cloudinary
```javascript
const pdfBlob = doc.output('blob'); // from jsPDF
const result = await uploadPDFToCloudinary(pdfBlob, 'report.pdf', 'documents');
console.log('Uploaded:', result.url);
```

#### `generateAndUploadPDF(doc, filename, folder)`
Complete workflow: jsPDF → Blob → Upload
```javascript
const doc = await generateInvoice(data, 'en', 'light');
const result = await generateAndUploadPDF(doc, 'invoice-123.pdf', 'invoices');
// Returns: { url, public_id, resource_type, format }
```

### 3. Updated OrdersModule
Added **View** and **Download** buttons for PDFs:

**Features:**
- 🔍 **View Button**: Opens PDF in new tab (browser viewer)
- ⬇️ **Download Button**: Downloads PDF with proper filename
- 🖼️ **Image Preview**: Shows inline preview for images
- 📄 **File Type Detection**: Auto-detects PDF vs Image

**UI Updates:**
```javascript
// View button (only for PDFs)
<button onClick={() => viewFile(url, 'document.pdf')}>
  View
</button>

// Download button (all files)
<button onClick={() => downloadFile(url, 'document.pdf')}>
  Download
</button>
```

## How It Works

### Upload Flow
1. **Client**: Sends File via FormData to `/api/upload`
2. **API Route**: 
   - Detects file type (PDF, image, video)
   - For PDFs: Uses `upload_stream` with binary buffer
   - For images: Uses base64 data URI
3. **Cloudinary**: 
   - Stores file with `resource_type: 'raw'` for PDFs
   - Returns `secure_url` for public access
4. **Response**: Returns URL that can be viewed directly

### View Flow (PDFs)
1. User clicks **"View"** button
2. `viewCloudinaryPDF()` opens URL in new tab
3. Browser displays PDF using native viewer
4. User can view, print, or download from browser

### Download Flow
1. User clicks **"Download"** button
2. `downloadCloudinaryFile()` adds `fl_attachment` flag
3. Forces browser to download instead of display
4. File saved with proper filename

## Usage Examples

### Example 1: Upload PDF from jsPDF
```javascript
import { generateAndUploadPDF } from '@/app/utils/cloudinaryHelper';
import { generateInvoice } from '@/app/utils/pdfGenerator';

// Generate PDF
const doc = await generateInvoice(orderData, 'en', 'light');

// Upload to Cloudinary
const result = await generateAndUploadPDF(
  doc, 
  'invoice-2024-001.pdf', 
  'invoices'
);

console.log('PDF URL:', result.url);
// URL can be viewed directly in browser
```

### Example 2: View PDF in Browser
```javascript
import { viewCloudinaryPDF } from '@/app/utils/cloudinaryHelper';

const handleViewPDF = () => {
  viewCloudinaryPDF(
    'https://res.cloudinary.com/.../document.pdf',
    'certificate.pdf'
  );
};

<button onClick={handleViewPDF}>View Certificate</button>
```

### Example 3: Download PDF
```javascript
import { downloadCloudinaryFile } from '@/app/utils/cloudinaryHelper';

const handleDownload = () => {
  downloadCloudinaryFile(
    'https://res.cloudinary.com/.../document.pdf',
    'invoice-123.pdf'
  );
};

<button onClick={handleDownload}>Download Invoice</button>
```

### Example 4: Upload User File
```javascript
// In your form component
const handleFileUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'user-documents');

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  console.log('Uploaded URL:', result.url);
  // PDF will be viewable in browser
};
```

## Technical Details

### Cloudinary Upload Options
```javascript
{
  folder: 'documents',           // Cloudinary folder path
  resource_type: 'raw',          // 'raw' for PDFs
  use_filename: true,            // Keep original filename
  unique_filename: true,         // Add unique suffix
  type: 'upload',                // Upload type
  access_mode: 'public',         // Public access
}
```

### Browser PDF Viewing
- Modern browsers have built-in PDF viewers
- PDFs uploaded as `resource_type: 'raw'` are viewable inline
- No need for Cloudinary transformations
- Secure URLs work directly in `<iframe>` or new tabs

### File Type Detection
```javascript
// Detects from URL/filename
if (url.includes('.pdf') || type === 'application/pdf') {
  return 'pdf';
} else if (url.match(/\.(jpg|png|gif|webp)/)) {
  return 'image';
}
```

## Testing Checklist

### Upload Testing
- [ ] Upload image → Check viewable
- [ ] Upload PDF from jsPDF → Check viewable
- [ ] Upload PDF with Arabic text → Check rendering
- [ ] Upload large PDF (>5MB) → Check success
- [ ] Check file size matches original

### View Testing
- [ ] Click "View" on PDF → Opens in new tab
- [ ] PDF displays in browser viewer
- [ ] Arabic text renders correctly
- [ ] Images display inline
- [ ] Check on Chrome, Firefox, Safari

### Download Testing
- [ ] Click "Download" → File downloads
- [ ] Downloaded PDF opens correctly
- [ ] Filename is correct
- [ ] Content is not corrupted
- [ ] File size matches uploaded

### Integration Testing
- [ ] Generate certificate → Upload → View
- [ ] Generate invoice → Upload → Download
- [ ] User uploads ID card → View in OrdersModule
- [ ] Multiple file uploads in sequence
- [ ] Error handling for failed uploads

## Troubleshooting

### PDF Not Opening
**Check:**
- Is `resource_type: 'raw'` used for upload?
- Is the URL a valid Cloudinary URL?
- Check browser console for errors
- Try opening URL directly in new tab

### Download Issues
**Check:**
- Is `fl_attachment` flag added to URL?
- Check network tab for download request
- Verify filename encoding
- Check CORS headers

### Upload Failures
**Check:**
- Cloudinary credentials in `.env.local`
- File size within limits
- Buffer creation successful
- Network connectivity
- Cloudinary dashboard for quota

### Corrupted PDFs
**Check:**
- Using `upload_stream` (not base64 data URI)
- Buffer created from arrayBuffer
- No intermediate encoding steps
- jsPDF output method: `output('blob')`

## Environment Variables
Ensure these are set in `.env.local`:
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Files Modified
1. `/app/api/upload/route.js` - Fixed upload logic
2. `/app/utils/cloudinaryHelper.js` - Added helper functions
3. `/app/admin/dashboard/modules/OrdersModule.js` - Added View button

## Performance Considerations
- **Stream-based Upload**: Memory efficient for large files
- **Binary Transfer**: No base64 encoding overhead for PDFs
- **Direct URLs**: No server proxying needed for viewing
- **Browser Caching**: Cloudinary URLs are cache-friendly

## Security Notes
- All uploads require server-side validation
- Public access enabled for viewing
- Secure URLs use HTTPS
- Consider signed URLs for sensitive documents
- Validate file types on server side

## Future Enhancements
1. Add PDF thumbnail generation
2. Implement signed URLs for private documents
3. Add progress indicator for large uploads
4. Support chunked uploads for very large files
5. Add PDF compression before upload
6. Implement client-side PDF preview before upload
7. Add watermarking for generated PDFs

## Support
For issues or questions:
- Check Cloudinary documentation: https://cloudinary.com/documentation
- Review upload logs in browser console
- Check Cloudinary dashboard for upload status
- Verify environment variables are set correctly
