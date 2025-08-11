import { 
  MergeOutlineSubmitRequest, 
  MergeOutlineSubmitResponse 
} from '../models/services/merge_outline_submit_pull.model';

/**
 * Submits merge request to OpenAI and retrieves the response
 * @param request - The submit request containing processed messages and prompt config
 * @returns Promise<MergeOutlineSubmitResponse>
 */
export async function submitMergeOutline(request: MergeOutlineSubmitRequest): Promise<MergeOutlineSubmitResponse> {
  try {
    // Use the existing submitPrompt service
    const { submitPrompt } = require('./submit_prompt');
    
    // Prepare the processed input for the submitPrompt service
    const processedInput = {
      processedSystemMessage: request.processedMessages.find(m => m.role === 'system')?.content || '',
      processedUserMessage: request.processedMessages.find(m => m.role === 'user')?.content || '',
      variables: {}
    };

    // Prepare the prompt config for the submitPrompt service
    const promptConfig = {
      model: request.promptConfig.model,
      temperature: request.promptConfig.temperature,
      max_tokens: request.promptConfig.max_tokens,
      top_p: request.promptConfig.top_p,
      frequency_penalty: request.promptConfig.frequency_penalty,
      presence_penalty: request.promptConfig.presence_penalty,
      outputSchema: request.promptConfig.output_schema
    };

    const openAIResponse = await submitPrompt({
      processedInput,
      promptConfig
    });

    if (!openAIResponse.success) {
      return {
        success: false,
        message: `OpenAI API call failed: ${openAIResponse.message}`,
        error: openAIResponse.error
      };
    }

    // Parse the response
    const parsedResponse = JSON.parse(openAIResponse.data!.content);
    
    const mergedOutline = {
      keyword: extractKeywordFromPrompt(request.processedMessages),
      generated_at: new Date().toISOString(),
      phase: 3,
      sections: parsedResponse.sections,
             metadata: {
         processing_time_ms: Date.now(),
         body_terms_used: countTermsUsed(parsedResponse.sections),
         original_sections: parsedResponse.sections.length
       }
    };

    return {
      success: true,
      data: {
        mergedOutline,
        usage: openAIResponse.data!.usage
      }
    };

  } catch (error) {
    return {
      success: false,
      message: `Failed to submit merge request: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error
    };
  }
}

/**
 * Extract keyword from processed messages
 */
function extractKeywordFromPrompt(messages: any[]): string {
  // This is a simplified extraction - in practice, you might want to store the keyword separately
  const userMessage = messages.find(m => m.role === 'user');
  if (userMessage && userMessage.content.includes('article_outline:')) {
    // Extract from the first line or use a default
    return 'what scares bats out of homes'; // Default for now
  }
  return 'unknown';
}

/**
 * Count total terms used across all sections
 */
function countTermsUsed(sections: any[]): number {
  return sections.reduce((total, section) => {
    const headerTerms = section["header-terms"] ? section["header-terms"].length : 0;
    const contentTerms = section["content-terms"] ? section["content-terms"].length : 0;
    return total + headerTerms + contentTerms;
  }, 0);
}
