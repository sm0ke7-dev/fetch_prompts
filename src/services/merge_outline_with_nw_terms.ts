import { MergeOutlineRepository } from '../repositories/merge_outline';
import { 
  MergeOutlineWithNWTermsRequest, 
  MergeOutlineWithNWTermsResponse,
  ProcessMergeInputRequest,
  ProcessMergeInputResponse,
  SubmitMergeRequest,
  SubmitMergeResponse
} from '../models/services/merge_outline_with_nw_terms.model';

export class MergeOutlineWithNWTermsService {
  private mergeOutlineRepository: MergeOutlineRepository;

  constructor() {
    this.mergeOutlineRepository = new MergeOutlineRepository();
  }

  /**
   * Main method to merge Phase 2 outline with NeuronWriter body terms
   */
  async mergeOutlineWithNWTerms(request: MergeOutlineWithNWTermsRequest): Promise<MergeOutlineWithNWTermsResponse> {
    const startTime = Date.now();
    
    try {
      console.log(`🚀 Starting Phase 3: Merge outline with body terms for keyword: "${request.keyword}"`);

      // 1. Load Phase 2 outline
      console.log('📋 Loading Phase 2 outline...');
      const phase2Outline = await this.mergeOutlineRepository.loadPhase2Outline(
        request.keyword, 
        request.phase2OutlineFile
      );

      // 2. Load body terms from optimization terms
      console.log('🔍 Loading body terms from optimization data...');
      const bodyTerms = await this.mergeOutlineRepository.loadBodyTerms(
        request.keyword, 
        request.optimizationTermsFile
      );

      // 3. Process inputs for OpenAI
      console.log('⚙️ Processing merge inputs...');
      const processResult = await this.processMergeInputs({
        keyword: request.keyword,
        articleOutline: this.mergeOutlineRepository.formatOutlineForPrompt(phase2Outline),
        bodyTerms: this.mergeOutlineRepository.formatBodyTermsForPrompt(bodyTerms)
      });

      if (!processResult.success) {
        return {
          success: false,
          message: `Failed to process merge inputs: ${processResult.message}`,
          error: processResult.error
        };
      }

      // 4. Submit to OpenAI for merging
      console.log('🤖 Submitting merge request to OpenAI...');
      const submitResult = await this.submitMergeRequest({
        processedMessages: processResult.data!.processedMessages,
        promptConfig: processResult.data!.promptConfig,
        keyword: request.keyword
      });

      if (!submitResult.success) {
        return {
          success: false,
          message: `Failed to submit merge request: ${submitResult.message}`,
          error: submitResult.error
        };
      }

      // 5. Save merged outline
      console.log('💾 Saving merged outline...');
      await this.mergeOutlineRepository.saveMergedOutline(submitResult.data!.mergedOutline);

      const processingTime = Date.now() - startTime;
      console.log(`✅ Phase 3 completed in ${processingTime}ms`);

      return {
        success: true,
        data: {
          mergedOutline: submitResult.data!.mergedOutline,
          processing_time: processingTime,
          usage: submitResult.data!.usage
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      return {
        success: false,
        message: `Failed to merge outline with NW terms: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error,
        data: {
          mergedOutline: {} as any,
          processing_time: processingTime
        }
      };
    }
  }

  /**
   * Process inputs for OpenAI merge request
   */
  private async processMergeInputs(request: ProcessMergeInputRequest): Promise<ProcessMergeInputResponse> {
    try {
      // Use the existing processInputs service for variable substitution
      const { processInputs } = require('./process_input');
      
      const processResult = await processInputs({
        userInput: {
          article_outline: request.articleOutline,
          body_terms: request.bodyTerms
        },
        promptName: 'outline_kw_merge_prompt'
      });

      if (!processResult.success) {
        return {
          success: false,
          message: `Failed to process inputs: ${processResult.message}`,
          error: processResult.error
        };
      }

      // Load the merge prompt configuration for additional settings
      const promptConfig = await this.loadMergePromptConfig();

      return {
        success: true,
        data: {
          processedMessages: [
            {
              role: 'system' as const,
              content: processResult.data!.processedSystemMessage
            },
            {
              role: 'user' as const,
              content: processResult.data!.processedUserMessage
            }
          ],
          promptConfig: {
            model: promptConfig.model,
            temperature: promptConfig.temperature,
            max_tokens: promptConfig.max_tokens,
            top_p: promptConfig.top_p,
            frequency_penalty: promptConfig.frequency_penalty,
            presence_penalty: promptConfig.presence_penalty,
            output_schema: promptConfig['output-schema']
          }
        }
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to process merge inputs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error
      };
    }
  }

  /**
   * Submit merge request to OpenAI
   */
  private async submitMergeRequest(request: SubmitMergeRequest): Promise<SubmitMergeResponse> {
    try {
      // Use the separate submit/pull service
      const { submitMergeOutline } = require('./merge_outline_submit_pull');
      
      const submitResult = await submitMergeOutline({
        processedMessages: request.processedMessages,
        promptConfig: request.promptConfig,
        keyword: request.keyword
      });

      if (!submitResult.success) {
        return {
          success: false,
          message: submitResult.message,
          error: submitResult.error
        };
      }

      return {
        success: true,
        data: {
          mergedOutline: submitResult.data!.mergedOutline,
          usage: submitResult.data!.usage
        }
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to submit merge request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error
      };
    }
  }

  /**
   * Load merge prompt configuration from JSON
   */
  private async loadMergePromptConfig(): Promise<any> {
    const fs = require('fs');
    const path = require('path');
    
    const promptPath = path.join(__dirname, '..', '..', 'src', 'repositories', 'data', 'outline_kw_merge_prompt.json');
    
    if (!fs.existsSync(promptPath)) {
      throw new Error('Merge prompt configuration file not found: outline_kw_merge_prompt.json');
    }

    return JSON.parse(fs.readFileSync(promptPath, 'utf-8'));
  }
}

/**
 * Convenience function to merge outline with NW terms
 */
export async function mergeOutlineWithTerms(request: { keyword: string }): Promise<any> {
  const service = new MergeOutlineWithNWTermsService();
  return service.mergeOutlineWithNWTerms({
    keyword: request.keyword,
    phase2OutlineFile: undefined,
    optimizationTermsFile: undefined
  });
}
