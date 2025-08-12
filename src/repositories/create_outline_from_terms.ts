import { OptimizationTermsData } from '../models/services/outline_process_input.model';
import * as fs from 'fs';
import * as path from 'path';

export interface LoadTermsResponse {
  success: boolean;
  data?: OptimizationTermsData;
  error?: string;
  message: string;
}

/**
 * Loads optimization terms from JSON file in optimization_terms directory
 * @param keyword - The keyword to load terms for
 * @param filename - Optional: specific filename, defaults to keyword-based name
 * @returns Promise<LoadTermsResponse>
 */
export async function loadOptimizationTerms(
  keyword: string, 
  filename?: string
): Promise<LoadTermsResponse> {
  try {
    // Generate filename from keyword if not provided
    const termsFilename = filename || `${keyword.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_').trim()}.json`;
    
    // Define the path to the optimization_terms directory
    // When compiled, __dirname points to dist/repositories, so we need to go up to src/repositories/optimization_terms
    const termsDirectory = path.join(__dirname, '..', '..', 'src', 'repositories', 'optimization_terms');
    const filePath = path.join(termsDirectory, termsFilename);
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: 'TERMS_FILE_NOT_FOUND',
        message: `Optimization terms file not found: ${termsFilename}`
      };
    }

    try {
      // Read and parse the JSON file
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent) as OptimizationTermsData;
      
      // Validate that the data has required fields
      if (!data.keyword || !data.headings) {
        return {
          success: false,
          error: 'INVALID_TERMS_DATA',
          message: 'Optimization terms data is missing required fields'
        };
      }
      
      return {
        success: true,
        data: data,
        message: `Optimization terms loaded successfully for "${keyword}"`
      };
      
    } catch (parseError) {
      console.error(`Error parsing terms file ${termsFilename}:`, parseError);
      return {
        success: false,
        error: 'PARSE_ERROR',
        message: `Error parsing the optimization terms file: ${parseError}`
      };
    }
    
  } catch (error) {
    console.error('Error loading optimization terms:', error);
    return {
      success: false,
      error: 'LOAD_ERROR',
      message: 'An error occurred while loading optimization terms'
    };
  }
}

/**
 * Formats heading terms for use in the OpenAI prompt
 * @param termsData - The loaded optimization terms data
 * @returns Formatted string of heading terms
 */
export function formatHeadingTermsForPrompt(termsData: OptimizationTermsData): string {
  const h1Terms = termsData.headings.h1.slice(0, 5).map(t => `${t.term} (${t.usage_percentage}%)`);
  const h2Terms = termsData.headings.h2.slice(0, 8).map(t => `${t.term} (${t.usage_percentage}%)`);
  const h3Terms = termsData.headings.h3.slice(0, 5).map(t => `${t.term} (${t.usage_percentage}%)`);
  
  let formatted = '';
  
  if (h1Terms.length > 0) {
    formatted += `H1 Terms: ${h1Terms.join(', ')}\n`;
  }
  
  if (h2Terms.length > 0) {
    formatted += `H2 Terms: ${h2Terms.join(', ')}\n`;
  }
  
  if (h3Terms.length > 0) {
    formatted += `H3 Terms: ${h3Terms.join(', ')}\n`;
  }
  
  return formatted.trim();
}
