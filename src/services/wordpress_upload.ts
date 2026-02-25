import * as fs from 'fs';
import * as path from 'path';
import MarkdownIt from 'markdown-it';
import {
  WordPressUploadRequest,
  WordPressUploadResponse,
  WordPressApiPayload,
  WordPressApiResponse
} from '../models/services/wordpress_upload.model';

export class WordPressUploadService {
  private md: MarkdownIt;

  constructor() {
    this.md = new MarkdownIt({ html: true });
  }

  /**
   * Loads a Phase 5 Markdown article from the final/ directory.
   * Uses the same slug pattern as RenderArticleRepository.
   */
  loadMarkdownArticle(keyword: string): string {
    const slug = this.sanitizeKeyword(keyword);
    const filename = `phase5_article_${slug}.md`;
    const srcPath = path.join(__dirname, '..', '..', 'src', 'repositories');
    const filePath = path.join(srcPath, 'final', filename);

    if (!fs.existsSync(filePath)) {
      throw new Error(
        `Markdown article not found for keyword "${keyword}": expected file at ${filePath}`
      );
    }

    return fs.readFileSync(filePath, 'utf-8');
  }

  /**
   * Converts Markdown content to HTML using markdown-it.
   * Configured with html:true to preserve inline HTML blocks from Phase 5 output.
   */
  convertToHtml(markdown: string): string {
    return this.md.render(markdown);
  }

  /**
   * Resolves WordPress credentials for a given site key.
   * Looks for WP_{SITE}_BASE_URL etc. first, falls back to WP_BASE_URL.
   */
  private resolveSiteCredentials(site?: string): { baseUrl: string; username: string; appPassword: string } | null {
    if (site) {
      const prefix = `WP_${site.toUpperCase()}`;
      const baseUrl = process.env[`${prefix}_BASE_URL`];
      const username = process.env[`${prefix}_USERNAME`];
      const appPassword = process.env[`${prefix}_APP_PASSWORD`];
      if (baseUrl && username && appPassword) {
        return { baseUrl, username, appPassword };
      }
    }
    // Fallback to legacy vars
    const baseUrl = process.env.WP_BASE_URL;
    const username = process.env.WP_USERNAME;
    const appPassword = process.env.WP_APP_PASSWORD;
    if (baseUrl && username && appPassword) {
      return { baseUrl, username, appPassword };
    }
    return null;
  }

  /**
   * Orchestrates the full WordPress upload flow:
   * 1. Load markdown article
   * 2. Convert to HTML
   * 3. POST to WordPress REST API
   */
  async uploadToWordPress(request: WordPressUploadRequest): Promise<WordPressUploadResponse> {
    try {
      const credentials = this.resolveSiteCredentials(request.site);

      if (!credentials) {
        const siteLabel = request.site
          ? `WP_${request.site.toUpperCase()}_BASE_URL / _USERNAME / _APP_PASSWORD`
          : 'WP_BASE_URL / WP_USERNAME / WP_APP_PASSWORD';
        return {
          success: false,
          message: `Missing WordPress credentials. Expected env vars: ${siteLabel}`
        };
      }

      const { baseUrl, username, appPassword } = credentials;

      // Load and convert markdown
      const markdown = this.loadMarkdownArticle(request.keyword);
      const html = this.convertToHtml(markdown);

      // Determine endpoint: map known aliases, otherwise use pageType directly as REST base
      const knownRestBases: Record<string, string> = {
        'service_page': 'pages',
        'blog': 'posts'
      };
      const restBase = knownRestBases[request.pageType] ?? request.pageType;
      const endpoint = `${baseUrl}/wp-json/wp/v2/${restBase}`;

      // Build slug and title from keyword
      const slug = this.buildSlug(request.keyword);
      const title = this.buildTitle(request.keyword);
      const status = request.status || 'draft';

      // Build API payload
      const payload: WordPressApiPayload = {
        title,
        content: html,
        status,
        slug
      };

      // Build Basic auth header
      const authToken = Buffer.from(`${username}:${appPassword}`).toString('base64');

      // POST to WordPress
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();

        if (response.status === 401) {
          return {
            success: false,
            message: `WordPress authentication failed (401): Check WP_USERNAME and WP_APP_PASSWORD. ${errorText}`
          };
        }

        if (response.status === 403) {
          return {
            success: false,
            message: `WordPress permission denied (403): The user may lack publishing permissions. ${errorText}`
          };
        }

        return {
          success: false,
          message: `WordPress API error (${response.status}): ${errorText}`
        };
      }

      const wpResponse = await response.json() as WordPressApiResponse;
      const contentType = wpResponse.type; // use the actual post type returned by WP

      return {
        success: true,
        wordpress_id: wpResponse.id,
        wordpress_url: wpResponse.link,
        wordpress_edit_url: `${baseUrl}/wp-admin/post.php?post=${wpResponse.id}&action=edit`,
        content_type: contentType,
        status: wpResponse.status,
        title: wpResponse.title.rendered
      };
    } catch (error) {
      return {
        success: false,
        message: `WordPress upload failed: ${(error as Error).message}`,
        error
      };
    }
  }

  /**
   * Sanitizes keyword to match the repository file naming convention.
   * Same pattern as RenderArticleRepository.sanitizeKeyword.
   */
  private sanitizeKeyword(keyword: string): string {
    return keyword.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_').trim();
  }

  /**
   * Builds a URL-friendly slug from a keyword.
   */
  private buildSlug(keyword: string): string {
    return keyword.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  }

  /**
   * Builds a title-case string from a keyword.
   */
  private buildTitle(keyword: string): string {
    return keyword
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
