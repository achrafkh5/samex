# Transitaire Module - Testing Guide

## Pre-Testing Setup

### 1. Start Development Server
```bash
npm run dev
```

### 2. Ensure MongoDB is Connected
Check that your MongoDB connection in `lib/mongodb.js` is working.

---

## Admin Module Testing

### Test 1: Access Admin Module
1. Navigate to: `http://localhost:3000/admin/login`
2. Login with admin credentials
3. Navigate to: `http://localhost:3000/admin/dashboard?page=transitaires`
4. **Expected**: See "Customs Brokers Management" page with empty list or existing transitaires

### Test 2: Add New Transitaire
1. Click **"Add Customs Broker"** button
2. Fill in form:
   - Agreement Number: `AG-2024-001`
   - Name or Company: `ABC Customs Services`
   - NIF: `123456789012345`
   - Wilaya: Select `Alger`
3. Click **"Save"**
4. **Expected**: 
   - Green toast: "Customs broker created successfully"
   - New row appears in table
   - Modal closes automatically

### Test 3: Add Duplicate Agreement Number
1. Click **"Add Customs Broker"**
2. Use same agreement number: `AG-2024-001`
3. Fill other fields
4. Click **"Save"**
5. **Expected**: 
   - Red toast: "Agreement number already exists"
   - Form stays open

### Test 4: Edit Transitaire
1. Click **"Edit"** on existing transitaire
2. Change Name to: `ABC Customs Services SARL`
3. Click **"Save"**
4. **Expected**:
   - Green toast: "Customs broker updated successfully"
   - Table updates with new name
   - Modal closes

### Test 5: Search Functionality
1. Add 2-3 more transitaires with different wilayas
2. Type in search box: `ABC`
3. **Expected**: Only matching transitaires shown
4. Clear search
5. **Expected**: All transitaires shown again

### Test 6: Delete Transitaire
1. Click **"Delete"** on a transitaire
2. Confirm in dialog
3. **Expected**:
   - Green toast: "Customs broker deleted successfully"
   - Row removed from table

### Test 7: Form Validation
1. Click **"Add Customs Broker"**
2. Leave all fields empty
3. Click **"Save"**
4. **Expected**: Red error messages under each required field
5. Fill only Agreement Number
6. Click **"Save"**
7. **Expected**: Error messages only for remaining empty fields

### Test 8: Dark Mode
1. Toggle dark mode in admin sidebar
2. **Expected**: 
   - Background changes to dark
   - Text remains readable
   - Table styling adapts
   - Modal styling adapts

### Test 9: Mobile Responsive
1. Resize browser to mobile width (< 768px)
2. **Expected**:
   - Table scrolls horizontally
   - Add button stacks on small screens
   - Modal is responsive

---

## Client Module Testing

### Test 10: Access Inscription Page
1. Logout from admin
2. Navigate to: `http://localhost:3000/inscription`
3. Fill steps 1-3
4. Proceed to Step 4 (Documents)
5. **Expected**: See "Customs Broker Mandate" section with dropdown and download button

### Test 11: Dropdown Population
1. In Step 4, locate TransitaireSelector component
2. Click on dropdown
3. **Expected**: 
   - See all transitaires you added in admin
   - Format: "Name - Wilaya" (e.g., "ABC Customs Services - Alger")

### Test 12: Generate Mandate PDF (No Selection)
1. Without selecting a transitaire
2. Click **"Download Mandate"**
3. **Expected**: 
   - Alert: "Please select a customs broker first"
   - No PDF download

### Test 13: Generate Mandate PDF (With Selection)
1. Select a transitaire from dropdown
2. Click **"Download Mandate"**
3. **Expected**:
   - Button shows "Generating..." with spinner
   - PDF downloads to browser
   - Filename: `Mandat_Transitaire_[Name].pdf`

### Test 14: Verify PDF Content
1. Open the downloaded PDF
2. **Expected Content**:
   - ✅ Title: "MANDAT"
   - ✅ "Numéro d'agrément:" with value from DB
   - ✅ "Nom et Prénom ou raison sociale:" with value from DB
   - ✅ "NIF:" with value from DB
   - ✅ "Wilaya:" with value from DB
   - ❌ "Fait à:" is BLANK (line only)
   - ❌ "le:" is BLANK (line only)
   - ❌ Client name/address are BLANK (lines only)
   - ✅ Mission text in French
   - ✅ "Signature" label present

