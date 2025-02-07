import express from 'express';
import authController from '../controllers/authController';
import requestController from '../controllers/requestController';

const router = express.Router();

router
  .route('/')
  .get(authController.protect, requestController.getAllRequests)
  .post(requestController.createRequest);

router
  .route('/:id')
  .get(authController.protect, requestController.getRequest)
  .patch(authController.protect, requestController.updateRequest)
  .delete(
    authController.protect,
    authController.restrictedTo('admin'),
    requestController.deleteRequest,
  );

export default router;
