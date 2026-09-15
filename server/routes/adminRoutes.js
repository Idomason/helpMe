import express from 'express';
import { protect, restrictedTo } from '../controllers/authController.js';
import {
  getAdminStats,
  listUsers,
  setUserRole,
  setUserActive,
  listReports,
  resolveReport,
  resolveDispute,
} from '../controllers/adminController.js';
import {
  adminApproveWithdrawal,
  adminListWithdrawals,
  adminRejectWithdrawal,
  adminPaymentOverview,
  adminSetWalletStatus,
} from '../controllers/walletController.js';

const router = express.Router();

// Everything here is admin-only
router.use(protect, restrictedTo('admin'));

router.get('/stats', getAdminStats);
router.get('/users', listUsers);
router.patch('/users/:id/role', setUserRole);
router.patch('/users/:id/active', setUserActive);
router.get('/reports', listReports);
router.patch('/reports/:id/resolve', resolveReport);
router.patch('/disputes/:id/resolve', resolveDispute);
router.get('/withdrawals', adminListWithdrawals);
router.post('/withdrawals/:id/approve', adminApproveWithdrawal);
router.post('/withdrawals/:id/reject', adminRejectWithdrawal);
router.get('/payments', adminPaymentOverview);
router.patch('/wallets/:userId/status', adminSetWalletStatus);

export default router;
