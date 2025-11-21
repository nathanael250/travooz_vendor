const EmailService = require('../../utils/email.service');

class ToursApprovalNotificationService {
    /**
     * Send approval email to vendor once admin verifies listing
     * Mirrors the verification email flow by verifying SMTP connection first
     */
    static async sendApprovalEmail({ email, name, businessName, dashboardUrl }) {
        if (!email) {
            console.warn('⚠️  Approval email skipped: no email provided');
            return;
        }

        try {
            console.log('\n📧 Preparing to send tour approval email:', {
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
                serviceName: 'Tours'
            });

            console.log('✅ Tour approval email sent successfully');
        } catch (error) {
            console.error('❌ Failed to send tour approval email:', error.message);
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

module.exports = ToursApprovalNotificationService;

