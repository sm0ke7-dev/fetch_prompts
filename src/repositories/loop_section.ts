import * as fs from 'fs';
import * as path from 'path';
import { 
  Phase3MergedOutline, 
  Phase4Article,
  LoopSectionsRequest,
  LoopSectionsResponse
} from '../models/repositories/loop_sections.model';

export class LoopSectionRepository {
  private readonly outlinesPath: string;
  private readonly articlesPath: string;

  constructor() {
    // Use source paths instead of dist paths
    const srcPath = path.join(__dirname, '..', '..', 'src', 'repositories');
    this.outlinesPath = path.join(srcPath, 'outlines');
    this.articlesPath = path.join(srcPath, 'articles');
    
    // Ensure articles directory exists
    if (!fs.existsSync(this.articlesPath)) {
      fs.mkdirSync(this.articlesPath, { recursive: true });
    }
  }

  /**
   * Load Phase 3 merged outline from JSON file
   */
  async loadPhase3Outline(keyword: string, filename?: string): Promise<Phase3MergedOutline> {
    try {
      const outlineFile = filename || `phase3_merged_outline_${this.sanitizeKeyword(keyword)}.json`;
      const outlinePath = path.join(this.outlinesPath, outlineFile);
      
      if (!fs.existsSync(outlinePath)) {
        throw new Error(`Phase 3 outline file not found: ${outlineFile}`);
      }

      const outlineData = JSON.parse(fs.readFileSync(outlinePath, 'utf-8'));
      return outlineData as Phase3MergedOutline;
    } catch (error) {
      throw new Error(`Failed to load Phase 3 outline: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save Phase 4 article to JSON file
   */
  async savePhase4Article(phase4Article: Phase4Article): Promise<void> {
    try {
      const filename = `phase4_article_${this.sanitizeKeyword(phase4Article.keyword)}.json`;
      const outputPath = path.join(this.articlesPath, filename);

      fs.writeFileSync(outputPath, JSON.stringify(phase4Article, null, 2));
    } catch (error) {
      throw new Error(`Failed to save Phase 4 article: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Format section data for prompt input
   */
  formatSectionForPrompt(section: any): string {
    return `headline: ${section.headline}\ndescription: ${section.description}\nheader_terms: ${section["header-terms"].join(', ')}\ncontent_terms: ${section["content-terms"].join(', ')}`;
  }

  /**
   * Calculate total word count from all sections
   */
  calculateTotalWordCount(sections: any[]): number {
    return sections.reduce((total, section) => {
      if (!section.content?.content) return total;
      
      return total + section.content.content.reduce((sectionTotal: number, block: any) => {
        if (block.type === 'paragraph' && typeof block.content === 'string') {
          return sectionTotal + block.content.split(' ').length;
        } else if (Array.isArray(block.content)) {
          return sectionTotal + block.content.reduce((blockTotal: number, item: string) => {
            return blockTotal + item.split(' ').length;
          }, 0);
        }
        return sectionTotal;
      }, 0);
    }, 0);
  }

  /**
   * Calculate total content blocks from all sections
   */
  calculateTotalContentBlocks(sections: any[]): number {
    return sections.reduce((total, section) => {
      return total + (section.content?.content?.length || 0);
    }, 0);
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
