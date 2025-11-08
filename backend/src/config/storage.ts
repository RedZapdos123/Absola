import path from 'path';
import fs from 'fs';
import { config } from './env';

export const storage = {
  root: path.resolve(config.storage.root),
  tmp: path.resolve(config.storage.tmp),
  documents: path.resolve(config.storage.documents),
  uploads: path.resolve(config.storage.uploads),
};

// Ensure directories exist
Object.values(storage).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export function getDocumentPath(documentId: string): string {
  return path.join(storage.documents, documentId);
}

export function ensureDocumentDir(documentId: string): void {
  const dir = getDocumentPath(documentId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
