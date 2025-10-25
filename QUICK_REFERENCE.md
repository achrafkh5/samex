# 🚀 Quick Reference - Cloudinary PDF Functions

## 📦 Import Functions

```javascript
// Import helpers
import { 
  viewCloudinaryPDF,           // View PDF in browser
  downloadCloudinaryFile,      // Download file
  getCloudinaryFileType,       // Get file type
  uploadPDFToCloudinary,       // Upload PDF blob
  generateAndUploadPDF         // jsPDF → Upload
} from '@/app/utils/cloudinaryHelper';

// Import PDF generators
import { 
  generateCertificate,         // Generate certificate
  generateInvoice,             // Generate invoice
  generateTrackingDocument     // Generate tracking doc
} from '@/app/utils/pdfGenerator';
```

## 🎯 Common Use Cases

### 1️⃣ Generate & Upload Certificate
```javascript
const doc = await generateCertificate(clientData, 'en', 'light');
const result = await generateAndUploadPDF(doc, 'certificate.pdf', 'certificates');
console.log('URL:', result.url); // Viewable in browser!
```

### 2️⃣ Generate & Upload Invoice
```javascript
const doc = await generateInvoice(orderData, 'en', 'light');
const result = await generateAndUploadPDF(doc, 'invoice-123.pdf', 'invoices');
viewCloudinaryPDF(result.url, 'invoice.pdf'); // Open immediately
```

### 3️⃣ Generate & Upload Tracking
```javascript
const doc = await generateTrackingDocument(trackingData, 'en', 'light');
const result = await generateAndUploadPDF(doc, 'tracking-XYZ.pdf', 'tracking');
```

### 4️⃣ Upload User File
```javascript
const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'user-docs');
  
  const response = await fetch('/api/upload', { 
    method: 'POST', 
    body: formData 
  });
  
  const { url } = await response.json();
  return url;
};
```

### 5️⃣ View PDF Button
```javascript
<button onClick={() => viewCloudinaryPDF(pdfUrl, 'document.pdf')}>
  👁️ View PDF
</button>
```

### 6️⃣ Download PDF Button
```javascript
<button onClick={() => downloadCloudinaryFile(pdfUrl, 'invoice.pdf')}>
  ⬇️ Download
</button>
```

### 7️⃣ Detect File Type
```javascript
const fileType = getCloudinaryFileType(url);
// Returns: 'pdf', 'image', 'video', or 'other'

if (fileType === 'pdf') {
  return <button onClick={() => viewCloudinaryPDF(url)}>View PDF</button>;
} else if (fileType === 'image') {
  return <img src={url} alt="Document" />;
}
```

### 8️⃣ Upload PDF Blob Directly
```javascript
const pdfBlob = doc.output('blob');
const result = await uploadPDFToCloudinary(pdfBlob, 'report.pdf', 'reports');
```

## 🎨 UI Examples

### Full Document Section (OrdersModule)
```javascript
{documentUrl && (
  <div className="bg-gray-50 rounded-lg p-3">
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">ID Card</p>
        <p className="text-xs text-gray-500">
          {getCloudinaryFileType(documentUrl) === 'pdf' ? 'PDF Document' : 'Image'}
        </p>
      </div>
      
      <div className="flex gap-2">
        {getCloudinaryFileType(documentUrl) === 'pdf' && (
          <button 
            onClick={() => viewCloudinaryPDF(documentUrl, 'id-card.pdf')}
            className="px-3 py-1 bg-green-100 text-green-600 rounded"
          >
            👁️ View
          </button>
        )}
        
        <button 
          onClick={() => downloadCloudinaryFile(documentUrl, 'id-card.pdf')}
          className="px-3 py-1 bg-blue-100 text-blue-600 rounded"
        >
          ⬇️ Download
        </button>
      </div>
    </div>
    
    {getCloudinaryFileType(documentUrl) === 'image' && (
      <img src={documentUrl} alt="ID Card" className="mt-2 w-full rounded" />
    )}
  </div>
)}
```

### Simple Upload Form
```javascript
const [pdfUrl, setPdfUrl] = useState(null);
const [loading, setLoading] = useState(false);

const handleGenerate = async () => {
  setLoading(true);
  try {
    const doc = await generateCertificate(data, 'en', 'light');
    const result = await generateAndUploadPDF(doc, 'cert.pdf', 'certificates');
    setPdfUrl(result.url);
    viewCloudinaryPDF(result.url, 'certificate.pdf');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};

return (
  <div>
    <button onClick={handleGenerate} disabled={loading}>
      {loading ? 'Generating...' : '📝 Generate Certificate'}
    </button>
    
    {pdfUrl && (
      <div className="mt-4">
        <p>✅ Generated!</p>
        <button onClick={() => viewCloudinaryPDF(pdfUrl)}>View</button>
        <button onClick={() => downloadCloudinaryFile(pdfUrl, 'cert.pdf')}>Download</button>
      </div>
    )}
  </div>
);
```

## 🔧 API Response Format

```javascript
// Success response from /api/upload
{
  success: true,
  public_id: "documents/invoice-123",
  url: "https://res.cloudinary.com/.../invoice.pdf",
  resource_type: "raw",
  format: "pdf"
}

// Error response
{
  error: "Upload failed",
  message: "File too large",
  details: "..." // Only in development
}
```

## ⚙️ Configuration

### Cloudinary Folders
```javascript
'certificates'      // For generated certificates
'invoices'         // For generated invoices
'tracking'         // For tracking documents
'clients/id-cards' // For client ID cards
'clients/licenses' // For driver licenses
'clients/payments' // For payment proofs
'user-documents'   // For user uploads
```

