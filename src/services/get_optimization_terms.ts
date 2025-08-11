import { NeuronWriterRepository } from '../repositories/optimization_terms/neuron_writer';
import { 
  GetOptimizationTermsRequest, 
  GetOptimizationTermsResponse, 
  OptimizationTerms,
  NeuronWriterApiConfig 
} from '../models';

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

      // Step 3: Extract optimization terms
      console.log('📊 Extracting optimization terms...');
      const optimizationTerms = this.extractOptimizationTerms(queryResult);

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
   * Extract optimization terms from NeuronWriter response
   */
  private extractOptimizationTerms(queryResult: any): OptimizationTerms {
    // Debug: Log the actual response structure
    console.log('🔍 Debug: Query result keys:', Object.keys(queryResult));
    console.log('🔍 Debug: Sample of query result:', JSON.stringify(queryResult, null, 2).substring(0, 1000));
    
    // Extract terms from the correct fields
    const terms = queryResult.terms || {};
    const ideas = queryResult.ideas || {};
    
    // Debug: Log the terms structure specifically
    console.log('🔍 Debug: Terms structure:', JSON.stringify(terms, null, 2).substring(0, 500));
    console.log('🔍 Debug: Ideas structure:', JSON.stringify(ideas, null, 2).substring(0, 500));
    console.log('🔍 Debug: Terms_txt:', JSON.stringify(queryResult.terms_txt, null, 2).substring(0, 1000));
    
    // Extract from terms_txt for more comprehensive data
    const termsTxt = queryResult.terms_txt || {};
    
    return {
      header_terms: termsTxt.h2?.split('\n').filter((t: string) => t.trim()) || terms.title?.map((t: any) => t.t) || [],
      body_terms: termsTxt.content_extended?.split('\n').filter((t: string) => t.trim()) || terms.desc?.map((t: any) => t.t) || [],
      entities: terms.entities?.map((e: any) => typeof e === 'string' ? e : e.t || e.name || e.text || JSON.stringify(e)) || [],
      suggested_questions: ideas.suggest_questions?.map((q: any) => q.q) || [],
      paa_questions: ideas.paa_questions?.map((q: any) => q.q) || ideas.paa?.map((q: any) => q.q) || [],
      content_questions: ideas.content_questions?.map((q: any) => q.q) || [],
      competitors: queryResult.competitors || []
    };
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

      // Extract optimization terms
      console.log('📊 Extracting optimization terms...');
      const optimizationTerms = this.extractOptimizationTerms(queryResult);

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
