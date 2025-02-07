import express from 'express';
import * as authController from '../controllers/authController.js';
import * as giveawayController from '../controllers/giveawayController.js';

const router = express.Router();

router
  .route('/')
  .get(authController.protect, giveawayController.getAllGiveaways)
  .post(authController.protect, giveawayController.createGiveaway);
router
  .route('/:id')
  .get(authController.protect, giveawayController.getGiveaway)
  .patch(authController.protect, giveawayController.updateGiveaway)
  .delete(
    authController.protect,
    authController.restrictedTo('admin'),
    giveawayController.deleteGiveaway,
  );

export default router;
