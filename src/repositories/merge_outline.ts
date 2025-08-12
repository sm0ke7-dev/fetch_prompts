import * as fs from 'fs';
import * as path from 'path';
import { 
  Phase2Outline, 
  BodyTermsData, 
  MergeOutlineRequest, 
  MergeOutlineResponse,
  MergedOutline 
} from '../models/repositories/merge_outline.model';

export class MergeOutlineRepository {
  private readonly dataPath: string;
  private readonly outlinesPath: string;
  private readonly optimizationTermsPath: string;

  constructor() {
    // When compiled, __dirname points to dist/repositories, so we need to go up to src/repositories
    const srcPath = path.join(__dirname, '..', '..', 'src', 'repositories');
    this.dataPath = path.join(srcPath, 'data');
    this.outlinesPath = path.join(srcPath, 'outlines');
    this.optimizationTermsPath = path.join(srcPath, 'optimization_terms');
  }

  /**
   * Load Phase 2 outline from JSON file
   */
  async loadPhase2Outline(keyword: string, filename?: string): Promise<Phase2Outline> {
    try {
      const outlineFile = filename || `phase2_outline_${this.sanitizeKeyword(keyword)}.json`;
      const outlinePath = path.join(this.outlinesPath, outlineFile);
      
      if (!fs.existsSync(outlinePath)) {
        throw new Error(`Phase 2 outline file not found: ${outlineFile}`);
      }

      const outlineData = JSON.parse(fs.readFileSync(outlinePath, 'utf-8'));
      return outlineData as Phase2Outline;
    } catch (error) {
      throw new Error(`Failed to load Phase 2 outline: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load body terms from optimization terms JSON file
   */
  async loadBodyTerms(keyword: string, filename?: string): Promise<BodyTermsData> {
    try {
      const termsFile = filename || `${this.sanitizeKeyword(keyword)}.json`;
      const termsPath = path.join(this.optimizationTermsPath, termsFile);
      
      if (!fs.existsSync(termsPath)) {
        throw new Error(`Optimization terms file not found: ${termsFile}`);
      }

      const termsData = JSON.parse(fs.readFileSync(termsPath, 'utf-8'));
      
      if (!termsData.body_terms) {
        throw new Error('Body terms not found in optimization terms file');
      }

      return termsData.body_terms as BodyTermsData;
    } catch (error) {
      throw new Error(`Failed to load body terms: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

           /**
          * Save merged outline to JSON file
          */
         async saveMergedOutline(mergedOutline: MergedOutline): Promise<void> {
           try {
             const filename = `phase3_merged_outline_${this.sanitizeKeyword(mergedOutline.keyword)}.json`;
             const outputPath = path.join(this.outlinesPath, filename);

             fs.writeFileSync(outputPath, JSON.stringify(mergedOutline, null, 2));
           } catch (error) {
             throw new Error(`Failed to save merged outline: ${error instanceof Error ? error.message : 'Unknown error'}`);
           }
         }

  /**
   * Format body terms for prompt input
   */
  formatBodyTermsForPrompt(bodyTerms: BodyTermsData): string {
    const basicTerms = bodyTerms.basic
      .sort((a, b) => b.usage_percentage - a.usage_percentage)
      .slice(0, 20) // Top 20 basic terms
      .map(term => `${term.term} (${term.usage_percentage}% usage, suggested: ${term.suggested_usage[0]}-${term.suggested_usage[1]} times)`)
      .join(', ');

    const extendedTerms = bodyTerms.extended
      .sort((a, b) => b.usage_percentage - a.usage_percentage)
      .slice(0, 15) // Top 15 extended terms
      .map(term => `${term.term} (${term.usage_percentage}% usage, suggested: ${term.suggested_usage[0]}-${term.suggested_usage[1]} times)`)
      .join(', ');

    return `Basic Terms: ${basicTerms}\nExtended Terms: ${extendedTerms}`;
  }

  /**
   * Format Phase 2 outline for prompt input
   */
  formatOutlineForPrompt(phase2Outline: Phase2Outline): string {
    return phase2Outline.outline.sections
      .map((section, index) => `${index + 1}. ${section.header}: ${section.description}`)
      .join('\n');
  }

  /**
   * Sanitize keyword for filename
   */
  private sanitizeKeyword(keyword: string): string {
    return keyword
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .trim();
  }
}
