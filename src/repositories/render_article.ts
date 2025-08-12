import * as fs from 'fs';
import * as path from 'path';

export class RenderArticleRepository {
  private readonly articlesPath: string;
  private readonly finalPath: string;

  constructor() {
    // Resolve source repository paths to ensure files are written/read from src tree
    const srcPath = path.join(__dirname, '..', '..', 'src', 'repositories');
    this.articlesPath = path.join(srcPath, 'articles');
    this.finalPath = path.join(srcPath, 'final');
    if (!fs.existsSync(this.finalPath)) fs.mkdirSync(this.finalPath, { recursive: true });
  }

  loadPhase4Article(keyword: string, filename?: string): any {
    const file = filename || `phase4_article_${this.sanitizeKeyword(keyword)}.json`;
    const filePath = path.join(this.articlesPath, file);
    if (!fs.existsSync(filePath)) throw new Error(`Phase 4 article not found: ${file}`);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  saveMarkdown(keyword: string, markdown: string): string {
    const file = `phase5_article_${this.sanitizeKeyword(keyword)}.md`;
    const filePath = path.join(this.finalPath, file);
    fs.writeFileSync(filePath, markdown, 'utf-8');
    return filePath;
  }

  private sanitizeKeyword(keyword: string): string {
    return keyword.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_').trim();
  }
}
