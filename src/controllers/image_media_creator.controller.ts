import { Request, Response } from 'express';
import { ImageMediaRequest, ImageMediaResponse, ImageGenerationResult } from '../models/services/image_media_creator.model';
import { fourStepImageDescriptionService } from '../services/4step_image_desc_generation/img_desc_generation';
import { ideogramImageGeneratorService } from '../services/generate_image';

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

      // Step 1-4: Execute 4-step image description generation
      console.log('🚀 Step 1-4: Executing 4-step image description generation...');
      const fourStepResult = await fourStepImageDescriptionService.generateImageDescription(keyword);
      
      if (!fourStepResult.success || !fourStepResult.data) {
        res.status(500).json({
          success: false,
          message: 'Failed to generate image description using 4-step process',
          error: fourStepResult.message
        });
        return;
      }

      const imageDescriptions = {
        image_description: fourStepResult.data.final_image_description,
        image_title: fourStepResult.data.final_image_title
      };

      // Step 5: Handle debug mode
      const isDebugMode = req.query.debug === 'true';
      if (isDebugMode) {
        await this.handleDebugMode(keyword, imageDescriptions);
      }

      // Step 6: Generate actual image using Ideogram API
      console.log('🎨 Step 6: Generating image with Ideogram API...');
      const ideogramResult = await ideogramImageGeneratorService.generateImage({
        prompt: imageDescriptions.image_description,
        rendering_speed: 'DEFAULT',
        style_type: 'GENERAL',
        aspect_ratio: '16x9'
      });

      if (!ideogramResult.success || !ideogramResult.data) {
        res.status(500).json({
          success: false,
          message: 'Failed to generate image with Ideogram API',
          error: ideogramResult.error
        });
        return;
      }

      // Step 7: Download and save the image
      let savedImagePath: string | undefined;
      try {
        const imageUrl = ideogramResult.data.imageUrl.replace(/\\u0026/g, '&');
        savedImagePath = await ideogramImageGeneratorService.downloadAndSaveImage(imageUrl, keyword);
      } catch (downloadErr) {
        console.warn('⚠️ Error downloading image:', downloadErr);
      }

      // Step 8: Build and return response
      const response = this.buildResponse(keyword, count, imageDescriptions, ideogramResult.data, savedImagePath, Date.now() - startTime);

      console.log('🎉 HTTP API: Complete image generation in', response.data!.processing_time, 'ms');
      console.log('📋 Image Title:', imageDescriptions.image_title);
      console.log('🎨 Image Description:', imageDescriptions.image_description);
      console.log('🖼️ Generated Image URL:', ideogramResult.data.imageUrl);
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

  /**
   * Handle debug mode by saving intermediate files
   */
  private async handleDebugMode(keyword: string, imageDescriptions: any): Promise<void> {
    const fs = require('fs');
    const path = require('path');
    
    const debugDir = path.join(__dirname, '..', '..', 'src', 'repositories', 'image_desc_temp_debug', 'phase2_descriptions');
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir, { recursive: true });
    }
    
    const debugFile = path.join(debugDir, `${keyword.replace(/\s+/g, '_')}_image_desc.json`);
    fs.writeFileSync(debugFile, JSON.stringify(imageDescriptions, null, 2));
    console.log('📁 Debug: Phase 2 output saved to:', debugFile);
  }

  /**
   * Build the response object
   */
  private buildResponse(
    keyword: string, 
    count: number, 
    imageDescriptions: any, 
    ideogramData: any, 
    savedImagePath: string | undefined, 
    processingTime: number
  ): ImageMediaResponse {
    const generationResult: ImageGenerationResult = {
      status: 'completed',
      time: processingTime,
      images: [ideogramData.imageUrl]
    };

    return {
      success: true,
      data: {
        keyword,
        processing_time: processingTime,
        generation: generationResult,
        output_files: {
          images: generationResult.images || [],
          metadata: `/metadata/${keyword.replace(/\s+/g, '_')}_metadata.json`
        },
        content_summary: {
          image_count: count,
          image_description: imageDescriptions.image_description,
          image_title: imageDescriptions.image_title,
          generated_image_url: ideogramData.imageUrl,
          image_resolution: ideogramData.resolution,
          image_seed: ideogramData.seed,
          saved_image_path: savedImagePath
        }
      },
      message: 'Image generation completed successfully (description + generated image)'
    };
  }
}

// Export singleton instance
export const imageMediaCreatorController = new ImageMediaCreatorController();
