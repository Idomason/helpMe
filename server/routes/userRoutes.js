import express from 'express';
import { protect } from '../middlewares/protectedRoute.js';
import * as authController from '../controllers/authController.js';
import * as userController from '../controllers/userController.js';
import { deleteFromStorage } from '../middlewares/deleteFromStorage.js';

const router = express.Router();

router.route('/user-stats').get(userController.getAllUsers);

router.route('/profile/:name').get(protect, userController.getUserProfile);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authController.protect, authController.getMe);
router.post('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updateMyPassword', authController.protect, authController.updatePassword);

router.patch('/updateMe', authController.protect, deleteFromStorage, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.route('/').get(userController.getAllUsers);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

export default router;
