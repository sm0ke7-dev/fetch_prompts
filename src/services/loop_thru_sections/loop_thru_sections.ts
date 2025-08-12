import { LoopSectionRepository } from '../../repositories/loop_section';
import {
  LoopThruSectionsRequest,
  LoopThruSectionsResponse,
  ProcessSectionInputRequest,
  ProcessSectionInputResponse,
  SubmitSectionRequest,
  SubmitSectionResponse
} from '../../models/services/loop_sections/loop_thru_sections.model';

export class LoopThruSectionsService {
  private loopSectionRepository: LoopSectionRepository;

  constructor() {
    this.loopSectionRepository = new LoopSectionRepository();
  }

  /**
   * Main method to loop through sections and generate content
   */
  async loopThruSections(request: LoopThruSectionsRequest): Promise<LoopThruSectionsResponse> {
    const startTime = Date.now();
    
    try {
      console.log(`🚀 Starting Phase 4: Loop through sections for keyword: "${request.keyword}"`);

      // 1. Load Phase 3 outline
      console.log('📋 Loading Phase 3 merged outline...');
      const phase3Outline = await this.loopSectionRepository.loadPhase3Outline(
        request.keyword,
        request.phase3OutlineFile
      );

      // 2. Loop through each section and generate content
      console.log(`🔄 Processing ${phase3Outline.sections.length} sections...`);
      const phase4Sections = [];
      
      for (let i = 0; i < phase3Outline.sections.length; i++) {
        const section = phase3Outline.sections[i];
        console.log(`📝 Generating content for section ${i + 1}/${phase3Outline.sections.length}: "${section.headline}"`);
        
        const sectionContent = await this.generateSectionContent(section);
        if (!sectionContent.success) {
          return {
            success: false,
            message: `Failed to generate content for section "${section.headline}": ${sectionContent.message}`,
            error: sectionContent.error
          };
        }

        phase4Sections.push({
          ...section,
          content: sectionContent.data!.sectionContent,
          metadata: {
            processing_time_ms: Date.now(),
            token_usage: sectionContent.data!.usage
          }
        });
      }

      // 3. Create Phase 4 article
      const phase4Article = {
        keyword: phase3Outline.keyword,
        generated_at: new Date().toISOString(),
        phase: 4,
        sections: phase4Sections,
                 metadata: {
           processing_time_ms: Date.now(),
           total_sections: phase4Sections.length,
           total_word_count: this.loopSectionRepository.calculateTotalWordCount(phase4Sections),
           total_content_blocks: this.loopSectionRepository.calculateTotalContentBlocks(phase4Sections)
         }
      };

      // 4. Save Phase 4 article
      console.log('💾 Saving Phase 4 article...');
      await this.loopSectionRepository.savePhase4Article(phase4Article);

      const processingTime = Date.now() - startTime;
      console.log(`✅ Phase 4 completed in ${processingTime}ms`);

      return {
        success: true,
        data: {
          phase4Article,
          processing_time: processingTime
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      return {
        success: false,
        message: `Failed to loop through sections: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error,
        data: {
          phase4Article: {} as any,
          processing_time: processingTime
        }
      };
    }
  }

  /**
   * Generate content for a single section
   */
  private async generateSectionContent(section: any): Promise<SubmitSectionResponse> {
    try {
      // 1. Process section input
      const processResult = await this.processSectionInput({
        headline: section.headline,
        description: section.description,
        headerTerms: section["header-terms"],
        contentTerms: section["content-terms"]
      });

      if (!processResult.success) {
        return {
          success: false,
          message: `Failed to process section input: ${processResult.message}`,
          error: processResult.error
        };
      }

      // 2. Submit to OpenAI for content generation
      const submitResult = await this.submitSectionRequest({
        processedMessages: processResult.data!.processedMessages,
        promptConfig: processResult.data!.promptConfig
      });

      if (!submitResult.success) {
        return {
          success: false,
          message: `Failed to submit section request: ${submitResult.message}`,
          error: submitResult.error
        };
      }

      return {
        success: true,
        data: {
          sectionContent: submitResult.data!.sectionContent,
          usage: submitResult.data!.usage
        }
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to generate section content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error
      };
    }
  }

  /**
   * Process section input for OpenAI
   */
  private async processSectionInput(request: ProcessSectionInputRequest): Promise<ProcessSectionInputResponse> {
    try {
      // Use the existing processInputs service for variable substitution
      const { processInputs } = require('../process_input');
      
      const processResult = await processInputs({
        userInput: {
          headline: request.headline,
          description: request.description,
          header_terms: request.headerTerms.join(', '),
          content_terms: request.contentTerms.join(', ')
        },
        promptName: 'loop_prompt'
      });

      if (!processResult.success) {
        return {
          success: false,
          message: `Failed to process inputs: ${processResult.message}`,
          error: processResult.error
        };
      }

      // Load the loop prompt configuration for additional settings
      const promptConfig = await this.loadLoopPromptConfig();

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
        message: `Failed to process section input: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error
      };
    }
  }

  /**
   * Submit section request to OpenAI
   */
  private async submitSectionRequest(request: SubmitSectionRequest): Promise<SubmitSectionResponse> {
    try {
      // Use the existing submitPrompt service
      const { submitPrompt } = require('../submit_prompt');
      
      // Prepare the processed input for the submitPrompt service
      const processedInput = {
        processedSystemMessage: request.processedMessages.find(m => m.role === 'system')?.content || '',
        processedUserMessage: request.processedMessages.find(m => m.role === 'user')?.content || '',
        variables: {}
      };

      // Prepare the prompt config for the submitPrompt service
      const promptConfig = {
        model: request.promptConfig.model,
        temperature: request.promptConfig.temperature,
        max_tokens: request.promptConfig.max_tokens,
        top_p: request.promptConfig.top_p,
        frequency_penalty: request.promptConfig.frequency_penalty,
        presence_penalty: request.promptConfig.presence_penalty,
        outputSchema: request.promptConfig.output_schema
      };

      const openAIResponse = await submitPrompt({
        processedInput,
        promptConfig
      });

      if (!openAIResponse.success) {
        return {
          success: false,
          message: `OpenAI API call failed: ${openAIResponse.message}`,
          error: openAIResponse.error
        };
      }

      // Parse the response
      const parsedResponse = JSON.parse(openAIResponse.data!.content);
      
             return {
         success: true,
         data: {
           sectionContent: parsedResponse.section,
           usage: openAIResponse.data!.usage
         }
       };

    } catch (error) {
      return {
        success: false,
        message: `Failed to submit section request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error
      };
    }
  }

  /**
   * Load loop prompt configuration from JSON
   */
  private async loadLoopPromptConfig(): Promise<any> {
    const fs = require('fs');
    const path = require('path');
    
    const promptPath = path.join(__dirname, '..', '..', '..', 'src', 'repositories', 'data', 'loop_prompt.json');
    
    if (!fs.existsSync(promptPath)) {
      throw new Error('Loop prompt configuration file not found: loop_prompt.json');
    }

    return JSON.parse(fs.readFileSync(promptPath, 'utf-8'));
  }
}
