export interface WordPressUploadRequest {
  keyword: string;
  pageType: 'blog' | 'service_page';
  status?: string; // defaults to "draft"
}

export interface WordPressUploadResponse {
  success: boolean;
  wordpress_id?: number;
  wordpress_url?: string;
  wordpress_edit_url?: string;
  content_type?: 'page' | 'post';
  status?: string;
  title?: string;
  message?: string;
  error?: any;
}

export interface WordPressApiPayload {
  title: string;
  content: string;
  status: string;
  slug: string;
}

export interface WordPressApiResponse {
  id: number;
  link: string;
  status: string;
  title: { rendered: string };
  type: string;
}
