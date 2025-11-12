const { executeQuery } = require('../../../config/database');
const path = require('path');

class ToursBusinessProofService {
    async saveBusinessProof(data) {
        try {
            const { 
                tourBusinessId, 
                userId, 
                businessLegalName, 
                professionalCertificateUrl,
                professionalCertificateName,
                professionalCertificateSize,
                professionalCertificateType
            } = data;

            if (!tourBusinessId) {
                throw new Error('Tour business ID is required');
            }
            if (!userId) {
                throw new Error('User ID is required');
            }
            if (!businessLegalName || !professionalCertificateUrl) {
                throw new Error('Business legal name and professional certificate are required');
            }

            // Check if business proof already exists for this tour business
            const existing = await executeQuery(
                `SELECT business_proof_id FROM tours_business_proof 
                 WHERE tour_business_id = ? AND user_id = ?`,
                [tourBusinessId, userId]
            );

            if (existing.length > 0) {
                // Update existing record
                await executeQuery(
                    `UPDATE tours_business_proof 
                     SET business_legal_name = ?, 
                         professional_certificate_url = ?,
                         professional_certificate_name = ?,
                         professional_certificate_size = ?,
                         professional_certificate_type = ?
                     WHERE tour_business_id = ? AND user_id = ?`,
                    [
                        businessLegalName,
                        professionalCertificateUrl,
                        professionalCertificateName || null,
                        professionalCertificateSize || null,
                        professionalCertificateType || null,
                        tourBusinessId,
                        userId
                    ]
                );
                return {
                    businessProofId: existing[0].business_proof_id,
                    tourBusinessId,
                    userId,
                    updated: true
                };
            } else {
                // Insert new record
                const result = await executeQuery(
                    `INSERT INTO tours_business_proof (
                        tour_business_id, user_id, business_legal_name, 
                        professional_certificate_url,
                        professional_certificate_name,
                        professional_certificate_size,
                        professional_certificate_type
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        tourBusinessId,
                        userId,
                        businessLegalName,
                        professionalCertificateUrl,
                        professionalCertificateName || null,
                        professionalCertificateSize || null,
                        professionalCertificateType || null
                    ]
                );
                return {
                    businessProofId: result.insertId,
                    tourBusinessId,
                    userId,
                    updated: false
                };
            }
        } catch (error) {
            console.error('Error saving business proof:', error);
            throw error;
        }
    }

    async getBusinessProof(tourBusinessId, userId) {
        try {
            const result = await executeQuery(
                `SELECT * FROM tours_business_proof 
                 WHERE tour_business_id = ? AND user_id = ?`,
                [tourBusinessId, userId]
            );
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error getting business proof:', error);
            throw error;
        }
    }
}

module.exports = new ToursBusinessProofService();

