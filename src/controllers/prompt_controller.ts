import { Request, Response } from 'express';
import { processInputs, submitPrompt } from '../services';

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

      // Step 1: Process inputs using our service layer
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

      // Step 2: Submit to OpenAI using our service layer
      const submitResult = await submitPrompt({
        processedInput: processResult.data,
        promptConfig: {
          model: 'gpt-4o-mini', // We'll get this from the prompt config later
          temperature: 0.5,
          max_tokens: 1000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
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

      // Step 3: Return the structured response
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
