import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { aiClient } from '../services/aiClient';
import { ApiResponse } from '../types';

export class HealthController {
  async getHealth(req: Request, res: Response) {
    const mongoConnected = mongoose.connection.readyState === 1;
    // AI service may be optional for local UI checks — don't block health entirely on AI availability.
    let aiServiceReachable = false;
    try {
      aiServiceReachable = await aiClient.healthCheck();
    } catch (err) {
      aiServiceReachable = false;
    }

    // Consider the backend healthy if MongoDB is connected. AI services are reported but don't block the basic health.
    const healthy = mongoConnected;

    res.status(healthy ? 200 : 503).json({
      ok: healthy,
      data: {
        service: 'backend',
        mongoConnected,
        aiServiceReachable,
        uptime: process.uptime(),
      },
    } as ApiResponse);
  }
}

export const healthController = new HealthController();
