export interface DocumentRecord {
  _id: string;
  filename: string;
  localFilepath: string;
  status: 'processing' | 'ready' | 'error';
  faissIndexPath?: string;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  source_chunks?: string[];
}

export interface ConversationRecord {
  _id: string;
  documentId: string;
  messages: ChatMessage[];
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    retryable?: boolean;
  };
}

export interface IngestResponse {
  faissIndexPath: string;
  chunks: number;
}

export interface SummaryResponse {
  summary: string;
}

export interface QueryResponse {
  answer: string;
  sources: string[];
}

export interface ScrapeResponse {
  explanation: string;
  provider?: string;
}
