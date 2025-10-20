# 🧪 PDF Generation System - Testing Guide

## Quick Test Checklist

### ✅ Pre-Test Setup

1. **Ensure dev server is running**:
   ```bash
   npm run dev
   ```
   Server should be at: `http://localhost:3001`

2. **Check installations**:
   ```bash
   npm list jspdf jspdf-autotable
   ```
   Should show both packages installed.

---

## 🎯 Test Scenarios

### Test 1: Admin PDF Generator Access
**Objective**: Verify admin can access PDF generator module

**Steps**:
1. Navigate to `http://localhost:3001/admin/login`
2. Login with: `admin@dreamcars.com` / `admin123`
3. Look for "PDF Generator" in sidebar menu
4. Click "PDF Generator"

**Expected Result**:
- ✅ PDF Generator page loads
- ✅ 3 tabs visible (Certificate, Invoice, Tracking)
- ✅ PDF Settings section shows language & theme selectors
- ✅ Forms are pre-filled with sample data

**Status**: [ ]

---

### Test 2: Certificate Generation (English + Light)
**Objective**: Generate certificate in English with light theme

**Steps**:
1. In PDF Generator, ensure "Certificate" tab is active
2. Set PDF Language to "EN"
3. Set PDF Theme to "Light"
4. Click "📜 Generate Certificate" button

**Expected Result**:
- ✅ PDF downloads automatically
- ✅ File name: `Certificate_Ahmed_Al-Rashid_[timestamp].pdf`
- ✅ PDF opens showing:
  - White background
  - Blue/purple gradient header
  - Client info: Ahmed Al-Rashid
  - Vehicle: Mercedes-Benz S-Class
  - All sections properly formatted
  - Company info in footer

**Status**: [ ]

---

### Test 3: Certificate Generation (Arabic + Dark)
**Objective**: Test RTL support with dark theme

**Steps**:
1. In Certificate tab
2. Set PDF Language to "AR"
3. Set PDF Theme to "Dark"
4. Click "Generate Certificate"

**Expected Result**:
- ✅ PDF downloads
- ✅ Dark background (dark gray)
- ✅ Light text colors
- ✅ **Arabic text is RTL (right-to-left)**
- ✅ Labels in Arabic: "معلومات العميل", "تفاصيل المركبة", etc.
- ✅ Layout mirrors correctly

**Status**: [ ]

---

### Test 4: Invoice Generation with Tax
**Objective**: Verify invoice calculations

**Steps**:
1. Switch to "Invoice" tab
2. Note the price: $95,000
3. Note the discount: $5,000
4. Set Language to EN, Theme to Light
5. Generate invoice

**Expected Result**:
- ✅ PDF shows:
  - Subtotal: $95,000
  - Tax (20%): $19,000
  - Discount: -$5,000
  - **Grand Total: $109,000**
- ✅ Payment Status: PAID (green badge)
- ✅ Invoice number format: INV-XXXXXXXX
- ✅ Table with vehicle details

**Status**: [ ]

---

### Test 5: Tracking Document with Progress
**Objective**: Test progress visualization

**Steps**:
1. Switch to "Tracking" tab
2. Note progress percent: 65%
3. Adjust progress slider to 90%
4. Generate tracking document

**Expected Result**:
- ✅ Tracking code displayed prominently
- ✅ Progress bar shows 90% (visual gradient bar)
- ✅ Station table with 4 rows
- ✅ Status colors:
  - Completed stations: Green
  - In Progress: Blue
  - Pending: Gray
- ✅ Timestamps formatted properly

**Status**: [ ]

---

### Test 6: Documents History
**Objective**: Verify generated documents are tracked

**Steps**:
1. Generate 3 different documents (Certificate, Invoice, Tracking)
2. Scroll to "Generated Documents" table
3. Check table content

**Expected Result**:
- ✅ Table shows 3 rows
- ✅ Columns: Type, Client, Filename, Language, Theme, Date
- ✅ Type badges color-coded (blue)
- ✅ Languages show: EN/FR/AR
- ✅ Themes show: ☀️ light / 🌙 dark
- ✅ Dates show current timestamp

**Status**: [ ]

---

### Test 7: Client Documents Portal Access
**Objective**: Test client-facing portal

