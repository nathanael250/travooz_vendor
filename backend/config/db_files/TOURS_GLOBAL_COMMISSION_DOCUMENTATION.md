# Tours Global Commission Documentation

## Overview
The `tours_global_commission` table stores the platform-wide commission rate that applies to **ALL tour bookings** across all vendors. When a customer books and pays for any tour package, the platform automatically calculates and deducts the commission.

## How It Works

### Commission Calculation
When a customer books a tour package and pays:

```
Customer Payment: $100
Commission (15%): $100 × 0.15 = $15
Vendor Payout: $100 - $15 = $85
```

### Current Default Commission
- **Commission Percentage**: 15%
- **Structure**: Percentage-based
- **Calculation Method**: Deducted from customer payment
- **Status**: Active

## Table Structure

### Key Fields
- `commission_percentage`: Platform commission percentage (0-100)
- `fixed_commission`: Optional fixed commission amount per booking
- `commission_structure`: 'percentage', 'fixed', or 'hybrid'
- `calculation_method`: How commission is applied
- `effective_from` / `effective_to`: Date range for commission validity
- `is_active`: Whether this commission is currently active

## Usage Examples

### Get Current Active Commission
```sql
SELECT 
    commission_percentage,
    fixed_commission,
    commission_structure,
    calculation_method
FROM tours_global_commission
WHERE is_active = 1
  AND (effective_from IS NULL OR effective_from <= CURDATE())
  AND (effective_to IS NULL OR effective_to >= CURDATE())
ORDER BY effective_from DESC
LIMIT 1;
```

### Update Commission Rate
```sql
-- Deactivate current commission
UPDATE tours_global_commission 
SET is_active = 0, effective_to = CURDATE()
WHERE is_active = 1;

-- Create new commission (e.g., change to 20%)
INSERT INTO tours_global_commission (
    commission_percentage,
    commission_structure,
    calculation_method,
    effective_from,
    is_active,
    description
) VALUES (
    20.00,
    'percentage',
    'customer_pays',
    CURDATE(),
    1,
    'Updated commission rate to 20%'
);
```

### Set Fixed Commission
```sql
-- Set fixed $10 commission per booking
UPDATE tours_global_commission 
SET is_active = 0, effective_to = CURDATE()
WHERE is_active = 1;

INSERT INTO tours_global_commission (
    fixed_commission,
    commission_structure,
    calculation_method,
    effective_from,
    is_active,
    description
) VALUES (
    10.00,
    'fixed',
    'customer_pays',
    CURDATE(),
    1,
    'Fixed $10 commission per booking'
);
```

### Set Hybrid Commission (Fixed + Percentage)
```sql
-- Set $5 fixed + 10% percentage
UPDATE tours_global_commission 
SET is_active = 0, effective_to = CURDATE()
WHERE is_active = 1;

INSERT INTO tours_global_commission (
    fixed_commission,
    commission_percentage,
    commission_structure,
    calculation_method,
    effective_from,
    is_active,
    description
) VALUES (
    5.00,  -- Fixed $5
    10.00, -- Plus 10%
    'hybrid',
    'customer_pays',
    CURDATE(),
    1,
    'Hybrid commission: $5 + 10%'
);
```

## Integration with Booking System

### When Processing Payment
```javascript
// Get active commission
const commission = await getActiveCommission();

// Calculate commission amount
let commissionAmount = 0;
if (commission.commission_structure === 'percentage') {
    commissionAmount = bookingAmount * (commission.commission_percentage / 100);
} else if (commission.commission_structure === 'fixed') {
    commissionAmount = commission.fixed_commission;
} else if (commission.commission_structure === 'hybrid') {
    commissionAmount = commission.fixed_commission + 
                      (bookingAmount * (commission.commission_percentage / 100));
}

// Apply min/max limits
if (commission.min_commission_per_booking && commissionAmount < commission.min_commission_per_booking) {
    commissionAmount = commission.min_commission_per_booking;
}
if (commission.max_commission_per_booking && commissionAmount > commission.max_commission_per_booking) {
    commissionAmount = commission.max_commission_per_booking;
}

// Calculate vendor payout
const vendorPayout = bookingAmount - commissionAmount;

// Save booking with commission details
await saveBooking({
    booking_amount: bookingAmount,
    platform_commission: commissionAmount,
    vendor_payout: vendorPayout,
    commission_percentage: commission.commission_percentage
});
```

## Best Practices

1. **Only One Active Commission**: Always deactivate the previous commission before creating a new one
2. **Use Effective Dates**: Set `effective_from` when changing commission rates to maintain history
3. **Keep History**: Don't delete old commission records; deactivate them instead
4. **Notify Vendors**: When changing commission rates, notify vendors in advance
5. **Test Calculations**: Verify commission calculations before activating new rates

## Commission History

To view commission rate changes over time:
```sql
SELECT 
    commission_id,
    commission_percentage,
    fixed_commission,
    commission_structure,
    effective_from,
    effective_to,
    is_active,
    description,
    created_at
FROM tours_global_commission
ORDER BY effective_from DESC;
```

## Notes

- The commission applies to **ALL tour bookings** regardless of vendor or package
- Commission is calculated at booking/payment time
- Only one commission record should be active (`is_active = 1`) at a time
- Commission history is preserved for reporting and auditing

