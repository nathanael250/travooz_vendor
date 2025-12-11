const EmailService = require('../../utils/email.service');

class CarRentalApprovalNotificationService {
    /**
     * Send approval email to vendor once admin verifies car rental listing
     * Mirrors the verification email flow by verifying SMTP connection first
     */
    static async sendApprovalEmail({ email, name, businessName, dashboardUrl }) {
        if (!email) {
            console.warn('⚠️  Approval email skipped: no email provided');
            return;
        }

        try {
            console.log('\n📧 Preparing to send car rental approval email:', {
                email,
                businessName
            });

            const isConnected = await EmailService.verifyConnection();
            if (!isConnected) {
                console.warn('⚠️  SMTP connection verification failed before approval email, attempting send anyway...');
            }

            await EmailService.sendVendorApprovalEmail({
                email,
                name,
                businessName,
                dashboardUrl,
                serviceName: 'Car Rental'
            });

            console.log('✅ Car rental approval email sent successfully');
        } catch (error) {
            console.error('❌ Failed to send car rental approval email:', error.message);
            if (error.response) {
                console.error('SMTP Response:', error.response);
            }
            if (error.responseCode) {
                console.error('SMTP Response Code:', error.responseCode);
            }
            throw error;
        }
    }

    /**
     * Send rejection/changes-required email to vendor
     */
    static async sendRejectionEmail({ email, name, businessName, reason, notes, dashboardUrl }) {
        if (!email) {
            console.warn('⚠️  Rejection email skipped: no email provided');
            return;
        }

        try {
            console.log('\n📧 Preparing to send car rental rejection email:', {
                email,
                businessName,
                reason
            });

            const isConnected = await EmailService.verifyConnection();
            if (!isConnected) {
                console.warn('⚠️  SMTP connection verification failed before rejection email, attempting send anyway...');
            }

            await EmailService.sendVendorRejectionEmail({
                email,
                name,
                businessName,
                reason,
                notes,
                targetStep: null,
                stepUrl: dashboardUrl || null,
                serviceName: 'Car Rental'
            });

            console.log('✅ Car rental rejection email sent successfully');
        } catch (error) {
            console.error('❌ Failed to send car rental rejection email:', error.message);
            if (error.response) {
                console.error('SMTP Response:', error.response);
            }
            if (error.responseCode) {
                console.error('SMTP Response Code:', error.responseCode);
            }
            throw error;
        }
    }
}

module.exports = CarRentalApprovalNotificationService;

