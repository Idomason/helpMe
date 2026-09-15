import express from 'express';
import { protect, restrictedTo } from '../controllers/authController.js';
import {
  fundEscrow,
  verifyEscrowPayment,
  releaseEscrow,
  refundEscrow,
  raiseDispute,
  listDisputes,
  listMyEscrows,
  getEscrowForRequest,
  getRequestFundingSummary,
  saveBankAccount,
  getMyBankAccount,
  getBanks,
} from '../controllers/escrowController.js';
import { createRequestClaim, getRequestClaim } from '../controllers/requestClaimController.js';

const router = express.Router();

// Bank / payout accounts
router.get('/banks', getBanks);
router.get('/bank-account', protect, getMyBankAccount);
router.post('/bank-account', protect, saveBankAccount);

// Escrow lifecycle
router.post('/fund', protect, fundEscrow);
router.get('/verify/:reference', protect, verifyEscrowPayment);
router.post('/:id/release', protect, releaseEscrow);
router.post('/:id/refund', protect, refundEscrow);
router.post('/:id/dispute', protect, raiseDispute);

// Reads
router.get('/mine', protect, listMyEscrows);
router.get('/request/:requestId', getEscrowForRequest);
router.get('/request/:requestId/summary', getRequestFundingSummary);
router.post('/request/:requestId/claim', protect, createRequestClaim);
router.get('/request/:requestId/claim', protect, getRequestClaim);

// Admin
router.get('/disputes', protect, restrictedTo('admin'), listDisputes);

export default router;
