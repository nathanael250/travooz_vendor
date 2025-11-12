const { executeQuery } = require('../../../config/database');

class ToursCommissionService {
    /**
     * Get the currently active commission for all tour bookings
     * @returns {Promise<Object|null>} Active commission record or null
     */
    async getActiveCommission() {
        try {
            const results = await executeQuery(
                `SELECT 
                    commission_id,
                    commission_percentage,
                    fixed_commission,
                    commission_structure,
                    min_commission_per_booking,
                    max_commission_per_booking,
                    currency,
                    calculation_method,
                    effective_from,
                    effective_to,
                    is_active,
                    description
                FROM tours_global_commission
                WHERE is_active = 1
                  AND (effective_from IS NULL OR effective_from <= CURDATE())
                  AND (effective_to IS NULL OR effective_to >= CURDATE())
                ORDER BY effective_from DESC
                LIMIT 1`
            );

            return results.length > 0 ? results[0] : null;
        } catch (error) {
            console.error('Error getting active commission:', error);
            throw error;
        }
    }

    /**
     * Calculate commission amount for a booking
     * @param {number} bookingAmount - Total booking amount
     * @param {Object} commission - Commission record (optional, will fetch if not provided)
     * @returns {Promise<Object>} Commission calculation result
     */
    async calculateCommission(bookingAmount, commission = null) {
        try {
            if (!commission) {
                commission = await this.getActiveCommission();
            }

            if (!commission) {
                throw new Error('No active commission found');
            }

            let commissionAmount = 0;

            // Calculate based on commission structure
            if (commission.commission_structure === 'percentage') {
                commissionAmount = bookingAmount * (commission.commission_percentage / 100);
            } else if (commission.commission_structure === 'fixed') {
                commissionAmount = commission.fixed_commission || 0;
            } else if (commission.commission_structure === 'hybrid') {
                const fixed = commission.fixed_commission || 0;
                const percentage = bookingAmount * (commission.commission_percentage / 100);
                commissionAmount = fixed + percentage;
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

            return {
                bookingAmount,
                commissionAmount: parseFloat(commissionAmount.toFixed(2)),
                vendorPayout: parseFloat(vendorPayout.toFixed(2)),
                commissionPercentage: commission.commission_percentage,
                commissionStructure: commission.commission_structure,
                currency: commission.currency || 'RWF'
            };
        } catch (error) {
            console.error('Error calculating commission:', error);
            throw error;
        }
    }

    /**
     * Update commission rate (deactivates old, creates new)
     * @param {Object} commissionData - New commission data
     * @param {number} adminUserId - Admin user ID making the change
     * @returns {Promise<Object>} New commission record
     */
    async updateCommission(commissionData, adminUserId = null) {
        try {
            // Deactivate current commission
            await executeQuery(
                `UPDATE tours_global_commission 
                SET is_active = 0, effective_to = CURDATE()
                WHERE is_active = 1`
            );

            // Create new commission
            const result = await executeQuery(
                `INSERT INTO tours_global_commission (
                    commission_percentage,
                    fixed_commission,
                    commission_structure,
                    min_commission_per_booking,
                    max_commission_per_booking,
                    currency,
                    calculation_method,
                    effective_from,
                    is_active,
                    description,
                    notes,
                    created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    commissionData.commission_percentage || 0,
                    commissionData.fixed_commission || null,
                    commissionData.commission_structure || 'percentage',
                    commissionData.min_commission_per_booking || null,
                    commissionData.max_commission_per_booking || null,
                    commissionData.currency || 'RWF',
                    commissionData.calculation_method || 'customer_pays',
                    commissionData.effective_from || new Date().toISOString().split('T')[0],
                    1, // is_active
                    commissionData.description || null,
                    commissionData.notes || null,
                    adminUserId
                ]
            );

            return await this.getActiveCommission();
        } catch (error) {
            console.error('Error updating commission:', error);
            throw error;
        }
    }

    /**
     * Get commission history
     * @returns {Promise<Array>} All commission records
     */
    async getCommissionHistory() {
        try {
            const results = await executeQuery(
                `SELECT 
                    commission_id,
                    commission_percentage,
                    fixed_commission,
                    commission_structure,
                    effective_from,
                    effective_to,
                    is_active,
                    description,
                    created_at,
                    updated_at
                FROM tours_global_commission
                ORDER BY effective_from DESC`
            );

            return results;
        } catch (error) {
            console.error('Error getting commission history:', error);
            throw error;
        }
    }
}

module.exports = new ToursCommissionService();

