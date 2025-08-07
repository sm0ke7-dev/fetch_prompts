import { Router } from 'express';
import { promptController } from '../controllers/prompt_controller';

/**
 * Router for prompt-related endpoints
 */
const router = Router();

/**
 * POST /api/v1/text?prompt_name=prompts
 * 
 * Generate text content based on a prompt configuration
 * 
 * Query Parameters:
 * - prompt_name: The name of the prompt configuration to use
 * 
 * Request Body:
 * {
 *   "keyword": "Raccoon Removal Houston"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "content": "{\"sections\":[...]}",
 *     "usage": {...},
 *     "prompt_name": "prompts",
 *     "keyword": "Raccoon Removal Houston"
 *   },
 *   "message": "Text generation completed successfully"
 * }
 */
router.post('/v1/text', promptController.processTextGeneration.bind(promptController));

export default router;
