import express from 'express';
import { protect } from '../controllers/authController.js';
import {
  getHelperTags,
  getMyHelperProfile,
  upsertMyHelperProfile,
  getPublicHelperProfile,
} from '../controllers/helperController.js';

const router = express.Router();

router.get('/tags', getHelperTags);
router.get('/me', protect, getMyHelperProfile);
router.patch('/me', protect, upsertMyHelperProfile);
router.get('/profile/:name', getPublicHelperProfile);

export default router;
