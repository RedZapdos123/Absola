import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
  filename: string;
  localFilepath: string;
  status: 'processing' | 'ready' | 'error';
  faissIndexPath?: string;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    filename: { type: String, required: true },
    localFilepath: { type: String, required: true },
    status: {
      type: String,
      enum: ['processing', 'ready', 'error'],
      default: 'processing',
    },
    faissIndexPath: { type: String },
    summary: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Document = mongoose.model<IDocument>('Document', DocumentSchema);
