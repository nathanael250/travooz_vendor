const EmailService = require('../../utils/email.service');

class StaysApprovalNotificationService {
    /**
     * Send approval email to vendor once admin verifies property listing
     */
    static async sendApprovalEmail({ email, name, propertyName, dashboardUrl }) {
        if (!email) {
            console.warn('⚠️  Approval email skipped: no email provided');
            return;
        }

        try {
            console.log('\n📧 Preparing to send stays approval email:', {
                email,
                propertyName
            });

            await EmailService.sendVendorApprovalEmail({
                email,
                name,
                businessName: propertyName,
                dashboardUrl,
                serviceName: 'Property'
            });

            console.log('✅ Stays approval email sent successfully');
        } catch (error) {
            console.error('❌ Failed to send stays approval email:', error.message);
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
    static async sendRejectionEmail({ email, name, propertyName, reason, notes, dashboardUrl }) {
        if (!email) {
            console.warn('⚠️  Rejection email skipped: no email provided');
            return;
        }

        try {
            console.log('\n📧 Preparing to send stays rejection email:', {
                email,
                propertyName,
                reason
            });

            await EmailService.sendVendorRejectionEmail({
                email,
                name,
                businessName: propertyName,
                reason,
                notes,
                targetStep: null,
                stepUrl: dashboardUrl || null,
                serviceName: 'Property'
            });

            console.log('✅ Stays rejection email sent successfully');
        } catch (error) {
            console.error('❌ Failed to send stays rejection email:', error.message);
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

module.exports = StaysApprovalNotificationService;































