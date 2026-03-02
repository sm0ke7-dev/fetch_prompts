import * as fs from 'fs';
import * as path from 'path';
import MarkdownIt from 'markdown-it';
import {
  WordPressUploadRequest,
  WordPressUploadResponse,
  WordPressApiPayload,
  WordPressApiResponse,
  WordPressMediaUploadResponse
} from '../models/services/wordpress_upload.model';
import { fourStepImageDescriptionService } from './4step_image_desc_generation/img_desc_generation';

const INLINE_IMAGE_SECTION_COUNT = 3;

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
        'blog': 'posts',
        'location': 'aaaclocations'
      };
      const restBase = knownRestBases[request.pageType] ?? request.pageType;
      const endpoint = `${baseUrl}/wp-json/wp/v2/${restBase}`;

      // Build slug and title from keyword
      const slug = request.slug ?? this.buildSlug(request.keyword);
      const title = this.buildTitle(request.keyword);
      const status = request.status || 'draft';

      // Extract ACF hero fields from markdown
      const { heroTitle, heroText } = this.extractHeroFields(markdown);

      // Find and upload featured image (non-fatal if missing)
      let featuredMediaId: number | undefined;
      const imagePath = this.findLatestImageForKeyword(request.keyword);
      if (imagePath) {
        console.log('🖼️ Found featured image for upload:', imagePath);
        const uploadedResult = await this.uploadImageToWordPress(imagePath, credentials, title);
        if (uploadedResult != null) {
          console.log('✅ Image uploaded to WP media library, ID:', uploadedResult.id);
          featuredMediaId = uploadedResult.id;
        }
      }

      // Generate and upload inline images (non-fatal if any fail)
      let inlineImages: Array<{ sectionIndex: number; url: string; altText: string }> = [];
      if (INLINE_IMAGE_SECTION_COUNT > 0) {
        console.log(`🖼️ Generating ${INLINE_IMAGE_SECTION_COUNT} inline image(s)...`);
        inlineImages = await this.generateAndUploadInlineImages(request.keyword, html, credentials, title);
        console.log(`✅ ${inlineImages.length}/${INLINE_IMAGE_SECTION_COUNT} inline image(s) ready`);
      }

      // Inject inline images into HTML (no-op if none were generated)
      const contentHtml = inlineImages.length > 0 ? this.injectInlineImages(html, inlineImages) : html;

      // Build API payload
      const payload: WordPressApiPayload = {
        title,
        content: contentHtml,
        status,
        slug,
        ...(request.parent != null && { parent: request.parent }),
        featured_media: featuredMediaId,
        acf: {
          hero_title: heroTitle,
          hero_text: heroText,
          ...(featuredMediaId != null && { image_caption: title })
        }
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
        title: wpResponse.title.rendered,
        ...(featuredMediaId != null && { featured_media_id: featuredMediaId }),
        ...(inlineImages.length > 0 && { inline_image_count: inlineImages.length })
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
   * Extracts hero_title and hero_text from a Phase 5 Markdown article.
   * hero_title: H1 line, title-cased.
   * hero_text: first paragraph after the first H2, with markdown escapes stripped.
   */
  private extractHeroFields(markdown: string): { heroTitle: string; heroText: string } {
    const lines = markdown.split('\n');

    // Extract H1 for hero title
    const h1Line = lines.find(line => line.startsWith('# '));
    const heroTitle = h1Line
      ? this.buildTitle(h1Line.replace(/^#\s+/, '').trim())
      : '';

    // Find first plain paragraph after the first H2
    let pastFirstH2 = false;
    let heroText = '';

    for (const line of lines) {
      if (!pastFirstH2 && line.startsWith('## ')) {
        pastFirstH2 = true;
        continue;
      }
      if (pastFirstH2 && line.trim() && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('*')) {
        // Strip HTML tags and markdown escape sequences (e.g. \. \- \!)
        heroText = line.trim().replace(/<[^>]*>/g, '').replace(/\\(.)/g, '$1').trim();
        break;
      }
    }

    return { heroTitle, heroText };
  }

  /**
   * Scans the featured images directory for files matching {slug}_feat_image_{timestamp}.png
   * and returns the absolute path of the most recent one, or null if none found.
   */
  private findLatestImageForKeyword(keyword: string): string | null {
    const slug = this.sanitizeKeyword(keyword);
    const imagesDir = path.join(__dirname, '..', '..', 'src', 'repositories', 'images', 'featured');

    if (!fs.existsSync(imagesDir)) {
      return null;
    }

    const pattern = new RegExp(`^${slug}_feat_image_(\\d+)\\.png$`);
    const files = fs.readdirSync(imagesDir);

    let bestFile: string | null = null;
    let bestTimestamp = -1;

    for (const file of files) {
      const match = file.match(pattern);
      if (match) {
        const timestamp = parseInt(match[1], 10);
        if (timestamp > bestTimestamp) {
          bestTimestamp = timestamp;
          bestFile = file;
        }
      }
    }

    return bestFile ? path.join(imagesDir, bestFile) : null;
  }

  /**
   * Uploads a PNG image to the WordPress media library.
   * Returns { id, source_url } on success, or null if the upload fails (non-fatal).
   */
  private async uploadImageToWordPress(
    imagePath: string,
    credentials: { baseUrl: string; username: string; appPassword: string },
    altText: string
  ): Promise<WordPressMediaUploadResponse | null> {
    const { baseUrl, username, appPassword } = credentials;
    const imageBuffer = fs.readFileSync(imagePath);
    const filename = path.basename(imagePath);

    const response = await fetch(`${baseUrl}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${username}:${appPassword}`).toString('base64')}`,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'image/png'
      },
      body: imageBuffer
    });

    if (!response.ok) {
      console.warn(`Warning: image upload to WordPress failed (${response.status}). Proceeding without image.`);
      return null;
    }

    const data = await response.json() as { id?: number; source_url?: string };
    if (!data.id) return null;
    return { id: data.id, source_url: data.source_url ?? '' };
  }

  /**
   * Generates and uploads inline images for the first N H2 sections.
   * Non-fatal: failed sections are skipped with a warning.
   */
  private async generateAndUploadInlineImages(
    keyword: string,
    html: string,
    credentials: { baseUrl: string; username: string; appPassword: string },
    title: string
  ): Promise<Array<{ sectionIndex: number; url: string; altText: string }>> {
    const h2Matches = [...html.matchAll(/<h2>(.*?)<\/h2>/g)];
    const sectionsToProcess = h2Matches.slice(0, INLINE_IMAGE_SECTION_COUNT);
    const results: Array<{ sectionIndex: number; url: string; altText: string }> = [];

    if (sectionsToProcess.length === 0) return results;

    const inlineDir = path.join(__dirname, '..', '..', 'src', 'repositories', 'images', 'inline');
    if (!fs.existsSync(inlineDir)) {
      fs.mkdirSync(inlineDir, { recursive: true });
    }

    const slug = this.sanitizeKeyword(keyword);

    for (let i = 0; i < sectionsToProcess.length; i++) {
      const sectionIndex = i + 1;
      const h2Text = sectionsToProcess[i][1].replace(/<[^>]*>/g, '').trim();
      const sectionKeyword = `${keyword} — ${h2Text}`;

      try {
        console.log(`🖼️ [Inline ${sectionIndex}/${sectionsToProcess.length}] Generating for: "${sectionKeyword}"`);

        const imageResult = await fourStepImageDescriptionService.generateImageDescription(sectionKeyword);

        if (!imageResult.success || !imageResult.data?.saved_image_path) {
          console.warn(`⚠️ [Inline ${sectionIndex}] Image generation failed, skipping`);
          continue;
        }

        // Copy to inline dir with proper naming
        const timestamp = Date.now();
        const inlinePath = path.join(inlineDir, `${slug}_${sectionIndex}_inline_${timestamp}.png`);
        fs.copyFileSync(imageResult.data.saved_image_path, inlinePath);

        // Upload to WordPress media library
        const altText = `${title} — ${h2Text}`;
        const uploadResult = await this.uploadImageToWordPress(inlinePath, credentials, altText);

        if (!uploadResult) {
          console.warn(`⚠️ [Inline ${sectionIndex}] WordPress upload failed, skipping`);
          continue;
        }

        results.push({ sectionIndex, url: uploadResult.source_url, altText });
        console.log(`✅ [Inline ${sectionIndex}] Uploaded: ${uploadResult.source_url}`);
      } catch (err) {
        console.warn(`⚠️ [Inline ${sectionIndex}] Error: ${(err as Error).message}, skipping`);
      }
    }

    return results;
  }

  /**
   * Injects <img> tags into HTML after each targeted </h2> closing tag.
   */
  private injectInlineImages(
    html: string,
    images: Array<{ sectionIndex: number; url: string; altText: string }>
  ): string {
    let h2Count = 0;
    return html.replace(/<\/h2>/g, (match) => {
      h2Count++;
      const img = images.find(i => i.sectionIndex === h2Count);
      if (img) {
        return `</h2>\n<img src="${img.url}" alt="${img.altText}" class="wp-inline-image" style="width:100%;height:auto;margin:1rem 0;" />`;
      }
      return match;
    });
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
