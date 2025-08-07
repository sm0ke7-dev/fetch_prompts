// Interface defining the structure of a prompt configuration
export interface PromptConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  system: string;
  user: string;
  variables: Record<string, string>;
  "output-schema": {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, any>;
      required: string[];
    };
  };
}

// Interface for the response when fetching a prompt
export interface PromptResponse {
  success: boolean;
  data: PromptConfig | null;
  message: string;
}

// Interface for error responses
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}
