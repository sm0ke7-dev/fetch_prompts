import { RenderArticleRepository } from '../repositories/render_article';
import { RenderArticleRequest, RenderArticleResponse } from '../models/services/render_article.model';

export class RenderArticleService {
  private repo: RenderArticleRepository;
  constructor() {
    this.repo = new RenderArticleRepository();
  }

  async renderMarkdown(request: RenderArticleRequest): Promise<RenderArticleResponse> {
    const start = Date.now();
    try {
      const phase4 = this.repo.loadPhase4Article(request.keyword, request.phase4ArticleFile);

      const md = this.buildMarkdown(phase4);
      const outPath = this.repo.saveMarkdown(phase4.keyword || request.keyword, md);

      return {
        success: true,
        data: {
          markdown: md,
          output_path: outPath,
          processing_time: Date.now() - start
        }
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
        error
      };
    }
  }

  private buildMarkdown(phase4: any): string {
    const lines: string[] = [];

    // Title removed — redundant with WordPress ACF hero title

    // Sections
    phase4.sections.forEach((section: any, idx: number) => {
      const sectionHeadline = section.content?.headline || section.headline;
      const cleanHeadline = this.toTitleCase(this.stripHtml(sectionHeadline));
      lines.push(`## ${cleanHeadline}`);
      lines.push('');

      // Render blocks
      const blocks = section.content?.content || [];
      blocks.forEach((block: any) => {
        switch (block.type) {
          case 'paragraph':
            lines.push(this.ensureHtmlParagraph(block.content));
            lines.push('');
            break;
          case 'headline-3':
            lines.push(`### ${this.stripHtml(block.content)}`);
            lines.push('');
            break;
          case 'ordered-list':
            (block.content as string[]).forEach((li, i) => {
              lines.push(`${i + 1}. ${this.stripLi(li)}`);
            });
            lines.push('');
            break;
          case 'unordered-list':
            (block.content as string[]).forEach((li) => {
              lines.push(`- ${this.stripLi(li)}`);
            });
            lines.push('');
            break;
          default:
            // Fallback as paragraph
            if (typeof block.content === 'string') {
              lines.push(this.ensureHtmlParagraph(block.content));
              lines.push('');
            }
        }
      });
    });

    return lines.join('\n');
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  private toTitleCase(text: string): string {
    const minor = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'in', 'of', 'with', 'from']);
    return text.split(/\s+/).map((word, idx) => {
      const lower = word.toLowerCase();
      return (idx === 0 || !minor.has(lower))
        ? lower.charAt(0).toUpperCase() + lower.slice(1)
        : lower;
    }).join(' ');
  }

  private ensureHtmlParagraph(content: string): string {
    // If already contains <p>, strip any trailing garbage after the last closing tag
    if (/<\s*p[\s>]/i.test(content)) {
      const lastClose = content.lastIndexOf('>');
      return lastClose !== -1 ? content.substring(0, lastClose + 1).trim() : content.trim();
    }
    // Escape and return as Markdown paragraph
    return this.escapeMd(content);
  }

  private stripLi(li: string): string {
    return this.stripHtml(li);
  }

  private slug(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  }

  private escapeMd(text: string): string {
    return String(text).replace(/[\`*_{}\[\]()#+\-.!]/g, '\$&');
  }
}
