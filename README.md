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
- **AI Integration:** OpenAI API with structured function calling
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

**Latest Test Results (December 2024):**
- **Total Processing Time**: 62 seconds
- **SEO Performance**: 82/83 (98.8% - nearly perfect!)
- **Content Quality**: 1,215 words, 23 content blocks generated
- **File Output**: Complete Markdown article with proper heading structure

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
```

**Note:** The `.local.env` file is ignored by Git for security reasons.

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

---

**Last Updated:** December 2024 - HTTP API Integration Complete! (Text + Image Generation + Quality Assessment)
**Version:** 1.0.0
