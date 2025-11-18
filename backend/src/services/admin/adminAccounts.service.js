const { executeQuery } = require('../../../config/database');

const getStatusList = (status) => {
    if (!status || status === 'all') return null;
    if (status === 'pending_review') return ['pending_review', 'pending'];
    return [status];
};

const getDefaultPendingStatuses = () => ['pending_review', 'pending'];

class AdminAccountsService {
    /**
     * Get all accounts awaiting approval from all services
     * @param {object} filters - { status, search, page, limit, service_type }
     */
    async getAllPendingAccounts(filters = {}) {
        try {
            const { status = 'pending_review', search = '', page = 1, limit = 10, service_type = 'all' } = filters;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const statusList = getStatusList(status);
            const showAllStatuses = !statusList;

            // Get pending accounts from all services
            const accounts = [];

            // 1. Car Rental Accounts
            if (service_type === 'all' || service_type === 'car_rental') {
                try {
                    let carRentalQuery = `
                        SELECT 
                            crb.car_rental_business_id as account_id,
                            'car_rental' as service_type,
                            crb.business_name as business_name,
                            crb.location,
                            crb.status,
                            COALESCE(crss.submitted_at, crb.created_at) as submitted_at,
                            cu.name as owner_name,
                            cu.email as owner_email,
                            cu.phone as owner_phone,
                            COALESCE(crss.status, crsp.status, crb.status) as submission_status,
                            crsp.current_step
                        FROM car_rental_businesses crb
                        JOIN car_rental_users cu ON crb.user_id = cu.user_id
                        LEFT JOIN car_rental_setup_submissions crss ON crb.car_rental_business_id = crss.car_rental_business_id
                        LEFT JOIN car_rental_setup_progress crsp ON crb.car_rental_business_id = crsp.car_rental_business_id
                        WHERE 1=1
                    `;
                    const carRentalParams = [];

                    if (!showAllStatuses) {
                        const placeholders = statusList.map(() => '?').join(',');
                        carRentalQuery += ` AND COALESCE(crss.status, crsp.status, crb.status) IN (${placeholders})`;
                        carRentalParams.push(...statusList);
                    }

                    if (search) {
                        carRentalQuery += ' AND (crb.business_name LIKE ? OR cu.name LIKE ? OR cu.email LIKE ?)';
                        const searchTerm = `%${search}%`;
                        carRentalParams.push(searchTerm, searchTerm, searchTerm);
                    }

                    carRentalQuery += ' ORDER BY submitted_at DESC';
                    const carRentalAccounts = await executeQuery(carRentalQuery, carRentalParams);
                    accounts.push(...carRentalAccounts.map(acc => ({ ...acc, service_type: 'car_rental' })));
                } catch (err) {
                    console.log('Car rental accounts query skipped:', err.message);
                }
            }

            // 2. Tour Package Accounts
            if (service_type === 'all' || service_type === 'tours') {
                try {
                    let toursQuery = `
                        SELECT 
                            tss.submission_id as account_id,
                            'tours' as service_type,
                            tb.tour_business_name as business_name,
                            tb.location,
                            tss.status as submission_status,
                            tss.submitted_at,
                            tu.name as owner_name,
                            tu.email as owner_email,
                            tu.phone as owner_phone,
                            tb.status
                        FROM tours_setup_submissions tss
                        JOIN tours_businesses tb ON tss.tour_business_id = tb.tour_business_id
                        JOIN tours_users tu ON tss.user_id = tu.user_id
                        WHERE 1=1
                    `;
                    const toursParams = [];

                    if (statusList) {
                        const placeholders = statusList.map(() => '?').join(',');
                        toursQuery += ` AND tss.status IN (${placeholders})`;
                        toursParams.push(...statusList);
                    }

                    if (search) {
                        toursQuery += ' AND (tb.tour_business_name LIKE ? OR tu.name LIKE ? OR tu.email LIKE ?)';
                        const searchTerm = `%${search}%`;
                        toursParams.push(searchTerm, searchTerm, searchTerm);
                    }

                    toursQuery += ' ORDER BY tss.submitted_at DESC';
                    const toursAccounts = await executeQuery(toursQuery, toursParams);
                    accounts.push(...toursAccounts.map(acc => ({ ...acc, service_type: 'tours' })));
                } catch (err) {
                    console.log('Tours accounts query skipped:', err.message);
                }
            }

            // 3. Stays/Properties Accounts
            if (service_type === 'all' || service_type === 'stays') {
                try {
                    let staysQuery = `
                        SELECT 
                            sp.property_id as account_id,
                            'stays' as service_type,
                            sp.property_name as business_name,
                            COALESCE(
                                sp.location,
                                JSON_UNQUOTE(JSON_EXTRACT(sp.location_data, '$.formatted_address'))
                            ) as location,
                            sp.status,
                            sp.created_at as submitted_at,
                            COALESCE(su.name, 'N/A') as owner_name,
                            COALESCE(su.email, 'N/A') as owner_email,
                            COALESCE(su.phone, NULL) as owner_phone,
                            sp.status as submission_status
                        FROM stays_properties sp
                        LEFT JOIN stays_users su ON sp.user_id = su.user_id
                        WHERE 1=1
                    `;
                    const staysParams = [];

                    if (!showAllStatuses) {
                        const placeholders = statusList.map(() => '?').join(',');
                        staysQuery += ` AND sp.status IN (${placeholders})`;
                        staysParams.push(...statusList);
                    }

                    if (search) {
                        staysQuery += ' AND (sp.property_name LIKE ? OR su.name LIKE ? OR su.email LIKE ?)';
                        const searchTerm = `%${search}%`;
                        staysParams.push(searchTerm, searchTerm, searchTerm);
                    }

                    staysQuery += ' ORDER BY sp.created_at DESC';
                    const staysAccounts = await executeQuery(staysQuery, staysParams);
                    accounts.push(...staysAccounts.map(acc => ({ ...acc, service_type: 'stays' })));
                } catch (err) {
                    console.log('Stays accounts query skipped:', err.message);
                }
            }

            // 4. Restaurant Accounts (if they have approval status)
            if (service_type === 'all' || service_type === 'restaurant') {
                // Check if restaurants table has approval status
                try {
                    let restaurantQuery = `
                        SELECT 
                            r.id as account_id,
                            'restaurant' as service_type,
                            r.name as business_name,
                            r.address as location,
                            r.status,
                            r.created_at as submitted_at,
                            ru.name as owner_name,
                            ru.email as owner_email,
                            ru.phone as owner_phone,
                            r.status as submission_status
                        FROM restaurants r
                        LEFT JOIN restaurant_users ru ON CAST(r.user_id AS UNSIGNED) = ru.user_id
                        WHERE 1=1
                    `;
                    const restaurantParams = [];

                    if (!showAllStatuses) {
                        const placeholders = statusList.map(() => '?').join(',');
                        restaurantQuery += ` AND r.status IN (${placeholders})`;
                        restaurantParams.push(...statusList);
                    }

                    if (search) {
                        restaurantQuery += ' AND (r.name LIKE ? OR ru.name LIKE ? OR ru.email LIKE ?)';
                        const searchTerm = `%${search}%`;
                        restaurantParams.push(searchTerm, searchTerm, searchTerm);
                    }

                    restaurantQuery += ' ORDER BY r.created_at DESC';
                    const restaurantAccounts = await executeQuery(restaurantQuery, restaurantParams);
                    accounts.push(...restaurantAccounts.map(acc => ({ ...acc, service_type: 'restaurant' })));
                } catch (err) {
                    // Table might not exist or have different structure
                    console.log('Restaurant accounts query skipped:', err.message);
                    console.error('Restaurant query error details:', err);
                }
            }

            // Sort all accounts by submitted_at (newest first)
            accounts.sort((a, b) => {
                const dateA = new Date(a.submitted_at || a.created_at || 0);
                const dateB = new Date(b.submitted_at || b.created_at || 0);
                return dateB - dateA;
            });

            // Apply pagination
            const total = accounts.length;
            const paginatedAccounts = accounts.slice(offset, offset + parseInt(limit));

            return {
                accounts: paginatedAccounts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            };
        } catch (error) {
            console.error('Error getting pending accounts:', error);
            throw error;
        }
    }

