import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

import { globalErrorHandler } from './controllers/errorController.js';
import giveawayRoutes from './routes/giveawayRoutes.js';
import userRoutes from './routes/userRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import helperRoutes from './routes/helperRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import escrowRoutes from './routes/escrowRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { handleWebhook } from './controllers/escrowController.js';
import { handleMonnifyWebhook } from './controllers/walletController.js';

const app = express();

app.use(cors());
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Paystack webhook needs the RAW body for signature verification.
// Register it BEFORE the JSON body parser, using express.raw.
app.post(
  '/api/v1/escrow/webhook',
  express.raw({ type: '*/*' }),
  (req, res, next) => {
    req.rawBody = req.body instanceof Buffer ? req.body.toString('utf8') : '';
    try {
      req.body = req.rawBody ? JSON.parse(req.rawBody) : {};
    } catch {
      req.body = {};
    }
    next();
  },
  handleWebhook,
);

// Monnify also signs the exact raw payload. Register before express.json.
app.post(
  '/api/v1/payments/monnify/webhook',
  express.raw({ type: '*/*' }),
  (req, res, next) => {
    req.rawBody = req.body instanceof Buffer ? req.body.toString('utf8') : '';
    try { req.body = req.rawBody ? JSON.parse(req.rawBody) : {}; } catch { req.body = {}; }
    next();
  },
  handleMonnifyWebhook,
);

// General API rate limit
const apiLimiter = rateLimit({
  max: 300,
  windowMs: 60 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many requests, please try again later' },
});

// Stricter limit for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  max: 20,
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many auth attempts, please try again in 15 minutes' },
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply rate limiting to auth-sensitive routes
app.use('/api/v1/users/login', authLimiter);
app.use('/api/v1/users/register', authLimiter);
app.use('/api/v1/users/forgotPassword', authLimiter);
app.use('/api/v1/users/resetPassword', authLimiter);
// General limiter for the rest of the API
app.use('/api', apiLimiter);

app.use('/api/v1/giveaways', giveawayRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/helpers', helperRoutes);
app.use('/api/v1/verification', verificationRoutes);
app.use('/api/v1/escrow', escrowRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/portfolio', portfolioRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/notifications', notificationRoutes);

app.use(globalErrorHandler);

export default app;
