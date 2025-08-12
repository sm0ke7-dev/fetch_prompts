import { Request, Response } from 'express';
import { ImageMediaRequest, ImageMediaResponse, ImageGenerationResult } from '../models/services/image_media_creator.model';
import { fetchPromptByName } from '../repositories/fetch_prompt';
import { processInputs } from '../services/process_input';
import { submitPrompt } from '../services/submit_prompt';

/**
 * Image Media Creator Controller
 * Handles HTTP requests for image generation pipeline
 */
class ImageMediaCreatorController {
  /**
   * Generate images based on keyword and parameters
   * POST /api/v1/image-media
   */
  async generateImages(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 HTTP API: Starting image generation for keyword:', req.body.keyword);
      
      // Validate request body
      const { keyword, count = 1 }: ImageMediaRequest = req.body;
      
      if (!keyword) {
        res.status(400).json({
          success: false,
          message: 'Missing required parameter: keyword',
          error: 'Keyword is required for image generation'
        });
        return;
      }

      // Step 1: Fetch the image creation prompt
      console.log('📋 Step 1: Fetching image creation prompt...');
      const promptConfigResult = await fetchPromptByName('create_image_prompt');
      
      if (!promptConfigResult.success || !promptConfigResult.data) {
        res.status(400).json({
          success: false,
          message: 'Failed to fetch image creation prompt',
          error: promptConfigResult.message
        });
        return;
      }

      // Step 2: Process inputs (replace {{keyword}} with actual keyword)
      console.log('📝 Step 2: Processing input substitution...');
      const processResult = await processInputs({
        userInput: { keyword },
        promptName: 'create_image_prompt'
      });

      if (!processResult.success || !processResult.data) {
        res.status(400).json({
          success: false,
          message: 'Failed to process input substitution',
          error: processResult.message
        });
        return;
      }

      // Step 3: Submit to OpenAI API to get image descriptions
      console.log('🤖 Step 3: Submitting to OpenAI API...');
      const submitResult = await submitPrompt({
        processedInput: processResult.data,
        promptConfig: {
          model: promptConfigResult.data.model,
          temperature: promptConfigResult.data.temperature,
          max_tokens: promptConfigResult.data.max_tokens,
          top_p: promptConfigResult.data.top_p,
          frequency_penalty: promptConfigResult.data.frequency_penalty,
          presence_penalty: promptConfigResult.data.presence_penalty,
          outputSchema: promptConfigResult.data['output-schema']
        }
      });

      if (!submitResult.success || !submitResult.data) {
        res.status(500).json({
          success: false,
          message: 'Failed to get image descriptions from OpenAI',
          error: submitResult.message
        });
        return;
      }

      // Step 4: Parse the OpenAI response to get image descriptions
      console.log('📊 Step 4: Parsing OpenAI response...');
      let imageDescriptions;
      try {
        imageDescriptions = JSON.parse(submitResult.data.content);
      } catch (parseError) {
        res.status(500).json({
          success: false,
          message: 'Failed to parse OpenAI response',
          error: 'Invalid JSON response from OpenAI'
        });
        return;
      }

      // Step 5: Return the image descriptions (placeholder for actual image generation)
      const generationResult: ImageGenerationResult = {
        status: 'completed',
        time: Date.now() - startTime,
        images: imageDescriptions.sections?.map((section: any, index: number) => 
          `/images/${keyword.replace(/\s+/g, '_')}_${index + 1}.png`
        ) || []
      };

      const response: ImageMediaResponse = {
        success: true,
        data: {
          keyword,
          processing_time: Date.now() - startTime,
          generation: generationResult,
          output_files: {
            images: generationResult.images || [],
            metadata: `/metadata/${keyword.replace(/\s+/g, '_')}_metadata.json`
          },
          content_summary: {
            image_count: count
          }
        },
        message: 'Image descriptions generated successfully (ready for image generation)'
      };

      console.log('🎉 HTTP API: Image descriptions generated in', response.data!.processing_time, 'ms');
      console.log('📋 Generated sections:', imageDescriptions.sections?.length || 0);
      res.status(200).json(response);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ HTTP API: Image generation failed after', Date.now() - startTime, 'ms:', errorMessage);
      
      res.status(500).json({
        success: false,
        message: 'Image generation failed',
        error: errorMessage
      });
    }
  }
}

// Export singleton instance
export const imageMediaCreatorController = new ImageMediaCreatorController();