    /**
     * Get account statistics
     */
    async getAccountStats() {
        try {
            const stats = {
                total: 0,
                pending_review: 0,
                approved: 0,
                rejected: 0,
                by_service: {
                    car_rental: 0,
                    tours: 0,
                    stays: 0,
                    restaurant: 0
                }
            };

            const defaultPending = getDefaultPendingStatuses();

            // Count car rental pending accounts
            try {
                const placeholders = defaultPending.map(() => '?').join(',');
                const carRentalPending = await executeQuery(
                    `SELECT COUNT(*) as count 
                     FROM car_rental_businesses crb
                     LEFT JOIN car_rental_setup_submissions crss ON crb.car_rental_business_id = crss.car_rental_business_id
                     LEFT JOIN car_rental_setup_progress crsp ON crb.car_rental_business_id = crsp.car_rental_business_id
                     WHERE COALESCE(crss.status, crsp.status, crb.status) IN (${placeholders})
                     AND crb.status NOT IN ('approved', 'rejected')
                     AND (crsp.status IS NULL OR crsp.status NOT IN ('approved', 'rejected'))`
                    , defaultPending);
                stats.pending_review += carRentalPending[0]?.count || 0;
                stats.by_service.car_rental += carRentalPending[0]?.count || 0;
            } catch (err) {
                console.log('Car rental stats query skipped:', err.message);
            }

            // Count tours pending accounts
            try {
                const placeholders = defaultPending.map(() => '?').join(',');
                const toursPending = await executeQuery(
                    `SELECT COUNT(*) as count FROM tours_setup_submissions WHERE status IN (${placeholders})`
                , defaultPending);
                stats.pending_review += toursPending[0]?.count || 0;
                stats.by_service.tours += toursPending[0]?.count || 0;
            } catch (err) {
                console.log('Tours stats query skipped:', err.message);
            }

            // Count stays pending accounts
            try {
                const placeholders = defaultPending.map(() => '?').join(',');
                const staysPending = await executeQuery(
                    `SELECT COUNT(*) as count FROM stays_properties WHERE status IN (${placeholders})`,
                    defaultPending
                );
                stats.pending_review += staysPending[0]?.count || 0;
                stats.by_service.stays += staysPending[0]?.count || 0;
            } catch (err) {
                console.log('Stays stats query skipped:', err.message);
            }

            // Count restaurant pending accounts
            try {
                const placeholders = defaultPending.map(() => '?').join(',');
                const restaurantPending = await executeQuery(
                    `SELECT COUNT(*) as count FROM restaurants WHERE status IN (${placeholders})`
                , defaultPending);
                stats.pending_review += restaurantPending[0]?.count || 0;
                stats.by_service.restaurant += restaurantPending[0]?.count || 0;
            } catch (err) {
                console.log('Restaurant stats query skipped:', err.message);
            }

            stats.total = stats.pending_review;

            return stats;
        } catch (error) {
            console.error('Error getting account stats:', error);
            throw error;
        }
    }

