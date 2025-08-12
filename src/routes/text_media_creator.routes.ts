import { Router } from 'express';
import { textMediaCreatorController } from '../controllers/text_media_creator.controller';

const router = Router();

/**
 * POST /api/v1/text-media
 * Generate complete content pipeline
 * 
 * Request Body:
 * {
 *   "keyword": "what eats squirrels"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "keyword": "what eats squirrels",
 *     "processing_time": 151000,
 *     "phases": {
 *       "phase1": { "status": "completed", "time": 83000 },
 *       "phase2": { "status": "completed", "time": 8000 },
 *       "phase3": { "status": "completed", "time": 12000 },
 *       "phase4": { "status": "completed", "time": 47000 },
 *       "phase5": { "status": "completed", "time": 11 }
 *     },
 *     "output_files": {
 *       "terms": "src/repositories/optimization_terms/what_eats_squirrels.json",
 *       "outline": "src/repositories/outlines/phase2_outline_what_eats_squirrels.json",
 *       "merged": "src/repositories/outlines/phase3_merged_outline_what_eats_squirrels.json",
 *       "content": "src/repositories/articles/phase4_article_what_eats_squirrels.json",
 *       "final": "src/repositories/final/phase5_article_what_eats_squirrels.md"
 *     },
 *     "content_summary": {
 *       "sections": 9,
 *       "word_count": 1580,
 *       "content_blocks": 30
 *     }
 *   },
 *   "message": "Content generation completed successfully"
 * }
 */
router.post('/v1/text-media', textMediaCreatorController.generateContent);

export default router;
