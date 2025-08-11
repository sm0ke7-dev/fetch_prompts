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
├── tsconfig.json              # TypeScript configuration
├── test_services.js           # Service layer test script
├── test_optimization_terms.js # Optimization terms test script
├── src/
│   ├── app.ts                 # Express application setup with middleware
│   ├── server.ts              # Server startup and configuration
│   ├── controllers/           # HTTP request handlers
│   │   ├── index.ts           # Controller exports (exports promptController)
│   │   └── prompt_controller.ts # Prompt HTTP request handling
│   ├── models/                # Data models and interfaces
│   │   ├── index.ts           # Model exports (exports all models)
│   │   ├── fetch_prompts_model.ts # Prompt configuration interfaces
│   │   └── services/          # Service-specific models
│   │       ├── process_input.model.ts # Input processing interfaces
│   │       ├── submit_prompt.model.ts # OpenAI API interfaces
│   │       └── get_optimization_terms.model.ts # NeuronWriter API interfaces
│   ├── repositories/          # Data access layer
│   │   ├── data/
│   │   │   └── prompts.json   # AI prompt configuration data
│   │   ├── fetch_prompt.ts    # Prompt fetching functionality
│   │   ├── neuron_writer.ts   # NeuronWriter API integration
│   │   └── optimization_terms/ # Optimization terms JSON data storage
│   ├── routes/                # API route definitions
│   │   ├── index.ts           # Route exports (exports promptRoutes)
│   │   └── prompt_routes.ts   # API endpoint definitions
│   └── services/              # Business logic layer
│       ├── index.ts           # Service exports (exports all services)
│       ├── process_input.ts   # Input processing and variable substitution
│       ├── submit_prompt.ts   # OpenAI API integration
│       └── get_optimization_terms.ts # NeuronWriter optimization terms service
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

### ✅ **Phase 1: Get Optimization Terms (COMPLETED)**
- **NeuronWriter API Integration**: Full connection and authentication working
- **Query Management**: Create, fetch, and wait for queries with async processing
- **Structured Output Implementation**: Clean JSON schema for Phase 2 consumption
- **Credit Management**: Logic to reuse existing queries (partial implementation)
- **Data Structure Understanding**: Correctly mapped all API response fields

#### **Latest Test Results** (August 2025):
Successfully extracted structured data from "what scares squirrels" query:
- **Header Terms**: H1 (14), H2 (24), H3 (0)
- **Body Terms**: Basic (16), Extended (72) 
- **Entities**: 52 entities with Wikipedia links and confidence scores
- **Questions**: 23 suggested + 4 PAA + 35 content = 62 total
- **Output Format**: Clean JSON saved to `src/repositories/optimization_terms/what_scares_squirrels.json`

#### **Key Learnings from Phase 1:**
1. **Timeout Issues**: NeuronWriter queries can take 2-5 minutes, increased timeout from 2min to 5min
2. **Structured Output**: Raw NeuronWriter response needs parsing into consistent JSON schema
3. **Credit Conservation**: Need to check for existing queries before creating new ones
4. **Manual Intervention**: Some queries may require manual competitor selection on NeuronWriter UI
5. **Data Richness**: NeuronWriter provides extensive data including usage percentages and suggested ranges

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

### 🎯 **Current Status: Phase 2 Complete - Ready for Phase 3**

**Where We Are Now (August 2025):**
- ✅ **Phase 1 Complete**: Structured optimization terms extraction working
- ✅ **Phase 2 Complete**: Article outline generation from NeuronWriter terms working
- ✅ **End-to-End Flow**: Keyword → SERP analysis → SEO-optimized outline
- ✅ **OpenAI Integration**: Custom prompts with structured function calling
- 🔄 **Credit Management**: Partial implementation (reuses existing queries but needs refinement)
- 🎯 **Next Step**: Phase 3 - Flesh out outline with detailed content structure

**Phase 2 Test Results (August 2025):**
Successfully generated 8-section article outline for "what scares squirrels":
- **Processing Time**: 7.8 seconds
- **Token Usage**: 493 tokens (216 prompt + 277 completion)
- **Output Quality**: SEO-optimized sections using high-ranking SERP terms
- **Integration**: Perfect data flow from Phase 1 → Phase 2

**Key Files for Phase 3:**
- `src/repositories/optimization_terms/what_scares_squirrels.json` - Structured NeuronWriter data
- `src/services/outline_submit_retrieve_output.ts` - Complete outline generation service
- `src/repositories/data/outline_creation_prompt.json` - Custom OpenAI prompt template

### 📋 Planned Features
- **Phase 3: Flesh out Outline** ⬅️ **NEXT**: Merge body terms and create detailed content structure
- **Phase 4: Loop through sections**: Generate content for each outline section
- **Phase 5: Render output**: Compile final article with structured content
- **Multiple Prompt Support**: Add more prompt configurations to `/data/` folder
- **Validation Middleware**: Enhanced request validation and sanitization
- **Rate Limiting**: API usage limits and monitoring
- **Authentication**: API key management for production use

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

- **No files or revisions** are made unless explicitly requested
- **Always ask for permission** before creating or modifying any files
- **Provide detailed gameplans** before making changes
- **Explain steps clearly** for learning purposes
- **Wait for explicit approval** before proceeding with any modifications

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

**Last Updated:** [Current Date]
**Version:** 1.0.0
