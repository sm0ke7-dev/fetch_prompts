import { Request, Response } from 'express';
import { ImageMediaRequest, ImageMediaResponse, ImageGenerationResult } from '../models/services/image_media_creator.model';
import { fourStepImageDescriptionService } from '../services/4step_image_desc_generation/img_desc_generation';
import { imageQualityAssessmentService } from '../services/image_quality_assessment/image_quality_assessment';

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

      // Step 5: Handle debug mode
      const isDebugMode = req.query.debug === 'true';
      if (isDebugMode) {
        await this.handleDebugMode(keyword, {
          image_description: fourStepResult.data.final_image_description,
          image_title: fourStepResult.data.final_image_title
        });
      }

      // Step 6: Quality Assessment (Phase 4)
      let qualityAssessmentResult = null;
      if (fourStepResult.data.generated_image_url) {
        console.log('🔍 Step 6: Executing image quality assessment...');
        qualityAssessmentResult = await imageQualityAssessmentService.assessImageQuality({
          imagePath: fourStepResult.data.generated_image_url, // Use URL instead of file path
          keyword: keyword
        });
        
        if (!qualityAssessmentResult.success) {
          console.log('⚠️ Quality assessment failed, but continuing with response:', qualityAssessmentResult.message);
        }
      }

      // Build and return response
      const response = this.buildResponse(keyword, count, fourStepResult.data, qualityAssessmentResult, Date.now() - startTime);

      console.log('🎉 HTTP API: Complete image generation in', response.data!.processing_time, 'ms');
      console.log('📋 Image Title:', fourStepResult.data.final_image_title);
      console.log('🎨 Image Description:', fourStepResult.data.final_image_description);
      if (fourStepResult.data.generated_image_url) {
        console.log('🖼️ Generated Image URL:', fourStepResult.data.generated_image_url);
      }
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
    fourStepData: any, 
    qualityAssessmentResult: any,
    processingTime: number
  ): ImageMediaResponse {
    const generationResult: ImageGenerationResult = {
      status: 'completed',
      time: processingTime,
      images: fourStepData.generated_image_url ? [fourStepData.generated_image_url] : []
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
          image_description: fourStepData.final_image_description,
          image_title: fourStepData.final_image_title,
          generated_image_url: fourStepData.generated_image_url,
          image_resolution: fourStepData.resolution || 'N/A',
          image_seed: fourStepData.seed || 'N/A',
          saved_image_path: fourStepData.saved_image_path,
          quality_assessment: qualityAssessmentResult?.success ? {
            body_proportions: qualityAssessmentResult.data.body_proportions,
            limb_count: qualityAssessmentResult.data.limb_count,
            facial_features: qualityAssessmentResult.data.facial_features,
            overall_assessment: qualityAssessmentResult.data.overall_assessment,
            processing_time: qualityAssessmentResult.data.processing_time
          } : undefined
        }
      },
      message: qualityAssessmentResult?.success 
        ? 'Image generation completed successfully (4-step process + generated image + quality assessment)'
        : 'Image generation completed successfully (4-step process + generated image)'
    };
  }
}

// Export singleton instance
export const imageMediaCreatorController = new ImageMediaCreatorController();
