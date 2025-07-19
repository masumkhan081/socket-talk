import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateTokenPair } from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { ApiResponse, AuthenticatedRequest } from '../types';
import {
   SignupInput,
   SigninInput,
   ForgotPasswordInput,
   ResetPasswordInput,
   VerifyEmailInput,
   UpdateProfileInput
} from '../validation/auth';

export const signup = async (req: Request<{}, {}, SignupInput>, res: Response) => {
   try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
         $or: [{ email }, { username }]
      });

      if (existingUser) {
         const field = existingUser.email === email ? 'email' : 'username';
         const response: ApiResponse = {
            success: false,
            message: 'User already exists',
            error: `A user with this ${field} already exists`
         };
         return res.status(409).json(response);
      }

      // Create new user
      const user = new User({
         username,
         email,
         password
      });

      // Generate email verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // Send verification email
      try {
         await sendVerificationEmail(email, username, verificationToken);
      } catch (emailError) {
         console.error('Email sending failed:', emailError);
         // Continue with signup even if email fails
      }

      const response: ApiResponse = {
         success: true,
         message: 'Account created successfully',
         data: {
            message: 'Please check your email to verify your account',
            userId: user._id
         }
      };

      return res.status(201).json(response);
   } catch (error) {
      console.error('Signup error:', error);

      const response: ApiResponse = {
         success: false,
         message: 'Internal server error',
         error: 'Failed to create account'
      };

      return res.status(500).json(response);
   }
};

export const signin = async (req: Request<{}, {}, SigninInput>, res: Response) => {
   try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
         const response: ApiResponse = {
            success: false,
            message: 'Invalid credentials',
            error: 'Email or password is incorrect'
         };
         return res.status(401).json(response);
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
         const response: ApiResponse = {
            success: false,
            message: 'Invalid credentials',
            error: 'Email or password is incorrect'
         };
         return res.status(401).json(response);
      }

      // Generate tokens
      const tokens = generateTokenPair({
         userId: user._id.toString(),
         email: user.email
      });

      // Update user online status
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();

      const response: ApiResponse = {
         success: true,
         message: 'Signed in successfully',
         data: {
            user: {
               id: user._id,
               username: user.username,
               email: user.email,
               profileImage: user.profileImage,
               bio: user.bio,
               isEmailVerified: user.isEmailVerified,
               isOnline: user.isOnline,
               lastSeen: user.lastSeen
            },
            ...tokens
         }
      };

      return res.json(response);
   } catch (error) {
      console.error('Signin error:', error);

      const response: ApiResponse = {
         success: false,
         message: 'Internal server error',
         error: 'Failed to sign in'
      };

      return res.status(500).json(response);
   }
};

export const signout = async (req: AuthenticatedRequest, res: Response) => {
   try {
      if (req.userId) {
         await User.findByIdAndUpdate(req.userId, {
            isOnline: false,
            lastSeen: new Date()
         });
      }

      const response: ApiResponse = {
         success: true,
         message: 'Signed out successfully'
      };

      return res.json(response);
   } catch (error) {
      console.error('Signout error:', error);

      const response: ApiResponse = {
         success: false,
         message: 'Internal server error',
         error: 'Failed to sign out'
      };

      return res.status(500).json(response);
   }
};

