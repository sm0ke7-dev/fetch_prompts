export interface LoopThruSectionsRequest {
  keyword: string;
  phase3OutlineFile?: string;
}

export interface LoopThruSectionsResponse {
  success: boolean;
  data?: {
    phase4Article: Phase4ArticleData;
    processing_time: number;
  };
  message?: string;
  error?: any;
}

export interface Phase4ArticleData {
  keyword: string;
  generated_at: string;
  phase: number;
  sections: Phase4SectionData[];
  metadata: {
    processing_time_ms: number;
    total_sections: number;
    total_word_count: number;
    total_content_blocks: number;
  };
}

export interface Phase4SectionData {
  headline: string;
  description: string;
  "header-terms": string[];
  "content-terms": string[];
  content: SectionContentData;
  metadata: {
    processing_time_ms: number;
    token_usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

export interface LoopContentBlock {
  type: 'paragraph' | 'ordered-list' | 'unordered-list' | 'headline-3';
  content: string | string[];
}

export interface SectionContentData {
  headline: string;
  content: LoopContentBlock[];
}

export interface ProcessSectionInputRequest {
  headline: string;
  description: string;
  headerTerms: string[];
  contentTerms: string[];
}

export interface ProcessSectionInputResponse {
  success: boolean;
  data?: {
    processedMessages: LoopProcessedMessage[];
    promptConfig: LoopPromptConfig;
  };
  message?: string;
  error?: any;
}

export interface LoopProcessedMessage {
  role: 'system' | 'user';
  content: string;
}

export interface LoopPromptConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  output_schema: LoopOutputSchema;
}

export interface LoopOutputSchema {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: {
      section_content: {
        type: string;
        properties: {
          introduction: {
            type: string;
            description: string;
          };
          body_paragraphs: {
            type: string;
            items: {
              type: string;
            };
            description: string;
          };
          conclusion: {
            type: string;
            description: string;
          };
          terms_used: {
            type: string;
            items: {
              type: string;
            };
            description: string;
          };
          word_count: {
            type: string;
            description: string;
          };
        };
        required: string[];
      };
    };
    required: string[];
  };
}

export interface SubmitSectionRequest {
  processedMessages: LoopProcessedMessage[];
  promptConfig: LoopPromptConfig;
}

export interface SubmitSectionResponse {
  success: boolean;
  data?: {
    sectionContent: SectionContentData;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  message?: string;
  error?: any;
}
