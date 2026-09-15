import 'dotenv/config';
import app from './app.js';
import path from 'path';
import express from 'express';
import { runPaymentJobs } from './jobs/paymentJobs.js';

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception: Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

const port = process.env.PORT || 8000;

const __dirname = path.resolve();

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
  });
}

const server = app.listen(port, () => {
  console.log(`app running on port:${port}`);
});

const paymentJobTimer = setInterval(runPaymentJobs, 60_000);
paymentJobTimer.unref();
runPaymentJobs();

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled rejection: Shutting down...');
  server.close(() => process.exit(1));
});