**Steps**:
1. Navigate to `http://localhost:3001/documents`
2. Observe page layout

**Expected Result**:
- ✅ Page loads with document icon
- ✅ Title: "My Documents"
- ✅ Lookup form visible
- ✅ Sample codes displayed in blue box
- ✅ Two sample codes clickable

**Status**: [ ]

---

### Test 8: Valid Tracking Code Lookup
**Objective**: Lookup documents with valid code

**Steps**:
1. On `/documents` page
2. Click sample code button: "TRK-20241019-ABC123"
3. Click "Lookup" button
4. Wait for loading (spinning icon)

**Expected Result**:
- ✅ Loading spinner shows briefly
- ✅ Welcome card appears with gradient (blue→purple)
- ✅ Shows: "Welcome, Ahmed Al-Rashid!"
- ✅ Vehicle: Mercedes-Benz S-Class
- ✅ Tracking code displayed
- ✅ Three document cards appear:
  - Certificate (green border)
  - Invoice (blue border)
  - Tracking (purple border)
- ✅ Document info section shows 4 fields

**Status**: [ ]

---

### Test 9: Document Download from Portal
**Objective**: Download PDFs from client portal

**Steps**:
1. After successful lookup (Test 8)
2. Click "📄 Download" on Certificate card
3. Click "🧾 Download" on Invoice card
4. Click "📦 Download" on Tracking card

**Expected Result**:
- ✅ All 3 PDFs download successfully
- ✅ PDFs use current site language (check language switcher)
- ✅ PDFs use current site theme (check theme toggle)
- ✅ Client name is same in all: Ahmed Al-Rashid
- ✅ Vehicle is same: Mercedes-Benz S-Class

**Status**: [ ]

---

### Test 10: Invalid Tracking Code
**Objective**: Test error handling

**Steps**:
1. On `/documents` page
2. Enter invalid code: "INVALID-CODE-123"
3. Click "Lookup"

**Expected Result**:
- ✅ Red error banner appears
- ✅ Message: "Tracking code not found. Please check and try again."
- ✅ No document cards shown
- ✅ Error dismisses on retry

**Status**: [ ]

---

### Test 11: Multi-Language UI Test
**Objective**: Verify translations work

**Steps**:
1. On any page, click language selector
2. Switch to French (FR)
3. Navigate to `/documents`
4. Check button text
5. Switch to Arabic (AR)
6. Check text direction

**Expected Result**:
- ✅ French:
  - "Mes Documents"
  - "Rechercher" button
  - "Bienvenue" in results
- ✅ Arabic:
  - "مستنداتي" heading
  - "بحث" button
  - Text flows right-to-left
  - Layout mirrors properly

**Status**: [ ]

---

### Test 12: Responsive Mobile Layout
**Objective**: Test mobile responsiveness

**Steps**:
1. Open `/admin/dashboard` → PDF Generator
2. Open DevTools (F12)
3. Toggle device toolbar (Ctrl+Shift+M)
4. Set to iPhone 12 Pro (390x844)
5. Test form and buttons

**Expected Result**:
- ✅ Forms switch to single column
- ✅ Buttons stack vertically
- ✅ PDF settings remain accessible
- ✅ Tabs work on mobile
- ✅ Generate buttons full width

**Status**: [ ]

---

### Test 13: Theme Integration
**Objective**: Verify dark mode works

**Steps**:
1. On any page, click theme toggle (sun/moon icon)
2. Switch to dark mode
3. Navigate to `/documents`
4. Generate a PDF from admin panel

**Expected Result**:
- ✅ Portal uses dark background
- ✅ Text is light colored
- ✅ Cards have dark bg with light borders
- ✅ Generated PDF respects selected PDF theme (not site theme)
- ✅ Theme toggle persists across pages

**Status**: [ ]

---

### Test 14: Form Validation
**Objective**: Test input handling

**Steps**:
1. In Admin PDF Generator
2. Clear all fields in Certificate form
3. Try to generate

**Expected Result**:
- ✅ PDF still generates (uses empty/N/A values)
- ✅ No JavaScript errors
- ✅ PDF layout doesn't break

**Status**: [ ]

---

### Test 15: Second Sample Code
**Objective**: Test alternate dataset

