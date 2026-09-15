import express from 'express';
import { protect } from '../controllers/authController.js';
import { getBankAccount, listBanks, nameEnquiry, saveBankAccount } from '../controllers/walletController.js';

const router = express.Router();
router.get('/banks', protect, listBanks);
router.post('/name-enquiry', protect, nameEnquiry);
router.get('/bank-account', protect, getBankAccount);
router.post('/bank-account', protect, saveBankAccount);
export default router;
