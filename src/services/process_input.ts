import { 
  UserInput, 
  ProcessInputRequest, 
  ProcessedInput, 
  ProcessInputResponse 
} from '../models/services/process_input.model';
import { fetchPromptByName } from '../repositories/fetch_prompt';

/**
 * Processes user inputs and substitutes variables in prompt messages
 * @param request - The process input request containing user input and prompt name
 * @returns Promise<ProcessInputResponse>
 */
export async function processInputs(request: ProcessInputRequest): Promise<ProcessInputResponse> {
  try {
    const { userInput, promptName } = request;

    // Fetch the prompt configuration
    const promptResult = await fetchPromptByName(promptName);
    
    if (!promptResult.success || !promptResult.data) {
      return {
        success: false,
        data: null,
        message: `Failed to fetch prompt configuration: ${promptResult.message}`
      };
    }

    const promptConfig = promptResult.data;

    // Process the system message
    let processedSystemMessage = promptConfig.system;
    for (const [key, value] of Object.entries(userInput)) {
      const placeholder = `{{${key}}}`;
      processedSystemMessage = processedSystemMessage.replace(
        new RegExp(placeholder, 'g'), 
        String(value)
      );
    }

    // Process the user message
    let processedUserMessage = promptConfig.user;
    for (const [key, value] of Object.entries(userInput)) {
      const placeholder = `{{${key}}}`;
      processedUserMessage = processedUserMessage.replace(
        new RegExp(placeholder, 'g'), 
        String(value)
      );
    }

    // Convert userInput to string format for variables
    const variables: Record<string, string> = {};
    for (const [key, value] of Object.entries(userInput)) {
      variables[key] = String(value);
    }

    const processedInput: ProcessedInput = {
      processedUserMessage,
      processedSystemMessage,
      variables
    };

    return {
      success: true,
      data: processedInput,
      message: 'Input processing completed successfully'
    };

  } catch (error) {
    console.error('Error processing inputs:', error);
    return {
      success: false,
      data: null,
      message: 'An error occurred while processing inputs'
    };
  }
}
