import express from 'express';
import * as authController from '../controllers/authController.js';
import * as giveawayController from '../controllers/giveawayController.js';
import {
  submitToGiveaway,
  listSubmissions,
  getMySubmission,
  rejectSubmission,
  rewardSubmission,
  claimGiveawayReward,
  reassignExpiredReward,
  listMyRewardAllocations,
} from '../controllers/submissionController.js';

const router = express.Router();

router
  .route('/')
  .get(giveawayController.getAllGiveaways)
  .post(authController.protect, giveawayController.createGiveaway);

// ─── Giveaway challenge submissions ───
router.post('/:giveawayId/submit', authController.protect, submitToGiveaway);
router.get('/:giveawayId/submissions', authController.protect, listSubmissions);
router.get('/:giveawayId/my-submission', authController.protect, getMySubmission);
router.patch('/submissions/:submissionId/reject', authController.protect, rejectSubmission);
router.patch('/submissions/:submissionId/reward', authController.protect, rewardSubmission);
router.get('/rewards/mine', authController.protect, listMyRewardAllocations);
router.post('/rewards/:allocationId/claim', authController.protect, claimGiveawayReward);
router.post('/rewards/:allocationId/reassign', authController.protect, reassignExpiredReward);

router
  .route('/:id')
  .get(giveawayController.getGiveaway)
  .patch(authController.protect, giveawayController.updateGiveaway)
  .delete(
    authController.protect,
    authController.restrictedTo('admin'),
    giveawayController.deleteGiveaway,
  );

export default router;
