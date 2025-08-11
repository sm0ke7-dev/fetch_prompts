// Models for Phase 2: Article Outline Creation

export interface OutlineUserInput {
  keyword: string;
  optimization_terms_file?: string; // Optional: defaults to keyword-based filename
}

export interface OutlineProcessInputRequest {
  userInput: OutlineUserInput;
  promptName: string;
}

export interface OutlineProcessedInput {
  processedUserMessage: string;
  processedSystemMessage: string;
  variables: Record<string, string>;
}

export interface OutlineProcessInputResponse {
  success: boolean;
  data: OutlineProcessedInput | null;
  message: string;
}

// Interface for the optimization terms data we'll load
export interface OptimizationTermsData {
  keyword: string;
  query_id: string;
  query_url: string;
  generated_at: string;
  headings: {
    h1: Array<{ term: string; usage_percentage: number }>;
    h2: Array<{ term: string; usage_percentage: number }>;
    h3: Array<{ term: string; usage_percentage: number }>;
  };
  body_terms: {
    basic: Array<{ term: string; usage_percentage: number }>;
    extended: Array<{ term: string; usage_percentage: number }>;
  };
  entities: Array<{
    term: string;
    importance: number;
    relevance: number;
    confidence: number;
  }>;
  questions: {
    suggested: string[];
    paa: string[];
    content: string[];
  };
}
