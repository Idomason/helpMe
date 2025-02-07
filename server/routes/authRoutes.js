import express from 'express';
import {
  getMe,
  login,
  logout,
  register,
} from '../controllers/authController.js';
import { protect } from '../middlewares/protectedRoute.js';

export const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/me').post(protect, getMe);
router.route('/logout').post(logout);

export default router;
