import { NeuronWriterRepository } from '../repositories/optimization_terms/neuron_writer';
import { 
  GetOptimizationTermsRequest, 
  GetOptimizationTermsResponse, 
  OptimizationTerms,
  NeuronWriterApiConfig,
  StructuredTerm,
  StructuredHeadingTerms,
  StructuredBodyTerms,
  GetQueryResponse
} from '../models';
import fs from 'fs';
import path from 'path';

export class GetOptimizationTermsService {
  private repository: NeuronWriterRepository;

  constructor(config: NeuronWriterApiConfig) {
    this.repository = new NeuronWriterRepository(config);
  }

  /**
   * Main service method to get optimization terms for a keyword
   */
  async getOptimizationTerms(request: GetOptimizationTermsRequest): Promise<GetOptimizationTermsResponse> {
    const startTime = Date.now();

    try {
      console.log(`🚀 Starting optimization terms analysis for keyword: "${request.keyword}"`);

      // Check for recent requests
      const recentQuery = await this.findRecentQuery(request.keyword, request.projectId);
      if (recentQuery && recentQuery.query) {
        console.log(`🔄 Using recent query with ID: ${recentQuery.query}`);
        return this.getOptimizationTermsFromExistingQuery(recentQuery.query);
      }

      // Step 1: Create a new query
      console.log('📝 Creating NeuronWriter query...');
      const createQueryResponse = await this.repository.createQuery({
        project: request.projectId,
        keyword: request.keyword,
        engine: request.engine || 'google.com',
        language: request.language || 'English'
      });

      const queryId = createQueryResponse.query;
      console.log(`✅ Query created with ID: ${queryId}`);

      // Step 2: Wait for query to be ready
      console.log('⏳ Waiting for analysis to complete...');
      const queryResult = await this.repository.waitForQueryReady(queryId);

      // Step 3: Extract optimization terms using structured parser
      console.log('📊 Extracting optimization terms...');
      const optimizationTerms = this.extractStructuredOptimizationTerms(queryResult);

      const processingTime = Date.now() - startTime;

      console.log(`✅ Optimization terms analysis completed in ${processingTime}ms`);

      return {
        success: true,
        data: {
          query_id: queryId,
          optimization_terms: optimizationTerms,
          query_url: createQueryResponse.query_url,
          processing_time: processingTime
        },
        message: `Successfully retrieved optimization terms for "${request.keyword}"`
      };

    } catch (error) {
      console.error('❌ Error in getOptimizationTerms:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: `Failed to get optimization terms for "${request.keyword}"`
      };
    }
  }

  /**
   * Find recent query for the same keyword
   */
  private async findRecentQuery(keyword: string, projectId: string): Promise<GetQueryResponse | null> {
    try {
      // Fetch all queries for the project and filter by keyword
      const allQueries = await this.repository.listAllQueries(projectId);
      const recentQuery = allQueries.find(query => query.keyword === keyword && query.status === 'ready');
      return recentQuery || null;
    } catch (error) {
      console.error('Error finding recent query:', error);
    }
    return null;
  }

