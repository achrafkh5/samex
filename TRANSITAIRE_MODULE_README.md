# Mandant Transitaire Module

## Overview
The **Mandant Transitaire** (Customs Broker Mandate) module allows admin users to manage customs brokers and enables clients to generate PDF mandates during the inscription process.

## Features

### Admin Features
1. **Add Customs Brokers** - Create new transitaire entries with complete information
2. **Edit Customs Brokers** - Update existing transitaire details
3. **Delete Customs Brokers** - Remove transitaires from the system
4. **Search & Filter** - Search transitaires by name, agreement number, NIF, or wilaya

### Client Features
1. **Select Customs Broker** - Choose from a list of available transitaires
2. **Generate PDF Mandate** - Automatically generate a PDF mandate with pre-filled information
3. **Upload Signed Mandate** - Upload the signed PDF as part of the inscription process

## File Structure

```
app/
├── models/
│   └── Transitaire.js                    # MongoDB model for transitaires
├── api/
│   ├── transitaires/
│   │   ├── route.js                      # GET (all) & POST (create)
│   │   └── [id]/
│   │       └── route.js                  # GET, PUT, DELETE by ID
│   └── generate-mandat/
│       └── route.js                      # Generate mandate data
├── admin/
│   └── dashboard/
│       └── modules/
│           └── TransitairesModule.js     # Admin UI for managing transitaires
└── components/
    ├── TransitaireSelector.js            # Client UI for selecting & generating PDF
    └── LanguageProvider.js               # Translations (EN/FR/AR)
```

## Database Schema

### Transitaire Collection
```javascript
{
  _id: ObjectId,
  num_agrement: String,           // Agreement number (unique)
  nom_ou_raison_sociale: String,  // Name or company name
  nif: String,                    // Tax identification number
  wilaya: String,                 // Algerian province/state
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### GET `/api/transitaires`
**Public endpoint** - Fetch all transitaires (sorted by name)
```javascript
Response: [
  {
    _id: "...",
    num_agrement: "AG-2024-001",
    nom_ou_raison_sociale: "ABC Customs",
    nif: "123456789",
    wilaya: "Alger",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  }
]
```

### POST `/api/transitaires`
**Admin only** - Create a new transitaire
```javascript
Request Body:
{
  num_agrement: "AG-2024-001",
  nom_ou_raison_sociale: "ABC Customs",
  nif: "123456789",
  wilaya: "Alger"
}

Response: (201 Created)
{
  _id: "...",
  ...transitaire data
}
```

### GET `/api/transitaires/[id]`
**Public endpoint** - Get transitaire by ID
```javascript
Response:
{
  _id: "...",
  num_agrement: "AG-2024-001",
  ...
}
```

### PUT `/api/transitaires/[id]`
**Admin only** - Update transitaire
```javascript
Request Body:
{
  num_agrement: "AG-2024-002",
  nom_ou_raison_sociale: "ABC Customs Updated",
  nif: "987654321",
  wilaya: "Oran"
}

Response:
{
  _id: "...",
  ...updated data
}
```

### DELETE `/api/transitaires/[id]`
**Admin only** - Delete transitaire
```javascript
Response:
{
  success: true
}
```

### POST `/api/generate-mandat`
**Public endpoint** - Get transitaire data for PDF generation
```javascript
Request Body:
{
  transitaireId: "..."
}

Response:
{
  success: true,
  transitaire: {
    num_agrement: "AG-2024-001",
    nom_ou_raison_sociale: "ABC Customs",
    nif: "123456789",
    wilaya: "Alger"
  }
}
```

## Admin Module Usage

### Accessing the Module
1. Login to admin dashboard
2. Navigate to **"Customs Brokers"** in the sidebar
3. View list of all transitaires

### Adding a New Transitaire
1. Click **"Add Customs Broker"** button
2. Fill in the form:
   - **Agreement Number**: Unique identifier (e.g., AG-2024-001)
   - **Name or Company**: Full name or company name
   - **NIF**: Tax identification number
   - **Wilaya**: Select from dropdown (58 Algerian wilayas)
3. Click **"Save"**

### Editing a Transitaire
1. Click **"Edit"** on any transitaire row
2. Modify the fields
3. Click **"Save"**

### Deleting a Transitaire
1. Click **"Delete"** on any transitaire row
2. Confirm the deletion

### Search & Filter
- Use the search box to filter by:
  - Name/Company name
  - Agreement number
  - NIF
  - Wilaya

## Client Inscription Flow

### Step 4: Documents Upload
1. **Select Customs Broker**
   - Client sees a dropdown with all available transitaires
   - Each option shows: `Name - Wilaya`
   
2. **Generate Mandate PDF**
   - Click **"Download Mandate"** button
   - PDF is automatically generated with:
     - Transitaire's agreement number
     - Transitaire's name/company
     - Transitaire's NIF
     - Transitaire's wilaya
   - Fields left blank (as required):
     - `Fait à:` (Place)
     - `le:` (Date)
   - PDF downloads to client's device

3. **Sign and Upload**
   - Client fills in blank fields (Fait à, le)
   - Client signs the document
   - Client uploads the signed PDF using FileUploader

## PDF Generation

The mandate PDF is generated using **jsPDF** on the client side with the following structure:

### PDF Content
```
                    MANDAT

Je soussigné(e):
_________________________________________________

Demeurant à:
_________________________________________________

