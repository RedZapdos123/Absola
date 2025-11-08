import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Document, IDocument } from '../models/Document';
import { aiClient } from './aiClient';
import { ensureDocumentDir, getDocumentPath, storage } from '../config/storage';
import { logger } from '../config/logger';

export class DocumentService {
  async createDocument(
    filename: string,
    tempPath: string
  ): Promise<IDocument> {
    const documentId = uuidv4();
    ensureDocumentDir(documentId);

    const finalPath = path.join(
      getDocumentPath(documentId),
      'original' + path.extname(filename)
    );

    // Move file from temp to permanent storage
    await fs.rename(tempPath, finalPath);

    const doc = new Document({
      filename,
      localFilepath: finalPath,
      status: 'processing',
    });

    await doc.save();
    logger.info({ documentId: doc._id }, 'Document created');

    // Trigger ingestion asynchronously
    this.ingestDocument(doc._id.toString(), finalPath).catch((error) => {
      logger.error({ error, documentId: doc._id }, 'Ingestion failed');
    });

    return doc;
  }

  async getDocument(id: string): Promise<IDocument | null> {
    return Document.findById(id);
  }

  async getAllDocuments(): Promise<IDocument[]> {
    return Document.find().sort({ createdAt: -1 });
  }

  async deleteDocument(id: string): Promise<boolean> {
    const doc = await Document.findById(id);
    if (!doc) return false;

    // Delete document directory
    const docPath = getDocumentPath(id);
    await fs.rm(docPath, { recursive: true, force: true });

    // Delete FAISS index if exists
    if (doc.faissIndexPath) {
      await fs.rm(doc.faissIndexPath, { recursive: true, force: true });
    }

    await Document.findByIdAndDelete(id);
    logger.info({ documentId: id }, 'Document deleted');
    return true;
  }

  private async ingestDocument(
    documentId: string,
    filepath: string
  ): Promise<void> {
    try {
      logger.info({ documentId }, 'Starting document ingestion');

      const result = await aiClient.ingest(filepath);

      await Document.findByIdAndUpdate(documentId, {
        status: 'ready',
        faissIndexPath: result.faissIndexPath,
      });

      logger.info({ documentId, chunks: result.chunks }, 'Ingestion complete');
    } catch (error) {
      logger.error({ error, documentId }, 'Ingestion error');
      await Document.findByIdAndUpdate(documentId, { status: 'error' });
      throw error;
    }
  }

  async getSummary(id: string): Promise<string> {
    const doc = await Document.findById(id);
    if (!doc) throw new Error('Document not found');

    if (doc.status !== 'ready') {
      throw new Error(`Document not ready (status: ${doc.status})`);
    }

    // Return cached summary if available
    if (doc.summary) {
      return doc.summary;
    }

    // Generate summary
    const fileContent = await fs.readFile(doc.localFilepath, 'utf-8');
    const result = await aiClient.summarize(fileContent);

    // Cache summary
    doc.summary = result.summary;
    await doc.save();

    return result.summary;
  }

  async query(id: string, query: string, userPrompt?: string): Promise<{ answer: string; sources: string[] }> {
    const doc = await Document.findById(id);
    if (!doc) throw new Error('Document not found');

    if (doc.status !== 'ready' || !doc.faissIndexPath) {
      throw new Error('Document not indexed');
    }

    return aiClient.query(doc.faissIndexPath, query, userPrompt);
  }

  async getContext(id: string, term: string): Promise<string> {
    const doc = await Document.findById(id);
    if (!doc) throw new Error('Document not found');

    const result = await aiClient.scrape(term);
    return result.explanation;
  }
}

export const documentService = new DocumentService();
