import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IMessage {
  role: 'user' | 'ai';
  content: string;
  source_chunks?: string[];
}

export interface IConversation extends MongooseDocument {
  documentId: mongoose.Types.ObjectId;
  messages: IMessage[];
  createdAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    messages: [
      {
        role: { type: String, enum: ['user', 'ai'], required: true },
        content: { type: String, required: true },
        source_chunks: [{ type: String }],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Conversation = mongoose.model<IConversation>(
  'Conversation',
  ConversationSchema
);