### Supported File Types
```javascript
// PDFs
'application/pdf'
'.pdf'

// Images
'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
'image/webp', 'image/bmp', 'image/svg+xml'

// Videos
'video/mp4', 'video/webm', 'video/mov', 'video/avi'
```

## 🎯 Function Parameters

### viewCloudinaryPDF(url, filename)
```javascript
viewCloudinaryPDF(
  'https://res.cloudinary.com/.../doc.pdf',  // Required: PDF URL
  'document.pdf'                              // Optional: filename (default: 'document.pdf')
);
```

### downloadCloudinaryFile(url, filename)
```javascript
downloadCloudinaryFile(
  'https://res.cloudinary.com/.../doc.pdf',  // Required: File URL
  'invoice-2024-001.pdf'                     // Required: download filename
);
```

### uploadPDFToCloudinary(blob, filename, folder)
```javascript
await uploadPDFToCloudinary(
  pdfBlob,          // Required: PDF Blob from jsPDF
  'report.pdf',     // Required: filename
  'reports'         // Optional: folder (default: 'documents')
);
```

### generateAndUploadPDF(doc, filename, folder)
```javascript
await generateAndUploadPDF(
  jsPDFDoc,         // Required: jsPDF document instance
  'invoice.pdf',    // Required: filename
  'invoices'        // Optional: folder (default: 'documents')
);
```

## 🐛 Error Handling

```javascript
try {
  const doc = await generateInvoice(data, 'en', 'light');
  const result = await generateAndUploadPDF(doc, 'invoice.pdf', 'invoices');
  
  if (result.url) {
    console.log('✅ Success:', result.url);
    viewCloudinaryPDF(result.url, 'invoice.pdf');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  
  if (error.message.includes('network')) {
    alert('Network error. Please check your connection.');
  } else if (error.message.includes('size')) {
    alert('File too large. Max size is 10MB.');
  } else {
    alert('Upload failed. Please try again.');
  }
}
```

## 📊 Return Values

### generateAndUploadPDF() returns:
```javascript
{
  success: true,
  url: "https://res.cloudinary.com/.../doc.pdf",  // Use this!
  public_id: "folder/filename",
  resource_type: "raw",
  format: "pdf"
}
```

### uploadPDFToCloudinary() returns:
```javascript
{
  success: true,
  url: "https://res.cloudinary.com/.../doc.pdf",  // Use this!
  public_id: "folder/filename",
  resource_type: "raw",
  format: "pdf"
}
```

### getCloudinaryFileType() returns:
```javascript
'pdf'      // For PDF files
'image'    // For JPG, PNG, GIF, etc.
'video'    // For MP4, WebM, etc.
'other'    // For unknown types
```

## 💡 Pro Tips

### 1. Use descriptive filenames
```javascript
// ✅ Good
`certificate-${clientName}-${date}.pdf`
`invoice-${invoiceNumber}.pdf`
`tracking-${trackingCode}.pdf`

// ❌ Bad
'document.pdf'
'file.pdf'
'temp.pdf'
```

### 2. Organize with folders
```javascript
// ✅ Good structure
'certificates/2024/john-smith-cert.pdf'
'invoices/2024/Q4/invoice-123.pdf'
'clients/john-smith/id-card.pdf'

// ❌ Flat structure
'all-files/document1.pdf'
'uploads/file.pdf'
```

### 3. Open PDF immediately after upload
```javascript
const result = await generateAndUploadPDF(doc, 'cert.pdf', 'certs');
viewCloudinaryPDF(result.url, 'certificate.pdf');  // Opens right away!
```

### 4. Check file type before showing buttons
```javascript
const fileType = getCloudinaryFileType(url);

return (
  <>
    {fileType === 'pdf' && <ViewButton />}
    {fileType === 'image' && <ImagePreview />}
    <DownloadButton />  {/* Always show */}
  </>
);
```

### 5. Handle loading states
```javascript
const [loading, setLoading] = useState(false);

const handleUpload = async () => {
  setLoading(true);
  try {
    await generateAndUploadPDF(doc, 'file.pdf', 'folder');
  } finally {
    setLoading(false);  // Always reset
  }
};
```

## 🎉 Complete Example

```javascript
import { useState } from 'react';
import { generateCertificate } from '@/app/utils/pdfGenerator';
import { generateAndUploadPDF, viewCloudinaryPDF } from '@/app/utils/cloudinaryHelper';

export default function CertificateGenerator() {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Generate PDF
      const doc = await generateCertificate({
        clientName: 'John Smith',
        carBrand: 'BMW',
        carModel: 'X5'
      }, 'en', 'light');
      
      // 2. Upload to Cloudinary
      const result = await generateAndUploadPDF(
        doc, 
        'certificate-john-smith.pdf', 
        'certificates'
      );
      
      // 3. Save URL and open
      setPdfUrl(result.url);
      viewCloudinaryPDF(result.url, 'certificate.pdf');
      
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleGenerate} 
        disabled={loading}
      >
        {loading ? '⏳ Generating...' : '📝 Generate Certificate'}
      </button>
      
      {error && <p className="error">{error}</p>}
      
      {pdfUrl && (
        <div>
          <p>✅ Certificate generated!</p>
          <button onClick={() => viewCloudinaryPDF(pdfUrl)}>
            👁️ View
          </button>
        </div>
      )}
    </div>
  );
}
```

---

**Quick Reference v1.0**  
*Copy-paste ready code snippets for PDF operations*
