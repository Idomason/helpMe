import path from 'path';
import dotenv from 'dotenv';
import express from 'express';

import app from './app.js';
import { cloudinaryConfig } from './config/cloudinary.js';
import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoutes.js';

// Load all env variables into the app
dotenv.config();

// Handle uncaughtException
process.on('uncaughtException', err => {
  console.log('Uncaught Exception: Shutting down...');
  console.error(err.name, err.message);

  process.exit(1);
});

const port = process.env.PORT || 8000;

// Connect to cloudinary
cloudinaryConfig();

const __dirname = path.resolve();

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
  });
}

// Handle every unhandled rejections
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('Unhandled rejection: Shutting down...');

  // Close the server and exit node process
  server.close(() => {
    process.exit(1);
  });
});

// CONNECT TO DB
const server = app.listen(port, () => {
  console.log(`app running on port:${port}`);
  connectDB();
});
