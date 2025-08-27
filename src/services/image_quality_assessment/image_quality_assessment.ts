import { fetchPromptByName } from '../../repositories/fetch_prompt';
import { processInputs } from '../process_input';
import {
  ImageQualityAssessmentRequest,
  ImageQualityAssessmentResponse,
  ImageQualityAssessmentResult
} from '../../models/services/image_quality_assessment/image_quality_assessment.models';
import * as path from 'path';
import { ImageMediaResponse, ImageGenerationResult } from '../../models/services/image_media_creator.model';

export class ImageQualityAssessmentService {
  /**
   * Quality criteria - easily modifiable in one place
   */
  private getQualityCriteria(): string {
    return [
      "Anatomical correctness (body proportions, limb count, facial features)",
      "Content appropriateness for professional publishing",
      "No inappropriate or offensive content",
      "No anatomical errors (extra limbs, distorted features, etc.)"
    ].join(", ");
  }

  /**
   * Assess the quality of a generated image using GPT Vision API
   */
  async assessImageQuality(request: ImageQualityAssessmentRequest): Promise<ImageQualityAssessmentResponse> {
    const startTime = Date.now();
    
    try {
      const isDebug = process.env.LOG_LEVEL === 'debug';
      console.log('\n' + '='.repeat(80));
      console.log('🔍 PHASE 4: IMAGE QUALITY ASSESSMENT (GPT Vision)');
      console.log('='.repeat(80));
      console.log('🖼️ Image URL:', request.imagePath); // Now contains URL
      console.log('🔑 Keyword:', request.keyword);
      console.log('⏰ Start Time:', new Date().toISOString());

      // Validate image URL exists
      if (!request.imagePath || !request.imagePath.startsWith('http')) {
        console.log('❌ Invalid image URL:', request.imagePath);
        return {
          success: false,
          message: 'Invalid image URL provided',
          error: 'Image URL must be a valid HTTP URL'
        };
      }

      // Extract image title from URL or keyword
      const imageTitle = this.extractImageTitle(request.imagePath, request.keyword);

      // Prepare prompt using configuration and variable substitution
      const promptConfigResult = await fetchPromptByName('image_quality_prompt');
      if (!promptConfigResult.success || !promptConfigResult.data) {
        return {
          success: false,
          message: 'Failed to fetch image quality prompt configuration',
          error: promptConfigResult.message
        };
      }

      const qualityCriteriaFromPrompt = (promptConfigResult.data as any).quality_criteria as string | undefined;
      const qualityCriteria = qualityCriteriaFromPrompt && qualityCriteriaFromPrompt.trim() !== ''
        ? qualityCriteriaFromPrompt
        : this.getQualityCriteria();

      const processResult = await processInputs({
        userInput: {
          image_title: imageTitle,
          keyword: request.keyword,
          quality_criteria: qualityCriteria
        },
        promptName: 'image_quality_prompt'
      });

      if (!processResult.success || !processResult.data) {
        return {
          success: false,
          message: 'Failed to process prompt inputs for image quality assessment',
          error: processResult.message
        };
      }

      // Step 1: Create vision API request with direct URL
      console.log('\n' + '-'.repeat(60));
      console.log('🤖 STEP 1: CREATING GPT VISION API REQUEST');
      console.log('-'.repeat(60));
      
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        return {
          success: false,
          message: 'OpenAI API key not found in environment variables',
          error: 'OPENAI_API_KEY not configured'
        };
      }

      const visionRequest = {
        model: promptConfigResult.data.model,
        temperature: promptConfigResult.data.temperature,
        max_tokens: promptConfigResult.data.max_tokens,
        top_p: promptConfigResult.data.top_p,
        frequency_penalty: promptConfigResult.data.frequency_penalty,
        presence_penalty: promptConfigResult.data.presence_penalty,
        messages: [
          {
            role: "system",
            content: processResult.data.processedSystemMessage
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: processResult.data.processedUserMessage
              },
              {
                type: "image_url",
                image_url: {
                  url: request.imagePath,
                  detail: "auto"
                }
              }
            ]
          }
        ]
      };

      if (isDebug) {
        console.log('✅ Vision API request created successfully');
        console.log('📋 GPT VISION API REQUEST BODY:');
        console.log('='.repeat(80));
        console.log(JSON.stringify(visionRequest, null, 2));
        console.log('='.repeat(80));
      }

      // Step 2: Submit to GPT Vision API
      console.log('\n' + '-'.repeat(60));
      console.log('🚀 STEP 2: SUBMITTING TO GPT VISION API');
      console.log('-'.repeat(60));
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify(visionRequest)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('GPT Vision API error:', errorData);
        return {
          success: false,
          message: 'GPT Vision API error',
          error: `API error: ${response.status} ${response.statusText}`
        };
      }

      const visionResponse = await response.json() as any;
      if (isDebug) {
        console.log('✅ GPT Vision API response received successfully');
      }

      // Step 3: Parse the quality assessment response
      console.log('\n' + '-'.repeat(60));
      console.log('📊 STEP 3: PARSING QUALITY ASSESSMENT RESULTS');
      console.log('-'.repeat(60));
      
      const content = visionResponse.choices?.[0]?.message?.content;
      if (!content) {
        return {
          success: false,
          message: 'No content received from GPT Vision API',
          error: 'Empty response from vision API'
        };
      }
      
      if (isDebug) {
        console.log('📝 QUALITY ASSESSMENT RESULT:');
        console.log('='.repeat(80));
        console.log(content);
        console.log('='.repeat(80));
      }

      const qualityResult = this.parseQualityAssessmentResponse(content);
      
      if (!qualityResult.success) {
        console.log('❌ Failed to parse quality assessment response:', qualityResult.error);
        return {
          success: false,
          message: 'Failed to parse quality assessment response',
          error: qualityResult.error
        };
      }

      // Add processing time to result
      const processingTime = Date.now() - startTime;
      if (qualityResult.data) {
        qualityResult.data.processing_time = processingTime;
        const summary = `🧪 Image QA: BP=${qualityResult.data.body_proportions}, LC=${qualityResult.data.limb_count}, FF=${qualityResult.data.facial_features}, OVERALL=${qualityResult.data.overall_assessment}, t=${processingTime}ms`;
        console.log(summary);
      }

      return {
        success: true,
        data: qualityResult.data,
        message: 'Image quality assessment completed successfully using GPT Vision'
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Image quality assessment failed:', errorMessage);
      
      return {
        success: false,
        message: 'Image quality assessment failed',
        error: errorMessage
      };
    }
  }

  /**
   * Extract image title from URL or keyword
   */
  private extractImageTitle(imageUrl: string, keyword: string): string {
    try {
      // Try to extract title from URL path
      const url = new URL(imageUrl);
      const pathname = url.pathname;
      const filename = path.basename(pathname, path.extname(pathname));
      
      if (filename && filename !== '') {
        // Convert underscores/dashes to spaces and capitalize
        let title = filename.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return title;
      }
    } catch (error) {
      // If URL parsing fails, continue to keyword fallback
    }
    
    // Fallback to keyword-based title
    return keyword.replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Parse the quality assessment response from GPT Vision API
   */
  private parseQualityAssessmentResponse(content: string): { success: boolean; data?: ImageQualityAssessmentResult; error?: string } {
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          success: false,
          error: 'No JSON found in response'
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
             // Validate required fields
       if (!parsed.body_proportions || !parsed.limb_count || !parsed.facial_features || !parsed.overall_assessment) {
         return {
           success: false,
           error: 'Invalid quality assessment response format - missing required fields'
         };
       }

       const result: ImageQualityAssessmentResult = {
         body_proportions: parsed.body_proportions,
         limb_count: parsed.limb_count,
         facial_features: parsed.facial_features,
         overall_assessment: parsed.overall_assessment,
         processing_time: 0 // Will be set by caller
       };

       // Optional fields
       if (parsed.context_alignment) {
         (result as any).context_alignment = parsed.context_alignment;
       }
       if (parsed.failure_reasons && Array.isArray(parsed.failure_reasons)) {
         (result as any).failure_reasons = parsed.failure_reasons as string[];
       }
       if (parsed.redo_hint && typeof parsed.redo_hint === 'string') {
         (result as any).redo_hint = parsed.redo_hint as string;
       }

      return {
        success: true,
        data: result
      };

    } catch (parseError) {
      console.error('Failed to parse quality assessment response:', parseError);
      console.error('Raw content:', content);
      
      return {
        success: false,
        error: 'Failed to parse quality assessment response'
      };
    }
  }

  /**
   * Build the HTTP response for the image media pipeline
   */
  public buildImageMediaResponse(
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
export const imageQualityAssessmentService = new ImageQualityAssessmentService();