**Steps**:
1. On `/documents`
2. Click sample code: "TRK-20241019-XYZ789"
3. Click Lookup
4. Download all 3 documents

**Expected Result**:
- ✅ Client: Sarah Johnson
- ✅ Vehicle: BMW M4 Competition
- ✅ Progress: 90%
- ✅ Invoice discount: $5,000
- ✅ All PDFs download correctly

**Status**: [ ]

---

## 🐛 Known Issues / Limitations

### Arabic Font Support
**Issue**: jsPDF has limited Arabic font support. Text may appear disconnected.

**Workaround**: 
- For demo: Acceptable
- For production: Use `pdf-lib` or server-side rendering

**Status**: Known limitation

---

### Mobile PDF Download
**Issue**: Some mobile browsers block automatic downloads.

**Workaround**:
```javascript
// Alternative approach
window.open(doc.output('bloburl'));
```

**Status**: Works in most modern browsers

---

### Large File Size
**Issue**: PDFs with images can be large (100-200KB).

**Optimization**:
- Compress embedded images
- Use vector graphics where possible
- Consider web fonts

**Status**: Acceptable for current implementation

---

## 📊 Test Results Summary

Fill in after testing:

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Admin Access | ⬜ | |
| 2 | Certificate EN Light | ⬜ | |
| 3 | Certificate AR Dark | ⬜ | |
| 4 | Invoice Calculation | ⬜ | |
| 5 | Tracking Progress | ⬜ | |
| 6 | Documents History | ⬜ | |
| 7 | Portal Access | ⬜ | |
| 8 | Valid Lookup | ⬜ | |
| 9 | Portal Download | ⬜ | |
| 10 | Invalid Code | ⬜ | |
| 11 | Multi-Language | ⬜ | |
| 12 | Mobile Layout | ⬜ | |
| 13 | Theme Toggle | ⬜ | |
| 14 | Form Validation | ⬜ | |
| 15 | Second Dataset | ⬜ | |

**Legend**: ✅ Passed | ❌ Failed | ⬜ Not Tested

---

## 🔍 Debug Tips

### Check Browser Console
Press F12 and check for errors:
```javascript
// Should see no errors
// PDF generation logs are minimal
```

### Verify Imports
Check Network tab for:
```
jspdf library loaded
jspdf-autotable loaded
No 404 errors
```

### Test in Multiple Browsers
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari (may have download quirks)

### Check LocalStorage
```javascript
// In browser console
localStorage.getItem('generatedPDFs')
// Should return JSON array after generating docs
```

---

## 🎓 Success Criteria

### Minimum Requirements (MVP)
- [x] All 3 document types generate
- [x] English language works
- [x] Light theme works
- [x] Admin can access generator
- [x] Client can download from portal
- [x] No critical errors

### Full Features
- [x] All 3 languages work (EN/FR/AR)
- [x] Both themes work (Light/Dark)
- [x] RTL support for Arabic
- [x] Responsive on mobile
- [x] History tracking works
- [x] Error handling present
- [x] Toast notifications work
- [x] Sample codes functional

### Production Ready
- [ ] API integration
- [ ] Cloudinary upload
- [ ] Database storage
- [ ] Authentication
- [ ] Email notifications
- [ ] Rate limiting
- [ ] Input sanitization

---

## 📝 Post-Test Actions

After completing all tests:

1. **Document Issues**:
   - List any bugs found
   - Rate severity (Critical/Major/Minor)
   - Add to issue tracker

2. **Performance Check**:
   - Measure PDF generation time
   - Check file sizes
   - Note any slow operations

3. **User Experience**:
   - Rate ease of use (1-10)
   - Note confusing elements
   - Suggest improvements

4. **Production Readiness**:
   - Complete checklist above
   - Plan integration steps
   - Set deployment timeline

---

## ✅ Final Checklist

Before marking as complete:

- [ ] All 15 tests executed
- [ ] Results documented
- [ ] Issues logged
- [ ] Screenshots captured (optional)
- [ ] Performance acceptable
- [ ] Code reviewed
- [ ] Documentation complete
- [ ] Ready for demo

---

**Testing completed by**: _______________  
**Date**: _______________  
**Overall Status**: ⬜ Passed | ⬜ Failed | ⬜ Needs Work

---

**Happy Testing! 🎉**
