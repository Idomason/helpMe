import app from './app.js';
import { connectDB } from './config/db.js';

// Handle uncaughtException
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception: Shutting down...');
  console.error(err.name, err.message);

  process.exit(1);
});

const port = process.env.PORT || 8000;

// CONNECT TO DB
const server = app.listen(port, () => {
  console.log(`app running on port:${port}`);
  connectDB();
});

// Handle every unhandled rejections
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled rejection: Shutting down...');

  // Close the server and exit node process
  server.close(() => {
    process.exit(1);
  });
});