    /**
     * Approve an account
     * @param {string} serviceType - 'car_rental', 'tours', 'stays', 'restaurant'
     * @param {number} accountId 
     * @param {number} adminId 
     * @param {string} notes 
     */
    async approveAccount(serviceType, accountId, adminId, notes = null) {
        try {
            switch (serviceType) {
                case 'car_rental':
                    // Update car rental setup submissions (if exists)
                    await executeQuery(
                        `UPDATE car_rental_setup_submissions 
                         SET status = 'approved', updated_at = NOW() 
                         WHERE car_rental_business_id = ?`,
                        [accountId]
                    ).catch(() => {
                        // Table might not exist or record might not exist, that's okay
                    });
                    // Update car rental setup progress
                    await executeQuery(
                        `UPDATE car_rental_setup_progress 
                         SET status = 'approved', updated_at = NOW() 
                         WHERE car_rental_business_id = ?`,
                        [accountId]
                    ).catch(() => {
                        // Table might not exist or record might not exist, that's okay
                    });
                    // Update car rental business status
                    await executeQuery(
                        `UPDATE car_rental_businesses 
                         SET status = 'approved', updated_at = NOW() 
                         WHERE car_rental_business_id = ?`,
                        [accountId]
                    );
                    break;

                case 'tours':
                    // Update tours setup submission
                    await executeQuery(
                        `UPDATE tours_setup_submissions 
                         SET status = 'approved', approved_at = NOW(), approved_by = ?, notes = ?
                         WHERE submission_id = ?`,
                        [adminId, notes, accountId]
                    );
                    // Get tour business id
                    const tourSubmission = await executeQuery(
                        `SELECT tour_business_id FROM tours_setup_submissions WHERE submission_id = ?`,
                        [accountId]
                    );
                    if (tourSubmission.length > 0) {
                        await executeQuery(
                            `UPDATE tours_businesses 
                             SET status = 'approved', is_live = 1, updated_at = NOW() 
                             WHERE tour_business_id = ?`,
                            [tourSubmission[0].tour_business_id]
                        );
                    }
                    break;

                case 'stays':
                    // Update stays property
                    await executeQuery(
                        `UPDATE stays_properties 
                         SET status = 'approved', approved_at = NOW(), approved_by = ?
                         WHERE property_id = ?`,
                        [adminId, accountId]
                    );
                    break;

                case 'restaurant':
                    // Update restaurant (id is UUID varchar(36))
                    // Use pool.execute directly to ensure proper UUID handling
                    const { pool } = require('../../../config/database');
                    const [updateResult] = await pool.execute(
                        `UPDATE restaurants 
                         SET status = 'active', updated_at = NOW() 
                         WHERE id = ?`,
                        [String(accountId)]
                    );
                    if (updateResult.affectedRows === 0) {
                        throw new Error(`Restaurant with id ${accountId} not found or already updated`);
                    }
                    break;

                default:
                    throw new Error(`Unknown service type: ${serviceType}`);
            }

            return { success: true, accountId, serviceType };
        } catch (error) {
            console.error('Error approving account:', error);
            throw error;
        }
    }

