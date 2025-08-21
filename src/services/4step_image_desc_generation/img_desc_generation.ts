import { fetchPromptByName } from '../../repositories/fetch_prompt';
import { processInputs } from '../process_input';
import { submitPrompt } from '../submit_prompt';

export interface Step1Result {
  concepts: Array<{
    id: string;
    title: string;
    description: string;
    key_elements: string[];
  }>;
}

export interface Step2Result {
  ratings: Array<{
    concept_id: string;
    commonality_score: number;
    generation_success_score: number;
    overall_score: number;
    reasoning: string;
  }>;
  best_concept: {
    concept_id: string;
    title: string;
    description: string;
    key_elements: string[];
    overall_score: number;
  };
}

export interface Step3Result {
  required_entities: Array<{
    entity: string;
    category: string;
    importance: string;
    description: string;
    potential_issues: string[];
  }>;
  domain_validation: {
    domain_knowledge_applied: string[];
    common_misconceptions: string[];
    accuracy_notes: string;
  };
  optimized_concept: {
    title: string;
    description: string;
    key_elements: string[];
  };
}

export interface Step4Result {
  image_description: string;
  image_title: string;
  prompt_analysis: {
    key_improvements: string[];
    domain_accuracy: string;
    generation_optimization: string;
  };
  quality_checks: {
    anatomical_accuracy: boolean;
    context_accuracy: boolean;
    domain_accuracy: boolean;
    generation_feasibility: boolean;
  };
}

export interface FourStepImageDescriptionResult {
  success: boolean;
  data?: {
    step1: Step1Result;
    step2: Step2Result;
    step3: Step3Result;
    step4: Step4Result;
    final_image_description: string;
    final_image_title: string;
    processing_time: number;
  };
  message?: string;
  error?: string;
}

export class FourStepImageDescriptionService {
  /**
   * Execute the complete 4-step image description generation process
   */
  async generateImageDescription(keyword: string): Promise<FourStepImageDescriptionResult> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting 4-step image description generation for:', keyword);

      // Step 1: Generate 3 concept variations
      console.log('📋 Step 1: Generating concept variations...');
      const step1Result = await this.executeStep1(keyword);
      if (!step1Result.success || !step1Result.data) {
        return {
          success: false,
          message: 'Step 1 failed',
          error: step1Result.message
        };
      }

      // Step 2: Rate the concepts
      console.log('📊 Step 2: Rating concepts for commonality...');
      const step2Result = await this.executeStep2(keyword, step1Result.data);
      if (!step2Result.success || !step2Result.data) {
        return {
          success: false,
          message: 'Step 2 failed',
          error: step2Result.message
        };
      }

      // Step 3: Identify minimum viable entities
      console.log('🔍 Step 3: Identifying minimum viable entities...');
      const step3Result = await this.executeStep3(keyword, step2Result.data.best_concept);
      if (!step3Result.success || !step3Result.data) {
        return {
          success: false,
          message: 'Step 3 failed',
          error: step3Result.message
        };
      }

      // Step 4: Create final optimized prompt
      console.log('🎨 Step 4: Creating final optimized prompt...');
      const step4Result = await this.executeStep4(keyword, step3Result.data);
      if (!step4Result.success || !step4Result.data) {
        return {
          success: false,
          message: 'Step 4 failed',
          error: step4Result.message
        };
      }

      const processingTime = Date.now() - startTime;
      console.log('✅ 4-step process completed in', processingTime, 'ms');

      return {
        success: true,
        data: {
          step1: step1Result.data,
          step2: step2Result.data,
          step3: step3Result.data,
          step4: step4Result.data,
          final_image_description: step4Result.data.image_description,
          final_image_title: step4Result.data.image_title,
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
   * Step 1: Generate 3 concept variations
   */
  private async executeStep1(keyword: string): Promise<{ success: boolean; data?: Step1Result; message?: string }> {
    try {
      // Fetch the prompt
      const promptResult = await fetchPromptByName('step1_idea_generation');
      if (!promptResult.success || !promptResult.data) {
        return { success: false, message: promptResult.message };
      }

      // Process inputs
      const processResult = await processInputs({
        userInput: { keyword },
        promptName: 'step1_idea_generation'
      });
      if (!processResult.success || !processResult.data) {
        return { success: false, message: processResult.message };
      }

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
        return { success: false, message: submitResult.message };
      }

      // Parse response
      const step1Data = JSON.parse(submitResult.data.content) as Step1Result;
      return { success: true, data: step1Data };

    } catch (error) {
      return { success: false, message: `Step 1 error: ${error}` };
    }
  }

  /**
   * Step 2: Rate concepts for commonality
   */
  private async executeStep2(keyword: string, step1Data: Step1Result): Promise<{ success: boolean; data?: Step2Result; message?: string }> {
    try {
      // Fetch the prompt
      const promptResult = await fetchPromptByName('step2_rating');
      if (!promptResult.success || !promptResult.data) {
        return { success: false, message: promptResult.message };
      }

      // Process inputs with concepts from Step 1
      const processResult = await processInputs({
        userInput: { 
          keyword,
          concepts: JSON.stringify(step1Data.concepts, null, 2)
        },
        promptName: 'step2_rating'
      });
      if (!processResult.success || !processResult.data) {
        return { success: false, message: processResult.message };
      }

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
        return { success: false, message: submitResult.message };
      }

      // Parse response
      const step2Data = JSON.parse(submitResult.data.content) as Step2Result;
      return { success: true, data: step2Data };

    } catch (error) {
      return { success: false, message: `Step 2 error: ${error}` };
    }
  }

  /**
   * Step 3: Identify minimum viable entities
   */
  private async executeStep3(keyword: string, bestConcept: Step2Result['best_concept']): Promise<{ success: boolean; data?: Step3Result; message?: string }> {
    try {
      // Fetch the prompt
      const promptResult = await fetchPromptByName('step3_entities');
      if (!promptResult.success || !promptResult.data) {
        return { success: false, message: promptResult.message };
      }

      // Process inputs with best concept from Step 2
      const processResult = await processInputs({
        userInput: { 
          keyword,
          best_concept: JSON.stringify(bestConcept, null, 2)
        },
        promptName: 'step3_entities'
      });
      if (!processResult.success || !processResult.data) {
        return { success: false, message: processResult.message };
      }

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
        return { success: false, message: submitResult.message };
      }

      // Parse response
      const step3Data = JSON.parse(submitResult.data.content) as Step3Result;
      return { success: true, data: step3Data };

    } catch (error) {
      return { success: false, message: `Step 3 error: ${error}` };
    }
  }

  /**
   * Step 4: Create final optimized prompt
   */
  private async executeStep4(keyword: string, step3Data: Step3Result): Promise<{ success: boolean; data?: Step4Result; message?: string }> {
    try {
      // Fetch the prompt
      const promptResult = await fetchPromptByName('step4_final_prompt');
      if (!promptResult.success || !promptResult.data) {
        return { success: false, message: promptResult.message };
      }

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
        return { success: false, message: processResult.message };
      }

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
        return { success: false, message: submitResult.message };
      }

      // Parse response
      const step4Data = JSON.parse(submitResult.data.content) as Step4Result;
      return { success: true, data: step4Data };

    } catch (error) {
      return { success: false, message: `Step 4 error: ${error}` };
    }
  }
}

// Export singleton instance
export const fourStepImageDescriptionService = new FourStepImageDescriptionService();
