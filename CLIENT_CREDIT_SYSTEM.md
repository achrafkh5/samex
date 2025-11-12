# Client Credit Tracking System

## Overview
Implemented a comprehensive credit tracking system that records client payments and manages outstanding balances (credit). When an invoice is generated with a payment amount less than the car price, the remaining balance is tracked as "credit" (debt owed by the client to the company).

## Features Implemented

### 1. PDF Generator Integration
**File**: `app/admin/dashboard/modules/PDFGeneratorModule.js`

When generating an invoice:
- Captures the `amountReceived` from the client
- Calculates credit: `credit = carPrice - amountReceived`
- Updates the client record with:
  - `credit`: Outstanding balance
  - `lastPaymentDate`: Date of payment
  - `lastPaymentAmount`: Amount paid

**Code Changes** (lines ~206-260):
```javascript
// Calculate credit (remaining balance)
const credit = Math.max(0, finalPrice - received);

// Update client credit after invoice generation
await fetch('/api/admin/clients', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: order.clientId,
    credit: credit,
    lastPaymentDate: new Date(),
    lastPaymentAmount: received,
  }),
});
```

### 2. Client Table Enhancement
**File**: `app/admin/dashboard/modules/ClientsModule.js`

#### New Credit Column
Added a new column between "Location" and "Actions" to display:
- **With Credit**: Shows amount in orange/red with "Owes company" label
- **Paid/No Credit**: Shows green "Paid" badge

#### Credit Filter Buttons
Added three filter options:
1. **All Clients**: Shows all clients
2. **With Credit** (Orange): Shows only clients with outstanding balance
   - Displays count of clients with credit
3. **No Credit** (Green): Shows only clients who have paid in full
   - Displays count of fully paid clients

#### Table Changes:
- Updated table headers from 4 to 5 columns
- Added credit display logic
- Implemented credit filtering

**Visual Display**:
```
| Client | Contact | Location | Credit | Actions |
|--------|---------|----------|--------|---------|
| John   | email   | City     | 50,000 DZD | View |
|        |         |          | Owes company |     |
```

### 3. Client Data Structure
**Database Fields Added**:
```javascript
{
  credit: Number,              // Outstanding balance in DZD
  lastPaymentDate: Date,       // Date of last payment
  lastPaymentAmount: Number    // Amount of last payment
}
```

### 4. Translation Support
**File**: `app/components/LanguageProvider.js`

Added translations in 3 languages:

#### English:
- `credit`: 'Credit'
- `all_clients`: 'All Clients'
- `with_credit`: 'With Credit'
- `no_credit`: 'No Credit'
- `owes_company`: 'Owes company'
- `paid`: 'Paid'

#### French:
- `credit`: 'Crédit'
- `all_clients`: 'Tous les Clients'
- `with_credit`: 'Avec Crédit'
- `no_credit`: 'Sans Crédit'
- `owes_company`: 'Doit à l\'entreprise'
- `paid`: 'Payé'

#### Arabic:
- `credit`: 'دين'
- `all_clients`: 'جميع العملاء'
- `with_credit`: 'مع دين'
- `no_credit`: 'بدون دين'
- `owes_company`: 'مدين للشركة'
- `paid`: 'مدفوع'

## How It Works

### Workflow:
1. **Admin generates invoice** for a client
2. **Enters amount received** (e.g., 300,000 DZD for a 500,000 DZD car)
3. **System calculates credit**: 500,000 - 300,000 = 200,000 DZD
4. **Client record updated** with credit of 200,000 DZD
5. **Credit appears in clients table** with orange highlighting
6. **Can filter** to see only clients with outstanding credit

### Example Scenarios:

#### Scenario 1: Partial Payment
- Car Price: 500,000 DZD
- Amount Received: 300,000 DZD
- **Credit**: 200,000 DZD ✅
- **Display**: "200,000 DZD - Owes company" (Orange)

#### Scenario 2: Full Payment
- Car Price: 500,000 DZD
- Amount Received: 500,000 DZD
- **Credit**: 0 DZD ✅
- **Display**: "Paid" (Green)

#### Scenario 3: Overpayment
- Car Price: 500,000 DZD
- Amount Received: 600,000 DZD
- **Credit**: 0 DZD (protected by `Math.max(0, ...)`)
- **Display**: "Paid" (Green)

## Files Modified

1. **app/admin/dashboard/modules/PDFGeneratorModule.js**
   - Added credit calculation on invoice generation
   - Added API call to update client credit
   - Tracks lastPaymentDate and lastPaymentAmount

2. **app/admin/dashboard/modules/ClientsModule.js**
   - Added credit column to table
   - Added credit filter state and logic
   - Added filter buttons UI
   - Updated colspan from 4 to 5
   - Added credit display with conditional styling

3. **app/components/LanguageProvider.js**
   - Added credit-related translations (EN, FR, AR)
   - Added filter button translations

## API Endpoints Used

### PUT `/api/admin/clients`
Updates client information including credit:
```javascript
{
  id: clientId,
  credit: 200000,
  lastPaymentDate: new Date(),
  lastPaymentAmount: 300000
}
```

## Visual Design

### Credit Display Colors:
- **With Credit**: Orange/Red text (`text-orange-600 dark:text-orange-400`)
- **No Credit**: Green text (`text-green-600 dark:text-green-400`)

### Filter Buttons:
- **All Clients**: Purple (`bg-purple-600`)
- **With Credit**: Orange (`bg-orange-600`)
- **No Credit**: Green (`bg-green-600`)

## Future Enhancements

### Potential Improvements:
1. **Payment History**: Track multiple payments instead of just the last one
2. **Payment Plans**: Set up installment schedules
3. **Credit Alerts**: Notify admins when credit > threshold
4. **Credit Reports**: Generate reports of all outstanding credits
5. **Automatic Reminders**: Send payment reminders to clients
6. **Partial Payments**: Allow multiple invoice generations for same order
7. **Credit Aging**: Show how long credit has been outstanding
8. **Interest Calculation**: Calculate interest on overdue payments

## Testing Checklist

- [x] Generate invoice with partial payment
- [x] Verify credit appears in clients table
- [x] Test "With Credit" filter
- [x] Test "No Credit" filter
- [x] Verify credit display formatting
- [x] Test dark mode styling
- [x] Test translations (EN, FR, AR)
- [ ] Test with full payment (credit = 0)
- [ ] Test with overpayment
- [ ] Test client details modal shows credit info
- [ ] Verify database updates correctly

## Usage Instructions

### For Admins:
1. Go to **Dashboard** → **PDF Generator**
2. Select tab **Invoice**
3. Choose an **Order**
4. Enter **Amount Received** (can be less than car price)
5. Click **Generate Invoice**
6. Go to **Clients** tab
7. Use **Credit Filters** to view:
   - All Clients
   - Clients with outstanding credit
   - Clients with no credit (fully paid)
8. Credit amount shows in **Credit column**

### For Developers:
- Credit is stored in `clients` collection
- Automatically updated on invoice generation
- Can be manually updated via `/api/admin/clients` PUT endpoint
- Filter logic in ClientsModule state management
