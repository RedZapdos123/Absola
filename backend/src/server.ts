import mongoose from 'mongoose';
import app from './app';
import { config } from './config/env';
import { logger } from './config/logger';

async function start() {
  try {
    // Connect to MongoDB (optional)
    try {
      await mongoose.connect(config.mongodb.uri);
      logger.info('Connected to MongoDB');
    } catch (dbError) {
      logger.warn({ dbError }, 'MongoDB connection failed, continuing without database');
    }

    // Start server
    app.listen(config.port, () => {
      logger.info(`Backend server running on port ${config.port}`);
      logger.info(`Environment: ${config.env}`);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Handle shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await mongoose.disconnect();
  process.exit(0);
});

start();
