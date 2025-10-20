# Terms & Conditions - Quick Reference Guide

## 🚀 Quick Start

### Access the Page
```
http://localhost:3000/terms
```

### Files Structure
```
app/terms/
├── TermsContent.js    # Main component (950+ lines)
├── page.js            # Page entry + SEO metadata
└── layout.js          # Layout wrapper
```

---

## 📋 11 Main Sections

| # | Section | Icon | Key Content |
|---|---------|------|-------------|
| 1 | Introduction | 📋 | Purpose, scope, binding agreement |
| 2 | Definitions | 📖 | Agency, Client, Order, Tracking, Services |
| 3 | User Obligations | ✅ | Accurate info, lawful docs, compliance, security |
| 4 | Orders & Payments | 💳 | Confirmation, methods, refunds, pricing |
| 5 | Delivery & Tracking | 🚚 | ETAs, delays, transit, proof of delivery |
| 6 | Documents & Files | 📁 | Required docs, storage, verification, authenticity |
| 7 | Liability & Disclaimer | ⚠️ | Limitations, force majeure, warranties |
| 8 | Privacy & Data | 🔒 | Reference to Privacy Policy, GDPR compliance |
| 9 | Governing Law | ⚖️ | Jurisdiction, dispute resolution process |
| 10 | Changes to Terms | 🔄 | Update notifications, effective dates |
| 11 | Contact Us | 📧 | Legal team, general inquiries, response times |

---

## 🎯 Key Features

### ✅ Interactive Features
- **Table of Contents** - Click to jump to any section
- **Active Section Tracking** - Highlights current section while scrolling
- **Scroll-to-Top Button** - Appears after scrolling 300px
- **Print Button** - Opens print dialog with optimized layout
- **Terms Acceptance Checkbox** - Saves to localStorage for registration

### 🌍 Multi-Language Support
- **English (EN)** - 163 translation keys
- **French (FR)** - 163 translation keys  
- **Arabic (AR)** - 163 translation keys + RTL support

### 🌙 Theme Support
- **Light Mode** - Clean white background
- **Dark Mode** - Dark gray background with proper contrast
- **Auto-adapting** - Colors adjust based on theme

### 📱 Responsive Design
- **Mobile** - Single column, hidden sidebar
- **Tablet** - Single column, collapsible TOC
- **Desktop** - Two columns (25% sidebar + 75% content)

---

## 🔧 Code Snippets

### Check Terms Acceptance (for Registration)
```javascript
// Check if user accepted terms
const termsData = JSON.parse(localStorage.getItem('termsAccepted') || '{}');

if (!termsData.accepted) {
  alert('Please accept the Terms & Conditions');
  router.push('/terms');
  return;
}

console.log('Terms accepted on:', termsData.timestamp);
```

### Link to Terms Page
```jsx
import Link from 'next/link';

// Simple link
<Link href="/terms">Terms & Conditions</Link>

// With styling
<Link 
  href="/terms"
  className="text-blue-600 hover:underline"
>
  Terms & Conditions
</Link>
```

### Scroll to Specific Section
```javascript
// Programmatically scroll to a section
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

// Usage
scrollToSection('orders-payments'); // Jumps to section 4
```

---

## 📝 Translation Keys Structure

### Main Object
```javascript
{
  termsAndConditions: 'Terms & Conditions',
  terms: {
    // General (5 keys)
    subtitle: '...',
    effectiveDate: '...',
    tableOfContents: '...',
    printTerms: '...',
    acceptTerms: '...',
    
    // Section 1: Introduction (6 keys)
    introduction: '...',
    purposeTitle: '...',
    purposeText1: '...',
    purposeText2: '...',
    scopeTitle: '...',
    scopeText: '...',
    
    // Section 2: Definitions (11 keys)
    definitions: '...',
    definitionsIntro: '...',
    defAgency: '...',
    defAgencyText: '...',
    // ... 7 more definition keys
    
    // Sections 3-11: ~140 more keys
    // ... (see full documentation)
  }
}
```

---

## 🎨 Color Scheme

### Primary Colors
- **Main Theme**: Indigo-600 (`#4F46E5`)
- **Secondary**: Purple-600 (`#9333EA`)
- **Hero Gradient**: Indigo-600 → Purple-800

### Section Accent Colors
- **Blue**: Definitions, Privacy (`bg-blue-50 dark:bg-blue-900/20`)
- **Indigo**: User obligations, Payments (`bg-indigo-50 dark:bg-indigo-900/20`)
- **Yellow**: Refunds warning (`bg-yellow-50 dark:bg-yellow-900/20`)
- **Orange**: Delays notice (`bg-orange-50 dark:bg-orange-900/20`)
- **Red**: Document authenticity (`bg-red-50 dark:bg-red-900/20`)
- **Gray**: Warranty disclaimer (`bg-gray-100 dark:bg-gray-700/50`)

---

## 📊 Component Stats

| Metric | Value |
|--------|-------|
| Total Lines | 950+ |
| File Size | ~35KB |
| Translation Keys | 163 per language |
| Major Sections | 11 |
| Subsections | 40+ |
| Interactive Buttons | 14 (11 TOC + 3 actions) |
| Supported Languages | 3 (EN, FR, AR) |

---

## 🔗 Integration Examples

### Footer Link
```jsx
// In Footer.js
<div className="space-y-2">
  <Link href="/terms" className="hover:text-blue-400">
    {t?.termsAndConditions}
  </Link>
  <Link href="/privacy" className="hover:text-blue-400">
    {t?.privacyPolicy}
  </Link>
</div>
```

