import { 
  SubmitPromptRequest, 
  SubmitPromptResponse,
  OpenAIRequest,
  OpenAIResponse
} from '../models/services/submit_prompt.model';

/**
 * Submits a processed prompt to OpenAI API and returns the response
 * @param request - The submit prompt request containing processed input and prompt config
 * @returns Promise<SubmitPromptResponse>
 */
export async function submitPrompt(request: SubmitPromptRequest): Promise<SubmitPromptResponse> {
  try {
    const { processedInput, promptConfig } = request;
    
    // Get OpenAI API key from environment
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return {
        success: false,
        data: null,
        message: 'OpenAI API key not found in environment variables'
      };
    }

    // Prepare the OpenAI API request
    const openaiRequest: OpenAIRequest = {
      model: promptConfig.model,
      temperature: promptConfig.temperature,
      max_tokens: promptConfig.max_tokens,
      top_p: promptConfig.top_p,
      frequency_penalty: promptConfig.frequency_penalty,
      presence_penalty: promptConfig.presence_penalty,
      messages: [
        {
          role: 'system',
          content: processedInput.processedSystemMessage
        },
        {
          role: 'user',
          content: processedInput.processedUserMessage
        }
      ]
    };

    // Add output schema if provided
    if (promptConfig.outputSchema) {
      openaiRequest.functions = [promptConfig.outputSchema];
      openaiRequest.function_call = { name: promptConfig.outputSchema.name };
    }

    // Make the API call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify(openaiRequest)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return {
        success: false,
        data: null,
        message: `OpenAI API error: ${response.status} ${response.statusText}`
      };
    }

    const openaiResponse = await response.json() as OpenAIResponse;

    // Extract the content from the first choice
    const choice = openaiResponse.choices[0];
    let content = choice?.message?.content;
    
    // If using functions, the content might be in function_call
    if (!content && choice?.message?.function_call) {
      content = choice.message.function_call.arguments;
    }
    
    if (!content) {
      return {
        success: false,
        data: null,
        message: 'No content received from OpenAI API'
      };
    }

    return {
      success: true,
      data: {
        content,
        usage: openaiResponse.usage
      },
      message: 'Prompt submitted successfully'
    };

  } catch (error) {
    console.error('Error submitting prompt:', error);
    return {
      success: false,
      data: null,
      message: 'An error occurred while submitting the prompt'
    };
  }
}
