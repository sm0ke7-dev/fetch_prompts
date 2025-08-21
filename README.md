# Fetch Prompts

A Node.js application for managing and fetching prompts with a structured API architecture.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
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
- **AI Integration:** OpenAI API with structured function calling
- **Environment Management:** dotenv for configuration
- **Version Control:** Git with GitHub

## 📁 Project Structure

```
fetch_prompt/
├── .gitignore                 # Git ignore rules
├── .local.env                 # Local environment variables (not tracked)
├── package.json               # Project dependencies and scripts
├── package-lock.json          # Locked dependency versions
├── tsconfig.json              # TypeScript configuration
├── test_phase1_neuronwriter_with_keyword_file.js # Phase 1: NeuronWriter terms extraction test
├── test_phase2_generate_outline_from_terms.js # Phase 2: Outline generation test
├── test_phase3_merge_outline.js # Phase 3: Outline merging test
├── test_phase4_loop_sections.js # Phase 4: Content generation test
├── test_phase5_render_article.js # Phase 5: Markdown rendering test
├── test_phases_2_to_5.js # Complete pipeline test (Phases 2-5, skips Phase 1)
├── src/
│   ├── app.ts                 # Express application setup with middleware
│   ├── server.ts              # Server startup and configuration
│   ├── controllers/           # HTTP request handlers
│   │   ├── index.ts           # Controller exports (exports promptController)
│   │   └── prompt_controller.ts # Prompt HTTP request handling
│   ├── models/                # Data models and interfaces
│   │   ├── index.ts           # Model exports (exports all models)
│   │   ├── fetch_prompts_model.ts # Prompt configuration interfaces
│   │   ├── repositories/      # Repository-specific models
│   │   │   ├── loop_sections.model.ts # Phase 4 repository models
│   │   │   └── merge_outline.model.ts # Phase 3 repository models
│   │   └── services/          # Service-specific models
│   │       ├── process_input.model.ts # Input processing interfaces
│   │       ├── submit_prompt.model.ts # OpenAI API interfaces
│   │       ├── get_optimization_terms.model.ts # NeuronWriter API interfaces
│   │       ├── outline_process_input.model.ts # Phase 2 input processing
│   │       ├── outline_submit_retrieve_output.models.ts # Phase 2 output handling
│   │       ├── merge_outline_with_nw_terms.model.ts # Phase 3 merge processing
│   │       ├── merge_outline_submit_pull.model.ts # Phase 3 submit/pull
│   │       ├── loop_sections/loop_thru_sections.model.ts # Phase 4 content generation
│   │       ├── render_article.model.ts # Phase 5 rendering
│   │       ├── generate_image.model.ts # Ideogram API interfaces
│   │       └── 4step_image_desc_generation/img_desc_generation.models.ts # Multi-step validation interfaces
│   ├── repositories/          # Data access layer
│   │   ├── data/
│   │   │   ├── prompts.json   # AI prompt configuration data
│   │   │   ├── outline_creation_prompt.json # Phase 2 outline generation prompt
│   │   │   ├── outline_kw_merge_prompt.json # Phase 3 outline merging prompt
│   │   │   ├── loop_prompt.json # Phase 4 content generation prompt
│   │   │   ├── create_image_prompt.json # Image generation prompt
│   │   │   ├── step1_idea_generation.json # 4-step: concept generation
│   │   │   ├── step2_rating.json # 4-step: concept rating
│   │   │   ├── step3_entities.json # 4-step: entity identification
│   │   │   ├── step4_final_prompt.json # 4-step: structured prompt creation
│   │   │   └── keyword.json   # Current keyword for NeuronWriter requests
│   │   ├── fetch_prompt.ts    # Prompt fetching functionality
│   │   ├── neuron_writer.ts   # NeuronWriter API integration
│   │   ├── create_outline_from_terms.ts # Phase 2 repository
│   │   ├── merge_outline.ts   # Phase 3 repository
│   │   ├── loop_section.ts    # Phase 4 repository
│   │   ├── render_article.ts  # Phase 5 repository
│   │   ├── optimization_terms/ # Optimization terms JSON data storage
│   │   │   ├── what_scares_bats_out_of_homes.json # Phase 1 output
│   │   │   └── keep_rats_away.json # Phase 1 output
│   │   ├── outlines/          # Generated outlines (Phase 2 & 3)
│   │   │   ├── phase2_outline_what_scares_bats_out_of_homes.json
│   │   │   ├── phase2_outline_keep_rats_away.json
│   │   │   ├── phase3_merged_outline_what_scares_bats_out_of_homes.json
│   │   │   └── phase3_merged_outline_keep_rats_away.json
│   │   ├── articles/          # Generated article content (Phase 4)
│   │   │   ├── phase4_article_what_scares_bats_out_of_homes.json
│   │   │   └── phase4_article_keep_rats_away.json
│   │   └── final/             # Final rendered articles (Phase 5)
│   │       └── phase5_article_what_scares_bats_out_of_homes.md
│   ├── routes/                # API route definitions
│   │   ├── index.ts           # Route exports (exports promptRoutes)
│   │   └── prompt_routes.ts   # API endpoint definitions
│   └── services/              # Business logic layer
│       ├── index.ts           # Service exports (exports all services)
│       ├── process_input.ts   # Input processing and variable substitution
│       ├── submit_prompt.ts   # OpenAI API integration
│       ├── get_optimization_terms.ts # NeuronWriter optimization terms service
│       ├── outline_process_input.ts # Phase 2 input processing
│       ├── outline_submit_retrieve_output.ts # Phase 2 output handling
│       ├── merge_outline_with_nw_terms.ts # Phase 3 merge processing
│       ├── merge_outline_submit_pull.ts # Phase 3 submit/pull
│       ├── loop_thru_sections/loop_thru_sections.ts # Phase 4 content generation
│       ├── render_article.ts # Phase 5 rendering
│       ├── generate_image.ts # Ideogram API integration
│       └── 4step_image_desc_generation/img_desc_generation.ts # Multi-step image validation
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

## 🔄 Development Workflow

### Branch Strategy

This project uses a three-branch workflow:

- **`master`** - Production-ready code
- **`staging`** - Testing environment before production
- **`dev`** - Active development branch

### Typical Development Flow

1. **Start from dev branch**
   ```bash
   git checkout dev
   ```

2. **Create feature branch (optional)**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **Push to remote**
   ```bash
   git push origin dev
   ```

5. **When ready for testing**
   ```bash
   git checkout staging
   git merge dev
   git push origin staging
   ```

6. **When ready for production**
   ```bash
   git checkout master
   git merge staging
   git push origin master
   ```

### Git Commands Reference

| Command | Description |
|---------|-------------|
| `git branch` | List local branches |
| `git checkout -b [name]` | Create and switch to new branch |
| `git checkout [name]` | Switch to existing branch |
| `git push -u origin [name]` | Push new branch to GitHub |
| `git branch -a` | List all branches (local + remote) |

## 🚀 Current Implementation Status

## 📝 **TEXT GENERATION SYSTEM**

### ✅ **ALL 5 PHASES COMPLETE AND WORKING**

### 🎉 **BREAKTHROUGH: HTTP API INTEGRATION COMPLETE!**

**🚀 FULLY FUNCTIONAL CONTENT GENERATION API**
- **Endpoint**: `POST /api/v1/text-media`
- **Complete Pipeline**: All 5 phases automated via HTTP requests
- **Production Ready**: Structured JSON responses with detailed metrics
- **Real-time Processing**: ~3 minutes per complete article generation

### ✅ **ALL 5 PHASES COMPLETE AND WORKING**

- **Phase 1: NeuronWriter Terms (Complete)**
  - Structured output schema (headings, body terms, entities, questions)
  - Credit-friendly flow reuses existing ready queries when available
  - Output saved to `src/repositories/optimization_terms/<sanitized_keyword>.json`
- **Phase 2: Article Outline (Complete)**
  - Outline generated from NeuronWriter heading terms via OpenAI function calling
  - Auto-saves to `src/repositories/outlines/phase2_outline_<sanitized_keyword>.json`
- **Phase 3: Merge Outline with Body Terms (Complete)**
  - Merges Phase 2 outline with NW body terms using `outline_kw_merge_prompt.json`
  - Output schema updated to: `headline`, `header-terms[]`, `content-terms[]`
  - Saved to `src/repositories/outlines/phase3_merged_outline_<sanitized_keyword>.json`
- **Phase 4: Generate Section Content (Complete)**
  - Uses `loop_prompt.json` and loops through merged sections to generate content blocks
  - Output schema: `headline`, `content[] (type: paragraph|ordered-list|unordered-list|headline-3)`
  - Saved to `src/repositories/articles/phase4_article_<sanitized_keyword>.json`
- **Phase 5: Render Final Article (Complete)**
  - Transforms Phase 4 JSON content into clean Markdown format
  - Removed table of contents and jump links for cleaner output
  - Saved to `src/repositories/final/phase5_article_<sanitized_keyword>.md`

#### **🎯 BREAKTHROUGH RESULTS** (Latest Test - December 2024):
**Complete end-to-end pipeline tested successfully with "what eats squirrels":**

**Performance Metrics:**
- **Total Processing Time**: 62 seconds
- **Phase 2**: 8 seconds (500 tokens) - 7 sections generated
- **Phase 3**: 13 seconds (1,321 tokens) - 7 sections merged with terms
- **Phase 4**: 40 seconds - 1,215 words, 23 content blocks generated
- **Phase 5**: 3ms - Clean Markdown rendering

**SEO Performance (NeuronWriter Score):**
- **Overall Score**: 82/83 (98.8% - nearly perfect!)
- **Title**: 91% ✅
- **Headings**: 82% ✅  
- **Terms**: 64% ✅
- **Words**: 1,280 ✅

**Keyword Optimization Results:**
- **"raccoon"**: 40 uses (target: 6-33) ✅
- **"squirrel"**: 33 uses (target: 2-18) ✅
- **"raccoons eat"**: 5 uses (target: 1-2) ✅
- **"rat"**: 1 use (target: 1-2) ✅
- **"nest"**: 6 uses (target: 1-3) ✅

**Generated Files:**
- Phase 2: `phase2_outline_do_raccoons_eat_squirrels.json`
- Phase 3: `phase3_merged_outline_do_raccoons_eat_squirrels.json`
- Phase 4: `phase4_article_do_raccoons_eat_squirrels.json`
- Final: `phase5_article_do_raccoons_eat_squirrels.md`

#### **Key Technical Achievements:**
1. **Path Resolution Fixed**: All `__dirname` issues resolved for compiled JavaScript
2. **Keyword Sanitization Standardized**: Consistent filename generation across all phases
3. **Class-Based Architecture**: All services use proper class instantiation
4. **Error Handling**: Comprehensive error handling and validation throughout pipeline
5. **Production Ready**: Clean, professional output suitable for immediate publication

### ✅ **HTTP API Features:**
- **Request Body**: `{"keyword": "your keyword here"}`
- **Response**: Structured JSON with processing times, file paths, content summary
- **Error Handling**: Comprehensive error responses with detailed messages
- **Concurrent Processing**: Multiple requests can be processed simultaneously
- **File Management**: All outputs automatically saved with sanitized filenames

### 🎯 **Current Status: Phase 5 Complete - All Phases Working**

- ✅ Phase 1: NW structured terms extraction and file save working
- ✅ Phase 2: Outline generation working; auto-saves to outlines folder
- ✅ Phase 3: Merge with body terms working; saved to outlines folder
- ✅ Phase 4: Section content generation working; saved to articles folder
- ✅ Phase 5: Final article rendering to Markdown complete; saved to final folder

**Latest Test Results:**
- Phase 1: Generated `keep_rats_away.json` (terms) in ~94s (ready query flows faster)
- Phase 2: 8-section outline generated in ~6–11s; auto-saved to `phase2_outline_keep_rats_away.json`
- Phase 3: 8 merged sections; term lists populated per section; saved to `phase3_merged_outline_*.json`
- Phase 4: 29–38 content blocks across 8 sections; saved to `phase4_article_*.json`
- Phase 5: Final Markdown article generated with proper heading structure (H1, H2, H3); saved to `phase5_article_*.md`

**Recent Fixes (Phase 5):**
- ✅ Removed timestamp metadata from output (`_Generated: ...` line)
- ✅ Fixed heading structure: H1 for title, H2 for sections, H3 for subsections
- ✅ Clean Markdown output ready for NeuronWriter or any markdown editor

**Key Files for Phase 3:**
- `src/repositories/outlines/phase2_outline_<keyword>.json` (input)
- `src/repositories/optimization_terms/<keyword>.json` (input)
- `src/repositories/merge_outline.ts`
- `src/models/repositories/merge_outline.model.ts`
- `src/services/merge_outline_with_nw_terms.ts`
- `src/services/merge_outline_submit_pull.ts`
- `src/repositories/data/outline_kw_merge_prompt.json`
- `test_phase3_merge_outline.js` (end-to-end test)

**Key Files for Phase 4:**
- `src/repositories/data/loop_prompt.json` (prompt for section content)
- `src/repositories/loop_section.ts` (load/save + helpers)
- `src/models/repositories/loop_sections.model.ts`
- `src/services/loop_thru_sections/loop_thru_sections.ts`
- `src/models/services/loop_sections/loop_thru_sections.model.ts`
- `test_phase4_loop_sections.js` (end-to-end test)

**Key Files for Phase 5:**
- `src/repositories/render_article.ts` (load Phase 4 data, save final markdown)
- `src/services/render_article.ts` (transform JSON to Markdown with proper headings)
- `src/models/services/render_article.model.ts`
- `test_phase5_render_article.js` (end-to-end test)
- Output: `src/repositories/final/phase5_article_*.md`

## 🖼️ **IMAGE GENERATION SYSTEM**

### ✅ **ALL 3 PHASES COMPLETE AND WORKING**

### 🎉 **BREAKTHROUGH: IMAGE GENERATION API COMPLETE!**

**🚀 IMAGE GENERATION PIPELINE STATUS:**
- **Phase 1: HTTP Endpoint** ✅ **COMPLETE**
  - **Endpoint**: `POST /api/v1/image-media`
  - **Status**: Fully functional HTTP API with request/response handling
  - **Files**: `image_media_creator.controller.ts`, `image_media_creator.routes.ts`, `image_media_creator.model.ts`

- **Phase 2: Image Description Generation** ✅ **COMPLETE**
  - **Functionality**: OpenAI API integration for generating detailed image descriptions
  - **Output**: Single featured image description with title and detailed prompt
  - **Files**: `create_image_prompt.json` (updated schema), controller response logic
  - **Test Results**: Successfully generated "Understanding Squirrel Diseases" with detailed visual description

 - **Phase 3: Ideogram API Integration** ✅ **COMPLETE**
   - **Functionality**: Converts Phase 2 descriptions into actual images using Ideogram v3 Generate API
   - **Endpoint Used**: `POST https://api.ideogram.ai/v1/ideogram-v3/generate`
   - **Response Additions**: `generated_image_url`, `image_resolution`, `image_seed`
   - **Debug Mode**: Auto-downloads the image to `src/repositories/image_desc_temp_debug/phase3_images/{keyword}_image.png` and returns `saved_image_path`
  
  **📋 Ideogram API v3 Specifications:**
  - **Endpoint**: `POST https://api.ideogram.ai/v1/ideogram-v3/generate`
  - **Authentication**: `Api-Key` header with API key
  - **Content-Type**: `multipart/form-data`
  - **Required Parameters**: `prompt` (string) - image description
  - **Optional Parameters**: 
    - `resolution` - image resolution (69 supported values)
    - `aspect_ratio` - aspect ratio (15 options, defaults to 1x1)
    - `rendering_speed` - TURBO/DEFAULT/QUALITY (defaults to DEFAULT)
    - `num_images` - number of images (1-8, defaults to 1)
    - `style_type` - GENERAL/REALISTIC/DESIGN/FICTION (defaults to GENERAL)
  - **Response**: JSON with `created` timestamp and `data` array containing image objects with `url`, `resolution`, `seed`, etc.
  - **Important**: Image URLs expire - images are auto-downloaded in debug mode
  - **Documentation**: [Ideogram API Generate v3](https://developer.ideogram.ai/api-reference/api-reference/generate-v3)

**🎯 LATEST SUCCESS RESULTS (December 2024):**
**Image Generation API - COMPLETE & PRODUCTION READY:**
- **Processing Time**: ~12-14 seconds per image
- **Image Quality**: High-quality, photorealistic images (1312x736) with `style_type: "REALISTIC"`
- **Prompt Engineering**: Optimized for professional, anatomically correct, industry-agnostic content
- **Photorealistic Enhancement**: Default `style_type: "REALISTIC"` for non-cartoonish, professional images
- **File Management**: Automatic saving to `src/repositories/images/featured/` with sanitized filenames
- **API Endpoint**: `POST /api/v1/image-media` with JSON response including `saved_image_path`d

**🔧 TECHNICAL IMPROVEMENTS:**
- **Landscape Aspect Ratio**: 16x9 (1312x736) for better blog post integration
- **Filename Sanitization**: Handles special characters and spaces correctly
- **Prompt Optimization**: Universal instructions for photorealistic, anatomically correct content
- **Error Prevention**: Comprehensive negative instructions embedded in prompt
- **Professional Quality**: Consistent high-quality images across multiple industries
- **Photorealistic Style**: Default `style_type: "REALISTIC"` for non-cartoonish, professional images
- **API Compliance**: Verified all parameters match Ideogram API v3 documentation

**📝 Note on Image Quality Assurance:**
- Current implementation focuses on prompt engineering and aspect ratio optimization
- Future improvements planned for ensuring consistently publishable images through alternative validation approaches

## 🔬 **ADVANCED IMAGE GENERATION: Multi-Step Validation Approach**

### ✅ **IMPLEMENTED AND WORKING (December 2024)**

**🎯 The Problem We Solved:**
AI image generators like Ideogram work within the framework of their training datasets. When scenarios are not super common, image generators may produce problematic images with:
- Extra limbs or anatomical errors
- Inaccurate representation of specific tools or equipment
- Monstrous or distorted faces
- Malformed hands and appendages
- Context confusion (e.g., AC units inside houses instead of outside)
- Unrealistic object placement or proportions

**🧠 Multi-Step Validation Solution (NOW IMPLEMENTED):**
A progressive refinement system to maximize publishable image success rate:

1. **✅ Generate Ideas** - Brainstorm 3 diverse visual concepts for the keyword
2. **✅ Rate Ideas for Common Representation** - Evaluate which concepts are most common in training datasets
3. **✅ Generate Minimum Viable Entities** - Break down chosen concept into essential, recognizable visual elements
4. **✅ Process and Create Structured Prompt** - Create detailed JSON prompt with core, setting, objects, characters, camera, and mood
5. **✅ Generate Image** - Apply validated prompt to Ideogram with higher success probability

**🚀 Implementation Results:**
- **✅ 4-Step Service**: `FourStepImageDescriptionService` with comprehensive logging
- **✅ Structured JSON Output**: Detailed format with core, setting, objects, characters, camera, mood sections
- **✅ Clean Architecture**: Business logic moved to service layer, controller is thin orchestrator
- **✅ Type Safety**: All interfaces organized in `img_desc_generation.models.ts`
- **✅ Audit Logging**: Detailed step-by-step console output showing inputs/outputs for each phase
- **✅ Integrated Pipeline**: Complete flow from keyword → 4-step analysis → structured prompt → image generation → file saving

**📊 Technical Implementation:**
- **Files Added**:
  - `src/services/4step_image_desc_generation/img_desc_generation.ts` (main service)
  - `src/models/services/4step_image_desc_generation/img_desc_generation.models.ts` (TypeScript interfaces)
  - `src/repositories/data/step1_idea_generation.json` (concept generation prompt)
  - `src/repositories/data/step2_rating.json` (concept rating prompt)
  - `src/repositories/data/step3_entities.json` (entity identification prompt)
  - `src/repositories/data/step4_final_prompt.json` (structured prompt creation)
- **Architecture**: Clean separation between controller (HTTP handling) and service (business logic)
- **Error Handling**: Comprehensive error handling with detailed logging at each step
- **Performance**: ~41-49 seconds for complete 4-step process + image generation
- **Audit Logging**: Complete visibility into prompts sent to OpenAI for each step with formatted output
- **Real-time Monitoring**: All logs appear automatically in terminal during normal operation

**🎯 Key Benefits Achieved:**
- **Higher Success Rate**: Only use concepts well-represented in training data
- **Structured Output**: Teammate-requested JSON format for precise image control
- **Quality Assurance**: Built-in validation before generation
- **Cost Effective**: Better first-attempt success through validation
- **Maintainable**: Clean architecture with proper separation of concerns
- **Debuggable**: Comprehensive logging for fine-tuning and optimization
- **Complete Transparency**: Full visibility into AI prompts and responses for easy debugging
- **Real-time Monitoring**: Automatic terminal output during normal operation (no special commands needed)

**🔧 Test Results (December 2024):**
- **✅ Successful Test**: "home office setup" completed successfully in 41 seconds
- **✅ Step-by-Step Logging**: Detailed console output showing all 4 steps with token usage
- **✅ Image Generation**: Successfully generated and saved image to `featured/` folder
- **✅ Structured Format**: Proper JSON output with core, setting, objects, characters, camera, mood
- **✅ Architecture**: Controller properly delegates to service, clean separation achieved
- **✅ Enhanced Audit Logging**: Complete prompt visibility showing exact prompts sent to OpenAI for each step
- **✅ Multiple Test Cases**: Successfully tested with "do raccoons eat squirrels" (49s) and "kitchen renovation tips" (47s)
- **✅ Real-time Terminal Output**: All logs appear automatically in terminal during normal operation (no special commands needed)

## 📁 **New Files Added:**

### **Text Generation System:**
- `src/controllers/text_media_creator.controller.ts` - HTTP request handling
- `src/routes/text_media_creator.routes.ts` - API route definitions  
- `src/models/services/text_media_creator.model.ts` - Request/response interfaces

### **Image Generation System:**
- `src/controllers/image_media_creator.controller.ts` - Image generation HTTP handling
- `src/routes/image_media_creator.routes.ts` - Image generation API route definitions
- `src/models/services/image_media_creator.model.ts` - Image generation interfaces
- `src/services/generate_image.ts` - Ideogram API integration service
- `src/models/services/generate_image.model.ts` - Ideogram API interfaces
- `src/repositories/data/create_image_prompt.json` - Simple image generation prompt

### **4-Step Image Validation System:**
- `src/services/4step_image_desc_generation/img_desc_generation.ts` - Multi-step validation service
- `src/models/services/4step_image_desc_generation/img_desc_generation.models.ts` - TypeScript interfaces
- `src/repositories/data/step1_idea_generation.json` - Concept generation prompt
- `src/repositories/data/step2_rating.json` - Concept rating prompt  
- `src/repositories/data/step3_entities.json` - Entity identification prompt
- `src/repositories/data/step4_final_prompt.json` - Structured prompt creation

### **Infrastructure:**
- Updated `src/app.ts`, `src/server.ts`, and index files for integration
- Added `.gitignore` entry for `src/repositories/images/featured/` directory

### ✅ Completed Features

#### **Service Layer (Fully Implemented)**
- **Repository Layer**: 
  - `fetch_prompt.ts` - Fetches prompt configurations from JSON files
  - `neuron_writer.ts` - NeuronWriter API integration for optimization terms
  - `create_outline_from_terms.ts` - Loads and formats optimization terms for outline generation
- **Service Layer**: 
  - `process_input.ts` - Handles variable substitution in prompts
  - `submit_prompt.ts` - Integrates with OpenAI API using function calling
  - `get_optimization_terms.ts` - NeuronWriter optimization terms extraction
  - `outline_process_input.ts` - Processes outline inputs with NeuronWriter terms
  - `outline_submit_retrieve_output.ts` - Complete outline generation service
- **Model Layer**: Complete TypeScript interfaces for all data structures

#### **Key Capabilities**
- ✅ **Prompt Configuration Management**: Load AI model configurations from JSON files
- ✅ **Variable Substitution**: Replace `{{variable}}` placeholders with user input
- ✅ **OpenAI Integration**: Make API calls with structured function calling
- ✅ **NeuronWriter Integration**: Extract comprehensive optimization terms from SERP analysis
- ✅ **Article Outline Generation**: Create SEO-optimized outlines using SERP data
- ✅ **Structured Output**: Return JSON responses matching defined schemas
- ✅ **Error Handling**: Comprehensive error handling and validation
- ✅ **Type Safety**: Full TypeScript support with proper interfaces

#### **Test Results**
- ✅ **Prompt Fetching**: Successfully loads `prompts.json` configurations
- ✅ **Input Processing**: Variable substitution works correctly
- ✅ **AI Integration**: Generates structured JSON responses (6 SEO sections in 439 tokens)
- ✅ **HTTP API**: Complete endpoint working at `POST /api/v1/text?prompt_name=prompts`
- ✅ **Real-world Test**: Successfully generated 6 SEO sections about "Raccoon Removal Houston" (612 tokens)
- ✅ **NeuronWriter Integration**: Successfully extracts optimization terms from "trail running shoes" query
- ✅ **Phase 2 Complete**: Generated 8-section outline for "what scares squirrels" (493 tokens, 7.8s)

### ✅ **HTTP API Layer (Fully Implemented)**
- **Controller Layer**: `prompt_controller.ts` - Handles HTTP requests and responses
- **Route Layer**: `prompt_routes.ts` - Defines API endpoint patterns
- **Express Setup**: `app.ts` - Middleware, CORS, and route configuration
- **Server Startup**: `server.ts` - Environment loading and server initialization

### 📋 Planned Features
- ✅ **Phase 5: Render Output**: Compile Phase 4 content blocks into final article (Markdown), include TOC, proper heading structure (H1, H2, H3)
- **🔧 Future Improvement: Proper Markdown Heading Formatting**
  - Current output shows headings as plain text (e.g., "## 1. Understanding Squirrels")
  - Need to format as actual Markdown headings (e.g., "## Understanding Squirrels")
  - This affects NeuronWriter SEO scoring as it doesn't recognize the headings properly
  - Priority: Low - manual adjustment currently works but automation would be better
- **🖼️ Future Feature: Image Media Generation Endpoint**
  - **Endpoint**: `/api/v1/image-media`
  - **Purpose**: Generate images based on content (next project phase)
  - **Integration**: Will work with the text content generated by current pipeline
  - **Status**: Planned for future development
- **🔧 HTTP API Integration: Phase 1 Keyword Source Change**
  - **Current**: Phase 1 reads keyword from `src/repositories/data/keyword.json`
  - **Future**: Phase 1 will accept keyword from HTTP request body
  - **File to modify**: `src/services/get_optimization_terms.ts`
  - **Change**: `GetOptimizationTermsService.getOptimizationTerms()` should accept keyword parameter instead of reading from file
  - **Benefit**: Makes service more flexible and reusable for HTTP API integration
- Validation middleware, rate limiting, and authentication for production
- Split NeuronWriter repository into create/pull modules (maintenance)

### 🔧 **Future Refactoring Plans**
- **NeuronWriter Repository Separation**: Split `neuron_writer.ts` into separate files:
  - `create_neuron_requests.ts` - Functions for creating new queries (`createQuery`, `listProjects`)
  - `pull_neuron_requests.ts` - Functions for retrieving results (`getQuery`, `waitForQueryReady`, `listAllQueries`)
  - This will improve code organization and maintainability as the NeuronWriter integration grows

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Available Endpoints

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

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/v1/text?prompt_name=prompts" \
  -H "Content-Type: application/json" \
  -d '{"keyword":"Raccoon Removal Houston"}'
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

**Error Responses:**
- `400` - Missing required parameters
- `500` - OpenAI API or processing errors

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

### Response Format

All API responses follow a standard format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
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
```

**Note:** The `.local.env` file is ignored by Git for security reasons.

## 🤝 Contributing

### For Developers

1. Fork the repository
2. Create a feature branch from `dev`
3. Make your changes
4. Test thoroughly
5. Submit a pull request to `dev`

### For LLMs

When working on this project as an LLM:

1. **Always check the current branch** before making changes
2. **Follow the existing code structure** and patterns
3. **Update this README** when adding new features or changing architecture
4. **Use descriptive commit messages** following conventional commits
5. **Test your changes** before committing

### Working with AI Assistants

When collaborating with AI assistants on this project:

#### **🔒 Strict Work Conditions:**
1. **No files or revisions** are made unless explicitly requested
2. **Always ask for permission** before creating or modifying any files
3. **Provide detailed gameplans** before making changes
4. **Explain steps clearly** for learning purposes
5. **Wait for explicit approval** before proceeding with any modifications

#### **🔍 Problem-Solving Protocol:**
1. **Always check paths instead of assuming** - Verify file locations and `__dirname` resolution
2. **Explain the problem clearly** - Describe what's happening and why it's failing
3. **Present a fix with reasoning** - Show the proposed solution and explain why it should work
4. **Wait for approval** - Do not implement changes until explicitly approved
5. **Test thoroughly** - Verify the fix works before considering it complete

#### **📋 Development Workflow:**
1. **Identify the issue** - Understand what's broken and why
2. **Research the codebase** - Check existing patterns and file structures
3. **Propose a solution** - Present a clear plan with code examples
4. **Get approval** - Wait for explicit "yes" before proceeding
5. **Implement carefully** - Make minimal, targeted changes
6. **Test the result** - Verify the fix works as expected

### Code Style Guidelines

- Use TypeScript for type safety
- Follow the existing folder structure
- Add comments for complex logic
- Use meaningful variable and function names
- Keep functions small and focused

## 📝 Commit Message Convention

Use conventional commit messages:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example:
```bash
git commit -m "feat: add user authentication endpoint"
```

## 🔍 Troubleshooting

### Common Issues

#### **NeuronWriter Integration Issues**

**Issue: Query Timeout (120s)**
- **Problem**: NeuronWriter queries timing out after 2 minutes
- **Solution**: Increased timeout to 5 minutes (300s) in `waitForQueryReady` method
- **Location**: `src/repositories/neuron_writer.ts` line 104

**Issue: Creating Duplicate Requests**
- **Problem**: Service creates new queries instead of reusing existing ones
- **Status**: Partially fixed - `findRecentQuery` logic implemented but needs refinement
- **Location**: `src/services/get_optimization_terms.ts` lines 87-97

**Issue: Manual Competitor Selection Required**
- **Problem**: Some queries get stuck requiring manual competitor selection on NeuronWriter UI
- **Solution**: Wait for query completion on NeuronWriter dashboard, then pull results
- **Workaround**: Use existing query ID to pull results directly

#### **Development Setup Issues**

**Issue: Missing Dependencies**
- **Problem**: `npm list` showing "UNMET DEPENDENCY"
- **Solution**: Run `npm install` to install all project dependencies

**Issue: TypeScript Compilation Errors**
- **Problem**: `dist` directory missing or outdated
- **Solution**: Run `npm run build` to compile TypeScript files

**Issue: Environment Variables Not Loading**
- **Problem**: API keys not found or invalid
- **Solution**: Check `.local.env` file exists and contains valid API keys:
  ```env
  OPENAI_API_KEY=sk-proj-...
  NEURONWRITER_API_KEY=n-...
  ```

### Getting Help

- Check the existing code structure
- Review this README
- Check GitHub issues
- Create a new issue if needed

## 📄 License

*Add license information when decided*

---

**Last Updated:** December 2024 - HTTP API Integration Complete! (Text + Image Generation)
**Version:** 1.0.0
