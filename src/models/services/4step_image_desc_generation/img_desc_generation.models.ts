export interface Step1Result {
  concepts: Array<{
    id: string;
    title: string;
    description: string;
    key_elements: string[];
  }>;
}

export interface Step2Result {
  ratings: Array<{
    concept_id: string;
    commonality_score: number;
    generation_success_score: number;
    overall_score: number;
    reasoning: string;
  }>;
  best_concept: {
    concept_id: string;
    title: string;
    description: string;
    key_elements: string[];
    overall_score: number;
  };
}

export interface Step3Result {
  required_entities: Array<{
    entity: string;
    category: string;
    importance: string;
    description: string;
    potential_issues: string[];
  }>;
  domain_validation: {
    domain_knowledge_applied: string[];
    common_misconceptions: string[];
    accuracy_notes: string;
  };
  optimized_concept: {
    title: string;
    description: string;
    key_elements: string[];
  };
}

export interface StructuredImagePrompt {
  core: string;
  setting: {
    location: string;
    time_of_day: string;
    lighting: string;
  };
  objects: Array<{
    type: string;
    position: string;
  }>;
  characters: Array<{
    type: string;
    pose: string;
    interaction: string;
  }>;
  camera: {
    angle: string;
    position: string;
  };
  mood: {
    emotion: string;
    tone: string;
  };
}

export interface Step4Result {
  structured_prompt: StructuredImagePrompt;
  image_title: string;
  prompt_analysis: {
    key_improvements: string[];
    domain_accuracy: string;
    generation_optimization: string;
  };
  quality_checks: {
    anatomical_accuracy: boolean;
    context_accuracy: boolean;
    domain_accuracy: boolean;
    generation_feasibility: boolean;
  };
}

export interface FourStepImageDescriptionResult {
  success: boolean;
  data?: {
    step1: Step1Result;
    step2: Step2Result;
    step3: Step3Result;
    step4: Step4Result;
    final_image_description: string;
    final_image_title: string;
    generated_image_url?: string;
    saved_image_path?: string;
    processing_time: number;
  };
  message?: string;
  error?: string;
}
