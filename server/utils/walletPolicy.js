export const toKobo = (amount) => Math.round(Number(amount) * 100);
export const toNaira = (kobo) => Number(kobo) / 100;

export const quoteCollectionFee = (amountKobo, percent = 0, flatNaira = 0) => Math.max(
  0,
  Math.round(Number(amountKobo) * (Number(percent) / 100)) + toKobo(flatNaira),
);

export const assessWithdrawal = ({ amountKobo, rollingDailyKobo, bankChangedAt, now = Date.now() }) => {
  const bankRecentlyChanged = now - new Date(bankChangedAt).getTime() < 24 * 60 * 60 * 1000;
  if (bankRecentlyChanged) return { needsReview: true, reason: 'Bank account changed within 24 hours' };
  if (amountKobo > 10_000_000) return { needsReview: true, reason: 'Withdrawal exceeds automatic limit' };
  if (rollingDailyKobo + amountKobo > 25_000_000) return { needsReview: true, reason: 'Rolling daily limit exceeded' };
  return { needsReview: false, reason: null };
};

export const isSuccessfulTransfer = (status) => ['SUCCESS', 'COMPLETED'].includes(String(status || '').toUpperCase());
export const isFailedTransfer = (status) => ['FAILED', 'REVERSED', 'EXPIRED'].includes(String(status || '').toUpperCase());
