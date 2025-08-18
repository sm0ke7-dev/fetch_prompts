/**
 * Models for Ideogram Image Generation Service
 * Handles image generation via Ideogram API
 */

export interface IdeogramGenerateRequest {
  /** The image description prompt from Phase 2 */
  prompt: string;
  /** Image resolution (optional) */
  resolution?: string;
  /** Rendering speed: TURBO, DEFAULT, QUALITY (optional) */
  rendering_speed?: 'TURBO' | 'DEFAULT' | 'QUALITY';
  /** Style type: GENERAL, REALISTIC, DESIGN, FICTION (optional) */
  style_type?: 'GENERAL' | 'REALISTIC' | 'DESIGN' | 'FICTION';
  /** Number of images to generate (1-8, optional) */
  num_images?: number;
  /** Aspect ratio (optional) */
  aspect_ratio?: string;
}

export interface IdeogramImageObject {
  /** The prompt used for generation */
  prompt: string;
  /** Image resolution */
  resolution: string;
  /** Whether the image is safe */
  is_image_safe: boolean;
  /** Random seed used for generation */
  seed: number;
  /** Image URL (expires after some time) */
  url: string;
  /** Style type used */
  style_type: string;
}

export interface IdeogramGenerateResponse {
  /** Timestamp when request was created */
  created: string;
  /** Array of generated images */
  data: IdeogramImageObject[];
}

export interface IdeogramGenerateResult {
  /** Whether the generation was successful */
  success: boolean;
  /** Generated image data (only present on success) */
  data?: {
    /** Generated image URL */
    imageUrl: string;
    /** Image resolution */
    resolution: string;
    /** Random seed used */
    seed: number;
    /** Creation timestamp */
    created: string;
    /** Whether image is safe */
    is_image_safe: boolean;
    /** Style type used */
    style_type: string;
  };
  /** Error message (only present on failure) */
  error?: string;
  /** Processing time in milliseconds */
  processing_time?: number;
}
