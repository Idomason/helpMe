import AppError from '../utils/appError.js';

const handleErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldErrorDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Unauthorized: Invalid token, please login again', 401);

const handleTokenExpiredError = () =>
  new AppError('Unauthorized: Token expired, please login again', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //  Operational, trusted error: send friendly message to the client
  if (err.isOperational) {
    res
      .status(err.statusCode)
      .json({ status: err.status, message: err.message });

    //  Programming or other unknown error: send generic message to client so as to not leak error details
  } else {
    // 1.) Log error to console
    console.error(`Error: ${err}`);

    // 2.) Send generic message to the client
    res.status(500).json({ status: 'error', message: 'Something went wrong!' });
  }
};

export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    const error = { ...err };

    if (error.name === 'CastError') error = handleErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldErrorDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError')
      error = handleTokenExpiredError(error);

    sendErrorProd(error, res);
  }
};
