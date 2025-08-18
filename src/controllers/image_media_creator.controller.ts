import { Request, Response } from 'express';
import { ImageMediaRequest, ImageMediaResponse, ImageGenerationResult } from '../models/services/image_media_creator.model';
import { fetchPromptByName } from '../repositories/fetch_prompt';
import { processInputs } from '../services/process_input';
import { submitPrompt } from '../services/submit_prompt';
import { ideogramImageGeneratorService } from '../services/generate_image';
import * as fs from 'fs';
import * as path from 'path';

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

      // Step 5: Check if debug mode is enabled
      const isDebugMode = req.query.debug === 'true';
      
      // Save Phase 2 output to debug folder if debug mode is enabled
      if (isDebugMode) {
        const debugDir = path.join(__dirname, '..', '..', 'src', 'repositories', 'image_desc_temp_debug', 'phase2_descriptions');
        if (!fs.existsSync(debugDir)) {
          fs.mkdirSync(debugDir, { recursive: true });
        }
        
        const debugFile = path.join(debugDir, `${keyword.replace(/\s+/g, '_')}_image_desc.json`);
        fs.writeFileSync(debugFile, JSON.stringify(imageDescriptions, null, 2));
        console.log('📁 Debug: Phase 2 output saved to:', debugFile);
      }

      // Step 6: Generate actual image using Ideogram API (Phase 3)
      console.log('🎨 Step 6: Generating image with Ideogram API...');
      const ideogramResult = await ideogramImageGeneratorService.generateImage({
        prompt: imageDescriptions.image_description,
        rendering_speed: 'DEFAULT',
        style_type: 'GENERAL'
      });

      if (!ideogramResult.success || !ideogramResult.data) {
        res.status(500).json({
          success: false,
          message: 'Failed to generate image with Ideogram API',
          error: ideogramResult.error
        });
        return;
      }

      // Step 7: Save Phase 3 output to debug folder if debug mode is enabled
      let savedImagePath: string | undefined;
      if (isDebugMode) {
        const debugDir = path.join(__dirname, '..', '..', 'src', 'repositories', 'image_desc_temp_debug', 'phase3_images');
        if (!fs.existsSync(debugDir)) {
          fs.mkdirSync(debugDir, { recursive: true });
        }
        
        // Save metadata
        const metaPath = path.join(debugDir, `${keyword.replace(/\s+/g, '_')}_image_metadata.json`);
        fs.writeFileSync(metaPath, JSON.stringify(ideogramResult.data, null, 2));
        console.log('📁 Debug: Phase 3 metadata saved to:', metaPath);

        // Attempt to download and save the image locally
        try {
          const sanitizedKeyword = keyword.replace(/\s+/g, '_').toLowerCase();
          const imageUrl = ideogramResult.data.imageUrl.replace(/\\u0026/g, '&');
          const imageResp = await fetch(imageUrl, {
            headers: {
              'Accept': 'image/*, */*;q=0.8',
              'User-Agent': 'debug-downloader/1.0'
            }
          });
          if (imageResp.ok) {
            const arrBuf = await imageResp.arrayBuffer();
            const buf = Buffer.from(arrBuf);
            const imgPath = path.join(debugDir, `${sanitizedKeyword}_image.png`);
            fs.writeFileSync(imgPath, buf);
            savedImagePath = imgPath;
            console.log('🖼️ Debug: Image downloaded to:', imgPath);
          } else {
            let bodyText = '';
            try { bodyText = await imageResp.text(); } catch {}
            console.warn('⚠️ Debug: Failed to download image. HTTP', imageResp.status, bodyText?.slice(0, 200));
          }
        } catch (downloadErr) {
          console.warn('⚠️ Debug: Error downloading image:', downloadErr);
        }
      }

      // Step 8: Return the complete result (description + generated image)
      const generationResult: ImageGenerationResult = {
        status: 'completed',
        time: Date.now() - startTime,
        images: [ideogramResult.data.imageUrl]
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
            image_count: count,
            image_description: imageDescriptions.image_description,
            image_title: imageDescriptions.image_title,
            generated_image_url: ideogramResult.data.imageUrl,
            image_resolution: ideogramResult.data.resolution,
            image_seed: ideogramResult.data.seed,
            saved_image_path: savedImagePath
          }
        },
        message: 'Image generation completed successfully (description + generated image)'
      };

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
}

// Export singleton instance
export const imageMediaCreatorController = new ImageMediaCreatorController();
