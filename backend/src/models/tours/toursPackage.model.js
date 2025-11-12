const { executeQuery } = require('../../../config/database');

class ToursPackage {
    constructor(data = {}) {
        this.package_id = data.package_id || null;
        this.tour_business_id = data.tour_business_id || null;
        
        // Step 1: Basic Informations
        this.name = data.name || null;
        this.category = data.category || null;
        this.short_description = data.short_description || null;
        this.full_description = data.full_description || null;
        
        // Step 2: Inclusions
        this.whats_included = data.whats_included || null;
        this.whats_not_included = data.whats_not_included || null;
        this.guide_type = data.guide_type || null;
        this.guide_language = data.guide_language || null;
        this.food_included = data.food_included || false;
        this.drinks_included = data.drinks_included || false;
        this.show_dietary_restrictions = data.show_dietary_restrictions || false;
        this.transportation_used = data.transportation_used || false;
        this.travel_to_different_city = data.travel_to_different_city || false;
        
        // Step 3: Extra Information
        this.pet_policy = data.pet_policy || false;
        this.pet_policy_details = data.pet_policy_details || null;
        this.know_before_you_go = data.know_before_you_go || null;
        this.emergency_country_code = data.emergency_country_code || null;
        this.emergency_phone = data.emergency_phone || null;
        this.voucher_information = data.voucher_information || null;
        
        // Step 5: Options
        this.option_reference_code = data.option_reference_code || null;
        this.max_group_size = data.max_group_size || null;
        this.guide_materials = data.guide_materials || false;
        this.is_private_activity = data.is_private_activity || false;
        this.skip_the_line = data.skip_the_line || false;
        this.skip_the_line_type = data.skip_the_line_type || null;
        this.wheelchair_accessible = data.wheelchair_accessible || false;
        this.duration_type = data.duration_type || null;
        this.duration_value = data.duration_value || null;
        this.customer_arrival_type = data.customer_arrival_type || null;
        this.pickup_type = data.pickup_type || null;
        this.pickup_timing = data.pickup_timing || null;
        this.pickup_confirmation = data.pickup_confirmation || null;
        this.pickup_time = data.pickup_time || null;
        this.pickup_description = data.pickup_description || null;
        this.drop_off_type = data.drop_off_type || null;
        this.pickup_transportation = data.pickup_transportation || null;
        this.availability_type = data.availability_type || null;
        this.pricing_type = data.pricing_type || null;
        
        this.status = data.status || 'draft';
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
    }

