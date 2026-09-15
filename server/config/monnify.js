import crypto from 'crypto';

const monnifyMode = () => (
  String(process.env.MONNIFY_MODE || '').toLowerCase() === 'live'
  || String(process.env.MONNIFY_BASE_URL || '').includes('api.monnify.com')
    ? 'live'
    : 'sandbox'
);

const baseUrl = () => process.env.MONNIFY_BASE_URL
  || (monnifyMode() === 'live' ? 'https://api.monnify.com' : 'https://sandbox.monnify.com');
const configured = () => Boolean(
  process.env.MONNIFY_API_KEY
  && process.env.MONNIFY_SECRET_KEY
  && process.env.MONNIFY_CONTRACT_CODE,
);

let tokenCache = { token: null, expiresAt: 0 };

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.requestSuccessful === false) {
    throw new Error(data.responseMessage || data.message || `Monnify request failed (${response.status})`);
  }
  return data.responseBody ?? data;
};

const accessToken = async () => {
  if (!configured()) throw new Error('Monnify is not configured');
  if (tokenCache.token && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;
  const basic = Buffer.from(`${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`).toString('base64');
  const response = await fetch(`${baseUrl()}/api/v1/auth/login`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}` },
  });
  const body = await parseResponse(response);
  tokenCache = {
    token: body.accessToken,
    expiresAt: Date.now() + Number(body.expiresIn || 3600) * 1000,
  };
  return tokenCache.token;
};

const request = async (path, { method = 'GET', body } = {}) => {
  const token = await accessToken();
  const response = await fetch(`${baseUrl()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return parseResponse(response);
};

export const initializeMonnifyTransaction = ({ amount, email, name, reference, description, redirectUrl }) =>
  request('/api/v1/merchant/transactions/init-transaction', {
    method: 'POST',
    body: {
      amount,
      customerName: name,
      customerEmail: email,
      paymentReference: reference,
      paymentDescription: description,
      currencyCode: 'NGN',
      contractCode: process.env.MONNIFY_CONTRACT_CODE,
      redirectUrl,
      paymentMethods: ['CARD', 'ACCOUNT_TRANSFER', 'USSD'],
    },
  });

export const verifyMonnifyTransaction = (reference) =>
  request(`/api/v2/merchant/transactions/query?paymentReference=${encodeURIComponent(reference)}`);

export const listMonnifyBanks = () => request('/api/v1/banks');

export const validateMonnifyAccount = ({ accountNumber, bankCode }) =>
  request(`/api/v1/disbursements/account/validate?accountNumber=${encodeURIComponent(accountNumber)}&bankCode=${encodeURIComponent(bankCode)}`);

export const initiateMonnifyTransfer = ({ amount, reference, narration, accountNumber, bankCode, accountName }) =>
  request('/api/v2/disbursements/single', {
    method: 'POST',
    body: {
      amount,
      reference,
      narration,
      destinationBankCode: bankCode,
      destinationAccountNumber: accountNumber,
      destinationAccountName: accountName,
      currency: 'NGN',
      sourceAccountNumber: process.env.MONNIFY_WALLET_ACCOUNT_NUMBER,
      async: true,
    },
  });

export const getMonnifyTransfer = (reference) =>
  request(`/api/v2/disbursements/single/summary?reference=${encodeURIComponent(reference)}`);

export const verifyMonnifySignature = (rawBody, signature) => {
  if (!signature || !process.env.MONNIFY_SECRET_KEY) return false;
  const expected = crypto
    .createHmac('sha512', process.env.MONNIFY_SECRET_KEY)
    .update(rawBody)
    .digest('hex');
  const left = Buffer.from(expected);
  const right = Buffer.from(String(signature));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

export const monnifyConfigured = configured;
export const getMonnifyMode = monnifyMode;
