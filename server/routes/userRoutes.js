import express from 'express';
import { protect } from '../middlewares/protectedRoute.js';
import * as authController from '../controllers/authController.js';
import * as userController from '../controllers/userController.js';
import { deleteFromCloudinary } from '../middlewares/deleteFromCloudinary.js';
// import { aliasTopHelpers } from '../middlewares/aliasTopHelpers.js';

function test() {
  console.log('Checkcheck');
}

const router = express.Router();

// .route('/top-5-helpers')
// .get(aliasTopHelpers, userController.getAllHelper);
router.route('/user-stats').get(userController.getUserStats);
// router.route('/monthly-plan/:year').get(userController.getMonthlyPlan);

// router.route('/').get(protect, userController.getAllHelper);
router.route('/profile/:name').get(protect, userController.getUserProfile);

// ============== REAL ==================
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authController.protect, authController.getMe);
router.post('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword,
);

router.patch(
  '/updateMe',
  authController.protect,
  deleteFromCloudinary,
  userController.updateMe,
);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
