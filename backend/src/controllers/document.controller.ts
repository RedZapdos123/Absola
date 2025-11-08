import { Request, Response, NextFunction } from 'express';
import { documentService } from '../services/document.service';
import { ApiResponse } from '../types';
import { logger } from '../config/logger';

export class DocumentController {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json<ApiResponse>({
          ok: false,
          error: {
            code: 'NO_FILE',
            message: 'No file uploaded',
          },
        });
      }

      const doc = await documentService.createDocument(
        req.file.originalname,
        req.file.path
      );

      res.status(201).json<ApiResponse>({
        ok: true,
        data: { documentId: doc._id },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await documentService.getDocument(req.params.id);

      if (!doc) {
        return res.status(404).json<ApiResponse>({
          ok: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Document not found',
          },
        });
      }

      res.json<ApiResponse>({
        ok: true,
        data: {
          _id: doc._id,
          filename: doc.filename,
          status: doc.status,
          faissIndexPath: doc.faissIndexPath,
          summary: doc.summary,
          createdAt: doc.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const docs = await documentService.getAllDocuments();
      res.json<ApiResponse>({
        ok: true,
        data: {
          documents: docs.map((doc) => ({
            _id: doc._id,
            filename: doc.filename,
            status: doc.status,
            faissIndexPath: doc.faissIndexPath,
            createdAt: doc.createdAt,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await documentService.getSummary(req.params.id);

      res.json<ApiResponse>({
        ok: true,
        data: { summary },
      });
    } catch (error) {
      next(error);
    }
  }

  async query(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, userPrompt } = req.body;

      if (!query || typeof query !== 'string') {
        return res.status(400).json<ApiResponse>({
          ok: false,
          error: {
            code: 'INVALID_QUERY',
            message: 'Query string required',
          },
        });
      }

      const result = await documentService.query(req.params.id, query, userPrompt);

      res.json<ApiResponse>({
        ok: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getContext(req: Request, res: Response, next: NextFunction) {
    try {
      const { term } = req.query;

      if (!term || typeof term !== 'string') {
        return res.status(400).json<ApiResponse>({
          ok: false,
          error: {
            code: 'INVALID_TERM',
            message: 'Term query parameter required',
          },
        });
      }

      const explanation = await documentService.getContext(req.params.id, term);

      res.json<ApiResponse>({
        ok: true,
        data: { term, explanation },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await documentService.deleteDocument(req.params.id);

      if (!deleted) {
        return res.status(404).json<ApiResponse>({
          ok: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Document not found',
          },
        });
      }

      res.json<ApiResponse>({
        ok: true,
        data: { deleted: true },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const documentController = new DocumentController();
