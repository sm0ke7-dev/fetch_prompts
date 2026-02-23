# fetch_prompts

## Current State (Updated: 2026-02-23)

**Shipped:** v1.0 Content Generation Pipeline (2025-08)
**Status:** Internal development tool / Active use
**Codebase:**
- Node.js / TypeScript with Express
- MVC + Repository pattern
- OpenAI API (gpt-4o-mini, gpt-5-mini) + Ideogram v3 + NeuronWriter
- JSON-based prompt config system with `{{variable}}` substitution

**What's working:**
- 5-phase text pipeline: NeuronWriter SEO terms → outline → merge → section loop → Markdown render
- 4-step image pipeline: concept generation → rating → entity validation → Ideogram + GPT Vision QA
- Two pageTypes: `blog` and `service_page` with separate prompt configs
- `/create-location-page` Claude command for one-command page generation
- Output: Markdown articles in `src/repositories/final/` and images in `src/repositories/images/featured/`

**Known Issues:**
- Image quality assessment uses hardcoded prompts (inconsistent with prompt config system)
- No automated way to publish generated content to WordPress

## v1.1 Goals

**Vision:** Close the loop — generated content should be publishable to WordPress from the CLI without manual copy-paste.

**Motivation:**
- Currently, generated Markdown files sit in `src/repositories/final/` and must be manually uploaded
- The `/create-location-page` command already generates content but has no upload step
- WordPress REST API makes programmatic publishing straightforward

**Scope (v1.1):**
- Standalone `POST /api/v1/wp-upload` endpoint (Markdown → HTML → WordPress)
- Route `service_page` → WP Pages, `blog` → WP Posts
- Upload as draft (review before publish)
- Always create new (no duplicate detection)
- Update `/create-location-page` Claude command with upload confirmation step

**Success Criteria:**
- [ ] Can upload any previously generated article to WordPress via API call
- [ ] `/create-location-page` command asks "Upload to WP?" after generation and uploads on confirm
- [ ] Uploaded content appears as draft in WordPress with correct HTML formatting
- [ ] Blog content goes to Posts, service_page content goes to Pages

**Out of Scope:**
- Featured image upload to WordPress (future milestone)
- Duplicate detection / content updates
- Direct publish (always draft for now)
- WordPress category/tag management
- SEO metadata (Yoast/RankMath fields)
