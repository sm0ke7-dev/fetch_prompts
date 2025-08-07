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

This project provides a RESTful API for managing and retrieving prompts. It follows a clean architecture pattern with separate layers for controllers, services, repositories, and models.

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Architecture:** MVC Pattern with Repository Layer
- **Data Storage:** JSON files (can be extended to database)
- **Version Control:** Git with GitHub

## 📁 Project Structure

```
fetch_prompt/
├── .gitignore                 # Git ignore rules
├── .local.env                 # Local environment variables (not tracked)
├── package.json               # Project dependencies and scripts
├── src/
│   ├── app.ts                 # Main application setup (empty)
│   ├── server.ts              # Server configuration (empty)
│   ├── controllers/           # Request handlers
│   │   └── index.ts           # Controller exports (empty)
│   ├── models/                # Data models and interfaces
│   │   ├── index.ts           # Model exports (exports fetch_prompts_model)
│   │   └── fetch_prompts_model.ts # Prompt configuration interfaces
│   ├── repositories/          # Data access layer
│   │   ├── data/
│   │   │   └── prompts.json   # AI prompt configuration data
│   │   └── fetch_prompt.ts    # Prompt fetching functionality
│   ├── routes/                # API route definitions
│   │   └── index.ts           # Route exports (empty)
│   └── services/              # Business logic layer
│       └── index.ts           # Service exports (empty)
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

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

*Documentation will be added as endpoints are implemented*

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

# Add other environment variables as needed
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

*Add common issues and solutions as they arise*

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
