import app from './app.js';

import path from 'path';
import dotenv from 'dotenv';
import express from 'express';

import { cloudinaryConfig } from './config/cloudinary.js';
import { connectDB } from './config/db.js';

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

// allow the app to load images from cloudinary (external image sources)
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "img-src 'self' data: https://res.cloudinary.com https://*.cloudinary.com;",
  );
  next();
});

const __dirname = path.resolve();

// Serve static files from the React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/client/dist')));

  // For any routes not found by the API, return the React app
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
