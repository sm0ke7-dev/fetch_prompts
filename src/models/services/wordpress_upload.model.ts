export interface WordPressUploadRequest {
  keyword: string;
  // Known types: 'service_page' (→ /pages), 'blog' (→ /posts)
  // Custom post types (e.g. 'aaaclocations', 'aaacanimals') are passed through directly as the REST base
  pageType: string;
  // Office site key (e.g. 'charlotte', 'dallas'). Falls back to WP_BASE_URL if omitted.
  site?: string;
  status?: string; // defaults to "draft"
  slug?: string;   // if provided, overrides the auto-generated keyword slug
  parent?: number; // WordPress post ID of the parent page (for hierarchical post types)
}

export interface WordPressUploadResponse {
  success: boolean;
  wordpress_id?: number;
  wordpress_url?: string;
  wordpress_edit_url?: string;
  content_type?: string; // 'page', 'post', or custom post type slug
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
  parent?: number;
  featured_media?: number;
  acf?: {
    hero_title: string;
    hero_text: string;
    featured_image?: number;
  };
}

export interface WordPressApiResponse {
  id: number;
  link: string;
  status: string;
  title: { rendered: string };
  type: string;
}
