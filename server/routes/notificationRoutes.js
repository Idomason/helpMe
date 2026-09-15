import express from 'express';
import { protect } from '../controllers/authController.js';
import { listNotifications, readAllNotifications, readNotification } from '../controllers/walletController.js';

const router = express.Router();
router.use(protect);
router.get('/', listNotifications);
router.patch('/read-all', readAllNotifications);
router.patch('/:id/read', readNotification);
export default router;
