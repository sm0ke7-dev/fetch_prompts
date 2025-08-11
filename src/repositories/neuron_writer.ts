import { 
  NeuronWriterProject, 
  CreateQueryRequest, 
  CreateQueryResponse, 
  GetQueryRequest, 
  GetQueryResponse,
  NeuronWriterApiConfig 
} from '../models';
import * as fs from 'fs';
import * as path from 'path';

export class NeuronWriterRepository {
  private config: NeuronWriterApiConfig;

  constructor(config: NeuronWriterApiConfig) {
    this.config = config;
  }

  /**
   * Read keyword from keyword.json file
   * @returns Promise<string> The keyword from the JSON file
   */
  private async readKeywordFromFile(): Promise<string> {
    try {
      const keywordPath = path.join(__dirname, 'data', 'keyword.json');
      const fileContent = fs.readFileSync(keywordPath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      if (!data.keyword) {
        throw new Error('Keyword not found in keyword.json file');
      }
      
      return data.keyword;
    } catch (error) {
      console.error('Error reading keyword from file:', error);
      throw new Error(`Failed to read keyword from keyword.json: ${error}`);
    }
  }

  /**
   * Get list of available projects
   */
  async listProjects(): Promise<NeuronWriterProject[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/list-projects`, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.config.apiKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: this.config.timeout ? AbortSignal.timeout(this.config.timeout) : undefined,
      });

      if (!response.ok) {
        throw new Error(`NeuronWriter API error: ${response.status} ${response.statusText}`);
      }

      const projects = await response.json();
      return projects as NeuronWriterProject[];
    } catch (error) {
      console.error('Error fetching projects from NeuronWriter:', error);
      throw error;
    }
  }

  /**
   * Create a new query for keyword analysis
   */
  async createQuery(request: CreateQueryRequest): Promise<CreateQueryResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/new-query`, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.config.apiKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: this.config.timeout ? AbortSignal.timeout(this.config.timeout) : undefined,
      });

      if (!response.ok) {
        throw new Error(`NeuronWriter API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result as CreateQueryResponse;
    } catch (error) {
      console.error('Error creating query in NeuronWriter:', error);
      throw error;
    }
  }

  /**
   * Get query results and check status
   */
  async getQuery(request: GetQueryRequest): Promise<GetQueryResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/get-query`, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.config.apiKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: this.config.timeout ? AbortSignal.timeout(this.config.timeout) : undefined,
      });

      if (!response.ok) {
        throw new Error(`NeuronWriter API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result as GetQueryResponse;
    } catch (error) {
      console.error('Error fetching query from NeuronWriter:', error);
      throw error;
    }
  }

  /**
   * Wait for query to be ready and return results
   * Increased timeout to 5 minutes to handle longer processing times
   */
  async waitForQueryReady(queryId: string, maxWaitTime: number = 300000): Promise<GetQueryResponse> {
    const startTime = Date.now();
    const pollInterval = 5000; // 5 seconds

    console.log(`⏳ Waiting for query ${queryId} to complete (max ${maxWaitTime/1000}s)...`);

    while (Date.now() - startTime < maxWaitTime) {
      const queryResult = await this.getQuery({ query: queryId });

      if (queryResult.status === 'ready') {
        console.log(`✅ Query ${queryId} completed successfully!`);
        return queryResult;
      }

      if (queryResult.status === 'not found') {
        throw new Error(`Query ${queryId} not found`);
      }

      // Log progress every 30 seconds
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      if (elapsed % 30 === 0) {
        console.log(`⏳ Still waiting... (${elapsed}s elapsed, status: ${queryResult.status})`);
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Query ${queryId} did not complete within ${maxWaitTime/1000} seconds. The query may require manual competitor selection.`);
  }

  /**
   * List all queries for a specific project to check for recent requests
   */
  async listAllQueries(projectId: string): Promise<GetQueryResponse[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/list-queries`, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.config.apiKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project: projectId }),
        signal: this.config.timeout ? AbortSignal.timeout(this.config.timeout) : undefined,
      });

      if (!response.ok) {
        throw new Error(`NeuronWriter API error: ${response.status} ${response.statusText}`);
      }

      const queries = await response.json();
      return queries as GetQueryResponse[];
    } catch (error) {
      console.error('Error listing queries from NeuronWriter:', error);
      throw error;
    }
  }

  /**
   * Create a new query using keyword from keyword.json file
   * @param projectId - The project ID to create the query in
   * @param engine - Search engine (default: 'google.com')
   * @param language - Language (default: 'English')
   * @returns Promise<CreateQueryResponse>
   */
  async createQueryFromFile(
    projectId: string, 
    engine: string = 'google.com', 
    language: string = 'English'
  ): Promise<CreateQueryResponse> {
    try {
      const keyword = await this.readKeywordFromFile();
      console.log(`📖 Creating query for keyword from file: "${keyword}"`);
      
      return await this.createQuery({
        project: projectId,
        keyword: keyword,
        engine: engine,
        language: language
      });
    } catch (error) {
      console.error('Error creating query from file:', error);
      throw error;
    }
  }

  /**
   * Get current keyword from keyword.json file
   * @returns Promise<string> The current keyword
   */
  async getCurrentKeyword(): Promise<string> {
    return await this.readKeywordFromFile();
  }

  /**
   * Check if there's an existing query for the current keyword in keyword.json
   * @param projectId - The project ID to check
   * @returns Promise<GetQueryResponse | null> Existing query or null
   */
  async findExistingQueryForCurrentKeyword(projectId: string): Promise<GetQueryResponse | null> {
    try {
      const keyword = await this.readKeywordFromFile();
      const allQueries = await this.listAllQueries(projectId);
      
      const existingQuery = allQueries.find(q => q.keyword === keyword);
      if (existingQuery && existingQuery.query) {
        console.log(`🔄 Found existing query for "${keyword}": ${existingQuery.query}`);
        // Get full query details
        return await this.getQuery({ query: existingQuery.query });
      }
      
      return null;
    } catch (error) {
      console.error('Error finding existing query for current keyword:', error);
      throw error;
    }
  }
}
