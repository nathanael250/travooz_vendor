const { executeQuery } = require('../../../config/database');

class ToursBusinessOwnerInfoService {
    async saveBusinessOwnerInfo(data) {
        try {
            const { tourBusinessId, userId, firstName, lastName, countryOfResidence, email } = data;

            if (!tourBusinessId) {
                throw new Error('Tour business ID is required');
            }
            if (!userId) {
                throw new Error('User ID is required');
            }
            if (!firstName || !lastName || !countryOfResidence || !email) {
                throw new Error('All fields are required: firstName, lastName, countryOfResidence, email');
            }

            // Check if business owner info already exists for this tour business
            const existing = await executeQuery(
                `SELECT owner_info_id FROM tours_business_owner_info 
                 WHERE tour_business_id = ? AND user_id = ?`,
                [tourBusinessId, userId]
            );

            if (existing.length > 0) {
                // Update existing record
                await executeQuery(
                    `UPDATE tours_business_owner_info 
                     SET first_name = ?, last_name = ?, country_of_residence = ?, email = ?
                     WHERE tour_business_id = ? AND user_id = ?`,
                    [firstName, lastName, countryOfResidence, email, tourBusinessId, userId]
                );
                return {
                    ownerInfoId: existing[0].owner_info_id,
                    tourBusinessId,
                    userId,
                    updated: true
                };
            } else {
                // Insert new record
                const result = await executeQuery(
                    `INSERT INTO tours_business_owner_info (
                        tour_business_id, user_id, first_name, last_name, 
                        country_of_residence, email
                    ) VALUES (?, ?, ?, ?, ?, ?)`,
                    [tourBusinessId, userId, firstName, lastName, countryOfResidence, email]
                );
                return {
                    ownerInfoId: result.insertId,
                    tourBusinessId,
                    userId,
                    updated: false
                };
            }
        } catch (error) {
            console.error('Error saving business owner info:', error);
            throw error;
        }
    }

    async getBusinessOwnerInfo(tourBusinessId, userId) {
        try {
            const result = await executeQuery(
                `SELECT * FROM tours_business_owner_info 
                 WHERE tour_business_id = ? AND user_id = ?`,
                [tourBusinessId, userId]
            );
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error getting business owner info:', error);
            throw error;
        }
    }
}

module.exports = new ToursBusinessOwnerInfoService();

