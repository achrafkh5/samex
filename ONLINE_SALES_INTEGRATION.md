# Online Sales Finance Integration

## Overview
This document describes the integration between online orders (from `/api/orders`) and the Finance Management module. This feature allows admins to link existing online orders with finance tracking, automatically using the order's selling price in profit calculations.

## Features Implemented

### 1. **OnlineSalesSection Component**
**File**: `app/admin/finance/components/OnlineSalesSection.js`

**Purpose**: Display online orders and allow admins to add finance details for each order.

**Key Features**:
- Fetches orders from `/api/orders` API
- Filters to show only completed/confirmed/delivered orders
- Displays order information in a table:
  - Car name
  - Client name
  - Selling price
  - Order date
  - Status
  - Net profit (if finance added)
  - Actions (Add Finance button or "Added" badge)
- Real-time integration with finance entries
- Refresh functionality

**State Management**:
```javascript
const [orders, setOrders] = useState([]);
const [financeEntries, setFinanceEntries] = useState([]);
const [loading, setLoading] = useState(true);
const [selectedOrder, setSelectedOrder] = useState(null);
const [showModal, setShowModal] = useState(false);
```

**Helper Functions**:
- `fetchData()`: Loads orders and finance entries
- `isFinanceAdded(orderId)`: Checks if an order has finance tracking
- `getFinanceProfit(orderId)`: Returns net profit for orders with finance
- `handleAddFinance(order)`: Opens modal for selected order
- `handleFinanceSaved()`: Refreshes data after saving

---

### 2. **FinanceFormModal Component**
**File**: `app/admin/finance/components/FinanceFormModal.js`

**Purpose**: Modal for adding finance details to an online order.

**Key Features**:
- **Sale Type Selection**: Radio buttons for B2B, B2C Algeria, B2C Korea
- **Conditional Form Fields**: Shows relevant fields based on selected type
- **Pre-filled Selling Price**: Displays order selling price (non-editable)
- **Automatic Calculations**: Uses same formulas as manual entry sections
- **Saves with Order Link**: Includes `linkedOrderId` to track order-finance relationship

**Sale Type Options**:

1. **B2B**:
   - Buying Costs
   - Papers Fees
   - Transportation Fees
   - Selling Price (from order)
   - Calculations:
     - Paid to Business = 4.4% of buying costs
     - Alkoca Revenue = 4.4% of buying costs
     - Net Profit = Selling Price - Total Cost + Revenue

2. **B2C Algeria**:
   - Auction Fees
   - Transportation Fees
   - Buying Costs
   - Transaction Fees (Exchange)
   - Papers Fees
   - Selling Price (from order)
   - Calculations:
     - Alkoca Revenue = 8.8% of buying costs
     - Net Profit = Selling Price - Total Cost + Revenue

3. **B2C Korea**:
   - Auction Fees
   - Transportation Fees
   - Buying Costs
   - Papers Fees
   - Selling Price (from order)
   - Calculations:
     - Alkoca Revenue = 8.8% of buying costs
     - Net Profit = Selling Price - Total Cost + Revenue

**Props**:
```javascript
{
  order: Object,      // Order object with sellingPrice, carName, clientName
  onClose: Function,  // Close modal callback
  onSave: Function    // Refresh parent after save
}
```

---

### 3. **Updated Finance API**
**File**: `app/api/finance/route.js`

**Changes**:
- Added support for optional `linkedOrderId` field in POST and PUT methods
- When `linkedOrderId` is provided, it's saved with the finance entry
- This creates a relationship between orders and finance entries

**Updated Schema**:
```javascript
{
  _id: ObjectId,
  type: "B2B" | "B2C_Algeria" | "B2C_Korea",
  fields: {
    // Dynamic fields based on type
    sellingPrice: Number,
    buyingCosts: Number,
    // ... other fields
  },
  totalCost: Number,
  netProfit: Number,
  linkedOrderId: String,  // NEW: Links to order._id
  createdAt: Date,
  updatedAt: Date
}
```

---

### 4. **Updated Finance Page**
**File**: `app/admin/finance/page.js`

**Changes**:
- Added "Online Sales" as a new tab
- Imported `OnlineSalesSection` component
- Integrated with existing tab navigation system

**Tab Structure**:
- B2B (manual entry)
- B2C Algeria (manual entry)
- B2C Korea (manual entry)
- **Online Sales** (NEW - links with orders)

---

### 5. **Multi-Language Support**
**File**: `app/components/LanguageProvider.js`

**New Translation Keys Added** (EN, FR, AR):
- `online_sales_title`: "Online Sales"
- `online_sales_description`: "Link online orders with finance tracking"
- `add_finance`: "Add Finance"
- `finance_added`: "Added"
- `car_name`: "Car"
- `client_name`: "Client"
- `order_date`: "Order Date"
- `no_online_orders`: "No online orders available"
- `select_sale_type`: "Select Sale Type"
- `from_order`: "from order"
- `b2b_subtitle`: "Buying for business"
- `b2c_algeria_subtitle`: "Algerian client"
- `b2c_korea_subtitle`: "Korean business"
- `refresh`: "Refresh"
- `confirmed`: "Confirmed"
- `completed`: "Completed"

