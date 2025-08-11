// NeuronWriter API Models for Optimization Terms

export interface NeuronWriterProject {
  project: string;
  name: string;
  language: string;
  engine: string;
}

export interface CreateQueryRequest {
  project: string;
  keyword: string;
  engine: string;
  language: string;
}

export interface CreateQueryResponse {
  query: string;
  query_url: string;
  share_url: string;
  readonly_url: string;
}

export interface GetQueryRequest {
  query: string;
}

export interface OptimizationTerms {
  // Header terms (main optimization terms)
  header_terms: string[];
  
  // Body terms (secondary optimization terms)
  body_terms: string[];
  
  // Entities (important concepts)
  entities: string[];
  
  // Suggested questions
  suggested_questions: string[];
  
  // PAA (People Also Ask) questions
  paa_questions: string[];
  
  // Content questions
  content_questions: string[];
  
  // Competitors
  competitors: Array<{
    url: string;
    title: string;
    content_score: number;
  }>;
}

export interface GetQueryResponse {
  status: 'not found' | 'waiting' | 'in progress' | 'ready';
  metrics?: {
    word_count: {
      median: number;
      target: number;
    };
    readability: {
      median: number;
      target: number;
    };
  };
  // When status is 'ready', these fields are available
  header_terms?: string[];
  body_terms?: string[];
  entities?: string[];
  suggested_questions?: string[];
  paa_questions?: string[];
  content_questions?: string[];
  competitors?: Array<{
    url: string;
    title: string;
    content_score: number;
  }>;
}

export interface GetOptimizationTermsRequest {
  keyword: string;
  projectId: string;
  engine?: string;
  language?: string;
}

export interface GetOptimizationTermsResponse {
  success: boolean;
  data?: {
    query_id: string;
    optimization_terms: OptimizationTerms;
    query_url: string;
    processing_time?: number;
  };
  error?: string;
  message: string;
}

export interface NeuronWriterApiConfig {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
}
