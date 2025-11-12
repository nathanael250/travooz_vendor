# Tour Package Commissions Table Documentation

## Overview
The `tours_package_commissions` table centralizes commission information for tour packages. It allows for flexible commission structures at different levels (package, pricing tier, or add-on).

## Table Structure

### Primary Fields
- `commission_id`: Primary key
- `package_id`: Foreign key to `tours_packages`
- `commission_type`: Type of commission ('default', 'tier', 'addon')
- `reference_id`: Reference to specific tier or addon (NULL for default)

### Commission Configuration
- `commission_percentage`: Commission percentage (0-100)
- `fixed_commission`: Fixed commission amount (alternative to percentage)
- `commission_structure`: How commission is calculated ('percentage', 'fixed', 'hybrid')
- `min_commission`: Minimum commission amount
- `max_commission`: Maximum commission amount
- `currency`: Currency code (default: 'RWF')

### Calculation Method
- `calculation_method`: How commission is applied
  - `customer_pays`: Commission deducted from customer payment
  - `vendor_pays`: Commission added to vendor payout
  - `split`: Commission split between customer and vendor

### Time-based Commission
- `effective_from`: Start date for this commission rate
- `effective_to`: End date (NULL = ongoing)
- `is_active`: Whether this commission structure is currently active

## Usage Examples

### 1. Default Package Commission
Set a default 15% commission for the entire package:
```sql
INSERT INTO tours_package_commissions (
    package_id,
    commission_type,
    commission_percentage,
    commission_structure,
    calculation_method
) VALUES (
    139,
    'default',
    15.00,
    'percentage',
    'customer_pays'
);
```

### 2. Pricing Tier-Specific Commission
Override commission for a specific pricing tier (e.g., 20% for premium tier):
```sql
INSERT INTO tours_package_commissions (
    package_id,
    commission_type,
    reference_id,
    commission_percentage,
    commission_structure,
    calculation_method
) VALUES (
    139,
    'tier',
    123, -- tier_id from tours_package_pricing_tiers
    20.00,
    'percentage',
    'customer_pays'
);
```

### 3. Add-on Specific Commission
Set a different commission for a specific add-on (e.g., 10% for equipment rental):
```sql
INSERT INTO tours_package_commissions (
    package_id,
    commission_type,
    reference_id,
    commission_percentage,
    commission_structure,
    calculation_method
) VALUES (
    139,
    'addon',
    456, -- addon_id from tours_package_addons
    10.00,
    'percentage',
    'customer_pays'
);
```

### 4. Fixed Commission
Set a fixed commission amount instead of percentage:
```sql
INSERT INTO tours_package_commissions (
    package_id,
    commission_type,
    fixed_commission,
    commission_structure,
    calculation_method,
    currency
) VALUES (
    139,
    'default',
    50.00,
    'fixed',
    'customer_pays',
    'RWF'
);
```

### 5. Hybrid Commission (Fixed + Percentage)
Combine fixed amount with percentage:
```sql
INSERT INTO tours_package_commissions (
    package_id,
    commission_type,
    fixed_commission,
    commission_percentage,
    commission_structure,
    calculation_method
) VALUES (
    139,
    'default',
    25.00, -- Base fixed commission
    10.00, -- Additional percentage
    'hybrid',
    'customer_pays'
);
```

### 6. Time-Limited Commission
Set commission rates that change over time:
```sql
-- Current commission (15%)
INSERT INTO tours_package_commissions (
    package_id,
    commission_type,
    commission_percentage,
    effective_from,
    effective_to,
    is_active
) VALUES (
    139,
    'default',
    15.00,
    '2025-01-01',
    '2025-06-30',
    1
);

-- Future commission (20% starting July)
INSERT INTO tours_package_commissions (
    package_id,
    commission_type,
    commission_percentage,
    effective_from,
    effective_to,
    is_active
) VALUES (
    139,
    'default',
    20.00,
    '2025-07-01',
    NULL, -- Ongoing
    1
);
```

## Querying Commissions

### Get Active Default Commission for Package
```sql
SELECT * FROM tours_package_commissions
WHERE package_id = 139
  AND commission_type = 'default'
  AND is_active = 1
  AND (effective_from IS NULL OR effective_from <= CURDATE())
  AND (effective_to IS NULL OR effective_to >= CURDATE())
ORDER BY created_at DESC
LIMIT 1;
```

### Get Commission for Specific Pricing Tier
```sql
SELECT * FROM tours_package_commissions
WHERE package_id = 139
  AND commission_type = 'tier'
  AND reference_id = 123 -- tier_id
  AND is_active = 1
ORDER BY created_at DESC
LIMIT 1;
```

### Get All Active Commissions for Package
```sql
SELECT 
    commission_type,
    reference_id,
    commission_percentage,
    fixed_commission,
    commission_structure,
    calculation_method,
    effective_from,
    effective_to
FROM tours_package_commissions
WHERE package_id = 139
  AND is_active = 1
  AND (effective_from IS NULL OR effective_from <= CURDATE())
  AND (effective_to IS NULL OR effective_to >= CURDATE())
ORDER BY commission_type, reference_id;
```

## Commission Calculation Logic

### Percentage-based (customer_pays)
```
vendor_payout = customer_pays * (1 - commission_percentage / 100)
platform_commission = customer_pays * (commission_percentage / 100)
```

### Fixed Commission (customer_pays)
```
vendor_payout = customer_pays - fixed_commission
platform_commission = fixed_commission
```

### Hybrid Commission
```
vendor_payout = customer_pays - fixed_commission - (customer_pays * commission_percentage / 100)
platform_commission = fixed_commission + (customer_pays * commission_percentage / 100)
```

### With Min/Max Limits
```javascript
let commission = calculateCommission(customerPays, commissionRate);
if (minCommission && commission < minCommission) {
    commission = minCommission;
}
if (maxCommission && commission > maxCommission) {
    commission = maxCommission;
}
```

## Integration with Existing Tables

The commissions table works alongside existing pricing tables:

1. **tours_package_pricing_tiers**: Can have tier-specific commissions via `reference_id = tier_id`
2. **tours_package_addons**: Can have addon-specific commissions via `reference_id = addon_id`
3. **tours_package_addon_tiers**: Can reference addon commissions

## Migration Notes

When migrating from existing commission fields in pricing tables:
1. Extract `commission_percentage` from `tours_package_pricing_tiers`
2. Create default commission records for each package
3. Create tier-specific commissions where needed
4. Update application code to use the new commissions table

## Best Practices

1. **Always have a default commission**: Every package should have at least one 'default' commission record
2. **Use effective dates**: For commission changes, create new records with dates rather than updating existing ones
3. **Keep history**: Don't delete old commission records; set `is_active = 0` instead
4. **Validate references**: Ensure `reference_id` matches existing tier_id or addon_id when commission_type is 'tier' or 'addon'
5. **Currency consistency**: Ensure commission currency matches pricing currency

