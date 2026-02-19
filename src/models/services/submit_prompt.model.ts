// Interface for OpenAI API request
export interface OpenAIRequest {
  model: string;
  temperature?: number;
  max_completion_tokens: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: {
        type: string;
        properties: Record<string, any>;
        required: string[];
      };
    };
  }>;
  tool_choice?: 'auto' | 'none' | 'required' | { type: 'function'; function: { name: string } };
}

// Interface for OpenAI API response
export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Interface for the submit prompt request
export interface SubmitPromptRequest {
  processedInput: {
    processedUserMessage: string;
    processedSystemMessage: string;
    variables: Record<string, string>;
  };
  promptConfig: {
    model: string;
    temperature: number;
    max_tokens: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
    outputSchema?: {
      name: string;
      description: string;
      parameters: {
        type: string;
        properties: Record<string, any>;
        required: string[];
      };
    };
  };
}

// Interface for the submit prompt response
export interface SubmitPromptResponse {
  success: boolean;
  data: {
    content: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  } | null;
  message: string;
}
