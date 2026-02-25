# Fetch Prompts

A Node.js application for managing and fetching prompts with a structured API architecture.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Current Implementation Status](#current-implementation-status)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

## 🎯 Project Overview

This project provides a RESTful API for managing and retrieving prompts with AI integration. It follows a clean architecture pattern with separate layers for controllers, services, repositories, and models. The application can fetch prompt configurations, process user inputs with variable substitution, and submit requests to OpenAI API for structured responses.

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Architecture:** MVC Pattern with Repository Layer
- **Data Storage:** JSON files (can be extended to database)
- **AI Integration:** OpenAI API with structured tool calling (tools/tool_choice)
- **Image Processing:** sharp (EXIF strip + resize to 600×400 on all saved images)
- **Environment Management:** dotenv for configuration
- **Version Control:** Git with GitHub

## 📁 Project Structure

```
fetch_prompts/
├── src/
│   ├── app.ts                 # Express application setup
│   ├── server.ts              # Server startup and configuration
│   ├── controllers/           # HTTP request handlers
│   ├── models/                # Data models and interfaces
│   ├── repositories/          # Data access layer
│   ├── routes/                # API route definitions
│   └── services/              # Business logic layer
├── package.json               # Project dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sm0ke7-dev/fetch_prompts.git
   cd fetch_prompts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .local.env.example .local.env
   
   # Edit .local.env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🚀 Current Implementation Status

### ✅ **TEXT GENERATION SYSTEM - ALL 5 PHASES COMPLETE**

**🚀 FULLY FUNCTIONAL CONTENT GENERATION API**
- **Endpoint**: `POST /api/v1/text-media`
- **Complete Pipeline**: All 5 phases automated via HTTP requests
- **Processing Time**: ~3 minutes per complete article generation

**Phases:**
- **Phase 1**: NeuronWriter Terms extraction with structured output schema
- **Phase 2**: Article Outline generation from NeuronWriter heading terms
- **Phase 3**: Merge outline with NeuronWriter heading + body terms using gpt-5-mini (7-rule SEO merge prompt)
- **Phase 4**: Generate section content with multiple content block types
- **Phase 5**: Render final article in clean Markdown format

**Phase 3 — NeuronWriter Term Distribution (Latest Improvements):**
- **Model**: Upgraded to `gpt-5-mini` with `max_tokens: 16000` for reliable structured JSON output across 8 sections
- **Heading Terms**: NeuronWriter H2/H3 heading terms are now loaded and passed alongside body terms for richer SEO coverage
- **Merge Prompt**: Rewritten with 7 explicit rules — exact phrase matching, multi-word phrase priority, full term distribution, 8-12 content-terms per section, location term spread, and service-term topic matching
- **Term Limits**: Increased from 20→30 basic and 15→25 extended terms to capture more NeuronWriter optimization data
- **Result**: Sections now contain rich multi-word NeuronWriter phrases (e.g. `attic restoration`, `dead animal removal`, `exclusion work`, `wildlife removal in richardson`) instead of generic single words
- **Diagnostics**: `submit_prompt.ts` now logs `finish_reason` on empty responses for faster debugging

**Latest Test Results (February 2026):**
- **Total Processing Time**: ~164 seconds using gpt-5-mini (Phase 3 merge: ~95s, Phase 4 loop: ~55s)
- **Content Quality**: 8 sections, 1941 words, 39 content blocks, 126 NeuronWriter body terms distributed
- **File Output**: Complete Markdown article with proper heading structure
- **Model Support**: Compatible with both `gpt-4o-mini` and `gpt-5-mini`
- **End-to-End Test**: Full pipeline (generate → convert → upload) confirmed working; "wildlife removal spring lake nc" uploaded to WordPress as draft (page ID 3309)

### ✅ **IMAGE GENERATION SYSTEM - ALL 4 PHASES COMPLETE**

**🚀 IMAGE GENERATION + QUALITY ASSESSMENT API COMPLETE**
- **Endpoint**: `POST /api/v1/image-media`
- **Processing Time**: ~45-55 seconds per complete pipeline
- **Quality Assessment**: Automated GPT Vision analysis using saved local file (base64) — not the remote URL
- **Composition**: Hard wildlife-photography rules enforce animal-focused concepts with no human crowds

**Phases:**
- **Phase 1**: HTTP Endpoint with request/response handling
- **Phase 2**: 4-Step Image Description Generation (concept validation)
- **Phase 3**: Ideogram API Integration for actual image generation
- **Phase 4**: GPT Vision Quality Assessment (anatomical correctness)
- **Post-processing**: sharp pipeline — resize to 600×400, EXIF stripped, re-encoded as PNG

**Image Composition Rules (enforced in Step 1 prompt):**
- Animal/pest is the sole primary subject — frame built around it
- Zero human characters unless keyword makes one essential; max one, partial framing only (hands/silhouette)
- No multi-character interaction scenes, no bystanders or observers
- Wildlife photography style: animal in natural intrusion context (fence, rooftop, attic vent, yard at dusk/night, near house exterior)
- Simple, clean environments — one subject, one setting
- Subject must be grounded on a surface at all times — no mid-air, jumping, hanging, or precarious balancing
- Static or slow-moving poses only (standing alert, sniffing ground, walking, sitting) — dynamic poses cause anatomical distortion
- Realistic pest/wildlife scenarios only — no decorative contexts (flower beds, bird feeders, garden ornaments)
- Gut-check rule: every concept must be something a wildlife photographer could realistically photograph

**Ideogram Prompt Format (Step 4 output):**
- Concise comma-separated descriptors (50-80 words max) — no narrative sentences
- Format: subject + pose/position, environment, lighting, style tags
- Style tags enforced: `photorealistic, wildlife photography, DSLR, natural lighting, shallow depth of field`
- Steps 1-3 analysis informs the prompt content; Step 4 writes it in Ideogram-native format

**Latest Test Results (February 2026):**
- **Image Quality**: Photorealistic results that pass human inspection — no obvious AI tells
- **Quality Assessment**: PASS on body proportions, limb count, facial features (QA uses local saved PNG via base64, not expiring Ideogram URL)
- **File Output**: All images saved at 600×400px with EXIF stripped to `src/repositories/images/featured/`
- **Integration**: Seamless pipeline from keyword → concept validation → generation → QA → post-processing
- **Test**: "squirrel" → gray squirrel perched on tree branch, DSLR-style — passes as real wildlife photo

### ✅ **WORDPRESS UPLOAD - PHASE 6 COMPLETE**

**🚀 PROGRAMMATIC WORDPRESS PUBLISHING VIA REST API**
- **Endpoint**: `POST /api/v1/wp-upload`
- **Features**: Markdown → HTML conversion (markdown-it), WordPress REST API integration, draft mode
- **Content Routing**: `service_page` → WP Pages, `blog` → WP Posts, custom post types (e.g. `aaaclocations`) passed through directly as REST base
- **Multi-Site Support**: Target any office via `site` field (e.g. `charlotte`, `dallas`); falls back to `WP_BASE_URL` if omitted
- **Authentication**: WordPress Application Passwords
- **Claude Command**: `/create-location-page` updated with upload confirmation flow

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Available Endpoints

#### **POST /api/v1/image-media**
Generate AI-powered images using the 4-step validation approach.

**Request Body:**
```json
{
  "keyword": "your keyword here"
}
```

**Example Request (PowerShell):**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/image-media" -Method POST -ContentType "application/json" -Body '{"keyword":"my-keyword"}'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "keyword": "my-keyword",
    "processing_time": 47000,
    "generation": "4-step validation + quality assessment completed",
    "output_files": ["src/repositories/images/featured/my-keyword_feat_image.png"],
    "content_summary": {
      "final_image_description": "Detailed image description...",
      "final_image_title": "Generated Image Title",
      "generated_image_url": "https://...",
      "saved_image_path": "src/repositories/images/featured/my-keyword_feat_image.png",
      "quality_assessment": {
        "body_proportions": "PASS",
        "limb_count": "PASS",
        "facial_features": "PASS",
        "overall_assessment": "PASS",
        "processing_time": 2500
      }
    }
  },
  "message": "Image generation completed successfully"
}
```

#### **POST /api/v1/text**
Generate AI-powered content based on prompt configurations.

**URL Parameters:**
- `prompt_name` (query parameter): The name of the prompt configuration to use

**Request Body:**
```json
{
  "keyword": "Raccoon Removal Houston"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "content": "{\"sections\":[{\"header\":\"Understanding Raccoon Behavior\",\"description\":\"Raccoons are highly adaptable creatures...\"}]}",
    "usage": {
      "prompt_tokens": 49,
      "completion_tokens": 563,
      "total_tokens": 612
    },
    "prompt_name": "prompts",
    "keyword": "Raccoon Removal Houston"
  },
  "message": "Text generation completed successfully"
}
```

#### **POST /api/v1/wp-upload**
Upload a previously generated article to WordPress as a draft.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `keyword` | string | ✅ | The article keyword (must match a generated Phase 5 file) |
| `pageType` | string | ✅ | `service_page` → WP Pages, `blog` → WP Posts, or any custom post type slug (e.g. `aaaclocations`) |
| `site` | string | ❌ | Office key (e.g. `charlotte`, `dallas`). Falls back to `WP_BASE_URL` if omitted. |

```json
{
  "keyword": "raccoon removal houston",
  "pageType": "aaaclocations",
  "site": "charlotte"
}
```

**Example Request (PowerShell):**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/wp-upload" -Method POST -ContentType "application/json" -Body '{"keyword":"raccoon removal houston","pageType":"aaaclocations","site":"charlotte"}'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "wordpress_id": 1234,
    "wordpress_url": "https://your-site.com/?page_id=1234",
    "wordpress_edit_url": "https://your-site.com/wp-admin/post.php?post=1234&action=edit",
    "content_type": "page",
    "status": "draft",
    "title": "Raccoon Removal Houston"
  },
  "message": "Content uploaded to WordPress successfully"
}
```

#### **GET /health**
Health check endpoint to verify API status.

**Response:**
```json
{
  "success": true,
  "message": "Fetch Prompts API is running",
  "timestamp": "2025-08-07T13:14:48.916Z"
}
```

## 🔧 Environment Variables

Create a `.local.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# NeuronWriter Configuration
NEURONWRITER_API_KEY=your_neuronwriter_api_key_here

