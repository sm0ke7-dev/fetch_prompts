import { 
  Phase4ArticleData,
  Phase4SectionData,
  LoopContentBlock as RenderContentBlock
} from './loop_sections/loop_thru_sections.model';

export interface RenderArticleRequest {
  keyword: string;
  phase4ArticleFile?: string;
}

export interface RenderArticleResponse {
  success: boolean;
  data?: {
    markdown: string;
    output_path: string;
    processing_time: number;
  };
  message?: string;
  error?: any;
}

export type { Phase4ArticleData, Phase4SectionData, RenderContentBlock };
