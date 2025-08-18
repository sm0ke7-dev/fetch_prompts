/**
 * Models for Image Media Creator HTTP API
 * Handles image generation pipeline via HTTP requests
 */

export interface ImageMediaRequest {
  /** The keyword/topic to generate images for */
  keyword: string;
  /** Number of images to generate (optional, default: 1) */
  count?: number;
}

export interface ImageGenerationResult {
  /** Status of the image generation */
  status: 'completed' | 'failed';
  /** Processing time in milliseconds */
  time: number;
  /** Generated image URLs or file paths */
  images?: string[];
  /** Optional message for failed generations */
  message?: string;
}

export interface ImageMediaResponse {
  /** Whether the request was successful */
  success: boolean;
  /** Response data (only present on success) */
  data?: {
    /** The keyword that was processed */
    keyword: string;
    /** Total processing time in milliseconds */
    processing_time: number;
    /** Image generation results */
    generation: ImageGenerationResult;
    /** Paths to generated output files */
    output_files: {
      /** Generated image files */
      images: string[];
      /** Metadata file */
      metadata: string;
    };
    /** Summary of generated content */
    content_summary: {
      /** Number of images generated */
      image_count: number;
      /** Generated image description for AI image generation */
      image_description?: string;
      /** Title for the generated image */
      image_title?: string;
      /** Generated image URL from Ideogram API */
      generated_image_url?: string;
      /** Image resolution */
      image_resolution?: string;
      /** Random seed used for generation */
      image_seed?: number;
      /** Local file path where image is saved (debug mode) */
      saved_image_path?: string;
    };
  };
  /** Response message */
  message: string;
  /** Error details (only present on failure) */
  error?: string;
}
