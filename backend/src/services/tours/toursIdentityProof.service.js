const { executeQuery } = require('../../../config/database');
const path = require('path');

class ToursIdentityProofService {
    async saveIdentityProof(data) {
        try {
            const { 
                tourBusinessId, 
                userId, 
                idCountry, 
                idCardPhotoUrl,
                idCardPhotoName,
                idCardPhotoSize,
                idCardPhotoType
            } = data;

            if (!tourBusinessId) {
                throw new Error('Tour business ID is required');
            }
            if (!userId) {
                throw new Error('User ID is required');
            }
            if (!idCountry || !idCardPhotoUrl) {
                throw new Error('ID country and ID card photo are required');
            }

            // Check if identity proof already exists for this tour business
            const existing = await executeQuery(
                `SELECT identity_proof_id FROM tours_identity_proof 
                 WHERE tour_business_id = ? AND user_id = ?`,
                [tourBusinessId, userId]
            );

            if (existing.length > 0) {
                // Update existing record
                await executeQuery(
                    `UPDATE tours_identity_proof 
                     SET id_country = ?, 
                         id_card_photo_url = ?,
                         id_card_photo_name = ?,
                         id_card_photo_size = ?,
                         id_card_photo_type = ?
                     WHERE tour_business_id = ? AND user_id = ?`,
                    [
                        idCountry,
                        idCardPhotoUrl,
                        idCardPhotoName || null,
                        idCardPhotoSize || null,
                        idCardPhotoType || null,
                        tourBusinessId,
                        userId
                    ]
                );
                return {
                    identityProofId: existing[0].identity_proof_id,
                    tourBusinessId,
                    userId,
                    updated: true
                };
            } else {
                // Insert new record
                const result = await executeQuery(
                    `INSERT INTO tours_identity_proof (
                        tour_business_id, user_id, id_country, 
                        id_card_photo_url,
                        id_card_photo_name,
                        id_card_photo_size,
                        id_card_photo_type
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        tourBusinessId,
                        userId,
                        idCountry,
                        idCardPhotoUrl,
                        idCardPhotoName || null,
                        idCardPhotoSize || null,
                        idCardPhotoType || null
                    ]
                );
                return {
                    identityProofId: result.insertId,
                    tourBusinessId,
                    userId,
                    updated: false
                };
            }
        } catch (error) {
            console.error('Error saving identity proof:', error);
            throw error;
        }
    }

    async getIdentityProof(tourBusinessId, userId) {
        try {
            const result = await executeQuery(
                `SELECT * FROM tours_identity_proof 
                 WHERE tour_business_id = ? AND user_id = ?`,
                [tourBusinessId, userId]
            );
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error getting identity proof:', error);
            throw error;
        }
    }
}

module.exports = new ToursIdentityProofService();

