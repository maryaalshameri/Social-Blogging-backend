// services/emailService.js
const nodemailer = require('nodemailer');

// إنشاء transporter مع إعدادات Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // استخدام TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // لأغراض التطوير فقط
  }
});

// اختبار الاتصال
transporter.verify(function(error, success) {
  if (error) {
    console.log('Email server connection error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

exports.sendVerificationEmail = async (user, token) => {
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: `"MaryBlog" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Verify Your Email - MaryBlog',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7C3AED;">Welcome to MaryBlog!</h2>
          <p>Hello ${user.username},</p>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" 
             style="background-color: #7C3AED; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;">
            Verify Email
          </a>
          <p>Or copy this link:</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

exports.sendPasswordResetEmail = async (user, resetCode) => {
  try {
    const mailOptions = {
      from: `"MaryBlog" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Password Reset Code - MaryBlog',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7C3AED;">Password Reset Request</h2>
          <p>Hello ${user.username},</p>
          <p>You requested to reset your password. Use the following verification code:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: linear-gradient(135deg, #7C3AED, #4F46E5); 
                        color: white; 
                        padding: 20px; 
                        font-size: 32px; 
                        font-weight: bold; 
                        letter-spacing: 8px; 
                        border-radius: 12px;
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);">
              ${resetCode}
            </div>
          </div>
          
          <p><strong>This code will expire in 1 hour.</strong></p>
          <p>Enter this code in the password reset form to set a new password.</p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
          
          <p style="font-size: 12px; color: #666;">
            For security reasons, this code can only be used once and will expire after 1 hour.
            If you didn't request this, please ignore this email and your password will remain unchanged.
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};