# WordPress — Legacy fallback (used when no "site" is passed)
WP_BASE_URL=https://your-site.com
WP_USERNAME=your_wp_username
WP_APP_PASSWORD=your_wp_application_password

# WordPress — Per-site credentials (add new offices here, no code changes needed)
WP_CHARLOTTE_BASE_URL=https://charlotte.yoursite.com
WP_CHARLOTTE_USERNAME=your_wp_username
WP_CHARLOTTE_APP_PASSWORD=your_wp_app_password

WP_DALLAS_BASE_URL=https://dallas.yoursite.com
WP_DALLAS_USERNAME=your_wp_username
WP_DALLAS_APP_PASSWORD=your_wp_app_password
```

**Per-site pattern:** `WP_{SITE}_BASE_URL`, `WP_{SITE}_USERNAME`, `WP_{SITE}_APP_PASSWORD` — where `{SITE}` matches the `site` field in the API request (case-insensitive). Add any number of offices with no code changes.

**Note:** The `.local.env` file is ignored by Git for security reasons.

## 🔍 Troubleshooting

### Common Issues

#### **Development Setup Issues**

**Issue: Missing Dependencies**
- **Solution**: Run `npm install` to install all project dependencies

**Issue: TypeScript Compilation Errors**
- **Solution**: Run `npm run build` to compile TypeScript files

**Issue: Environment Variables Not Loading**
- **Solution**: Check `.local.env` file exists and contains valid API keys

### Getting Help

- Check the existing code structure
- Review this README
- Check GitHub issues
- Create a new issue if needed

## 🚧 Known Issues & Improvements Needed

### **Image Quality Assessment — Remaining Improvements**

**Current Status:** ✅ Functional — QA uses local saved file via base64 (URL expiry bug fixed)
**Location:** `src/services/image_quality_assessment/image_quality_assessment.ts`

#### **🔍 Remaining Issues:**

**1. Limited Assessment Criteria**
- **Problem**: Only 3 basic categories (body_proportions, limb_count, facial_features)
- **Missing**: Quality score (0.0-1.0), detailed issues list, comprehensive assessment
- **Solution Needed**: Extend output schema in `image_quality_prompt.json`

**2. No Structured Function Calls**
- **Problem**: Uses basic JSON parsing instead of OpenAI's function calling system
- **Impact**: Potential parsing errors, inconsistent responses
- **Solution Needed**: Implement output schema function calls for reliable responses

#### **📋 Files Involved:**
- `src/services/image_quality_assessment/image_quality_assessment.ts`
- `src/models/services/image_quality_assessment/image_quality_assessment.models.ts`
- `src/repositories/data/image_quality_prompt.json`

---

## 🗺️ Next Steps / Roadmap

### ✅ Milestone 1: Claude Skill for Location Page Creation (`/create-location-page`) — COMPLETE

**Goal:** Make spinning up new location pages a one-command operation inside Claude Code.

**How it works:**
- Skill file lives at `.claude/commands/create-location-page.md`
- Accepts a keyword + page type, then calls `POST /api/v1/text-media`
- Claude handles the API call, waits for the pipeline to complete, and surfaces the output file path

**Usage:**
```
/create-location-page raccoon removal Beaumont tx
```

---

### ✅ Milestone 2: Phase 6 — Programmatic WordPress Upload — COMPLETE

**Goal:** After article generation, automatically draft the content to WordPress via the REST API.

**What shipped:**
- **Endpoint**: `POST /api/v1/wp-upload` — standalone upload from any generated article
- **Markdown → HTML**: `markdown-it` converts Phase 5 output to clean HTML
- **Content routing**: `service_page` → WP Pages, `blog` → WP Posts
- **Authentication**: WordPress Application Passwords via `.local.env`
- **Draft mode**: All uploads go to draft status for review before publishing
- **Custom post type support**: `pageType` accepts any WP REST base (e.g. `aaaclocations`, `aaacanimals`) — no code changes needed for new post types
- **Multi-site support**: Pass `site: "charlotte"` (or any office key) to target that office's credentials; new offices only require 3 env var additions
- **Claude command**: `/create-location-page` updated with upload confirmation flow

**Files added:**
- `src/services/wordpress_upload.ts` — service with load, convert, and upload methods
- `src/models/services/wordpress_upload.model.ts` — 4 TypeScript interfaces
- `src/controllers/wordpress_upload.controller.ts` — input validation + error handling
- `src/routes/wordpress_upload.routes.ts` — POST /v1/wp-upload route

---

### 🔜 Milestone 3: Content Quality & URL Structure Fixes — IN PROGRESS

**Goal:** Polish the output quality and WordPress integration so published pages are production-ready.

#### **✅ 1. Phase 3 NeuronWriter Term Distribution — COMPLETE**
- **Problem**: Phase 3 merge was producing generic single-word terms instead of using multi-word NeuronWriter phrases; heading terms were ignored entirely
- **Fix**: Rewrote merge prompt with 7 explicit rules, added heading term passthrough, upgraded to gpt-5-mini, increased term limits (20→30 basic, 15→25 extended), fixed max_tokens (4000→16000)
- **Files changed**: `outline_kw_merge_prompt.json`, `merge_outline.ts`, `merge_outline.model.ts`, `merge_outline_with_nw_terms.ts`, `merge_outline_with_nw_terms.model.ts`, `submit_prompt.ts`

#### **2. URL Structure**
- **Problem**: Uploaded pages land with WordPress default URL (`?page_id=3309`) instead of a clean permalink (e.g. `/wildlife-removal-spring-lake-nc/`)
- **Fix needed**: Pass a `slug` in the API payload (already built in `wordpress_upload.ts`) and confirm WordPress permalink settings allow REST API to set slugs properly. May also require setting the page parent or verifying permalink structure is set to "Post name" in WP Settings → Permalinks.

#### **2. Text & Formatting Issues in Generated Content**
- **Problem**: Phase 5 output has several recurring formatting bugs:
  - **JSON artifact leak** — garbled `}]}}` text appears at the end of some sections (likely a JSON parsing edge case in the pipeline response handling)
  - **Double H2 tags** — headings are formatted as both markdown `## ` and inline `<h2>` tags simultaneously, producing invalid nested HTML after markdown-it conversion
  - **Inconsistent heading capitalization** — some section headings are lowercase
  - **Repetitive CTAs** — every section ends with the same generic phrase ("Call us today or contact our team to get expert help now") with no variation
