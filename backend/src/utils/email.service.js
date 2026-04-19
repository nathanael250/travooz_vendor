const nodemailer = require('nodemailer');

class EmailService {
    static isEmailEnabled() {
        if (process.env.EMAIL_ENABLED) {
            return process.env.EMAIL_ENABLED === 'true';
        }

        return process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'dev';
    }

    static getRequiredConfig() {
        const config = {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT, 10),
            secure: process.env.SMTP_SECURE === 'true',
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
            from: process.env.EMAIL_FROM
        };

        const missing = [];
        if (!config.host) missing.push('SMTP_HOST');
        if (!config.port || Number.isNaN(config.port)) missing.push('SMTP_PORT');
        if (!process.env.SMTP_SECURE) missing.push('SMTP_SECURE');
        if (!config.user) missing.push('SMTP_USERNAME');
        if (!config.pass) missing.push('SMTP_PASSWORD');

        if (missing.length) {
            throw new Error(`Missing required email configuration: ${missing.join(', ')}`);
        }

        return config;
    }

    /**
     * Create email transporter using SMTP configuration
     */
    static createTransporter() {
        const smtpConfig = this.getRequiredConfig();

        // SMTP configuration from environment variables
        const config = {
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure,
            family: 4,
            auth: {
                user: smtpConfig.user,
                pass: smtpConfig.pass
            },
            // Additional options for better compatibility
            tls: {
                rejectUnauthorized: false // For development - remove in production or use proper certificates
            },
            requireTLS: !smtpConfig.secure,
            // Connection timeout
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,
            socketTimeout: 10000
        };

        console.log(' Creating SMTP transporter with config:');
        console.log('   Host:', config.host);
        console.log('   Port:', config.port);
        console.log('   Secure:', config.secure);
        console.log('   User:', config.auth.user);

        return nodemailer.createTransport(config);
    }

    /**
     * Verify SMTP connection
     */
    static async verifyConnection() {
        try {
            if (!this.isEmailEnabled()) {
                console.log('📧 Email sending disabled for local development; skipping SMTP verification.');
                return true;
            }

            const transporter = this.createTransporter();
            console.log('🔍 Verifying SMTP connection...');
            await transporter.verify();
            console.log('✅ SMTP server connection verified');
            return true;
        } catch (error) {
            console.error('❌ SMTP connection verification failed:');
            console.error('   Error:', error.message);
            console.error('   Code:', error.code);
            if (error.command) {
                console.error('   Command:', error.command);
            }
            return false;
        }
    }

    /**
     * Send email using nodemailer
     * @param {Object} options - Email options
     * @param {string} options.to - Recipient email
     * @param {string} options.subject - Email subject
     * @param {string} options.html - HTML content
     * @param {string} options.text - Plain text content (optional)
     * @param {string} options.from - Sender email (optional)
     * @returns {Promise<Object>} - Send result
     */
    static async sendEmail(options) {
        try {
            console.log('\n📧 ==========================================');
            console.log('📧 Starting email send process...');
            console.log('📧 To:', options.to);
            console.log('📧 Subject:', options.subject);

            if (!this.isEmailEnabled()) {
                console.log('📧 Email sending disabled for local development; skipping SMTP send.');
                console.log('📧 ==========================================\n');

                return {
                    success: true,
                    messageId: 'dev-mode-email-skipped',
                    response: 'Email sending skipped in development'
                };
            }
            
            const transporter = this.createTransporter();
            const smtpConfig = this.getRequiredConfig();

            const mailOptions = {
                from: options.from || smtpConfig.from || `"Travooz" <${smtpConfig.user}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML if no text provided
            };

            console.log('📧 From:', mailOptions.from);
            
            const info = await transporter.sendMail(mailOptions);
            
            console.log('✅ Email sent successfully!');
            console.log('📧 Message ID:', info.messageId);
            console.log('📧 Response:', info.response);
            console.log('📧 ==========================================\n');
            
            return {
                success: true,
                messageId: info.messageId,
                response: info.response
            };
        } catch (error) {
            console.error('\n❌ ==========================================');
            console.error('❌ Email sending failed!');
            console.error('❌ Error message:', error.message);
            console.error('❌ Error code:', error.code);
            if (error.command) {
                console.error('❌ SMTP Command:', error.command);
            }
            if (error.response) {
                console.error('❌ SMTP Response:', error.response);
            }
            if (error.responseCode) {
                console.error('❌ Response Code:', error.responseCode);
            }
            console.error('❌ ==========================================\n');
            
            throw error;
        }
    }

    /**
     * Send verification code email
     * @param {string} email - Recipient email
     * @param {string} code - Verification code
     * @param {string} userName - User's name
     * @returns {Promise<Object>} - Send result
     */
    static async sendVerificationCode(email, code, userName = 'there') {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #3CAF54; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">Travooz</h1>
                </div>
                <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                    <h2 style="color: #1f2937; margin-top: 0;">Email Verification</h2>
                    <p style="color: #4b5563; font-size: 16px;">Hello ${userName},</p>
                    <p style="color: #4b5563; font-size: 16px;">Thank you for registering with Travooz! Please use the verification code below to verify your email address:</p>
                    <div style="background-color: #f0fdf4; border: 2px solid #3CAF54; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                        <h1 style="color: #3CAF54; margin: 0; font-size: 36px; letter-spacing: 8px; font-weight: bold;">${code}</h1>
                    </div>
                    <p style="color: #4b5563; font-size: 14px;">This code will expire in 5 minutes.</p>
                    <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">If you didn't request this verification code, please ignore this email.</p>
                </div>
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Travooz. All rights reserved.</p>
                </div>
            </div>
        `;

        const text = `
Email Verification

Hello ${userName},

Thank you for registering with Travooz! Please use the verification code below to verify your email address:

Verification Code: ${code}

This code will expire in 5 minutes.

If you didn't request this verification code, please ignore this email.

© ${new Date().getFullYear()} Travooz. All rights reserved.
        `;

        return await this.sendEmail({
            to: email,
            subject: 'Verify Your Travooz Email Address',
            html: html,
            text: text
        });
    }

    /**
     * Send vendor approval email once admin verifies the account
     * @param {Object} params
     * @param {string} params.email - Recipient email
     * @param {string} params.name - Vendor name
     * @param {string} params.businessName - Approved business name
     * @param {string} params.dashboardUrl - URL to vendor dashboard
     * @param {string} params.serviceName - Service name (e.g. Tours)
     */
    static async sendVendorApprovalEmail({
        email,
        name = 'there',
        businessName = 'your business',
        dashboardUrl = 'https://vendor.travoozapp.com',
        serviceName = 'your business'
    }) {
        const safeDashboardUrl = dashboardUrl || 'https://vendor.travoozapp.com';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #3CAF54; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">Travooz</h1>
                </div>
                <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                    <h2 style="color: #1f2937; margin-top: 0;">Your ${serviceName} listing is live!</h2>
                    <p style="color: #4b5563; font-size: 16px;">Hi ${name || 'there'},</p>
                    <p style="color: #4b5563; font-size: 16px;">
                        Great news! Your ${serviceName.toLowerCase()} listing <strong>${businessName}</strong> has been reviewed and approved by our team.
                    </p>
                    <p style="color: #4b5563; font-size: 16px;">
                        You can now access your vendor dashboard to manage bookings, update your listing, and track performance.
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
                    <p style="color: #4b5563; font-size: 14px; margin-top: 30px;">
                        We’re excited to have you onboard. If you need any help, simply reply to this email and our support team will assist you right away.
                    </p>
                </div>
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Travooz. All rights reserved.</p>
                </div>
            </div>
        `;

        const text = `
Congratulations! Your ${serviceName} listing "${businessName}" has been approved.

You can now manage your business from the Travooz vendor dashboard:
${safeDashboardUrl}

If you have any questions, just reply to this email and our team will help.

© ${new Date().getFullYear()} Travooz. All rights reserved.
        `;

        return await this.sendEmail({
            to: email,
            subject: `Your ${serviceName} listing is approved`,
            html,
            text
        });
    }

    /**
     * Notify vendor that admin requested changes / rejected submission
     */
    static async sendVendorRejectionEmail({
        email,
        name = 'there',
        businessName = 'your business',
        reason = 'Additional information required',
        notes = '',
        targetStep = null,
        serviceName = 'your business',
        stepUrl = null
    }) {
        const reasonText = reason || 'Your submission requires updates.';
        const stepText = targetStep ? `Please return to Step ${targetStep} in the onboarding wizard to fix the highlighted fields.` : '';
        const notesText = notes ? `<p style="color:#4b5563;font-size:15px;">${notes}</p>` : '';
        const actionButton = stepUrl
            ? `<div style="margin: 30px 0; text-align: center;">
                    <a href="${stepUrl}" style="display:inline-block;background-color:#dc2626;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;">
                        Update Submission
                    </a>
               </div>`
            : '';
        const actionText = stepUrl
            ? `<p style="color:#4b5563;font-size:14px;">Use this link to update your submission:<br/><a href="${stepUrl}" style="color:#dc2626;">${stepUrl}</a></p>`
            : '';

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #dc2626; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">Travooz</h1>
                </div>
                <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                    <h2 style="color: #1f2937; margin-top: 0;">We need a few more details</h2>
                    <p style="color: #4b5563; font-size: 16px;">Hi ${name || 'there'},</p>
                    <p style="color: #4b5563; font-size: 16px;">
                        Our team reviewed your ${serviceName.toLowerCase()} submission <strong>${businessName}</strong>, but we need the following before we can approve it:
                    </p>
                    <div style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;color:#991b1b;margin:20px 0;">
                        ${reasonText}
                    </div>
                    ${notesText}
                    ${stepText ? `<p style="color:#4b5563;font-size:15px;"><strong>Next step:</strong> ${stepText}</p>` : ''}
                    ${actionButton}
                    ${actionText}
                    <p style="color: #4b5563; font-size: 14px; margin-top: 30px;">
                        Once you update the information, resubmit your application and our team will re-review it quickly. Let us know if you need help.
                    </p>
                </div>
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Travooz. All rights reserved.</p>
                </div>
            </div>
        `;

        const text = `
Hi ${name || 'there'},

We reviewed your ${serviceName} submission "${businessName}", but we need more information before we can approve it.

Reason: ${reasonText}
${notes ? `\nNotes: ${notes}` : ''}
${stepText ? `\nNext step: ${stepText}` : ''}
${stepUrl ? `\nUpdate your submission here: ${stepUrl}` : ''}

Once you update the requested information, please resubmit your application.

© ${new Date().getFullYear()} Travooz. All rights reserved.
        `;

        return await this.sendEmail({
            to: email,
            subject: `${serviceName} submission needs updates`,
            html,
            text
        });
    }

    /**
     * Send password reset email
     * @param {Object} params
     * @param {string} params.email - Recipient email
     * @param {string} params.name - User name
     * @param {string} params.resetToken - Password reset token
     * @param {string} params.resetUrl - Full URL to reset password page
     */
    static async sendPasswordResetEmail({
        email,
        name = 'there',
        resetToken,
        resetUrl
    }) {
        const safeResetUrl = resetUrl || `https://vendor.travooz.rw/stays/reset-password?token=${resetToken}`;
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #3CAF54; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">Travooz</h1>
                </div>
                <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                    <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
                    <p style="color: #4b5563; font-size: 16px;">Hi ${name || 'there'},</p>
                    <p style="color: #4b5563; font-size: 16px;">
                        We received a request to reset your password for your Travooz vendor account. Click the button below to reset your password:
                    </p>
                    <div style="margin: 30px 0; text-align: center;">
                        <a href="${safeResetUrl}" style="display:inline-block;background-color:#3CAF54;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #4b5563; font-size: 14px;">
                        Or copy and paste this link into your browser:
                    </p>
                    <p style="color: #3CAF54; font-size: 14px; word-break: break-all;">
                        ${safeResetUrl}
                    </p>
                    <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
                        This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                    </p>
                </div>
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Travooz. All rights reserved.</p>
                </div>
            </div>
        `;

        const text = `
Reset Your Password

Hi ${name || 'there'},

We received a request to reset your password for your Travooz vendor account. Use the link below to reset your password:

${safeResetUrl}

This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.

© ${new Date().getFullYear()} Travooz. All rights reserved.
        `;

        return await this.sendEmail({
            to: email,
            subject: 'Reset Your Travooz Password',
            html,
            text
        });
    }
}

module.exports = EmailService;
