import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import documentRoutes from './routes/document.routes';
import healthRoutes from './routes/health.routes';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Rate limiting for query endpoint
const queryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: 'Too many requests, please try again later',
});

// Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/document', documentRoutes);
app.post('/api/v1/document/:id/query', queryLimiter);

// Error handling
app.use(errorHandler);

export default app;
