const EmailService = require('../../utils/email.service');

class CarRentalApprovalNotificationService {
    /**
     * Send approval email to car rental vendor
     */
    static async sendApprovalEmail({ email, name, businessName, dashboardUrl }) {
        try {
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #3CAF54; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0;">🎉 Congratulations!</h1>
                    </div>
                    <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                        <h2 style="color: #1f2937; margin-top: 0;">Your Car Rental Business Has Been Approved!</h2>
                        <p style="color: #4b5563; font-size: 16px;">Hi ${name || 'there'},</p>
                        <p style="color: #4b5563; font-size: 16px;">
                            Great news! Your car rental business <strong>${businessName}</strong> has been approved and is now live on Travooz!
                        </p>
                        <p style="color: #4b5563; font-size: 16px;">
                            Customers can now discover and book your vehicles. You can manage your cars, bookings, and settings from your dashboard.
                        </p>
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="${dashboardUrl}" style="display:inline-block;background-color:#3CAF54;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;">
                                Go to Dashboard
                            </a>
                        </div>
                        <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
                            Welcome to the Travooz family! We're excited to have you on board.
                        </p>
                    </div>
                    <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Travooz. All rights reserved.</p>
                    </div>
                </div>
            `;

            const text = `
Congratulations!

Hi ${name || 'there'},

Great news! Your car rental business ${businessName} has been approved and is now live on Travooz!

Customers can now discover and book your vehicles. You can manage your cars, bookings, and settings from your dashboard.

Dashboard: ${dashboardUrl}

Welcome to the Travooz family! We're excited to have you on board.

© ${new Date().getFullYear()} Travooz. All rights reserved.
            `;

            await EmailService.sendEmail({
                to: email,
                subject: `🎉 Your Car Rental Business ${businessName} is Now Live on Travooz!`,
                html,
                text
            });

            console.log(`✅ Approval email sent to ${email} for car rental business ${businessName}`);
        } catch (error) {
            console.error('Error sending car rental approval email:', error);
            throw error;
        }
    }

    /**
     * Send rejection email to car rental vendor
     */
    static async sendRejectionEmail({ email, name, businessName, reason, notes, dashboardUrl }) {
        try {
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #EF4444; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0;">⚠️ Action Required</h1>
                    </div>
                    <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                        <h2 style="color: #1f2937; margin-top: 0;">Your Car Rental Submission Needs Updates</h2>
                        <p style="color: #4b5563; font-size: 16px;">Hi ${name || 'there'},</p>
                        <p style="color: #4b5563; font-size: 16px;">
                            Thank you for submitting your car rental business <strong>${businessName}</strong> to Travooz.
                        </p>
                        <p style="color: #4b5563; font-size: 16px;">
                            Unfortunately, we need you to make some updates before we can approve your listing.
                        </p>
                        
                        ${reason ? `
                        <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0;">
                            <h3 style="color: #991B1B; margin-top: 0; font-size: 16px;">Reason for Rejection:</h3>
                            <p style="color: #7F1D1D; margin: 0; font-size: 14px;">${reason}</p>
                        </div>
                        ` : ''}
                        
                        ${notes ? `
                        <div style="background-color: #F3F4F6; border-left: 4px solid #6B7280; padding: 15px; margin: 20px 0;">
                            <h3 style="color: #374151; margin-top: 0; font-size: 16px;">Additional Notes:</h3>
                            <p style="color: #4B5563; margin: 0; font-size: 14px;">${notes}</p>
                        </div>
                        ` : ''}
                        
                        <p style="color: #4b5563; font-size: 16px;">
                            Please review the feedback above and update your submission accordingly.
                        </p>
                        
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="${dashboardUrl}" style="display:inline-block;background-color:#3CAF54;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;">
                                Update Your Submission
                            </a>
                        </div>
                        
                        <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
                            If you have any questions, please contact our support team.
                        </p>
                    </div>
                    <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Travooz. All rights reserved.</p>
                    </div>
                </div>
            `;

            const text = `
Action Required

Hi ${name || 'there'},

Thank you for submitting your car rental business ${businessName} to Travooz.

Unfortunately, we need you to make some updates before we can approve your listing.

${reason ? `Reason for Rejection:\n${reason}\n\n` : ''}
${notes ? `Additional Notes:\n${notes}\n\n` : ''}

Please review the feedback above and update your submission accordingly.

Dashboard: ${dashboardUrl}

If you have any questions, please contact our support team.

© ${new Date().getFullYear()} Travooz. All rights reserved.
            `;

            await EmailService.sendEmail({
                to: email,
                subject: `⚠️ Action Required: Update Your Car Rental Submission`,
                html,
                text
            });

            console.log(`✅ Rejection email sent to ${email} for car rental business ${businessName}`);
        } catch (error) {
            console.error('Error sending car rental rejection email:', error);
            throw error;
        }
    }
}

module.exports = CarRentalApprovalNotificationService;