### Registration Form
```jsx
// In Register.js
<label className="flex items-center gap-2">
  <input type="checkbox" required />
  <span>
    I accept the{' '}
    <Link href="/terms" className="text-blue-600 underline">
      Terms & Conditions
    </Link>
  </span>
</label>
```

### Admin Dashboard
```jsx
// In Admin Legal Section
<div className="grid grid-cols-2 gap-4">
  <Link href="/terms" className="card">
    <h3>📜 Terms & Conditions</h3>
    <p>Manage legal terms</p>
  </Link>
  <Link href="/privacy" className="card">
    <h3>🔒 Privacy Policy</h3>
    <p>Manage privacy policy</p>
  </Link>
</div>
```

---

## 🧪 Quick Test Commands

### Test All Languages
```javascript
// In browser console
// Switch to French
localStorage.setItem('language', 'fr');
location.reload();

// Switch to Arabic
localStorage.setItem('language', 'ar');
location.reload();

// Switch to English
localStorage.setItem('language', 'en');
location.reload();
```

### Test Terms Acceptance
```javascript
// In browser console
// Accept terms
localStorage.setItem('termsAccepted', JSON.stringify({
  accepted: true,
  timestamp: new Date().toISOString()
}));

// Check acceptance
const terms = JSON.parse(localStorage.getItem('termsAccepted'));
console.log('Accepted:', terms.accepted);
console.log('When:', terms.timestamp);

// Clear acceptance
localStorage.removeItem('termsAccepted');
```

### Test Dark Mode
```javascript
// In browser console
// Enable dark mode
document.documentElement.classList.add('dark');

// Disable dark mode
document.documentElement.classList.remove('dark');

// Toggle dark mode
document.documentElement.classList.toggle('dark');
```

---

## 🖨️ Print Layout Features

### Hidden Elements (print:hidden)
- ❌ Table of Contents sidebar
- ❌ Print button
- ❌ Accept checkbox
- ❌ Scroll-to-top button
- ❌ Theme toggle
- ❌ Language selector

### Print-Optimized Elements
- ✅ Clean white background
- ✅ Black text for readability
- ✅ 2cm margins all sides
- ✅ Page break optimization
- ✅ Preserved section structure
- ✅ Contact information visible

### Test Print
```javascript
// Programmatically trigger print
window.print();

// Or use the Print button in the UI
```

---

## ⚡ Performance Tips

1. **Lazy Load** - Component loads only when page is accessed
2. **Code Splitting** - Next.js automatically splits code
3. **Optimized Images** - Use emoji instead of image files
4. **Minimal Dependencies** - Only React and Next.js required
5. **CSS in JS** - Tailwind classes, no external CSS files

---

## 🐛 Common Issues & Fixes

### Issue: Translations Missing
```javascript
// Fix: Check LanguageProvider.js has all keys
// Verify structure: t?.terms?.sectionName
```

### Issue: RTL Not Working
```javascript
// Fix: Ensure dir attribute is set
<div dir={isRTL ? 'rtl' : 'ltr'}>
```

### Issue: Scroll Not Smooth
```javascript
// Fix: Check scroll behavior
window.scrollTo({ 
  top: position, 
  behavior: 'smooth' // Must be 'smooth', not 'auto'
});
```

### Issue: LocalStorage Not Saving
```javascript
// Fix: Check browser allows localStorage
if (typeof window !== 'undefined') {
  localStorage.setItem('key', 'value');
}
```

---

## 📱 Responsive Breakpoints

```javascript
// Tailwind breakpoints used
sm: '640px'   // Small tablets
md: '768px'   // Tablets
lg: '1024px'  // Desktops (sidebar appears)
xl: '1280px'  // Large desktops
2xl: '1536px' // Extra large screens
```

---

## 🎓 Next Steps After Implementation

1. ✅ **Test all sections** - Verify content displays correctly
2. ✅ **Test all languages** - EN, FR, AR with RTL
3. ✅ **Test themes** - Light and dark modes
4. ✅ **Test print** - Print layout is clean
5. ✅ **Test responsive** - Mobile, tablet, desktop
6. ✅ **Test accessibility** - Keyboard navigation, screen readers
7. ✅ **Integrate with registration** - Check terms acceptance
8. ✅ **Add footer link** - Link from footer
9. ✅ **Add admin link** - Link from admin dashboard (if applicable)
10. ✅ **SEO check** - Verify metadata and heading structure

---

## 📚 Related Pages

- **Privacy Policy** - `/privacy` - Data protection and privacy
- **Contact Page** - `/contact` - Legal inquiries contact form
- **Registration** - `/register` - Uses terms acceptance
- **About Page** - `/about` - Company information

---

## 🎉 Summary

**Terms & Conditions Page** is production-ready with:

- ✅ 11 comprehensive legal sections
- ✅ 163 translation keys × 3 languages
- ✅ Full RTL support for Arabic
- ✅ Dark/light theme compatibility
- ✅ Print-friendly layout
- ✅ Terms acceptance for registration
- ✅ Smooth scroll navigation
- ✅ SEO optimized
- ✅ Fully responsive
- ✅ Accessible (WCAG AA)

**Status**: 🚀 **Ready for Production**

---

**Quick Links:**
- [Full Documentation](./TERMS_CONDITIONS_README.md)
- [Privacy Policy Docs](./PRIVACY_POLICY_README.md)
- [Component Source](./app/terms/TermsContent.js)
