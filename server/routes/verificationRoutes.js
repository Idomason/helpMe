import express from 'express';
import { protect, restrictedTo } from '../controllers/authController.js';
import {
  submitVerification,
  getMyVerification,
  listVerifications,
  reviewVerification,
} from '../controllers/verificationController.js';

const router = express.Router();

router.post('/', protect, submitVerification);
router.get('/me', protect, getMyVerification);

// Admin
router.get('/', protect, restrictedTo('admin'), listVerifications);
router.patch('/:id/review', protect, restrictedTo('admin'), reviewVerification);

export default router;
