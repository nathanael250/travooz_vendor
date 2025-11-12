const nodemailer = require('nodemailer');

class EmailService {
    /**
     * Create email transporter using SMTP configuration
     */
    static createTransporter() {
        // SMTP configuration from environment variables
        const config = {
            host: process.env.SMTP_HOST || 'smtp.dreamhost.com',
            port: parseInt(process.env.SMTP_PORT) || 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USERNAME || 'admin@panacea-soft.co',
                pass: process.env.SMTP_PASSWORD || 'Ft!dzg+UDM83UsSu'
            },
            // Additional options for better compatibility
            tls: {
                rejectUnauthorized: false // For development - remove in production or use proper certificates
            },
            // Connection timeout
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,
            socketTimeout: 10000
        };

        console.log('📧 Creating SMTP transporter with config:');
        console.log('   Host:', config.host);
        console.log('   Port:', config.port);
        console.log('   User:', config.auth.user);

        return nodemailer.createTransport(config);
    }

    /**
     * Verify SMTP connection
     */
    static async verifyConnection() {
        try {
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
            
            const transporter = this.createTransporter();

            const mailOptions = {
                from: options.from || `"Travooz" <${process.env.SMTP_USERNAME || 'admin@panacea-soft.co'}>`,
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
}

module.exports = EmailService;