    async save() {
        try {
            // Helper function to convert undefined to null, but keep empty strings for required fields
            const toNull = (val) => {
                if (val === undefined) return null;
                return val;
            };
            
            // Validate required fields
            if (!this.name || (typeof this.name === 'string' && this.name.trim() === '')) {
                throw new Error('Package name is required');
            }
            if (!this.tour_business_id) {
                throw new Error('Tour business ID is required');
            }
            
            const result = await executeQuery(
                `INSERT INTO tours_packages (
                    tour_business_id, name, category, short_description, full_description,
                    whats_included, whats_not_included, guide_type, guide_language,
                    food_included, drinks_included, show_dietary_restrictions,
                    transportation_used, travel_to_different_city,
                    pet_policy, pet_policy_details, know_before_you_go,
                    emergency_country_code, emergency_phone, voucher_information,
                    option_reference_code, max_group_size, guide_materials,
                    is_private_activity, skip_the_line, skip_the_line_type,
                    wheelchair_accessible, duration_type, duration_value,
                    customer_arrival_type, pickup_type, pickup_timing,
                    pickup_confirmation, pickup_time, pickup_description,
                    drop_off_type, pickup_transportation,
                    availability_type, pricing_type, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    toNull(this.tour_business_id),
                    this.name, // Required field - don't convert to null
                    toNull(this.category),
                    toNull(this.short_description),
                    toNull(this.full_description),
                    toNull(this.whats_included),
                    toNull(this.whats_not_included),
                    toNull(this.guide_type),
                    toNull(this.guide_language),
                    this.food_included ? 1 : 0,
                    this.drinks_included ? 1 : 0,
                    this.show_dietary_restrictions ? 1 : 0,
                    this.transportation_used ? 1 : 0,
                    this.travel_to_different_city ? 1 : 0,
                    this.pet_policy ? 1 : 0,
                    toNull(this.pet_policy_details),
                    toNull(this.know_before_you_go),
                    toNull(this.emergency_country_code),
                    toNull(this.emergency_phone),
                    toNull(this.voucher_information),
                    toNull(this.option_reference_code),
                    toNull(this.max_group_size),
                    this.guide_materials ? 1 : 0,
                    this.is_private_activity ? 1 : 0,
                    this.skip_the_line ? 1 : 0,
                    toNull(this.skip_the_line_type),
                    this.wheelchair_accessible ? 1 : 0,
                    toNull(this.duration_type),
                    toNull(this.duration_value),
                    toNull(this.customer_arrival_type),
                    toNull(this.pickup_type),
                    toNull(this.pickup_timing),
                    toNull(this.pickup_confirmation),
                    toNull(this.pickup_time),
                    toNull(this.pickup_description),
                    toNull(this.drop_off_type),
                    toNull(this.pickup_transportation),
                    toNull(this.availability_type),
                    toNull(this.pricing_type),
                    (this.status && this.status !== '') ? this.status : 'draft'
                ]
            );

            this.package_id = result.insertId;
            return this;
        } catch (error) {
            console.error('Error saving tour package:', error);
            throw error;
        }
    }

    async update() {
        try {
            // Helper function to convert undefined to null
            const toNull = (val) => val === undefined ? null : val;
            
            await executeQuery(
                `UPDATE tours_packages SET
                    name = ?, category = ?, short_description = ?, full_description = ?,
                    whats_included = ?, whats_not_included = ?, guide_type = ?, guide_language = ?,
                    food_included = ?, drinks_included = ?, show_dietary_restrictions = ?,
                    transportation_used = ?, travel_to_different_city = ?,
                    pet_policy = ?, pet_policy_details = ?, know_before_you_go = ?,
                    emergency_country_code = ?, emergency_phone = ?, voucher_information = ?,
                    option_reference_code = ?, max_group_size = ?, guide_materials = ?,
                    is_private_activity = ?, skip_the_line = ?, skip_the_line_type = ?,
                    wheelchair_accessible = ?, duration_type = ?, duration_value = ?,
                    customer_arrival_type = ?, pickup_type = ?, pickup_timing = ?,
                    pickup_confirmation = ?, pickup_time = ?, pickup_description = ?,
                    drop_off_type = ?, pickup_transportation = ?,
                    availability_type = ?, pricing_type = ?, status = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE package_id = ?`,
                [
                    toNull(this.name),
                    toNull(this.category),
                    toNull(this.short_description),
                    toNull(this.full_description),
                    toNull(this.whats_included),
                    toNull(this.whats_not_included),
                    toNull(this.guide_type),
                    toNull(this.guide_language),
                    this.food_included ? 1 : 0,
                    this.drinks_included ? 1 : 0,
                    this.show_dietary_restrictions ? 1 : 0,
                    this.transportation_used ? 1 : 0,
                    this.travel_to_different_city ? 1 : 0,
                    this.pet_policy ? 1 : 0,
                    toNull(this.pet_policy_details),
                    toNull(this.know_before_you_go),
                    toNull(this.emergency_country_code),
                    toNull(this.emergency_phone),
                    toNull(this.voucher_information),
                    toNull(this.option_reference_code),
                    toNull(this.max_group_size),
                    this.guide_materials ? 1 : 0,
                    this.is_private_activity ? 1 : 0,
                    this.skip_the_line ? 1 : 0,
                    toNull(this.skip_the_line_type),
                    this.wheelchair_accessible ? 1 : 0,
                    toNull(this.duration_type),
                    toNull(this.duration_value),
                    toNull(this.customer_arrival_type),
                    toNull(this.pickup_type),
                    toNull(this.pickup_timing),
                    toNull(this.pickup_confirmation),
                    toNull(this.pickup_time),
                    toNull(this.pickup_description),
                    toNull(this.drop_off_type),
                    toNull(this.pickup_transportation),
                    toNull(this.availability_type),
                    toNull(this.pricing_type),
                    (this.status && this.status !== '') ? this.status : 'draft',
                    this.package_id
                ]
            );

            return this;
        } catch (error) {
            console.error('Error updating tour package:', error);
            throw error;
        }
    }

    static async findById(packageId) {
        try {
            const results = await executeQuery(
                `SELECT * FROM tours_packages WHERE package_id = ?`,
                [packageId]
            );

            if (results.length === 0) {
                return null;
            }

            const data = results[0];
            // Convert TINYINT(1) to boolean
            const booleanFields = [
                'food_included', 'drinks_included', 'show_dietary_restrictions',
                'transportation_used', 'travel_to_different_city', 'pet_policy',
                'guide_materials', 'is_private_activity', 'skip_the_line',
                'wheelchair_accessible'
            ];
            booleanFields.forEach(field => {
                if (data[field] !== null) {
                    data[field] = Boolean(data[field]);
                }
            });

            return new ToursPackage(data);
        } catch (error) {
            console.error('Error finding tour package by ID:', error);
            throw error;
        }
    }

    static async findByBusinessId(tourBusinessId) {
        try {
            const results = await executeQuery(
                `SELECT * FROM tours_packages WHERE tour_business_id = ? ORDER BY created_at DESC`,
                [tourBusinessId]
            );

            // Get pricing information for each package
            const packagesWithPricing = await Promise.all(results.map(async (row) => {
                // Get minimum price from pricing tiers
                const pricingInfo = await executeQuery(
                    `SELECT MIN(customer_pays) as min_price, MAX(customer_pays) as max_price, currency
                     FROM tours_package_pricing_tiers tpt
                     INNER JOIN tours_package_schedules tps ON tpt.schedule_id = tps.schedule_id
                     WHERE tps.package_id = ?
                     GROUP BY currency
                     ORDER BY min_price ASC
                     LIMIT 1`,
                    [row.package_id]
                );

                const priceInfo = pricingInfo.length > 0 ? pricingInfo[0] : null;
                
                return {
                    ...row,
                    price: priceInfo ? parseFloat(priceInfo.min_price) : null,
                    min_price: priceInfo ? parseFloat(priceInfo.min_price) : null,
                    max_price: priceInfo ? parseFloat(priceInfo.max_price) : null,
                    currency: priceInfo ? priceInfo.currency : 'RWF'
                };
            }));

            return packagesWithPricing.map(row => {
                const booleanFields = [
                    'food_included', 'drinks_included', 'show_dietary_restrictions',
                    'transportation_used', 'travel_to_different_city', 'pet_policy',
                    'guide_materials', 'is_private_activity', 'skip_the_line',
                    'wheelchair_accessible'
                ];
                booleanFields.forEach(field => {
                    if (row[field] !== null) {
                        row[field] = Boolean(row[field]);
                    }
                });
                const packageInstance = new ToursPackage(row);
                // Preserve pricing fields
                packageInstance.price = row.price;
                packageInstance.min_price = row.min_price;
                packageInstance.max_price = row.max_price;
                packageInstance.currency = row.currency;
                return packageInstance;
            });
        } catch (error) {
            console.error('Error finding tour packages by business ID:', error);
            throw error;
        }
    }
}

module.exports = ToursPackage;

