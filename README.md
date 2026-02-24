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
- **Phase 3**: Merge outline with body terms for comprehensive content structure
- **Phase 4**: Generate section content with multiple content block types
- **Phase 5**: Render final article in clean Markdown format

**Latest Test Results (February 2026):**
- **Total Processing Time**: ~320 seconds using gpt-5-mini (62 seconds with gpt-4o-mini)
- **Content Quality**: 8 sections, 133 lines, full local geographic depth
- **File Output**: Complete Markdown article with proper heading structure
- **Model Support**: Compatible with both `gpt-4o-mini` and `gpt-5-mini`
- **End-to-End Test**: Full pipeline (generate → convert → upload) confirmed working; "wildlife removal spring lake nc" uploaded to WordPress as draft (page ID 3309)

### ✅ **IMAGE GENERATION SYSTEM - ALL 4 PHASES COMPLETE**

**🚀 IMAGE GENERATION + QUALITY ASSESSMENT API COMPLETE**
- **Endpoint**: `POST /api/v1/image-media`
- **Processing Time**: ~45-50 seconds per complete pipeline
- **Quality Assessment**: Automated GPT Vision analysis for anatomical correctness

**Phases:**
- **Phase 1**: HTTP Endpoint with request/response handling
- **Phase 2**: 4-Step Image Description Generation (concept validation)
- **Phase 3**: Ideogram API Integration for actual image generation
- **Phase 4**: GPT Vision Quality Assessment (anatomical correctness)

**Latest Test Results (December 2024):**
- **Image Quality**: High-quality photorealistic images (1312x736)
- **Quality Assessment**: PASS on body proportions, limb count, facial features
- **File Management**: Automatic saving to `src/repositories/images/featured/`
- **Integration**: Seamless pipeline from keyword → validation → generation → assessment

### ✅ **WORDPRESS UPLOAD - PHASE 6 COMPLETE**

**🚀 PROGRAMMATIC WORDPRESS PUBLISHING VIA REST API**
- **Endpoint**: `POST /api/v1/wp-upload`
- **Features**: Markdown → HTML conversion (markdown-it), WordPress REST API integration, draft mode
- **Content Routing**: `service_page` → WP Pages, `blog` → WP Posts
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
```json
{
  "keyword": "raccoon removal houston",
  "pageType": "service_page"
}
```

**Example Request (PowerShell):**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/wp-upload" -Method POST -ContentType "application/json" -Body '{"keyword":"raccoon removal houston","pageType":"service_page"}'
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

# WordPress Configuration
WP_BASE_URL=https://your-site.com
WP_USERNAME=your_wp_username
WP_APP_PASSWORD=your_wp_application_password
```

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

### **Image Quality Assessment Feature - Basic Implementation**

**Current Status:** ✅ Functional but basic implementation
**Location:** `src/services/image_quality_assessment/image_quality_assessment.ts`

#### **🔍 Issues Identified:**

**1. Hardcoded Prompt System (CRITICAL)**
- **Problem**: Uses hardcoded prompts instead of the project's prompt configuration system
- **Location**: Lines 65-75 in the service file
- **Impact**: Inconsistent with project architecture, difficult to maintain
- **Solution Needed**: Replace with `fetchPromptByName('image_quality_prompt')` + `processInputs()` + `submitPrompt()`

**2. Limited Assessment Criteria**
- **Problem**: Only 3 basic categories (body_proportions, limb_count, facial_features)
- **Missing**: Quality score (0.0-1.0), detailed issues list, comprehensive assessment
- **Solution Needed**: Use structured output schema from `image_quality_prompt.json`

**3. No Structured Function Calls**
- **Problem**: Uses basic JSON parsing instead of OpenAI's function calling system
- **Impact**: Potential parsing errors, inconsistent responses
- **Solution Needed**: Implement output schema function calls for reliable responses

**4. Business Logic in Controller**
- **Problem**: Response formatting logic in controller instead of service layer
- **Location**: `src/controllers/image_media_creator.controller.ts` lines 143-147
- **Impact**: Violates separation of concerns
- **Solution Needed**: Move response formatting to service layer

#### **📋 Files Involved:**
- `src/services/image_quality_assessment/image_quality_assessment.ts` (main service)
- `src/models/services/image_quality_assessment/image_quality_assessment.models.ts` (data models)
- `src/repositories/data/image_quality_prompt.json` (unused prompt config)
- `src/controllers/image_media_creator.controller.ts` (integration point)
- `src/models/services/image_media_creator.model.ts` (response models)

#### **🎯 Improvement Goals:**
1. **Use proper prompt configuration system** (consistency with rest of project)
2. **Implement structured function calls** (reliable JSON responses)
3. **Enhanced assessment criteria** (quality score + detailed issues)
4. **Move business logic to service layer** (proper architecture)
5. **Better error handling** (robust fallback mechanisms)

#### **⚠️ Previous Attempt Notes:**
- **Attempted**: Full refactor to use prompt configuration system
- **Result**: File corruption due to complex changes
- **Lesson**: Use targeted, incremental improvements instead of full rewrites
- **Recommendation**: Make small, focused changes and test thoroughly

#### **🔧 Recommended Approach:**
1. **Start with targeted fixes** (fix specific lines, not entire files)
2. **Test each change** before proceeding
3. **Use incremental approach** (one improvement at a time)
4. **Backup before major changes** (git commit frequently)
5. **Follow existing patterns** (use same approach as other services)

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
- **Claude command**: `/create-location-page` updated with upload confirmation flow

**Files added:**
- `src/services/wordpress_upload.ts` — service with load, convert, and upload methods
- `src/models/services/wordpress_upload.model.ts` — 4 TypeScript interfaces
- `src/controllers/wordpress_upload.controller.ts` — input validation + error handling
- `src/routes/wordpress_upload.routes.ts` — POST /v1/wp-upload route

---

### 🔜 Milestone 3: Content Quality & URL Structure Fixes — NEXT

**Goal:** Polish the output quality and WordPress integration so published pages are production-ready.

#### **1. URL Structure**
- **Problem**: Uploaded pages land with WordPress default URL (`?page_id=3309`) instead of a clean permalink (e.g. `/wildlife-removal-spring-lake-nc/`)
- **Fix needed**: Pass a `slug` in the API payload (already built in `wordpress_upload.ts`) and confirm WordPress permalink settings allow REST API to set slugs properly. May also require setting the page parent or verifying permalink structure is set to "Post name" in WP Settings → Permalinks.

#### **2. Text & Formatting Issues in Generated Content**
- **Problem**: Phase 5 output has several recurring formatting bugs:
  - **JSON artifact leak** — garbled `}]}}` text appears at the end of some sections (likely a JSON parsing edge case in the pipeline response handling)
  - **Double H2 tags** — headings are formatted as both markdown `## ` and inline `<h2>` tags simultaneously, producing invalid nested HTML after markdown-it conversion
  - **Inconsistent heading capitalization** — some section headings are lowercase
  - **Repetitive CTAs** — every section ends with the same generic phrase ("Call us today or contact our team to get expert help now") with no variation
- **Fix needed**: Audit Phase 5 render prompt and response parsing; add a post-processing/cleanup step before saving the final `.md` file

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

**Last Updated:** February 2026 - End-to-end pipeline tested; generate + WP upload confirmed working. Next: URL structure and content formatting fixes.
**Version:** 1.0.0
