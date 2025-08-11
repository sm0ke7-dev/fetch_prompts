export interface Phase3MergedOutline {
  keyword: string;
  generated_at: string;
  phase: number;
  sections: Phase3Section[];
  metadata: {
    processing_time_ms: number;
    body_terms_used: number;
    original_sections: number;
  };
}

export interface Phase3Section {
  headline: string;
  description: string;
  "header-terms": string[];
  "content-terms": string[];
}

export interface ContentBlock {
  type: 'paragraph' | 'ordered-list' | 'unordered-list' | 'headline-3';
  content: string | string[];
}

export interface SectionContent {
  headline: string;
  content: ContentBlock[];
}

export interface Phase4Section {
  headline: string;
  description: string;
  "header-terms": string[];
  "content-terms": string[];
  content: SectionContent;
  metadata: {
    processing_time_ms: number;
    token_usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

export interface Phase4Article {
  keyword: string;
  generated_at: string;
  phase: number;
  sections: Phase4Section[];
  metadata: {
    processing_time_ms: number;
    total_sections: number;
    total_word_count: number;
    total_content_blocks: number;
  };
}

export interface LoopSectionsRequest {
  keyword: string;
  phase3OutlineFile?: string;
}

export interface LoopSectionsResponse {
  success: boolean;
  data?: {
    phase4Article: Phase4Article;
    processing_time: number;
  };
  message?: string;
  error?: any;
}
