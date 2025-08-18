import { Router } from 'express';
import { imageMediaCreatorController } from '../controllers/image_media_creator.controller';

const router = Router();

/**
 * POST /api/v1/image-media
 * Generate images based on keyword and parameters
 * 
 * Request Body:
 * {
 *   "keyword": "raccoon in garden",
 *   "count": 2
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "keyword": "raccoon in garden",
 *     "processing_time": 5000,
 *     "generation": {
 *       "status": "completed",
 *       "time": 5000,
 *       "images": ["/images/raccoon_in_garden_1.png"]
 *     },
 *     "output_files": {
 *       "images": ["/images/raccoon_in_garden_1.png"],
 *       "metadata": "/metadata/raccoon_in_garden_metadata.json"
 *     },
 *     "content_summary": {
 *       "image_count": 1,
 *       "image_description": "A detailed description of the generated image...",
 *       "image_title": "Understanding Raccoon Behavior in Gardens"
 *     }
 *   },
 *   "message": "Image description generated successfully (ready for image generation)"
 * }
 * 
 * Debug Mode:
 * Add ?debug=true query parameter to save intermediate files to image_desc_temp_debug/
 */
router.post('/v1/image-media', imageMediaCreatorController.generateImages);

export default router;