### Test 15: Upload Signed Mandate
1. After generating PDF, fill it out manually
2. In the FileUploader below TransitaireSelector
3. Upload the signed PDF
4. **Expected**:
   - File preview shows
   - "File Uploaded" message
   - Can remove and re-upload

### Test 16: Complete Inscription
1. Fill all required documents
2. Upload signed mandate
3. Accept terms
4. Submit form
5. **Expected**:
   - Form submits successfully
   - Mandate URL saved in database

---

## API Testing (Optional)

### Test 17: GET All Transitaires
```bash
# Using curl or browser
GET http://localhost:3000/api/transitaires
```
**Expected**: JSON array of all transitaires

### Test 18: POST Create Transitaire (Unauthorized)
```bash
# Without admin token
POST http://localhost:3000/api/transitaires
Content-Type: application/json

{
  "num_agrement": "TEST-001",
  "nom_ou_raison_sociale": "Test",
  "nif": "123",
  "wilaya": "Oran"
}
```
**Expected**: 401 Unauthorized

### Test 19: POST Create Transitaire (Authorized)
1. Login as admin first to get token
2. Send request with admin token cookie
**Expected**: 201 Created with transitaire data

---

## Language Testing

### Test 20: French Translation
1. Change language to French
2. Navigate to admin transitaires page
3. **Expected**:
   - "Gestion des Transitaires"
   - "Ajouter un Transitaire"
   - "Numéro d'Agrément"
   - All buttons/labels in French

### Test 21: Arabic Translation
1. Change language to Arabic
2. Navigate to admin transitaires page
3. **Expected**:
   - "إدارة وكلاء الجمارك"
   - "إضافة وكيل جمارك"
   - RTL layout if supported
   - All buttons/labels in Arabic

### Test 22: PDF Generation in Different Languages
1. Switch language to French
2. Generate PDF
3. **Expected**: PDF template text in French
4. Switch to Arabic
5. Generate PDF
6. **Expected**: PDF template text in Arabic (if implemented)

---

## Error Handling Testing

### Test 23: Network Error
1. Stop backend server
2. Try to add transitaire
3. **Expected**: Error toast with generic message

### Test 24: Invalid Data
1. Edit transitaire
2. Clear all fields
3. Submit
4. **Expected**: Validation errors prevent submission

### Test 25: Non-existent ID
1. Manually navigate to: `/api/transitaires/invalid-id-12345`
2. **Expected**: 404 or 500 error with appropriate message

---

## Performance Testing

### Test 26: Large Dataset
1. Add 50+ transitaires via MongoDB directly or script
2. Load admin page
3. **Expected**: 
   - Page loads within 2-3 seconds
   - Search works smoothly
   - No lag in UI

### Test 27: Concurrent Operations
1. Open two browser tabs
2. Edit different transitaires simultaneously
3. **Expected**: Both save successfully without conflicts

---

## Regression Testing

### Test 28: Existing Inscription Flow
1. Complete entire inscription process
2. **Expected**: All existing steps work normally
3. **Expected**: Step 4 has new TransitaireSelector without breaking other uploads

### Test 29: Admin Dashboard Navigation
1. Navigate between different admin modules
2. **Expected**: Transitaires module doesn't affect other modules
3. **Expected**: Sidebar highlights correctly

---

## Browser Compatibility

### Test 30: Cross-Browser
Test in:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)

**Expected**: Consistent behavior across browsers

---

## Cleanup After Testing

1. Delete test transitaires via admin UI
2. Verify MongoDB collection is clean
3. Check uploaded files in Cloudinary (if applicable)

---

## Bug Report Template

If you find issues, document:

```
**Bug**: [Brief description]
**Steps to Reproduce**:
1. ...
2. ...
**Expected**: ...
**Actual**: ...
**Browser**: ...
**Environment**: Dev/Prod
**Screenshots**: [if applicable]
```

---

## Test Status Tracker

```
[ ] Test 1-9: Admin Module (CRUD)
[ ] Test 10-16: Client Module (PDF Generation)
[ ] Test 17-19: API Testing
[ ] Test 20-22: Language Testing
[ ] Test 23-25: Error Handling
[ ] Test 26-27: Performance
[ ] Test 28-29: Regression
[ ] Test 30: Cross-Browser
```

---

## Success Criteria

✅ All 30 tests pass without errors
✅ PDF generates correctly with pre-filled data
✅ Blank fields remain blank ("Fait à", "le")
✅ Multilingual support works
✅ Admin CRUD operations work
✅ No errors in browser console
✅ No errors in server logs
✅ Mobile responsive
✅ Dark mode compatible
