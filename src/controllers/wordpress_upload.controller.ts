import { Request, Response } from 'express';
import { WordPressUploadService } from '../services/wordpress_upload';

export const wordpressUploadController = {
  /**
   * Upload generated content to WordPress as a draft
   */
  async uploadContent(req: Request, res: Response): Promise<void> {
    try {
      const { keyword, pageType: rawPageType, site, slug, parent, featuredImagePath, inlineImagePaths } = req.body;

      // Resolve default page type: site-specific env var → 'service_page' fallback
      const defaultPageType = site
        ? process.env[`WP_${(site as string).toUpperCase()}_DEFAULT_PAGE_TYPE`] || 'location'
        : 'location';
      const pageType = rawPageType || defaultPageType;

      if (!keyword || typeof keyword !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Missing or invalid keyword in request body'
        });
        return;
      }

      console.log(`WordPress Upload: Starting upload for keyword: "${keyword}" (pageType: ${pageType}, site: ${site || 'default'})`);

      const service = new WordPressUploadService();
      const response = await service.uploadToWordPress({
        keyword,
        pageType,
        site,
        slug,
        parent,
        featuredImagePath,
        inlineImagePaths,
        status: 'draft'
      });

      if (!response.success) {
        // Determine appropriate HTTP status from error message
        const message = response.message || 'Unknown error';

        if (message.includes('not found')) {
          res.status(404).json({
            success: false,
            message: response.message
          });
          return;
        }

        if (message.includes('WordPress') && (message.includes('API error') || message.includes('authentication') || message.includes('permission'))) {
          res.status(502).json({
            success: false,
            message: response.message
          });
          return;
        }

        res.status(500).json({
          success: false,
          message: response.message
        });
        return;
      }

      console.log(`WordPress Upload: Successfully uploaded "${keyword}" as draft (ID: ${response.wordpress_id})`);

      res.status(200).json({
        success: true,
        data: { ...response },
        message: 'Content uploaded to WordPress as draft'
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      if (message.includes('not found')) {
        res.status(404).json({
          success: false,
          message
        });
        return;
      }

      console.error('WordPress Upload: Unexpected error:', error);
      res.status(500).json({
        success: false,
        message: 'WordPress upload failed',
        error: message
      });
    }
  }
};