---

## User Workflow

### Admin Flow:

1. **Navigate to Finance → Online Sales Tab**
   - View list of all completed/confirmed/delivered orders
   - See which orders already have finance tracking

2. **Add Finance to Order**
   - Click "Add Finance" button on an order
   - Modal opens with order details pre-filled
   - Select sale type (B2B, Algeria, Korea)
   - Fill in relevant cost fields
   - Selling price is automatically used from order
   - Click Save

3. **View Finance Status**
   - Orders with finance show "Added" badge
   - Net profit is displayed in the table
   - Profit is color-coded (green for positive, red for negative)

4. **Refresh Data**
   - Click Refresh button to reload orders and finance data
   - Updates reflect immediately in the table

---

## Data Flow

```
┌─────────────────┐
│  /api/orders    │  ← Existing API
│  (Orders DB)    │
└────────┬────────┘
         │
         │ Fetch orders
         ▼
┌──────────────────────┐
│  OnlineSalesSection  │
│  (Component)         │
└──────────┬───────────┘
           │
           │ Filter: completed/confirmed/delivered
           │ Display in table
           ▼
┌──────────────────────┐
│  FinanceFormModal    │  ← User clicks "Add Finance"
│  (Component)         │
└──────────┬───────────┘
           │
           │ Submit with linkedOrderId
           ▼
┌─────────────────────┐
│  /api/finance       │
│  (Finance DB)       │
└─────────────────────┘
           │
           │ Save with order link
           │ Return success
           ▼
┌──────────────────────┐
│  Refresh Display     │
│  Show "Added" badge  │
│  Display profit      │
└──────────────────────┘
```

---

## Integration Points

### Orders API Expected Structure:
```javascript
{
  _id: String,
  carName: String,         // or car.name
  clientName: String,      // or client.fullName
  sellingPrice: Number,    // or price
  orderDate: Date,
  status: String,          // "completed" | "confirmed" | "delivered"
  // ... other order fields
}
```

### Finance Entry with Order Link:
```javascript
{
  _id: ObjectId,
  type: "B2B",
  fields: {
    buyingCosts: 50000,
    papersFees: 5000,
    transportFees: 3000,
    sellingPrice: 65000,    // From order
    paidToBusiness: 2200,
    alcocaRevenue: 2200
  },
  totalCost: 55800,
  netProfit: 11400,
  linkedOrderId: "abc123def456",  // Links to order._id
  createdAt: "2024-01-15T10:30:00Z"
}
```

---

## Benefits

1. **Reduces Manual Entry**: Selling price is automatically taken from order
2. **Maintains Data Integrity**: Direct link between orders and finance
3. **Real-Time Status**: Admins see which orders have finance at a glance
4. **Unified Dashboard**: All finance data (manual + online) in one place
5. **Accurate Profit Tracking**: Uses actual order selling prices
6. **Audit Trail**: `linkedOrderId` provides clear traceability

---

## Future Enhancements

1. **Edit Finance for Orders**: Allow editing existing finance entries
2. **Delete with Warning**: Warn when deleting finance linked to orders
3. **Bulk Operations**: Add finance to multiple orders at once
4. **Advanced Filtering**: Filter orders by date, status, car type
5. **Export Reports**: Export online sales finance data to CSV/PDF
6. **Notifications**: Alert admins about orders without finance tracking
7. **Analytics Dashboard**: Visualize online vs manual sales performance

---

## Testing Checklist

- [ ] OnlineSalesSection displays orders from /api/orders
- [ ] Only completed/confirmed/delivered orders are shown
- [ ] "Add Finance" button opens modal with correct order data
- [ ] Selling price is pre-filled and non-editable in modal
- [ ] All three sale types work correctly (B2B, Algeria, Korea)
- [ ] Profit calculations match manual entry sections
- [ ] linkedOrderId is saved to database
- [ ] "Added" badge shows for orders with finance
- [ ] Net profit displays correctly in table
- [ ] Refresh button updates data
- [ ] Multi-language translations work (EN, FR, AR)
- [ ] Dark mode styling is correct
- [ ] Responsive design works on mobile

---

## Notes

- **Manual Entry Unchanged**: B2B, Algeria, and Korea tabs still work for manual entry
- **No Order Dependency**: Manual finance entries don't require orders
- **Optional Feature**: linkedOrderId is optional, doesn't affect existing entries
- **Filter Logic**: Orders must have status: "completed", "confirmed", or "delivered"
- **Selling Price Priority**: Uses `order.sellingPrice` first, falls back to `order.price`

---

## Maintenance

### If Orders API Changes:
1. Update `OnlineSalesSection.js` to match new order structure
2. Update `FinanceFormModal.js` if selling price field changes
3. Test filtering logic with new status values

### If Finance Calculations Change:
1. Update `FinanceFormModal.js` calculations
2. Ensure consistency with B2BSection, B2CAlgeriaSection, B2CKoreaSection
3. Update calculation formulas in all locations

### Database Cleanup:
- Orphaned finance entries (linkedOrderId points to deleted order) should be handled
- Consider adding a cleanup script if orders are deleted

---

**Created**: January 2024  
**Last Updated**: January 2024  
**Version**: 1.0
