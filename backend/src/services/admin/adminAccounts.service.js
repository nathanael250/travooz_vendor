const { executeQuery } = require('../../../config/database');
const ToursApprovalNotificationService = require('../tours/toursApprovalNotification.service');
const RestaurantApprovalNotificationService = require('../restaurant/restaurantApprovalNotification.service');
const CarRentalApprovalNotificationService = require('../carRental/carRentalApprovalNotification.service');

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
                         SET status = 'approved', approved_at = NOW(), approved_by = ?, notes = ?, updated_at = NOW() 
                         WHERE car_rental_business_id = ?`,
                        [adminId, notes, accountId]
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
                    
                    // Fetch car rental business and owner info for notification
                    const carRentalApprove = await executeQuery(
                        `SELECT 
                            crb.car_rental_business_id,
                            crb.business_name,
                            cu.email,
                            cu.name
                         FROM car_rental_businesses crb
                         JOIN car_rental_users cu ON crb.user_id = cu.user_id
                         WHERE crb.car_rental_business_id = ?`,
                        [accountId]
                    );
                    
                    if (carRentalApprove.length > 0) {
                        const { business_name, email, name } = carRentalApprove[0];
                        const dashboardUrl = process.env.CAR_RENTAL_VENDOR_DASHBOARD_URL || 'https://vendor.travooz.rw/car-rental/dashboard';
                        await CarRentalApprovalNotificationService.sendApprovalEmail({
                            email,
                            name,
                            businessName: business_name,
                            dashboardUrl
                        });
                    }
                    break;

                case 'tours':
                    // Update tours setup submission
                    await executeQuery(
                        `UPDATE tours_setup_submissions 
                         SET status = 'approved', approved_at = NOW(), approved_by = ?, notes = ?
                         WHERE submission_id = ?`,
                        [adminId, notes, accountId]
                    );
                    // Get tour business id and vendor info for email notification
                    const tourSubmission = await executeQuery(
                        `SELECT 
                            tss.tour_business_id,
                            tb.tour_business_name,
                            tu.email,
                            tu.name
                         FROM tours_setup_submissions tss
                         JOIN tours_businesses tb ON tss.tour_business_id = tb.tour_business_id
                         JOIN tours_users tu ON tss.user_id = tu.user_id
                         WHERE tss.submission_id = ?`,
                        [accountId]
                    );
                    if (tourSubmission.length > 0) {
                        const { tour_business_id: tourBusinessId, tour_business_name, email, name } = tourSubmission[0];
                        await executeQuery(
                            `UPDATE tours_businesses 
                             SET status = 'approved', is_live = 1, updated_at = NOW() 
                             WHERE tour_business_id = ?`,
                            [tourBusinessId]
                        );

                        const dashboardUrl = process.env.TOUR_VENDOR_DASHBOARD_URL || 'https://vendor.travoozapp.com/tours/dashboard';
                        await ToursApprovalNotificationService.sendApprovalEmail({
                            email,
                            name,
                            businessName: tour_business_name,
                            dashboardUrl
                        });
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
                    
                    // Fetch property and owner info for notification
                    const staysProperty = await executeQuery(
                        `SELECT 
                            sp.property_id,
                            sp.property_name,
                            su.email,
                            su.name
                         FROM stays_properties sp
                         LEFT JOIN stays_users su ON sp.user_id = su.user_id
                         WHERE sp.property_id = ?`,
                        [accountId]
                    );
                    
                    if (staysProperty.length > 0) {
                        const { property_name, email, name } = staysProperty[0];
                        // Send approval email (non-blocking - don't fail approval if email fails)
                        try {
                            const StaysApprovalNotificationService = require('../stays/staysApprovalNotification.service');
                            const dashboardUrl = process.env.STAYS_VENDOR_DASHBOARD_URL || 'https://vendor.travooz.rw/stays/dashboard';
                            await StaysApprovalNotificationService.sendApprovalEmail({
                                email,
                                name,
                                propertyName: property_name,
                                dashboardUrl
                            });
                            console.log('✅ Approval email sent successfully');
                        } catch (emailError) {
                            // Log error but don't fail the approval
                            console.error('⚠️  Failed to send approval email (approval still succeeded):', emailError.message);
                        }
                    }
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
                    
                    // Fetch restaurant and owner info for notification
                    const [restaurantApprove] = await pool.execute(
                        `SELECT 
                            r.id,
                            r.name as business_name,
                            ru.email,
                            ru.name
                         FROM restaurants r
                         LEFT JOIN restaurant_users ru ON r.user_id = ru.user_id
                         WHERE r.id = ?`,
                        [String(accountId)]
                    );
                    
                    if (restaurantApprove.length > 0) {
                        const { business_name, email, name } = restaurantApprove[0];
                        const dashboardUrl = process.env.RESTAURANT_VENDOR_DASHBOARD_URL || 'https://vendor.travooz.rw/restaurant/dashboard';
                        await RestaurantApprovalNotificationService.sendApprovalEmail({
                            email,
                            name,
                            businessName: business_name,
                            dashboardUrl
                        });
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
    async rejectAccount(serviceType, accountId, adminId, rejectionReason = null, notes = null, returnToStep = null) {
        try {
            switch (serviceType) {
                case 'car_rental':
                    // Update car rental setup submissions (if exists)
                    await executeQuery(
                        `UPDATE car_rental_setup_submissions 
                         SET status = 'rejected', rejection_reason = ?, notes = ?, updated_at = NOW() 
                         WHERE car_rental_business_id = ?`,
                        [rejectionReason, notes, accountId]
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
                    
                    // Fetch car rental business and owner info for notification
                    const carRentalReject = await executeQuery(
                        `SELECT 
                            crb.car_rental_business_id,
                            crb.business_name,
                            cu.email,
                            cu.name
                         FROM car_rental_businesses crb
                         JOIN car_rental_users cu ON crb.user_id = cu.user_id
                         WHERE crb.car_rental_business_id = ?`,
                        [accountId]
                    );
                    
                    if (carRentalReject.length > 0) {
                        const { business_name, email, name } = carRentalReject[0];
                        const dashboardUrl = process.env.CAR_RENTAL_VENDOR_DASHBOARD_URL || 'https://vendor.travooz.rw/car-rental/dashboard';
                        await CarRentalApprovalNotificationService.sendRejectionEmail({
                            email,
                            name,
                            businessName: business_name,
                            reason: rejectionReason || 'Your car rental submission requires updates.',
                            notes: notes || '',
                            dashboardUrl
                        });
                    }
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
                    // Get tour business id and owner info
                    const tourSubmissionReject = await executeQuery(
                        `SELECT 
                            tss.tour_business_id,
                            tb.tour_business_name,
                            tu.email,
                            tu.name
                         FROM tours_setup_submissions tss
                         JOIN tours_businesses tb ON tss.tour_business_id = tb.tour_business_id
                         JOIN tours_users tu ON tss.user_id = tu.user_id
                         WHERE tss.submission_id = ?`,
                        [accountId]
                    );
                    if (tourSubmissionReject.length > 0) {
                        const { tour_business_id: tourBusinessId, tour_business_name, email, name } = tourSubmissionReject[0];
                        await executeQuery(
                            `UPDATE tours_businesses 
                             SET status = 'rejected', is_live = 0, updated_at = NOW() 
                             WHERE tour_business_id = ?`,
                            [tourBusinessId]
                        );

                        const rewindStep = returnToStep ? parseInt(returnToStep, 10) : null;
                        if (rewindStep && rewindStep >= 1 && rewindStep <= 6) {
                            const columnsToReset = [];
                            for (let step = rewindStep; step <= 6; step++) {
                                columnsToReset.push(`step_${step}_complete = 0`);
                            }
                            const setClause = [
                                ...columnsToReset,
                                'current_step = ?',
                                'updated_at = NOW()',
                                'last_updated_step = ?'
                            ].join(', ');
                            const params = [
                                ...new Array(columnsToReset.length).fill(0),
                                rewindStep,
                                rewindStep,
                                tourBusinessId
                            ];
                            await executeQuery(
                                `UPDATE tours_setup_progress 
                                 SET ${setClause} 
                                 WHERE tour_business_id = ?`,
                                params
                            );
                        }

                        // Notify vendor about rejection/required changes
                        const normalizedStep = rewindStep;

                        let stepUrl = null;
                        if (normalizedStep && normalizedStep >= 2 && normalizedStep <= 6) {
                            const stepRoutes = {
                                2: '/tours/list-your-tour/step-2',
                                3: '/tours/list-your-tour/step-3',
                                4: '/tours/setup/prove-identity',
                                5: '/tours/setup/prove-business',
                                6: '/tours/setup/review'
                            };
                            const frontendBase =
                                process.env.TOUR_VENDOR_FRONTEND_URL ||
                                process.env.TOUR_VENDOR_DASHBOARD_URL ||
                                process.env.VENDOR_PORTAL_URL ||
                                process.env.FRONTEND_URL ||
                                'http://localhost:8080';
                            const route = stepRoutes[normalizedStep] || '/tours/setup/complete';
                            stepUrl = `${frontendBase}${route}`;
                        }

                        await ToursApprovalNotificationService.sendRejectionEmail({
                            email,
                            name,
                            businessName: tour_business_name,
                            reason: rejectionReason,
                            notes,
                            targetStep: normalizedStep,
                            stepUrl
                        });
                    }
                    break;

                case 'stays':
                    // Update stays property (stays_properties doesn't have rejected_at/rejected_by/rejection_reason columns)
                    await executeQuery(
                        `UPDATE stays_properties 
                         SET status = 'rejected'
                         WHERE property_id = ?`,
                        [accountId]
                    );
                    
                    // Log rejection reason in console for now (can add to a rejection_notes table if needed)
                    console.log(`Property ${accountId} rejected by admin ${adminId}. Reason: ${rejectionReason}`);
                    
                    // Fetch property and owner info for notification
                    const staysPropertyReject = await executeQuery(
                        `SELECT 
                            sp.property_id,
                            sp.property_name,
                            su.email,
                            su.name
                         FROM stays_properties sp
                         LEFT JOIN stays_users su ON sp.user_id = su.user_id
                         WHERE sp.property_id = ?`,
                        [accountId]
                    );
                    
                    if (staysPropertyReject.length > 0) {
                        const { property_name, email, name } = staysPropertyReject[0];
                        // Send rejection email (non-blocking - don't fail rejection if email fails)
                        try {
                            const StaysApprovalNotificationService = require('../stays/staysApprovalNotification.service');
                            const dashboardUrl = process.env.STAYS_VENDOR_DASHBOARD_URL || 'https://vendor.travooz.rw/stays/dashboard';
                            await StaysApprovalNotificationService.sendRejectionEmail({
                                email,
                                name,
                                propertyName: property_name,
                                reason: rejectionReason || 'Your property submission requires updates.',
                                notes: notes || '',
                                dashboardUrl
                            });
                            console.log('✅ Rejection email sent successfully');
                        } catch (emailError) {
                            // Log error but don't fail the rejection
                            console.error('⚠️  Failed to send rejection email (rejection still succeeded):', emailError.message);
                        }
                    }
                    break;

                case 'restaurant':
                    // Update restaurant (id is UUID varchar(36))
                    // Use pool.execute directly to ensure proper UUID handling
                    const { pool: poolReject } = require('../../../config/database');
                    const [rejectResult] = await poolReject.execute(
                        `UPDATE restaurants 
                         SET status = 'rejected', rejection_reason = ?, updated_at = NOW() 
                         WHERE id = ?`,
                        [rejectionReason, String(accountId)]
                    );
                    if (rejectResult.affectedRows === 0) {
                        throw new Error(`Restaurant with id ${accountId} not found or already updated`);
                    }
                    
                    // Fetch restaurant and owner info for notification
                    const [restaurantReject] = await poolReject.execute(
                        `SELECT 
                            r.id,
                            r.name as business_name,
                            ru.email,
                            ru.name
                         FROM restaurants r
                         LEFT JOIN restaurant_users ru ON r.user_id = ru.user_id
                         WHERE r.id = ?`,
                        [String(accountId)]
                    );
                    
                    if (restaurantReject.length > 0) {
                        const { business_name, email, name } = restaurantReject[0];
                        const dashboardUrl = process.env.RESTAURANT_VENDOR_DASHBOARD_URL || 'https://vendor.travooz.rw/restaurant/dashboard';
                        await RestaurantApprovalNotificationService.sendRejectionEmail({
                            email,
                            name,
                            businessName: business_name,
                            reason: rejectionReason || 'Your restaurant submission requires updates.',
                            notes: notes || '',
                            dashboardUrl
                        });
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

    /**
     * Get detailed account information for a specific service
     * @param {string} serviceType
     * @param {number|string} accountId
     */
    async getAccountDetails(serviceType, accountId) {
        switch (serviceType) {
            case 'tours':
                return this.getTourAccountDetails(accountId);
            default:
                const error = new Error(`Detailed view is not available yet for ${serviceType} accounts.`);
                error.statusCode = 400;
                throw error;
        }
    }

    async getTourAccountDetails(submissionId) {
        const rows = await executeQuery(
            `SELECT 
                tss.submission_id,
                tss.status AS submission_status,
                tss.submitted_at,
                tss.notes AS submission_notes,
                tss.rejection_reason,
                tb.tour_business_id,
                tb.tour_business_name,
                tb.description AS business_description,
                tb.location,
                tb.location_data,
                tb.tour_type,
                tb.tour_type_name,
                tb.tour_type_ids,
                tb.tour_type_names,
                tb.currency,
                tb.phone AS business_phone,
                tb.country_code,
                tb.status AS business_status,
                tu.user_id,
                tu.name AS user_name,
                tu.email AS user_email,
                tu.phone AS user_phone,
                tu.password_hash,
                boi.first_name AS owner_first_name,
                boi.last_name AS owner_last_name,
                boi.email AS owner_email,
                boi.country_of_residence AS owner_country,
                tip.id_country,
                tip.id_card_photo_url,
                tip.id_card_photo_name,
                tip.id_card_photo_size,
                tip.id_card_photo_type,
                tbp.business_legal_name,
                tbp.professional_certificate_url,
                tbp.professional_certificate_name,
                tbp.professional_certificate_size,
                tbp.professional_certificate_type,
                tsp.current_step
            FROM tours_setup_submissions tss
            JOIN tours_businesses tb ON tss.tour_business_id = tb.tour_business_id
            JOIN tours_users tu ON tss.user_id = tu.user_id
            LEFT JOIN tours_business_owner_info boi 
                ON boi.tour_business_id = tb.tour_business_id AND boi.user_id = tu.user_id
            LEFT JOIN tours_identity_proof tip 
                ON tip.tour_business_id = tb.tour_business_id AND tip.user_id = tu.user_id
            LEFT JOIN tours_business_proof tbp 
                ON tbp.tour_business_id = tb.tour_business_id AND tbp.user_id = tu.user_id
            LEFT JOIN tours_setup_progress tsp 
                ON tsp.tour_business_id = tb.tour_business_id AND tsp.user_id = tu.user_id
            WHERE tss.submission_id = ?
            LIMIT 1`,
            [submissionId]
        );

        if (!rows.length) {
            const error = new Error('Tour submission not found');
            error.statusCode = 404;
            throw error;
        }

        const row = rows[0];
        const parseJSON = (value) => {
            if (!value) return null;
            try {
                return typeof value === 'string' ? JSON.parse(value) : value;
            } catch (error) {
                return null;
            }
        };

        return {
            serviceType: 'tours',
            submission: {
                id: row.submission_id,
                status: row.submission_status,
                submittedAt: row.submitted_at,
                notes: row.submission_notes,
                rejectionReason: row.rejection_reason
            },
            business: {
                id: row.tour_business_id,
                name: row.tour_business_name,
                description: row.business_description,
                location: row.location,
                locationData: parseJSON(row.location_data),
                tourType: row.tour_type,
                tourTypeName: row.tour_type_name,
                tourTypeIds: parseJSON(row.tour_type_ids),
                tourTypeNames: parseJSON(row.tour_type_names),
                currency: row.currency,
                phone: row.business_phone,
                countryCode: row.country_code,
                status: row.business_status
            },
            account: {
                userId: row.user_id,
                name: row.user_name,
                email: row.user_email,
                phone: row.user_phone,
                passwordHash: row.password_hash
            },
            owner: {
                firstName: row.owner_first_name,
                lastName: row.owner_last_name,
                email: row.owner_email,
                countryOfResidence: row.owner_country
            },
            documents: {
                identity: row.id_card_photo_url
                    ? {
                        country: row.id_country,
                        url: row.id_card_photo_url,
                        fileName: row.id_card_photo_name,
                        fileSize: row.id_card_photo_size,
                        fileType: row.id_card_photo_type
                      }
                    : null,
                business: row.professional_certificate_url
                    ? {
                        legalName: row.business_legal_name,
                        url: row.professional_certificate_url,
                        fileName: row.professional_certificate_name,
                        fileSize: row.professional_certificate_size,
                        fileType: row.professional_certificate_type
                      }
                    : null
            },
            progress: {
                currentStep: row.current_step
            }
        };
    }

    /**
     * Delete an account and all associated data
     * @param {string} serviceType - 'car_rental', 'tours', 'stays', 'restaurant'
     * @param {number|string} accountId 
     */
    async deleteAccount(serviceType, accountId) {
        try {
            switch (serviceType) {
                case 'car_rental':
                    // Get user_id before deletion for cleanup
                    const carRentalBusiness = await executeQuery(
                        `SELECT user_id, business_name FROM car_rental_businesses WHERE car_rental_business_id = ?`,
                        [accountId]
                    );
                    
                    if (carRentalBusiness.length === 0) {
                        throw new Error('Car rental business not found');
                    }
                    
                    const carRentalUserId = carRentalBusiness[0].user_id;
                    
                    // Delete all related data (with error handling for tables that might not exist)
                    await executeQuery(`DELETE FROM car_rental_setup_submissions WHERE car_rental_business_id = ?`, [accountId]).catch(() => {});
                    await executeQuery(`DELETE FROM car_rental_setup_progress WHERE car_rental_business_id = ?`, [accountId]).catch(() => {});
                    await executeQuery(`DELETE FROM car_rental_vehicles WHERE car_rental_business_id = ?`, [accountId]).catch(() => {});
                    await executeQuery(`DELETE FROM car_rental_businesses WHERE car_rental_business_id = ?`, [accountId]);
                    await executeQuery(`DELETE FROM car_rental_users WHERE user_id = ?`, [carRentalUserId]);
                    break;

                case 'tours':
                    // Get tour_business_id and user_id from submission
                    const tourSubmission = await executeQuery(
                        `SELECT tss.tour_business_id, tss.user_id, tb.tour_business_name
                         FROM tours_setup_submissions tss
                         JOIN tours_businesses tb ON tss.tour_business_id = tb.tour_business_id
                         WHERE tss.submission_id = ?`,
                        [accountId]
                    );
                    
                    if (tourSubmission.length === 0) {
                        throw new Error('Tour submission not found');
                    }
                    
                    const tourBusinessId = tourSubmission[0].tour_business_id;
                    const tourUserId = tourSubmission[0].user_id;
                    
                    // Delete all related data (with error handling for tables that might not exist)
                    await executeQuery(`DELETE FROM tours_setup_submissions WHERE tour_business_id = ?`, [tourBusinessId]).catch(() => {});
                    await executeQuery(`DELETE FROM tours_setup_progress WHERE tour_business_id = ?`, [tourBusinessId]).catch(() => {});
                    await executeQuery(`DELETE FROM tours_business_owner_info WHERE tour_business_id = ?`, [tourBusinessId]).catch(() => {});
                    await executeQuery(`DELETE FROM tours_identity_proof WHERE tour_business_id = ?`, [tourBusinessId]).catch(() => {});
                    await executeQuery(`DELETE FROM tours_business_proof WHERE tour_business_id = ?`, [tourBusinessId]).catch(() => {});
                    
                    // Try to delete from tour_packages if table exists
                    await executeQuery(`DELETE FROM tour_packages WHERE tour_business_id = ?`, [tourBusinessId]).catch(() => {
                        console.log('tour_packages table does not exist or no records found');
                    });
                    
                    // Try to delete from tours_packages (alternative table name) if it exists
                    await executeQuery(`DELETE FROM tours_packages WHERE tour_business_id = ?`, [tourBusinessId]).catch(() => {
                        console.log('tours_packages table does not exist or no records found');
                    });
                    
                    await executeQuery(`DELETE FROM tours_businesses WHERE tour_business_id = ?`, [tourBusinessId]);
                    await executeQuery(`DELETE FROM tours_users WHERE user_id = ?`, [tourUserId]);
                    break;

                case 'stays':
                    // Get user_id before deletion
                    const staysProperty = await executeQuery(
                        `SELECT user_id, property_name FROM stays_properties WHERE property_id = ?`,
                        [accountId]
                    );
                    
                    if (staysProperty.length === 0) {
                        throw new Error('Property not found');
                    }
                    
                    const staysUserId = staysProperty[0].user_id;
                    
                    // Delete all related data (with error handling for tables that might not exist)
                    await executeQuery(`DELETE FROM stays_rooms WHERE property_id = ?`, [accountId]).catch(() => {});
                    await executeQuery(`DELETE FROM stays_property_images WHERE property_id = ?`, [accountId]).catch(() => {});
                    await executeQuery(`DELETE FROM stays_amenities WHERE property_id = ?`, [accountId]).catch(() => {});
                    await executeQuery(`DELETE FROM stays_policies WHERE property_id = ?`, [accountId]).catch(() => {});
                    await executeQuery(`DELETE FROM stays_properties WHERE property_id = ?`, [accountId]);
                    await executeQuery(`DELETE FROM stays_users WHERE user_id = ?`, [staysUserId]);
                    break;

                case 'restaurant':
                    // Get user_id before deletion
                    const { pool } = require('../../../config/database');
                    const [restaurant] = await pool.execute(
                        `SELECT user_id, name FROM restaurants WHERE id = ?`,
                        [String(accountId)]
                    );
                    
                    if (restaurant.length === 0) {
                        throw new Error('Restaurant not found');
                    }
                    
                    const restaurantUserId = restaurant[0].user_id;
                    
                    console.log(`🗑️  Deleting restaurant ${accountId} and all associated data...`);
                    
                    // Delete in correct order to respect foreign key constraints
                    // 1. First, get all menu items for this restaurant
                    const [menuItems] = await pool.execute(
                        `SELECT id FROM menu_items WHERE restaurant_id = ?`,
                        [String(accountId)]
                    ).catch(() => [[]]);
                    
                    // 2. Delete order items that reference these menu items (child records first)
                    if (menuItems && menuItems.length > 0) {
                        const menuItemIds = menuItems.map(item => item.id);
                        const placeholders = menuItemIds.map(() => '?').join(',');
                        await pool.execute(
                            `DELETE FROM restaurant_order_items WHERE menu_item_id IN (${placeholders})`,
                            menuItemIds
                        ).catch(() => {});
                    }
                    
                    // 3. Delete orders for this restaurant
                    await pool.execute(`DELETE FROM orders WHERE restaurant_id = ?`, [String(accountId)]).catch(() => {});
                    await pool.execute(`DELETE FROM restaurant_orders WHERE restaurant_id = ?`, [String(accountId)]).catch(() => {});
                    
                    // 4. Delete table bookings
                    await pool.execute(`DELETE FROM table_bookings WHERE restaurant_id = ?`, [String(accountId)]).catch(() => {});
                    await pool.execute(`DELETE FROM restaurant_table_bookings WHERE restaurant_id = ?`, [String(accountId)]).catch(() => {});
                    
                    // 5. Now safe to delete menu items (no order items referencing them)
                    await pool.execute(`DELETE FROM menu_items WHERE restaurant_id = ?`, [String(accountId)]).catch(() => {});
                    
                    // 6. Delete other related data
                    await pool.execute(`DELETE FROM restaurant_tables WHERE restaurant_id = ?`, [String(accountId)]).catch(() => {});
                    await pool.execute(`DELETE FROM restaurant_menus WHERE restaurant_id = ?`, [String(accountId)]).catch(() => {});
                    await pool.execute(`DELETE FROM restaurant_images WHERE restaurant_id = ?`, [String(accountId)]).catch(() => {});
                    
                    // 7. Delete the restaurant itself
                    await pool.execute(`DELETE FROM restaurants WHERE id = ?`, [String(accountId)]);
                    
                    // 8. Finally, delete the user account
                    await pool.execute(`DELETE FROM restaurant_users WHERE user_id = ?`, [restaurantUserId]);
                    
                    console.log(`✅ Restaurant ${accountId} and all associated data deleted successfully`);
                    break;

                default:
                    throw new Error(`Unknown service type: ${serviceType}`);
            }

            return { success: true, accountId, serviceType, message: 'Account and all associated data deleted successfully' };
        } catch (error) {
            console.error('Error deleting account:', error);
            throw error;
        }
    }
}

module.exports = new AdminAccountsService();

