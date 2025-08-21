import { fetchPromptByName } from '../../repositories/fetch_prompt';
import { processInputs } from '../process_input';
import { submitPrompt } from '../submit_prompt';
import { ideogramImageGeneratorService } from '../generate_image';
import {
  Step1Result,
  Step2Result,
  Step3Result,
  Step4Result,
  FourStepImageDescriptionResult,
  StructuredImagePrompt
} from '../../models/services/4step_image_desc_generation/img_desc_generation.models';

export class FourStepImageDescriptionService {
  /**
   * Execute the complete 4-step image description generation process
   */
  async generateImageDescription(keyword: string): Promise<FourStepImageDescriptionResult> {
    const startTime = Date.now();
    
    try {
      console.log('\n' + '='.repeat(80));
      console.log('🚀 STARTING 4-STEP IMAGE DESCRIPTION GENERATION');
      console.log('='.repeat(80));
      console.log('📝 Keyword:', keyword);
      console.log('⏰ Start Time:', new Date().toISOString());

      // Step 1: Generate 3 concept variations
      console.log('\n' + '-'.repeat(60));
      console.log('📋 STEP 1: GENERATING CONCEPT VARIATIONS');
      console.log('-'.repeat(60));
      const step1Result = await this.executeStep1(keyword);
      if (!step1Result.success || !step1Result.data) {
        console.log('❌ Step 1 FAILED:', step1Result.message);
        return {
          success: false,
          message: 'Step 1 failed',
          error: step1Result.message
        };
      }
      console.log('✅ Step 1 COMPLETED successfully');

      // Step 2: Rate the concepts
      console.log('\n' + '-'.repeat(60));
      console.log('📊 STEP 2: RATING CONCEPTS FOR COMMONALITY');
      console.log('-'.repeat(60));
      const step2Result = await this.executeStep2(keyword, step1Result.data);
      if (!step2Result.success || !step2Result.data) {
        console.log('❌ Step 2 FAILED:', step2Result.message);
        return {
          success: false,
          message: 'Step 2 failed',
          error: step2Result.message
        };
      }
      console.log('✅ Step 2 COMPLETED successfully');

      // Step 3: Identify minimum viable entities
      console.log('\n' + '-'.repeat(60));
      console.log('🔍 STEP 3: IDENTIFYING MINIMUM VIABLE ENTITIES');
      console.log('-'.repeat(60));
      const step3Result = await this.executeStep3(keyword, step2Result.data.best_concept);
      if (!step3Result.success || !step3Result.data) {
        console.log('❌ Step 3 FAILED:', step3Result.message);
        return {
          success: false,
          message: 'Step 3 failed',
          error: step3Result.message
        };
      }
      console.log('✅ Step 3 COMPLETED successfully');

      // Step 4: Create final optimized prompt
      console.log('\n' + '-'.repeat(60));
      console.log('🎨 STEP 4: CREATING FINAL OPTIMIZED PROMPT');
      console.log('-'.repeat(60));
      const step4Result = await this.executeStep4(keyword, step3Result.data);
      if (!step4Result.success || !step4Result.data) {
        console.log('❌ Step 4 FAILED:', step4Result.message);
        return {
          success: false,
          message: 'Step 4 failed',
          error: step4Result.message
        };
      }
      console.log('✅ Step 4 COMPLETED successfully');

      // Step 5: Generate image with Ideogram API
      console.log('\n' + '-'.repeat(60));
      console.log('🎨 STEP 5: GENERATING IMAGE WITH IDEOGRAM API');
      console.log('-'.repeat(60));
      const imageResult = await this.generateImageWithIdeogram(step4Result.data, keyword);
      if (!imageResult.success) {
        console.log('❌ Step 5 FAILED:', imageResult.message);
        return {
          success: false,
          message: 'Step 5 failed',
          error: imageResult.message
        };
      }
      console.log('✅ Step 5 COMPLETED successfully');

      const processingTime = Date.now() - startTime;
      console.log('\n' + '='.repeat(80));
      console.log('🎉 4-STEP PROCESS COMPLETED SUCCESSFULLY');
      console.log('='.repeat(80));
      console.log('⏱️  Total Processing Time:', processingTime, 'ms');
      console.log('📝 Final Image Title:', step4Result.data.image_title);
      console.log('🖼️  Generated Image URL:', imageResult.data?.generated_image_url);
      console.log('💾 Saved Image Path:', imageResult.data?.saved_image_path);
      console.log('='.repeat(80) + '\n');

      return {
        success: true,
        data: {
          step1: step1Result.data,
          step2: step2Result.data,
          step3: step3Result.data,
          step4: step4Result.data,
          final_image_description: this.convertStructuredPromptToText(step4Result.data.structured_prompt),
          final_image_title: step4Result.data.image_title,
          generated_image_url: imageResult.data?.generated_image_url,
          saved_image_path: imageResult.data?.saved_image_path,
          processing_time: processingTime
        },
        message: '4-step image description generation completed successfully'
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ 4-step process failed:', errorMessage);
      
      return {
        success: false,
        message: '4-step image description generation failed',
        error: errorMessage
      };
    }
  }

  /**
   * Convert structured prompt to text for Ideogram API
   */
  private convertStructuredPromptToText(structuredPrompt: StructuredImagePrompt): string {
    const { core, setting, objects, characters, camera, mood } = structuredPrompt;
    
    let description = core;
    
    // Add setting details
    description += ` The scene is set in ${setting.location} during ${setting.time_of_day} with ${setting.lighting}`;
    
    // Add objects
    if (objects.length > 0) {
      description += '. Objects include: ';
      description += objects.map(obj => {
        let objDesc = obj.type;
        if (obj.position) objDesc += ` positioned ${obj.position}`;
        return objDesc;
      }).join(', ');
    }
    
    // Add characters
    if (characters.length > 0) {
      description += '. Characters include: ';
      description += characters.map(char => {
        let charDesc = char.type;
        charDesc += ` ${char.pose}, ${char.interaction}`;
        return charDesc;
      }).join(', ');
    }
    
    // Add camera and mood
    description += `. Camera: ${camera.angle} shot from ${camera.position}. Mood: ${mood.emotion} with ${mood.tone} tone.`;
    
    return description;
  }

  /**
   * Generate image with Ideogram API
   */
  private async generateImageWithIdeogram(step4Data: Step4Result, keyword: string): Promise<{ success: boolean; data?: { generated_image_url?: string; saved_image_path?: string }; message?: string }> {
    try {
      console.log('🎨 Ideogram Service: Starting image generation...');
      
      // Convert structured prompt to text
      const imageDescription = this.convertStructuredPromptToText(step4Data.structured_prompt);
      console.log('📝 FULL TEXT PROMPT SENT TO IDEOGRAM:');
      console.log('━'.repeat(80));
      console.log(imageDescription);
      console.log('━'.repeat(80));
      
      // Generate image
      const generateResult = await ideogramImageGeneratorService.generateImage({
        prompt: imageDescription,
        style_type: 'REALISTIC'
      });
      
      if (!generateResult.success || !generateResult.data) {
        console.log('❌ Failed to generate image:', generateResult.error);
        return { success: false, message: generateResult.error };
      }
      
      console.log('✅ Ideogram Service: Image generated successfully');
      console.log('🖼️ Image URL:', generateResult.data.imageUrl);
      console.log('📏 Resolution:', generateResult.data.resolution);
      console.log('🎲 Seed:', generateResult.data.seed);
      
      // Download and save image
      const savedImagePath = await ideogramImageGeneratorService.downloadAndSaveImage(
        generateResult.data.imageUrl,
        keyword
      );
      
      console.log('🖼️ Image saved to:', savedImagePath);
      
      return {
        success: true,
        data: {
          generated_image_url: generateResult.data.imageUrl,
          saved_image_path: savedImagePath
        }
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('❌ Image generation error:', errorMessage);
      return { success: false, message: errorMessage };
    }
  }

  /**
   * Step 1: Generate 3 concept variations
   */
  private async executeStep1(keyword: string): Promise<{ success: boolean; data?: Step1Result; message?: string }> {
    try {
      console.log('📥 Step 1 Input:');
      console.log('   Keyword:', keyword);
      
      // Fetch the prompt
      const promptResult = await fetchPromptByName('step1_idea_generation');
      if (!promptResult.success || !promptResult.data) {
        console.log('❌ Failed to fetch prompt:', promptResult.message);
        return { success: false, message: promptResult.message };
      }
      console.log('📋 Prompt loaded successfully');

      // Process inputs
      const processResult = await processInputs({
        userInput: { keyword },
        promptName: 'step1_idea_generation'
      });
      if (!processResult.success || !processResult.data) {
        console.log('❌ Failed to process inputs:', processResult.message);
        return { success: false, message: processResult.message };
      }
      console.log('🔧 Inputs processed successfully');

      // Log the prompt being sent to OpenAI
      console.log('📋 STEP 1 PROMPT SENT TO OPENAI:');
      console.log('='.repeat(80));
      console.log(processResult.data);
      console.log('='.repeat(80));

      // Submit to OpenAI
      const submitResult = await submitPrompt({
        processedInput: processResult.data,
        promptConfig: {
          model: promptResult.data.model,
          temperature: promptResult.data.temperature,
          max_tokens: promptResult.data.max_tokens,
          top_p: promptResult.data.top_p,
          frequency_penalty: promptResult.data.frequency_penalty,
          presence_penalty: promptResult.data.presence_penalty,
          outputSchema: promptResult.data['output-schema']
        }
      });
      if (!submitResult.success || !submitResult.data) {
        console.log('❌ Failed to submit to OpenAI:', submitResult.message);
        return { success: false, message: submitResult.message };
      }

      console.log('🤖 OpenAI Response:');
      console.log('   Tokens Used:', submitResult.data.usage?.total_tokens || 'N/A');

      // Parse response
      const step1Data = JSON.parse(submitResult.data.content) as Step1Result;
      
      console.log('📤 Step 1 Output:');
      console.log('   Concepts Generated:', step1Data.concepts.length);
      console.log('🔍 COMPLETE STEP 1 JSON OUTPUT:');
      console.log(JSON.stringify(step1Data, null, 2));
      

      step1Data.concepts.forEach((concept, index) => {
        console.log(`   Concept ${index + 1}: ${concept.title}`);
        console.log(`     Description: ${concept.description.substring(0, 80)}...`);
        console.log(`     Key Elements: ${concept.key_elements.join(', ')}`);
      });

      return { success: true, data: step1Data };

    } catch (error) {
      console.log('❌ Step 1 Error:', error);
      return { success: false, message: `Step 1 error: ${error}` };
    }
  }

  /**
   * Step 2: Rate concepts for commonality
   */
  private async executeStep2(keyword: string, step1Data: Step1Result): Promise<{ success: boolean; data?: Step2Result; message?: string }> {
    try {
      console.log('📥 Step 2 Input:');
      console.log('   Keyword:', keyword);
      console.log('   Concepts to Rate:', step1Data.concepts.length);
      
      // Fetch the prompt
      const promptResult = await fetchPromptByName('step2_rating');
      if (!promptResult.success || !promptResult.data) {
        console.log('❌ Failed to fetch prompt:', promptResult.message);
        return { success: false, message: promptResult.message };
      }
      console.log('📋 Prompt loaded successfully');

      // Process inputs with concepts from Step 1
      const processResult = await processInputs({
        userInput: { 
          keyword,
          concepts: JSON.stringify(step1Data.concepts, null, 2)
        },
        promptName: 'step2_rating'
      });
      if (!processResult.success || !processResult.data) {
        console.log('❌ Failed to process inputs:', processResult.message);
        return { success: false, message: processResult.message };
      }
      console.log('🔧 Inputs processed successfully');

      // Log the prompt being sent to OpenAI
      console.log('📋 STEP 2 PROMPT SENT TO OPENAI:');
      console.log('='.repeat(80));
      console.log(processResult.data);
      console.log('='.repeat(80));

      // Submit to OpenAI
      const submitResult = await submitPrompt({
        processedInput: processResult.data,
        promptConfig: {
          model: promptResult.data.model,
          temperature: promptResult.data.temperature,
          max_tokens: promptResult.data.max_tokens,
          top_p: promptResult.data.top_p,
          frequency_penalty: promptResult.data.frequency_penalty,
          presence_penalty: promptResult.data.presence_penalty,
          outputSchema: promptResult.data['output-schema']
        }
      });
      if (!submitResult.success || !submitResult.data) {
        console.log('❌ Failed to submit to OpenAI:', submitResult.message);
        return { success: false, message: submitResult.message };
      }

      console.log('🤖 OpenAI Response:');
      console.log('   Tokens Used:', submitResult.data.usage?.total_tokens || 'N/A');

      // Parse response
      const step2Data = JSON.parse(submitResult.data.content) as Step2Result;
      
      console.log('📤 Step 2 Output:');
      console.log('   Ratings Generated:', step2Data.ratings.length);
      console.log('🔍 COMPLETE STEP 2 JSON OUTPUT:');
      console.log(JSON.stringify(step2Data, null, 2));
      step2Data.ratings.forEach((rating, index) => {
        console.log(`   Rating ${index + 1}: ${rating.concept_id}`);
        console.log(`     Commonality Score: ${rating.commonality_score}/10`);
        console.log(`     Generation Success Score: ${rating.generation_success_score}/10`);
        console.log(`     Overall Score: ${rating.overall_score}/10`);
        console.log(`     Reasoning: ${rating.reasoning.substring(0, 60)}...`);
      });
      console.log('🏆 Best Concept Selected:');
      console.log(`   ID: ${step2Data.best_concept.concept_id}`);
      console.log(`   Title: ${step2Data.best_concept.title}`);
      console.log(`   Overall Score: ${step2Data.best_concept.overall_score}/10`);

      return { success: true, data: step2Data };

    } catch (error) {
      console.log('❌ Step 2 Error:', error);
      return { success: false, message: `Step 2 error: ${error}` };
    }
  }

  /**
   * Step 3: Identify minimum viable entities
   */
  private async executeStep3(keyword: string, bestConcept: Step2Result['best_concept']): Promise<{ success: boolean; data?: Step3Result; message?: string }> {
    try {
      console.log('📥 Step 3 Input:');
      console.log('   Keyword:', keyword);
      console.log('   Best Concept ID:', bestConcept.concept_id);
      console.log('   Best Concept Title:', bestConcept.title);
      
      // Fetch the prompt
      const promptResult = await fetchPromptByName('step3_entities');
      if (!promptResult.success || !promptResult.data) {
        console.log('❌ Failed to fetch prompt:', promptResult.message);
        return { success: false, message: promptResult.message };
      }
      console.log('📋 Prompt loaded successfully');

      // Process inputs with best concept from Step 2
      const processResult = await processInputs({
        userInput: { 
          keyword,
          best_concept: JSON.stringify(bestConcept, null, 2)
        },
        promptName: 'step3_entities'
      });
      if (!processResult.success || !processResult.data) {
        console.log('❌ Failed to process inputs:', processResult.message);
        return { success: false, message: processResult.message };
      }
      console.log('🔧 Inputs processed successfully');

      // Log the prompt being sent to OpenAI
      console.log('📋 STEP 3 PROMPT SENT TO OPENAI:');
      console.log('='.repeat(80));
      console.log(processResult.data);
      console.log('='.repeat(80));

      // Submit to OpenAI
      const submitResult = await submitPrompt({
        processedInput: processResult.data,
        promptConfig: {
          model: promptResult.data.model,
          temperature: promptResult.data.temperature,
          max_tokens: promptResult.data.max_tokens,
          top_p: promptResult.data.top_p,
          frequency_penalty: promptResult.data.frequency_penalty,
          presence_penalty: promptResult.data.presence_penalty,
          outputSchema: promptResult.data['output-schema']
        }
      });
      if (!submitResult.success || !submitResult.data) {
        console.log('❌ Failed to submit to OpenAI:', submitResult.message);
        return { success: false, message: submitResult.message };
      }

      console.log('🤖 OpenAI Response:');
      console.log('   Tokens Used:', submitResult.data.usage?.total_tokens || 'N/A');

      // Parse response
      const step3Data = JSON.parse(submitResult.data.content) as Step3Result;
      
      console.log('📤 Step 3 Output:');
      console.log('   Required Entities:', step3Data.required_entities.length);
      console.log('🔍 COMPLETE STEP 3 JSON OUTPUT:');
      console.log(JSON.stringify(step3Data, null, 2));
      step3Data.required_entities.forEach((entity, index) => {
        console.log(`   Entity ${index + 1}: ${entity.entity} (${entity.category})`);
        console.log(`     Importance: ${entity.importance}`);
        console.log(`     Description: ${entity.description.substring(0, 60)}...`);
        console.log(`     Potential Issues: ${entity.potential_issues.join(', ')}`);
      });
      console.log('🔬 Domain Validation:');
      console.log(`   Knowledge Applied: ${step3Data.domain_validation.domain_knowledge_applied.length} points`);
      console.log(`   Common Misconceptions: ${step3Data.domain_validation.common_misconceptions.length} identified`);
      console.log('🎯 Optimized Concept:');
      console.log(`   Title: ${step3Data.optimized_concept.title}`);
      console.log(`   Key Elements: ${step3Data.optimized_concept.key_elements.join(', ')}`);

      return { success: true, data: step3Data };

    } catch (error) {
      console.log('❌ Step 3 Error:', error);
      return { success: false, message: `Step 3 error: ${error}` };
    }
  }

  /**
   * Step 4: Create final optimized prompt
   */
  private async executeStep4(keyword: string, step3Data: Step3Result): Promise<{ success: boolean; data?: Step4Result; message?: string }> {
    try {
      console.log('📥 Step 4 Input:');
      console.log('   Keyword:', keyword);
      console.log('   Optimized Concept Title:', step3Data.optimized_concept.title);
      console.log('   Required Entities Count:', step3Data.required_entities.length);
      console.log('   Domain Validation Points:', step3Data.domain_validation.domain_knowledge_applied.length);
      
      // Fetch the prompt
      const promptResult = await fetchPromptByName('step4_final_prompt');
      if (!promptResult.success || !promptResult.data) {
        console.log('❌ Failed to fetch prompt:', promptResult.message);
        return { success: false, message: promptResult.message };
      }
      console.log('📋 Prompt loaded successfully');

      // Process inputs with data from Step 3
      const processResult = await processInputs({
        userInput: { 
          keyword,
          optimized_concept: JSON.stringify(step3Data.optimized_concept, null, 2),
          required_entities: JSON.stringify(step3Data.required_entities, null, 2),
          domain_validation: JSON.stringify(step3Data.domain_validation, null, 2)
        },
        promptName: 'step4_final_prompt'
      });
      if (!processResult.success || !processResult.data) {
        console.log('❌ Failed to process inputs:', processResult.message);
        return { success: false, message: processResult.message };
      }
      console.log('🔧 Inputs processed successfully');

      // Log the prompt being sent to OpenAI
      console.log('📋 STEP 4 PROMPT SENT TO OPENAI:');
      console.log('='.repeat(80));
      console.log(processResult.data);
      console.log('='.repeat(80));

      // Submit to OpenAI
      const submitResult = await submitPrompt({
        processedInput: processResult.data,
        promptConfig: {
          model: promptResult.data.model,
          temperature: promptResult.data.temperature,
          max_tokens: promptResult.data.max_tokens,
          top_p: promptResult.data.top_p,
          frequency_penalty: promptResult.data.frequency_penalty,
          presence_penalty: promptResult.data.presence_penalty,
          outputSchema: promptResult.data['output-schema']
        }
      });
      if (!submitResult.success || !submitResult.data) {
        console.log('❌ Failed to submit to OpenAI:', submitResult.message);
        return { success: false, message: submitResult.message };
      }

      console.log('🤖 OpenAI Response:');
      console.log('   Tokens Used:', submitResult.data.usage?.total_tokens || 'N/A');

      // Parse response
      const step4Data = JSON.parse(submitResult.data.content) as Step4Result;
      
      console.log('📤 Step 4 Output:');
      console.log('🎨 Final Image Title:', step4Data.image_title);
      console.log('📝 Structured Prompt Core:', step4Data.structured_prompt.core);
      console.log('🏗️  COMPLETE STRUCTURED PROMPT:');
      console.log(JSON.stringify(step4Data.structured_prompt, null, 2));
      console.log('🔍 Prompt Analysis:');
      console.log(`   Key Improvements: ${step4Data.prompt_analysis.key_improvements.length} identified`);
      console.log(`   Domain Accuracy: ${step4Data.prompt_analysis.domain_accuracy.substring(0, 60)}...`);
      console.log(`   Generation Optimization: ${step4Data.prompt_analysis.generation_optimization.substring(0, 60)}...`);
      console.log('✅ Quality Checks:');
      console.log(`   Anatomical Accuracy: ${step4Data.quality_checks.anatomical_accuracy ? '✅' : '❌'}`);
      console.log(`   Context Accuracy: ${step4Data.quality_checks.context_accuracy ? '✅' : '❌'}`);
      console.log(`   Domain Accuracy: ${step4Data.quality_checks.domain_accuracy ? '✅' : '❌'}`);
      console.log(`   Generation Feasibility: ${step4Data.quality_checks.generation_feasibility ? '✅' : '❌'}`);

      return { success: true, data: step4Data };

    } catch (error) {
      console.log('❌ Step 4 Error:', error);
      return { success: false, message: `Step 4 error: ${error}` };
    }
  }
}

// Export singleton instance
export const fourStepImageDescriptionService = new FourStepImageDescriptionService();
