import { processDueRequestClaims } from '../controllers/requestClaimController.js';
import { expireGiveawayClaims } from '../controllers/submissionController.js';
import { reconcilePendingWithdrawals } from '../controllers/walletController.js';

let running = false;

export const runPaymentJobs = async () => {
  if (running) return;
  running = true;
  try {
    await processDueRequestClaims();
    await expireGiveawayClaims();
    await reconcilePendingWithdrawals();
  } catch (error) {
    console.error('Payment reconciliation failed:', error.message);
  } finally {
    running = false;
  }
};
