import express from 'express';
import * as authController from '../controllers/authController.js';
import * as requestController from '../controllers/requestController.js';

const router = express.Router();

// primary routes
router
  .route('/')
  .get(authController.protect, requestController.getAllRequests)
  .post(authController.protect, requestController.createRequest);

router
  .route('/:id')
  .get(authController.protect, requestController.getRequest)
  .patch(authController.protect, requestController.updateOwnRequest)
  .delete(
    authController.protect,
    authController.restrictedTo('admin'),
    requestController.deleteOwnRequest,
  );

// Secondary routes
router.post(
  '/:requestId/vote',
  authController.protect,
  requestController.voteRequest,
);
router.post(
  '/:requestId/comment',
  authController.protect,
  requestController.commentRequest,
);

router.patch(
  '/:requestId/comments/:commentId',
  authController.protect,
  requestController.editOwnComment,
);
router.delete(
  '/:requestId/comments/:commentId',
  authController.protect,
  requestController.deleteOwnComment,
);

router.delete(
  '/:requestId/comments/:commentId/admin',
  authController.protect,
  authController.restrictedTo('admin'),
  requestController.adminDeleteComment,
);

export default router;