- **Fix needed**: Audit Phase 5 render prompt and response parsing; add a post-processing/cleanup step before saving the final `.md` file

#### **3. Outline Structure — Service Page vs Blog Post**
- **Problem**: Phase 2 outline generates sections that read like an informational blog post (e.g. "Understanding Raccoons", "DIY Removal Tips", "Legal Aspects") instead of a conversion-focused service page (e.g. "Our Raccoon Removal Process", "Service Areas", "Why Choose Us", "Get a Free Quote")
- **Fix needed**: Rework the Phase 2 outline prompt to produce service-page-oriented sections with commercial intent, CTAs, trust signals, and local service framing rather than educational/informational content

---

## 🤝 Contributing

### Working with AI Assistants

When collaborating with AI assistants on this project:

#### **🔒 Strict Work Conditions:**
1. **No files or revisions** are made unless explicitly requested
2. **Always ask for permission** before creating or modifying any files
3. **Provide detailed gameplans** before making changes
4. **Explain steps clearly** for learning purposes
5. **Wait for explicit approval** before proceeding with any modifications
6. **Assess complexity** before proposing changes:
   - **Number of files** that need to be modified
   - **Complexity level** of the operation (simple, moderate, complex)
   - **Risk assessment** of breaking the application (low, medium, high)
   - **Impact scope** (localized, moderate, widespread)

#### **🔍 Problem-Solving Protocol:**
1. **Always check paths instead of assuming** - Verify file locations and `__dirname` resolution
2. **Explain the problem clearly** - Describe what's happening and why it's failing
3. **Present a fix with reasoning** - Show the proposed solution and explain why it should work
4. **Wait for approval** - Do not implement changes until explicitly approved
5. **Test thoroughly** - Verify the fix works before considering it complete

### Code Style Guidelines

- Use TypeScript for type safety
- Follow the existing folder structure
- Add comments for complex logic
- Use meaningful variable and function names
- Keep functions small and focused

---

**Last Updated:** February 2026 - Phase 3 NeuronWriter term distribution overhauled: gpt-5-mini with 7-rule merge prompt, heading term passthrough, increased term limits, max_tokens fix. Output now contains rich multi-word SEO phrases across all sections. Next: URL structure (WP permalink settings) and content formatting fixes.
**Version:** 1.0.0
