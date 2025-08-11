import { 
  NeuronWriterProject, 
  CreateQueryRequest, 
  CreateQueryResponse, 
  GetQueryRequest, 
  GetQueryResponse,
  NeuronWriterApiConfig 
} from '../models';

export class NeuronWriterRepository {
  private config: NeuronWriterApiConfig;

  constructor(config: NeuronWriterApiConfig) {
    this.config = config;
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
}
