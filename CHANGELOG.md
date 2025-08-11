# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-08-11

### Added
- **MCP Initialization Config**: Dynamic configuration handling from MCP client info during initialization, enabling runtime flexibility (#12)
- **Docker Deployment Support**: Added Dockerfile and Smithery configuration for cloud deployment (#6)
- **Smithery Integration**: Users can now install and use the server via Smithery without local dependencies

### Changed
- **Configuration Prioritization**: MCP init config now takes precedence over environment variables and other sources
- Updated smithery.yaml configuration for improved deployment

### Fixed
- Improved configuration loader with better precedence handling
- Enhanced boolean parsing in configuration valuesUpdate
- Fixed issues with Smithery MCP server Lokalise API Key token issue [#7](https://github.com/AbdallahAHO/lokalise-mcp/issues/7)

## [1.0.2] - 2025-01-17

### Changed
- **Logger Optimization**: Deferred logger initialization and file setup for better performance
- Improved logger lifecycle management to prevent early file system access

### Fixed
- Resolved logger initialization timing issues
- Fixed potential race conditions in logger setup

## [1.0.1] - 2025-01-16

### Added
- **Pre-commit Hooks**: Automated formatting and linting checks before commits
- **Automated Release Workflow**: Streamlined release process with GitHub Actions
- **CI Enhancements**: Extended CI workflow to run on all main branch pushes

### Changed
- Updated DXT command configuration
- Improved CI/CD pipeline with environment variable support for signing certificates
- Enhanced release workflow permissions for GitHub Actions

### Fixed
- GitHub CLI integration for PR creation to resolve permissions issues
- Release workflow GitHub Actions permissions handling
- Added missing CHANGELOG.md for automated releases
- Removed redundant source file ignores from configuration

### Removed
- Signature verification requirement from DXT command

## [1.0.0] - 2025-01-16

### Added
- **Initial Release** of Lokalise MCP Server
- **39 MCP Tools** across 7 comprehensive domains:
  - **Projects** (6 tools): List, get, create, update, delete, and empty projects
  - **Languages** (6 tools): System languages, project languages management
  - **Keys** (7 tools): Complete key management with bulk operations
  - **Tasks** (5 tools): Translation task management
  - **Comments** (5 tools): Key and project comment handling
  - **Translations** (4 tools): Translation content management with cursor pagination
  - **Contributors** (6 tools): Team member and permission management
- **16 MCP Resources** for efficient data access patterns
- **Auto-Discovery Architecture**: Automatic domain registration without manual imports
- **Dual Transport Support**: Both HTTP (default) and STDIO transports
- **CLI Mode**: Direct command execution for scripting and automation
- **Domain Scaffolding**: Interactive wizard for rapid domain generation
- **Enterprise Features**:
  - Comprehensive error handling with custom McpError class
  - Contextualized logging with session tracking
  - Multi-source configuration management (ENV > .env > global config)
  - Zod schema validation for all inputs
  - Rate limiting and pagination support
- **Developer Experience**:
  - TypeScript with strict mode
  - Biome for consistent formatting and linting
  - Jest testing framework with >80% coverage target
  - Comprehensive API documentation
  - .npmignore for clean package distribution

### Technical Details
- Built with @modelcontextprotocol/sdk for MCP compliance
- Official @lokalise/node-api client integration
- Express server for HTTP transport with Server-Sent Events
- Commander.js for CLI framework
- ES modules with Node.js >=18.0.0 requirement

[1.0.3]: https://github.com/AbdallahAHO/lokalise-mcp/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/AbdallahAHO/lokalise-mcp/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/AbdallahAHO/lokalise-mcp/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/AbdallahAHO/lokalise-mcp/releases/tag/v1.0.0