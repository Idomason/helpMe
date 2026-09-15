import express from 'express';
import { protect } from '../controllers/authController.js';
import {
  createTopup, createWithdrawal, getWallet, listEntries, listWithdrawals, verifyTopup,
} from '../controllers/walletController.js';

const router = express.Router();
router.use(protect);
router.get('/', getWallet);
router.get('/entries', listEntries);
router.post('/topups', createTopup);
router.get('/topups/:reference', verifyTopup);
router.post('/withdrawals', createWithdrawal);
router.get('/withdrawals', listWithdrawals);
export default router;
