import crypto from 'crypto';

const BASE = 'https://api.paystack.co';

const secret = () => process.env.PAYSTACK_SECRET_KEY;

const request = async (path, { method = 'GET', body } = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secret()}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok || data.status === false) {
    throw new Error(data.message || `Paystack request failed: ${path}`);
  }
  return data.data;
};

// Money IN: initialize a checkout transaction
export const initializeTransaction = ({ email, amountKobo, reference, metadata }) =>
  request('/transaction/initialize', {
    method: 'POST',
    body: { email, amount: amountKobo, currency: 'NGN', reference, metadata },
  });

// Verify a charge transaction
export const verifyTransaction = (reference) =>
  request(`/transaction/verify/${encodeURIComponent(reference)}`);

// Create (or reuse) a transfer recipient (bank account)
export const createTransferRecipient = ({ name, accountNumber, bankCode }) =>
  request('/transferrecipient', {
    method: 'POST',
    body: {
      type: 'nuban',
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: 'NGN',
    },
  });

// Money OUT: initiate a transfer to a recipient
export const initiateTransfer = ({ amountKobo, recipientCode, reference, reason }) =>
  request('/transfer', {
    method: 'POST',
    body: {
      source: 'balance',
      amount: amountKobo,
      recipient: recipientCode,
      reference,
      reason,
    },
  });

// Verify a transfer
export const verifyTransfer = (reference) =>
  request(`/transfer/verify/${encodeURIComponent(reference)}`);

// Compatibility only: refund an already-paid legacy Paystack transaction.
export const refundTransaction = ({ reference, amountKobo }) =>
  request('/refund', {
    method: 'POST',
    body: { transaction: reference, amount: amountKobo },
  });

// List Nigerian banks (for the payout account picker)
export const listBanks = () => request('/bank?currency=NGN');

// Verify webhook signature (raw body string required)
export const verifyWebhookSignature = (rawBody, signature) => {
  if (!signature) return false;
  const hash = crypto
    .createHmac('sha512', secret())
    .update(rawBody)
    .digest('hex');
  return hash === signature;
};

export const toKobo = (naira) => Math.round(Number(naira) * 100);
