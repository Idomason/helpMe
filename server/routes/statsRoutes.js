import express from 'express';
import { getStats } from '../controllers/statsController.js';

const router = express.Router();

// Platform totals are public. Authenticated dashboard-specific counts are
// returned by endpoints that already enforce authentication.
router.get('/', getStats);

export default router;
