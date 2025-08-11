import { 
  ProcessedMessage, 
  MergePromptConfig, 
  OutputSchema, 
  MergedOutlineData, 
  MergedSectionData 
} from './merge_outline_with_nw_terms.model';

export interface MergeOutlineSubmitRequest {
  processedMessages: ProcessedMessage[];
  promptConfig: MergePromptConfig;
}

export interface MergeOutlineSubmitResponse {
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
