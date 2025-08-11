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

// Structured term interfaces for consistent output
export interface StructuredTerm {
  term: string;
  usage_percentage: number;
  suggested_usage?: [number, number]; // [min, max] usage range
}

export interface StructuredHeadingTerms {
  h1: StructuredTerm[];
  h2: StructuredTerm[];
  h3: StructuredTerm[];
}

export interface StructuredBodyTerms {
  basic: StructuredTerm[];
  extended: StructuredTerm[];
}

// Updated OptimizationTerms with structured format
export interface OptimizationTerms {
  // Structured heading terms with usage data
  headings: StructuredHeadingTerms;
  
  // Structured body terms with usage data
  body_terms: StructuredBodyTerms;
  
  // Entities (important concepts)
  entities: Array<{
    term: string;
    importance: number;
    relevance: number;
    confidence: number;
    links?: Array<[string, string]>;
  }>;
  
  // Questions
  suggested_questions: string[];
  paa_questions: string[];
  content_questions: string[];
  
  // Competitors
  competitors: Array<{
    rank: number;
    url: string;
    title: string;
    desc: string;
    headers: Array<[string, string]>;
    content_score: number;
    readability: number;
    word_count: number;
    content_len: number;
  }>;
}

// Updated GetQueryResponse to match actual NeuronWriter response
export interface GetQueryResponse {
  status: 'not found' | 'waiting' | 'in progress' | 'ready';
  keyword?: string;
  language?: string;
  engine?: string;
  project?: string;
  query?: string;
  query_url?: string;
  share_url?: string;
  readonly_url?: string;
  
  // Metrics
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
  
  // Terms data (when status is 'ready')
  terms?: {
    title?: Array<{ t: string; usage_pc: number }>;
    desc?: Array<{ t: string; usage_pc: number }>;
    h1?: Array<{ t: string; usage_pc: number }>;
    h2?: Array<{ t: string; usage_pc: number }>;
    h3?: Array<{ t: string; usage_pc: number }>;
    content_basic?: Array<{ t: string; usage_pc: number; sugg_usage?: [number, number] }>;
    content_extended?: Array<{ t: string; usage_pc: number; sugg_usage?: [number, number] }>;
    entities?: Array<{
      t: string;
      importance: number;
      relevance: number;
      confidence: number;
      links?: Array<[string, string]>;
    }>;
  };
  
  // Terms text data (easier to parse)
  terms_txt?: {
    title?: string;
    desc_title?: string;
    h1?: string;
    h2?: string;
    h3?: string;
    content_basic?: string;
    content_basic_w_ranges?: string;
    content_extended?: string;
    content_extended_w_ranges?: string;
    entities?: string;
  };
  
  // Ideas/questions
  ideas?: {
    suggest_questions?: Array<{ q: string }>;
    people_also_ask?: Array<{ q: string }>;
    content_questions?: Array<{ q: string }>;
  };
  
  // Competitors
  competitors?: Array<{
    rank: number;
    url: string;
    title: string;
    desc: string;
    headers: Array<[string, string]>;
    content_score: number;
    readability: number;
    word_count: number;
    content_len: number;
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
