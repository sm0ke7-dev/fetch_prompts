// Interface for user input data
export interface UserInput {
  [key: string]: string | number | boolean;
}

// Interface for the process input request
export interface ProcessInputRequest {
  userInput: UserInput;
  promptName: string;
}

// Interface for the processed input result
export interface ProcessedInput {
  processedUserMessage: string;
  processedSystemMessage: string;
  variables: Record<string, string>;
}

// Interface for the process input response
export interface ProcessInputResponse {
  success: boolean;
  data: ProcessedInput | null;
  message: string;
}
