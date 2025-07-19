// abc
import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendVerificationEmail = async (email: string, username: string, token: string) => {
  try {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"Socket Talk" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email Address - Socket Talk',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0;">Socket Talk</h1>
            <p style="color: #6B7280; margin: 5px 0;">Real-time Chat Application</p>
          </div>
          
          <div style="background: #F9FAFB; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #1F2937; margin-top: 0;">Welcome to Socket Talk, ${username}!</h2>
            <p style="color: #4B5563; line-height: 1.6;">
              Thank you for signing up! To get started, please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; margin-bottom: 0;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #4F46E5; word-break: break-all;">${verificationUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account with Socket Talk, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendPasswordResetEmail = async (email: string, username: string, token: string) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Socket Talk" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - Socket Talk',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0;">Socket Talk</h1>
            <p style="color: #6B7280; margin: 5px 0;">Real-time Chat Application</p>
          </div>
          
          <div style="background: #FEF2F2; padding: 30px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #EF4444;">
            <h2 style="color: #1F2937; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #4B5563; line-height: 1.6;">
              Hello ${username}, we received a request to reset your password. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #EF4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; margin-bottom: 0;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #EF4444; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
            <p>This password reset link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};
