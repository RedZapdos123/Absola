import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.BACKEND_PORT || '4000', 10),
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/absola',
  },
  ai: {
    baseUrl: process.env.AI_BASE_URL || 'http://localhost:5000',
  },
  storage: {
    root: process.env.STORAGE_ROOT || 'data',
    tmp: process.env.STORAGE_TMP || 'data/tmp',
    documents: process.env.STORAGE_DOCUMENTS || 'data/documents',
    uploads: process.env.STORAGE_UPLOADS || 'data/tmp/uploads',
  },
  limits: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFilesPerUpload: 1,
    queryRateLimit: 30, // per minute
  },
  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
