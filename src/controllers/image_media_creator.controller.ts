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

      // Step 1-4: Execute 4-step image description generation (with optional feedback on retry)
      console.log('🚀 Step 1-4: Executing 4-step image description generation...');
      let feedback: string = '';
      let attemptsUsed = 0;
      const maxAttempts = 2; // 1 initial + 1 retry
      let fourStepResult = await fourStepImageDescriptionService.generateImageDescription(keyword, feedback);
      attemptsUsed++;
      
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

      // Optional retry if QA failed
      if (qualityAssessmentResult?.success && qualityAssessmentResult.data && (qualityAssessmentResult.data.overall_assessment === 'FAIL' || (qualityAssessmentResult.data as any).context_alignment === 'FAIL') && attemptsUsed < maxAttempts) {
        const reasons = (qualityAssessmentResult.data as any).failure_reasons as string[] | undefined;
        const redoHint = (qualityAssessmentResult.data as any).redo_hint as string | undefined;
        const reasonStr = reasons && reasons.length > 0 ? reasons.join('; ') : 'context or anatomical mismatch';
        feedback = `Reasons: ${reasonStr}. Hint: ${redoHint || 'Add explicit visual anchors for subject, action, and setting.'}`;
        console.log('🔁 QA FAIL detected. Retrying from Step 1 with feedback:', feedback);

        // Re-run 4-step with feedback
        fourStepResult = await fourStepImageDescriptionService.generateImageDescription(keyword, feedback);
        attemptsUsed++;

        // Re-run QA if we have a new image
        if (fourStepResult.success && fourStepResult.data && fourStepResult.data.generated_image_url) {
          console.log('🔍 Re-running image quality assessment on retry image...');
          qualityAssessmentResult = await imageQualityAssessmentService.assessImageQuality({
            imagePath: fourStepResult.data.generated_image_url,
            keyword
          });
        }
      }

      // Build and return response (delegated to service)
      const response = imageQualityAssessmentService.buildImageMediaResponse(
        keyword,
        count,
        fourStepResult.data,
        qualityAssessmentResult,
        Date.now() - startTime
      );

      // Attach rerun metadata if applicable
      (response.data as any).rerun = {
        attempted: attemptsUsed > 1,
        attempts_used: attemptsUsed,
        feedback_applied: attemptsUsed > 1 ? feedback : null
      };
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

  // Response construction has been moved to the service layer
}

// Export singleton instance
export const imageMediaCreatorController = new ImageMediaCreatorController();