    /**
     * Reject an account
     * @param {string} serviceType - 'car_rental', 'tours', 'stays', 'restaurant'
     * @param {number} accountId 
     * @param {number} adminId 
     * @param {string} rejectionReason 
     * @param {string} notes 
     */
    async rejectAccount(serviceType, accountId, adminId, rejectionReason = null, notes = null) {
        try {
            switch (serviceType) {
                case 'car_rental':
                    // Update car rental setup submissions (if exists)
                    await executeQuery(
                        `UPDATE car_rental_setup_submissions 
                         SET status = 'rejected', updated_at = NOW() 
                         WHERE car_rental_business_id = ?`,
                        [accountId]
                    ).catch(() => {
                        // Table might not exist or record might not exist, that's okay
                    });
                    // Update car rental setup progress
                    await executeQuery(
                        `UPDATE car_rental_setup_progress 
                         SET status = 'rejected', updated_at = NOW() 
                         WHERE car_rental_business_id = ?`,
                        [accountId]
                    ).catch(() => {
                        // Table might not exist or record might not exist, that's okay
                    });
                    // Update car rental business status
                    await executeQuery(
                        `UPDATE car_rental_businesses 
                         SET status = 'rejected', updated_at = NOW() 
                         WHERE car_rental_business_id = ?`,
                        [accountId]
                    );
                    break;

                case 'tours':
                    // Update tours setup submission
                    await executeQuery(
                        `UPDATE tours_setup_submissions 
                         SET status = 'rejected', rejected_at = NOW(), rejected_by = ?, 
                             rejection_reason = ?, notes = ?
                         WHERE submission_id = ?`,
                        [adminId, rejectionReason, notes, accountId]
                    );
                    // Get tour business id
                    const tourSubmission = await executeQuery(
                        `SELECT tour_business_id FROM tours_setup_submissions WHERE submission_id = ?`,
                        [accountId]
                    );
                    if (tourSubmission.length > 0) {
                        await executeQuery(
                            `UPDATE tours_businesses 
                             SET status = 'rejected', is_live = 0, updated_at = NOW() 
                             WHERE tour_business_id = ?`,
                            [tourSubmission[0].tour_business_id]
                        );
                    }
                    break;

                case 'stays':
                    // Update stays property
                    await executeQuery(
                        `UPDATE stays_properties 
                         SET status = 'rejected', rejected_at = NOW(), rejected_by = ?, 
                             rejection_reason = ?
                         WHERE property_id = ?`,
                        [adminId, rejectionReason, accountId]
                    );
                    break;

                case 'restaurant':
                    // Update restaurant (id is UUID varchar(36))
                    // Use pool.execute directly to ensure proper UUID handling
                    const { pool: poolReject } = require('../../../config/database');
                    const [rejectResult] = await poolReject.execute(
                        `UPDATE restaurants 
                         SET status = 'rejected', updated_at = NOW() 
                         WHERE id = ?`,
                        [String(accountId)]
                    );
                    if (rejectResult.affectedRows === 0) {
                        throw new Error(`Restaurant with id ${accountId} not found or already updated`);
                    }
                    break;

                default:
                    throw new Error(`Unknown service type: ${serviceType}`);
            }

            return { success: true, accountId, serviceType };
        } catch (error) {
            console.error('Error rejecting account:', error);
            throw error;
        }
    }
}

module.exports = new AdminAccountsService();

