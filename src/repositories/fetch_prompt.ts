import { PromptConfig, PromptResponse, ErrorResponse } from '../models/fetch_prompts_model';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Fetches a prompt by name from the data directory
 * @param promptName - The name of the prompt to fetch
 * @returns Promise<PromptResponse | ErrorResponse>
 */
export async function fetchPromptByName(promptName: string): Promise<PromptResponse | ErrorResponse> {
  try {
    // Define the path to the data directory
    const dataDirectory = path.join(__dirname, 'data');
    
    // Check if the data directory exists
    if (!fs.existsSync(dataDirectory)) {
      return {
        success: false,
        error: 'DATA_DIRECTORY_NOT_FOUND',
        message: 'Data directory not found'
      };
    }

    // Read all files in the data directory
    const files = fs.readdirSync(dataDirectory);
    
    // Filter for JSON files
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
         // Search for the specific JSON file by name
     const targetFile = `${promptName}.json`;
     
     if (jsonFiles.includes(targetFile)) {
       const filePath = path.join(dataDirectory, targetFile);
       
       try {
         // Read and parse the JSON file
         const fileContent = fs.readFileSync(filePath, 'utf-8');
         const data = JSON.parse(fileContent);
         
         // Validate that the prompt has required fields
         if (!data.model || !data.system) {
           return {
             success: false,
             error: 'INVALID_PROMPT_DATA',
             message: 'Prompt data is missing required fields (model or system)'
           };
         }
         
         return {
           success: true,
           data: data as PromptConfig,
           message: `Prompt '${promptName}' found successfully`
         };
              } catch (parseError) {
          console.error(`Error parsing file ${targetFile}:`, parseError);
          return {
            success: false,
            error: 'PARSE_ERROR',
            message: `Error parsing the prompt file: ${parseError}`
          };
        }
    }
    
    // If we get here, the prompt wasn't found
    return {
      success: false,
      error: 'PROMPT_NOT_FOUND',
      message: `Prompt '${promptName}' not found in any data files`
    };
    
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return {
      success: false,
      error: 'FETCH_ERROR',
      message: 'An error occurred while fetching the prompt'
    };
  }
}