Donne par le présent mandat tous pouvoirs à:

Numéro d'agrément:        [AUTO-FILLED]
Nom et Prénom ou raison sociale:  [AUTO-FILLED]
NIF:                      [AUTO-FILLED]
Wilaya:                   [AUTO-FILLED]

Aux fins de me représenter auprès de toutes administrations,
notamment les services des douanes, pour accomplir toutes
les formalités nécessaires au dédouanement de mes marchandises.

Fait à: _________________

le: _________________

                                    Signature


        Ce document est généré automatiquement
```

### Fields Automatically Filled
- ✅ Numéro d'agrément
- ✅ Nom et Prénom ou raison sociale
- ✅ NIF
- ✅ Wilaya

### Fields Left Blank (User Must Fill)
- ❌ Client name (Je soussigné(e))
- ❌ Client address (Demeurant à)
- ❌ Fait à (Place)
- ❌ le (Date)
- ❌ Signature

## Translations

All text is available in **English**, **French**, and **Arabic**:

### Key Translation Keys
```javascript
// Module Management
transitairesManagement
manageTransitaires
addTransitaire
editTransitaire
searchTransitaires
noTransitairesFound
transitaireCreated
transitaireUpdated
transitaireDeleted
confirmDeleteTransitaire

// Form Fields
agreementNumber
nameOrCompany
nif
wilaya
selectWilaya
enterNameOrCompany
enterNIF

// Client Selection
selectTransitaire
downloadMandat
selectTransitaireFirst
mandatTransitaire

// UI
loading
generating
save
saving
cancel
edit
delete
required
```

## Algerian Wilayas (58 Total)

The module includes all 58 Algerian wilayas:
- Adrar, Chlef, Laghouat, Oum El Bouaghi, Batna, Béjaïa, Biskra, Béchar, Blida, Bouira, Tamanrasset, Tébessa, Tlemcen, Tiaret, Tizi Ouzou, **Alger**, Djelfa, Jijel, Sétif, Saïda, Skikda, Sidi Bel Abbès, Annaba, Guelma, Constantine, Médéa, Mostaganem, M'Sila, Mascara, Ouargla, **Oran**, El Bayadh, Illizi, Bordj Bou Arréridj, Boumerdès, El Tarf, Tindouf, Tissemsilt, El Oued, Khenchela, Souk Ahras, Tipaza, Mila, Aïn Defla, Naâma, Aïn Témouchent, Ghardaïa, Relizane, Timimoun, Bordj Badji Mokhtar, Ouled Djellal, Béni Abbès, In Salah, In Guezzam, Touggourt, Djanet, El M'Ghair, El Meniaa

## Security

### Authentication
- **Public Endpoints**: `/api/transitaires` (GET), `/api/transitaires/[id]` (GET), `/api/generate-mandat` (POST)
- **Admin-Only Endpoints**: All POST, PUT, DELETE operations require admin authentication via `verifyAdmin()` middleware

### Validation
- All required fields validated on both client and server
- Duplicate agreement numbers prevented
- MongoDB ObjectId validation for operations

## Error Handling

### Client-Side
- Form validation with error messages
- Loading states during API calls
- Success/error toast notifications
- Disabled states during processing

### Server-Side
- Try-catch blocks for all database operations
- Proper HTTP status codes:
  - `200`: Success
  - `201`: Created
  - `400`: Bad Request (validation errors)
  - `401`: Unauthorized (admin auth required)
  - `404`: Not Found
  - `409`: Conflict (duplicate agreement number)
  - `500`: Internal Server Error

## Testing Checklist

### Admin Module
- [ ] Add transitaire with all fields
- [ ] Edit transitaire information
- [ ] Delete transitaire
- [ ] Search/filter functionality
- [ ] Duplicate agreement number validation
- [ ] Toast notifications appear
- [ ] Dark mode compatibility
- [ ] Mobile responsive layout

### Client Module
- [ ] Dropdown loads all transitaires
- [ ] PDF generates with correct data
- [ ] PDF downloads successfully
- [ ] Blank fields remain blank (Fait à, le)
- [ ] Can upload signed PDF
- [ ] Validation works if no transitaire selected
- [ ] Multi-language support (EN/FR/AR)

### API
- [ ] GET all transitaires
- [ ] POST new transitaire (admin auth)
- [ ] PUT update transitaire (admin auth)
- [ ] DELETE transitaire (admin auth)
- [ ] Unauthorized access returns 401
- [ ] Invalid data returns 400
- [ ] Duplicate agreement returns 409

## Future Enhancements

1. **PDF Template Upload**: Allow admin to upload custom PDF template
2. **Digital Signature**: Integrate e-signature functionality
3. **Mandate History**: Track all generated mandates per client
4. **Email Integration**: Auto-email mandate to transitaire
5. **Bulk Import**: Import multiple transitaires from CSV/Excel
6. **Mandate Expiry**: Track mandate expiration dates
7. **Multi-file Support**: Allow multiple mandate types

## Support & Maintenance

For issues or questions:
1. Check MongoDB connection
2. Verify admin authentication
3. Check browser console for errors
4. Verify all API endpoints are accessible
5. Ensure translations are loaded

## Version History

- **v1.0.0** (2024-11-08): Initial release
  - Basic CRUD operations
  - PDF generation
  - Multi-language support
  - Admin module integration
  - Client inscription integration
