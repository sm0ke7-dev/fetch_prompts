import { Request, Response } from 'express';
import { GetOptimizationTermsService } from '../services/get_optimization_terms';
import { generateArticleOutline } from '../services/outline_submit_retrieve_output';
import { mergeOutlineWithTerms } from '../services/merge_outline_with_nw_terms';
import { LoopThruSectionsService } from '../services/loop_thru_sections/loop_thru_sections';
import { RenderArticleService } from '../services/render_article';
import { TextMediaRequest, TextMediaResponse } from '../models/services/text_media_creator.model';

export const textMediaCreatorController = {
  /**
   * Generate complete content pipeline via HTTP request
   */
  async generateContent(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Validate request body
      const { keyword }: TextMediaRequest = req.body;
      
      if (!keyword || typeof keyword !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Missing or invalid keyword in request body'
        });
        return;
      }

      console.log(`🚀 HTTP API: Starting content generation for keyword: "${keyword}"`);

      // Phase 1: NeuronWriter Terms
      const phase1Start = Date.now();
      console.log('📋 Phase 1: Generating optimization terms...');
      
      const config = {
        apiKey: process.env.NEURONWRITER_API_KEY!,
        baseUrl: 'https://app.neuronwriter.com/neuron-api/0.5/writer',
        timeout: 30000
      };
      
      const optimizationService = new GetOptimizationTermsService(config);
      
      // Get NeuronWriter project
      const projects = await optimizationService.listProjects();
      if (projects.length === 0) {
        throw new Error('No NeuronWriter projects found');
      }
      const projectId = projects[0].project;
      
      const phase1Result = await optimizationService.getOptimizationTerms({
        keyword: keyword,
        projectId: projectId,
        engine: 'google.com',
        language: 'English'
      });
      
      if (!phase1Result.success) {
        throw new Error(`Phase 1 failed: ${phase1Result.message}`);
      }
      
      // Save Phase 1 results
      if (!phase1Result.data) {
        throw new Error('Phase 1 result data is missing');
      }
      
      const saveResult = await optimizationService.saveOptimizationTermsToFileByQueryId(
        phase1Result.data.query_id, 
        keyword
      );
      
      if (!saveResult.success) {
        throw new Error(`Failed to save Phase 1 results: ${saveResult.message}`);
      }
      
      const phase1Time = Date.now() - phase1Start;
      console.log(`✅ Phase 1 completed in ${phase1Time}ms`);

      // Phase 2: Article Outline
      const phase2Start = Date.now();
      console.log('📋 Phase 2: Generating article outline...');
      
      const phase2Result = await generateArticleOutline({ keyword });
      if (!phase2Result.success) {
        throw new Error(`Phase 2 failed: ${phase2Result.message}`);
      }
      
      const phase2Time = Date.now() - phase2Start;
      console.log(`✅ Phase 2 completed in ${phase2Time}ms`);

      // Phase 3: Merge Outline with Terms
      const phase3Start = Date.now();
      console.log('📋 Phase 3: Merging outline with body terms...');
      
      const phase3Result = await mergeOutlineWithTerms({ keyword });
      if (!phase3Result.success) {
        throw new Error(`Phase 3 failed: ${phase3Result.message}`);
      }
      
      const phase3Time = Date.now() - phase3Start;
      console.log(`✅ Phase 3 completed in ${phase3Time}ms`);

      // Phase 4: Generate Section Content
      const phase4Start = Date.now();
      console.log('📋 Phase 4: Generating section content...');
      
      const loopService = new LoopThruSectionsService();
      const phase4Result = await loopService.loopThruSections({ keyword });
      if (!phase4Result.success) {
        throw new Error(`Phase 4 failed: ${phase4Result.message}`);
      }
      
      const phase4Time = Date.now() - phase4Start;
      console.log(`✅ Phase 4 completed in ${phase4Time}ms`);

      // Phase 5: Render Final Article
      const phase5Start = Date.now();
      console.log('📋 Phase 5: Rendering final article...');
      
      const renderService = new RenderArticleService();
      const phase5Result = await renderService.renderMarkdown({ keyword });
      if (!phase5Result.success) {
        throw new Error(`Phase 5 failed: ${phase5Result.message}`);
      }
      
      const phase5Time = Date.now() - phase5Start;
      console.log(`✅ Phase 5 completed in ${phase5Time}ms`);

      // Prepare response
      const totalTime = Date.now() - startTime;
      const sanitizedKeyword = keyword.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_').trim();
      
      const response: TextMediaResponse = {
        success: true,
        data: {
          keyword: keyword,
          processing_time: totalTime,
          phases: {
            phase1: { status: 'completed', time: phase1Time },
            phase2: { status: 'completed', time: phase2Time },
            phase3: { status: 'completed', time: phase3Time },
            phase4: { status: 'completed', time: phase4Time },
            phase5: { status: 'completed', time: phase5Time }
          },
          output_files: {
            terms: `src/repositories/optimization_terms/${sanitizedKeyword}.json`,
            outline: `src/repositories/outlines/phase2_outline_${sanitizedKeyword}.json`,
            merged: `src/repositories/outlines/phase3_merged_outline_${sanitizedKeyword}.json`,
            content: `src/repositories/articles/phase4_article_${sanitizedKeyword}.json`,
            final: `src/repositories/final/phase5_article_${sanitizedKeyword}.md`
          },
          content_summary: {
            sections: phase4Result.data?.phase4Article.sections.length || 0,
            word_count: phase4Result.data?.phase4Article.metadata.total_word_count || 0,
            content_blocks: phase4Result.data?.phase4Article.metadata.total_content_blocks || 0
          }
        },
        message: 'Content generation completed successfully'
      };

      console.log(`🎉 HTTP API: Content generation completed in ${totalTime}ms`);
      res.status(200).json(response);

    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error(`❌ HTTP API: Content generation failed after ${totalTime}ms:`, error);
      
      res.status(500).json({
        success: false,
        message: 'Content generation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
