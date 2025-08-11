export interface MergeOutlineWithNWTermsRequest {
  keyword: string;
  phase2OutlineFile?: string;
  optimizationTermsFile?: string;
}

export interface MergeOutlineWithNWTermsResponse {
  success: boolean;
  data?: {
    mergedOutline: MergedOutlineData;
    processing_time: number;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  message?: string;
  error?: any;
}

export interface MergedOutlineData {
  keyword: string;
  generated_at: string;
  phase: number;
  sections: MergedSectionData[];
  metadata: {
    processing_time_ms: number;
    body_terms_used: number;
    original_sections: number;
  };
}

export interface MergedSectionData {
  headline: string;
  description: string;
  "header-terms": string[];
  "content-terms": string[];
}

export interface ProcessMergeInputRequest {
  keyword: string;
  articleOutline: string;
  bodyTerms: string;
}

export interface ProcessMergeInputResponse {
  success: boolean;
  data?: {
    processedMessages: ProcessedMessage[];
    promptConfig: MergePromptConfig;
  };
  message?: string;
  error?: any;
}

export interface ProcessedMessage {
  role: 'system' | 'user';
  content: string;
}

export interface MergePromptConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  output_schema: OutputSchema;
}

export interface OutputSchema {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: {
      sections: {
        type: string;
        items: {
          type: string;
          properties: {
            headline: {
              type: string;
              description: string;
            };
            description: {
              type: string;
              description: string;
            };
            "header-terms": {
              type: string;
              items: {
                type: string;
              };
              description: string;
            };
            "content-terms": {
              type: string;
              items: {
                type: string;
              };
              description: string;
            };
          };
          required: string[];
        };
        description: string;
      };
    };
    required: string[];
  };
}

export interface SubmitMergeRequest {
  processedMessages: ProcessedMessage[];
  promptConfig: MergePromptConfig;
}

export interface SubmitMergeResponse {
  success: boolean;
  data?: {
    mergedOutline: MergedOutlineData;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  message?: string;
  error?: any;
}
