/**
 * Models for Text Media Creator HTTP API
 * Handles complete content generation pipeline via HTTP requests
 */

export interface TextMediaRequest {
  /** The keyword to generate content for */
  keyword: string;
}

export interface PhaseResult {
  /** Status of the phase execution */
  status: 'completed' | 'failed';
  /** Processing time in milliseconds */
  time: number;
  /** Optional message for failed phases */
  message?: string;
}

export interface TextMediaResponse {
  /** Whether the request was successful */
  success: boolean;
  /** Response data (only present on success) */
  data?: {
    /** The keyword that was processed */
    keyword: string;
    /** Total processing time in milliseconds */
    processing_time: number;
    /** Results for each phase */
    phases: {
      phase1: PhaseResult;
      phase2: PhaseResult;
      phase3: PhaseResult;
      phase4: PhaseResult;
      phase5: PhaseResult;
    };
    /** Paths to generated output files */
    output_files: {
      /** NeuronWriter optimization terms */
      terms: string;
      /** Phase 2 article outline */
      outline: string;
      /** Phase 3 merged outline with terms */
      merged: string;
      /** Phase 4 generated content */
      content: string;
      /** Phase 5 final markdown article */
      final: string;
    };
    /** Summary of generated content */
    content_summary: {
      /** Number of sections generated */
      sections: number;
      /** Total word count */
      word_count: number;
      /** Total content blocks */
      content_blocks: number;
    };
  };
  /** Response message */
  message: string;
  /** Error details (only present on failure) */
  error?: string;
}
