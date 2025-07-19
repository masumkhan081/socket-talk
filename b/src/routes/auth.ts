// abc
import { Router } from 'express';
import {
  signup,
  signin,
  signout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile
} from '../controllers/authController';
import { authenticateToken, requireEmailVerification } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  signupSchema,
  signinSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  updateProfileSchema
} from '../validation/auth';

const router = Router();

// Public routes
router.post('/signup', validateRequest(signupSchema), signup);
router.post('/signin', validateRequest(signinSchema), signin);
router.post('/verify-email', validateRequest(verifyEmailSchema), verifyEmail);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);

// Protected routes
router.post('/signout', authenticateToken, signout);
router.get('/profile', authenticateToken, getProfile);
router.patch('/profile', authenticateToken, requireEmailVerification, validateRequest(updateProfileSchema), updateProfile);

export default router;
