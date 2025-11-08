# Transitaire PDF Workflow Documentation

## Overview
This document describes how the PDF generation and storage workflow works for the Transitaire (Customs Broker) module.

## Workflow

### 1. **Create New Transitaire** (Admin Dashboard)
When an admin creates a new transitaire:
- ✅ Admin fills out the form (num_agrement, nom_ou_raison_sociale, nif, wilaya)
- ✅ Frontend calls `POST /api/transitaires`
- ✅ Backend validates data
- ✅ Backend automatically generates PDF by calling `/api/generate-mandat`
- ✅ PDF is uploaded to Cloudinary (folder: `mandats/`)
- ✅ Cloudinary URL is saved in MongoDB (`pdfUrl` field)
- ✅ Transitaire record is created with all data + `pdfUrl`

### 2. **Edit Existing Transitaire** (Admin Dashboard)
When an admin edits a transitaire:
- ✅ Admin updates the form data
- ✅ Frontend calls `PUT /api/transitaires/{id}`
- ✅ Backend validates data
- ✅ Backend regenerates PDF with updated data
- ✅ New PDF is uploaded to Cloudinary
- ✅ `pdfUrl` field is updated in MongoDB
- ✅ Old PDF remains in Cloudinary (can be cleaned up later)

### 3. **Download PDF** (Admin Dashboard)
When an admin clicks the download button:
- ✅ Check if `pdfUrl` exists in database
- ✅ **If PDF exists**: 
  - Open PDF directly from Cloudinary URL
  - Trigger browser download
  - **No API call needed** (instant)
- ✅ **If PDF doesn't exist** (edge case):
  - Generate PDF via `/api/generate-mandat`
  - Update transitaire record with new `pdfUrl`
  - Open and download PDF
  - Refresh table to show updated status

### 4. **Download PDF** (Client Inscription Page)
When a client selects a transitaire and clicks download:
- ✅ Check if `pdfUrl` exists for selected transitaire
- ✅ **If PDF exists**: 
  - Open PDF directly from Cloudinary URL
  - Trigger browser download
  - **No API call needed** (instant)
- ✅ **If PDF doesn't exist** (edge case):
  - Generate PDF via `/api/generate-mandat`
  - Update transitaire record with new `pdfUrl`
  - Open and download PDF

## Database Schema

### Transitaire Collection (MongoDB)
```javascript
{
  _id: ObjectId,
  num_agrement: String,      // Required - Agreement number
  nom_ou_raison_sociale: String,  // Required - Name or company
  nif: String,               // Required - Tax ID
  wilaya: String,            // Required - Algerian province
  pdfUrl: String,            // Cloudinary URL (generated on create/edit)
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### POST /api/transitaires
- **Auth**: Admin only
- **Creates** new transitaire
- **Generates** PDF automatically
- **Saves** PDF URL in database

### PUT /api/transitaires/{id}
- **Auth**: Admin only
- **Updates** transitaire data
- **Regenerates** PDF automatically
- **Updates** PDF URL in database

### POST /api/generate-mandat
- **Auth**: Public (internal use)
- **Generates** PDF from template
- **Uploads** to Cloudinary
- **Returns** Cloudinary URL

## Visual Indicators

### Download Button Colors
- 🟢 **Green** (Download icon): PDF already exists in database - instant download
- 🟠 **Orange** (Plus icon): PDF needs to be generated - will take a moment

## Benefits

1. **Performance**: 
   - No repeated PDF generation
   - Instant downloads after first creation
   - Reduced server load

2. **Consistency**:
   - PDF always reflects current database data
   - Auto-regenerates on edit

3. **Storage**:
   - Centralized in Cloudinary
   - Persistent URLs
   - Easy to manage

4. **User Experience**:
   - Fast downloads
   - Visual feedback (green vs orange)
   - No waiting for generation on repeat downloads

## File Structure

```
app/
├── models/
│   └── Transitaire.js                    # MongoDB model with pdfUrl field
├── api/
│   ├── transitaires/
│   │   ├── route.js                      # POST - Auto-generates PDF
│   │   └── [id]/route.js                 # PUT - Auto-regenerates PDF
│   └── generate-mandat/
│       └── route.js                      # PDF generation + Cloudinary upload
├── admin/dashboard/modules/
│   └── TransitairesModule.js             # Admin CRUD + Smart download
└── components/
    └── TransitaireSelector.js            # Client PDF download
```

## Notes

- PDFs are generated server-side using `pdf-lib`
- Template file: `public/MANDAT SARL CHRONOS TRANSIT & LOGISTIQUE (2).pdf (1).pdf`
- Text placement uses coordinates (not form fields)
- Cloudinary folder: `mandats/`
- All operations include proper error handling and fallbacks

