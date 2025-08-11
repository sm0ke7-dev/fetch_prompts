// Models for Phase 2: Outline Submit and Retrieve Output

export interface OutlineSubmitRequest {
  processedInput: OutlineProcessedInputData;
  promptConfig: OutlinePromptConfig;
}

export interface OutlineProcessedInputData {
  processedUserMessage: string;
  processedSystemMessage: string;
  variables: Record<string, string>;
}

export interface OutlinePromptConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  system: string;
  user: string;
  variables: Record<string, string>;
  'output-schema'?: OutlineOutputSchema;
}

export interface OutlineOutputSchema {
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
            header: {
              type: string;
              description: string;
            };
            description: {
              type: string;
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

// OpenAI API interfaces for outline generation
export interface OutlineOpenAIRequest {
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  functions?: OutlineFunction[];
  function_call?: { name: string };
}

export interface OutlineFunction {
  name: string;
  description: string;
  parameters: any;
}

export interface OutlineOpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content?: string;
      function_call?: {
        name: string;
        arguments: string;
      };
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OutlineSubmitResponse {
  success: boolean;
  data?: {
    content: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  message: string;
}

// Parsed outline structure
export interface ArticleSection {
  header: string;
  description: string;
}

export interface ArticleOutline {
  sections: ArticleSection[];
}

export interface GenerateOutlineRequest {
  keyword: string;
  optimization_terms_file?: string;
}

export interface GenerateOutlineResponse {
  success: boolean;
  data?: {
    outline: ArticleOutline;
    keyword: string;
    query_id?: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    processing_time: number;
  };
  error?: string;
  message: string;
}
