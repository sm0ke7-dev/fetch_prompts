# Fetch Prompts

AI-powered content pipeline for generating SEO-optimized location/service pages and publishing them to WordPress. Takes a keyword, produces a full article with images, and uploads it as a draft.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express (MVC + Repository pattern)
- **AI:** OpenAI API (text generation), Ideogram API (image generation), GPT Vision (QA)
- **CMS:** WordPress REST API with Application Passwords
- **Image Processing:** sharp (resize 600x400, EXIF strip, PNG)
- **SEO:** NeuronWriter API for term extraction

## Project Structure

```
fetch_prompts/
├── src/
│   ├── app.ts                 # Express setup
│   ├── server.ts              # Server startup
│   ├── controllers/           # HTTP request handlers
│   ├── models/                # TypeScript interfaces
│   ├── repositories/          # Data access + generated files
│   │   ├── final/             # Phase 5 markdown articles
│   │   └── images/            # Generated images
│   │       ├── featured/      # Featured + inline images
│   │       └── references/    # Style reference images (bat/, squirrel/, raccoon/)
│   ├── routes/                # API route definitions
│   └── services/              # Business logic + AI pipelines
├── .claude/commands/          # Claude Code skills
├── .local.env                 # Credentials (git-ignored)
└── README.md
```

## Getting Started

```bash
git clone https://github.com/sm0ke7-dev/fetch_prompts.git
cd fetch_prompts
npm install
cp .local.env.example .local.env   # add your API keys
npm run dev                         # starts on port 3000
```

## API Endpoints

### `POST /api/v1/text-media` — Generate article

5-phase pipeline: NeuronWriter terms → outline → SEO merge → section content → final markdown. Takes ~2-3 minutes.

```json
{ "keyword": "raccoon removal houston", "pageType": "location" }
```

Output: `src/repositories/final/phase5_article_<slug>.md`

### `POST /api/v1/image-media` — Generate image

4-step pipeline: concept validation → Ideogram generation → GPT Vision QA → post-processing. Animal keywords (bat, squirrel, raccoon) use a fast bypass (~9s vs ~50s).

```json
{ "keyword": "bat removal addison tx" }
```

Output: `src/repositories/images/featured/<slug>_feat_image_<timestamp>.png`

### `POST /api/v1/wp-upload` — Upload to WordPress

Loads a generated article, converts markdown to HTML, uploads images, and creates a draft post.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `keyword` | string | Yes | Must match a generated Phase 5 file |
| `pageType` | string | Yes | `service_page` → Pages, `blog` → Posts, or custom type (e.g. `aaaclocations`) |
| `site` | string | No | Office key (e.g. `dallas`). Falls back to `WP_BASE_URL` if omitted |
| `slug` | string | No | Custom URL slug. Auto-generated from keyword if omitted |
| `parent` | number | No | WordPress parent post ID (for hierarchical types) |
| `featuredImagePath` | string | No | Local path to featured image. Skips auto-detection when provided |
| `inlineImagePaths` | string[] | No | Image paths to inject after H2 sections (skips H2s that already have images) |

```json
{
  "keyword": "raccoon removal houston",
  "pageType": "aaaclocations",
  "site": "charlotte",
  "featuredImagePath": "src/repositories/images/featured/raccoon_feat.png",
  "inlineImagePaths": ["inline1.png", "inline2.png", "inline3.png"]
}
```

### `GET /health` — Health check

## Key Features

- **5-Phase Text Pipeline**: NeuronWriter SEO terms → outline → term merge → section generation → markdown render
- **4-Step Image Pipeline**: Concept validation → Ideogram generation → GPT Vision QA → sharp post-processing
- **Animal Bypass**: Bat, squirrel, and raccoon keywords skip the 4-step GPT pipeline — go straight to Ideogram with TURBO rendering, camera-specific prompts (Sony/Nikon/Canon telephoto), and style reference images for visual variety
- **Smart Inline Injection**: Uploads images and injects `<img>` tags after H2 sections, skipping any that already have images
- **Multi-Site WordPress**: Target any office with `site` field — credentials resolved from `WP_{SITE}_*` env vars
- **Custom Post Types**: `pageType` maps to WP REST bases (`service_page` → pages, `blog` → posts, anything else passed through directly)
- **ACF Integration**: Sets `hero_title` (from keyword, no H1 in markdown) and `hero_text` (first paragraph after first H2) as custom fields
- **Claude Skill**: `/create-location-page` runs the full pipeline — text → 4 images (visual scene descriptors for variety) → user review → WordPress upload

## Environment Variables

Create `.local.env` in the project root:

```env
PORT=3000
OPENAI_API_KEY=your_key
NEURONWRITER_API_KEY=your_key

# WordPress — fallback (used when no "site" is passed)
WP_BASE_URL=https://your-site.com
WP_USERNAME=your_wp_username
WP_APP_PASSWORD=your_wp_application_password

# WordPress — per-site (add offices here, no code changes needed)
WP_DALLAS_BASE_URL=https://dallas.yoursite.com
WP_DALLAS_USERNAME=your_wp_username
WP_DALLAS_APP_PASSWORD=your_wp_app_password
```

Pattern: `WP_{SITE}_BASE_URL`, `WP_{SITE}_USERNAME`, `WP_{SITE}_APP_PASSWORD` — case-insensitive match on the `site` field.

## Known Issues

- **URL structure**: Uploaded pages use `?page_id=` instead of clean permalinks — need to verify WP permalink settings
- **Outline style**: Generates informational blog sections instead of conversion-focused service page sections
- **Image QA**: Limited to 3 basic categories — no quality score or structured function calls

---

**Last Updated:** March 2026
