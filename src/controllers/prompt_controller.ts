import { Request, Response } from 'express';
import { processInputs, submitPrompt } from '../services';
import { fetchPromptByName } from '../repositories/fetch_prompt';

/**
 * Controller for handling prompt-related HTTP requests
 */
export class PromptController {
  
  /**
   * Process a text generation request
   * POST /api/v1/text?prompt_name=prompts
   * Body: {"keyword": "Raccoon Removal Houston"}
   */
  async processTextGeneration(req: Request, res: Response): Promise<void> {
    try {
      // Extract query parameter and body
      const { prompt_name } = req.query;
      const { keyword } = req.body;

      // Validate required parameters
      if (!prompt_name) {
        res.status(400).json({
          success: false,
          error: 'MISSING_PROMPT_NAME',
          message: 'prompt_name query parameter is required'
        });
        return;
      }

      if (!keyword) {
        res.status(400).json({
          success: false,
          error: 'MISSING_KEYWORD',
          message: 'keyword in request body is required'
        });
        return;
      }

      // Step 1: Fetch the prompt configuration
      const promptConfigResult = await fetchPromptByName(prompt_name as string);
      
      if (!promptConfigResult.success || !promptConfigResult.data) {
        res.status(400).json({
          success: false,
          error: 'PROMPT_NOT_FOUND',
          message: promptConfigResult.message
        });
        return;
      }

      const promptConfig = promptConfigResult.data;

      // Step 2: Process inputs using our service layer
      const processResult = await processInputs({
        userInput: { keyword },
        promptName: prompt_name as string
      });

      if (!processResult.success || !processResult.data) {
        res.status(400).json({
          success: false,
          error: 'PROCESSING_FAILED',
          message: processResult.message
        });
        return;
      }

      // Step 3: Submit to OpenAI using our service layer
      const submitResult = await submitPrompt({
        processedInput: processResult.data,
        promptConfig: {
          model: promptConfig.model,
          temperature: promptConfig.temperature,
          max_tokens: promptConfig.max_tokens,
          top_p: promptConfig.top_p,
          frequency_penalty: promptConfig.frequency_penalty,
          presence_penalty: promptConfig.presence_penalty,
          outputSchema: promptConfig['output-schema']
        }
      });

      if (!submitResult.success || !submitResult.data) {
        res.status(500).json({
          success: false,
          error: 'OPENAI_FAILED',
          message: submitResult.message
        });
        return;
      }

      // Step 4: Return the structured response
      res.status(200).json({
        success: true,
        data: {
          content: submitResult.data.content,
          usage: submitResult.data.usage,
          prompt_name,
          keyword
        },
        message: 'Text generation completed successfully'
      });

    } catch (error) {
      console.error('Error in processTextGeneration:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'An internal server error occurred'
      });
    }
  }
}

// Export a singleton instance
export const promptController = new PromptController();
