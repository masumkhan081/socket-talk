import { Router } from 'express';
import {
  signup,
  signin,
  signout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updateProfile
} from '../controllers/simpleAuthController';

const router = Router();

// Auth routes
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/signout', signout);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/profile', updateProfile);

export default router;
