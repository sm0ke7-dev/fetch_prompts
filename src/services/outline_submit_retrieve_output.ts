import { 
  OutlineSubmitRequest,
  OutlineSubmitResponse,
  OutlineOpenAIRequest,
  OutlineOpenAIResponse,
  GenerateOutlineRequest,
  GenerateOutlineResponse,
  ArticleOutline,
  OutlinePromptConfig,
  OutlineProcessedInputData
} from '../models/services/outline_submit_retrieve_output.models';
import { processOutlineInputs } from './outline_process_input';
import { fetchPromptByName } from '../repositories/fetch_prompt';

/**
 * Submits a processed outline prompt to OpenAI API and returns the response
 * @param request - The submit outline request containing processed input and prompt config
 * @returns Promise<OutlineSubmitResponse>
 */
export async function submitOutlinePrompt(request: OutlineSubmitRequest): Promise<OutlineSubmitResponse> {
  try {
    const { processedInput, promptConfig } = request;
    
    // Get OpenAI API key from environment
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return {
        success: false,
        data: undefined,
        message: 'OpenAI API key not found in environment variables'
      };
    }

    // Prepare the OpenAI API request
    const openaiRequest: OutlineOpenAIRequest = {
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

    // Add output schema if provided (using the correct property name from JSON)
    if (promptConfig['output-schema']) {
      openaiRequest.functions = [promptConfig['output-schema']];
      openaiRequest.function_call = { name: promptConfig['output-schema'].name };
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
        data: undefined,
        message: `OpenAI API error: ${response.status} ${response.statusText}`
      };
    }

    const openaiResponse = await response.json() as OutlineOpenAIResponse;

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
        data: undefined,
        message: 'No content received from OpenAI API'
      };
    }

    return {
      success: true,
      data: {
        content,
        usage: openaiResponse.usage
      },
      message: 'Outline prompt submitted successfully'
    };

  } catch (error) {
    console.error('Error submitting outline prompt:', error);
    return {
      success: false,
      data: undefined,
      message: 'An error occurred while submitting the outline prompt'
    };
  }
}

/**
 * Complete service to generate article outline from keyword
 * This orchestrates the entire Phase 2 flow: load terms → process input → call OpenAI → parse result
 * @param request - The generate outline request containing keyword
 * @returns Promise<GenerateOutlineResponse>
 */
export async function generateArticleOutline(request: GenerateOutlineRequest): Promise<GenerateOutlineResponse> {
  const startTime = Date.now();
  
  try {
    console.log(`🚀 Starting article outline generation for keyword: "${request.keyword}"`);

    // Step 1: Process outline inputs (loads terms, formats prompt)
    console.log('📝 Processing outline inputs...');
    const processResult = await processOutlineInputs({
      userInput: {
        keyword: request.keyword,
        optimization_terms_file: request.optimization_terms_file
      },
      promptName: 'outline_creation_prompt'
    });

    if (!processResult.success || !processResult.data) {
      return {
        success: false,
        error: processResult.message,
        message: `Failed to process outline inputs: ${processResult.message}`
      };
    }

    // Step 2: Load prompt configuration
    console.log('⚙️ Loading prompt configuration...');
    const promptResult = await fetchPromptByName('outline_creation_prompt');
    
    if (!promptResult.success || !promptResult.data) {
      return {
        success: false,
        error: promptResult.message,
        message: `Failed to load prompt configuration: ${promptResult.message}`
      };
    }

    // Step 3: Submit to OpenAI
    console.log('🤖 Submitting to OpenAI API...');
    const submitResult = await submitOutlinePrompt({
      processedInput: processResult.data as OutlineProcessedInputData,
      promptConfig: promptResult.data as OutlinePromptConfig
    });

    if (!submitResult.success || !submitResult.data) {
      return {
        success: false,
        error: submitResult.message,
        message: `Failed to generate outline: ${submitResult.message}`
      };
    }

    // Step 4: Parse the OpenAI response
    console.log('📊 Parsing outline response...');
    let outline: ArticleOutline;
    
    try {
      outline = JSON.parse(submitResult.data.content) as ArticleOutline;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return {
        success: false,
        error: 'Failed to parse OpenAI response',
        message: 'The OpenAI response could not be parsed as valid JSON'
      };
    }

    // Validate the outline structure
    if (!outline.sections || !Array.isArray(outline.sections)) {
      return {
        success: false,
        error: 'Invalid outline structure',
        message: 'The generated outline does not have the expected structure'
      };
    }

    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Article outline generation completed in ${processingTime}ms`);
    console.log(`📋 Generated ${outline.sections.length} sections`);

    return {
      success: true,
      data: {
        outline,
        keyword: request.keyword,
        usage: submitResult.data.usage,
        processing_time: processingTime
      },
      message: `Successfully generated article outline for "${request.keyword}"`
    };

  } catch (error) {
    console.error('❌ Error in generateArticleOutline:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: `Failed to generate article outline for "${request.keyword}"`
    };
  }
}
