export interface Phase2Outline {
  keyword: string;
  generated_at: string;
  phase: number;
  outline: {
    sections: ArticleSection[];
  };
  metadata: {
    processing_time_ms: number;
    token_usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    term_matches: number;
  };
}

export interface ArticleSection {
  header: string;
  description: string;
}

export interface BodyTermsData {
  basic: BodyTerm[];
  extended: BodyTerm[];
}

export interface BodyTerm {
  term: string;
  usage_percentage: number;
  suggested_usage: [number, number];
}

export interface MergeOutlineRequest {
  keyword: string;
  phase2OutlineFile?: string;
  optimizationTermsFile?: string;
}

export interface MergeOutlineResponse {
  success: boolean;
  data?: {
    mergedOutline: MergedOutline;
    processing_time: number;
  };
  message?: string;
  error?: any;
}

export interface MergedOutline {
  keyword: string;
  generated_at: string;
  phase: number;
  sections: MergedSection[];
  metadata: {
    processing_time_ms: number;
    body_terms_used: number;
    original_sections: number;
  };
}

export interface MergedSection {
  headline: string;
  description: string;
  "header-terms": string[];
  "content-terms": string[];
}
