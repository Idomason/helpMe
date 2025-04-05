import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import cors from 'cors';

import AppError from './utils/appError.js';
import giveawayRoutes from './routes/giveawayRoutes.js';
import userRoutes from './routes/userRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import { globalErrorHandler } from './controllers/errorController.js';

const app = express();

// Allow cross-origin requests from client (react app)
app.use(cors());

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this user, please try again in an hour',
});
// app.use('/api', limiter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS attacks
app.use(xss());

// Prevent parameter pollution
app.use(hpp({ whitelist: ['duration', 'difficulty'] }));

//Body Parser, Parse request data to req.body
app.use(express.json({ limit: '50mb' }));

// Serving static files
// app.use(express.static(`${__dirname}/public`));

// to parse form data
app.use(express.urlencoded({ extended: true }));

// to get cookie
app.use(cookieParser());

// API ROUTES
// app.use('/api/v1/auth', authRoutes);

app.use('/api/v1/giveaways', giveawayRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/requests', requestRoutes);
// app.use("/api/v1/notifications", notificationRoutes);
// app.use("/api/v1/messages", messageRoutes);

app.use(globalErrorHandler);

export default app;
