import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';
import { logger } from '../config/logger';
import {
  IngestResponse,
  SummaryResponse,
  QueryResponse,
  ScrapeResponse,
} from '../types';

class AIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.ai.baseUrl,
      timeout: 120000, // 2 minutes for long operations
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async ingest(filepath: string): Promise<IngestResponse> {
    try {
      logger.info({ filepath }, 'AI: Ingesting document');
      const response = await this.client.post<IngestResponse>('/ingest', {
        filepath,
      });
      logger.info({ result: response.data }, 'AI: Ingest complete');
      return response.data;
    } catch (error) {
      logger.error({ error }, 'AI: Ingest failed');
      throw new Error('Failed to ingest document');
    }
  }

  async summarize(text: string): Promise<SummaryResponse> {
    try {
      logger.info('AI: Generating summary');
      const response = await this.client.post<SummaryResponse>('/summarize', {
        text,
      });
      logger.info('AI: Summary complete');
      return response.data;
    } catch (error) {
      logger.error({ error }, 'AI: Summarization failed');
      throw new Error('Failed to generate summary');
    }
  }

  async query(
    faissIndexPath: string,
    query: string,
    userPrompt?: string
  ): Promise<QueryResponse> {
    try {
      logger.info({ query, hasUserPrompt: !!userPrompt }, 'AI: Processing query');
      const response = await this.client.post<QueryResponse>('/query', {
        query,
        faissIndexPath,
        userPrompt,
      });
      logger.info('AI: Query complete');
      return response.data;
    } catch (error) {
      logger.error({ error }, 'AI: Query failed');
      throw new Error('Failed to process query');
    }
  }

  async scrape(term: string): Promise<ScrapeResponse> {
    try {
      logger.info({ term }, 'AI: Scraping context');
      const response = await this.client.post<ScrapeResponse>('/scrape', {
        term,
      });
      logger.info('AI: Scrape complete');
      return response.data;
    } catch (error) {
      logger.error({ error }, 'AI: Scrape failed');
      throw new Error('Failed to scrape context');
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export const aiClient = new AIClient();