export const verifyEmail = async (req: Request<{}, {}, VerifyEmailInput>, res: Response) => {
   try {
      const { token } = req.body;

      const user = await User.findOne({
         emailVerificationToken: token,
         emailVerificationExpires: { $gt: Date.now() }
      });

      if (!user) {
         const response: ApiResponse = {
            success: false,
            message: 'Invalid or expired verification token',
            error: 'Please request a new verification email'
         };
         return res.status(400).json(response);
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      const response: ApiResponse = {
         success: true,
         message: 'Email verified successfully',
         data: {
            message: 'Your email has been verified. You can now access all features.'
         }
      };

      return res.json(response);
   } catch (error) {
      console.error('Email verification error:', error);

      const response: ApiResponse = {
         success: false,
         message: 'Internal server error',
         error: 'Failed to verify email'
      };

      return res.status(500).json(response);
   }
};

export const forgotPassword = async (req: Request<{}, {}, ForgotPasswordInput>, res: Response) => {
   try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
         // Don't reveal if user exists or not
         const response: ApiResponse = {
            success: true,
            message: 'If an account with that email exists, we have sent a password reset link',
            data: {
               message: 'Please check your email for password reset instructions'
            }
         };
         return res.json(response);
      }

      const resetToken = user.generatePasswordResetToken();
      await user.save();

      try {
         await sendPasswordResetEmail(email, user.username, resetToken);
      } catch (emailError) {
         console.error('Password reset email failed:', emailError);
         user.passwordResetToken = undefined;
         user.passwordResetExpires = undefined;
         await user.save();

         const response: ApiResponse = {
            success: false,
            message: 'Failed to send password reset email',
            error: 'Please try again later'
         };
         return res.status(500).json(response);
      }

      const response: ApiResponse = {
         success: true,
         message: 'Password reset email sent',
         data: {
            message: 'Please check your email for password reset instructions'
         }
      };

      return res.json(response);
   } catch (error) {
      console.error('Forgot password error:', error);

      const response: ApiResponse = {
         success: false,
         message: 'Internal server error',
         error: 'Failed to process password reset request'
      };

      return res.status(500).json(response);
   }
};

export const resetPassword = async (req: Request<{}, {}, ResetPasswordInput>, res: Response) => {
   try {
      const { token, password } = req.body;

      const user = await User.findOne({
         passwordResetToken: token,
         passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
         const response: ApiResponse = {
            success: false,
            message: 'Invalid or expired reset token',
            error: 'Please request a new password reset'
         };
         return res.status(400).json(response);
      }

      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      const response: ApiResponse = {
         success: true,
         message: 'Password reset successfully',
         data: {
            message: 'Your password has been updated. You can now sign in with your new password.'
         }
      };

      return res.json(response);
   } catch (error) {
      console.error('Reset password error:', error);

      const response: ApiResponse = {
         success: false,
         message: 'Internal server error',
         error: 'Failed to reset password'
      };

      return res.status(500).json(response);
   }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
   try {
      const user = await User.findById(req.userId);
      if (!user) {
         const response: ApiResponse = {
            success: false,
            message: 'User not found',
            error: 'User account no longer exists'
         };
         return res.status(404).json(response);
      }

      const response: ApiResponse = {
         success: true,
         message: 'Profile retrieved successfully',
         data: {
            user: {
               id: user._id,
               username: user.username,
               email: user.email,
               profileImage: user.profileImage,
               bio: user.bio,
               isEmailVerified: user.isEmailVerified,
               isOnline: user.isOnline,
               lastSeen: user.lastSeen,
               createdAt: user.createdAt
            }
         }
      };

      return res.json(response);
   } catch (error) {
      console.error('Get profile error:', error);

      const response: ApiResponse = {
         success: false,
         message: 'Internal server error',
         error: 'Failed to retrieve profile'
      };

      return res.status(500).json(response);
   }
};

export const updateProfile = async (req: AuthenticatedRequest<{}, {}, UpdateProfileInput>, res: Response) => {
   try {
      const updates = req.body;

      // Check if username is being updated and if it's already taken
      if (updates.username) {
         const existingUser = await User.findOne({
            username: updates.username,
            _id: { $ne: req.userId }
         });

         if (existingUser) {
            const response: ApiResponse = {
               success: false,
               message: 'Username already taken',
               error: 'Please choose a different username'
            };
            return res.status(409).json(response);
         }
      }

      const user = await User.findByIdAndUpdate(
         req.userId,
         { $set: updates },
         { new: true, runValidators: true }
      );

      if (!user) {
         const response: ApiResponse = {
            success: false,
            message: 'User not found',
            error: 'User account no longer exists'
         };
         return res.status(404).json(response);
      }

      const response: ApiResponse = {
         success: true,
         message: 'Profile updated successfully',
         data: {
            user: {
               id: user._id,
               username: user.username,
               email: user.email,
               profileImage: user.profileImage,
               bio: user.bio,
               isEmailVerified: user.isEmailVerified,
               isOnline: user.isOnline,
               lastSeen: user.lastSeen
            }
         }
      };

      return res.json(response);
   } catch (error) {
      console.error('Update profile error:', error);

      const response: ApiResponse = {
         success: false,
         message: 'Internal server error',
         error: 'Failed to update profile'
      };

      return res.status(500).json(response);
   }
};
