// Image Quality Assessment Service Models - Simplified

export interface ImageQualityAssessmentRequest {
  imagePath: string;
  keyword: string;
}

export interface ImageQualityAssessmentResponse {
  success: boolean;
  data?: ImageQualityAssessmentResult;
  message: string;
  error?: string;
}

export interface ImageQualityAssessmentResult {
  body_proportions: 'PASS' | 'FAIL';
  limb_count: 'PASS' | 'FAIL';
  facial_features: 'PASS' | 'FAIL';
  overall_assessment: 'PASS' | 'FAIL';
  processing_time: number;
}
