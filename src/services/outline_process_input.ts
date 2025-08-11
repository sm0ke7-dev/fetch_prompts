import { 
  OutlineUserInput, 
  OutlineProcessInputRequest, 
  OutlineProcessedInput, 
  OutlineProcessInputResponse 
} from '../models/services/outline_process_input.model';
import { fetchPromptByName } from '../repositories/fetch_prompt';
import { loadOptimizationTerms, formatHeadingTermsForPrompt } from '../repositories/create_outline_from_terms';

/**
 * Processes user inputs for outline creation and substitutes variables in prompt messages
 * This loads optimization terms and formats them for the OpenAI prompt
 * @param request - The outline process input request containing user input and prompt name
 * @returns Promise<OutlineProcessInputResponse>
 */
export async function processOutlineInputs(request: OutlineProcessInputRequest): Promise<OutlineProcessInputResponse> {
  try {
    const { userInput, promptName } = request;

    // Step 1: Fetch the prompt configuration
    const promptResult = await fetchPromptByName(promptName);
    
    if (!promptResult.success || !promptResult.data) {
      return {
        success: false,
        data: null,
        message: `Failed to fetch prompt configuration: ${promptResult.message}`
      };
    }

    const promptConfig = promptResult.data;

    // Step 2: Load optimization terms for the keyword
    const termsResult = await loadOptimizationTerms(
      userInput.keyword, 
      userInput.optimization_terms_file
    );
    
    if (!termsResult.success || !termsResult.data) {
      return {
        success: false,
        data: null,
        message: `Failed to load optimization terms: ${termsResult.message}`
      };
    }

    // Step 3: Format heading terms for the prompt
    const formattedHeadingTerms = formatHeadingTermsForPrompt(termsResult.data);

    // Step 4: Create the substitution variables
    const substitutionData = {
      keyword: userInput.keyword,
      heading_terms: formattedHeadingTerms
    };

    // Step 5: Process the system message
    let processedSystemMessage = promptConfig.system;
    for (const [key, value] of Object.entries(substitutionData)) {
      const placeholder = `{{${key}}}`;
      processedSystemMessage = processedSystemMessage.replace(
        new RegExp(placeholder, 'g'), 
        String(value)
      );
    }

    // Step 6: Process the user message
    let processedUserMessage = promptConfig.user;
    for (const [key, value] of Object.entries(substitutionData)) {
      const placeholder = `{{${key}}}`;
      processedUserMessage = processedUserMessage.replace(
        new RegExp(placeholder, 'g'), 
        String(value)
      );
    }

    // Step 7: Convert to string format for variables
    const variables: Record<string, string> = {};
    for (const [key, value] of Object.entries(substitutionData)) {
      variables[key] = String(value);
    }

    const processedInput: OutlineProcessedInput = {
      processedUserMessage,
      processedSystemMessage,
      variables
    };

    return {
      success: true,
      data: processedInput,
      message: `Outline input processing completed successfully for "${userInput.keyword}"`
    };

  } catch (error) {
    console.error('Error processing outline inputs:', error);
    return {
      success: false,
      data: null,
      message: 'An error occurred while processing outline inputs'
    };
  }
}
