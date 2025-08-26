import { fetchPromptByName } from '../../repositories/fetch_prompt';
import { processInputs } from '../process_input';
import { submitPrompt } from '../submit_prompt';
import {
  ImageQualityAssessmentRequest,
  ImageQualityAssessmentResponse,
  ImageQualityAssessmentResult
} from '../../models/services/image_quality_assessment/image_quality_assessment.models';
import * as fs from 'fs';
import * as path from 'path';

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
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image for quality assessment. The image is titled '${imageTitle}' and was generated for the keyword '${request.keyword}'. Check for: ${this.getQualityCriteria()}. Respond in JSON format with: {"body_proportions": "PASS"|"FAIL", "limb_count": "PASS"|"FAIL", "facial_features": "PASS"|"FAIL", "overall_assessment": "PASS"|"FAIL"}.`
            },
            {
              type: "image_url",
              image_url: {
                url: request.imagePath,
                detail: "auto"
              }
            }
          ]
        }]
      };

      console.log('✅ Vision API request created successfully');
      console.log('📋 GPT VISION API REQUEST BODY:');
      console.log('='.repeat(80));
      console.log(JSON.stringify(visionRequest, null, 2));
      console.log('='.repeat(80));

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
      console.log('✅ GPT Vision API response received successfully');

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
      
      console.log('📝 QUALITY ASSESSMENT RESULT:');
      console.log('='.repeat(80));
      console.log(content);
      console.log('='.repeat(80));

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

                 console.log('✅ Quality assessment completed successfully');
         console.log('📊 Body Proportions:', qualityResult.data.body_proportions);
         console.log('📊 Limb Count:', qualityResult.data.limb_count);
         console.log('📊 Facial Features:', qualityResult.data.facial_features);
         console.log('🎯 Overall Assessment:', qualityResult.data.overall_assessment);
         console.log('⏱️ Processing Time:', processingTime, 'ms');
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
}

// Export singleton instance
export const imageQualityAssessmentService = new ImageQualityAssessmentService();
