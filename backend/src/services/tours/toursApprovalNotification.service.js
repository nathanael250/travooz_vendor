const EmailService = require('../../utils/email.service');

class ToursApprovalNotificationService {
    /**
     * Send approval email to vendor once admin approves the tours business.
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

            const safeDashboardUrl = dashboardUrl || 'https://vendor.travoozapp.com/tours/dashboard';
            const safeName = name || 'there';
            const safeBusinessName = businessName || 'your tours business';
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #3CAF54; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0;">Travooz</h1>
                    </div>
                    <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                        <h2 style="color: #1f2937; margin-top: 0;">Your tours business is approved</h2>
                        <p style="color: #4b5563; font-size: 16px;">Hi ${safeName},</p>
                        <p style="color: #4b5563; font-size: 16px;">
                            Great news. Your tours business <strong>${safeBusinessName}</strong> has been reviewed and approved by our team.
                        </p>
                        <p style="color: #4b5563; font-size: 16px;">
                            You can now access your vendor dashboard, finish your setup, and create your first tour package.
                        </p>
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="${safeDashboardUrl}" style="display: inline-block; background-color: #3CAF54; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold;">
                                Go to Dashboard
                            </a>
                        </div>
                        <p style="color: #4b5563; font-size: 14px;">
                            If the button above doesn’t work, copy and paste this link into your browser:<br />
                            <a href="${safeDashboardUrl}" style="color: #3CAF54;">${safeDashboardUrl}</a>
                        </p>
                    </div>
                    <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Travooz. All rights reserved.</p>
                    </div>
                </div>
            `;
            const text = `
Your tours business is approved

Hi ${safeName},

Great news. Your tours business "${safeBusinessName}" has been reviewed and approved by our team.

You can now access your vendor dashboard, finish your setup, and create your first tour package:
${safeDashboardUrl}

© ${new Date().getFullYear()} Travooz. All rights reserved.
            `;

            await EmailService.sendEmail({
                email,
                to: email,
                subject: 'Your tours business is approved',
                html,
                text
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

    /**
     * Send rejection/changes-required email to vendor
     */
    static async sendRejectionEmail({ email, name, businessName, reason, notes, targetStep, stepUrl }) {
        if (!email) {
            console.warn('⚠️  Rejection email skipped: no email provided');
            return;
        }

        try {
            console.log('\n📧 Preparing to send tour rejection email:', {
                email,
                businessName,
                reason,
                targetStep,
                stepUrl
            });

            await EmailService.sendVendorRejectionEmail({
                email,
                name,
                businessName,
                reason,
                notes,
                targetStep,
                stepUrl,
                serviceName: 'Tours'
            });

            console.log('✅ Tour rejection email sent successfully');
        } catch (error) {
            console.error('❌ Failed to send tour rejection email:', error.message);
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
