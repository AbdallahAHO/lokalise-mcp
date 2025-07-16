# Contributing to Lokalise MCP Server

Thank you for your interest in contributing to the Lokalise MCP Server! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Architecture Overview](#architecture-overview)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Domain Development](#domain-development)
- [Submitting Changes](#submitting-changes)

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or pnpm
- A Lokalise account and API token (for testing)
- Git

### Initial Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/lokalise-mcp.git
   cd lokalise-mcp
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up your environment:
   ```bash
   cp .env.example .env
   # Edit .env with your Lokalise API token
   ```

5. Build the project:
   ```bash
   npm run build
   ```

## Development Setup

### Environment Configuration

The project uses multi-source configuration with this priority:
1. Environment variables
2. `.env` file
3. Global config (`~/.mcp/configs.json`)

Required environment variables:
- `LOKALISE_API_KEY`: Your Lokalise API token
- `LOKALISE_API_HOSTNAME`: (Optional) Custom API endpoint
- `TRANSPORT_MODE`: 'http' or 'stdio' (default: 'http')
- `DEBUG`: Enable debug logging (optional)

### Running the Server

```bash
# HTTP transport (default)
npm run mcp:http

# STDIO transport
npm run mcp:stdio

# Development with MCP Inspector
npm run mcp:inspect

# CLI mode
npm run cli -- --help
```

## Architecture Overview

### Domain-Driven Design

The project follows a domain-driven architecture with automatic discovery:

```
src/
├── domains/                    # Business domains
│   ├── {domain}/              # Each domain module
│   │   ├── index.ts           # Barrel exports
│   │   ├── {domain}.cli.ts    # CLI commands
│   │   ├── {domain}.tool.ts   # MCP tools
│   │   ├── {domain}.resource.ts # MCP resources
│   │   ├── {domain}.controller.ts # Business logic
│   │   ├── {domain}.service.ts # API integration
│   │   ├── {domain}.formatter.ts # Response formatting
│   │   └── {domain}.types.ts  # Type definitions
│   ├── index.ts               # Master registry
│   └── registry.ts            # Auto-discovery system
└── shared/                    # Cross-cutting concerns
    ├── types/                 # Shared types
    └── utils/                 # Shared utilities
```

### Data Flow

1. **Tool/Resource/CLI** → Receives request, validates with Zod
2. **Controller** → Orchestrates business logic, applies defaults
3. **Service** → Calls Lokalise API with error handling
4. **Formatter** → Shapes response for user presentation
5. **Tool/Resource/CLI** → Returns formatted response

### Key Patterns

- **Auto-Discovery**: Domains are automatically discovered and registered
- **Interface Contracts**: All domains implement `DomainTool`, `DomainCli`, and `DomainResource`
- **Error Handling**: Custom `McpError` class with context
- **Logging**: Contextualized logging with `Logger.forContext()`
- **Validation**: Zod schemas for all inputs

## Development Workflow

### Code Quality Standards

We use Biome for linting and formatting:

```bash
# Format code
npm run format

# Lint code
npm run lint

# Run both
npm run format && npm run lint
```

**Automated CI Checks**: All pull requests automatically run:
- 🎨 **Code formatting** - Must pass Biome formatting
- 🔍 **Linting** - Must pass Biome linting rules
- 🔨 **Build** - Must compile without TypeScript errors
- 🧪 **Tests** - Must pass on Node.js 18, 20, and 22

The CI provides helpful feedback if any checks fail. Fix issues locally before pushing.

Configuration:
- Tab indentation
- Double quotes for strings
- Trailing commas
- No semicolons in TypeScript interfaces

### TypeScript Standards

- Strict mode enabled
- No `any` types (use `unknown` or specific types)
- Explicit return types for public functions
- Comprehensive JSDoc comments
- Proper error typing

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.ts
```

Test requirements:
- Unit tests for all utilities
- Controller tests with mocked services
- Integration tests for critical paths
- Target coverage: >80%

## Domain Development

### Creating a New Domain

The easiest way to create a new domain is using our scaffolding tool.

#### Interactive Mode (for humans)

```bash
npm run scaffold:domain
```

This interactive wizard will:
1. Prompt for domain configuration
2. Generate all required files  
3. Register the domain automatically
4. Apply formatting automatically

#### CLI Mode (for AI agents - REQUIRED)

**For AI Agents**: ALWAYS use the CLI mode to save 99% of tokens:

```bash
npm run scaffold:domain:cli -- \
  -n glossary \
  -d "Glossary terms management for consistent translations" \
  -a glossaryTerms \
  -t list,get,create,update,delete \
  -r collection,detail \
  -c list,get,create
```

**CLI Options:**
- `-n, --name <name>`: Domain name (lowercase, no spaces)
- `-d, --description <description>`: Domain description
- `-a, --api-endpoint <endpoint>`: API endpoint (default: /<name>)
- `-t, --tools <tools>`: Comma-separated operations: list,get,create,update,delete,bulkUpdate,bulkDelete
- `-r, --resources <resources>`: Comma-separated resource types: collection,detail
- `-c, --cli <commands>`: Comma-separated CLI commands (subset of tools)
- `-q, --quiet`: Quiet mode (only outputs domain name on success)

**Token Efficiency:**
- Manual creation: ~2,500+ lines = ~10,000+ tokens
- CLI scaffolding: 1 command = ~100 tokens
- **Savings: 99% token reduction**

### Generated File Structure

The scaffolding creates:
- `{domain}/index.ts` - Barrel exports for auto-discovery
- `{domain}/{domain}.types.ts` - Zod schemas and type definitions
- `{domain}/{domain}.service.ts` - Lokalise API integration (uses shared `getLokaliseApi`)
- `{domain}/{domain}.controller.ts` - Business logic orchestration
- `{domain}/{domain}.formatter.ts` - Markdown response formatting
- `{domain}/{domain}.tool.ts` - MCP tool definitions
- `{domain}/{domain}.cli.ts` - CLI command definitions  
- `{domain}/{domain}.resource.ts` - MCP resource definitions

### Post-Scaffolding Steps

After scaffolding, you MUST:
1. Review generated files and fix any REPLACE_ME placeholders
2. Update service layer with actual Lokalise SDK methods
3. Run quality checks:
   ```bash
   npm run format
   npm run lint
   npm run build
   ```
4. Fix any TypeScript or linting errors
5. Test the implementation
6. Only mark task complete when ALL checks pass

### Manual Domain Creation

If you need to create a domain manually:

1. Create directory: `src/domains/newdomain/`
2. Implement required files:
   - `newdomain.tool.ts` - MCP tools (implements `DomainTool`)
   - `newdomain.cli.ts` - CLI commands (implements `DomainCli`)
   - `newdomain.resource.ts` - MCP resources (implements `DomainResource`)
   - `newdomain.controller.ts` - Business logic
   - `newdomain.service.ts` - API integration
   - `newdomain.formatter.ts` - Response formatting
   - `newdomain.types.ts` - Type definitions
   - `index.ts` - Barrel exports

3. Export from barrel file:
   ```typescript
   export { default as newdomainTool } from "./newdomain.tool.js";
   export { default as newdomainCli } from "./newdomain.cli.js";
   export { default as newdomainResource } from "./newdomain.resource.js";
   ```

The domain will be automatically discovered and registered!

### Domain Interface Requirements

#### DomainTool Interface
```typescript
interface DomainTool {
  registerTools(server: McpServer): void;
  getMeta?(): DomainMeta;
}
```

#### DomainCli Interface
```typescript
interface DomainCli {
  register(program: Command): void;
  getMeta?(): DomainMeta;
}
```

#### DomainResource Interface
```typescript
interface DomainResource {
  registerResources(server: McpServer): void;
  getMeta?(): DomainMeta;
}
```

## Submitting Changes

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Pull Request Process

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our standards

3. Run quality checks:
   ```bash
   npm run format
   npm run lint
   npm run build
   npm test
   ```

4. Commit with conventional commits:
   ```bash
   git commit -m "feat(domain): add new functionality"
   ```

   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

5. Push and create a pull request

### PR Requirements

- Clear description of changes
- All tests passing
- No linting errors
- Documentation updated if needed
- Follows existing patterns

### Code Review

All submissions require code review. We look for:
- Correctness and completeness
- Test coverage
- Documentation
- Performance considerations
- Security implications

## Getting Help

- **Issues**: Use GitHub issues for bugs and features
- **Discussions**: Use GitHub discussions for questions
- **Documentation**: Check the README and this guide
- **Examples**: See existing domains for patterns

## Security

- Never commit API keys or sensitive data
- Use environment variables for configuration
- Follow secure coding practices
- Report security issues privately

Thank you for contributing to make Lokalise MCP Server better for everyone!