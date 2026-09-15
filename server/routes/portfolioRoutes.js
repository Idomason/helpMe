import express from 'express';
import { protect } from '../controllers/authController.js';
import {
  getGiverLeaderboard,
  getMyGiverPerformance,
  getPortfolio,
  refreshMyAwards,
} from '../controllers/portfolioController.js';

const router = express.Router();

router.get('/refresh-awards', protect, refreshMyAwards);
router.get('/leaderboard', getGiverLeaderboard);
router.get('/leaderboard/me', protect, getMyGiverPerformance);
router.get('/:name', getPortfolio);

export default router;
