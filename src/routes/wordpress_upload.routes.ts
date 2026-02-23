import { Router } from 'express';
import { wordpressUploadController } from '../controllers/wordpress_upload.controller';

const router = Router();

/**
 * POST /api/v1/wp-upload
 * Upload generated content to WordPress as a draft
 *
 * Request Body:
 * {
 *   "keyword": "what eats squirrels",
 *   "pageType": "service_page"  // optional, defaults to "service_page"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "success": true,
 *     "wordpress_id": 123,
 *     "wordpress_url": "https://example.com/?page_id=123",
 *     "wordpress_edit_url": "https://example.com/wp-admin/post.php?post=123&action=edit",
 *     "content_type": "page",
 *     "status": "draft",
 *     "title": "What Eats Squirrels"
 *   },
 *   "message": "Content uploaded to WordPress as draft"
 * }
 */
router.post('/v1/wp-upload', wordpressUploadController.uploadContent);

export default router;