  /**
   * Structured parser that transforms raw NeuronWriter output into consistent format
   */
  private extractStructuredOptimizationTerms(queryResult: GetQueryResponse): OptimizationTerms {
    console.log('🔍 Parsing raw NeuronWriter response into structured format...');
    
    const terms = queryResult.terms || {};
    const termsTxt = queryResult.terms_txt || {};
    const ideas = queryResult.ideas || {};

    // Parse structured heading terms
    const headings: StructuredHeadingTerms = {
      h1: this.parseStructuredTerms(terms.h1 || [], 'h1'),
      h2: this.parseStructuredTerms(terms.h2 || [], 'h2'),
      h3: this.parseStructuredTerms(terms.h3 || [], 'h3')
    };

    // Parse structured body terms
    const bodyTerms: StructuredBodyTerms = {
      basic: this.parseStructuredTerms(terms.content_basic || [], 'basic'),
      extended: this.parseStructuredTerms(terms.content_extended || [], 'extended')
    };

    // Parse entities with full structure
    const entities = terms.entities?.map(entity => ({
      term: entity.t || JSON.stringify(entity),
      importance: entity.importance || 0,
      relevance: entity.relevance || 0,
      confidence: entity.confidence || 0,
      links: entity.links || []
    })) || [];

    // Parse questions
    const suggested_questions = ideas.suggest_questions?.map((q: { q: string }) => q.q) || [];
    const paa_questions = ideas.people_also_ask?.map((q: { q: string }) => q.q) || [];
    const content_questions = ideas.content_questions?.map((q: { q: string }) => q.q) || [];

    console.log(`📊 Structured parsing complete:`);
    console.log(`   H1 Terms: ${headings.h1.length}`);
    console.log(`   H2 Terms: ${headings.h2.length}`);
    console.log(`   H3 Terms: ${headings.h3.length}`);
    console.log(`   Basic Body Terms: ${bodyTerms.basic.length}`);
    console.log(`   Extended Body Terms: ${bodyTerms.extended.length}`);
    console.log(`   Entities: ${entities.length}`);
    console.log(`   Questions: ${suggested_questions.length + paa_questions.length + content_questions.length}`);

    return {
      headings,
      body_terms: bodyTerms,
      entities,
      suggested_questions,
      paa_questions,
      content_questions,
      competitors: [] // Omitted as per plan
    };
  }

  /**
   * Parse raw terms into structured format with usage data
   */
  private parseStructuredTerms(rawTerms: any[], termType: string): StructuredTerm[] {
    if (!Array.isArray(rawTerms)) {
      console.log(`⚠️  No ${termType} terms found or invalid format`);
      return [];
    }

    return rawTerms.map(term => {
      const structuredTerm: StructuredTerm = {
        term: term.t || term.term || term.text || JSON.stringify(term),
        usage_percentage: term.usage_pc || term.usage_percentage || 0
      };

      // Add suggested usage range if available
      if (term.sugg_usage && Array.isArray(term.sugg_usage) && term.sugg_usage.length === 2) {
        structuredTerm.suggested_usage = term.sugg_usage as [number, number];
      }

      return structuredTerm;
    });
  }

  /**
   * Get optimization terms from an existing query (where competitors have been accepted)
   */
  async getOptimizationTermsFromExistingQuery(queryId: string): Promise<GetOptimizationTermsResponse> {
    const startTime = Date.now();

    try {
      console.log(`🔍 Fetching optimization terms from existing query: ${queryId}`);

      // Get the query results directly
      const queryResult = await this.repository.getQuery({ query: queryId });

      if (queryResult.status !== 'ready') {
        return {
          success: false,
          error: `Query is not ready. Status: ${queryResult.status}`,
          message: `Query ${queryId} is not ready for analysis`
        };
      }

      // Extract optimization terms using structured parser
      console.log('📊 Extracting optimization terms...');
      const optimizationTerms = this.extractStructuredOptimizationTerms(queryResult);

      const processingTime = Date.now() - startTime;

      console.log(`✅ Optimization terms fetched in ${processingTime}ms`);

      return {
        success: true,
        data: {
          query_id: queryId,
          optimization_terms: optimizationTerms,
          query_url: `https://app.neuronwriter.com/analysis/view/${queryId}`,
          processing_time: processingTime
        },
        message: `Successfully retrieved optimization terms from query ${queryId}`
      };

    } catch (error) {
      console.error('❌ Error in getOptimizationTermsFromExistingQuery:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: `Failed to get optimization terms from query ${queryId}`
      };
    }
  }

  /**
   * Get list of available projects
   */
  async listProjects() {
    try {
      return await this.repository.listProjects();
    } catch (error) {
      console.error('Error listing projects:', error);
      throw error;
    }
  }
}
